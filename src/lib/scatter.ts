import type { Entry } from "./entries";
import { hash } from "./hash";

const POSTERS = 12;
const TITLES = 50;
const LARGEST = 14;
const SMALLEST = 2.2;
const FALLOFF = 26;
const WALL_SIZES = [0.8, 0.9, 1, 1, 1.15, 1.4, 1.7];
const SLACK = 1.1;
const BOX = 92;
const META_ROOM = 8;
const PHONE_BOX = 88;
const PHONE_FILL = 0.76;
const PHONE_SMALLEST = 6;
const PHONE_SIZES = [0.55, 0.7, 0.85, 1, 1];
const PHONE_AIR = [0.5, 0.8, 1, 1.6, 2.4];

export type Tier = "poster" | "title" | "scrap";
export type Place = ReturnType<typeof scatter>;

export const tierAt = (newestFirst: number): Tier =>
  newestFirst < POSTERS
    ? "poster"
    : newestFirst < POSTERS + TITLES
      ? "title"
      : "scrap";

const curve = (newestFirst: number) =>
  SMALLEST + (LARGEST - SMALLEST) * Math.exp(-newestFirst / FALLOFF);

const worm = (oldestFirst: number) =>
  21 * Math.sin(oldestFirst * 0.85 + 2.6) + 6 * Math.sin(oldestFirst * 2.1);

const wiggle = (newestFirst: number) =>
  1 - 0.4 * Math.exp(-newestFirst / FALLOFF);

const linesAt = (words: number[], limit: number) => {
  let lines = 1;
  let used = 0;
  for (const word of words) {
    if (used && used + 1 + word > limit) {
      lines++;
      used = 0;
    }
    used += (used && 1) + word;
  }
  return lines;
};

const narrowest = (words: number[], lines: number) => {
  let limit = Math.max(...words);
  while (linesAt(words, limit) > lines) limit++;
  return limit;
};

const fitted = (
  words: number[],
  widthOf: (characters: number) => number,
  cap: number,
) => {
  let lines = 1;
  while (lines < words.length && widthOf(narrowest(words, lines)) > cap)
    lines++;
  return widthOf(narrowest(words, lines));
};

const boxAround = (centre: number, boxWidth: number) => {
  const width = Math.min(100, boxWidth);
  const left = Math.min(Math.max(0, centre - width / 2), 100 - width);
  return { left, right: 100 - width - left };
};

export function scatter(
  entry: Entry,
  newestFirst: number,
  oldestFirst: number,
) {
  const seed = hash(entry.id);
  const wall = tierAt(newestFirst) === "scrap";
  const serif = (wall ? seed >>> 5 : oldestFirst) % 2 === 1;
  const size =
    curve(newestFirst) *
    (wall ? WALL_SIZES[(seed >>> 11) % WALL_SIZES.length] : 1);
  const { title } = entry.data;
  const words = title
    .split(" ")
    .map((word) => word.length + word.replace(/[^mw]/gi, "").length / 2);
  const longestWord = Math.max(...words);
  const fullWidth = serif ? 216 : 240;
  const widthAt = (characters: number, type: number) =>
    (characters * type * 100 * SLACK) / fullWidth;
  const phoneSize =
    Math.min(size * 1.9, (PHONE_FILL * fullWidth) / longestWord) *
    PHONE_SIZES[(seed >>> 20) % PHONE_SIZES.length];
  const phoneType = Math.max(phoneSize, PHONE_SMALLEST);
  const drift = worm(oldestFirst) + ((seed >>> 14) % 7) - 3;
  return {
    serif,
    size,
    quiet: (seed >>> 17) % 3 === 0,
    alignRight: drift > 0,
    ...boxAround(
      50 + drift * wiggle(newestFirst),
      fitted(words, (characters) => widthAt(characters, size) + META_ROOM, BOX),
    ),
    phone: {
      size: phoneSize,
      air: PHONE_AIR[(seed >>> 27) % PHONE_AIR.length],
      ...boxAround(
        50 + drift,
        fitted(words, (characters) => widthAt(characters, phoneType), PHONE_BOX),
      ),
    },
  };
}
