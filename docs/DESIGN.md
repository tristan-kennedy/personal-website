---
name: Tristan Kennedy
description: A typography-led personal archive in warm charcoal and paper.
colors:
  charcoal: "#292824"
  paper: "#f2f0e9"
  muted: "#b8b5aa"
  ink-muted: "#67645b"
  rule: "#55534b"
  rule-on-paper: "#c9c6bb"
  echo: "#6c6a62"
  wipe: "#55534b"
typography:
  display:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "min(23vw, 552px)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Barlow Condensed, sans-serif"
    fontSize: "clamp(76px, 12vw, 288px)"
    fontWeight: 800
    lineHeight: 0.8
    letterSpacing: "-0.03em"
  lead:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "clamp(28px, 2.9vw, 50px)"
    fontWeight: 400
    lineHeight: 1.15
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Marcellus, Georgia, serif"
    fontSize: "clamp(28px, 3vw, 48px)"
    fontWeight: 400
    lineHeight: 1.2
  body:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "clamp(18px, 1.4vw, 22px)"
    fontWeight: 400
    lineHeight: 1.65
  label:
    fontFamily: "Arial, Helvetica, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  mono-label:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 400
    letterSpacing: "0.14em"
  signature:
    fontFamily: "Mrs Saint Delafield, cursive"
    fontWeight: 400
rounded:
  none: "0px"
spacing:
  gutter: "max(24px, 5vw, calc((100vw - 2400px) / 2 + 120px))"
  col-inset: "20px"
  section: "clamp(56px, 7vw, 112px)"
  dot: "3px"
components:
  text-link:
    textColor: "{colors.paper}"
  heading-rule:
    textColor: "{colors.paper}"
    height: "clamp(6px, 0.8vw, 14px)"
  status-ribbon:
    textColor: "{colors.paper}"
    padding: "12px 0"
  colophon:
    backgroundColor: "{colors.charcoal}"
    textColor: "{colors.paper}"
---

# Design System: Tristan Kennedy

## Overview

**Creative North Star: "The Printed Archive"**

Typography carries the identity. Heavy condensed caps and an upright serif give
ordinary titles their own compositions, while quiet body copy and small labels keep
the reading path clear. Warm charcoal and paper surfaces sit beneath dramatic
changes in scale and alignment. Character comes from the material Tristan
publishes, a few dithered images, and small printed-matter details such as a
colophon, a ruled frame, and a terminal listing. It never comes from a themed
costume.

The homepage, About, and the Index share this system. Colour belongs to entries: the
Index stays monochrome until a row opens its own small scene. Entry pages own their
own visual systems and are designed with the owner one section at a time.

**Key Characteristics:**

- Dramatic scale contrast between Barlow Condensed caps and upright Marcellus.
- Two surfaces, charcoal and paper, with monochrome resting states.
- Fluid gutters, full width, one four-column grid, controlled asymmetry.
- Flat, square geometry. Rules mark meaningful boundaries.
- Dithered imagery that shares one dot, one pattern, and one sun.
- Motion that is mostly sideways, plays once, and disappears with reduced motion. Index scenes are the deliberate exception: they loop while their row is active.

## Colors

Warm and tonal. Contrast between sections carries the structure.

### Neutral

