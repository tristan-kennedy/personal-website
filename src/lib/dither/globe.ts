import { SUN, threshold } from "./index.ts";
import { now } from "../site.ts";
import { LAND_BITS, LAND_HEIGHT, LAND_WIDTH } from "./land-mask.ts";

export const HOME = now.coordinates;
export const START_LON = HOME.lon + 16;

const TILT = (-24 * Math.PI) / 180;
const LIGHT = [SUN[0], SUN[1], -SUN[2]];

const land = (() => {
  const raw =
    typeof atob === "function"
      ? Uint8Array.from(atob(LAND_BITS), (c) => c.charCodeAt(0))
      : Uint8Array.from(Buffer.from(LAND_BITS, "base64"));
  return (lat: number, lon: number) => {
    const x = Math.floor(
      (((((lon + 180) % 360) + 360) % 360) / 360) * LAND_WIDTH,
    );
    const y = Math.min(
      LAND_HEIGHT - 1,
      Math.floor(((90 - lat) / 180) * LAND_HEIGHT),
    );
    const i = y * LAND_WIDTH + x;
    return (raw[i >> 3] >> (i & 7)) & 1;
  };
})();

const near = (value: number, step: number, width: number) => {
  const m = ((value % step) + step) % step;
  return m < width || m > step - width;
};
const toRad = (deg: number) => (deg * Math.PI) / 180;
const toDeg = (rad: number) => (rad * 180) / Math.PI;

export function renderGlobe(size: number, centerLon: number): Uint8Array {
  const out = new Uint8Array(size * size);
  const radius = size / 2 - 1;
  const cosT = Math.cos(TILT);
  const sinT = Math.sin(TILT);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const x = (px + 0.5 - size / 2) / radius;
      const y = (size / 2 - py - 0.5) / radius;
      const r2 = x * x + y * y;
      if (r2 > 1) continue;
      const z = Math.sqrt(1 - r2);

      const gy = y * cosT - z * sinT;
      const gz = y * sinT + z * cosT;
      const lat = toDeg(Math.asin(Math.max(-1, Math.min(1, gy))));
      const lon = centerLon + toDeg(Math.atan2(x, gz));

      const isLand = land(lat, lon);
      const graticule =
        !isLand &&
        (near(lat, 30, 0.9) ||
          (Math.abs(lat) < 75 &&
            near(lon, 30, 0.9 / Math.max(0.25, Math.cos(toRad(lat))))));

      const diffuse = Math.max(0, x * LIGHT[0] + y * LIGHT[1] + z * LIGHT[2]);
      const base = isLand ? 0.95 : graticule ? 0.3 : 0.08;
      const rim = Math.max(0, (Math.sqrt(r2) - 0.9) / 0.1) ** 2 * 0.3;
      const value = base * (0.18 + 0.82 * diffuse) + rim;

      out[py * size + px] = value > threshold(px, py) ? 1 : 0;
    }
  }

  drawHome(out, size, radius, centerLon, cosT, sinT);
  return out;
}

function drawHome(
  out: Uint8Array,
  size: number,
  radius: number,
  centerLon: number,
  cosT: number,
  sinT: number,
) {
  const lat = toRad(HOME.lat);
  const lon = toRad(HOME.lon - centerLon);
  const gx = Math.cos(lat) * Math.sin(lon);
  const gy = Math.sin(lat);
  const gz = Math.cos(lat) * Math.cos(lon);
  const y = gy * cosT + gz * sinT;
  const z = -gy * sinT + gz * cosT;
  if (z < 0.15) return;

  const cx = Math.round(size / 2 + gx * radius - 0.5);
  const cy = Math.round(size / 2 - y * radius - 0.5);
  const set = (x: number, y: number, ink: number) => {
    if (x >= 0 && y >= 0 && x < size && y < size) out[y * size + x] = ink;
  };
  const dot = Math.max(2, size / 70);
  for (let dy = -Math.ceil(dot); dy <= dot; dy++) {
    for (let dx = -Math.ceil(dot); dx <= dot; dx++) {
      if (dx * dx + dy * dy <= dot * dot) set(cx + dx, cy + dy, 0);
    }
  }
}
