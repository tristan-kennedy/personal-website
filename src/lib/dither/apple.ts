import { SUN, threshold } from "./index.ts";

export const OUTSIDE = 0;
export const PAPER = 1;
export const INK = 2;
export const SHADOW = 3;

export const START_ANGLE = 0;

type Vec = [number, number, number];

const TAU = Math.PI * 2;

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (v: Vec) => Math.hypot(v[0], v[1], v[2]);
const normalize = (v: Vec): Vec => {
  const l = length(v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: Vec, b: Vec): Vec => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const smoothstep = (lo: number, hi: number, v: number) => {
  const t = clamp((v - lo) / (hi - lo), 0, 1);
  return t * t * (3 - 2 * t);
};

const LEAN_C = Math.cos(0.5);
const LEAN_S = Math.sin(0.5);
const SHOULDER_C = Math.cos(2.5);
const SHOULDER_S = Math.sin(2.5);
const CAVITY = 2 / 0.42 ** 2;
const BASE = 2 / 0.36 ** 2;
const R_MAX = 1.22;
const DRIFT = 0.32;

const falloff = (x: number) => {
  const f = 1 - x / 8;
  if (f <= 0) return 0;
  const f2 = f * f;
  const f4 = f2 * f2;
  return f4 * f4;
};
const hollowTop = (cy: number) => falloff(CAVITY * (1 - cy));
const hollowBase = (cy: number) => falloff(BASE * (1 + cy));

function body(x: number, y: number, z: number) {
  const r = Math.sqrt(x * x + y * y + z * z) || 1e-6;
  const rho = Math.sqrt(x * x + z * z) || 1e-6;
  const cy = y / r;
  const side = rho / r;
  const cu = x / rho;
  const su = z / rho;
  const lean = cu * LEAN_C + su * LEAN_S;
  const shoulder = cu * SHOULDER_C + su * SHOULDER_S;
  const c2 = cu * cu;
  const lobes = cu * (16 * c2 * c2 - 20 * c2 + 5);
  const radius =
    (1 + 0.12 * cy) *
    (1 - (0.42 + 0.1 * lean) * hollowTop(cy) - 0.16 * hollowBase(cy)) *
    (1 + 0.06 * lean * side + 0.05 * shoulder * Math.max(0, cy) * side) *
    (1 + 0.035 * lobes * Math.max(0, -cy) * side);
  return (r - radius) * 0.7;
}

function stemSegment(p: Vec, a: Vec, b: Vec, ra: number, rb: number) {
  const pa: Vec = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const ba: Vec = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1);
  return (
    length([pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h]) -
    (ra + (rb - ra) * h)
  );
}

const STEM_BASE: Vec = [0, 0.5, 0];
const STEM_BEND: Vec = [-0.02, 0.86, 0.01];
const STEM_TIP: Vec = [-0.13, 1.1, 0.03];
const stem = (p: Vec) =>
  Math.min(
    stemSegment(p, STEM_BASE, STEM_BEND, 0.05, 0.04),
    stemSegment(p, STEM_BEND, STEM_TIP, 0.04, 0.03),
  );

const LEAF_ORIGIN: Vec = [-0.03, 0.9, 0.01];
const LEAF_AXIS = normalize([1, 0.1, -0.6]);
const LEAF_SIDE = normalize([0.6, -0.25, 1]);
const LEAF_NORMAL = normalize(cross(LEAF_AXIS, LEAF_SIDE));
const LEAF_HALF = 0.36;
const LEAF_WIDTH = 0.17;

function leafLocal(p: Vec): Vec {
  const q: Vec = [
    p[0] - LEAF_ORIGIN[0],
    p[1] - LEAF_ORIGIN[1],
    p[2] - LEAF_ORIGIN[2],
  ];
  const reach = dot(q, LEAF_AXIS);
  const across = dot(q, LEAF_SIDE);
  const up =
    dot(q, LEAF_NORMAL) + 0.32 * reach * reach - 0.34 * Math.abs(across);
  return [reach - LEAF_HALF, across, up];
}

