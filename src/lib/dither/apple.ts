import { SUN, threshold } from "./index.ts";

export const OUTSIDE = 0;
export const PAPER = 1;
export const INK = 2;

export const START_ANGLE = 0;

type Vec = [number, number, number];

const dot = (a: Vec, b: Vec) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const length = (v: Vec) => Math.hypot(v[0], v[1], v[2]);
const normalize = (v: Vec): Vec => {
  const l = length(v) || 1;
  return [v[0] / l, v[1] / l, v[2] / l];
};
const clamp = (v: number, lo: number, hi: number) =>
  Math.min(hi, Math.max(lo, v));
const bump = (x: number, width: number) => Math.exp(-((x / width) ** 2));

function body(p: Vec) {
  const r = length(p) || 1e-6;
  const phi = Math.acos(clamp(p[1] / r, -1, 1));
  const radius =
    (1 + 0.13 * Math.cos(phi)) *
    (1 - 0.5 * bump(phi, 0.48) - 0.2 * bump(Math.PI - phi, 0.42));
  return (r - radius) * 0.7;
}

function capsule(p: Vec, a: Vec, b: Vec, radius: number) {
  const pa: Vec = [p[0] - a[0], p[1] - a[1], p[2] - a[2]];
  const ba: Vec = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
  const h = clamp(dot(pa, ba) / dot(ba, ba), 0, 1);
  return (
    length([pa[0] - ba[0] * h, pa[1] - ba[1] * h, pa[2] - ba[2] * h]) - radius
  );
}

const STEM_BASE: Vec = [0, 0.38, 0];
const STEM_TIP: Vec = [-0.12, 1.06, 0.02];

const LEAF_ORIGIN: Vec = [-0.06, 0.84, 0];
const LEAF_AXIS = normalize([1, 0.3, -0.55]);
const LEAF_SIDE = normalize([0.55, -0.2, 1]);
const LEAF_NORMAL = normalize([
  LEAF_AXIS[1] * LEAF_SIDE[2] - LEAF_AXIS[2] * LEAF_SIDE[1],
  LEAF_AXIS[2] * LEAF_SIDE[0] - LEAF_AXIS[0] * LEAF_SIDE[2],
  LEAF_AXIS[0] * LEAF_SIDE[1] - LEAF_AXIS[1] * LEAF_SIDE[0],
]);
function leafLocal(p: Vec): Vec {
  const q: Vec = [
    p[0] - LEAF_ORIGIN[0],
    p[1] - LEAF_ORIGIN[1],
    p[2] - LEAF_ORIGIN[2],
  ];
  const along = dot(q, LEAF_AXIS) - 0.34;
  const across = dot(q, LEAF_SIDE);
  const up = dot(q, LEAF_NORMAL) + 0.9 * (along + 0.34) ** 2 * 0.5;
  return [along, across, up];
}
function leaf(p: Vec) {
  const [x, y, z] = leafLocal(p);
  const r: Vec = [0.36, 0.16, 0.014];
  const k0 = Math.hypot(x / r[0], y / r[1], z / r[2]);
  const k1 = Math.hypot(
    x / (r[0] * r[0]),
    y / (r[1] * r[1]),
    z / (r[2] * r[2]),
  );
  return (k0 * (k0 - 1)) / (k1 || 1e-6);
}

function crown(p: Vec): [number, "stem" | "leaf"] {
  const s = capsule(p, STEM_BASE, STEM_TIP, 0.045);
  const l = leaf(p) * 0.8;
  return s <= l ? [s, "stem"] : [l, "leaf"];
}

const LIGHT: Vec = SUN;
const VIEW: Vec = [0, 0, -1];
const HALF = normalize([LIGHT[0], LIGHT[1], LIGHT[2] - 1]);
const EXTENT = 1.3;

const TILT = 0.12;
const COS_T = Math.cos(TILT);
const SIN_T = Math.sin(TILT);
const ROLL = -0.28;
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

const pixelRay = (px: number, py: number, size: number) => {
  const wx = ((px + 0.5) / size - 0.5) * 2 * EXTENT;
  const wy = (0.5 - (py + 0.5) / size) * 2 * EXTENT + 0.16;
  return { wx, wy, origin: untilt([wx, wy, -2]) };
};
const DIR = untilt([0, 0, 1]);
const BOUND = 1.16;

