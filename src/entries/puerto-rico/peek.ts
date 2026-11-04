import { packed, type Effect } from "../../lib/dither/effect";
import { threshold } from "../../lib/dither/index";
import type { Rgb } from "../../lib/dither/palette";
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
const COCONUT: Rgb[] = [
  [0x3e, 0x2e, 0x1e],
  [0x5a, 0x45, 0x2a],
  [0x86, 0x6a, 0x44],
];
const CREAM = packed([0xf6, 0xef, 0xdd]);
const IRON = packed([0x29, 0x28, 0x24]);

const UNIT_CAP = 60;
const HOUSE_WIDE = [0.62, 0.74, 0.86];
const HOUSE_RISE = [0.12, 0.2, 0.28, 0.36];
const STREET_OVERHANG = 0.2;
const END_FADE = 0.6;
const FLOOR = 0.46;
const EAVES = 0.16;

const PALM_AT = 0.74;
const PALM_ROOT = 0.1;
const PALM_RISE = 0.45;
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
const FROND_LENGTH = 0.95;
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
  reach: { top: 1.6, right: 0.8, bottom: 0.5, left: 0.8 },
  paint({ cols, rows, box, gate, lines, seed }) {
    const tall = box.bottom - box.top;
    const unit = Math.min(tall / lines, UNIT_CAP);
    const sized = (share: number, least = 1) =>
      Math.max(least, Math.round(share * unit));

    const street = new Uint32Array(cols * rows);
    const start = box.left - STREET_OVERHANG * unit;
    const end = box.right + STREET_OVERHANG * unit;
    const fadeFrom = box.top + tall * 0.4;
    const fadeTo = box.bottom + 0.05 * unit;
    const fadeAt = (x: number, y: number) =>
      Math.max(
        clamp((y - fadeFrom) / (fadeTo - fadeFrom)),
        1 - clamp(Math.min(x - start, end - x) / (END_FADE * unit)),
      );
    const put = (x: number, y: number, ink: number) => {
      if (!ink || x < 0 || y < 0 || x >= cols || y >= rows) return;
      street[y * cols + x] = ink;
    };
    const shows = (x: number, y: number) => threshold(x, y) >= fadeAt(x, y);

    const cornice = sized(0.07, 2);
    const shutterWide = sized(0.13, 3) | 1;
    const shutterTall = sized(0.24, 5);
    const rail = sized(0.07, 2);
    const middle = Math.floor(shutterWide / 2);
    let pick = seed % WALLS.length;
    for (let x = start, k = 0; x < end; k++) {
      const h = hash(`street:${k}`);
      const wide = HOUSE_WIDE[h % HOUSE_WIDE.length] * unit;
      pick = (pick + 1 + ((h >>> 5) % (WALLS.length - 1))) % WALLS.length;
      const wall = WALLS[pick];
      const walls = [0, shade(wall, 0.62), packed(wall), lift(wall, 0.25)];
      const shutters = [
        shade(SHUTTERS[pick], 0.7),
        packed(SHUTTERS[pick]),
        lift(SHUTTERS[pick], 0.25),
      ];
      const left = Math.round(x);
      const right = Math.round(Math.min(x + wide, end));
      const top = Math.round(
        box.top - HOUSE_RISE[(h >>> 9) % HOUSE_RISE.length] * unit,
      );
      for (let y = top; y < fadeTo; y++)
        for (let px = left; px < right; px++) {
          if (y < top + cornice) {
            if (shows(px, y)) put(px, y, CREAM);
            continue;
          }
          const lit = 1 - (px - left) / Math.max(1, right - left);
          const eaves = 1 - clamp((y - top - cornice) / (EAVES * unit));
          const tone = 0.42 + lit * 0.42 - eaves * 0.32 - fadeAt(px, y) * 0.95;
          put(px, y, ramp(walls, tone, px, y));
        }
      const bays = Math.max(1, Math.round(wide / (0.36 * unit)));
      const bay = (right - left) / bays;
      for (
        let y = top + cornice + sized(0.12, 2);
        y + shutterTall < fadeTo;
        y += sized(FLOOR, 8)
      )
        for (let b = 0; b < bays; b++) {
          const from = Math.round(left + bay * (b + 0.5) - shutterWide / 2);
          for (let down = 0; down < shutterTall; down++)
            for (let over = 0; over < shutterWide; over++) {
              const px = from + over;
              const py = y + down;
              if (!shows(px, py)) continue;
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
            const px = from + over;
            if (!shows(px, ledge)) continue;
            put(px, ledge, IRON);
            put(px, ledge - rail, IRON);
            if (over % 2 === 0)
              for (let down = 1; down < rail; down++)
                put(px, ledge - down, IRON);
          }
        }
      x += wide;
    }

    const room = CROWN_ROOM * unit;
    const crown = {
      x: Math.min(
        Math.max(
          box.left + PALM_AT * (box.right - box.left) + PALM_LEAN * unit,
          box.left + room,
        ),
        box.right - room,
      ),
      y: box.top - PALM_RISE * unit,
    };
    const root = {
      x: crown.x - PALM_LEAN * unit,
      y: box.bottom + PALM_ROOT * unit,
    };
    const bend = { x: root.x - 0.15 * unit, y: (root.y + crown.y) / 2 };
    const bark = [0, ...BARK.map(packed)];
    const fronds = [0, ...FROND.map(packed)];
    const nuts = COCONUT.map(packed);
    const trunkWide = Math.max(1.5, 0.08 * unit);
    const ring = Math.max(3, 0.09 * unit);
    const frondLength = FROND_LENGTH * unit;
    const nut = Math.max(1, 0.06 * unit);

    return (pixels, seconds, reveal) => {
      const lay = (x: number, y: number, ink: number) => {
        if (!ink || x < 0 || y < 0 || x >= cols || y >= rows) return;
        const i = y * cols + x;
        if (gate[i] < reveal) pixels[i] = ink;
      };

      for (let i = 0; i < street.length; i++)
        if (street[i] && gate[i] < reveal) pixels[i] = street[i];

      const top = {
        x: crown.x + Math.sin(seconds * 0.5) * 0.06 * unit,
        y: crown.y,
      };
      const steps = Math.ceil(Math.hypot(top.x - root.x, top.y - root.y));
      for (let k = 0; k <= steps; k++) {
        const t = k / steps;
        const x =
          (1 - t) ** 2 * root.x + 2 * (1 - t) * t * bend.x + t * t * top.x;
        const y =
          (1 - t) ** 2 * root.y + 2 * (1 - t) * t * bend.y + t * t * top.y;
        const wide = trunkWide * (1.15 - t * 0.4);
        const band = Math.max(0, Math.cos((k / ring) * Math.PI * 2)) ** 4;
        for (let s = -wide; s <= wide; s += 0.7) {
          const px = Math.round(x + s);
          const py = Math.round(y);
          lay(px, py, ramp(bark, 0.78 - (s / wide) * 0.4 - band * 0.5, px, py));
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
          lastX = x;
          lastY = y;
          const sx = Math.round(x);
          const sy = Math.round(y);
          lay(sx, sy, ramp(fronds, 0.5 - t * 0.2, sx, sy));
          if (k % LEAFLET_EVERY) continue;
          const leaflet =
            0.2 * unit * Math.sin(Math.PI * Math.min(1, t * 1.15));
          for (const side of [-1, 1])
            for (let l = 1; l < leaflet; l++) {
              const back = l * 0.7;
              const px = Math.round(
                x - (stemY / span) * side * l - (stemX / span) * back,
              );
              const py = Math.round(
                y +
                  (stemX / span) * side * l -
                  (stemY / span) * back +
                  l * 0.45,
              );
              const tone =
                0.9 - (l / leaflet) * 0.45 - (side > 0 ? 0.2 : 0) - t * 0.2;
              lay(px, py, ramp(fronds, tone, px, py));
            }
        }
      });

      for (const [dx, dy] of [
        [-0.7, 0.9],
        [0.6, 1],
        [0, 1.4],
      ])
        for (let y = -nut; y <= nut; y++)
          for (let x = -nut; x <= nut; x++)
            if (x * x + y * y <= nut * nut) {
              const px = Math.round(top.x + dx * nut * 1.6 + x);
              const py = Math.round(top.y + dy * nut + y);
              lay(px, py, ramp(nuts, 0.55 - (x + y) / (nut * 2.4), px, py));
            }
    };
  },
} satisfies Effect;