function leaf(p: Vec) {
  const [x, y, z] = leafLocal(p);
  const t = clamp(x / LEAF_HALF, -1, 1);
  const width = LEAF_WIDTH * (1 - t * t) * (1.15 - 0.35 * t);
  const overshoot = Math.abs(x) - LEAF_HALF;
  const outline =
    overshoot > 0 ? Math.hypot(overshoot, Math.abs(y)) : Math.abs(y) - width;
  return Math.max(outline, Math.abs(z) - 0.014) * 0.6;
}

function crown(
  p: Vec,
  hasStem = true,
  hasLeaf = true,
): [number, "stem" | "leaf"] {
  const s = hasStem ? stem(p) : Infinity;
  const l = hasLeaf ? leaf(p) : Infinity;
  return s <= l ? [s, "stem"] : [l, "leaf"];
}
const crownDistance = (p: Vec) => crown(p)[0];

const STEM_POINTS: Vec[] = [];
for (let k = 0; k <= 8; k++) {
  const h = k / 8;
  for (const [a, b] of [
    [STEM_BASE, STEM_BEND],
    [STEM_BEND, STEM_TIP],
  ])
    STEM_POINTS.push([
      a[0] + (b[0] - a[0]) * h,
      a[1] + (b[1] - a[1]) * h,
      a[2] + (b[2] - a[2]) * h,
    ]);
}
const LEAF_POINTS: Vec[] = [];
for (let a = 0; a <= 10; a++) {
  for (let b = -2; b <= 2; b++) {
    const reach = (a / 10) * 2 * LEAF_HALF;
    const t = reach / LEAF_HALF - 1;
    const across = (b / 2) * LEAF_WIDTH * (1 - t * t) * (1.15 - 0.35 * t);
    const lift = -(0.32 * reach * reach - 0.34 * Math.abs(across));
    LEAF_POINTS.push([
      LEAF_ORIGIN[0] +
        LEAF_AXIS[0] * reach +
        LEAF_SIDE[0] * across +
        LEAF_NORMAL[0] * lift,
      LEAF_ORIGIN[1] +
        LEAF_AXIS[1] * reach +
        LEAF_SIDE[1] * across +
        LEAF_NORMAL[1] * lift,
      LEAF_ORIGIN[2] +
        LEAF_AXIS[2] * reach +
        LEAF_SIDE[2] * across +
        LEAF_NORMAL[2] * lift,
    ]);
  }
}

const LIGHT: Vec = SUN;
const FILL = normalize([0.7, -0.4, -0.6]);
const VIEW: Vec = [0, 0, -1];
const HALF = normalize([LIGHT[0], LIGHT[1], LIGHT[2] - 1]);
const EXTENT = 1.3;
const LIFT = 0.12;

const TILT = -0.34;
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);
const ROLL = -0.16;
const COS_R = Math.cos(ROLL);
const SIN_R = Math.sin(ROLL);
const untilt = (v: Vec): Vec => {
  const x = v[0] * COS_R + v[1] * SIN_R;
  const y = -v[0] * SIN_R + v[1] * COS_R;
  return [x, y * COS_T + v[2] * SIN_T, -y * SIN_T + v[2] * COS_T];
};
const retilt = (v: Vec): Vec => {
  const y = v[1] * COS_T - v[2] * SIN_T;
  const z = v[1] * SIN_T + v[2] * COS_T;
  return [v[0] * COS_R - y * SIN_R, v[0] * SIN_R + y * COS_R, z];
};
const spin = (v: Vec, c: number, s: number): Vec => [
  v[0] * c + v[2] * s,
  v[1],
  -v[0] * s + v[2] * c,
];

const DIR = untilt([0, 0, 1]);

