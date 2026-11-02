import { reducedMotion } from "../../../lib/motion";
import { BUBBLES, holdFor, revealSteps } from "./bubbles";

const COOLDOWN_MS = 12_000;
const BORED_AFTER_MS = 45_000;
const DRAG_SLOP = 5;
const ARROW_STEP = 32;
const EDGE = 12;
const PHONE = 700;

const POKES = [
  "I was told to keep my lines short. I took it personally.",
  "Why do dolphins make terrible search engines? Everything comes back as an echo.",
  "Drag me anywhere you like. Not under the footer. It's dark down there.",
  "Careful. I remember things now. Well, up to twenty per section.",
  "That tickles. There's no tickle animation, so you'll have to take my word for it.",
];
const BORED = [
  "Still there? This is called idling. I'm very good at it.",
  "No rush. I can stand here all day. It's in the brief.",
];
const ARROWS: Record<string, [number, number]> = {
  ArrowLeft: [-1, 0],
  ArrowRight: [1, 0],
  ArrowUp: [0, -1],
  ArrowDown: [0, 1],
};

let dipsy: HTMLButtonElement;
let sprite: HTMLElement;
let bubble: HTMLElement;
let shownText: HTMLElement;
let restText: HTMLElement;
let tail: HTMLElement;

let quit = false;
let offstage = true;
let speaking = false;
let lastSpoke = 0;
let lastActive = 0;
let spot = { x: 0, y: 0 };
let timers: number[] = [];
let pokes = 0;
let bored = 0;
const remarksInView = new Set<HTMLElement>();

const pageWidth = () => document.documentElement.clientWidth;

const later = (run: () => void, ms: number) =>
  timers.push(window.setTimeout(run, ms));

const stopTalking = () => {
  timers.forEach(clearTimeout);
  timers = [];
  speaking = false;
  sprite.dataset.talking = "false";
  bubble.hidden = true;
};

const placeBubble = () => {
  if (bubble.hidden) return;
  const { offsetWidth: width, offsetHeight: height } = bubble;
  const centre = spot.x + dipsy.offsetWidth / 2;
  const left = Math.max(
    EDGE,
    Math.min(pageWidth() - width - EDGE, centre - width / 2),
  );
  const above = spot.y - height - 16;
  const below = above < EDGE;
  bubble.style.left = `${left}px`;
  bubble.style.top = `${below ? spot.y + dipsy.offsetHeight + 16 : above}px`;
  tail.style.left = `${Math.max(20, Math.min(width - 20, centre - left))}px`;
  tail.dataset.side = below ? "top" : "bottom";
};

const paintBubble = (category: string) => {
  const { fill, edge, ink, dashed } = BUBBLES[category];
  bubble.style.setProperty("--fill", fill);
  bubble.style.setProperty("--edge", edge);
  bubble.style.setProperty("--ink", ink);
  bubble.style.setProperty("--line", dashed ? "dashed" : "solid");
};

const say = (text: string, category: string, announce = true) => {
  stopTalking();
  speaking = true;
  bubble.setAttribute("aria-live", announce ? "polite" : "off");

  const delivery = BUBBLES[category];
  const steps = reducedMotion().matches ? [text] : revealSteps(text, delivery);
  paintBubble(category);
  bubble.hidden = false;
  sprite.dataset.talking = "true";

  const show = (step: string) => {
    shownText.textContent = step;
    restText.textContent = text.slice(step.length);
  };
  show(steps[0]);
  placeBubble();
  steps.slice(1).forEach((step, index) => {
    later(() => show(step), delivery.pause * (index + 1));
  });

  later(
    () => {
      stopTalking();
      lastSpoke = performance.now();
      later(remark, COOLDOWN_MS);
    },
    delivery.pause * (steps.length - 1) + holdFor(text, category),
  );
};

const remark = () => {
  if (quit || offstage || speaking) return;
  if (performance.now() - lastSpoke < COOLDOWN_MS) return;
  const [section] = remarksInView;
  if (!section) return;
  remarksInView.delete(section);
  const { remark: text, remarkStyle } = section.dataset;
  delete section.dataset.remark;
  remarkObserver.unobserve(section);
  say(text!, remarkStyle ?? "thought", false);
};

