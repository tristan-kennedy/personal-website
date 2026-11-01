import type { Entry } from "./entries";
import { hash } from "./hash";

const POSTERS = 12;
const TITLES = 50;
const LARGEST = 14;
const SMALLEST = 2.2;
const FALLOFF = 26;
const WALL_SIZES = [0.8, 0.9, 1, 1, 1.15, 1.4, 1.7];
const COLUMNS = [0, 25, 50];
const WALL_COLUMNS = [0, 12.5, 25, 37.5, 50, 62.5];

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

export function scatter(
  entry: Entry,
  newestFirst: number,
  oldestFirst: number,
) {
  const seed = hash(entry.id);
  const wall = tierAt(newestFirst) === "scrap";
  const flipped = (wall ? seed >>> 5 : oldestFirst) % 2 === 1;
  const size =
    curve(newestFirst) *
    (wall ? WALL_SIZES[(seed >>> 11) % WALL_SIZES.length] : 1);
  const width = entry.data.title.length * (flipped ? 0.46 : 0.4) * size;
  const columns = (wall ? WALL_COLUMNS : COLUMNS).filter(
    (column) => column <= 88 - width,
  );
  return {
    flipped,
    size,
    offset: columns.length ? columns[(seed >>> 8) % columns.length] : 0,
    quiet: (seed >>> 17) % 3 === 0,
  };
}
