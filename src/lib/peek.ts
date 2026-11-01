import { openEffect, splat, type Effect } from "./dither/effect.ts";
import { PAPER, fromHex } from "./dither/palette.ts";
import { hash } from "./hash.ts";

const HOVER_DELAY = 70;
const LINGER = 180;
const DWELL = 250;
const READING_LINE = 0.4;

const effects = import.meta.glob<{ default: Effect }>("../entries/*/effect.ts");

export function mountPeeks(root: HTMLElement) {
  const touch = matchMedia("(hover: none)");
  let active: HTMLElement | undefined;
  let waiting = 0;
  let opening = 0;
  let closeEffect: (() => void) | undefined;

  const showEffect = async (row: HTMLElement) => {
    const ticket = ++opening;
    const link = row.querySelector("a")!;
    const accent = link.dataset.colour;
    const load =
      effects[`../entries/${link.pathname.split("/").at(-2)}/effect.ts`];
    const effect = load ? (await load()).default : accent ? splat : undefined;
    await effect?.prepare?.();
    if (!effect || ticket !== opening) return;
    closeEffect = openEffect(
      row,
      row.querySelector("[data-title]")!,
      effect,
      accent ? fromHex(accent) : PAPER,
      hash(link.pathname),
    );
  };

  const closeRow = (row: HTMLElement) => {
    delete row.dataset.active;
    opening++;
    closeEffect?.();
    closeEffect = undefined;
  };

  const activate = (row?: HTMLElement) => {
    clearTimeout(waiting);
    if (row === active) return;
    if (active) closeRow(active);
    active = row;
    if (!row) {
      delete root.dataset.dimmed;
      return;
    }
    root.dataset.dimmed = "";
    row.dataset.active = "";
    showEffect(row);
    const title = row.querySelector("[data-title]")!.getBoundingClientRect();
    row.querySelector("a")!.dataset.origin =
      `${title.left + title.width / 2},${title.top + title.height / 2}`;
  };

  const soon = (row: HTMLElement | undefined, delay: number) => {
    clearTimeout(waiting);
    waiting = window.setTimeout(() => activate(row), delay);
  };

  const rowOf = (event: Event) =>
    (event.target as Element).closest<HTMLElement>("[data-row]") ?? undefined;

  root.addEventListener("mouseover", (event) => {
    if (touch.matches) return;
    const row = rowOf(event);
    if (row) soon(row, HOVER_DELAY);
    else if (active) soon(undefined, LINGER);
  });
  root.addEventListener("mouseleave", () => {
    if (!touch.matches) soon(undefined, LINGER);
  });
  root.addEventListener("focusin", (event) => {
    const row = rowOf(event);
    if (row?.matches(":has(:focus-visible)")) activate(row);
  });
  root.addEventListener("focusout", (event) => {
    if (rowOf(event) === active) soon(undefined, LINGER);
  });

  const crossing = new Set<Element>();
  const line = new IntersectionObserver(
    (changes) => {
      for (const { target, isIntersecting } of changes)
        if (isIntersecting) crossing.add(target);
        else crossing.delete(target);
      if (touch.matches)
        soon([...crossing].at(-1) as HTMLElement | undefined, DWELL);
    },
    {
      rootMargin: `-${READING_LINE * 100}% 0px -${(1 - READING_LINE) * 100}% 0px`,
    },
  );
  root.querySelectorAll("[data-row]").forEach((row) => line.observe(row));
}
