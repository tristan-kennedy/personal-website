import { packed, plotter, type Effect } from "../../lib/dither/effect";
import { noise } from "../../lib/dither/splotch";
import { threshold } from "../../lib/dither/index";
import { PAPER, type Rgb } from "../../lib/dither/palette";
import { hash } from "../../lib/hash";

const TRIM = packed(PAPER);
const SHADOW = packed([0x24, 0x34, 0x3c]);
const FROND = packed([0x3f, 0xae, 0x7c]);
const JUNGLE = packed([0x2f, 0x7d, 0x5b]);
const WATER = packed([0x7f, 0xdc, 0xe0]);
const RED = packed([0xe5, 0x35, 0x2b]);
const BLUE = packed([0x1f, 0x4f, 0xa3]);
const POLE = packed([0xb3, 0x9a, 0x6e]);
const COBBLES = (
  [
    [0x4f, 0x7f, 0x9e],
    [0x3f, 0x6b, 0x8a],
    [0x6a, 0x9a, 0xb5],
  ] as Rgb[]
).map(packed);
const GLINT = packed([0xbf, 0xe3, 0xef]);
const HOUSES = [
  { at: 0.17, wide: 0.15, tall: 44, wall: [0xf2, 0xc1, 0x4e], vine: false },
  { at: 0.32, wide: 0.13, tall: 56, wall: [0x5f, 0xb7, 0xc9], vine: true },
  { at: 0.45, wide: 0.16, tall: 40, wall: [0xef, 0x8a, 0x8a], vine: false },
  { at: 0.61, wide: 0.12, tall: 52, wall: [0x8f, 0xd0, 0xa0], vine: true },
  { at: 0.73, wide: 0.14, tall: 46, wall: [0xf4, 0xa2, 0x59], vine: false },
] satisfies {
  at: number;
  wide: number;
  tall: number;
  wall: Rgb;
  vine: boolean;
}[];
const SKETCH_HEIGHT = 88;

export default {
  reach: { top: 1.5, right: 0.42, bottom: 0.45, left: 0.42 },
  paint(stage) {
    const { cols, rows, box, seed, colour } = stage;
    const haze = packed(colour);
    const wide = box.right - box.left;
    const scale = Math.min(box.top / SKETCH_HEIGHT, wide / 150);
    const base = Math.round(box.top + (box.bottom - box.top) * 0.45);
    const at = (fraction: number) => box.left + wide * fraction;

    return (pixels, seconds, reveal) => {
      const put = plotter(stage, pixels, reveal);
      const risen = Math.min(1, reveal / 0.6);
      const stand = (x: number, y: number, ink: number) =>
        put(x, base + (1 - risen) * 40 * scale - y, ink);

      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          if (y < box.bottom) {
            if (y < base && threshold(x, y) < (y / base) * 0.34)
              put(x, y, haze);
            continue;
          }
          const course = Math.floor(y / 4);
          const brick = x + course * 3;
          if (y % 4 === 0 || brick % 7 === 0) continue;
          const stone = Math.floor(brick / 7);
          const shine = Math.sin(stone * 1.7 + seconds * 2.4 + course) > 0.93;
          put(x, y, shine ? GLINT : COBBLES[hash(`${stone}:${course}`) % 3]);
        }

      HOUSES.forEach(({ at: start, wide: span, tall, wall, vine }) => {
        const left = at(start);
        const width = span * wide;
        const height = tall * scale;
        const paint = packed(wall);
        const shade = packed(wall.map((c) => Math.round(c * 0.78)) as Rgb);
        for (let y = 0; y < height; y++)
          for (let x = 0; x < width; x++)
            stand(left + x, y, x < width * 0.14 ? shade : paint);
        for (let x = -1.5 * scale; x < width + 1.5 * scale; x++)
          for (let y = 0; y < 3 * scale; y++) stand(left + x, height + y, TRIM);

        const windowWide = 6 * scale;
        const windowTall = 10 * scale;
        const pitch = windowWide * 2.3;
        const sill = height - 19 * scale;
        for (let x = windowWide * 0.7; x + windowWide < width; x += pitch) {
          for (let across = 0; across < windowWide; across++)
            for (let up = 0; up < windowTall; up++) {
              const arch = Math.abs(across / windowWide - 0.5) * 2;
              if (up > windowTall - 2 * scale && arch > 0.6) continue;
              stand(left + x + across, sill + up, SHADOW);
            }
          for (let up = -1; up < windowTall - 2 * scale; up++) {
            stand(left + x - 1, sill + up, shade);
            stand(left + x + windowWide, sill + up, shade);
          }
        }
        for (let x = 1; x < width - 1; x++) {
          stand(left + x, sill - 1, TRIM);
          stand(left + x, sill + 3 * scale, TRIM);
          if (Math.round(x) % 3 === 0)
            for (let up = 0; up < 3 * scale; up++)
              stand(left + x, sill - 1 + up, TRIM);
        }
        if (vine)
          for (let y = -9 * scale; y < 7 * scale; y++)
            for (let x = 0; x < width; x++) {
              const leaf = noise(x * 0.3 + start * 40, y * 0.3, seed);
              if (leaf > 0.6)
                stand(left + x, sill + y, threshold(x, y) < 0.5 ? haze : FROND);
            }
      });

      const fall = at(0.06);
      const hill = 36 * scale;
      for (let x = -19 * scale; x <= 19 * scale; x++) {
        const rise = (1 - (x / (19 * scale)) ** 2) * hill;
        for (let y = 0; y < rise; y++)
          stand(
            fall + x,
            y,
            noise(x * 0.25, y * 0.25, seed) > 0.5 ? FROND : JUNGLE,
          );
      }
      for (let x = -3 * scale; x <= 3 * scale; x++)
        for (let y = 0; y < hill - 6 * scale; y++) {
          const streak = noise(x * 0.8, y * 0.14 + seconds * 3.6, seed);
          stand(fall + x, y, streak > 0.5 ? TRIM : WATER);
        }

      const pole = at(0.93);
      const poleTall = 58 * scale;
      for (let y = 0; y < poleTall; y++) {
        stand(pole, y, POLE);
        stand(pole + 1, y, POLE);
      }
      const flagWide = 26 * scale;
      const flagTall = 16 * scale;
      for (let x = 0; x < flagWide; x++) {
        const wave = Math.sin(x * 0.3 - seconds * 5) * (x / flagWide) * 2.5;
        for (let y = 0; y < flagTall; y++) {
          const point =
            (1 - Math.abs(y / flagTall - 0.5) * 2) * flagWide * 0.42;
          const stripe = Math.floor((y / flagTall) * 5) % 2 === 0;
          stand(
            pole + 2 + x,
            poleTall - y + wave,
            x < point ? BLUE : stripe ? RED : TRIM,
          );
        }
      }
    };
  },
} satisfies Effect;
