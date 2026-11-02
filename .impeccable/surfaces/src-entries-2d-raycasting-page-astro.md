---
version: 1
slug: "src-entries-2d-raycasting-page-astro"
primary_target: "src/entries/2d-raycasting/Page.astro"
related_targets: ["src/entries/2d-raycasting"]
---

# 2D raycasting vision simulator

Scope: the entry page at `/index/2d-raycasting`. Visitor mode: Experience, then a short
Read. Status: first build 2026-11-01, brought back from the March 2026 experiment with
free rein over the text and code. Not yet reviewed section by section with the owner.

## Direction contract

THESIS: The title is the wall. The experiment fills the first screen, and the page's own
letters block the light. It refuses a demo box inside a tutorial.

OWN-WORLD: Near-black `#141412`, one acid green `#c8ff3a` dithered up to a hot cream on
the shared threshold and `--dot`, grey walls, and mono controls. It reads as a game engine's
debug view.

STORY: Arrive to a light already moving, take it over, change the room, then read four
short paragraphs on what you just did.

FIRST VIEWPORT: The whole screen is the simulation. `$ cd ..` and the date at the top, the
title across the middle as dim walls, and the rays slider, show rays, and reset walls along
the bottom.

FORM: One continuous room from the title down through the article, with the text as a
wall. Signature interaction: move the pointer and the title throws real shadows. seed: none (unavailable). The owner's go-ahead
replaced the concept presentation, and the build is code-led.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Sections

- **Stage.** `components/simulator.ts`. Reads the real title into a grid of `--dot` cells
  with short draggable bars, casts rays through that grid each frame, and fills the cells
  each ray reached. Faceted edges at low ray counts come from interpolating between rays.
  The light wanders until a pointer takes over, and goes back 3.5s after it leaves. Arrow
  keys move it when the canvas has focus. Drawing stops offscreen.
  Only the rows on screen are drawn, and the light wanders inside whatever is on screen.
- **Article.** Four paragraphs and the way back, inside the same room. The text block is a
  wall, so the words stay on clean dark with a faint lit rim, and the block casts a shadow.
- **Edges.** The room dissolves into the charcoal footer on the shared threshold. Controls
  have no boxes. A tight dark `drop-shadow` halo keeps them readable on any green.

The DOM title stays under the canvas, so without JavaScript the page is the title on black
and the article. Reduced motion holds the light still until the visitor moves it, and the
controls only appear once the script runs.

## Index scene

`peek.ts`. A small pocket of light drifting in the space beside the title, with four short
walls cutting shadow wedges. This one uses the old ray-against-segment method.

## Notes

- Rewritten from `src/content/experiments/2d-raycasting-vision-simulator.mdx` and its React
  demo, last at `dc609cf`. The ray range, the ray count of 550, draggable walls, show rays,
  and reset all carry over, though the slider now starts at 24 rays rather than 50.
- Rays are off by default, because the plain dithered light looks better than the moiré of
  drawn rays.

## Rejected

- A hard cut at the fold where the light stopped, and dark boxes behind the controls.
- A title-sized shadow in the peek, which made a large black panel on the Index.

## Open with the owner

- Reading the new text in their own voice.
- The acid green entry colour.
