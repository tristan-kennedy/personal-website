import { reducedMotion } from "../motion.ts";
import { emptyGrid, fitGrid, sizeCanvas } from "./fit.ts";
import type { Rgba } from "./palette.ts";

type Render = (size: number, seconds: number) => Uint8Array;

export function mountDitherCanvas(
  selector: string,
  render: Render,
  palette: Rgba[],
) {
  const figure = document.querySelector<HTMLElement>(selector);
  const canvas = figure?.querySelector("canvas");
  const frame = canvas?.parentElement;
  const context = canvas?.getContext("2d");
  if (!figure || !canvas || !frame || !context) return;
  const motion = reducedMotion();

  let grid = emptyGrid();
  let seconds = 0;
  let image: ImageData;
  let visible = false;
  let frameId = 0;
  let last = 0;

  const draw = () => {
    const pixels = render(grid.cols, seconds);
    for (let i = 0; i < pixels.length; i++)
      image.data.set(palette[pixels[i]], i * 4);
    context.putImageData(image, 0, 0);
  };
  const resize = () => {
    const next = fitGrid(frame, grid, { minRows: 8 });
    if (!next) return;
    grid = next;
    sizeCanvas(canvas, grid);
    image = context.createImageData(grid.cols, grid.rows);
    draw();
    figure.dataset.enhanced = "true";
  };
  const step = (time: number) => {
    if (time - last > 50) {
      seconds += (time - last) / 1000;
      last = time;
      draw();
    }
    frameId = requestAnimationFrame(step);
  };
  const sync = () => {
    cancelAnimationFrame(frameId);
    if (visible && grid.cols && !document.hidden && !motion.matches) {
      last = performance.now();
      frameId = requestAnimationFrame(step);
    }
  };

  new ResizeObserver(() => {
    resize();
    sync();
  }).observe(frame);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    sync();
  }).observe(figure);
  document.addEventListener("visibilitychange", sync);
  motion.addEventListener("change", sync);
}