const CROWN_PAD = 0.08;
const CROWN_POINTS = [...STEM_POINTS, ...LEAF_POINTS];
const CROWN_RADIUS =
  Math.max(...CROWN_POINTS.map((p) => Math.hypot(p[0], p[2]))) + CROWN_PAD;
const CROWN_LOW = Math.min(...CROWN_POINTS.map((p) => p[1])) - CROWN_PAD;
const CROWN_HIGH = Math.max(...CROWN_POINTS.map((p) => p[1])) + CROWN_PAD;

function normalAt(f: (p: Vec) => number, p: Vec): Vec {
  const e = 0.004;
  return normalize([
    f([p[0] + e, p[1], p[2]]) - f([p[0] - e, p[1], p[2]]),
    f([p[0], p[1] + e, p[2]]) - f([p[0], p[1] - e, p[2]]),
    f([p[0], p[1], p[2] + e]) - f([p[0], p[1], p[2] - e]),
  ]);
}

const SKIN_W = 512;
const SKIN_H = 192;
let skinTable: Float32Array | null = null;

function hash(n: number) {
  let h = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b);
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function skin() {
  if (skinTable) return skinTable;
  const table = new Float32Array(SKIN_W * SKIN_H);
  const waves = [19, 27, 37, 53, 71, 97].map((f, i) => ({
    f,
    amp: 1 / Math.sqrt(f),
    phase: hash(i) * TAU,
    warp: (hash(i + 20) - 0.5) * 4,
  }));
  for (let row = 0; row < SKIN_H; row++) {
    const phi = ((row + 0.5) / SKIN_H) * Math.PI;
    const band = Math.sin(phi) ** 1.2;
    for (let col = 0; col < SKIN_W; col++) {
      const u = (col / SKIN_W) * TAU;
      let streak = 0;
      for (const w of waves)
        streak += w.amp * Math.sin(w.f * u + w.phase + w.warp * phi);
      const blush = Math.cos(u - 0.6) + 0.4 * Math.cos(2 * u + 1.3);
      table[row * SKIN_W + col] = band * (0.06 * streak + 0.08 * blush);
    }
  }
  for (let i = 0; i < 140; i++) {
    const phi = 0.55 + hash(i * 3 + 101) * 2.1;
    const row = (phi / Math.PI) * SKIN_H;
    const col = hash(i * 3 + 102) * SKIN_W;
    const radius = 0.9 + hash(i * 3 + 103) * 0.9;
    const stretch = 1 / Math.max(0.35, Math.sin(phi)) / 1.34;
    for (let dy = -3; dy <= 3; dy++) {
      for (let dx = -6; dx <= 6; dx++) {
        const r = Math.hypot(dx / stretch, dy) / radius;
        if (r >= 1) continue;
        const y = Math.round(row) + dy;
        if (y < 0 || y >= SKIN_H) continue;
        const x = (((Math.round(col) + dx) % SKIN_W) + SKIN_W) % SKIN_W;
        table[y * SKIN_W + x] -= 0.32 * (1 - r * r);
      }
    }
  }
  skinTable = table;
  return table;
}

type Frame = {
  index: Uint32Array;
  rays: Float32Array;
  enter: Float32Array;
  exit: Float32Array;
  margin: Float32Array;
  near: Float32Array;
  depth: Float32Array;
  slope: Float32Array;
  hits: Uint32Array;
  crownIndex: Uint32Array;
  crownStart: Float32Array;
  crownEnd: Float32Array;
  thresholds: Float32Array;
  out: Uint8Array;
  angle: number;
};
const frames = new Map<number, Frame>();

function span(o: Vec, d: Vec, radius: number): [number, number] | null {
  const b = dot(o, d);
  const disc = b * b - (dot(o, o) - radius * radius);
  if (disc <= 0) return null;
  const root = Math.sqrt(disc);
  return [Math.max(0, -b - root), -b + root];
}

