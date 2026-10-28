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
the reading path clear. Warm charcoal and paper sections alternate beneath dramatic
changes in scale and alignment. Character comes from the material Tristan
publishes, a few dithered images, and small printed-matter details such as a
colophon, a ruled frame, and a terminal listing. It never comes from a themed
costume.

The homepage and index share this system. Entry pages own their own visual systems
and are designed with the owner one section at a time.

**Key Characteristics:**

- Dramatic scale contrast between Barlow Condensed caps and upright Marcellus.
- Two surfaces, charcoal and paper, with monochrome resting states.
- Fluid gutters, full width, one four-column grid, controlled asymmetry.
- Flat, square geometry. Rules mark meaningful boundaries.
- Dithered imagery that shares one dot, one pattern, and one sun.
- Motion that is mostly sideways, plays once, and disappears with reduced motion.

## Colors

Warm and tonal. Contrast between sections carries the structure.

### Neutral

- **Charcoal** (#292824): the default surface, and text on paper.
- **Paper** (#f2f0e9): the light surface, and text on charcoal.
- **Muted** (#b8b5aa): supporting text on charcoal, and the globe's ink.
- **Ink Muted** (#67645b): supporting text on paper.
- **Rule** (#55534b on charcoal, #c9c6bb on paper): structural hairlines.
- **Echo** (#6c6a62): the dim dither behind the Favorites titles and their hover dimming.

The `paper` utility flips a section to the light surface and swaps `muted` and
`rule` for their on-paper values. Surface treatments are fixed. There is no
visitor theme toggle.

**The Resting Monochrome Rule.** The homepage and index are charcoal and paper at
rest, imagery included. No third surface colour and no chromatic accent.

## Typography

**Display:** Barlow Condensed 800.
**Serif:** Marcellus 400, always upright.
**Body/Label:** Arial, Helvetica, sans-serif.
**Mono:** ui-monospace stack, for terminal voices (About's log, Recents, the colophon label, quote marks).
**Script:** Mrs Saint Delafield, for exactly three uses: Douglas in the hero, "briefly" in About's heading, and the colophon's "Tristan" signature.

All three webfonts load from `@fontsource` packages at the needed weights, with no
preloads or manual copies.

### Hierarchy

- **Display** (`min(23vw, 552px)`, 0.8): the hero name.
- **Headline** (`clamp(76px, 12vw, 288px)`): FAVORITES. and the index heading. Poster titles size themselves from their character count to fill most of the row.
- **Lead** (`clamp(28px, 2.9vw, 50px)`, Marcellus): About's two-sentence line.
- **Title** (`clamp(28px, 3vw, 48px)`, Marcellus): index entry titles.
- **Body** (`clamp(18px, 1.4vw, 22px)`, 1.65; 17px on the homepage at phone width): hero intro, hero links, About paragraphs.
- **Label** (13px, muted): every small caption. Mono labels add 0.14em tracking and caps.

**The Upright Serif Rule.** Marcellus never italicises. Emphasis switches face
instead (the quote's "experience itself" is set in Barlow caps).

## Layout

- **One grid.** Every homepage section sits on four equal columns (the status ribbon's). Content past column 1 starts `--col-inset` (20px) after its column line.
- **Gutters.** `--gutter` is fluid. Past `--page-max` (2400px) the gutter grows instead of the content, and viewport-scaled type is capped to match. Backgrounds and rules still run edge to edge.
- **Rhythm.** Every section uses `--section-space` top and bottom.
- **Breakpoint.** One content-led breakpoint at 700px (the `phone:` variant). Phones keep every idea and shed clutter. They stack most grids, but the closing scene keeps its four-column composition.
- **Order.** Charcoal hero, paper About, charcoal Favorites, paper closing scene, charcoal footer. Hero and footer are always charcoal.
- Touch targets are at least 44px tall where links stand alone.

## Elevation & Depth

No shadows. Depth comes from tonal sections, type scale, rules, and a few
deliberate overlaps: Douglas over TRISTAN, the name over the globe, and the quote
over the apple's lit side. Text that crosses imagery or the git log gets a paper
outline or halo, never a box. These overlaps are not a general layout device.

## Shapes

Square and unboxed. Hairlines divide the status ribbon, Favorites, and the index's
years. Heavy rules (`clamp(6px, 0.8vw, 14px)`) run from the About and Favorites
headings to the screen edge. The closing scene is the only box: a
`clamp(2px, 0.2vw, 3px)` charcoal frame that the apple breaks.

## Components

- **Text links.** Underlined at 1px, thickening to 2px on hover and focus (the `link` utility). Entry rows underline only their title. No arrows.
- **Status ribbon.** A 14px line between two rules: live clock, "Listening to" a linked song, the place, and "Working on" (linked), separated by short dashes. It loops at 36px/s with no hover pause and stops offscreen. Copies are hidden from assistive technology. Reduced motion shows one still, wrapping list. Values come from `now` in `src/lib/site.ts`.
- **Dithered imagery.** The globe (muted ink, behind the hero name, Rogers marked by a charcoal dot) and the apple (charcoal on a paper silhouette, beside the quote). Both use whole `--dot` pixels (3px, 2px on phones), a 4×4 Bayer threshold with fixed 15% jitter, and one upper-right sun. Static PNG frames show before JavaScript and under reduced motion. Don't borrow henry.codes' signatures (fine engravings, skyline footer).
- **Heading rules.** About's script lockup ("Me," in Marcellus, with "briefly" in the script across it) has its rule running right. Favorites mirrors it, with the rule running in from the left to right-aligned caps. Recents repeats the move in miniature: a hairline and a small mono label.
- **Poster rows.** Alternating Barlow caps (odd) and Marcellus (even, set right). Each has a misregistered dithered shadow, a dithered trail repeating off the screen edge, and stacked keyword caps hung at cap height. Hover nudges the echoes and dims the other rows.
- **Terminal listing.** Recents and About's log use the mono voice: a `$` prompt, short rows, and a blinking block cursor (still under reduced motion).
- **Colophon footer.** On every page: centred and small under three dithered diamonds, with a mono "COLOPHON" label, a Marcellus note on how the site is made, the latest commit and change count, one row of links, a script signature, and a small line with the copyright, live clock, and Back to top.
- **Entrances.** The hero loads in with CSS (name halves wiped from opposite sides, Douglas written left to right, globe fading up, ribbon and intro rising). Other sections play a one-time sideways entrance when they come into view (`src/lib/reveal.ts`), staggered so each unfolds in order. Nothing is tied to scroll position.

## Do's and Don'ts

### Do

- Use charcoal and paper for every shared surface, adapting muted text to the surface.
- Pair heavy Barlow Condensed with upright Marcellus. Keep the script to its three uses.
- Keep fluid gutters, full width, the four-column grid, and controlled asymmetry.
- Keep content readable before JavaScript, without hover, and under reduced motion.
- Keep every dithered piece on the shared dot, pattern, and sun.

### Don't

- Don't add a top navbar, pixel logo, theme toggle, red accent, or chromatic imagery.
- Don't box entries, turn keywords into pills, or add decorative shadows or borders.
- Don't use scroll-linked motion, italic Marcellus, or arrows on entry rows.
- Don't restore the rejected entry pages or hover previews, or impose this system on entry pages.
- Don't tie the shared identity to a content subject (coastlines, travel, ferns, shells).
