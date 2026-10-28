type Rgba = [number, number, number, number];
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
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

  let cols = 0;
  let rows = 0;
  let seconds = 0;
  let image: ImageData;
  let visible = false;
  let frameId = 0;
  let last = 0;

  const draw = () => {
    const pixels = render(cols, seconds);
    for (let i = 0; i < pixels.length; i++)
      image.data.set(palette[pixels[i]], i * 4);
    context.putImageData(image, 0, 0);
  };
  const resize = () => {
    const dot =
      parseFloat(getComputedStyle(frame).getPropertyValue("--dot")) || 3;
    const nextCols = Math.floor(frame.clientWidth / dot);
    const nextRows = Math.floor(frame.clientHeight / dot);
    if (
      (nextCols === cols && nextRows === rows) ||
      nextCols < 16 ||
      nextRows < 8
    )
      return;
    cols = nextCols;
    rows = nextRows;
    canvas.width = cols;
    canvas.height = rows;
    canvas.style.width = `${cols * dot}px`;
    canvas.style.height = `${rows * dot}px`;
    image = context.createImageData(cols, rows);
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
    if (visible && cols && !document.hidden && !reducedMotion.matches) {
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
  reducedMotion.addEventListener("change", sync);
}
