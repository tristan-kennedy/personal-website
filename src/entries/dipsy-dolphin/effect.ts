import { packed, plotter, type Effect } from "../../lib/dither/effect";
import { threshold } from "../../lib/dither/index";
import { PAPER } from "../../lib/dither/palette";
import sheetUrl from "./talk.png";

const FRAMES = 12;
const FRAME_SIZE = 128;
const FRAMES_PER_SECOND = 9;
const LEVELS = 4;
const SKETCH_HEIGHT = 88;
const WHITE = packed(PAPER);
const SILVER = packed([0xc0, 0xc0, 0xc0]);
const LIGHT = packed([0xef, 0xef, 0xef]);
const DARK = packed([0x60, 0x60, 0x60]);
const NAVY = packed([0x00, 0x00, 0x80]);
const INK = packed([0x18, 0x18, 0x18]);
const FOLDER = packed([0xf2, 0xc1, 0x4e]);
const CURSOR = [
  "#.......",
  "##......",
  "#.#.....",
  "#..#....",
  "#...#...",
  "#....#..",
  "#.....#.",
  "#..#####",
  "#.#.#...",
  "##..#...",
  "#....#..",
];

let sheet: ImageData | undefined;

const loadSheet = async () => {
  if (sheet) return;
  const image = new Image();
  image.src = sheetUrl.src;
  await image.decode();
  const canvas = document.createElement("canvas");
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.drawImage(image, 0, 0);
  sheet = context.getImageData(0, 0, canvas.width, canvas.height);
};

const step = (channel: number, dither: number) =>
  Math.min(
    255,
    Math.floor((channel / 255) * (LEVELS - 1) + dither) * (255 / (LEVELS - 1)),
  );

export default {
  prepare: loadSheet,
  reach: { top: 1.5, right: 0.42, bottom: 0.4, left: 0.42 },
  paint(stage) {
    const { cols, rows, box, colour } = stage;
    const desktop = packed(colour);
    const wide = box.right - box.left;
    const scale = Math.min(box.top / SKETCH_HEIGHT, wide / 150);
    const base = Math.round(box.top + (box.bottom - box.top) * 0.4);
    const at = (fraction: number) => box.left + wide * fraction;
    const size = Math.round(108 * scale);

    const frames = Array.from({ length: FRAMES }, (_, frame) => {
      const cells: [number, number, number][] = [];
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          const sourceX =
            Math.floor((x / size) * FRAME_SIZE) + frame * FRAME_SIZE;
          const sourceY = Math.floor((y / size) * FRAME_SIZE);
          const i = (sourceY * sheet!.width + sourceX) * 4;
          if (sheet!.data[i + 3] < 128) continue;
          const dither = threshold(x, y);
          cells.push([
            x,
            y,
            packed([
              step(sheet!.data[i], dither),
              step(sheet!.data[i + 1], dither),
              step(sheet!.data[i + 2], dither),
            ]),
          ]);
        }
      return cells;
    });

    return (pixels, seconds, reveal) => {
      const put = plotter(stage, pixels, reveal);
      const risen = Math.min(1, reveal / 0.6);
      const stand = (x: number, y: number, ink: number) =>
        put(x, base + (1 - risen) * 40 * scale - y, ink);
      const fill = (
        left: number,
        bottom: number,
        width: number,
        height: number,
        ink: number,
      ) => {
        for (let y = 0; y < height; y++)
          for (let x = 0; x < width; x++) stand(left + x, bottom + y, ink);
      };
      const windowAt = (
        left: number,
        bottom: number,
        width: number,
        height: number,
        inside: number,
      ) => {
        fill(left, bottom, width, height, SILVER);
        fill(left, bottom + height - 1, width, 1, LIGHT);
        fill(left, bottom, 1, height, LIGHT);
        fill(left, bottom, width, 1, DARK);
        fill(left + width - 1, bottom, 1, height, DARK);
        const bar = 6 * scale;
        fill(left + 2, bottom + height - bar - 2, width - 4, bar, NAVY);
        fill(
          left + width - bar - 2,
          bottom + height - bar - 1,
          bar - 2,
          bar - 2,
          SILVER,
        );
        fill(left + 3, bottom + 3, width - 6, height - bar - 6, inside);
      };

      for (let y = 0; y < box.bottom; y++)
        for (let x = 0; x < cols; x++)
          if (y < base && threshold(x, y) < (y / base) * 0.36)
            put(x, y, desktop);

      windowAt(at(0.42), 6 * scale, 70 * scale, 44 * scale, WHITE);
      for (let line = 0; line < 4; line++)
        fill(
          at(0.42) + 7 * scale,
          12 * scale + line * 6 * scale,
          (52 - line * 9) * scale,
          2 * scale,
          DARK,
        );

      windowAt(at(0.66), 14 * scale, 52 * scale, 36 * scale, desktop);
      fill(at(0.66) + 20 * scale, 18 * scale, 14 * scale, 5 * scale, SILVER);
      fill(at(0.66) + 20 * scale, 18 * scale, 14 * scale, 1, DARK);

      for (const row of [0, 1]) {
        const left = at(0.92);
        const bottom = 12 * scale + row * 19 * scale;
        fill(left, bottom, 15 * scale, 10 * scale, FOLDER);
        fill(left, bottom + 10 * scale, 7 * scale, 2 * scale, FOLDER);
      }

      const dipsyX = at(0.13) - size / 2;
      const frame = Math.floor(seconds * FRAMES_PER_SECOND) % FRAMES;
      for (const [x, y, ink] of frames[frame])
        stand(dipsyX + x, size * 0.86 - y, ink);

      const bubbleLeft = dipsyX + size * 0.78;
      const bubbleBottom = size * 0.66;
      const bubbleWide = 34 * scale;
      const bubbleTall = 18 * scale;
      fill(bubbleLeft, bubbleBottom, bubbleWide, bubbleTall, WHITE);
      for (let side = 0; side < 7 * scale; side++)
        fill(
          bubbleLeft - side,
          bubbleBottom - side * 0.3,
          7 * scale - side,
          1,
          WHITE,
        );
      for (let dot = 0; dot < 3; dot++)
        if (Math.floor(seconds * 2.4) % 4 > dot)
          fill(
            bubbleLeft + (8 + dot * 7) * scale,
            bubbleBottom + 7 * scale,
            4 * scale,
            4 * scale,
            INK,
          );

      const pointerX = at(0.62 + Math.sin(seconds * 0.9) * 0.2);
      const pointerY = 30 * scale + Math.cos(seconds * 1.3) * 18 * scale;
      CURSOR.forEach((line, y) =>
        [...line].forEach((cell, x) => {
          if (cell === "#")
            fill(
              pointerX + x * scale,
              pointerY - y * scale,
              Math.ceil(scale),
              Math.ceil(scale),
              INK,
            );
          else if (x <= y * 0.7)
            fill(
              pointerX + x * scale,
              pointerY - y * scale,
              Math.ceil(scale),
              Math.ceil(scale),
              WHITE,
            );
        }),
      );

      for (let y = box.bottom; y < box.bottom + 9 * scale; y++)
        for (let x = 0; x < cols; x++) {
          const edge = y === box.bottom;
          const start = x > box.left && x < box.left + 26 * scale;
          put(x, y, edge ? LIGHT : start ? DARK : SILVER);
        }
    };
  },
} satisfies Effect;
