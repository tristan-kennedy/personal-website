import { packed, type Effect } from "../../lib/dither/effect";
import { threshold } from "../../lib/dither/index";

const DIM = packed([0x2e, 0x38, 0x10]);
const MID = packed([0x6f, 0x8f, 0x1c]);
const HOT = packed([0xf6, 0xff, 0xd8]);
const BAR = packed([0x8a, 0x88, 0x7c]);

const RAYS = 240;
const RADIUS = 70;
const DRIFT = 11;
const LIGHT_RADIUS = 3;
const HOME = { across: 0.8, down: 0.5 };
const DESIGNED_FOR = 120;
const BARS = [
  [-30, -24, -9, -33],
  [24, -22, 33, 8],
  [-20, 25, 10, 33],
  [-40, 6, -33, 18],
];

export default {
  reach: { top: 0.9, right: 1.2, bottom: 0.9, left: 0.4 },
  paint({ cols, rows, box, gate, colour }) {
    const ramp = [DIM, MID, packed(colour), HOT];
    const last = ramp.length - 1;
    const homeX = box.left + (box.right - box.left) * HOME.across;
    const homeY = box.top + (box.bottom - box.top) * HOME.down;
    const scale = Math.max(1, (box.bottom - box.top) / DESIGNED_FOR);
    const radius = RADIUS * scale;
    const drift = DRIFT * scale;
    const walls = BARS.map(([x0, y0, x1, y1]) => [
      homeX + x0 * scale,
      homeY + y0 * scale,
      homeX + x1 * scale,
      homeY + y1 * scale,
    ]);
    const hits = new Float32Array(RAYS);

    const nearestHit = (x: number, y: number, dirX: number, dirY: number) => {
      let nearest = radius;
      for (const [x0, y0, x1, y1] of walls) {
        const wallX = x1 - x0;
        const wallY = y1 - y0;
        const cross = dirX * wallY - dirY * wallX;
        if (!cross) continue;
        const along = ((x0 - x) * wallY - (y0 - y) * wallX) / cross;
        const across = ((x0 - x) * dirY - (y0 - y) * dirX) / cross;
        if (along > 0 && across >= 0 && across <= 1 && along < nearest)
          nearest = along;
      }
      return nearest;
    };

    return (pixels, seconds, reveal) => {
      const lightX = homeX + Math.sin(seconds * 0.7) * drift;
      const lightY = homeY + Math.sin(seconds * 1.1 + 1) * drift * 0.7;
      for (let i = 0; i < RAYS; i++) {
        const angle = (i / RAYS) * Math.PI * 2;
        hits[i] = nearestHit(lightX, lightY, Math.cos(angle), Math.sin(angle));
      }

      const top = Math.max(0, Math.floor(lightY - radius));
      const bottom = Math.min(rows, Math.ceil(lightY + radius));
      const left = Math.max(0, Math.floor(lightX - radius));
      const right = Math.min(cols, Math.ceil(lightX + radius));
      for (let y = top; y < bottom; y++)
        for (let x = left; x < right; x++) {
          const i = y * cols + x;
          if (gate[i] >= reveal) continue;
          const away = Math.hypot(x - lightX, y - lightY);
          const angle = Math.atan2(y - lightY, x - lightX) + Math.PI * 2;
          const ray = Math.floor((angle / (Math.PI * 2)) * RAYS) % RAYS;
          if (away > hits[ray]) continue;
          if (away < LIGHT_RADIUS * scale) {
            pixels[i] = HOT;
            continue;
          }
          const tone = (1 - away / radius) ** 1.4 * (last + 1) - 0.4;
          if (tone < 0) continue;
          const low = Math.floor(tone);
          const step = tone - low > threshold(x, y) ? 1 : 0;
          pixels[i] = ramp[Math.min(last, low + step)];
        }

      for (const [x0, y0, x1, y1] of walls) {
        const length = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
        for (let step = 0; step <= length; step++) {
          const x = Math.round(x0 + ((x1 - x0) * step) / length);
          const y = Math.round(y0 + ((y1 - y0) * step) / length);
          if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
          const i = y * cols + x;
          if (gate[i] < reveal) pixels[i] = BAR;
        }
      }
    };
  },
} satisfies Effect;
