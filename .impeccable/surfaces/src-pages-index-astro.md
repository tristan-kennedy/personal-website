---
version: 1
slug: src-pages-index-astro
primary_target: src/pages/index.astro
related_targets: [src/components/home/, src/components/Footer.astro, src/styles/global.css]
---

# Homepage

Scope: the production homepage at `/`. Visitor mode: Experience.

## Direction contract

THESIS: A personal introduction, a redesign log, a poster of favourites, and a
framed closing quote, held together by type rather than cards or imagery.

OWN-WORLD: Warm charcoal and paper, Barlow Condensed caps against upright
Marcellus, one script signature, heavy edge-running rules, a terminal mono voice,
and dithered imagery in the site's two inks.

STORY: Meet Tristan, learn he keeps redoing this site for himself, browse what he
is proudest of and what is new, pause at the quote, then reach the colophon.

FIRST VIEWPORT: Left-aligned TRISTAN over upright KENNEDY, Douglas written across
them in the script with a paper outline, the muted globe behind the top right, the
scrolling status ribbon, then the intro across columns 1–3 with About me and Index
in column 4.

FORM: Owner-directed refinement over many live option rounds. seed: none (unavailable)

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Sections

- **Hero.** Name, globe, status ribbon, intro, and links, as in the first viewport. On phones the hero is a full-screen poster: TRISTAN and KENNEDY each fill the width between the gutters over a globe at 112vw bleeding off the right, and the ribbon, intro, and side-by-side links sit at the foot of the screen.
- **About ("Me, briefly.").** The ruled script lockup, then "I keep redoing this site. / At this point it's just for me." (columns 1–2, one sentence per line) beside two short paragraphs (columns 3–4). Behind the whole section runs the site's own `git log --oneline` in faint mono: newest first, balanced columns, fading out, with the largest quarter of changes a shade darker. Text over it has a paper halo. About stays shorter than the hero. On phones "Me," is set at 40vw with the lead at 9vw, and the log fades out before the prose.
- **Favorites.** The mirrored ruled heading, then the four picks as poster rows (see DESIGN.md), with no descriptions or dates. On phones the rule becomes a full-bleed bar above FAVORITES., which fills the width. Each pick becomes a stacked poster block: the title wraps by word, sized so its longest word fills about 80% of the row, and its keywords run vertically (reading upward) along the outer edge, right for Barlow rows and left for Marcellus rows. The trails are dropped on phones.
- **Recents.** Understated, inside Favorites. A hairline-and-label heading, `$ ls -lt ~/stuff | head -3`, the three newest entries as date / slug / keywords on the grid (keywords hidden on phones), and a centred `$ open ~/stuff (everything in the index)` link ending in a blinking cursor.
- **Closing scene.** A ruled box around the whole scene. An oversized apple (`min(58vw, 1100px)`, 64vw on phones) bleeds off the left edge and dips below the box's foot. The right-aligned Pater quote (28ch max) is centred inside it from column 2, with "experience itself" in Barlow caps, and the source sits beneath. "WHAT IS THE END" is set into the top rule and "WHO AM I" upside down in the bottom rule. On phones the scene reorders instead of shrinking: the quote (6.6vw) and source on clear paper at the top, then the apple at 84vw below them, still bleeding off the left edge and through the box's foot. "WHO AM I" moves to the right of the bottom rule so the apple never runs under it.
- **Footer.** The shared colophon. On phones the signature is set at 30vw and the diamonds grow.

## Entrances

The page is marked ready by an inline script before first paint, so a section
already in view still plays its entrance once the hero's name lands (about 600ms).
Sections whose top has already scrolled past skip their entrance. If the reveal
module never runs, everything shows after 2s. Within a section the pieces are
staggered so it unfolds in order:

- **About:** the rule draws from the right edge, the heading slides in, then the two lead lines (0.09s, 0.18s) and the paragraphs from the right (0.21s). The git log fades up over 1.3s from 0.3s.
- **Favorites:** the rule draws from the left, FAVORITES. slides in (0.09s), and rows arrive from their trail's side 0.06s apart (from 0.12s). Each row's shadow slips out 0.3s after it, its trail 0.35s after, and its keywords 0.5s after. The shadow and trail hover offsets ride on `transform`, separate from the entrance's `translate`, so hovering during the entrance never waits on its delay.
- **Recents:** the hairline draws, then the label (0.18s), the `$ ls` line (0.24s), each entry (0.35s, 0.41s, 0.47s), and the open line (0.57s), like output arriving.
- **Closing scene:** the box fades in, the apple slides in from off screen (0.18s; it never fades, so the box line never shows through it), the quote (0.27s) and source (0.39s) come in from the right, then the two marks wipe into their gaps in the rule in reading direction (0.5s). The gaps are there from the start; only the words animate.
- **Footer:** the diamonds pop in 0.07s apart, then the label (0.18s), the two notes (0.24s, 0.3s), the links (0.36s), the signature wiped in over 0.9s (0.48s), and the small line (0.6s).

Delays apply only while a section is entering. `src/lib/reveal.ts` marks it
`done` after 2s, so hover transitions afterwards respond without delay.

## Rejected (don't bring back)

- Marquees (looping or receding), plates, timelines, collages, moons, book spines, numbered lists, and a giant "Everything in the index" link for the selection area.
- A separate Lately section, a "Most recent" row for the newest entry, and a big RECENT STUFF heading.
- In About: a facts ledger, a dithered portrait, "Now" or "Not committed yet" stamps, overlays, a caret after the paragraphs.
- Between Favorites and the quote: frayed overhangs, hanging leaves, torn edges. Inside it: an "AN EXCERPT" label, a box around the quote alone, a halo on the source.
- Footers: Pages/Elsewhere/Contact columns, "Say hello.", a planet horizon, a dither band.
- Scroll-linked motion, a diagonal rotating Douglas, a wipe that draws the quote box, a lopsided Red Delicious apple (too costly to render), and a static status readout.
