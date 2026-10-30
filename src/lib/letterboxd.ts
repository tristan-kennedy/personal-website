import { ditherRemote, type DitheredImage } from "./dither/remote.ts";
import { letterboxdFeed } from "./site.ts";

export interface Film {
  title: string;
  href: string;
  watched: string;
  rating: number;
  poster?: DitheredImage;
}

const FILM_COUNT = 4;
const POSTER_WIDTH = 76;

let cached: Promise<Film[]> | undefined;

export function getFilms() {
  cached ??= readFilms().catch(() => []);
  return cached;
}

const field = (item: string, tag: string) =>
  item.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`))?.[1].trim() ?? "";

const decode = (text: string) =>
  text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "’")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

async function readFilms(): Promise<Film[]> {
  const response = await fetch(letterboxdFeed, {
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return [];
  const items = (await response.text())
    .split("<item>")
    .slice(1)
    .filter((item) => item.includes("<letterboxd:filmTitle>"))
    .slice(0, FILM_COUNT);

  return Promise.all(
    items.map(async (item) => {
      const image = item.match(/<img src="([^"]+)"/)?.[1];
      return {
        title: decode(field(item, "letterboxd:filmTitle")),
        href: field(item, "link"),
        watched: field(item, "letterboxd:watchedDate"),
        rating: Number(field(item, "letterboxd:memberRating")) || 0,
        poster: image
          ? await ditherRemote(image, POSTER_WIDTH, POSTER_WIDTH * 1.5, {
              withSource: true,
            }).catch(() => undefined)
          : undefined,
      };
    }),
  );
}