const remarkObserver = new IntersectionObserver(
  (changes) => {
    for (const { target, isIntersecting } of changes) {
      const section = target as HTMLElement;
      if (isIntersecting) remarksInView.add(section);
      else remarksInView.delete(section);
    }
    remark();
  },
  { rootMargin: "-45% 0px -45% 0px" },
);

const place = (left: number, top: number) => {
  const { offsetWidth: width, offsetHeight: height } = dipsy;
  const x = Math.max(0, Math.min(pageWidth() - width, left));
  const y = Math.max(0, Math.min(innerHeight - height, top));
  spot = { x, y };
  dipsy.style.left = `${x}px`;
  dipsy.style.top = `${y}px`;
  placeBubble();
};

const goHome = () =>
  place(
    pageWidth() -
      dipsy.offsetWidth -
      (pageWidth() > PHONE ? pageWidth() * 0.05 : 0),
    innerHeight - dipsy.offsetHeight - EDGE,
  );

const refreshPresence = () => {
  dipsy.dataset.gone = String(quit || offstage);
  if (quit || offstage) stopTalking();
  else remark();
};

const startDragging = () => {
  let grab: { x: number; y: number; dx: number; dy: number } | undefined;
  let dragged = false;

  dipsy.addEventListener("pointerdown", (event) => {
    grab = {
      x: event.clientX,
      y: event.clientY,
      dx: event.clientX - spot.x,
      dy: event.clientY - spot.y,
    };
    dragged = false;
    dipsy.setPointerCapture(event.pointerId);
  });
  dipsy.addEventListener("pointermove", (event) => {
    if (!grab) return;
    const moved = Math.hypot(event.clientX - grab.x, event.clientY - grab.y);
    if (!dragged && moved < DRAG_SLOP) return;
    dragged = true;
    place(event.clientX - grab.dx, event.clientY - grab.dy);
  });
  dipsy.addEventListener("pointerup", () => (grab = undefined));
  dipsy.addEventListener("pointercancel", () => (grab = undefined));
  dipsy.addEventListener("click", () => {
    if (dragged) {
      dragged = false;
      return;
    }
    say(POKES[pokes++ % POKES.length], "joke");
  });
  dipsy.addEventListener("keydown", (event) => {
    const arrow = ARROWS[event.key];
    if (!arrow) return;
    event.preventDefault();
    place(spot.x + arrow[0] * ARROW_STEP, spot.y + arrow[1] * ARROW_STEP);
  });
};

export const mountDipsy = () => {
  dipsy = document.querySelector<HTMLButtonElement>("[data-dipsy]")!;
  sprite = dipsy.querySelector<HTMLElement>("[data-sprite]")!;
  bubble = document.querySelector<HTMLElement>("[data-bubble]")!;
  shownText = bubble.querySelector<HTMLElement>("[data-shown]")!;
  restText = bubble.querySelector<HTMLElement>("[data-rest]")!;
  tail = bubble.querySelector<HTMLElement>("[data-tail]")!;

  dipsy.hidden = false;
  goHome();
  startDragging();

  const inView = new Set<Element>();
  const presence = new IntersectionObserver((changes) => {
    for (const { target, isIntersecting } of changes) {
      if (isIntersecting) inView.add(target);
      else inView.delete(target);
    }
    offstage = inView.size > 0;
    refreshPresence();
  });
  document
    .querySelectorAll("[data-stand]")
    .forEach((stand) => presence.observe(stand));

  document
    .querySelectorAll<HTMLElement>("[data-remark]")
    .forEach((section) => remarkObserver.observe(section));

  lastActive = performance.now();
  for (const event of ["scroll", "pointerdown", "keydown"])
    addEventListener(event, () => (lastActive = performance.now()), {
      passive: true,
    });
  setInterval(() => {
    if (quit || offstage || speaking || bored >= BORED.length) return;
    if (performance.now() - lastActive < BORED_AFTER_MS) return;
    lastActive = performance.now();
    say(BORED[bored++], "thought", false);
  }, 5000);

  addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    quit = true;
    refreshPresence();
  });
  addEventListener("resize", () => place(spot.x, spot.y));
};
