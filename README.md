# Tristan Kennedy’s personal website

A personal archive built with Astro and Tailwind CSS.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm build
```

Cloudflare Workers Builds runs `pnpm build` and serves `dist/` (see `wrangler.jsonc`). The Typst résumé
in `resume/` is compiled to `/resume.pdf` during the build.

Entries are JSON files in `src/catalog/`:

```json
{
  "title": "Puerto Rico",
  "date": "2026-08",
  "keywords": ["Travel", "Scrapbook"]
}
```

- Product intent: [docs/PRODUCT.md](docs/PRODUCT.md)
- Visual system: [docs/DESIGN.md](docs/DESIGN.md)
- Code layout and conventions: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
