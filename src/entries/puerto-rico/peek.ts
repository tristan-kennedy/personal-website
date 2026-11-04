import { packed, type Effect } from "../../lib/dither/effect";
import { threshold } from "../../lib/dither/index";
import type { Rgb } from "../../lib/dither/palette";
import { noise } from "../../lib/dither/splotch";
import { hash } from "../../lib/hash";

const WALLS: Rgb[] = [
  [0xf2, 0x8b, 0x6a],
  [0xf5, 0xc9, 0x5a],
  [0x62, 0xc8, 0xc4],
  [0xee, 0x6f, 0x9a],
];
const SHUTTERS: Rgb[] = [
  [0x1f, 0x6f, 0x73],
  [0x2f, 0x5d, 0x8a],
  [0xa8, 0x3f, 0x52],
  [0x24, 0x5e, 0x55],
];
const FROND: Rgb[] = [
  [0x1d, 0x5c, 0x3c],
  [0x2c, 0x8a, 0x52],
  [0x4f, 0xb8, 0x6a],
  [0x9a, 0xd4, 0x6a],
];
const BARK: Rgb[] = [
  [0x4a, 0x38, 0x2a],
  [0x7a, 0x60, 0x48],
  [0xa8, 0x8c, 0x6c],
];
const COCONUT = packed([0x5a, 0x45, 0x2a]);
const CREAM = packed([0xf6, 0xef, 0xdd]);
const IRON = packed([0x29, 0x28, 0x24]);

const HOUSE_WIDE = [0.62, 0.74, 0.86];
const HOUSE_RISE = [0.12, 0.2, 0.28, 0.36];
const STREET_OVERHANG = 0.2;
const RAGGED = 0.5;
const FLOOR = 0.46;
const WALL_DENSITY = 0.82;
const DAPPLE = 0.5;

const PALM_AT = 0.74;
const PALM_ROOT = 0.35;
const PALM_RISE = 0.55;
const PALM_LEAN = 0.35;
const CROWN_ROOM = 1.15;
const FRONDS = [
  { angle: -2.75, length: 1.0 },
  { angle: -2.25, length: 0.85 },
  { angle: -1.75, length: 0.7 },
  { angle: -1.3, length: 0.75 },
  { angle: -0.85, length: 0.9 },
  { angle: -0.35, length: 1.0 },
  { angle: 0.15, length: 0.8 },
  { angle: -3.25, length: 0.8 },
];
const FROND_DROOP = 0.85;
const LEAFLET_EVERY = 2;

const clamp = (value: number) => Math.max(0, Math.min(1, value));
const shade = (rgb: Rgb, by: number) =>
  packed(rgb.map((value) => Math.round(value * by)) as Rgb);
const lift = (rgb: Rgb, by: number) =>
  packed(rgb.map((value) => Math.round(value + (255 - value) * by)) as Rgb);
const ramp = (inks: number[], tone: number, x: number, y: number) => {
  const place = clamp(tone) * (inks.length - 1);
  const low = Math.floor(place);
  return inks[
    Math.min(inks.length - 1, low + (place - low > threshold(x, y) ? 1 : 0))
  ];
};

