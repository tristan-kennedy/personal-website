# AGENTS.md

Tristan Kennedy's personal archive: Astro, Tailwind CSS v4, static on Cloudflare Workers (static assets).

## Read first

- `docs/PRODUCT.md`: what the site is for, the content model, and constraints.
- `docs/DESIGN.md`: the visual system. Read it before any interface change.
- `docs/ARCHITECTURE.md`: file layout, packages, and styling conventions.
- `.impeccable/surfaces/`: each page's composition and what was rejected (`src-pages-index-astro.md` is the homepage, `src-pages-index-index-astro.md` is the Index, `src-pages-about-astro.md` is About, `src-pages-404-astro.md` is the 404, `src-entries-dipsy-dolphin-page-astro.md` is Dipsy's page, `src-entries-escapism-as-escapism-page-astro.md` is Escapism, `src-entries-2d-raycasting-page-astro.md` is the raycasting simulator).
- Impeccable lives in `.agents/skills/impeccable/` (pinned by `skills-lock.json`, defaults in `.impeccable/config.json`). Follow its SKILL.md for design work. The owner's explicit instructions take precedence.

## Rules

- Style with inline Tailwind utilities. Extend `src/styles/global.css` only for shared tokens, variants, or utilities a class can't express.
- Keep comments to a minimum. Name things well instead.
- Personal details live in `src/lib/site.ts`. Never hard-code them elsewhere.
- Every dithered piece uses the shared threshold, sun, and `--dot`.
- Everything for one entry lives in `src/entries/<slug>/`. The top level holds only `entry.json`, `peek.ts`, and `Page.astro`. Files go in `assets/`, code the page or peek uses goes in `components/`, and each folder exists only when needed. See "Entry folders" in `docs/ARCHITECTURE.md`.
- Keep keyboard focus, reduced-motion paths, and content before JavaScript working.
- Don't design entry pages, restore rejected ideas, or change an entry's Index scene without working through it with the owner section by section.
- Call catalog records "entries" and their destinations "pages", never "worlds".
- Don't invent content (trips, photos, stories, metrics).
- No redirects for retired pages, compatibility aliases, route-existence checks, or publication filters.
- No tests unless asked. Run `pnpm build` and check the pages in a browser.
- Keep changes scoped and preserve unrelated work.
- Internal links end in a slash. Cloudflare treats bare `/index` as the homepage, so `public/_redirects` sends it to `/index/`.
- Commit subjects are public: the About log and the colophon show them. Make them short, plain-spoken, and a little fun, the way a person would say it. No forced jokes, puns, emoji, or dev-humor references. Example: "Taught the favorites to stand up straight on phones."
