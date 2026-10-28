import sharp from "sharp";

const CHARCOAL = [0x29, 0x28, 0x24];
const PAPER = [0xf2, 0xf0, 0xe9];
const MUTED = [0xb8, 0xb5, 0xaa];

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

async function photo(input, out, width = 480) {
  const { data, info } = await sharp(input)
    .resize({ width: Number(width) })
    .greyscale()
    .normalise()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const lum = Float32Array.from(data, (v) => v / 255);
  const dark = new Array(w * h);
  const spread = [
    [1, 0],
    [2, 0],
    [-1, 1],
    [0, 1],
    [1, 1],
    [0, 2],
  ];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const isDark = lum[i] < 0.5;
      dark[i] = isDark;
      const error = (lum[i] - (isDark ? 0 : 1)) / 8;
      for (const [dx, dy] of spread) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < w && ny < h) lum[ny * w + nx] += error;
      }
    }
  }
  return write(paint(dark, w, h), w, h, out);
}

const [command, ...args] = process.argv.slice(2);
if (command === "globe") await globe(...args);
else if (command === "apple") await apple(...args);
else if (command === "photo" && args.length >= 2) await photo(...args);
else {
  console.error(
    "Usage: node scripts/dither.mjs globe | apple | photo <in> <out> [width]",
  );
  process.exit(1);
}
