"""Develop photos from JSON recipes, like a tiny scripted Lightroom.

python -I scripts/photo-edit.py <recipes.json> <originals dir> <out dir> [name ...]

The file is a list of recipes, or {"presets": {...}, "photos": [...]} where a
photo's "preset" supplies defaults it can override. Each recipe names a source
and runs: object removal, straighten, crop, global adjustments, each mask with
its own local adjustments, vignette, then sharpening. Output is sRGB JPEG with no
metadata, at most `size` pixels on the long edge.
"""

import json
import os
import sys

import cv2
import numpy as np
import pillow_heif
from PIL import Image, ImageOps

pillow_heif.register_heif_opener()

WORK_EDGE = 3200
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)


def to_linear(c):
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def to_srgb(c):
    c = np.clip(c, 0, None)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


def luma(rgb):
    return rgb @ LUMA


def guided(guide, src, radius, eps=1e-3):
    k = (2 * radius + 1, 2 * radius + 1)
    mean = lambda x: cv2.boxFilter(x, -1, k, borderType=cv2.BORDER_REFLECT)
    mg, ms = mean(guide), mean(src)
    a = (mean(guide * src) - mg * ms) / (mean(guide * guide) - mg * mg + eps)
    b = ms - a * mg
    return mean(a) * guide + mean(b)


def smoothstep(e0, e1, x):
    t = np.clip((x - e0) / (e1 - e0 + 1e-9), 0, 1)
    return t * t * (3 - 2 * t)


def white_balance(lin, temp, tint):
    gains = np.array(
        [1 + 0.1 * temp - 0.03 * tint, 1 + 0.06 * tint, 1 - 0.12 * temp - 0.03 * tint],
        dtype=np.float32,
    )
    return lin * gains


