# Architecture

A static Astro site, styled with Tailwind CSS v4 and deployed to Cloudflare Workers as static assets.

## Stack

| Concern            | Use                                     | Notes                                                         |
| ------------------ | --------------------------------------- | ------------------------------------------------------------- |
| Framework          | Astro (static output)                   | `.astro` components by default.                               |
| Styling            | Tailwind CSS v4 via `@tailwindcss/vite` | Utility classes inline. No component stylesheets.             |
| Interactive pieces | `@astrojs/react`                        | Available for future entry pages. Not used yet.               |
| Long-form content  | `@astrojs/mdx`                          | Optional, per page. No shared article renderer.               |
| Fonts              | `@fontsource/*`                         | Barlow Condensed 800, Marcellus 400, Mrs Saint Delafield 400. |
| Images             | `sharp`                                 | Astro image optimisation and `scripts/dither.mjs`.            |
| Résumé             | Typst (`typst` package)                 | `resume/` → `public/resume.pdf` on build.                     |
| Formatting         | Prettier + astro + tailwindcss plugins  | Sorts classes. Run `npx prettier --write .`.                  |

Don't add a dependency for something a few lines of browser code can do. The
dithered imagery, clocks, ribbon, and entrances are all hand-written and tiny.

## Layout

```
src/
  entries/<slug>/            Everything for one entry, kept together:
    entry.json               Metadata (the folder name is the slug)
    effect.ts                Its Index hover effect (optional)
    Page.astro               Its page at /index/<slug> (optional)
    (assets)                 Sprites, images, and anything else it needs
  content.config.ts          The `entries` collection schema
  layouts/Layout.astro       <html>, head metadata, fonts, skip link, footer
  components/
    Footer.astro             Colophon footer, on every page
    EntryStub.astro          Placeholder page for entries with nothing yet
    SiteNav.astro            Home link plus one page link, on /index and /about
    Reveal.astro             Entrance setup for pages with [data-reveal] sections
    DitherFrame.astro        Static dither frame plus the canvas that replaces it
    about/                   About-only sections (Opener, Where, Work, Media, Tldr)
                             and the shared Blurb and SectionHeading
    home/                    Homepage-only sections and pieces
      Hero.astro, HeroGlobe.astro, StatusStrip.astro
      About.astro, Favorites.astro, Recents.astro
      Closing.astro, DitherApple.astro
    index/                   EntryRow.astro and EntryMeta.astro (one entry per line) and
                             IndexBar.astro (search and random)
  pages/
    index.astro              Homepage
    index/index.astro        /index
    index/[slug].astro       Serves each entry's own Page.astro
    about.astro              /about
  lib/
    entries.ts               getEntries(), formatEntryDate()
    scatter.ts               Row tiers by age and each entry's stable placement
    hash.ts                  Stable seed from a string
    peek.ts                  Picks the active row and opens its effect
    index-bar.ts             Search and random on /index
    site.ts                  Personal details (`now`, `moves`, `links`, `work`,
                             `education`, `opinions`, `questions`, the About copy
                             in `about`, the Letterboxd feed). Edit here, never inline
    history.ts               The site's git log, read once per build
    letterboxd.ts            Recent films and dithered posters, read once per build;
                             an unreachable feed yields no films, never a failed build
    clock.ts                 Live clock shared by the ribbon and footer, and m:ss
                             durations
    motion.ts                The reduced-motion media query
    reveal.ts                One-time section entrances
    sweep.ts                 Dithered page-to-page transition
    dither/                  Shared threshold and sun (index.ts), palette, whole-dot
                             canvas sizing (fit.ts), canvas loop,
                             globe, apple, About portrait and record, the About map projection and
                             flight route (where.ts, route.ts), build-time dithering of
                             remote images (remote.ts) and the live poster canvas
                             (poster.ts), the Index effect stage (effect.ts), the noise and
                             splotch behind the sweep (splotch.ts), and the generated
                             land mask
  styles/global.css          Tailwind entry: theme, variants, base, utilities
scripts/
  dither.mjs                 Regenerate the static dither frames (globe, apple, the
                             About map, phone map, and record), or dither a photo
  land-mask.mjs              Regenerate src/lib/dither/land-mask.ts
  full-history.mjs           Unshallow CI checkouts so the git log is complete
public/                      Static files (favicon, résumé, dither PNGs, _headers)
wrangler.jsonc               Workers deploy config: serves dist/ as static assets
resume/                      Typst résumé source and fonts
docs/                        PRODUCT.md, DESIGN.md, this file
```

Each entry page is `src/entries/<slug>/Page.astro`, beside that entry's metadata and
effect, with its assets in the same folder. It receives `entry` as a prop and owns its
own layout, styles, and scripts. `src/pages/index/[slug].astro` is the only route; it
finds the page, and an entry without a `Page.astro` gets `EntryStub.astro`.

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
  `paper-halo`, `dither-text` (dim dithered text fill), `dither-fill` (a
  current-colour checker on the shared dot), and `reveal`.
- **Base**: a small reset on top of Tailwind's preflight, plus focus and selection colours.

Within a component, a repeated class string can live in a frontmatter constant (see
`Footer.astro`). Never build class names from fragments: Tailwind only sees
complete strings in source.

## Content

`getEntries()` returns every entry, newest first, each with a `url` of
`/index/<slug>`. The homepage derives its picks and Recents from the same list. Dates
keep their precision (`YYYY-MM` or `YYYY-MM-DD`) through `formatEntryDate()`.

### Adding an entry

Add `src/entries/<slug>/entry.json`. That is all an entry needs. The rest is optional,
and each level works without the others:

1. **Colour.** `"colour": "#rrggbb"` in the JSON gives the row a boiling splat
   behind its title and turns the page sweep that colour.
2. **Effect.** `effect.ts` in the entry's folder default-exports an `Effect` (see
   `src/lib/dither/effect.ts`) that replaces the splat with its own animation. `reach`
   sets how far it spreads from the title on each side, in title heights (capped at
   170px). `paint` gets the stage and returns a function that fills `pixels` each
   frame. Skip any cell where `gate[i] >= reveal`, which gives every effect the same
   rough edge, and ink cells through `threshold(x, y)` so it stays on the shared dot.
   It needs to look right at `seconds = 6`, the still frame under reduced motion. An
   optional `prepare` runs first, for loading anything the effect needs, like a sprite.
3. **Page.** `Page.astro` in the entry's folder replaces the placeholder at
   `/index/<slug>`.

An effect stays small and hugs its title, never takes clicks, keeps the title readable
(rows always sit above it), and has a still frame under reduced motion. See the scenes
in the Index surface brief. `src/entries/` is read by globs, so nothing needs
registering. Restart `pnpm dev` after adding a folder.

## Build and deploy

```bash
pnpm dev     # local server on :4321
pnpm build   # résumé, full git history, astro build → dist/
```

Workers Builds runs `pnpm build`, then `wrangler deploy` serves `dist/` per `wrangler.jsonc`.

Internal links end in a slash (`/index/`, `/about/`, `/index/<slug>/`), and Astro's
`trailingSlash: "always"` holds dev to the same rule. Cloudflare treats `/index` as the
root `index.html` and sends it to the homepage, while `/index/` serves the Index. Other
pages only cost an extra redirect without the slash.
