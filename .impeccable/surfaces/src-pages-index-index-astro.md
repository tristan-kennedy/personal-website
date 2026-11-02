---
version: 1
slug: src-pages-index-index-astro
primary_target: src/pages/index/index.astro
related_targets:
  [
    src/components/index/,
    src/entries/,
    src/lib/peek.ts,
    src/lib/scatter.ts,
    src/lib/dither/effect.ts,
    src/lib/sweep.ts,
  ]
---

# Index

Scope: the Index at `/index`. Visitor mode: Experience. Status: designed live with the
owner and approved 2026-10-31. Entry colours are
stand-ins the owner can change.

## Direction contract

THESIS: A lengthy scrolling retelling of Tristan's life. It stays monochrome until you
touch a row, and then that entry opens a small scene of its own.

OWN COMPOSITION: Charcoal throughout, with type scale and a scattered edge doing the
work. The first screen is a poster: INDEX. and an arm pointing at the list.

STORY: Land on INDEX. and the hand, scroll down through big recent entries that shrink
as they get older, touch one and watch its little world rise behind the title, open it
and let its colour fill the screen.

## Sections

- **Header.** Like About, the first screen is mostly header: the shared nav, then huge
  INDEX. and a heavy rule to the right edge at the foot of the screen, with the rows
  waiting just below. A dithered arm reaches down from the top right, rotated 24° so
  the finger points down toward the list, the index finger answering the portrait on
  About. On phones the arm sits above the heading and the rule is dropped.
  Source: God's arm from Michelangelo's _The Creation of Adam_, public domain, from
  `Michelangelo - Creation of Adam (cropped).jpg` on Wikimedia Commons. Hand-traced
  cut-out, greyscale, shadows lifted so it holds on charcoal, rotated and cropped
  (`public/dither/hand-source.png`), then dithered with `node scripts/dither.mjs photo`
  at 240 dots (`hand.png`).
- **Rows.** One entry per line, always. Size falls on one smooth curve from the
  newest entry to the oldest and never depends on a title's length, so a long title
  wraps, balanced, instead of shrinking. Row shapes go by count, not date, so the page never
  looks empty in January: the newest 12 carry stacked keywords, the next 50 carry a
  mono line, and the rest carry only a date, with their size and tone mixed around the
  curve (`src/lib/scatter.ts`). Horizontal position isn't random. Every title sits in a
  box centred on one wiggly wave counted from the oldest entry, with a little hashed
  jitter, aligned to whichever side the wave is on, so the eye can follow it down the
  page and a row never jumps far from the last. The box takes the fewest lines that fit
  under a width limit, 92% on desktop and 88% on phones, working out the real word
  breaks, so long titles stay near the wave without wrapping early, and it hugs its text
  so flipping sides doesn't jump. The wave turns every eight rows or so, which is
  tuned to show a curve even with only five entries. On desktop it starts at 60% strength
  and opens up as rows shrink, keeping the biggest titles nearer the centre.
  Faces alternate from the oldest entry too, so a new entry never reshuffles old rows.
  On desktop the date always follows the title's last word. Phones hash each row's size
  and spacing from its slug, scaling the curve up but keeping the longest word inside
  the row, and every row drops its meta to a line under the title: the date, plus the
  first keyword on the rows that have them. With a mouse, only the text
  hovers and clicks, so moving across the page stays calm. On touch screens the whole
  row is the tap target.
- **Rhythm.** The space around each row is 36% of its type size (20px to 76px), so big
  rows breathe and the oldest tighten with the curve. Phones multiply that by a hashed
  amount from half to more than double. The list opens with one section
  space and closes with one and a half.
- **Time.** One unbroken scroll. There are no year headings or dividers; each row's
  date carries the time.

There is no blurb under the heading, and nothing pinned over the first screen. The hand
already says what the page is.

## Scenes

- One row is active at a time. Hover and keyboard focus pick it on desktop. On touch
  screens it's the row at a reading line 40% down the screen for 250ms.