def tone(rgb, p, h):
    """Highlights, shadows, whites, blacks, contrast, clarity on sRGB values."""
    y = luma(rgb)
    radius = max(4, h // 60)
    base = np.clip(guided(y, y, radius, 4e-3), 0, 1)
    gain = np.ones_like(y)
    if p.get("shadows"):
        gain += p["shadows"] * 0.9 * (1 - smoothstep(0.0, 0.55, base)) ** 2
    if p.get("highlights"):
        gain += p["highlights"] * 0.45 * smoothstep(0.45, 1.0, base) ** 2
    rgb = rgb * gain[..., None]
    if p.get("clarity"):
        y = luma(rgb)
        detail = y - guided(y, y, max(6, h // 40), 1e-2)
        mid = 1 - np.abs(np.clip(y, 0, 1) * 2 - 1) ** 2
        rgb = rgb + (p["clarity"] * 1.2 * detail * mid)[..., None]
    blacks, whites = p.get("blacks", 0), p.get("whites", 0)
    if blacks or whites:
        lo, hi = -0.12 * blacks, 1 - 0.12 * whites
        rgb = (rgb - lo) / (hi - lo)
    if p.get("contrast"):
        c = p["contrast"]
        pivot = p.get("pivot", 0.45)
        x = np.clip(rgb, 0, 1)
        s = np.where(
            x < pivot,
            pivot * (x / pivot) ** (1 + c),
            1 - (1 - pivot) * ((1 - x) / (1 - pivot)) ** (1 + c),
        )
        rgb = np.where((rgb >= 0) & (rgb <= 1), s, rgb)
    if p.get("fade"):
        rgb = rgb * (1 - p["fade"]) + p["fade"] * 0.5 * (rgb + 0.12)
    return rgb


def colour(rgb, p):
    y = luma(rgb)[..., None]
    chroma = rgb - y
    if p.get("vibrance"):
        sat = np.max(np.abs(chroma), axis=-1, keepdims=True)
        chroma = chroma * (1 + p["vibrance"] * (1 - smoothstep(0, 0.35, sat)))
    if p.get("saturation"):
        chroma = chroma * (1 + p["saturation"])
    rgb = y + chroma
    hsl = p.get("hsl")
    if hsl:
        hls = cv2.cvtColor(np.clip(rgb, 0, 1).astype(np.float32), cv2.COLOR_RGB2HLS)
        hue, light, sat = hls[..., 0], hls[..., 1], hls[..., 2]
        centres = {"red": 0, "orange": 30, "yellow": 55, "green": 115, "aqua": 180, "blue": 220, "purple": 275, "magenta": 320}
        for name, adj in hsl.items():
            d = np.abs(((hue - centres[name]) + 180) % 360 - 180)
            w = (1 - smoothstep(10, 40, d)) * smoothstep(0.03, 0.15, sat)
            hue = (hue + adj.get("h", 0) * w) % 360
            sat = np.clip(sat * (1 + adj.get("s", 0) * w), 0, 1)
            light = np.clip(light + adj.get("l", 0) * 0.25 * w * sat, 0, 1)
        rgb = cv2.cvtColor(np.dstack([hue, light, sat]).astype(np.float32), cv2.COLOR_HLS2RGB)
    if p.get("split"):
        sh, hi = p["split"].get("shadows"), p["split"].get("highlights")
        y = np.clip(luma(rgb), 0, 1)[..., None]
        if sh:
            rgb = rgb + np.array(sh, dtype=np.float32) * 0.08 * (1 - y) ** 2
        if hi:
            rgb = rgb + np.array(hi, dtype=np.float32) * 0.08 * y**2
    return rgb


def develop(lin, p, h):
    """Apply one block of adjustments. lin is linear RGB; returns linear RGB."""
    if p.get("exposure"):
        lin = lin * 2 ** p["exposure"]
    if p.get("temp") or p.get("tint"):
        lin = white_balance(lin, p.get("temp", 0), p.get("tint", 0))
    rgb = to_srgb(lin)
    rgb = tone(rgb, p, h)
    rgb = colour(rgb, p)
    return to_linear(np.clip(rgb, 0, 1.2))


def mask(spec, rgb, h, w):
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    yy /= h
    xx /= w
    kind = spec["type"]
    if kind == "gradient":
        y0, y1 = spec["from"], spec["to"]
        m = 1 - smoothstep(min(y0, y1), max(y0, y1), yy) if y0 < y1 else smoothstep(y1, y0, yy)
    elif kind == "radial":
        cx, cy, rx, ry = spec["cx"], spec["cy"], spec["rx"], spec["ry"]
        d = np.sqrt(((xx - cx) / rx) ** 2 + ((yy - cy) / ry) ** 2)
        m = 1 - smoothstep(1 - spec.get("feather", 0.5), 1, d)
        if spec.get("invert"):
            m = 1 - m
    elif kind == "sky":
        y = luma(rgb)
        r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
        blueish = smoothstep(-0.02, 0.08, b - r)
        bright = smoothstep(spec.get("bright", 0.45), spec.get("bright", 0.45) + 0.2, y)
        cloud = smoothstep(0.55, 0.8, y) * (1 - smoothstep(0.06, 0.18, np.max(rgb, -1) - np.min(rgb, -1)))
        m = np.maximum(blueish * bright, cloud) * (1 - smoothstep(spec.get("horizon", 0.6) - 0.1, spec.get("horizon", 0.6) + 0.1, yy))
        small = cv2.resize(m.astype(np.float32), (w // 4, h // 4), interpolation=cv2.INTER_AREA)
        guide = cv2.resize(y.astype(np.float32), (w // 4, h // 4), interpolation=cv2.INTER_AREA)
        small = np.clip(guided(guide, small, max(3, h // 160), 1e-3), 0, 1)
        m = cv2.resize(small, (w, h), interpolation=cv2.INTER_LINEAR)
    else:
        raise ValueError(kind)
    return np.clip(m * spec.get("amount", 1), 0, 1).astype(np.float32)


def straighten(img, angle):
    h, w = img.shape[:2]
    M = cv2.getRotationMatrix2D((w / 2, h / 2), angle, 1)
    rad = np.radians(abs(angle))
    scale = np.cos(rad) + max(w / h, h / w) * np.sin(rad)
    M[:, :2] *= scale
    return cv2.warpAffine(img, M, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REFLECT)


def remove(im, boxes):
    """Erase each [x0, y0, x1, y1] box (fractions of the frame) with LaMa inpainting.

    Needs torch and simple-lama-inpainting (installed with --no-deps).
    """
    from simple_lama_inpainting import SimpleLama

    w, h = im.size
    mask = np.zeros((h, w), np.uint8)
    for x0, y0, x1, y1 in boxes:
        cv2.ellipse(
            mask,
            (int((x0 + x1) / 2 * w), int((y0 + y1) / 2 * h)),
            (int((x1 - x0) / 2 * w), int((y1 - y0) / 2 * h)),
            0, 0, 360, 255, -1,
        )
    mask = cv2.dilate(mask, np.ones((15, 15), np.uint8))
    filled = SimpleLama()(im, Image.fromarray(mask))
    return filled.crop((0, 0, w, h))


def run(recipe, src_dir, out_dir):
    path = os.path.join(src_dir, recipe["source"])
    im = ImageOps.exif_transpose(Image.open(path)).convert("RGB")
    im.thumbnail((WORK_EDGE, WORK_EDGE), Image.LANCZOS)
    if recipe.get("remove"):
        im = remove(im, recipe["remove"])
    srgb = np.asarray(im, dtype=np.float32) / 255
    h, w = srgb.shape[:2]
    if recipe.get("angle"):
        srgb = straighten(srgb, recipe["angle"])
    if recipe.get("crop"):
        x0, y0, x1, y1 = recipe["crop"]
        srgb = srgb[int(y0 * h) : int(y1 * h), int(x0 * w) : int(x1 * w)]
        h, w = srgb.shape[:2]
    lin = to_linear(srgb)
    lin = develop(lin, recipe.get("global", {}), h)
    for local in recipe.get("masks", []):
        m = mask(local["mask"], to_srgb(lin), h, w)[..., None]
        adjusted = develop(lin, local, h)
        lin = lin * (1 - m) + adjusted * m
    rgb = to_srgb(lin)
    if recipe.get("vignette"):
        yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
        d = np.sqrt(((xx / w - 0.5) * 2) ** 2 + ((yy / h - 0.5) * 2) ** 2) / np.sqrt(2)
        rgb = rgb * (1 - recipe["vignette"] * smoothstep(0.35, 1.0, d) ** 1.5)[..., None]
    size = recipe.get("size", 1800)
    out = Image.fromarray((np.clip(rgb, 0, 1) * 255 + 0.5).astype(np.uint8))
    out.thumbnail((size, size), Image.LANCZOS)
    arr = np.asarray(out, dtype=np.float32) / 255
    amount = recipe.get("sharpen", 0.15)
    if amount:
        blur = cv2.GaussianBlur(arr, (0, 0), 0.9)
        arr = np.clip(arr + amount * (arr - blur), 0, 1)
    out = Image.fromarray((arr * 255 + 0.5).astype(np.uint8))
    target = os.path.join(out_dir, recipe["name"] + ".jpg")
    out.save(target, quality=recipe.get("quality", 88), optimize=True, progressive=True, subsampling="4:2:0")
    return target


def main():
    recipes_path, src_dir, out_dir, *only = sys.argv[1:]
    recipes = json.load(open(recipes_path, encoding="utf-8"))
    presets = {}
    if isinstance(recipes, dict):
        presets, recipes = recipes.get("presets", {}), recipes["photos"]
    os.makedirs(out_dir, exist_ok=True)
    for recipe in recipes:
        if only and recipe["name"] not in only:
            continue
        preset = presets.get(recipe.get("preset"), {})
        recipe = {**preset, **recipe, "global": {**preset.get("global", {}), **recipe.get("global", {})}}
        print(run(recipe, src_dir, out_dir))


if __name__ == "__main__":
    main()
