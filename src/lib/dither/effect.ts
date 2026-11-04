import { reducedMotion } from "../motion.ts";
import { readDot } from "./fit.ts";
import { threshold } from "./index.ts";
import type { Rgb } from "./palette.ts";
import { noise } from "./splotch.ts";

const REACH_UNIT = 170;
const SHOWN = 0.72;
const GROW = 420;
const SHRINK = 180;
const FRAME = 33;
const FRAME_SLACK = 6;
const STILL = 6;

export const packed = ([r, g, b]: Rgb) =>
  (255 << 24) | (b << 16) | (g << 8) | r;

export interface Stage {
  cols: number;
  rows: number;
  box: { left: number; top: number; right: number; bottom: number };
  lines: number;
  gate: Float32Array;
  seed: number;
  colour: Rgb;
}

export interface Effect {
  prepare?(): Promise<void>;
  reach: { top: number; right: number; bottom: number; left: number };
  paint(
    stage: Stage,
  ): (pixels: Uint32Array, seconds: number, reveal: number) => void;
}

export const splat: Effect = {
  reach: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
  paint({ cols, rows, gate, seed, colour }) {
    const ink = packed(colour);
    return (pixels, seconds, reveal) => {
      for (let y = 0; y < rows; y++)
        for (let x = 0; x < cols; x++) {
          const i = y * cols + x;
          if (gate[i] >= reveal) continue;
          const boil = noise(x * 0.07, y * 0.07 + seconds * 1.1, seed);
          if (threshold(x, y) < 0.45 + boil * 0.7) pixels[i] = ink;
        }
    };
  },
};

const rough = (x: number, y: number, seed: number) => {
  const lumps = noise(x * 0.035, y * 0.035, seed);
  const flecks = noise(x * 0.14, y * 0.14, seed + 1);
  return Math.min(
    1,
    Math.max(0, (lumps * 0.7 + flecks * 0.3 - 0.5) * 2.4 + 0.5),
  );
};

export const plotter =
  ({ cols, rows, gate }: Stage, pixels: Uint32Array, reveal: number) =>
  (x: number, y: number, ink: number) => {
    const left = Math.round(x);
    const top = Math.round(y);
    if (left < 0 || top < 0 || left >= cols || top >= rows) return;
    const i = top * cols + left;
    if (gate[i] < reveal) pixels[i] = ink;
  };

function gateFor(stage: Omit<Stage, "gate">, pad: Effect["reach"]) {
  const { cols, rows, box, seed } = stage;
  const gate = new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const dx =
        x < box.left
          ? (box.left - x) / pad.left
          : x > box.right
            ? (x - box.right) / pad.right
            : 0;
      const dy =
        y < box.top
          ? (box.top - y) / pad.top
          : y > box.bottom
            ? (y - box.bottom) / pad.bottom
            : 0;
      gate[y * cols + x] =
        Math.hypot(dx, dy) * SHOWN +
        rough(x, y, seed) * 0.42 +
        threshold(x, y) * 0.08;
    }
  return gate;
}

function slideBetween(from: Element, to: Element) {
  let x = 0;
  let y = 0;
  for (let at = from.parentElement; at && at !== to; at = at.parentElement) {
    const [dx = "0", dy = "0"] = getComputedStyle(at).translate.split(" ");
    x += parseFloat(dx) || 0;
    y += parseFloat(dy) || 0;
  }
  return { x, y };
}

function linesIn(element: Element) {
  const range = document.createRange();
  range.selectNodeContents(element);
  const tops = new Set(
    [...range.getClientRects()]
      .filter((rect) => rect.width)
      .map((rect) => Math.round(rect.top)),
  );
  return Math.max(1, tops.size);
}

export function openEffect(
  row: HTMLElement,
  title: Element,
  effect: Effect,
  colour: Rgb,
  seed: number,
) {
  const dot = readDot(row);
  const place = row.getBoundingClientRect();
  const sliding = slideBetween(title, row);
  const measured = title.getBoundingClientRect();
  const rect = {
    left: measured.left - sliding.x,
    top: measured.top - sliding.y,
    width: measured.width,
    height: measured.height,
  };
  const unit = Math.min(rect.height, REACH_UNIT) / dot;
  const pad = {
    top: Math.max(1, Math.ceil(unit * effect.reach.top)),
    right: Math.max(1, Math.ceil(unit * effect.reach.right)),
    bottom: Math.max(1, Math.ceil(unit * effect.reach.bottom)),
    left: Math.max(1, Math.ceil(unit * effect.reach.left)),
  };
  const wide = Math.ceil(rect.width / dot);
  const tall = Math.ceil(rect.height / dot);
  const shape = {
    cols: pad.left + wide + pad.right,
    rows: pad.top + tall + pad.bottom,
    box: {
      left: pad.left,
      top: pad.top,
      right: pad.left + wide,
      bottom: pad.top + tall,
    },
    lines: linesIn(title),
    seed,
    colour,
  };

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = shape.cols;
  canvas.height = shape.rows;
  canvas.className = "pointer-events-none absolute z-0";
  canvas.style.cssText = `left:${rect.left - place.left - pad.left * dot}px;top:${rect.top - place.top - pad.top * dot}px;width:${shape.cols * dot}px;height:${shape.rows * dot}px;max-width:none;image-rendering:pixelated`;
  row.append(canvas);

  const context = canvas.getContext("2d")!;
  const image = context.createImageData(shape.cols, shape.rows);
  const pixels = new Uint32Array(image.data.buffer);
  const paint = effect.paint({ ...shape, gate: gateFor(shape, pad) });
  const render = (seconds: number, reveal: number) => {
    pixels.fill(0);
    paint(pixels, seconds, reveal);
    context.putImageData(image, 0, 0);
  };

  if (reducedMotion().matches) {
    render(STILL, SHOWN);
    return () => canvas.remove();
  }

  let target = SHOWN;
  let reveal = 0;
  let seconds = 0;
  let last = performance.now();
  const step = (now: number) => {
    const elapsed = now - last;
    if (elapsed >= FRAME - FRAME_SLACK) {
      last = now;
      const moment = Math.min(elapsed, 50);
      seconds += moment / 1000;
      reveal = target
        ? Math.min(target, reveal + (moment / GROW) * SHOWN)
        : Math.max(0, reveal - (moment / SHRINK) * SHOWN);
      render(seconds, reveal);
      if (!target && !reveal) {
        canvas.remove();
        return;
      }
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
  return () => {
    target = 0;
  };
}
