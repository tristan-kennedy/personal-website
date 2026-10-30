# AGENTS.md

Tristan Kennedy's personal archive: Astro, Tailwind CSS v4, static on Cloudflare Workers (static assets).

## Read first

- `docs/PRODUCT.md`: what the site is for, the content model, and constraints.
- `docs/DESIGN.md`: the visual system. Read it before any interface change.
- `docs/ARCHITECTURE.md`: file layout, packages, and styling conventions.
- `.impeccable/surfaces/src-pages-index-astro.md`: the homepage's composition and what was rejected.
- Impeccable lives in `.agents/skills/impeccable/` (pinned by `skills-lock.json`, defaults in `.impeccable/config.json`). Follow its SKILL.md for design work. The owner's explicit instructions take precedence.

## Rules

- Style with inline Tailwind utilities. Extend `src/styles/global.css` only for shared tokens, variants, or utilities a class can't express.
- Keep comments to a minimum. Name things well instead.
- Personal details live in `src/lib/site.ts`. Never hard-code them elsewhere.
- Every dithered piece uses the shared threshold, sun, and `--dot`.
- Keep keyboard focus, reduced-motion paths, and content before JavaScript working.
- Don't design entry pages or restore the rejected pages and hover previews without working through them with the owner section by section.
- Call catalog records "entries" and their destinations "pages", never "worlds".
- Don't invent content (trips, photos, stories, metrics).
- No redirects, compatibility aliases, route-existence checks, or publication filters.
- No tests unless asked. Run `pnpm build` and check the pages in a browser.
- Keep changes scoped and preserve unrelated work.
- Commit subjects are public: the About log and the colophon show them. Make them short, plain-spoken, and a little fun, the way a person would say it. No forced jokes, puns, emoji, or dev-humor references. Example: "Taught the favorites to stand up straight on phones."
