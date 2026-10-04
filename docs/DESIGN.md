---
name: Tristan Kennedy
description: Swiss bold minimal portfolio with expressive type and restrained red accents.
colors:
  bg: "#f4f3f2"
  bg-elevated: "#ffffff"
  primary: "#222222"
  secondary: "#6c6c6c"
  subtle: "#b0b0b0"
  divider: "#ddd9d4"
  black: "#000000"
  white: "#f4f3f2"
  accent: "#d62828"
  dark-bg: "#0e0e10"
  dark-bg-elevated: "#1a1a1d"
  dark-primary: "#d4d4d8"
  dark-secondary: "#a5a5a5"
  dark-subtle: "#6c6c6c"
  dark-divider: "#2a2a2e"
typography:
  display:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "clamp(5.5rem, 14.5vw, 16rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "2.25rem"
    fontWeight: 300
    lineHeight: "2.5rem"
  body:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  article-body:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: "2rem"
  label:
    fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: "1rem"
    letterSpacing: "0.2rem"
rounded:
  square: "0px"
spacing:
  2: "0.5rem"
  4: "1rem"
  6: "1.5rem"
  8: "2rem"
  10: "2.5rem"
  12: "3rem"
  16: "4rem"
  24: "6rem"
  32: "8rem"
components:
  theme-toggle:
    textColor: "{colors.white}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
  navigation:
    backgroundColor: "{colors.bg}"
    textColor: "{colors.secondary}"
    padding: "1rem"
  selectable-row:
    textColor: "{colors.primary}"
    rounded: "{rounded.square}"
    padding: "1.5rem 0.5rem"
  tag:
    textColor: "{colors.subtle}"
    rounded: "{rounded.square}"
  tooltip:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.bg}"
    rounded: "{rounded.square}"
    padding: "0.5rem 0.75rem"
---

# Design System: Tristan Kennedy

## Overview

The existing system is Swiss bold minimal: a typography-led portfolio with
oversized, tightly spaced display text, generous whitespace, and restrained
ornamentation. Heavy uppercase page identities sit alongside light headlines,
quiet metadata, and readable long-form content.

This document records the current implementation and the owner's constraints;
it does not propose a replacement identity. `src/global.css` and the reusable
components remain the implementation sources. Update this record when an
intentional design change lands.

**Key Characteristics:**

- Strong scale and weight contrast within one font family.
- Warm light surfaces and near-black dark surfaces.
- A single red accent for navigation, emphasis, and interaction.
- Square geometry, flat surfaces, and content-led layouts.
- Spacing and typography provide the primary hierarchy.

## Colors

The palette pairs neutral surfaces and text with a clear red accent. Frontmatter
values mirror the existing CSS tokens; the `dark-` entries describe the overrides
of the corresponding tokens, rather than additional CSS variables.

### Primary accent

`accent` is the signal red used for interactive emphasis, the menu marker,
collection counts, small overview markers, and the full menu background. Preserve
that existing menu treatment; on ordinary content pages, use the accent sparingly.

### Neutral

- `bg` is the warm paper page surface; `bg-elevated` supports code and demos.
- `primary` carries main text; `secondary` carries supporting copy.
- `subtle` carries quiet dates, numbering, and metadata. Check contrast for the
  actual size and surface before using it for essential content.
- `divider` supports the existing structural separators.
- `white` is warm off-white, including menu text and image-hero text; `black`
  supports cover-image overlays.
- The `dark-` equivalents preserve those roles under `data-theme="dark"`.
  Accent, black, and white keep their existing values in both themes.

**The Existing Tokens Rule.** Use the semantic tokens from `src/global.css` and
their Tailwind utilities. Do not introduce a new palette for ordinary additions.

## Typography

Inter is the display and body family. Preserve its existing Google Fonts import
and fallback stack; generic skill advice about avoiding Inter does not override
this project's explicit font choice. Technical code blocks retain the existing
monospace utility.

### Hierarchy

- **Display:** black weight (900), uppercase, tight tracking and compact leading.
  The frontmatter describes the desktop homepage title. Mobile uses an explicit
  four-line name treatment and a smaller fluid scale; collection and detail
  heroes have their own existing clamps. Reuse the relevant hero component.
- **Headline:** light weight (300) for section statements and selectable-row
  titles; the frontmatter captures their recurring size.
