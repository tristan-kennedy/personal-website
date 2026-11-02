import { packed, type Effect } from "../../lib/dither/effect";
import { threshold } from "../../lib/dither/index";
import type { Rgb } from "../../lib/dither/palette";
import { COQUI_TALL, COQUI_WIDE, drawCoqui } from "./components/coqui";

const HOUSES: {
  from: number;
  to: number;
  rise: number;
  wall: Rgb;
  shutter: Rgb;
}[] = [
  {
    from: 0.44,
    to: 0.56,
    rise: 0.5,
    wall: [0xf2, 0x8b, 0x6a],
    shutter: [0x1f, 0x6f, 0x73],
  },
  {
    from: 0.56,
    to: 0.67,
    rise: 0.76,
    wall: [0xf5, 0xc9, 0x5a],
    shutter: [0x2f, 0x5d, 0x8a],
  },
  {
    from: 0.67,
    to: 0.8,
    rise: 0.62,
    wall: [0x62, 0xc8, 0xc4],
    shutter: [0xa8, 0x3f, 0x52],
  },
  {
    from: 0.8,
    to: 0.91,
    rise: 1,
    wall: [0xee, 0x6f, 0x9a],
    shutter: [0x24, 0x5e, 0x55],
  },
];
const HOUSE_BASE = 0.8;
const HOUSE_HEADROOM = 0.52;
const CORNICE = 3;
const FLOOR_TALL = 19;
const SHUTTER_WIDE = 7;
const SHUTTER_TALL = 13;
const SHUTTER_EVERY = 13;
const WALL_SHADE = 0.84;
const SHADE_WIDE = 3;

const LEAF_GREENS = [
  { light: [0x4f, 0xb8, 0x6a], dark: [0x2c, 0x8a, 0x52] },
  { light: [0x86, 0xc9, 0x4a], dark: [0x4f, 0x9e, 0x3e] },
  { light: [0x2f, 0x9d, 0x72], dark: [0x1d, 0x6e, 0x55] },
] satisfies { light: Rgb; dark: Rgb }[];
const LEAVES = [
  { at: 0.47, lift: 0.5, angle: -2.62, green: 0 },
  { at: 0.93, lift: 0.42, angle: -0.5, green: 1 },
  { at: 0.54, lift: 0.82, angle: -1.95, green: 2, small: true },
  { at: 0.86, lift: 0.8, angle: -1.15, green: 0, small: true },
  { at: 0.72, lift: 0.82, angle: -1.45, green: 1, small: true },
  { at: 0.56, lift: 0.7, angle: 0.4, green: 2 },
  { at: 0.77, lift: 0.72, angle: 1.3, green: 1 },
  { at: 0.5, lift: 0.72, angle: 2.2, green: 0, small: true },
];
const LEAF_STEP = 0.7;
const FROGS = [
  { at: 0.385, feet: 0.13, facesLeft: true },
  { at: 0.955, feet: 0.1, facesLeft: false },
  { at: 0.63, feet: 1.22, facesLeft: false },
];

const CHARCOAL = packed([0x29, 0x28, 0x24]);
const CREAM = packed([0xf6, 0xef, 0xdd]);

export default {
  reach: { top: 1.05, right: 0.35, bottom: 0.7, left: 0.2 },
  paint({ cols, rows, box, gate }) {
    const wide = box.right - box.left;
    const tall = box.bottom - box.top;
    const leafLength = Math.min(wide * 0.22, Math.max(box.top, tall) * 1.15);

    const leaves = LEAVES.map(({ at, lift, angle, green, small }, index) => ({
      x: box.left + at * wide,
      y: box.top + lift * tall,
      angle,
      length: leafLength * (small ? 0.72 : 1),
      girth: leafLength * 0.25,
      light: packed(LEAF_GREENS[green].light),
      dark: packed(LEAF_GREENS[green].dark),
      phase: index * 1.7,
    }));

    const houses = HOUSES.map(({ from, to, rise, wall, shutter }) => ({
      left: Math.round(box.left + from * wide),
      right: Math.round(box.left + to * wide),
      top: Math.round(box.top * (1 - HOUSE_HEADROOM * rise)),
      bottom: Math.round(box.top + tall * HOUSE_BASE),
      wall: packed(wall),
      shade: packed(wall.map((value) => Math.round(value * WALL_SHADE)) as Rgb),
      shutter: packed(shutter),
    }));

    const frogs = FROGS.flatMap(({ at, feet, facesLeft }) => {
      const x = Math.round(box.left + at * wide - COQUI_WIDE / 2);
      const y = Math.round(box.top + feet * tall - COQUI_TALL);
      const fits =
        x >= 1 &&
        y >= 1 &&
        x + COQUI_WIDE < cols - 1 &&
        y + COQUI_TALL < rows - 1;
      return fits ? [{ x, y, facesLeft }] : [];
    });

    return (pixels, seconds, reveal) => {
      const lay = (x: number, y: number, cell: number, density: number) => {
        if (x < 0 || y < 0 || x >= cols || y >= rows) return;
        const i = y * cols + x;
        if (gate[i] < reveal && threshold(x, y) < density) pixels[i] = cell;
      };

      for (const house of houses) {
        const { left, right, top, bottom, wall, shade, shutter } = house;
        for (let y = top; y < bottom; y++)
          for (let x = left; x < right; x++) {
            const inCornice = y < top + CORNICE;
            const undercut = y === top + CORNICE;
            lay(
              x,
              y,
              inCornice
                ? CREAM
                : undercut || x < left + SHADE_WIDE
                  ? shade
                  : wall,
              1.1,
            );
          }
        const doors = Math.max(1, Math.floor((right - left) / SHUTTER_EVERY));
        const gap = (right - left) / doors;
        for (let y = top + CORNICE + 4; y < box.top; y += FLOOR_TALL)
          for (let door = 0; door < doors; door++) {
            const start = Math.round(
              left + gap * (door + 0.5) - SHUTTER_WIDE / 2,
            );
            for (let down = 0; down < SHUTTER_TALL; down++)
              for (let over = 0; over < SHUTTER_WIDE; over++) {
                const edge = over === 0 || over === SHUTTER_WIDE - 1;
                if (down === 0 && edge) continue;
                const seam = over === 3;
                lay(start + over, y + down, seam ? CHARCOAL : shutter, 1.1);
              }
            for (let over = -2; over < SHUTTER_WIDE + 2; over++)
              lay(start + over, y + SHUTTER_TALL, CHARCOAL, 1.1);
          }
      }

      for (const leaf of leaves) {
        const angle = leaf.angle + Math.sin(seconds * 0.8 + leaf.phase) * 0.018;
        const alongX = Math.cos(angle);
        const alongY = Math.sin(angle);
        for (let t = 0; t < leaf.length; t += LEAF_STEP) {
          const share = t / leaf.length;
          const half = leaf.girth * Math.sin(Math.PI * share ** 0.7) ** 0.65;
          for (let s = -half; s <= half; s += LEAF_STEP) {
            const x = Math.round(leaf.x + alongX * t - alongY * s);
            const y = Math.round(leaf.y + alongY * t + alongX * s);
            const vein = (t + Math.abs(s) * 1.1) % 9 < 0.9;
            const rib = Math.abs(s) < 0.7;
            lay(x, y, rib || vein || s > 0 ? leaf.dark : leaf.light, 1.1);
          }
        }
      }

      frogs.forEach((frog, turn) => {
        if (gate[(frog.y + 8) * cols + frog.x + 13] < reveal)
          drawCoqui(pixels, cols, rows, frog, seconds, turn);
      });
    };
  },
} satisfies Effect;