- **Charcoal** (#292824): the default surface, and text on paper.
- **Paper** (#f2f0e9): the light surface, and text on charcoal.
- **Muted** (#b8b5aa): supporting text on charcoal, and the globe's ink.
- **Ink Muted** (#67645b): supporting text on paper.
- **Rule** (#55534b on charcoal, #c9c6bb on paper): structural hairlines.
- **Echo** (#6c6a62): the dim dither behind the Favorites titles and their hover dimming.
- **Wipe** (#55534b): the one colour of every plain page transition, off-charcoal so it reads the same leaving paper or charcoal.

The `paper` utility flips a section to the light surface and swaps `muted` and
`rule` for their on-paper values. Surface treatments are fixed per page rather
than chosen by the visitor.

**The Resting Monochrome Rule.** Shared pages are charcoal and paper at rest,
imagery included. Each page decides how much of each it uses: the homepage
alternates them, while About stays mostly on paper, and the Index stays on charcoal.
The only colour on a shared page belongs to an entry, set by `colour` in its
`entry.json`. It appears on the Index while that entry's row is active and carries
through the sweep into its page.

## Typography

**Display:** Barlow Condensed 800.
**Serif:** Marcellus 400, always upright.
**Body/Label:** Arial, Helvetica, sans-serif.
**Mono:** ui-monospace stack, for terminal voices (About's log, Recents, the Index's `$ grep` bar and row dates, the colophon label, quote marks).
**Script:** Mrs Saint Delafield, used sparingly as a signature: Douglas in the hero, "briefly" in About's heading, and the colophon's "Tristan" signature. Its rarity is what makes it read as handwriting.

All three webfonts load from `@fontsource` packages at the needed weights, with no
preloads or manual copies.

### Hierarchy

- **Display** (`min(23vw, 552px)`, 0.8): the hero name and INDEX.
- **Headline** (`clamp(76px, 12vw, 288px)`): FAVORITES. Poster titles size themselves from their character count to fill most of the row.
- **Lead** (`clamp(28px, 2.9vw, 50px)`, Marcellus): About's two-sentence line.
- **Index titles** (Barlow and Marcellus, alternating): one curve from 14% of the list's width on the newest entry down to about 2%, never set by a title's length, so long titles wrap rather than shrink. 18px is the floor.
- **Body** (`clamp(18px, 1.4vw, 22px)`, 1.65; 17px on the homepage at phone width): hero intro, hero links, About paragraphs.
- **Note** (15px, muted): About's captions, footnotes, and secondary links, a step between label and body.
- **Label** (13px, muted): every small caption. Mono labels add 0.14em tracking and caps.

**The Upright Serif Rule.** Marcellus has no italic, so emphasis switches face
instead (the quote's "experience itself" is set in Barlow caps).

## Layout

- **One grid.** Every homepage section sits on four equal columns (the status ribbon's). Content past column 1 starts `--col-inset` (20px) after its column line.
- **Gutters.** `--gutter` is fluid. Past `--page-max` (2400px) the gutter grows instead of the content, and viewport-scaled type is capped to match. Backgrounds and rules still run edge to edge.
- **Rhythm.** Every section uses `--section-space` top and bottom.
- **Breakpoint.** One content-led breakpoint at 700px (the `phone:` variant). Phones keep every idea and its scale: display type is sized to fill the width between the gutters (TRISTAN and KENNEDY, FAVORITES., each poster title by its longest word), not shrunk to a fixed vw. Grids stack, and compositions reorder rather than shrink. Rotation is allowed where it buys scale: the poster keywords run vertically beside their titles.
- **First screen.** About and the Index open as posters: the title locks to the foot of the screen with its image rising above it, and the content starts past the fold. Both are also capped by the screen's height so they fit on laptops.
- **Order.** Each page sets its own surface order in its surface brief. The footer is always charcoal.
- Touch targets are at least 44px tall where links stand alone.

## Elevation & Depth

Flat. Depth comes from tonal sections, type scale, rules, and a few deliberate
overlaps: Douglas over TRISTAN, the name over the globe, and the quote over the
apple's lit side. Text that crosses imagery or the git log gets a paper outline or
halo rather than a box, and Index titles carry a charcoal outline that only shows once
a scene runs behind them. Overlaps land hardest when they're rare, so each one
should have a reason.

## Shapes

Square and unboxed. Hairlines divide the status ribbon and Favorites. Heavy rules
(`clamp(6px, 0.8vw, 14px)`) run from the About, Favorites, and Index headings to the
screen edge. The closing scene is the only box: a
`clamp(2px, 0.2vw, 3px)` charcoal frame that the apple breaks.

## Components

- **Text links.** Underlined at 1px, thickening to 2px on hover and focus (the `link` utility). Index rows don't underline.
- **Status ribbon.** A 14px line between two rules: live clock, "Listening to" a linked song, the place, and "Working on" (linked), separated by short dashes. It loops at 36px/s with no hover pause and stops offscreen. Copies are hidden from assistive technology. Reduced motion shows one still, wrapping list. Values come from `now` in `src/lib/site.ts`.
- **Dithered imagery.** The globe (muted ink, behind the hero name, Rogers marked by a charcoal dot), the apple (charcoal on a paper silhouette, beside the quote), the About portrait (charcoal on a paper silhouette, from a photo), the Index hand (the same treatment, God's arm from _The Creation of Adam_ reaching down from the top right, an index finger answering the portrait), the About record (muted ink on charcoal, half out of its dithered album sleeve, its label turning at 33⅓ rpm while the sheen stays put under the sun), and the About map, where a small charcoal plane with a paper halo flies a dashed route through every place the owner has lived. All use whole `--dot` pixels (3px, 2px on phones), a 4×4 Bayer threshold with fixed 15% jitter, and one upper-right sun; photos are mirrored or chosen so their light agrees. Static PNG frames show before JavaScript and under reduced motion. The henry.codes signatures (fine engravings, skyline footer) are its own; ours stay coarse and two-ink.
- **Heading rules.** About's script lockup ("Me," in Marcellus, with "briefly" in the script across it) and INDEX. have their rules running right. Favorites mirrors it, with the rule running in from the left to right-aligned caps. Recents repeats the move in miniature: a hairline and a small mono label.
- **Poster rows.** Alternating Barlow caps (odd) and Marcellus (even, set right). Each has a misregistered dithered shadow, a dithered trail repeating off the screen edge, and stacked keyword caps hung at cap height. Hover nudges the echoes and dims the other rows.
- **Index rows.** One unbroken scroll with no year breaks, one entry per line, shrinking on one curve with age. The newest 12 stack their date and tags beside the title, the next 50 run them on a mono line, and the oldest keep only a date, with their size, side, offset, and tone mixed. Dates and tags are always lowercase mono, and titles never underline. Faces and sides alternate counting from the oldest entry so new entries never reshuffle old rows.
- **Peeks.** With a mouse, only a row's text hovers and clicks. On touch screens the row at a reading line 40% down the screen opens by itself, and the whole row taps. The active row dims the others, gets a dithered echo in its colour, and opens its scene: a small animated scene on the shared threshold and `--dot`, rising from behind the title and fading at a rough organic edge. Every entry's scene is its own. Keep them small, like Maine's, and specific to the entry. An entry without one gets a boiling splat of its colour, or stays type only.
- **Terminal listing.** Recents, About's log, and the Index bar use the mono voice: a `---
  name: Tristan Kennedy
  description: A typography-led personal archive in warm charcoal and paper.
  colors:
  charcoal: "#292824"
  paper: "#f2f0e9"
  muted: "#b8b5aa"
  ink-muted: "#67645b"
  rule: "#55534b"
  rule-on-paper: "#c9c6bb"
  echo: "#6c6a62"
  wipe: "#55534b"
  typography:
  display:
  fontFamily: "Barlow Condensed, sans-serif"
  fontSize: "min(23vw, 552px)"
  fontWeight: 800
  lineHeight: 0.8
  letterSpacing: "-0.035em"
  headline:
  fontFamily: "Barlow Condensed, sans-serif"
  fontSize: "clamp(76px, 12vw, 288px)"
  fontWeight: 800
  lineHeight: 0.8
  letterSpacing: "-0.03em"
  lead:
  fontFamily: "Marcellus, Georgia, serif"
  fontSize: "clamp(28px, 2.9vw, 50px)"
  fontWeight: 400
  lineHeight: 1.15
  letterSpacing: "-0.02em"
  title:
  fontFamily: "Marcellus, Georgia, serif"
  fontSize: "clamp(28px, 3vw, 48px)"
  fontWeight: 400
  lineHeight: 1.2
  body:
  fontFamily: "Arial, Helvetica, sans-serif"
  fontSize: "clamp(18px, 1.4vw, 22px)"
  fontWeight: 400
  lineHeight: 1.65
  label:
  fontFamily: "Arial, Helvetica, sans-serif"
  fontSize: "13px"
  fontWeight: 400
  lineHeight: 1.45
  mono-label:
  fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
  fontSize: "13px"
  fontWeight: 400
  letterSpacing: "0.14em"
  signature:
  fontFamily: "Mrs Saint Delafield, cursive"
  fontWeight: 400
  rounded:
  none: "0px"
  spacing:
  gutter: "max(24px, 5vw, calc((100vw - 2400px) / 2 + 120px))"
  col-inset: "20px"
  section: "clamp(56px, 7vw, 112px)"
  dot: "3px"
  components:
  text-link:
  textColor: "{colors.paper}"
  heading-rule:
  textColor: "{colors.paper}"
  height: "clamp(6px, 0.8vw, 14px)"
  status-ribbon:
  textColor: "{colors.paper}"
  padding: "12px 0"
  colophon:
  backgroundColor: "{colors.charcoal}"
  textColor: "{colors.paper}"

---

# Design System: Tristan Kennedy

## Overview

**Creative North Star: "The Printed Archive"**

Typography carries the identity. Heavy condensed caps and an upright serif give
ordinary titles their own compositions, while quiet body copy and small labels keep
the reading path clear. Warm charcoal and paper surfaces sit beneath dramatic
changes in scale and alignment. Character comes from the material Tristan
publishes, a few dithered images, and small printed-matter details such as a
colophon, a ruled frame, and a terminal listing. It never comes from a themed
costume.

The homepage, About, and the Index share this system. Colour belongs to entries: the
Index stays monochrome until a row opens its own small scene. Entry pages own their
own visual systems and are designed with the owner one section at a time.

**Key Characteristics:**

- Dramatic scale contrast between Barlow Condensed caps and upright Marcellus.
- Two surfaces, charcoal and paper, with monochrome resting states.
- Fluid gutters, full width, one four-column grid, controlled asymmetry.
- Flat, square geometry. Rules mark meaningful boundaries.
- Dithered imagery that shares one dot, one pattern, and one sun.
- Motion that is mostly sideways, plays once, and disappears with reduced motion. Index scenes are the deliberate exception: they loop while their row is active.

## Colors

Warm and tonal. Contrast between sections carries the structure.

### Neutral

- **Charcoal** (#292824): the default surface, and text on paper.
- **Paper** (#f2f0e9): the light surface, and text on charcoal.
- **Muted** (#b8b5aa): supporting text on charcoal, and the globe's ink.
- **Ink Muted** (#67645b): supporting text on paper.
- **Rule** (#55534b on charcoal, #c9c6bb on paper): structural hairlines.
- **Echo** (#6c6a62): the dim dither behind the Favorites titles and their hover dimming.
- **Wipe** (#55534b): the one colour of every plain page transition, off-charcoal so it reads the same leaving paper or charcoal.

The `paper` utility flips a section to the light surface and swaps `muted` and
`rule` for their on-paper values. Surface treatments are fixed per page rather
than chosen by the visitor.

**The Resting Monochrome Rule.** Shared pages are charcoal and paper at rest,
imagery included. Each page decides how much of each it uses: the homepage
alternates them, while About stays mostly on paper, and the Index stays on charcoal.
The only colour on a shared page belongs to an entry, set by `colour` in its
`entry.json`. It appears on the Index while that entry's row is active and carries
through the sweep into its page.

## Typography

**Display:** Barlow Condensed 800.
**Serif:** Marcellus 400, always upright.
**Body/Label:** Arial, Helvetica, sans-serif.
**Mono:** ui-monospace stack, for terminal voices (About's log, Recents, the Index's `$ grep` bar and row dates, the colophon label, quote marks).
**Script:** Mrs Saint Delafield, used sparingly as a signature: Douglas in the hero, "briefly" in About's heading, and the colophon's "Tristan" signature. Its rarity is what makes it read as handwriting.

All three webfonts load from `@fontsource` packages at the needed weights, with no
preloads or manual copies.

### Hierarchy

- **Display** (`min(23vw, 552px)`, 0.8): the hero name and INDEX.
- **Headline** (`clamp(76px, 12vw, 288px)`): FAVORITES. Poster titles size themselves from their character count to fill most of the row.
- **Lead** (`clamp(28px, 2.9vw, 50px)`, Marcellus): About's two-sentence line.
- **Index titles** (Barlow and Marcellus, alternating): one curve from 14% of the list's width on the newest entry down to about 2%, never set by a title's length, so long titles wrap rather than shrink. 18px is the floor.
- **Body** (`clamp(18px, 1.4vw, 22px)`, 1.65; 17px on the homepage at phone width): hero intro, hero links, About paragraphs.
- **Note** (15px, muted): About's captions, footnotes, and secondary links, a step between label and body.
- **Label** (13px, muted): every small caption. Mono labels add 0.14em tracking and caps.

**The Upright Serif Rule.** Marcellus has no italic, so emphasis switches face
instead (the quote's "experience itself" is set in Barlow caps).

## Layout

- **One grid.** Every homepage section sits on four equal columns (the status ribbon's). Content past column 1 starts `--col-inset` (20px) after its column line.
- **Gutters.** `--gutter` is fluid. Past `--page-max` (2400px) the gutter grows instead of the content, and viewport-scaled type is capped to match. Backgrounds and rules still run edge to edge.
- **Rhythm.** Every section uses `--section-space` top and bottom.
- **Breakpoint.** One content-led breakpoint at 700px (the `phone:` variant). Phones keep every idea and its scale: display type is sized to fill the width between the gutters (TRISTAN and KENNEDY, FAVORITES., each poster title by its longest word), not shrunk to a fixed vw. Grids stack, and compositions reorder rather than shrink. Rotation is allowed where it buys scale: the poster keywords run vertically beside their titles.
- **First screen.** About and the Index open as posters: the title locks to the foot of the screen with its image rising above it, and the content starts past the fold. Both are also capped by the screen's height so they fit on laptops.
- **Order.** Each page sets its own surface order in its surface brief. The footer is always charcoal.
- Touch targets are at least 44px tall where links stand alone.

## Elevation & Depth

Flat. Depth comes from tonal sections, type scale, rules, and a few deliberate
overlaps: Douglas over TRISTAN, the name over the globe, and the quote over the
apple's lit side. Text that crosses imagery or the git log gets a paper outline or
halo rather than a box, and Index titles carry a charcoal outline that only shows once
a scene runs behind them. Overlaps land hardest when they're rare, so each one
should have a reason.

## Shapes

Square and unboxed. Hairlines divide the status ribbon and Favorites. Heavy rules
(`clamp(6px, 0.8vw, 14px)`) run from the About, Favorites, and Index headings to the
screen edge. The closing scene is the only box: a
`clamp(2px, 0.2vw, 3px)` charcoal frame that the apple breaks.

## Components

- **Text links.** Underlined at 1px, thickening to 2px on hover and focus (the `link` utility). Index rows don't underline.
- **Status ribbon.** A 14px line between two rules: live clock, "Listening to" a linked song, the place, and "Working on" (linked), separated by short dashes. It loops at 36px/s with no hover pause and stops offscreen. Copies are hidden from assistive technology. Reduced motion shows one still, wrapping list. Values come from `now` in `src/lib/site.ts`.
- **Dithered imagery.** The globe (muted ink, behind the hero name, Rogers marked by a charcoal dot), the apple (charcoal on a paper silhouette, beside the quote), the About portrait (charcoal on a paper silhouette, from a photo), the Index hand (the same treatment, God's arm from _The Creation of Adam_ reaching down from the top right, an index finger answering the portrait), the About record (muted ink on charcoal, half out of its dithered album sleeve, its label turning at 33⅓ rpm while the sheen stays put under the sun), and the About map, where a small charcoal plane with a paper halo flies a dashed route through every place the owner has lived. All use whole `--dot` pixels (3px, 2px on phones), a 4×4 Bayer threshold with fixed 15% jitter, and one upper-right sun; photos are mirrored or chosen so their light agrees. Static PNG frames show before JavaScript and under reduced motion. The henry.codes signatures (fine engravings, skyline footer) are its own; ours stay coarse and two-ink.
- **Heading rules.** About's script lockup ("Me," in Marcellus, with "briefly" in the script across it) and INDEX. have their rules running right. Favorites mirrors it, with the rule running in from the left to right-aligned caps. Recents repeats the move in miniature: a hairline and a small mono label.
- **Poster rows.** Alternating Barlow caps (odd) and Marcellus (even, set right). Each has a misregistered dithered shadow, a dithered trail repeating off the screen edge, and stacked keyword caps hung at cap height. Hover nudges the echoes and dims the other rows.
- **Index rows.** One unbroken scroll with no year breaks, one entry per line, shrinking on one curve with age. The newest 12 stack their date and tags beside the title, the next 50 run them on a mono line, and the oldest keep only a date, with their size, side, offset, and tone mixed. Dates and tags are always lowercase mono, and titles never underline. Faces and sides alternate counting from the oldest entry so new entries never reshuffle old rows.
- **Peeks.** With a mouse, only a row's text hovers and clicks. On touch screens the row at a reading line 40% down the screen opens by itself, and the whole row taps. The active row dims the others, gets a dithered echo in its colour, and opens its scene: a small animated scene on the shared threshold and `--dot`, rising from behind the title and fading at a rough organic edge. Every entry's scene is its own. Keep them small, like Maine's, and specific to the entry. An entry without one gets a boiling splat of its colour, or stays type only.
  prompt, short rows, and a blinking block cursor (still under reduced motion). The bar's `$ grep` has no box, so it reads as a live command line.
- **Colophon footer.** On every page: centred and small under three dithered diamonds, with a mono "COLOPHON" label, a Marcellus note on how the site is made, the latest commit and change count, one row of links, a script signature, and a small line with the copyright, live clock, and Back to top.
- **Page transitions.** A dithered sweep (`src/lib/sweep.ts`), the site's own material rather than a crossfade. Clicking a link to another page covers the screen in off-charcoal dots on the shared threshold and `--dot`, sweeping left to right (0.32s, accelerating). The next page loads under the cover, and the dots clear the same way (0.48s, decelerating). Links home sweep right to left. Clicking an entry with a `colour` spreads that colour as a splotch from the title's centre instead, and its page opens through the same splotch from the same spot, so the whole move has one origin. Back and Forward have no animation: the browser can't delay leaving, so only half could ever play, and they're outside the site's own navigation.

  An inline head script and an inlined `html[data-sweep]` rule keep the arriving page covered before first paint, and hold its CSS animations on their first frame until the clear starts, so the homepage name wipes in as the dots lift. The clear advances frame by frame (no frame counts for more than 1/30s), so a busy page start still shows every step. The curtain is pinned to the viewport so it never adds a scrollbar. It skips reduced motion, modified clicks, new tabs, downloads and files, and same-page links, and a stalled load uncovers the page after 4s. Astro prefetches links so the next page is usually ready first. Native cross-document View Transitions (no Firefox support, and a muddy crossfade between surfaces), a clip-path wipe, and choosing charcoal or paper by page (inconsistent between light and dark pages) were all tried first.

- **Entrances.** The hero loads in with CSS (name halves wiped from opposite sides, Douglas written left to right, globe fading up, ribbon and intro rising). Other sections play a one-time sideways entrance when they come into view (`src/lib/reveal.ts`), staggered so each unfolds in order. Nothing is tied to scroll position.

## Do's and Don'ts

### Do

- Use charcoal and paper for every shared surface, adapting muted text to the surface.
- Pair heavy Barlow Condensed with upright Marcellus, and save the script for moments that read as a signature.
- Keep fluid gutters, full width, the four-column grid, and controlled asymmetry.
- Keep content readable before JavaScript, without hover, and under reduced motion.
- Keep every dithered piece on the shared dot, pattern, and sun.
- Make each Index scene small, organic, and unmistakably about its entry.
- Give each page its own composition. Borrow the system, not another page's layouts.

### Don't

The system has no blanket prohibitions. Decisions made while designing a page,
including what the owner tried and rejected, live in that page's surface brief in
`.impeccable/surfaces/` and apply there.
