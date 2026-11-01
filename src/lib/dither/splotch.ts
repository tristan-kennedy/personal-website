import { threshold } from "./index.ts";

const STEP = 8;
const THRESHOLD_SHARE = 0.3;

const lattice = (x: number, y: number, seed: number) => {
  let h = (x * 374761393 + y * 668265263 + seed) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

const smooth = (t: number) => t * t * (3 - 2 * t);

export function noise(x: number, y: number, seed: number) {
  const cellX = Math.floor(x);
  const cellY = Math.floor(y);
  const u = smooth(x - cellX);
  const v = smooth(y - cellY);
  const top =
    lattice(cellX, cellY, seed) * (1 - u) + lattice(cellX + 1, cellY, seed) * u;
  const bottom =
    lattice(cellX, cellY + 1, seed) * (1 - u) +
    lattice(cellX + 1, cellY + 1, seed) * u;
  return top * (1 - v) + bottom * v;
}

export function splotch(
  cols: number,
  rows: number,
  originX: number,
  originY: number,
  seed: number,
) {
  const far = Math.hypot(
    Math.max(originX, cols - originX),
    Math.max(originY, rows - originY),
  );
  const wide = Math.ceil(cols / STEP) + 2;
  const tall = Math.ceil(rows / STEP) + 2;
  const coarse = new Float32Array(wide * tall);
  const phase = (seed % 628) / 100;
  for (let gridY = 0; gridY < tall; gridY++) {
    for (let gridX = 0; gridX < wide; gridX++) {
      const dx = gridX * STEP - originX;
      const dy = gridY * STEP - originY;
      const angle = Math.atan2(dy, dx);
      const lobes =
        1 +
        0.2 * Math.sin(3 * angle + phase) +
        0.12 * Math.sin(5 * angle + phase * 2) +
        0.05 * Math.sin(9 * angle + phase * 3);
      const wobble =
        noise(
          (gridX * STEP) / (far * 0.16),
          (gridY * STEP) / (far * 0.16),
          seed,
        ) - 0.5;
      coarse[gridY * wide + gridX] = Math.min(
        1,
        Math.max(0, Math.hypot(dx, dy) / far / lobes + wobble * 0.2),
      );
    }
  }

  const order = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    const gridY = Math.floor(y / STEP);
    const v = y / STEP - gridY;
    for (let x = 0; x < cols; x++) {
      const gridX = Math.floor(x / STEP);
      const u = x / STEP - gridX;
      const at = gridY * wide + gridX;
      const field =
        (coarse[at] * (1 - u) + coarse[at + 1] * u) * (1 - v) +
        (coarse[at + wide] * (1 - u) + coarse[at + wide + 1] * u) * v;
      order[y * cols + x] =
        field * (1 - THRESHOLD_SHARE) + threshold(x, y) * THRESHOLD_SHARE;
    }
  }
  return order;
}
