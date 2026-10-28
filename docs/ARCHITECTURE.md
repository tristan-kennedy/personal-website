# Architecture

A static Astro site, styled with Tailwind CSS v4 and deployed to Cloudflare Pages.

## Stack

| Concern | Use | Notes |
| --- | --- | --- |
| Framework | Astro (static output) | `.astro` components by default. |
| Styling | Tailwind CSS v4 via `@tailwindcss/vite` | Utility classes inline. No component stylesheets. |
| Interactive pieces | `@astrojs/react` | Available for future entry pages. Not used yet. |
| Long-form content | `@astrojs/mdx` | Optional, per page. No shared article renderer. |
| Fonts | `@fontsource/*` | Barlow Condensed 800, Marcellus 400, Mrs Saint Delafield 400. |
| Images | `sharp` | Astro image optimisation and `scripts/dither.mjs`. |
| Résumé | Typst (`typst` package) | `resume/` → `public/resume.pdf` on build. |
| Formatting | Prettier + astro + tailwindcss plugins | Sorts classes. Run `npx prettier --write .`. |

Don't add a dependency for something a few lines of browser code can do. The
dithered imagery, clocks, ribbon, and entrances are all hand-written and tiny.

## Layout

```
src/
  catalog/<slug>.json        Entry metadata (one file per entry, filename = slug)
  content.config.ts          The `entries` collection schema
  layouts/Layout.astro       <html>, head metadata, fonts, skip link, footer
  components/
    Footer.astro             Colophon footer, on every page
    ArchivePage.astro        Shared shell for /index and /about
    home/                    Homepage-only sections and pieces
      Hero.astro, HeroGlobe.astro, StatusStrip.astro
      About.astro, Favorites.astro, Recents.astro
      Closing.astro, DitherApple.astro, DitherFrame.astro
  pages/
    index.astro              Homepage
    index/index.astro        /index
    about.astro              /about
  lib/
    entries.ts               getEntries(), formatEntryDate()
    site.ts                  Personal details (`now`, `links`). Edit here, never inline
    history.ts               The site's git log, read once per build
    clock.ts                 Live clock shared by the ribbon and footer
    reveal.ts                One-time section entrances
    dither/                  Shared threshold and sun (index.ts), canvas loop,
                             globe, apple, and the generated land mask
  styles/global.css          Tailwind entry: theme, variants, base, utilities
scripts/
  dither.mjs                 Regenerate the static dither frames, or dither a photo
  land-mask.mjs              Regenerate src/lib/dither/land-mask.ts
  full-history.mjs           Unshallow CI checkouts so the git log is complete
public/                      Static files (favicon, résumé, dither PNGs, _headers)
resume/                      Typst résumé source and fonts
docs/                        PRODUCT.md, DESIGN.md, this file
```

Entry pages, when built, go at `src/pages/index/<slug>.astro` (or a dynamic route if
several share a shape). Their local assets live beside them. Each page owns its own
styles and scripts.

## Styling conventions

Everything is Tailwind. Write utilities inline on the element. Reach for
`global.css` only for something shared that a utility can't express.

`src/styles/global.css` holds:

- **Theme tokens**: `charcoal`, `paper`, `ink-muted`, `dim`, the contextual `muted`
  and `rule` (they change inside `paper`), the font families (`font-display`,
  `font-serif`, `font-script`, `font-mono`, `font-sans`), `text-body`, the `ease-*`
  curves, and the named `animate-*` entrances.
- **Layout variables** on `:root`: `--gutter`, `--col-inset`, `--section-space`,
  `--page-max`, and `--dot`. Use them as `px-(--gutter)`, `py-(--section-space)`, and so on.
- **Custom variants**:
  - `phone:` is the single 700px breakpoint (max-width).
  - `hover:` is plain `:hover`, without Tailwind's hover media query, so touch matches desktop.
  - `ready:` and `unrevealed:` target a `[data-reveal]` section's entrance. Put
    `reveal` on any piece that animates, and give it its hidden state with
    `unrevealed:` (for example `reveal unrevealed:opacity-0 unrevealed:-translate-x-8`).
    Stagger it with `[--delay:0.3s]` and stretch it with `[--reveal-duration:2s]`.
    The delay applies only while the section is entering (`revealing:`), so
    hover transitions stay immediate afterwards.
  - `enhanced:` and `running:` are for the status ribbon once JavaScript takes over.
- **Utilities**: `paper` (light surface), `link` (underline that thickens on hover
  and focus), `paper-outline-[w]` (paper text stroke under the fill),
  `paper-halo`, `dither-text` (dim dithered text fill), and `reveal`.
- **Base**: a small reset on top of Tailwind's preflight, plus focus and selection colours.

Within a component, a repeated class string can live in a frontmatter constant (see
`Footer.astro`). Never build class names from fragments: Tailwind only sees
complete strings in source.

## Content

`getEntries()` returns every catalog record, newest first, each with a `url` of
`/index/<slug>`. The homepage derives its picks and Recents from the same list. Dates
keep their precision (`YYYY-MM` or `YYYY-MM-DD`) through `formatEntryDate()`.

## Build and deploy

```bash
pnpm dev     # local server on :4321
pnpm build   # résumé, full git history, astro build → dist/
```

Cloudflare Pages runs `pnpm build` and publishes `dist/`. Source edits don't deploy
by themselves.
