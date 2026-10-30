import { SUN, threshold } from "./index.ts";

export const OUTSIDE = 0;
export const DARK = 1;
export const LIGHT = 2;

export const RPM = 100 / 3;
export const START_ANGLE = 2.2;

const RADIUS = 0.98;
const LABEL = 0.34;
const SHEEN = Math.atan2(-SUN[1], SUN[0]) + Math.PI / 2;

function label(r: number, a: number) {
  const t = r / LABEL;
  if (t > 0.93) return 0.25;
  if (t < 0.09) return 0;
  const x = t * Math.cos(a);
  const y = t * Math.sin(a);
  if (y < 0)
    return Math.abs(x) < 0.55 && Math.abs(y + 0.52) < 0.05 ? 0.85 : 0.4;
  if (Math.abs(x) < 0.5 && Math.abs(y - 0.42) < 0.05) return 0.15;
  if (Math.abs(x + 0.1) < 0.36 && Math.abs(y - 0.6) < 0.04) return 0.15;
  return 0.85;
}

function vinyl(r: number, a: number) {
  const t = r / RADIUS;
  if (t > 0.975) return 0.6;
  if (t > 0.95) return 0;
  if ([0.52, 0.66, 0.8].some((g) => Math.abs(t - g) < 0.008)) return 0.32;
  const groove = 0.5 + 0.5 * Math.sin(r * 260);
  const sheen = Math.abs(Math.cos(a - SHEEN)) ** 10;
  return 0.06 + 0.1 * groove + sheen * (0.4 + 0.3 * groove);
}

export function renderRecord(size: number, angle: number): Uint8Array {
  const out = new Uint8Array(size * size);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = ((px + 0.5) / size - 0.5) * 2;
      const y = ((py + 0.5) / size - 0.5) * 2;
      const r = Math.hypot(x, y);
      const a = Math.atan2(y, x);
      if (r >= RADIUS) continue;
      const ink = r < LABEL ? label(r, a - angle) : vinyl(r, a);
      out[py * size + px] = ink > threshold(px, py) ? LIGHT : DARK;
    }
  }
  return out;
}

export const angleAt = (seconds: number) =>
  START_ANGLE + ((seconds * RPM) / 60) * Math.PI * 2;
