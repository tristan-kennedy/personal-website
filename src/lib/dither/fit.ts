export interface Grid {
  cols: number;
  rows: number;
  dot: number;
}

export const readDot = (element: Element) =>
  parseFloat(getComputedStyle(element).getPropertyValue("--dot")) || 3;

export const emptyGrid = (): Grid => ({ cols: 0, rows: 0, dot: 0 });

export function fitGrid(
  frame: HTMLElement,
  current: Grid,
  { minCols = 16, minRows = 0 } = {},
): Grid | undefined {
  const dot = readDot(frame);
  const cols = Math.floor(frame.clientWidth / dot);
  const rows = Math.floor(frame.clientHeight / dot);
  const unchanged =
    cols === current.cols && rows === current.rows && dot === current.dot;
  if (unchanged || cols < minCols || rows < minRows) return;
  return { cols, rows, dot };
}

export function sizeCanvas(
  canvas: HTMLCanvasElement,
  { cols, rows, dot }: Grid,
) {
  canvas.width = cols;
  canvas.height = rows;
  canvas.style.width = `${cols * dot}px`;
  canvas.style.height = `${rows * dot}px`;
}
