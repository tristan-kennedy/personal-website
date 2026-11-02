---
version: 1
slug: "src-entries-escapism-as-escapism-page-astro"
primary_target: "src/entries/escapism-as-escapism/Page.astro"
related_targets: ["src/entries/escapism-as-escapism"]
---

# Escapism as escapism

Scope: the entry page at `/index/escapism-as-escapism`. Visitor mode: Read, opening as an
Experience. Status: first build 2026-11-01 from an open brief ("rewrite whatever you want,
any format, doesn't need to be long, use impeccable, it can break the established
rules"). Replaces the stand-in entry Everybody's fired, keeping its date. Second pass the
same day: the owner liked the idea, but found the copy too nerdy and the cover low
resolution and bad. Third pass: the owner found the bold single words and the remaining
copy corny, so the headings and aphorisms went. Not yet reviewed section by section with the owner.

## Direction contract

THESIS: The page does what the essay asks about. You leave through a door and find
another door at the end of the road, then you're back on the same paper, unsure what the
trip was. It refuses the plain essay column, and the "dreamy escape" that pays off.

OWN-WORLD: A night and dawn palette in seven inks, drawn on the shared threshold and
`--dot`. Bands run night, dusk, plum, coral, then site paper. Marcellus carries the whole
essay. The site's grid and charcoal step aside
for this entry.

STORY: See a door in a plain page, walk through it, read a short, doubtful argument as
night turns to morning, land back on paper, and leave with the question still open.

FIRST VIEWPORT: Site paper. "Escapism" and "as escapism" in large Marcellus either side of
the door, which is the scene showing only through its own frame, centred on screen. Phones
stack the title above and below the door.

FORM: Five stacked colour bands in one centred column, after a sticky door stage. Signature
interaction: scrolling opens the paper around the door until the whole scene fills the
screen, then night washes up over it. Body type steps up in every band, so the essay ends
larger than it began. seed: none (unavailable). The open brief replaced the concept
presentation, and the build is code-led.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Sections

- **Door.** `components/door.ts` sets `--open` from scroll. The scene's clip goes from the
  door frame to the whole picture, with a slight push in. It's finished 70% of the way
  through the travel, so the night band arrives over a full sky.
- **Scene.** `components/scene.ts` draws it to a canvas in whole `--dot` cells, so it's
  sharp at any size. A lone door in a dark field under a crescent moon, placed upper right
  to agree with the shared sun. Through it, dawn and a road ending at another, dark door.
  The door within a door is the title's joke, and the essay's doubt.
- **Night.** "Is escapism even bad?", the page's only heading. Why we're so sure.
- **Dusk.** The test, and why it's hard to apply.
- **Plum.** Hiding, and getting through the week.
- **Coral.** The three kinds in one plain sentence.
- **Paper.** The guilt, then "I can't tell if this is a defense of escapism or just more of
  it." at display size, which is the title's payoff, then the way back.

Text sits on solid colour only. Bands blend in their top padding, above any text. Keep
paper text on the first three bands and charcoal on the rest, for contrast.

Without JavaScript the page shows `assets/door.png`, a capture of the canvas at 1440 wide.
With no JavaScript or under reduced motion the door stays shut, the stage is one screen
tall, and night fades in below it. The whole scene isn't shown on that path. Recapture the
PNG if the scene changes.

## Index scene

`peek.ts`. The page's own scene, from `components/scene.ts`, scaled to the stage with the
door centred behind the title, where it's fully revealed. Only the stars move. A door
beside the title was tried first and sat in the fading edge, half eaten. The coral
`colour` is one of the scene's inks, and it stays on the title's shadow.

## Notes

- Text is a loose rewrite of the March 2026 post (`dc609cf`,
  `src/content/posts/escapism-as-escapism.mdx`), about 230 words. The test, the three
  kinds, self-care as cover, and the old guilt come from it. The doubt is new and was asked
  for, and those lines speak for the owner and need their approval.
- The title's size comes from the room beside the door, because `--gutter` grows past
  `--page-max` and a fixed size overflowed under the door on ultrawide screens. `--shut`
  shrinks the closed door on short, wide screens so it stays under 78% of the height.
- The frame colour stays visible on paper and at night. The scene's door rect runs slightly
  past the stage's clip, which is left 33.8%, right 43.2%, top 24.8%, bottom 26.3%, so no
  night shows outside the frame.
- Band colours are matched to the scene's inks by eye.

## Rejected

- The original cover art. The owner found it low resolution and bad.
- Programming and work material in the essay, and any productivity framing.
- The three kinds as bold single words, and aphorisms or punchy questions as headings.

## Open with the owner

- Reading the rewritten copy in their own voice.
- The coral entry colour.
