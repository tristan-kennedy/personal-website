import { packed } from "../../../lib/dither/effect";
import { threshold } from "../../../lib/dither/index";

const INKS: Record<string, number> = {
  b: packed([0xa8, 0x79, 0x4f]),
  d: packed([0x6f, 0x4e, 0x34]),
  l: packed([0xe6, 0xd4, 0xb0]),
  e: packed([0xd9, 0xa4, 0x41]),
  K: packed([0x1c, 0x1a, 0x17]),
  o: packed([0xc9, 0xa7, 0x7c]),
  t: packed([0xf4, 0xea, 0xd2]),
  s: packed([0xcf, 0xbd, 0x9a]),
};
const UNDERSIDE: Record<string, string> = {
  b: "d",
  l: "s",
  t: "s",
  o: "d",
  e: "b",
};
const SHADOW = 0.75;
const OUTLINE = packed([0x29, 0x28, 0x24]);

const RESTING = [
  "................deed......",
  "...............deKKed.....",
  "...........bbbbbeKKebbb...",
  ".......ddbbbbbbbbeebbbbbb.",
  ".....ddbbbbdbbbbbbbbbbbbbb",
  "....dbbbdbbbbbbbbbbbbbbbbb",
  "...dbbbbbbbbdbbbbbbdddddd.",
  "...bbbddbbbbbbbbbbbllllll.",
  "...bbdddbbbbbbbbllllllll..",
  "..bbbbbdbbbbbbllllllll....",
  "..bbbbbbbbbbllllllb.......",
  ".dbbbbbbbblllbbbb.bb......",
  ".bbbbb.bbbbbb.....bb......",
  ".bbb....bbbb......bb......",
  "..bb......bbb.....bbo.....",
  "ooooo...ooooo...ooooo.....",
];
const SAC = [
  "...................ssss...",
  ".................sttttttt.",
  "................ttttttttts",
  "................ttttttttts",
  "................ttttttttts",
  ".................stttttts.",
  "...................ssss...",
];
const SAC_TOP = 7;

const CALLING = RESTING.map((line, y) => {
  const sac = SAC[y - SAC_TOP];
  if (!sac) return line;
  return [...line].map((cell, x) => (sac[x] === "." ? cell : sac[x])).join("");
});
export const COQUI_WIDE = RESTING[0].length;
export const COQUI_TALL = RESTING.length;

const CHORUS = 5;
const CALL_BEATS = [0, 0.38];
const CALL_LENGTH = 0.24;

const cellsOf = (sprite: string[]) =>
  sprite.flatMap((line, y) =>
    [...line].flatMap((cell, x) => (cell === "." ? [] : [{ x, y, cell }])),
  );

const outlineOf = (sprite: string[]) => {
  const cells = cellsOf(sprite);
  const filled = new Set(cells.map(({ x, y }) => `${x}:${y}`));
  const ring = new Map<string, { x: number; y: number }>();
  for (const { x, y } of cells)
    for (const [dx, dy] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const near = `${x + dx}:${y + dy}`;
      if (!filled.has(near)) ring.set(near, { x: x + dx, y: y + dy });
    }
  return [...ring.values()];
};

const poses = [RESTING, CALLING].map((sprite) => ({
  cells: cellsOf(sprite),
  outline: outlineOf(sprite),
}));

export const drawCoqui = (
  pixels: Uint32Array,
  cols: number,
  rows: number,
  { x, y, facesLeft }: { x: number; y: number; facesLeft: boolean },
  seconds: number,
  turn: number,
) => {
  const called = (seconds % CHORUS) - turn * 1.5;
  const calling = CALL_BEATS.some(
    (start) => called >= start && called < start + CALL_LENGTH,
  );
  const { cells, outline } = poses[calling ? 1 : 0];
  const across = (cellX: number) =>
    x + (facesLeft ? COQUI_WIDE - 1 - cellX : cellX);
  for (const cell of outline) {
    const left = across(cell.x);
    const top = y + cell.y;
    if (left >= 0 && top >= 0 && left < cols && top < rows)
      pixels[top * cols + left] = OUTLINE;
  }
  for (const cell of cells) {
    const left = across(cell.x);
    const top = y + cell.y;
    const shaded =
      UNDERSIDE[cell.cell] &&
      threshold(left, top) < (cell.y / COQUI_TALL) * SHADOW;
    pixels[top * cols + left] = INKS[shaded ? UNDERSIDE[cell.cell] : cell.cell];
  }
};
