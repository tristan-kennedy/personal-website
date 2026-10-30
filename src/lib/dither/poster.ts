import { emptyGrid, fitGrid, sizeCanvas } from "./fit.ts";
import { threshold } from "./index.ts";
import { MUTED, opaque } from "./palette.ts";

const INK = opaque(MUTED);

function mountPoster(figure: HTMLElement) {
  const canvas = figure.querySelector("canvas");
  const context = canvas?.getContext("2d");
  const sampler = document.createElement("canvas").getContext("2d", {
    willReadFrequently: true,
  });
  if (!canvas || !context || !sampler || !figure.dataset.source) return;

  const source = new Image();
  let grid = emptyGrid();

  const resize = () => {
    const next = fitGrid(figure, grid);
    if (!next) return;
    grid = next;
    const { cols, rows } = grid;
    sizeCanvas(canvas, grid);
    sizeCanvas(sampler.canvas, grid);
    sampler.drawImage(source, 0, 0, cols, rows);
    const pixels = sampler.getImageData(0, 0, cols, rows).data;
    const image = context.createImageData(cols, rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        if (pixels[i] / 255 > threshold(x, y)) image.data.set(INK, i);
      }
    }
    context.putImageData(image, 0, 0);
    figure.dataset.enhanced = "true";
  };

  source.onload = () => {
    resize();
    new ResizeObserver(resize).observe(figure);
  };
  source.src = figure.dataset.source;
}

export function mountPosters(selector: string) {
  document.querySelectorAll<HTMLElement>(selector).forEach(mountPoster);
}
