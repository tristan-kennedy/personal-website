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

Surface order: charcoal hero, paper About, charcoal Favorites, paper closing
scene, charcoal footer.

- **Hero.** Name, globe, status ribbon, intro, and links, as in the first viewport. On phones the hero is a full-screen poster: TRISTAN and KENNEDY each fill the width between the gutters over a globe at 112vw bleeding off the right, and the ribbon, intro, and side-by-side links sit at the foot of the screen.
- **About ("Me, briefly.").** The ruled script lockup, then "I keep redoing this site. / At this point it's just for me." (columns 1–2, one sentence per line) beside two short paragraphs (columns 3–4). Behind the whole section runs the site's own `git log --oneline` in faint mono: newest first, balanced columns, fading out toward the foot, with the largest quarter of changes a shade darker. Text over it has a paper halo, and on desktop each text block also sits on a soft paper mist (blurred, no edges) that hushes the log behind it. About stays shorter than the hero. On phones "Me," is set at 40vw with the lead at 9vw, and the log fades out before the prose.
- **Favorites.** The mirrored ruled heading, then the four picks as poster rows (see DESIGN.md), with no descriptions or dates. On phones the rule becomes a bar under FAVORITES. running off the left edge, matching the bar under INDEX. on the Index. Each pick becomes a stacked poster block: the title wraps by word, sized so its longest word fills about 80% of the row, and its keywords run vertically (reading upward) along the outer edge, right for Barlow rows and left for Marcellus rows. The trails are dropped on phones.
- **Recents.** Understated, inside Favorites. A hairline-and-label heading, `$ ls -lt ~/index | head -3`, the three newest entries as date / slug / keywords on the grid (keywords hidden on phones), and a centred `$ open ~/index (every entry)` link ending in a blinking cursor.
- **Closing scene.** A ruled box around the whole scene. A large apple (`min(44vw, 820px)`) bleeds off the left edge and dips below the box's foot. It is lopsided, with uneven shoulders and five lobes at its base, seen slightly from above so the stem rises out of its cavity, and it turns slowly so its silhouette, streaks, and specks shift under the fixed sun. It floats above the page and casts a soft shadow on it in the Favorites' dim ink (#6c6a62), which ties the closing scene to the posters above it: its silhouette shifted away from the upper-left sun (down and to the right, a little flatter than 45°, 7.5% of its size), filled with the same 50% checker of whole dots as the Favorites shadows. The shadow is drawn with the apple and arrives with it. An extruded block shadow (it smeared the stem and leaf into tails), a soft Bayer-graded shadow, and a shadow that slipped out after the apple were all tried and dropped. The right-aligned Pater quote (28ch max) is centred inside it from column 2, with "experience itself" in Barlow caps, and the source sits beneath. "WHAT IS THE END" is set into the top rule and "WHO AM I" upside down in the bottom rule, both in small spaced mono caps centred on the rule, and the source ("— Walter Pater") is a small Marcellus byline. Barlow caps in the rule were tried and dropped. On phones the scene reorders instead of shrinking: the quote (6.6vw) and source on clear paper at the top, then the apple at 68vw below them, still bleeding off the left edge and through the box's foot. "WHO AM I" moves to the right of the bottom rule so the apple never runs under it.
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
- Across the page: a top navbar, a pixel logo, a theme toggle, a red accent or
  chromatic imagery, a third surface colour, boxed entries, keyword pills,
  decorative shadows or borders, arrows on entry rows, and an identity tied to a
  content subject (coastlines, travel, ferns, shells).
- Scroll-linked motion, a diagonal rotating Douglas, a wipe that draws the quote box, an oversized apple at 58vw (84vw on phones), a smooth symmetric apple whose turn only showed in the leaf, other apple treatments (drawn like the globe, linocut, misregistered with an echo, muted ghost, ruled slices), other apple motion (very slow, scroll-turned, bitten as you scroll, rolling in, turning one lobe per beat), other apple placements (rising out of the bottom rule, hanging from the top rule, small on the bottom rule, beside a narrowed box, as the quote's full stop), and a static status readout.
