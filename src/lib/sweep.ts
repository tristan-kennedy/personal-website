import { packed } from "./dither/effect.ts";
import { readDot } from "./dither/fit.ts";
import { fromHex } from "./dither/palette.ts";
import { threshold } from "./dither/index.ts";
import { noise, splotch } from "./dither/splotch.ts";
import { hash } from "./hash.ts";
import { reducedMotion } from "./motion.ts";

const COVER = 720;
const CLEAR = 820;
const FRINGE = 0.24;
const PATCH = 0.12;
const STALLED = 4000;
const LONGEST_FRAME = 1000 / 30;
const KEY = "sweep";
const COLOUR_KEY = "sweep-colour";
const SPREAD_KEY = "sweep-spread";
const ACCENTS_KEY = "sweep-accents";

type Spread = { x: number; y: number; seed: number; opening?: boolean };

type Curtain = ReturnType<typeof curtain>;

let leaving: (Curtain & { stalled: number }) | undefined;

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function forget() {
  sessionStorage.removeItem(KEY);
  sessionStorage.removeItem(COLOUR_KEY);
  sessionStorage.removeItem(SPREAD_KEY);
  sessionStorage.removeItem(ACCENTS_KEY);
}

function curtain(spread: Spread, colours: string[]) {
  const root = document.documentElement;
  const dot = readDot(root);
  const { clientWidth, clientHeight } = root;
  const cols = Math.ceil(clientWidth / dot);
  const rows = Math.ceil(clientHeight / dot);
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.width = cols;
  canvas.height = rows;
  canvas.style.cssText =
    "position:fixed;inset:0;z-index:1000;width:100%;height:100%;pointer-events:none;image-rendering:pixelated";
  document.body.append(canvas);

  const context = canvas.getContext("2d")!;
  const image = context.createImageData(cols, rows);
  const pixels = new Uint32Array(image.data.buffer);
  const accents = colours.slice(0, -1).map((colour) => packed(fromHex(colour)));
  const main = packed(fromHex(colours.at(-1)!));
  const fringe = accents.length ? FRINGE : 0;
  const order = splotch(
    cols,
    rows,
    spread.x / dot,
    spread.y / dot,
    spread.seed,
  );
  const tint = new Uint32Array(order.length);
  const slack = new Float32Array(order.length);
  const patch = Math.max(cols, rows) * PATCH;
  for (let y = 0; y < rows; y++)
    for (let x = 0; x < cols; x++) {
      const i = y * cols + x;
      if (spread.opening) order[i] = 1 - order[i];
      if (!fringe) continue;
      const pick =
        noise(x / patch, y / patch, spread.seed + 1) * accents.length +
        (threshold(x, y) - 0.5) * 0.8;
      tint[i] =
        accents[Math.min(accents.length - 1, Math.max(0, Math.floor(pick)))];
      slack[i] =
        fringe * (0.3 + 0.7 * noise(x / patch, y / patch, spread.seed + 2));
    }

  const draw = (t: number) => {
    const reach = (spread.opening ? 1 - easeOut(t) : easeIn(t)) * (1 + fringe);
    for (let i = 0; i < pixels.length; i++) {
      const depth = reach - order[i];
      pixels[i] = depth <= 0 ? 0 : depth < slack[i] ? tint[i] : main;
    }
    context.putImageData(image, 0, 0);
  };
  return { canvas, draw };
}

function play(duration: number, frame: (t: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let elapsed = 0;
    let last: number | undefined;
    const step = (now: number) => {
      if (last !== undefined) elapsed += Math.min(now - last, LONGEST_FRAME);
      last = now;
      const t = Math.min(1, elapsed / duration);
      frame(t);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

function sweepable(event: MouseEvent) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  )
    return;
  const link = (event.target as Element).closest?.("a");
  if (!link || link.target || link.hasAttribute("download")) return;
  const url = new URL(link.href, location.href);
  if (url.origin !== location.origin) return;
  if (/\.[a-z0-9]+$/i.test(url.pathname)) return;
  if (url.pathname === location.pathname && url.search === location.search)
    return;
  const paint = link.dataset.colour
    ? link.dataset
    : url.pathname === "/index/"
      ? backPaint()
      : undefined;
  if (!paint?.colour) return;
  return { url, link, colour: paint.colour, accents: paint.accents ?? "" };
}

function backPaint() {
  const { backColour, backAccents } = document.documentElement.dataset;
  return { colour: backColour, accents: backAccents };
}

type Target = NonNullable<ReturnType<typeof sweepable>>;

function clickPoint(link: HTMLAnchorElement, event: MouseEvent) {
  const origin = link.dataset.origin?.split(",").map(Number);
  if (origin) return { x: origin[0], y: origin[1] };
  if (event.detail) return { x: event.clientX, y: event.clientY };
  const box = link.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
}

const paint = (colour: string, accents: string) => [
  ...accents.split(" ").filter(Boolean),
  colour,
];

async function leave(
  { url, link, colour, accents }: Target,
  event: MouseEvent,
) {
  const { x, y } = clickPoint(link, event);
  const spread = { x, y, seed: hash(url.pathname) };
  const colours = paint(colour, accents);
  forget();
  sessionStorage.setItem(KEY, "true");
  sessionStorage.setItem(COLOUR_KEY, colour);
  sessionStorage.setItem(ACCENTS_KEY, accents);
  sessionStorage.setItem(SPREAD_KEY, JSON.stringify(spread));
  const cover = curtain(spread, colours);
  leaving = { ...cover, stalled: 0 };
  await play(COVER, cover.draw);
  location.href = url.href;
  leaving.stalled = window.setTimeout(() => {
    forget();
    leaving = undefined;
    uncover(curtain({ ...spread, opening: true }, colours));
    cover.canvas.remove();
  }, STALLED);
}

async function uncover({ canvas, draw }: Curtain) {
  draw(0);
  await play(CLEAR, (t) => {
    if (t === 0) delete document.documentElement.dataset.sweep;
    draw(t);
  });
  canvas.remove();
}

function arrive() {
  const sweeping = document.documentElement.dataset.sweep;
  const colour = sessionStorage.getItem(COLOUR_KEY);
  const spread = sessionStorage.getItem(SPREAD_KEY);
  const accents = sessionStorage.getItem(ACCENTS_KEY) ?? "";
  forget();
  if (!sweeping || !colour || !spread) return;
  uncover(
    curtain(
      { ...(JSON.parse(spread) as Spread), opening: true },
      paint(colour, accents),
    ),
  );
}

function returned(event: PageTransitionEvent) {
  if (!event.persisted) return;
  forget();
  if (!leaving) return;
  clearTimeout(leaving.stalled);
  leaving.canvas.remove();
  leaving = undefined;
}

export function mountSweep() {
  arrive();
  addEventListener("pageshow", returned);
  addEventListener("pageswap", (event) => {
    const transition = (event as Event & { viewTransition?: ViewTransition })
      .viewTransition;
    if (!leaving || !transition) return;
    transition.ready.catch(() => {});
    transition.skipTransition();
  });
  document.addEventListener("click", (event) => {
    if (reducedMotion().matches) return;
    const target = sweepable(event);
    if (!target) return;
    event.preventDefault();
    if (!leaving) leave(target, event);
  });
}
