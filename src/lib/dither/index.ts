const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

const jitter = (x: number, y: number) => {
  let h = (x * 374761393 + y * 668265263) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};

export const threshold = (x: number, y: number) =>
  BAYER[y & 3][x & 3] * 0.85 + jitter(x, y) * 0.15;

export const SUN = (() => {
  const v = [0.6, 0.7, -0.6];
  const length = Math.hypot(...v);
  return v.map((c) => c / length) as [number, number, number];
})();