function crownSpan(o: Vec, d: Vec): [number, number] | null {
  const a = d[0] * d[0] + d[2] * d[2];
  const b = 2 * (o[0] * d[0] + o[2] * d[2]);
  const c = o[0] * o[0] + o[2] * o[2] - CROWN_RADIUS * CROWN_RADIUS;
  const disc = b * b - 4 * a * c;
  if (disc <= 0) return null;
  const root = Math.sqrt(disc);
  let start = (-b - root) / (2 * a);
  let end = (-b + root) / (2 * a);
  const y0 = (CROWN_LOW - o[1]) / d[1];
  const y1 = (CROWN_HIGH - o[1]) / d[1];
  start = Math.max(start, Math.min(y0, y1), 0);
  end = Math.min(end, Math.max(y0, y1));
  return start < end ? [start, end] : null;
}

function prepare(size: number): Frame {
  const cached = frames.get(size);
  if (cached) return cached;
  const index: number[] = [];
  const rays: number[] = [];
  const enter: number[] = [];
  const exit: number[] = [];
  const crownIndex: number[] = [];
  const crownStart: number[] = [];
  const crownEnd: number[] = [];
  const thresholds = new Float32Array(size * size);

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = py * size + px;
      thresholds[i] = threshold(px, py);
      const wx = ((px + 0.5) / size - 0.5) * 2 * EXTENT;
      const wy = (0.5 - (py + 0.5) / size) * 2 * EXTENT + LIFT;
      const origin = untilt([wx, wy, -2]);
      const sphere = span(origin, DIR, R_MAX);
      const top = crownSpan(origin, DIR);
      if (!sphere && !top) continue;
      const k = index.length;
      index.push(i);
      rays.push(...origin);
      enter.push(sphere ? sphere[0] : 0);
      exit.push(sphere ? sphere[1] : -1);
      if (top) {
        crownIndex.push(k);
        crownStart.push(top[0]);
        crownEnd.push(top[1]);
      }
    }
  }
  const frame: Frame = {
    index: Uint32Array.from(index),
    rays: Float32Array.from(rays),
    enter: Float32Array.from(enter),
    exit: Float32Array.from(exit),
    margin: new Float32Array(index.length),
    near: new Float32Array(index.length),
    depth: new Float32Array(size * size).fill(-1),
    slope: new Float32Array(size * size),
    hits: new Uint32Array(index.length * 2),
    crownIndex: Uint32Array.from(crownIndex),
    crownStart: Float32Array.from(crownStart),
    crownEnd: Float32Array.from(crownEnd),
    thresholds,
    out: new Uint8Array(size * size),
    angle: NaN,
  };
  frames.set(size, frame);
  return frame;
}

function bodyInk(n: Vec, cy: number) {
  const wrap = clamp((dot(n, LIGHT) + 0.3) / 1.3, 0, 1);
  const fill = Math.max(0, dot(n, FILL));
  const facing = Math.abs(n[2]);
  const edge = (1 - facing) * (1 - facing) * (1 - facing);
  const nh = Math.max(0, dot(n, HALF));
  const nh4 = nh * nh * nh * nh;
  const gloss =
    0.7 * smoothstep(0.972, 0.999, nh) +
    0.22 * nh4 * nh4 * nh4 * nh4 * nh4 * nh4;
  return (
    1.2 -
    0.95 * wrap * wrap -
    0.24 * fill +
    0.4 * edge * (1 - wrap) +
    0.4 * hollowTop(cy) +
    0.25 * hollowBase(cy) -
    1.05 * gloss
  );
}

function crownInk(part: "stem" | "leaf", local: Vec, n: Vec) {
  const lit = dot(n, LIGHT);
  const edge = (1 - Math.abs(dot(n, VIEW))) ** 3;
  if (part === "stem") return 1.05 - 0.7 * Math.max(0, lit) + 0.2 * edge;
  const [x, y] = leafLocal(local);
  const rib = Math.abs(y) < 0.011 ? 0.3 : 0;
  const along = x + LEAF_HALF;
  const vein =
    ((((along - 1.3 * Math.abs(y)) * 11) % 1) + 1) % 1 < 0.13 ? 0.18 : 0;
  return 1.1 - 0.55 * Math.abs(lit) + rib + vein + 0.3 * edge;
}

