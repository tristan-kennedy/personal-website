# AGENTS.md

## Project snapshot

- Personal portfolio built with Astro, MDX content collections, and Tailwind CSS.
- Visual style: Swiss bold minimal, typography-led, generous whitespace, little to no borders/linework.

## Tech stack

- Astro for pages/layouts (`.astro`) and content collections.
- TypeScript for utilities and React (`.tsx`) components.
- Tailwind CSS with custom theme tokens in `src/styles/global.css`.

## Repository structure

- `src/pages`: top-level routes.
- `src/layouts/Layout.astro`: global layout, view transitions, base body styles.
- `src/components`: reusable UI pieces (Astro + TSX).
- `src/content`: MDX content sources for `projects`, `posts`, and `experiments`.
- `src/lib/content`: collection helpers using `getCollection`.

## Styling rules (important)

- Maintain Swiss bold minimal aesthetic: strong typography, clean spacing, minimal ornamentation.
- Avoid borders/lines unless strictly necessary for clarity; prefer spacing, color, and type scale.
- Use existing color tokens (`--color-*`) and Tailwind utilities; avoid introducing new palettes.
- Keep typography consistent with Inter; do not add new fonts.
- Respect the light/dark theme tokens and `data-theme` selector behavior.

## Astro content framework

- Content collections are defined in `src/content/config.ts` and must match schema fields.
- Add content as MDX files under `src/content/<collection>/`.
- Required frontmatter:
  - `projects`: `title`, `date`, `description`, `tech`, `image`
  - `posts`: `title`, `date`, `description`, `length`, `image`
  - `experiments`: `title`, `date`, `description`, `tech`, `image`
- Use existing helpers in `src/lib/content/*` to fetch and sort content.

## Workflow expectations

- No tests required for this project unless explicitly requested.
- Keep changes minimal and consistent with existing patterns.
- Avoid large refactors or structural changes unless asked.
