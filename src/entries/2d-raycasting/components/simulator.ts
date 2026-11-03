import { packed } from "../../../lib/dither/effect";
import { readDot } from "../../../lib/dither/fit";
import { threshold } from "../../../lib/dither/index";
import { reducedMotion } from "../../../lib/motion";

const RAMP = (
  [
    [0x14, 0x14, 0x12],
    [0x2e, 0x38, 0x10],
    [0x6f, 0x8f, 0x1c],
    [0xc8, 0xff, 0x3a],
    [0xf6, 0xff, 0xd8],
  ] as const
).map(([r, g, b]) => packed([r, g, b]));
const LAST_STEP = RAMP.length - 1;
const GROUND = RAMP[0];
const WALL = packed([0x4d, 0x4b, 0x44]);
const BAR = packed([0x5a, 0x58, 0x4e]);
const LIT_WALL = packed([0xf2, 0xf0, 0xe9]);
const RAY = packed([0x8f, 0xb8, 0x2a]);
const RIM = packed([0x6f, 0x8f, 0x1c]);
const CHARCOAL = packed([0x29, 0x28, 0x24]);

const TAU = Math.PI * 2;
const TAU_SCALE = 1 / TAU;
const GLOW_STEPS = 16;
const SOLID_ALPHA = 110;
const TITLE = 1;
const BARRIER = 2;
const TEXT_BLOCK = 3;
const BLOCK_PADDING = 14;
const FADE_PX = 170;
const BAR_THICK = 3;
const GRAB_REACH = 6;
const RAYS_DRAWN = 140;
const LIGHT_RADIUS = 3;
const REACH_SHARE = 0.72;
const FOLLOW = 0.16;
const IDLE_MS = 3500;
const ARROW_STEP = 6;
const WANDER_SPEED = 0.17;
const STILL_SPOT = { x: 0.78, y: 0.2 };

const STARTING_BARS = [
  { a: [0.1, 0.14], b: [0.22, 0.2] },
  { a: [0.5, 0.12], b: [0.5, 0.25] },
  { a: [0.84, 0.72], b: [0.94, 0.84] },
  { a: [0.3, 0.8], b: [0.46, 0.76] },
  { a: [0.1, 1.22], b: [0.28, 1.3] },
  { a: [0.36, 1.45], b: [0.36, 1.62] },
];

type Bar = { x0: number; y0: number; x1: number; y1: number };

const turn = (y: number, x: number) => {
  const acrossX = Math.abs(x);
  const acrossY = Math.abs(y);
  const wide = Math.max(acrossX, acrossY);
  const slope = wide ? Math.min(acrossX, acrossY) / wide : 0;
  const square = slope * slope;
  let angle =
    slope *
    (0.99997726 +
      square *
        (-0.33262347 +
          square *
            (0.19354346 +
              square *
                (-0.11643287 + square * (0.05265332 + square * -0.0117212)))));
  if (acrossY > acrossX) angle = Math.PI / 2 - angle;
  if (x < 0) angle = Math.PI - angle;
  return y < 0 ? TAU - angle : angle;
};

