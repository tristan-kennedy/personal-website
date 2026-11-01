import { packed, type Effect } from "../../lib/dither/effect";
import { noise } from "../../lib/dither/splotch";
import { threshold } from "../../lib/dither/index";
import { hash } from "../../lib/hash";
import type { Rgb } from "../../lib/dither/palette";

const LEAVES: Rgb[] = [
  [0xd9, 0x4f, 0x2b],
  [0xe8, 0x8a, 0x2c],
  [0xf2, 0xb9, 0x3b],
  [0xb8, 0x35, 0x2a],
  [0x3f, 0xae, 0x7c],
  [0xe8, 0x6a, 0x33],
  [0x2f, 0x7d, 0x5b],
];
const RIDGES = [
  { period: 19, height: 0.85, density: 0.4 },
  { period: 27, height: 0.62, density: 0.7 },
  { period: 37, height: 0.42, density: 1 },
];

export default {
  reach: { top: 1.7, right: 0.5, bottom: 0.35, left: 0.5 },
  paint({ cols, rows, box, gate, seed }) {
    const inks = LEAVES.map(packed);
    const ridges = RIDGES.map((ridge, i) => ({
      ...ridge,
      shift: ((seed >>> (i * 5)) % 97) + i * 11,
      layer: i,
    }));
    return (pixels, seconds, reveal) => {
      const grown = Math.min(1, reveal / 0.6);
      for (const { period, height, density, shift, layer } of ridges)
        for (let x = 0; x < cols; x++) {
          const sway = Math.sin(seconds * 1.4 + x * 0.04) * 1.2;
          const place = x + shift + sway;
          const tree = Math.floor(place / period);
          const ink = inks[hash(`${layer}:${tree}`) % inks.length];
          const taper = 1 - Math.abs((place % period) / period - 0.5) * 2;
          const tiers = Math.round(taper * 6) / 6;
          const tall = (0.45 + tiers * 0.55) * height * grown;
          const top = Math.floor(box.bottom - tall * box.bottom);
          for (let y = Math.max(0, top); y < rows; y++) {
            const i = y * cols + x;
            if (gate[i] >= reveal) continue;
            const fog = noise(x * 0.03 + seconds * 0.35, y * 0.1, seed);
            const dither = threshold(x, y);
            if (dither < density && dither > (fog - 0.58) * 3) pixels[i] = ink;
          }
        }
    };
  },
} satisfies Effect;
