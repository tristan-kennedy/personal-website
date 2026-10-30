import { reducedMotion } from "../motion.ts";
import { emptyGrid, fitGrid, sizeCanvas } from "./fit.ts";
import { threshold } from "./index.ts";
import { CHARCOAL, PAPER, opaque } from "./palette.ts";

const INK = opaque(CHARCOAL);
const GROUND = opaque(PAPER);
const DEVELOP_DELAY = 350;
const DEVELOP_LENGTH = 1100;

export function mountPortrait(selector: string, src: string) {
  const figure = document.querySelector<HTMLElement>(selector);
  const canvas = figure?.querySelector("canvas");
  const frame = canvas?.parentElement;
  const context = canvas?.getContext("2d");
  if (!figure || !canvas || !frame || !context) return;
  const still = reducedMotion().matches;

  const source = new Image();
  const sampler = document.createElement("canvas").getContext("2d", {
    willReadFrequently: true,
  });
  let grid = emptyGrid();
  let pixels: Uint8ClampedArray | undefined;
  let progress = still ? 1 : 0;

  const draw = () => {
    if (!pixels) return;
    const { cols, rows } = grid;
    const image = context.createImageData(cols, rows);
    const strength = 1 - (1 - progress) ** 3;
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        if (pixels[i + 3] < 128) continue;
        const lum = pixels[i] / 255;
        image.data.set(lum < threshold(x, y) * strength ? INK : GROUND, i);
      }
    }
    context.putImageData(image, 0, 0);
  };

  const resize = () => {
    if (!sampler || !source.naturalWidth) return;
    const next = fitGrid(frame, grid);
    if (!next) return;
    grid = next;
    sizeCanvas(canvas, grid);
    sizeCanvas(sampler.canvas, grid);
    sampler.clearRect(0, 0, grid.cols, grid.rows);
    sampler.drawImage(source, 0, 0, grid.cols, grid.rows);
    pixels = sampler.getImageData(0, 0, grid.cols, grid.rows).data;
    draw();
    figure.dataset.enhanced = "true";
  };

  const develop = () => {
    const start = performance.now() + DEVELOP_DELAY;
    const step = (time: number) => {
      progress = Math.min(1, Math.max(0, (time - start) / DEVELOP_LENGTH));
      draw();
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  source.onload = () => {
    resize();
    new ResizeObserver(resize).observe(frame);
    if (still) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      develop();
    });
    observer.observe(figure);
  };
  source.src = src;
}
