import sharp from "sharp";
import {
  CHARCOAL,
  MUTED,
  PAPER,
  RULE_ON_PAPER,
} from "../src/lib/dither/palette.ts";

const write = (pixels, width, height, out) =>
  sharp(pixels, { raw: { width, height, channels: 3 } })
    .png({ palette: true, colours: 2 })
    .toFile(out);

const paint = (dark, width, height, light = PAPER) => {
  const pixels = Buffer.alloc(width * height * 3);
  dark.forEach((isDark, i) => {
    const [r, g, b] = isDark ? CHARCOAL : light;
    pixels[i * 3] = r;
    pixels[i * 3 + 1] = g;
    pixels[i * 3 + 2] = b;
  });
  return pixels;
};

async function globe(out = "public/dither/globe.png", size = 280) {
  const { renderGlobe, START_LON } = await import("../src/lib/dither/globe.ts");
  const ink = renderGlobe(Number(size), START_LON);
  const pixels = paint(
    Array.from(ink, (v) => !v),
    size,
    size,
    MUTED,
  );
  return write(pixels, size, size, out);
}

async function apple(out = "public/dither/apple.png", size = 240) {
  const { renderApple, START_ANGLE, INK, OUTSIDE } =
    await import("../src/lib/dither/apple.ts");
  const frame = renderApple(Number(size), START_ANGLE);
  const pixels = Buffer.alloc(size * size * 4);
  frame.forEach((v, i) => {
    const [r, g, b] = v === INK ? CHARCOAL : PAPER;
    pixels.set([r, g, b, v === OUTSIDE ? 0 : 255], i * 4);
  });
  return sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(out);
}

async function where(out = "public/dither/where.png") {
  const { MAP_WIDTH, MAP_HEIGHT, mapProjection } =
    await import("../src/lib/dither/where.ts");
  return map(out, mapProjection(), MAP_WIDTH, MAP_HEIGHT, {
    marker: 3,
    density: 0.72,
    ink: RULE_ON_PAPER,
  });
}

async function wherePhone(out = "public/dither/where-phone.png") {
  const { PHONE_MAP_WIDTH, PHONE_MAP_HEIGHT, phoneMapProjection } =
    await import("../src/lib/dither/where.ts");
  return map(out, phoneMapProjection(), PHONE_MAP_WIDTH, PHONE_MAP_HEIGHT, {
    marker: 2,
    density: 1.1,
    ink: MUTED,
  });
}

async function map(out, projection, w, h, { marker, density, ink }) {
  const { readFile } = await import("node:fs/promises");
  const { createRequire } = await import("node:module");
  const { geoPath } = await import("d3-geo");
  const { feature } = await import("topojson-client");
  const { threshold, SUN } = await import("../src/lib/dither/index.ts");
  const { now } = await import("../src/lib/site.ts");
  const { lat, lon } = now.coordinates;

  const require = createRequire(import.meta.url);
  const topology = JSON.parse(
    await readFile(require.resolve("world-atlas/land-50m.json"), "utf8"),
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><path fill="#fff" d="${geoPath(projection)(feature(topology, topology.objects.land))}"/></svg>`;
  const land = await sharp(Buffer.from(svg))
    .flatten({ background: "#000" })
    .greyscale()
    .raw()
    .toBuffer();

  const near = (value, step) => {
    const m = ((value % step) + step) % step;
    return m < 0.12 || m > step - 0.12;
  };
  const pixels = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const u = (x / w) * 2 - 1;
      const v = 1 - (y / h) * 2;
      const light =
        0.55 + 0.45 * Math.max(-1, Math.min(1, u * SUN[0] + v * SUN[1]));
      const [plon, plat] = projection.invert([x + 0.5, y + 0.5]);
      const value =
        land[i] > 127
          ? density * light
          : near(plat, 5) || near(plon, 5)
            ? 0.5
            : 0;
      if (value > threshold(x, y)) pixels.set([...ink, 255], i * 4);
    }
  }
  const [hx, hy] = projection([lon, lat]).map(Math.round);
  for (let dy = -marker; dy <= marker; dy++) {
    for (let dx = -marker; dx <= marker; dx++) {
      if (dx * dx + dy * dy <= marker * marker)
        pixels.set([...CHARCOAL, 255], ((hy + dy) * w + hx + dx) * 4);
    }
  }
  return sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(out);
}

async function photo(input, out, width = 200) {
  const { threshold } = await import("../src/lib/dither/index.ts");
  const { data, info } = await sharp(input)
    .resize({ width: Number(width) })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const { width: w, height: h } = info;
  const pixels = Buffer.alloc(w * h * 4);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const [r, g, b, a] = data.subarray(i * 4, i * 4 + 4);
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      const [cr, cg, cb] = lum < threshold(x, y) ? CHARCOAL : PAPER;
      pixels.set([cr, cg, cb, a < 128 ? 0 : 255], i * 4);
    }
  }
  return sharp(pixels, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(out);
}

async function record(out = "public/dither/record.png", size = 100) {
  const { renderRecord, START_ANGLE, DARK, OUTSIDE } =
    await import("../src/lib/dither/record.ts");
  const frame = renderRecord(Number(size), START_ANGLE);
  const pixels = Buffer.alloc(size * size * 4);
  frame.forEach((v, i) => {
    const [r, g, b] = v === DARK ? CHARCOAL : MUTED;
    pixels.set([r, g, b, v === OUTSIDE ? 0 : 255], i * 4);
  });
  return sharp(pixels, { raw: { width: size, height: size, channels: 4 } })
    .png()
    .toFile(out);
}

const [command, ...args] = process.argv.slice(2);
if (command === "globe") await globe(...args);
else if (command === "apple") await apple(...args);
else if (command === "where") await where(...args);
else if (command === "where-phone") await wherePhone(...args);
else if (command === "record") await record(...args);
else if (command === "photo" && args.length >= 2) await photo(...args);
else {
  console.error(
    "Usage: node scripts/dither.mjs globe | apple | where | where-phone | record | photo <in> <out> [width]",
  );
  process.exit(1);
}