- **Body:** regular weight with secondary text. Homepage copy uses normal body
  leading; `.mdx` article copy uses the more open article-body leading.
- **Article headings:** regular weight, primary text, and generous vertical
  separation. Preserve the `.mdx` h1-h4 rules rather than treating article
  headings as display heroes.
- **Label:** small uppercase metadata and navigation with wide tracking. Tags
  use the existing slightly tighter tracking (0.18rem).

**The One Family Rule.** Create hierarchy with size, weight, spacing, and case
within Inter. Do not add another display or body font.

## Layout

The shared page shell has horizontal gutters of 2rem. The sticky navigation and
detail heroes extend through those gutters using the existing full-width
patterns. The homepage separates major sections by 4rem, growing to 6rem and
8rem at the medium and large breakpoints.

On small screens, content stacks vertically; display titles use deliberate line
breaks. Rows become horizontal at the medium breakpoint, with numbering and
metadata appearing when space permits. Homepage experiment previews become a
row at the extra-large breakpoint. Hero section links appear at the large
breakpoint; the dedicated menu remains available across devices.

Long-form content and detail overviews center within a maximum width of 720px.
Preserve these reading widths and responsive components. The existing Tailwind
breakpoints are recorded in `.impeccable/design.json`.

## Elevation & Depth

The portfolio chrome is flat and does not use decorative shadows. Depth comes
from tonal surfaces, foreground/background contrast, image overlays, and
positioning. Navigation stays above content; the cursor tooltip overlays it.
Interactive experiment canvases may have their own visuals as part of the work.

## Shapes

Portfolio components use square corners, rectangular image crops, and the
existing geometric logo, menu square, and barcode. Preserve the broad preference
for little linework. The incumbent implementation has fine separators in
navigation, sections, rows, and metadata; retain them when reusing those
components, and avoid adding decorative borders elsewhere.

## Components

### Navigation and menu

`Navigation.astro` is a sticky neutral bar with the existing logo and red menu
square. Labels become visible from the medium breakpoint. Hover turns actionable
text red and rotates the geometric markers. The menu is a full-height red page
with large navigation links, a back action, and the theme toggle.

### Theme toggle

`ThemeToggle.tsx` is a transparent text button displaying LIGHT / DARK. The active
theme has stronger weight; the other label is quieter. It updates `data-theme`
and the saved theme preference. Preserve theme preparation across Astro page
transitions and system preference on an initial visit.

### Selectable rows

`SelectableRow.astro` is the common full-row link for projects and posts. It
combines a light title, supporting description, optional tags or reading length,
date, numbering, and an arrow. Hover gives a faint accent wash and turns the
title and arrow red. Keep the whole row actionable and retain its stacked-to-row
responsive behavior.

### Tags and experiment previews

Technology tags are plain uppercase metadata, with no pill background or border.
Experiment previews are unboxed image links, followed by a light title and tags.
Their cover crop has an aspect ratio of 1.25:1 and a gentle hover zoom. Use the
real collection image and Astro's image optimization.

### Detail hero and article

`SlugHero.astro` uses a full-bleed cover image, legibility overlay, heavy title,
back link, metadata strip, and restrained overview. Detail routes then render
the entry within `.mdx`; reuse the established prose, list, code, figure, and
caption treatments.

### Tooltip and motion

`Tooltip.tsx` displays a square inverse-color READ MORE label near the pointer.
It is supplemental to the actual link, rather than the sole way to identify an
action. Existing reveal motion uses short translations and opacity, with a
smooth deceleration curve. Hover motion uses modest shifts, rotations, and image
zoom. Preserve reduced-motion handling and Astro transition behavior.

## Do's and Don'ts

### Do

- Do reuse the existing semantic color tokens and light/dark overrides.
- Do use Inter and the established display, headline, body, and label hierarchy.
- Do let whitespace, typography, and real content lead the composition.
- Do reuse collection rows, detail heroes, and MDX styles across related pages.
- Do preserve responsive layouts, visible content, and reduced-motion behavior.

### Don't

- Don't add new font families or palettes for routine changes.
- Don't add decorative borders, shadows, rounded panels, or extra ornamentation.
- Don't turn plain metadata into pills or nest the portfolio content in cards.
- Don't apply a demo's visual treatment to the surrounding portfolio chrome.
- Don't replace the established identity during documentation or maintenance.
