# Resume

Edit `resume.typ` for content. The layout helpers live in `template.typ`.

## Commands

```sh
pnpm resume
pnpm build
```

`pnpm resume` runs:

```sh
typst compile --font-path resume/fonts resume/resume.typ public/resume.pdf
```

The resume is compiled before the Astro site build and must fit on one page.
Review `public/resume.pdf` after content changes.

Cloudflare Pages publishes `dist/` and serves the PDF at `/resume`, `/resume/`,
and `/resume.pdf`.