function normalAt(f: (p: Vec) => number, p: Vec): Vec {
  const e = 0.004;
  return normalize([
    f([p[0] + e, p[1], p[2]]) - f([p[0] - e, p[1], p[2]]),
    f([p[0], p[1] + e, p[2]]) - f([p[0], p[1] - e, p[2]]),
    f([p[0], p[1], p[2] + e]) - f([p[0], p[1], p[2] - e]),
  ]);
}

type BodyHit = { t: number; point: Vec; normal: Vec } | null;
const bodyCache = new Map<number, BodyHit[]>();

function bodyHits(size: number) {
  const cached = bodyCache.get(size);
  if (cached) return cached;
  const hits: BodyHit[] = new Array(size * size).fill(null);
  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const { wx, wy, origin } = pixelRay(px, py, size);
      if (wx * wx + wy * wy > BOUND * BOUND) continue;
      let t = 0;
      let nearestD = Infinity;
      let nearestT = 0;
      for (let i = 0; i < 160 && t < 4; i++) {
        const p: Vec = [
          origin[0] + DIR[0] * t,
          origin[1] + DIR[1] * t,
          origin[2] + DIR[2] * t,
        ];
        const d = body(p);
        if (d < nearestD) {
          nearestD = d;
          nearestT = t;
        }
        if (d < 0.0015) break;
        t += Math.max(d, 0.002);
      }
      if (nearestD < 0.01) {
        const point: Vec = [
          origin[0] + DIR[0] * nearestT,
          origin[1] + DIR[1] * nearestT,
          origin[2] + DIR[2] * nearestT,
        ];
        hits[py * size + px] = {
          t: nearestT,
          point,
          normal: retilt(normalAt(body, point)),
        };
      }
    }
  }
  bodyCache.set(size, hits);
  return hits;
}

export function renderApple(size: number, angle: number): Uint8Array {
  const out = new Uint8Array(size * size);
  const hits = bodyHits(size);
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const dir = spin(DIR, c, s);
  const crownDistance = (p: Vec) => crown(p)[0];

  for (let py = 0; py < size; py++) {
    for (let px = 0; px < size; px++) {
      const i = py * size + px;
      const { wx, wy, origin } = pixelRay(px, py, size);
      if (wx * wx + wy * wy > BOUND * BOUND) continue;
      const bodyHit = hits[i];

      let part: "body" | "stem" | "leaf" | null = bodyHit ? "body" : null;
      let point: Vec | null = null;
      const ux = wx * COS_R + wy * SIN_R;
      const uy = -wx * SIN_R + wy * COS_R;
      if (uy > 0.25 && Math.abs(ux) < 0.8) {
        const o = spin(origin, c, s);
        const limit = bodyHit ? bodyHit.t : 4;
        let t = 0;
        for (let step = 0; step < 48 && t < limit; step++) {
          const p: Vec = [
            o[0] + dir[0] * t,
            o[1] + dir[1] * t,
            o[2] + dir[2] * t,
          ];
          const [d, which] = crown(p);
          if (d < 0.0015) {
            part = which;
            point = p;
            break;
          }
          t += Math.max(d, 0.002);
        }
      }
      if (!part) continue;

      let ink: number;
      if (part === "body") {
        const n = bodyHit!.normal;
        const diffuse = Math.max(0, dot(n, LIGHT));
        const edge = (1 - Math.abs(dot(n, VIEW))) ** 3;
        const gloss = Math.max(0, dot(n, HALF)) ** 90;
        const q = spin(bodyHit!.point, c, s);
        const u = Math.atan2(q[2], q[0]);
        const streak = 0.5 + 0.5 * Math.sin(u * 13 + 2.2 * Math.sin(u * 3));
        const lobe = 0.08 * Math.cos(5 * u) * Math.max(0, -q[1]);
        const underside = 0.5 * Math.max(0, -n[1]);
        ink =
          0.95 -
          0.8 * diffuse +
          0.14 * streak +
          lobe +
          underside +
          0.55 * edge -
          0.9 * gloss;
      } else {
        const local = normalAt(crownDistance, point!);
        const n = retilt(spin(local, c, -s));
        const diffuse = Math.abs(dot(n, LIGHT));
        const edge = (1 - Math.abs(dot(n, VIEW))) ** 3;
        if (part === "leaf") {
          const rib = Math.abs(leafLocal(point!)[1]) < 0.012 ? 0.35 : 0;
          ink = 0.82 - 0.45 * diffuse + rib + 0.3 * edge;
        } else {
          ink = 0.92;
        }
      }
      out[i] = ink > threshold(px, py) ? INK : PAPER;
    }
  }
  return out;
}
