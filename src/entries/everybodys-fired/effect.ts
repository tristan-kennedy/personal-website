import { packed, type Effect } from "../../lib/dither/effect";
import { threshold } from "../../lib/dither/index";
import { hash } from "../../lib/hash";

const PERSON = [".###.", ".###.", "..#..", "#####", "..#..", ".#.#.", ".#.#."];
const SCALE = 2;
const ACROSS = 16;
const DOWN = 18;
const SHIFT = 15;
const LAST_FIRING = 11;
const GRAVITY = 110;
const CLAUDE = packed([0xd9, 0x77, 0x57]);
const RAYS = [1, 0.8, 0.96, 0.76, 1, 0.84, 0.92, 0.78, 0.98, 0.82, 0.94, 0.8];
const LOGO_SIZE = 8;
const TURNS = 24;
const ARRIVAL = 0.45;

const body = PERSON.flatMap((line, y) =>
  [...line].flatMap((cell, x) => (cell === "#" ? [[x, y]] : [])),
);

const logoAt = (turn: number) => {
  const cells: [number, number, number][] = [];
  const step = (Math.PI * 2) / RAYS.length;
  for (let y = -LOGO_SIZE; y <= LOGO_SIZE; y++)
    for (let x = -LOGO_SIZE; x <= LOGO_SIZE; x++) {
      const distance = Math.hypot(x, y);
      if (distance > LOGO_SIZE) continue;
      const angle = Math.atan2(y, x) + turn + Math.PI * 2;
      const ray = Math.round(angle / step);
      const off = Math.abs(angle - ray * step) * distance;
      const reach = RAYS[ray % RAYS.length] * LOGO_SIZE;
      const width = (1 - distance / reach) * 1.5 + 0.45;
      if (distance < 1.8 || (distance < reach && off < width))
        cells.push([x, y, distance]);
    }
  return cells;
};

const logos = Array.from({ length: TURNS }, (_, i) =>
  logoAt(((Math.PI * 2) / RAYS.length) * (i / TURNS)),
);

export default {
  reach: { top: 0.45, right: 0.3, bottom: 0.55, left: 0.3 },
  paint({ cols, rows, gate, seed, colour }) {
    const ink = packed(colour);
    const staff: { x: number; y: number; fired: number; spin: number }[] = [];
    for (let y = 2; y + DOWN <= rows; y += DOWN)
      for (let x = 2; x + ACROSS <= cols; x += ACROSS) {
        const roll = hash(`${seed}:${x}:${y}`);
        staff.push({
          x,
          y,
          fired: 1 + ((roll % 1000) / 1000) * LAST_FIRING,
          spin: roll % TURNS,
        });
      }

    return (pixels, seconds, reveal) => {
      const shift = seconds % SHIFT;
      const put = (left: number, top: number, colourInk: number) => {
        if (left < 0 || top < 0 || left >= cols || top >= rows) return;
        const i = top * cols + left;
        if (gate[i] < reveal && threshold(left, top) < 0.92)
          pixels[i] = colourInk;
      };

      for (const { x, y, fired, spin } of staff) {
        const gone = Math.max(0, shift - fired);
        const fall = Math.floor(gone * gone * GRAVITY);
        if (y + fall < rows)
          for (const [partX, partY] of body)
            for (let dy = 0; dy < SCALE; dy++)
              for (let dx = 0; dx < SCALE; dx++)
                put(x + partX * SCALE + dx, y + fall + partY * SCALE + dy, ink);

        if (!gone) continue;
        const grown = Math.min(1, gone / ARRIVAL);
        const turn = (spin + Math.floor(seconds * 7)) % TURNS;
        for (const [logoX, logoY, distance] of logos[turn])
          if (distance <= grown * LOGO_SIZE)
            put(x + 5 + logoX, y + 7 + logoY, CLAUDE);
      }
    };
  },
} satisfies Effect;