export default {
  reach: { top: 1.9, right: 0.8, bottom: 0.7, left: 0.8 },
  paint({ cols, rows, box, gate, lines, seed }) {
    const tall = box.bottom - box.top;
    const line = tall / lines;
    const sized = (share: number, least = 1) =>
      Math.max(least, Math.round(share * line));

    const street = new Uint32Array(cols * rows);
    const shaded = new Uint32Array(cols * rows);
    const put = (x: number, y: number, ink: number, shadow = 0) => {
      if (x < 0 || y < 0 || x >= cols || y >= rows) return;
      street[y * cols + x] = ink;
      shaded[y * cols + x] = shadow;
    };
    const start = box.left - STREET_OVERHANG * line;
    const end = box.right + STREET_OVERHANG * line;
    const fadeFrom = box.top + tall * 0.5;
    const fadeTo = box.bottom + 0.05 * line;
    const kept = (x: number, y: number) => {
      const fade = clamp((y - fadeFrom) / (fadeTo - fadeFrom));
      if (threshold(x, y) < fade) return false;
      const inward = Math.min(x - start, end - x) / (RAGGED * line);
      const rough =
        noise(x * 0.09, y * 0.09, seed) * 0.85 + threshold(x, y) * 0.15;
      return inward > rough;
    };
    const cornice = sized(0.07, 2);
    const shutterWide = sized(0.13, 3) | 1;
    const shutterTall = sized(0.24, 5);
    const rail = sized(0.07, 2);
    let pick = seed % WALLS.length;
    for (let x = start, k = 0; x < end; k++) {
      const h = hash(`street:${k}`);
      const wide = HOUSE_WIDE[h % HOUSE_WIDE.length] * line;
      pick = (pick + 1 + ((h >>> 5) % (WALLS.length - 1))) % WALLS.length;
      const walls = [
        shade(WALLS[pick], 0.64),
        shade(WALLS[pick], 0.82),
        packed(WALLS[pick]),
        lift(WALLS[pick], 0.28),
      ];
      const shutters = [
        shade(SHUTTERS[pick], 0.7),
        packed(SHUTTERS[pick]),
        lift(SHUTTERS[pick], 0.25),
      ];
      const left = Math.round(x);
      const right = Math.round(Math.min(x + wide, end));
      const top = Math.round(
        box.top - HOUSE_RISE[(h >>> 9) % HOUSE_RISE.length] * line,
      );
      for (let y = top; y < fadeTo; y++)
        for (let px = left; px < right; px++) {
          if (!kept(px, y)) continue;
          if (y < top + cornice) {
            const underside = y === top + cornice - 1;
            put(px, y, underside && threshold(px, y) < 0.5 ? walls[3] : CREAM);
            continue;
          }
          const sunned = clamp((px - left) / ((right - left) * 0.4));
          const tone = 0.1 + sunned * 0.62 - ((y - top) / (fadeTo - top)) * 0.2;
          put(
            px,
            y,
            ramp(walls, tone, px, y),
            ramp(walls, tone - DAPPLE, px, y),
          );
        }
      const bays = Math.max(1, Math.round(wide / (0.36 * line)));
      const bay = (right - left) / bays;
      const middle = Math.floor(shutterWide / 2);
      for (
        let y = top + cornice + sized(0.1, 2);
        y + shutterTall < fadeFrom + 0.3 * line;
        y += sized(FLOOR, 8)
      )
        for (let b = 0; b < bays; b++) {
          const from = Math.round(left + bay * (b + 0.5) - shutterWide / 2);
          for (let down = 0; down < shutterTall; down++)
            for (let over = 0; over < shutterWide; over++) {
              const px = from + over;
              const py = y + down;
              if (!kept(px, py)) continue;
              if (down === 0 && (over === 0 || over === shutterWide - 1))
                continue;
              const tone =
                (down % 2 ? 0.3 : 0.7) + (over > middle ? 0.15 : -0.15);
              put(
                px,
                py,
                over === middle ? IRON : ramp(shutters, tone, px, py),
              );
            }
          const ledge = y + shutterTall;
          for (let over = -2; over < shutterWide + 2; over++) {
            if (!kept(from + over, ledge)) continue;
            put(from + over, ledge, IRON);
            put(from + over, ledge - rail, IRON);
            if (over % 2 === 0)
              for (let down = 1; down < rail; down++)
                put(from + over, ledge - down, IRON);
          }
        }
      x += wide;
    }

    const room = CROWN_ROOM * line;
    const crown = {
      x: Math.min(
        Math.max(
          box.left + PALM_AT * (box.right - box.left) + PALM_LEAN * line,
          box.left + room,
        ),
        box.right - room,
      ),
      y: box.top - PALM_RISE * line,
    };
    const root = {
      x: crown.x - PALM_LEAN * line,
      y: box.bottom + PALM_ROOT * line,
    };
    const bend = {
      x: root.x - 0.15 * line,
      y: (root.y + crown.y) / 2,
    };
    const bark = BARK.map(packed);
    const fronds = FROND.map(packed);
    const trunkWide = Math.max(1.5, 0.08 * line);
    const ring = Math.max(3, 0.09 * line);
    const frondLength = 1.1 * line;

    return (pixels, seconds, reveal) => {
      const lay = (x: number, y: number, ink: number, density = 1.1) => {
        if (x < 0 || y < 0 || x >= cols || y >= rows) return;
        const i = y * cols + x;
        if (gate[i] < reveal && threshold(x, y) < density) pixels[i] = ink;
      };

      const sway = seconds * 0.12;
      const leafy = 0.06 / Math.max(1, line / 40);
      for (let i = 0; i < street.length; i++) {
        if (!street[i] || gate[i] >= reveal) continue;
        if (!shaded[i]) {
          pixels[i] = street[i];
          continue;
        }
        const x = i % cols;
        const y = (i - x) / cols;
        if (threshold(x, y) >= WALL_DENSITY) continue;
        const dapple = noise(
          x * leafy + Math.sin(sway) * 1.5,
          y * leafy * 1.4 + sway * 0.4,
          seed,
        );
        pixels[i] = dapple > 0.56 ? shaded[i] : street[i];
      }

      const lean = Math.sin(seconds * 0.5) * 0.06 * line;
      const top = { x: crown.x + lean, y: crown.y };
      const steps = Math.ceil(Math.hypot(top.x - root.x, top.y - root.y));
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const x =
          (1 - t) ** 2 * root.x + 2 * (1 - t) * t * bend.x + t * t * top.x;
        const y =
          (1 - t) ** 2 * root.y + 2 * (1 - t) * t * bend.y + t * t * top.y;
        const wide = trunkWide * (1.15 - t * 0.4);
        const banded = (k % ring) / ring < 0.22;
        for (let s = -wide; s <= wide; s += 0.7) {
          const tone = banded ? 0.05 : 0.75 - (s / wide) * 0.45;
          const px = Math.round(x + s);
          const py = Math.round(y);
          lay(px, py, ramp(bark, tone, px, py));
        }
      }

      FRONDS.forEach((frond, index) => {
        const angle =
          frond.angle + Math.sin(seconds * 0.7 + index * 1.3) * 0.06;
        const length = frondLength * frond.length;
        const dirX = Math.cos(angle);
        const dirY = Math.sin(angle);
        let lastX = top.x;
        let lastY = top.y;
        for (let k = 1; k <= length; k++) {
          const t = k / length;
          const x = top.x + dirX * k;
          const y = top.y + dirY * k + t * t * FROND_DROOP * length;
          const stemX = x - lastX;
          const stemY = y - lastY;
          const span = Math.hypot(stemX, stemY) || 1;
          const normX = -stemY / span;
          const normY = stemX / span;
          lastX = x;
          lastY = y;
          lay(Math.round(x), Math.round(y), fronds[0]);
          if (k % LEAFLET_EVERY) continue;
          const leaflet =
            0.2 * line * Math.sin(Math.PI * Math.min(1, t * 1.15));
          for (const side of [-1, 1])
            for (let l = 1; l < leaflet; l++) {
              const back = l * 0.7;
              const px = Math.round(
                x + normX * side * l - (stemX / span) * back,
              );
              const py = Math.round(
                y + normY * side * l - (stemY / span) * back + l * 0.45,
              );
              const tone = 0.85 - (l / leaflet) * 0.4 - (side > 0 ? 0.25 : 0);
              lay(
                px,
                py,
                ramp(fronds, tone, px, py),
                l > leaflet * 0.8 ? 0.6 : 1.1,
              );
            }
        }
      });

      const nut = Math.max(1, 0.06 * line);
      for (const [dx, dy] of [
        [-0.7, 0.9],
        [0.6, 1],
        [0, 1.4],
      ])
        for (let y = -nut; y <= nut; y++)
          for (let x = -nut; x <= nut; x++)
            if (x * x + y * y <= nut * nut)
              lay(
                Math.round(top.x + dx * nut * 1.6 + x),
                Math.round(top.y + dy * nut + y),
                COCONUT,
              );
    };
  },
} satisfies Effect;