- Each scene opens a small canvas behind its title, sized from the title's height and
  scrolling with the row, on the shared threshold and `--dot`. All of them share the
  same rough edge. The loop runs at about 30fps and stops when the row closes, and
  effect code loads the first time a row opens, so cost doesn't grow with the archive.
  Reduced motion paints one still frame.
- Scenes stay small and organic, like Maine's: they rise from behind the title and fade
  at the rough edge, and leave headroom so that edge doesn't cut anything off. Make them
  a smattering of things specific to the entry, not a full panel.
- Every title rests on the same misregistered dithered shadow as Favorites, and poster
  rows slip it out 0.3s after they arrive. The active title's shadow moves further out
  and turns the entry's colour, or only changes colour under reduced motion. The shadow
  is a copy of the row laid under the title, with the meta kept invisible, so it wraps
  exactly as the title does. While any row is active, every title gets a charcoal
  outline, so it holds over a scene. Rows always sit above scenes, so art never covers
  a title.
- Clicking spreads the entry's colour from the title's centre to fill the screen, and
  the page opens through the same splotch.

## The five entries

Each has its own `src/entries/<slug>/peek.ts`:

- **Puerto Rico.** Soft pink base. One compact group over the right of the title: four
  stepped Old San Juan façades with cream cornices, arched shutters, and small balconies,
  with big green leaves laid over them and hanging down behind the letters. Three
  tan-brown coquís in profile sit on the leaves, placed clear of the letters, and call in
  turn, a pale sac swelling twice at the throat for "ko-kee".
- **Maine.** Three ridges of trees in fall colours with some green, through drifting fog.
- **Dipsy Dolphin.** Teal base. The real talking character from the project, dithered,
  on a retro Windows desktop with a speech bubble, old windows, folders, a moving
  pointer, and a taskbar. `talk.png` is a sheet of the 12 frames in
  `assets/dipsy/talk/` of `tristan-kennedy/virtual-desktop-assistant`.
- **2D raycasting vision simulator.** Acid green. A small pocket of dithered light drifting
  beside the title, with short walls cutting shadow wedges into it.
- **Escapism as escapism.** The page's night scene, redrawn to fit behind the title: a
  lone door, dawn through it, a road ending at another door, and twinkling stars.
- **This website.** Caution yellow. A construction crane and scaffolding over the title, swinging a
  load, with caution tape beneath, because the site is never finished.

## Rejected

- A bloom filling most of the screen, and a calm one shared by every entry.
- Full panels that outgrew the title, Game of Life and the site's apple for This
  website, a sunset fort and palm scene, a detailed street of painted houses, a dense clump of wild-coloured leaves, and plain colour blocks spread apart across the title for Puerto Rico, a coral cliff waterfall, and
  hand-drawn leaping dolphins for Dipsy.
- Uniform mono rows for the oldest entries, which all looked the same, and several small
  entries sharing a line.
- A solid shadow in place of the dithered echo, and underlined titles.
- Any year separation: a huge sticky vertical year, bold Barlow years with a hairline,
  `$ cd ../2025 # -----` lines, and a dashed rule.
- A pinned bottom bar in every form: `$ grep` search and `random` (it spoiled the poster
  opening and looked bad on phones), a `years` jump menu, a bordered search field, and a
  strip with one column per month. Search can return around 50 entries, in the page
  rather than pinned over it.
- A blurb under the heading.
- Tidy phone rows: same size, flush to the gutters, strictly alternating sides.
- Random offsets and columns, on any screen, and long titles stretched across the row.
  Both broke the flow from one row to the next.
- A tight 60% box on desktop, which stacked big titles word by word and left the page
  looking empty.
- Phone keywords run vertically on the row's edge, or scattered to different spots per
  row. They sit under the title every time.
- Whole rows as hover targets on desktop, which made moving across the page chaotic.

## Open with the owner

- Real colours.
- The tier sizes (12 and 50).
- Each entry page, section by section.
