import sharp from "sharp";
import { threshold } from "./index.ts";
import { MUTED, opaque } from "./palette.ts";

const INK = opaque(MUTED);
const SOURCE_WIDTH = 300;

export type DitheredImage = NonNullable<
  Awaited<ReturnType<typeof ditherRemote>>
>;

const downloads = new Map<string, Promise<Buffer | undefined>>();

function fetchImage(url: string) {
  if (!downloads.has(url))
    downloads.set(
      url,
      fetch(url, { signal: AbortSignal.timeout(8000) }).then(
        async (response) =>
          response.ok ? Buffer.from(await response.arrayBuffer()) : undefined,
      ),
    );
  return downloads.get(url)!;
}

type Tone = { white?: number; gamma?: number };

async function dither(
  image: Buffer,
  width: number,
  height: number,
  { white = 99, gamma = 1 }: Tone,
) {
  const data = await sharp(image)
    .resize(width, height, { fit: "cover" })
    .greyscale()
    .normalise({ upper: white })
    .raw()
    .toBuffer();
  const pixels = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if ((data[i] / 255) ** gamma > threshold(x, y)) pixels.set(INK, i * 4);
    }
  }
  const png = await sharp(pixels, { raw: { width, height, channels: 4 } })
    .png({ palette: true, colours: 2 })
    .toBuffer();
  return `data:image/png;base64,${png.toString("base64")}`;
}

async function greyscale(image: Buffer, width: number, height: number) {
  const scale = SOURCE_WIDTH / width;
  const jpeg = await sharp(image)
    .resize(SOURCE_WIDTH, Math.round(height * scale), { fit: "cover" })
    .greyscale()
    .normalise()
    .jpeg({ quality: 72 })
    .toBuffer();
  return `data:image/jpeg;base64,${jpeg.toString("base64")}`;
}

export async function ditherRemote(
  url: string,
  width: number,
  height: number,
  { withSource = false, ...tone }: { withSource?: boolean } & Tone = {},
) {
  height = Math.round(height);
  const image = await fetchImage(url);
  if (!image) return undefined;
  return {
    src: await dither(image, width, height, tone),
    source: withSource ? await greyscale(image, width, height) : undefined,
    width,
    height,
  };
}
