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
const SHADE_SHARE = 0.35;
const FOOT_SHARE = 0.4;
const FOOT_DENSITY = 0.15;
const LEAF_TIP = 0.7;

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

const scaled = (rgb: Rgb, by: number) =>
  packed(rgb.map((value) => Math.round(value * by)) as Rgb);
const lifted = (rgb: Rgb, by: number) =>
  packed(rgb.map((value) => Math.round(value + (255 - value) * by)) as Rgb);
const clamp = (value: number) => Math.max(0, Math.min(1, value));
const inkAt = (inks: number[], tone: number, x: number, y: number) => {
  const place = clamp(tone) * (inks.length - 1);
  const ink = Math.floor(place);
  return inks[
    Math.min(inks.length - 1, ink + (place - ink > threshold(x, y) ? 1 : 0))
  ];
};

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
      inks: [
        scaled(LEAF_GREENS[green].dark, 0.7),
        packed(LEAF_GREENS[green].dark),
        packed(LEAF_GREENS[green].light),
        lifted(LEAF_GREENS[green].light, 0.3),
      ],
      phase: index * 1.7,
    }));

    const houses = HOUSES.map(({ from, to, rise, wall, shutter }) => ({
      left: Math.round(box.left + from * wide),
      right: Math.round(box.left + to * wide),
      top: Math.round(box.top * (1 - HOUSE_HEADROOM * rise)),
      bottom: Math.round(box.top + tall * HOUSE_BASE),
      walls: [
        scaled(wall, 0.66),
        scaled(wall, 0.84),
        packed(wall),
        lifted(wall, 0.3),
      ],
      shutters: [scaled(shutter, 0.7), packed(shutter), lifted(shutter, 0.25)],
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
        const { left, right, top, bottom, walls, shutters } = house;
        const shadeWide = (right - left) * SHADE_SHARE;
        const footFrom = bottom - (bottom - top) * FOOT_SHARE;
        for (let y = top; y < bottom; y++) {
          const foot = clamp((y - footFrom) / (bottom - footFrom));
          const density = 1.1 - foot * (1.1 - FOOT_DENSITY);
          for (let x = left; x < right; x++) {
            if (y < top + CORNICE) {
              const underside = y === top + CORNICE - 1;
              lay(
                x,
                y,
                underside && threshold(x, y) < 0.5 ? walls[3] : CREAM,
                1.1,
              );
              continue;
            }
            const sunned = clamp((x - left) / shadeWide);
            const undercut = clamp((y - top - CORNICE) / 5);
            const tone =
              0.08 +
              sunned * 0.62 +
              undercut * 0.22 -
              ((y - top) / (bottom - top)) * 0.18;
            lay(x, y, inkAt(walls, tone, x, y), density);
          }
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
                const slat = down % 2 ? 0.3 : 0.7;
                const tone = slat + (over > 3 ? 0.15 : -0.15);
                lay(
                  start + over,
                  y + down,
                  seam
                    ? CHARCOAL
                    : inkAt(shutters, tone, start + over, y + down),
                  1.1,
                );
              }
            for (let over = -2; over < SHUTTER_WIDE + 2; over++)
              lay(start + over, y + SHUTTER_TALL, CHARCOAL, 0.8);
          }
      }

      for (const leaf of leaves) {
        const angle = leaf.angle + Math.sin(seconds * 0.8 + leaf.phase) * 0.018;
        const alongX = Math.cos(angle);
        const alongY = Math.sin(angle);
        for (let t = 0; t < leaf.length; t += LEAF_STEP) {
          const share = t / leaf.length;
          const half = leaf.girth * Math.sin(Math.PI * share ** 0.7) ** 0.65;
          const tip = clamp((share - LEAF_TIP) / (1 - LEAF_TIP));
          for (let s = -half; s <= half; s += LEAF_STEP) {
            const x = Math.round(leaf.x + alongX * t - alongY * s);
            const y = Math.round(leaf.y + alongY * t + alongX * s);
            const across = half ? s / half : 0;
            const vein = (t + Math.abs(s) * 1.1) % 9 < 0.9;
            const rib = Math.abs(s) < 0.7;
            const tone =
              rib || vein
                ? 0.15
                : 0.55 -
                  across * 0.4 +
                  (1 - Math.abs(across)) * 0.2 -
                  share * 0.15;
            const edge = Math.abs(across) > 0.8 ? 0.5 : 1.1;
            lay(x, y, inkAt(leaf.inks, tone, x, y), Math.min(edge, 1.1 - tip));
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
