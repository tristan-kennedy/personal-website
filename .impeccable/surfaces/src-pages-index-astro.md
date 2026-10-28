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

- **Hero.** Name, globe, status ribbon, intro, and links, as in the first viewport. The links sit side by side on phones.
- **About ("Me, briefly.").** The ruled script lockup, then "I keep redoing this site. / At this point it's just for me." (columns 1–2, one sentence per line) beside two short paragraphs (columns 3–4). Behind the whole section runs the site's own `git log --oneline` in faint mono: newest first, balanced columns, fading out, with the largest quarter of changes a shade darker. Text over it has a paper halo. About stays shorter than the hero. On phones the log fades out before the prose.
- **Favorites.** The mirrored ruled heading, then the four picks as poster rows (see DESIGN.md), with no descriptions or dates.
- **Recents.** Understated, inside Favorites. A hairline-and-label heading, `$ ls -lt ~/stuff | head -3`, the three newest entries as date / slug / keywords on the grid (keywords hidden on phones), and a centred `$ open ~/stuff (everything in the index)` link ending in a blinking cursor.
- **Closing scene.** A ruled box around the whole scene. An oversized apple (`min(58vw, 1100px)`, 64vw on phones) bleeds off the left edge and dips below the box's foot. The right-aligned Pater quote (28ch max) is centred inside it from column 2, with "experience itself" in Barlow caps, and the source sits beneath. "WHAT IS THE END" is set into the top rule and "WHO AM I" upside down in the bottom rule. Phones keep the composition, with the quote starting 22% across and the source kept in the right 56%.
- **Footer.** The shared colophon.

## Entrances

The page is marked ready by an inline script before first paint, so a section
already in view still plays its entrance once the hero's name lands (about 900ms).
Sections whose top has already scrolled past skip their entrance. If the reveal
module never runs, everything shows after 3s. Within a section the pieces are
staggered so it unfolds in order:

- **About:** the rule draws from the right edge, the heading slides in, then the two lead lines (0.15s, 0.3s) and the paragraphs from the right (0.35s). The git log fades up over 2s from 0.5s.
- **Favorites:** the rule draws from the left, FAVORITES. slides in (0.15s), and rows arrive from their trail's side 0.1s apart (from 0.2s). Each row's shadow slips out 0.5s after it, its trail 0.6s after, and its keywords 0.8s after.
- **Recents:** the hairline draws, then the label (0.3s), the `$ ls` line (0.4s), each entry (0.55s, 0.65s, 0.75s), and the open line (0.95s), like output arriving.
- **Closing scene:** the box fades in, the apple slides in from off screen (0.3s; it never fades, so the box line never shows through it), the quote (0.45s) and source (0.65s) come in from the right, then the two marks (1.1s).
- **Footer:** the diamonds pop in 0.12s apart, then the label (0.3s), the two notes (0.4s, 0.5s), the links (0.6s), the signature wiped in over 1.4s (0.8s), and the small line (1s).

Delays apply only while a section is entering. `src/lib/reveal.ts` marks it
`done` after 3s, so hover transitions afterwards respond without delay.

## Rejected (don't bring back)

- Marquees (looping or receding), plates, timelines, collages, moons, book spines, numbered lists, and a giant "Everything in the index" link for the selection area.
- A separate Lately section, a "Most recent" row for the newest entry, and a big RECENT STUFF heading.
- In About: a facts ledger, a dithered portrait, "Now" or "Not committed yet" stamps, overlays, a caret after the paragraphs.
- Between Favorites and the quote: frayed overhangs, hanging leaves, torn edges. Inside it: an "AN EXCERPT" label, a box around the quote alone, a halo on the source.
- Footers: Pages/Elsewhere/Contact columns, "Say hello.", a planet horizon, a dither band.
- Scroll-linked motion, a diagonal rotating Douglas, a wipe that draws the quote box, a lopsided Red Delicious apple (too costly to render), and a static status readout.
