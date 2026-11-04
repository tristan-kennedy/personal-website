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
  About. On phones the arm sits above the heading and the rule becomes a bar under INDEX. running off the right edge, like the bar under FAVORITES. on the homepage.
  Source: God's arm from Michelangelo's _The Creation of Adam_, public domain, from
  `Michelangelo - Creation of Adam (cropped).jpg` on Wikimedia Commons. Hand-traced
  cut-out, greyscale, shadows lifted so it holds on charcoal, rotated and cropped
  (`public/dither/hand-source.png`), then dithered with `node scripts/dither.mjs photo`
  at 240 dots (`hand.png`).
- **Rows (desktop list).** On a wide screen with a mouse (over 1100px, hover), one
  entry per line, every title the same size (14cqi): the list no longer shrinks with
  age. Every title sits in a box centred on one wiggly wave counted from the oldest
  entry, with a little hashed jitter, aligned to whichever side the wave is on, so the
  eye can follow it down the page. The box takes the fewest lines that fit under 92%
  of the width, and single-word titles never wrap, so the date stays beside them.
  Faces alternate from the oldest entry too, so a new entry never reshuffles old rows.
  The counter (`041 / 106`), date, and keywords stack in mono after the title's last
  word on every row. With a
  mouse, only the text hovers and clicks, so moving across the page stays calm.
- **Deck (touch screens and anything under 1100px).** Every entry is one title with
  space above and below it, snapping gently (proximity) so the title sits in the middle
  of the screen, and the next title peeks up from the foot (the last one at the top)
  like a list. The space is an even 13% of the screen height above and below every
  title. Like Favorites, sides alternate with the face: Barlow caps flush left,
  Marcellus flush right. The title is as large as its longest word allows (84% of the
  width, at most 34cqi) and capped so its lines fit in 40% of the screen height, with
  its scene open behind it. A mono folio sits right under the title: `03 / 06`, the
  date, and the first keyword. The entry at the reading line is the open one, and the whole slide is the tap
  target.
- **Rhythm.** The space around each row is 36% of its type size (20px to 76px), so big
  rows breathe. Deck titles are spaced 26% of the screen height apart.
  The list opens with one section space and closes with one and a half.
- **Time.** One unbroken scroll. There are no year headings or dividers; each row's
  date carries the time.

A small mono line under the rule, right-aligned like the caption under the homepage
globe, counts the archive: "106 entries, 2017–2026". After the last entry the list
closes in Recents' terminal voice: `$ ls ~/stuff | wc -l`, the count and the first
entry's date, then `$ cd ~ (back home)` with the blinking cursor.

There is no blurb under the heading, and nothing pinned over the first screen. The hand
already says what the page is.

## Scenes

- One row is active at a time. On the desktop list hover and keyboard focus pick it,
  and nothing is open at rest. In the deck it's the row at a reading line 40% down the
  screen for 250ms.
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

- **Puerto Rico.** Soft pink base. The title stands in an Old San Juan street: one
  unbroken row of façades behind the whole title block, in the four house colours
  (coral, yellow, teal, pink), with cream cornices, rows of slatted shutters with small
  iron balconies, and low stepped rooflines. All shading is designed gradients through
  the shared threshold: each house lit from the left and falling into the charcoal on
  its right, a shadow band under the cornice, and a clean dithered fade toward the foot
  of the block and at both ends of the street. One palm rises from just below the
  title, its ringed trunk passing behind the letters and its crown of drooping fronds
  (with a few coconuts) breaking above the rooftops toward the right, swaying slowly.
  Houses, shutters, and palm scale with the title's line height only up to 60 dots, so
  the scene stays low on ultrawide screens. Corner leaves, fog through the walls, noisy
  ragged ends, drifting dappled shade, and gaps between houses were tried and dropped.
- **Maine.** Three ridges of trees in fall colours with some green, through drifting fog.
- **Dipsy Dolphin.** Teal base. The real talking character from the project, dithered,
  on a retro Windows desktop with a speech bubble, old windows, folders, a moving
  pointer, and a taskbar. `talk.png` is a sheet of the 12 frames in
  `assets/dipsy/talk/` of `tristan-kennedy/virtual-desktop-assistant`.
- **2D raycasting vision simulator.** Acid green. A small pocket of dithered light drifting
  beside the title, with short walls cutting shadow wedges into it. The light, walls,
  and drift scale with the title's height, so on big desktop titles the pocket isn't
  hidden behind the letters.
- **Escapism as escapism.** The page's night scene, redrawn to fit behind the title: a
  lone door, dawn through it, a road ending at another door, and twinkling stars.
- **This website.** Caution yellow. A construction crane and scaffolding over the title, swinging a
  load, with caution tape beneath, because the site is never finished.

## Rejected

- A bloom filling most of the screen, and a calm one shared by every entry.
- Full panels that outgrew the title, Game of Life and the site's apple for This
  website, a sunset fort and palm scene, a dense clump of wild-coloured leaves, plain colour blocks spread apart across the title, a compact cluster of façades with three small pixel-sprite coquís at one end of the title, a flamboyán canopy over the word, a dense solid street wall, and a single drawn coquí perched on the title for Puerto Rico, a coral cliff waterfall, and
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
- Tidy phone rows: same size, flush to the gutters, strictly alternating sides (the deck replaced phone rows).
- Rows shrinking with age; with a long archive most of it became small type at the
  edges. Also Favorites-style alternating one-line rows, a pinned stage beside a
  compact list, a book-style index of years in columns, and a justified wall of every
  title.
- Deck titles set high in their slide to make room for the next one, and full-screen deck slides with the folio pinned to the foot (it read as the next
  entry's label once the next title peeked in).
- Hashed phone sizes per row, hashed spacing between deck entries (it looked disorganised), and the desktop list on tablets.
- The newest entry open on arrival on desktop.
- Random offsets and columns, on any screen, and long titles stretched across the row.
  Both broke the flow from one row to the next.
- A tight 60% box on desktop, which stacked big titles word by word and left the page
  looking empty.
- Phone keywords scattered to different spots per row. Vertical keywords on the outer edge,
  tried again with the deck, still looked bad.
- Whole rows as hover targets on desktop, which made moving across the page chaotic.

## Open with the owner

- Real colours.
- The tier sizes (12 and 50).
- Each entry page, section by section.