function screenBox(
  points: Vec[],
  c: number,
  s: number,
  size: number,
  pad: number,
) {
  let x0 = Infinity;
  let x1 = -Infinity;
  let y0 = Infinity;
  let y1 = -Infinity;
  for (const p of points) {
    const v = retilt(spin(p, c, -s));
    const x = (v[0] / (2 * EXTENT) + 0.5) * size;
    const y = (0.5 - (v[1] - LIFT) / (2 * EXTENT)) * size;
    if (x < x0) x0 = x;
    if (x > x1) x1 = x;
    if (y < y0) y0 = y;
    if (y > y1) y1 = y;
  }
  const margin = (pad / (2 * EXTENT)) * size + 1;
  return [x0 - margin, x1 + margin, y0 - margin, y1 + margin];
}
const ROWS = new Uint16Array(2049);
for (let k = 0; k <= 2048; k++)
  ROWS[k] = Math.min(
    SKIN_H - 1,
    Math.floor((Math.acos(k / 1024 - 1) / Math.PI) * SKIN_H),
  );

export function renderApple(size: number, angle: number): Uint8Array {
  const frame = prepare(size);
  if (angle === frame.angle) return frame.out;
  const table = skin();
  const {
    out,
    thresholds,
    index,
    rays,
    enter,
    exit,
    margin,
    near,
    depth,
    slope,
    hits,
  } = frame;
  out.fill(OUTSIDE);

  const turned = Math.abs(angle - frame.angle);
  const fresh = !(turned < 0.2);
  const travel = turned * DRIFT;
  frame.angle = angle;

  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const [dx, dy, dz] = spin(DIR, c, s);

  let hitCount = 0;
  for (let k = 0; k < index.length; k++) {
    const i = index[k];
    const end = exit[k];
    if (end < 0) continue;
    const last = depth[i];
    depth[i] = -1;
    if (!fresh && last < 0 && margin[k] > travel + 0.004) {
      margin[k] -= travel;
      continue;
    }
    const rx = rays[k * 3];
    const rz = rays[k * 3 + 2];
    const ox = rx * c + rz * s;
    const oy = rays[k * 3 + 1];
    const oz = -rx * s + rz * c;

    if (!fresh && last >= 0) {
      const rate = 0.7 * slope[i];
      let t = last;
      for (let step = 0; step < 5; step++) {
        const d = body(ox + dx * t, oy + dy * t, oz + dz * t);
        if (d < 0.0003 && d > -0.0003) {
          depth[i] = t;
          break;
        }
        t += Math.min(0.04, Math.max(-0.04, d / rate));
      }
      if (depth[i] >= 0) {
        hits[hitCount++] = k;
        continue;
      }
    }
    const windowed = !fresh && last < 0;
    let t = windowed ? Math.max(enter[k], near[k] - 0.2) : enter[k];
    const stop = windowed ? Math.min(end, near[k] + 0.2) : end;
    let nearest = Infinity;
    let nearestT = t;
    for (let step = 0; step < 96 && t < stop; step++) {
      const d = body(ox + dx * t, oy + dy * t, oz + dz * t);
      if (d < nearest) {
        nearest = d;
        nearestT = t;
      }
      if (d < 0.0003) {
        depth[i] = t + d;
        break;
      }
      t += d > 0.0012 ? d : 0.0012;
    }
    if (depth[i] < 0) {
      margin[k] = nearest;
      near[k] = nearestT;
    } else {
      hits[hitCount++] = k;
    }
  }

  const step2 = (2 * 2 * EXTENT) / size;

  for (let h = 0; h < hitCount; h++) {
    const k = hits[h];
    const i = index[k];
    const t = depth[i];
    const left = depth[i - 1];
    const right = depth[i + 1];
    const up = depth[i - size];
    const down = depth[i + size];
    const fx =
      left >= 0 && right >= 0
        ? (right - left) / step2
        : right >= 0
          ? (right - t) / (step2 / 2)
          : left >= 0
            ? (t - left) / (step2 / 2)
            : 0;
    const fy =
      up >= 0 && down >= 0
        ? (up - down) / step2
        : up >= 0
          ? (up - t) / (step2 / 2)
          : down >= 0
            ? (t - down) / (step2 / 2)
            : 0;
    const inv = 1 / Math.sqrt(fx * fx + fy * fy + 1);
    const n: Vec = [fx * inv, fy * inv, -inv];
    slope[i] = inv > 0.2 ? inv : 0.2;

    const rx = rays[k * 3];
    const rz = rays[k * 3 + 2];
    const px = rx * c + rz * s + dx * t;
    const py = rays[k * 3 + 1] + dy * t;
    const pz = -rx * s + rz * c + dz * t;
    const cy = py / Math.sqrt(px * px + py * py + pz * pz);
    const col = Math.round((Math.atan2(pz, px) / TAU) * SKIN_W) & (SKIN_W - 1);
    const row = ROWS[Math.round((cy + 1) * 1024)];
    const value = bodyInk(n, cy) + table[row * SKIN_W + col];
    out[i] = value > thresholds[i] ? INK : PAPER;
  }

  const dir: Vec = [dx, dy, dz];
  const { crownIndex, crownStart, crownEnd } = frame;
  const stemBox = screenBox(STEM_POINTS, c, s, size, 0.06);
  const leafBox = screenBox(LEAF_POINTS, c, s, size, 0.04);
  const inside = (box: number[], x: number, y: number) =>
    x >= box[0] && x <= box[1] && y >= box[2] && y <= box[3];
  for (let j = 0; j < crownIndex.length; j++) {
    const k = crownIndex[j];
    const i = index[k];
    const x = i % size;
    const y = (i - x) / size;
    const hasStem = inside(stemBox, x, y);
    const hasLeaf = inside(leafBox, x, y);
    if (!hasStem && !hasLeaf) continue;
    const o = spin([rays[k * 3], rays[k * 3 + 1], rays[k * 3 + 2]], c, s);
    const end = depth[i] >= 0 ? Math.min(crownEnd[j], depth[i]) : crownEnd[j];
    let t = crownStart[j];
    for (let step = 0; step < 40 && t < end; step++) {
      const p: Vec = [o[0] + dir[0] * t, o[1] + dir[1] * t, o[2] + dir[2] * t];
      const [d, part] = crown(p, hasStem, hasLeaf);
      if (d < 0.0015) {
        const n = retilt(spin(normalAt(crownDistance, p), c, -s));
        out[i] = crownInk(part, p, n) > thresholds[i] ? INK : PAPER;
        break;
      }
      t += Math.max(d, 0.002);
    }
  }
  return out;
}

const SHADOW_REACH = 0.075;
const SHADOW_X = -SUN[0] / Math.hypot(SUN[0], SUN[1]);
const SHADOW_Y = SUN[1] / Math.hypot(SUN[0], SUN[1]);

export function castShadow(pixels: Uint8Array, size: number) {
  const sx = Math.round(size * SHADOW_REACH * SHADOW_X);
  const sy = Math.round(size * SHADOW_REACH * SHADOW_Y);
  for (let i = 0; i < pixels.length; i++)
    if (pixels[i] === SHADOW) pixels[i] = OUTSIDE;
  for (let y = sy; y < size; y++) {
    for (let x = sx + ((y + sx) & 1); x < size; x += 2) {
      const i = y * size + x;
      if (pixels[i] !== OUTSIDE) continue;
      const from = pixels[i - sy * size - sx];
      if (from === PAPER || from === INK) pixels[i] = SHADOW;
    }
  }
  return pixels;
}