export const startSimulator = async () => {
  const stage = document.querySelector<HTMLElement>("[data-stage]")!;
  const canvas = stage.querySelector("canvas")!;
  const blocks = stage.querySelectorAll<HTMLElement>("[data-block]");
  const controls = stage.querySelector<HTMLElement>("[data-controls]")!;
  const slider = stage.querySelector<HTMLInputElement>("[data-rays]")!;
  const count = stage.querySelector<HTMLElement>("[data-count]")!;
  const showRays = stage.querySelector<HTMLInputElement>("[data-show-rays]")!;
  const reset = stage.querySelector<HTMLButtonElement>("[data-reset]")!;
  const context = canvas.getContext("2d")!;
  const still = reducedMotion().matches;

  await document.fonts.ready;

  let dot = 3;
  let cols = 0;
  let rows = 0;
  let title = new Uint8Array(0);
  let solid = new Uint8Array(0);
  let litFrame = new Uint32Array(0);
  let thresholds = new Float32Array(0);
  let tones = new Float32Array(0);
  let tonesReach = 0;
  let image: ImageData;
  let pixels = new Uint32Array(0);
  let bars: Bar[] = [];
  const hits = new Float32Array(Number(slider.max));
  const nearness = new Float32Array(hits.length);
  let frame = 0;
  let dirty = true;
  let onScreen = true;

  const light = { x: 0, y: 0 };
  const target = { x: 0, y: 0 };
  let inHand = false;
  let lastHand = -Infinity;
  let grabbed: { bar: Bar; x: number; y: number } | undefined;

  const stamp = (bar: Bar) => {
    const length = Math.ceil(Math.hypot(bar.x1 - bar.x0, bar.y1 - bar.y0));
    for (let step = 0; step <= length; step++) {
      const share = step / Math.max(1, length);
      const x = Math.round(bar.x0 + (bar.x1 - bar.x0) * share);
      const y = Math.round(bar.y0 + (bar.y1 - bar.y0) * share);
      for (let down = 0; down < BAR_THICK; down++)
        for (let over = 0; over < BAR_THICK; over++) {
          const cellX = x + over - 1;
          const cellY = y + down - 1;
          if (cellX < 0 || cellY < 0 || cellX >= cols || cellY >= rows)
            continue;
          const cell = cellY * cols + cellX;
          if (title[cell] !== TEXT_BLOCK) solid[cell] = BARRIER;
        }
    }
  };

  const composeWalls = () => {
    solid.set(title);
    bars.forEach(stamp);
    dirty = true;
  };

  const viewRows = () => innerHeight / dot;
  const firstRow = () =>
    Math.max(0, Math.floor(-stage.getBoundingClientRect().top / dot));

  const placeBars = () => {
    const tall = viewRows();
    bars = STARTING_BARS.map(({ a, b }) => ({
      x0: a[0] * cols,
      y0: a[1] * tall,
      x1: b[0] * cols,
      y1: b[1] * tall,
    }));
  };

  const readTextBlocks = () => {
    const origin = stage.getBoundingClientRect();
    blocks.forEach((block) => {
      const box = block.getBoundingClientRect();
      const left = Math.floor((box.left - origin.left - BLOCK_PADDING) / dot);
      const right = Math.ceil((box.right - origin.left + BLOCK_PADDING) / dot);
      const top = Math.floor((box.top - origin.top - BLOCK_PADDING) / dot);
      const bottom = Math.ceil((box.bottom - origin.top + BLOCK_PADDING) / dot);
      for (let y = Math.max(0, top); y < Math.min(rows, bottom); y++)
        for (let x = Math.max(0, left); x < Math.min(cols, right); x++)
          title[y * cols + x] = TEXT_BLOCK;
    });
  };

  const readTitle = () => {
    const ink = document.createElement("canvas");
    ink.width = cols;
    ink.height = rows;
    const pen = ink.getContext("2d", { willReadFrequently: true })!;
    pen.scale(1 / dot, 1 / dot);
    pen.fillStyle = "#fff";
    pen.textBaseline = "alphabetic";
    const origin = stage.getBoundingClientRect();
    stage.querySelectorAll<HTMLElement>("[data-wall]").forEach((line) => {
      const style = getComputedStyle(line);
      pen.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      pen.letterSpacing = style.letterSpacing;
      const box = line.getBoundingClientRect();
      if (!box.width) return;
      const { fontBoundingBoxAscent: up, fontBoundingBoxDescent: down } =
        pen.measureText("H");
      const baseline = box.top + (box.height - (up + down)) / 2 + up;
      pen.fillText(
        line.textContent!.trim().toUpperCase(),
        box.left - origin.left,
        baseline - origin.top,
      );
    });
    const { data } = pen.getImageData(0, 0, cols, rows);
    for (let i = 0; i < title.length; i++)
      title[i] = data[i * 4 + 3] > SOLID_ALPHA ? TITLE : 0;
  };

  const fit = () => {
    dot = readDot(stage);
    const nextCols = Math.ceil(stage.clientWidth / dot);
    const nextRows = Math.ceil(stage.clientHeight / dot);
    if (nextCols === cols && nextRows === rows) return;
    cols = nextCols;
    rows = nextRows;
    canvas.width = cols;
    canvas.height = rows;
    title = new Uint8Array(cols * rows);
    solid = new Uint8Array(cols * rows);
    litFrame = new Uint32Array(cols * rows);
    thresholds = new Float32Array(cols * rows);
    for (let y = 0; y < rows; y++)
      for (let x = 0; x < cols; x++) thresholds[y * cols + x] = threshold(x, y);
    image = context.createImageData(cols, rows);
    pixels = new Uint32Array(image.data.buffer);
    readTitle();
    readTextBlocks();
    placeBars();
    composeWalls();
    target.x = light.x = STILL_SPOT.x * cols;
    target.y = light.y = STILL_SPOT.y * viewRows();
  };

  const castRay = (angle: number, index: number) => {
    const dirX = Math.cos(angle) || 1e-9;
    const dirY = Math.sin(angle) || 1e-9;
    let cellX = Math.floor(light.x);
    let cellY = Math.floor(light.y);
    const stepX = dirX > 0 ? 1 : -1;
    const stepY = dirY > 0 ? 1 : -1;
    const deltaX = Math.abs(1 / dirX);
    const deltaY = Math.abs(1 / dirY);
    let nextX = (dirX > 0 ? cellX + 1 - light.x : light.x - cellX) * deltaX;
    let nextY = (dirY > 0 ? cellY + 1 - light.y : light.y - cellY) * deltaY;
    let travelled = 0;
    let clear = false;

    for (;;) {
      if (nextX < nextY) {
        travelled = nextX;
        nextX += deltaX;
        cellX += stepX;
      } else {
        travelled = nextY;
        nextY += deltaY;
        cellY += stepY;
      }
      if (cellX < 0 || cellY < 0 || cellX >= cols || cellY >= rows) break;
      const cell = cellY * cols + cellX;
      if (!solid[cell]) clear = true;
      else if (clear) {
        litFrame[cell] = frame;
        break;
      }
    }
    hits[index] = Math.max(travelled, 0.001);
    nearness[index] = 1 / hits[index];
  };

  const render = () => {
    frame++;
    const rayCount = Number(slider.value);
    const step = TAU / rayCount;
    for (let i = 0; i < rayCount; i++) castRay(i * step, i);

    const reach = Math.hypot(cols, viewRows()) * REACH_SHARE;
    if (reach !== tonesReach) {
      tonesReach = reach;
      tones = new Float32Array(Math.ceil(reach * GLOW_STEPS) + 1);
      for (let i = 0; i < tones.length; i++)
        tones[i] = Math.max(0, 1 - i / GLOW_STEPS / reach) ** 2.1 * LAST_STEP;
    }
    const reachSquared = reach * reach;
    const perAngle = rayCount * TAU_SCALE;
    const top = firstRow();
    const bottom = Math.min(rows, Math.ceil(top + viewRows()) + 1);
    const fadeLength = FADE_PX / dot;
    const fadeFrom = rows - fadeLength;
    for (let y = top; y < bottom; y++) {
      const offsetY = y + 0.5 - light.y;
      const offsetYSquared = offsetY * offsetY;
      for (let x = 0; x < cols; x++) {
        const cell = y * cols + x;
        const kind = solid[cell];
        if (kind) {
          const lit = litFrame[cell] === frame;
          pixels[cell] =
            kind === TEXT_BLOCK
              ? lit
                ? RIM
                : GROUND
              : lit
                ? LIT_WALL
                : kind === BARRIER
                  ? BAR
                  : WALL;
          continue;
        }
        const offsetX = x + 0.5 - light.x;
        const distanceSquared = offsetX * offsetX + offsetYSquared;
        if (distanceSquared >= reachSquared) {
          pixels[cell] = GROUND;
          continue;
        }
        const distance = Math.sqrt(distanceSquared);
        const place = turn(offsetY, offsetX) * perAngle;
        const whole = place | 0;
        const before = whole < rayCount ? whole : 0;
        const after = before + 1 < rayCount ? before + 1 : 0;
        const share = place - whole;
        const past =
          distance * ((1 - share) * nearness[before] + share * nearness[after]);
        if (past > 1) {
          pixels[cell] = GROUND;
          continue;
        }
        const tone = tones[(distance * GLOW_STEPS) | 0];
        const low = Math.floor(tone);
        const up = tone - low > thresholds[cell] ? 1 : 0;
        pixels[cell] = RAMP[Math.min(LAST_STEP, low + up)];
      }
    }

    if (showRays.checked) {
      const every = Math.max(1, Math.ceil(rayCount / RAYS_DRAWN));
      for (let i = 0; i < rayCount; i += every) {
        const dirX = Math.cos(i * step);
        const dirY = Math.sin(i * step);
        for (let t = LIGHT_RADIUS; t < hits[i]; t += 1) {
          const x = Math.floor(light.x + dirX * t);
          const y = Math.floor(light.y + dirY * t);
          if (x >= 0 && y >= 0 && x < cols && y < rows)
            pixels[y * cols + x] = RAY;
        }
      }
    }

    for (let y = -LIGHT_RADIUS; y <= LIGHT_RADIUS; y++)
      for (let x = -LIGHT_RADIUS; x <= LIGHT_RADIUS; x++) {
        if (Math.hypot(x, y) > LIGHT_RADIUS) continue;
        const cellX = Math.floor(light.x) + x;
        const cellY = Math.floor(light.y) + y;
        if (cellX < 0 || cellY < 0 || cellX >= cols || cellY >= rows) continue;
        const cell = cellY * cols + cellX;
        if (solid[cell] !== TEXT_BLOCK) pixels[cell] = LIT_WALL;
      }

    for (let y = Math.max(top, Math.ceil(fadeFrom)); y < bottom; y++) {
      const gone = (y - fadeFrom) / fadeLength;
      for (let x = 0; x < cols; x++)
        if (thresholds[y * cols + x] < gone) pixels[y * cols + x] = CHARCOAL;
    }

    context.putImageData(image, 0, 0, 0, top, cols, bottom - top);
  };

  const wander = (now: number) => {
    const time = (now / 1000) * WANDER_SPEED;
    target.x = cols * (0.5 + 0.43 * Math.sin(time * 1.7 + 1));
    target.y = firstRow() + viewRows() * (0.5 + 0.4 * Math.sin(time * 2.3));
  };

  const tick = (now: number) => {
    requestAnimationFrame(tick);
    if (!onScreen) return;
    const idle = !inHand && now - lastHand > IDLE_MS;
    if (idle && !still) wander(now);
    const moveX = target.x - light.x;
    const moveY = target.y - light.y;
    if (Math.abs(moveX) + Math.abs(moveY) > 0.05) {
      light.x += moveX * (still ? 1 : FOLLOW);
      light.y += moveY * (still ? 1 : FOLLOW);
      dirty = true;
    }
    if (dirty) {
      dirty = false;
      render();
    }
  };

  const cellOf = (event: PointerEvent) => {
    const box = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - box.left) / dot,
      y: (event.clientY - box.top) / dot,
    };
  };

  const barNear = ({ x, y }: { x: number; y: number }) =>
    bars.find((bar) => {
      const wide = bar.x1 - bar.x0;
      const tall = bar.y1 - bar.y0;
      const along =
        ((x - bar.x0) * wide + (y - bar.y0) * tall) / (wide ** 2 + tall ** 2);
      const share = Math.max(0, Math.min(1, along));
      const away = Math.hypot(
        x - bar.x0 - wide * share,
        y - bar.y0 - tall * share,
      );
      return away < GRAB_REACH;
    });

  stage.addEventListener("pointerenter", () => (inHand = true));
  stage.addEventListener("pointerleave", () => {
    inHand = false;
    lastHand = performance.now();
  });
  stage.addEventListener("pointerdown", (event) => {
    if ((event.target as Element).closest("a, label, button, [data-block]"))
      return;
    inHand = true;
    const spot = cellOf(event);
    const bar = barNear(spot);
    if (bar) {
      grabbed = { bar, ...spot };
      stage.setPointerCapture(event.pointerId);
    } else {
      target.x = spot.x;
      target.y = spot.y;
    }
  });
  stage.addEventListener("pointermove", (event) => {
    const spot = cellOf(event);
    lastHand = performance.now();
    if (grabbed) {
      const moveX = spot.x - grabbed.x;
      const moveY = spot.y - grabbed.y;
      grabbed.bar.x0 += moveX;
      grabbed.bar.x1 += moveX;
      grabbed.bar.y0 += moveY;
      grabbed.bar.y1 += moveY;
      grabbed.x = spot.x;
      grabbed.y = spot.y;
      composeWalls();
      return;
    }
    stage.style.cursor = barNear(spot) ? "grab" : "crosshair";
    target.x = spot.x;
    target.y = spot.y;
  });
  const letGo = () => {
    grabbed = undefined;
    lastHand = performance.now();
  };
  stage.addEventListener("pointerup", letGo);
  stage.addEventListener("pointercancel", () => {
    letGo();
    inHand = false;
  });
  canvas.addEventListener("keydown", (event) => {
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    lastHand = performance.now();
    target.x = Math.max(0, Math.min(cols, target.x + move[0] * ARROW_STEP));
    target.y = Math.max(0, Math.min(rows, target.y + move[1] * ARROW_STEP));
  });

  slider.addEventListener("input", () => {
    count.textContent = slider.value;
    dirty = true;
  });
  showRays.addEventListener("change", () => (dirty = true));
  reset.addEventListener("click", () => {
    placeBars();
    composeWalls();
  });

  new IntersectionObserver(([{ isIntersecting }]) => {
    onScreen = isIntersecting;
  }).observe(stage);
  addEventListener("resize", () => {
    fit();
    dirty = true;
  });
  addEventListener("scroll", () => (dirty = true), { passive: true });

  fit();
  canvas.hidden = false;
  controls.dataset.ready = "true";
  requestAnimationFrame(tick);
};
