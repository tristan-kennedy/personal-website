import type { Entry } from "./entries";
import { hash } from "./hash";

const POSTERS = 12;
const TITLES = 50;
export const TITLE_SIZE = 14;
const FALLOFF = 26;
const SLACK = 1.1;
const BOX = 92;
const META_ROOM = 11;
const DECK_FILL = 0.84;
const DECK_LARGEST = 34;

export type Tier = "poster" | "title" | "scrap";
export type Place = ReturnType<typeof scatter>;

export const tierAt = (newestFirst: number): Tier =>
  newestFirst < POSTERS
    ? "poster"
    : newestFirst < POSTERS + TITLES
      ? "title"
      : "scrap";

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
  const { title } = entry.data;
  const words = title
    .split(" ")
    .map((word) => word.length + word.replace(/[^mw]/gi, "").length / 2);
  const longestWord = Math.max(...words);
  const fullWidth = serif ? 216 : 240;
  const widthAt = (characters: number) =>
    (characters * TITLE_SIZE * 100 * SLACK) / fullWidth;
  const drift = worm(oldestFirst) + ((seed >>> 14) % 7) - 3;
  return {
    serif,
    quiet: (seed >>> 17) % 3 === 0,
    alignRight: drift > 0,
    ...boxAround(
      50 + drift * wiggle(newestFirst),
      fitted(words, (characters) => widthAt(characters) + META_ROOM, BOX),
    ),
    deck: Math.min(DECK_LARGEST, (DECK_FILL * fullWidth) / longestWord),
    deckLines: linesAt(words, longestWord / DECK_FILL),
  };
}
