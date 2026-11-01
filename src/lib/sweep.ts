import { threshold } from "./dither/index.ts";
import { readDot } from "./dither/fit.ts";
import { WIPE, fromHex } from "./dither/palette.ts";
import { splotch } from "./dither/splotch.ts";
import { hash } from "./hash.ts";
import { reducedMotion } from "./motion.ts";

const COVER = 320;
const CLEAR = 480;
const STALLED = 4000;
const LONGEST_FRAME = 1000 / 30;
const KEY = "sweep";
const COLOUR_KEY = "sweep-colour";
const SPREAD_KEY = "sweep-spread";

type Direction = 1 | -1;
type Spread = { x: number; y: number; seed: number; opening?: boolean };

type Curtain = ReturnType<typeof curtain>;

let leaving: (Curtain & { stalled: number }) | undefined;

const easeIn = (t: number) => t * t * t;
const easeOut = (t: number) => 1 - (1 - t) ** 3;

function forget() {
  sessionStorage.removeItem(KEY);
  sessionStorage.removeItem(COLOUR_KEY);
  sessionStorage.removeItem(SPREAD_KEY);
}

function curtain(direction: Direction, colour = WIPE, spread?: Spread) {
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
  const order = spread
    ? splotch(cols, rows, spread.x / dot, spread.y / dot, spread.seed)
    : new Float32Array(cols * rows);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const across = direction === 1 ? x / cols : 1 - x / cols;
      const i = y * cols + x;
      if (!spread) order[i] = across * 0.6 + threshold(x, y) * 0.4;
      else if (spread.opening) order[i] = 1 - order[i];
      image.data.set(colour, i * 4);
    }
  }

  const draw = (coverage: number) => {
    for (let i = 0; i < order.length; i++)
      image.data[i * 4 + 3] = order[i] < coverage ? 255 : 0;
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
  return { url, link };
}

async function leave(url: URL, link: HTMLAnchorElement, event: MouseEvent) {
  const direction: Direction = url.pathname === "/" ? -1 : 1;
  const accent = link.dataset.colour;
  const [x, y] = link.dataset.origin?.split(",").map(Number) ?? [
    event.clientX,
    event.clientY,
  ];
  const spread = accent ? { x, y, seed: hash(url.pathname) } : undefined;
  forget();
  sessionStorage.setItem(KEY, String(direction));
  if (accent) {
    sessionStorage.setItem(COLOUR_KEY, accent);
    sessionStorage.setItem(SPREAD_KEY, JSON.stringify(spread));
  }
  const cover = curtain(
    direction,
    accent ? fromHex(accent) : undefined,
    spread,
  );
  leaving = { ...cover, stalled: 0 };
  await play(COVER, (t) => cover.draw(easeIn(t)));
  location.href = url.href;
  leaving.stalled = window.setTimeout(() => {
    forget();
    leaving = undefined;
    uncover(cover);
  }, STALLED);
}

async function uncover({ canvas, draw }: Curtain) {
  draw(1);
  await play(CLEAR, (t) => {
    if (t === 0) delete document.documentElement.dataset.sweep;
    draw(1 - easeOut(t));
  });
  canvas.remove();
}

function arrive() {
  const direction = Number(document.documentElement.dataset.sweep);
  const colour = sessionStorage.getItem(COLOUR_KEY);
  const spread = sessionStorage.getItem(SPREAD_KEY);
  forget();
  if (direction !== 1 && direction !== -1) return;
  uncover(
    curtain(
      -direction as Direction,
      colour ? fromHex(colour) : undefined,
      spread ? { ...(JSON.parse(spread) as Spread), opening: true } : undefined,
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
  document.addEventListener("click", (event) => {
    if (reducedMotion().matches) return;
    const target = sweepable(event);
    if (!target) return;
    event.preventDefault();
    if (!leaving) leave(target.url, target.link, event);
  });
}
