import { packed } from "../../../lib/dither/effect";
import { readDot } from "../../../lib/dither/fit";
import { threshold } from "../../../lib/dither/index";
import type { Rgb } from "../../../lib/dither/palette";
import { noise } from "../../../lib/dither/splotch";

export const INKS: Rgb[] = [
  [0x12, 0x12, 0x2e],
  [0x2a, 0x2a, 0x5e],
  [0x4f, 0x45, 0x8f],
  [0x8a, 0x4a, 0x8c],
  [0xf0, 0x8a, 0x76],
  [0xfb, 0xd6, 0xa8],
  [0xf2, 0xf0, 0xe9],
];
const LAST_INK = INKS.length - 1;

export const ASPECT = 1.5;
const DOOR_SHARE_OF_BOX = 0.326;
const TALLEST_DOOR = 0.78;
const DOOR = { left: 0.335, right: 0.571, top: 0.244, bottom: 0.737 };
const FRAME_TONE = 5.01 / LAST_INK;
const POST = 0.012;
const LINTEL = 0.016;
export const CENTRE = (DOOR.left + DOOR.right) / 2;
export const DOOR_MIDDLE = (DOOR.top + DOOR.bottom) / 2;
export const DOOR_HEIGHT = DOOR.bottom - DOOR.top;
const HORIZON = 0.64;
const FAR_HORIZON = 0.6;
const MOON = { x: 0.73, y: 0.2, radius: 0.052, bite: 0.03 };
const STAR_ODDS = 420;
const SEED = 11;

const smooth = (edge: number, value: number) =>
  Math.max(0, Math.min(1, 0.5 - value / edge));

const clouds = (u: number, v: number) =>
  noise(u * 5, v * 9, SEED) * 0.65 + noise(u * 13, v * 22, SEED + 1) * 0.35;

const beyondTheDoor = (u: number, v: number) => {
  const farDoor = Math.abs(u - CENTRE) < 0.011;
  if (farDoor && v > FAR_HORIZON - 0.052 && v < FAR_HORIZON + 0.004)
    return 0.02;
  if (v < FAR_HORIZON) {
    const rise = (v - DOOR.top) / (FAR_HORIZON - DOOR.top);
    return 0.56 + rise * 0.34 + (clouds(u * 2, v * 3) - 0.5) * 0.3;
  }
  const near = (v - FAR_HORIZON) / (DOOR.bottom - FAR_HORIZON);
  const bend = Math.sin(near * 7) * 0.026 * (1 - near * 0.6);
  const halfRoad = 0.004 + 0.088 * near * near;
  const road = smooth(0.006, Math.abs(u - CENTRE - bend) - halfRoad);
  return 0.3 + near * 0.1 + road * 0.62;
};

const night = (u: number, v: number, x: number, y: number) => {
  const wide = (u - MOON.x) * ASPECT;
  const tall = v - MOON.y;
  if (Math.hypot(wide, tall) < MOON.radius)
    return Math.hypot(wide + MOON.bite, tall - MOON.bite * 0.3) < MOON.radius
      ? 0.1
      : 0.92;
  if (v < HORIZON) {
    const star = (((x * 73856093) ^ (y * 19349663)) >>> 0) % STAR_ODDS === 0;
    if (star && v < HORIZON - 0.06) return 1;
    const away = Math.hypot((u - CENTRE) * ASPECT, v - 0.5);
    return 0.02 + clouds(u, v) * 0.24 + Math.exp(-away * 5) * 0.34;
  }
  const near = Math.max(0, (v - DOOR.bottom) / (1 - DOOR.bottom));
  const bend = near * near * -0.13 + Math.sin(near * 5) * 0.022;
  const halfRoad = 0.098 + near * 0.2;
  const road =
    v > DOOR.bottom ? smooth(0.016, Math.abs(u - CENTRE - bend) - halfRoad) : 0;
  const ground = 0.03 + noise(u * 9, v * 26, SEED + 2) * 0.1;
  return ground + road * (0.8 - near * 0.6);
};

export const toneAt = (u: number, v: number, x: number, y: number) => {
  const { left, right, top, bottom } = DOOR;
  if (u < left || u > right || v < top || v > bottom) return night(u, v, x, y);
  if (
    u < left + POST + 0.003 ||
    u > right - POST - 0.003 ||
    v < top + LINTEL + 0.004
  )
    return FRAME_TONE;
  return beyondTheDoor(u, v);
};

export const isMoon = (u: number, v: number) =>
  Math.hypot((u - MOON.x) * ASPECT, v - MOON.y) < MOON.radius;

export const isOpenSky = (u: number, v: number) =>
  v < HORIZON && (u < DOOR.left || u > DOOR.right || v < DOOR.top);

export const inkAt = (tone: number, x: number, y: number) => {
  const place = Math.max(0, Math.min(1, tone)) * LAST_INK;
  const ink = Math.floor(place);
  const step = place - ink > threshold(x, y) ? 1 : 0;
  return Math.min(LAST_INK, ink + step);
};

export const paintScene = () => {
  const cover = document.querySelector<HTMLElement>("[data-cover]")!;
  const stage = cover.closest<HTMLElement>("[data-stage]")!;
  const canvas = document.createElement("canvas");
  canvas.className = cover.className;
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", cover.getAttribute("alt")!);
  const context = canvas.getContext("2d")!;
  const inks = INKS.map(packed);

  let painted = 0;
  const paint = () => {
    stage.style.removeProperty("--box");
    const dot = readDot(stage);
    const wanted = parseFloat(getComputedStyle(canvas).width);
    const cols = Math.ceil(wanted / dot);
    stage.style.setProperty("--box", `${cols * dot}px`);
    const doorHeight = cols * dot * DOOR_SHARE_OF_BOX;
    const shut = Math.min(1, (innerHeight * TALLEST_DOOR) / doorHeight);
    stage.style.setProperty("--shut", String(shut));
    if (cols === painted) return;
    painted = cols;
    const rows = Math.ceil(cols / ASPECT);
    canvas.width = cols;
    canvas.height = rows;
    const image = context.createImageData(cols, rows);
    const pixels = new Uint32Array(image.data.buffer);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) {
        pixels[y * cols + x] =
          inks[inkAt(toneAt(x / cols, y / rows, x, y), x, y)];
      }
    context.putImageData(image, 0, 0);
  };

  cover.replaceWith(canvas);
  paint();
  addEventListener("resize", paint);
};
