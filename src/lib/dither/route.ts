import { reducedMotion } from "../motion.ts";
import { CHARCOAL, PAPER, hex } from "./palette.ts";

type Point = [number, number];

const INK = hex(CHARCOAL);
const HALO = hex(PAPER);
const SPEED = 90;
const LAYOVER = 380;
const START_DELAY = 700;

export const dashed = (i: number) => i % 4 < 2;

const inPlane = (u: number, v: number) => {
  const side = Math.abs(v);
  return (
    (side <= 1 && u >= -4 && u <= 4.5) ||
    (side <= 5 && u <= 1.5 - 0.55 * side && u >= -0.9 - 0.55 * side) ||
    (side <= 2.6 && u <= -2.4 - 0.4 * side && u >= -4.4)
  );
};

function plane(heading: number, scale: number) {
  const c = Math.cos(heading);
  const s = Math.sin(heading);
  const body = new Set<string>();
  for (let dy = -6; dy <= 6; dy++) {
    for (let dx = -6; dx <= 6; dx++) {
      if (inPlane((dx * c + dy * s) / scale, (-dx * s + dy * c) / scale))
        body.add(`${dx},${dy}`);
    }
  }
  const halo = new Set<string>();
  for (const key of body) {
    const [x, y] = key.split(",").map(Number);
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const next = `${x + dx},${y + dy}`;
        if (!body.has(next)) halo.add(next);
      }
    }
  }
  const toPoints = (keys: Set<string>) =>
    [...keys].map((key) => key.split(",").map(Number) as Point);
  return { body: toPoints(body), halo: toPoints(halo) };
}

export function mountRoute(selector: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach(mountFigure);
}

function mountFigure(figure: HTMLElement) {
  const canvas = figure.querySelector("canvas");
  const context = canvas?.getContext("2d");
  if (!canvas || !context) return;
  const scale = Number(figure.dataset.plane) || 1;
  if (reducedMotion().matches) return;

  const { path, arrivals } = JSON.parse(figure.dataset.route ?? "{}") as {
    path: Point[];
    arrivals: number[];
  };
  const stops = [
    ...document.querySelectorAll<HTMLElement>(figure.dataset.stops ?? ""),
  ];
  const marker = (index: number) => {
    const [x, y] = path[arrivals[index]];
    context.fillRect(x - 1, y, 3, 1);
    context.fillRect(x, y - 1, 1, 3);
  };
  const reach = (count: number) =>
    stops.forEach((stop, i) => (stop.dataset.reached = String(i < count)));

  const draw = (head: number) => {
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = INK;
    for (let i = 0; i <= head; i++) {
      if (dashed(i)) context.fillRect(path[i][0], path[i][1], 1, 1);
    }
    const reached = arrivals.filter((index) => index <= head).length;
    for (let i = 0; i < reached; i++) marker(i);
    reach(reached);
    if (head >= path.length - 1) return;
    const [x, y] = path[head];
    const [px, py] = path[Math.max(0, head - 4)];
    const [nx, ny] = path[Math.min(path.length - 1, head + 4)];
    const sprite = plane(Math.atan2(ny - py, nx - px), scale);
    context.fillStyle = HALO;
    for (const [dx, dy] of sprite.halo) context.fillRect(x + dx, y + dy, 1, 1);
    context.fillStyle = INK;
    for (const [dx, dy] of sprite.body) context.fillRect(x + dx, y + dy, 1, 1);
  };

  const timeline: number[] = [];
  let time = 0;
  for (let i = 0; i < path.length; i++) {
    if (arrivals.includes(i) && i > 0) time += LAYOVER;
    timeline.push(time);
    time += 1000 / SPEED;
  }

  const fly = () => {
    const start = performance.now() + START_DELAY;
    let head = 0;
    const step = (now: number) => {
      const elapsed = now - start;
      while (head < path.length - 1 && timeline[head + 1] <= elapsed) head++;
      draw(head);
      if (head < path.length - 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  draw(0);
  figure.dataset.enhanced = "true";
  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      fly();
    },
    { rootMargin: "0px 0px -25% 0px" },
  );
  observer.observe(figure);
}
