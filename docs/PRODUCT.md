# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Hiring teams and peers have equal priority. Hiring teams use the site to
understand Tristan Kennedy's engineering work, evaluate his approach, review his
resume, and contact him. Peers explore projects, writing, and experiments to learn
how he thinks and builds, and to start conversations or collaborations.

Tristan maintains the site and publishes new work through the repository.

## Product Purpose

This is Tristan Kennedy's personal website: a lasting home for project case
studies, writing, and creative engineering experiments. It should communicate
both what he has built and the reasoning behind his work.

A successful visit helps someone understand his work, discover something worth
reading or trying, and reach his resume or contact links when relevant. Publishing
new content should remain straightforward as his work and interests change.

## Positioning

The site brings Tristan's own shipped projects, personal writing, and runnable
experiments together. Its distinctive evidence is the work itself and his
first-person account of decisions, tradeoffs, and interests.

## Operating Context

- Visitors can browse the homepage, collection indexes, and individual entries
  on desktop or mobile web.
- The homepage introduces Tristan and highlights projects, posts, experiments,
  and contact options. The menu provides collection navigation and theme control.
- Long-form entries combine prose, images, code examples, and, where applicable,
  interactive React demonstrations.
- Contact is through the published email and external profiles. The resume is a
  PDF, served at `/resume` using the redirects in `public/_redirects`.
- Content is authored as MDX in `src/content/`. The resume is authored in Typst
  under `resume/`.
- The current deployment documented in `README.md` is Cloudflare Pages, building
  with `pnpm build` and publishing `dist/`.

## Capabilities and Constraints

- Preserve the three content collections: projects, posts, and experiments.
  `src/content.config.ts` defines their schemas; `src/lib/content/` supplies the
  existing sorting and URL helpers.
- Use Astro static rendering, with React islands for interactive features, MDX
  content, Tailwind CSS, and Astro image optimization.
- Keep content readable and useful before interaction. Add client JavaScript
  when it serves an actual interaction or demonstration.
- Preserve light/dark preference behavior and reduced-motion handling.
- Keep maintenance changes small and consistent with existing patterns. Avoid
  structural refactors unless requested. No new tests are required by the project.
- Preserve existing routes, content, assets, resume access, and contact paths
  during framework upgrades.
- Audience priority and the future design workflow were confirmed during setup.
  No conversion targets or additional product features have been established.

## Brand Commitments

The public identity is Tristan Kennedy. Copy is personal, direct, thoughtful,
and grounded in real work. Preserve the existing logo and barcode assets.

The owner-established visual constraints in `AGENTS.md` are Swiss bold minimal
design, strong typography, generous whitespace, minimal ornamentation, the Inter
family, the existing color tokens, and light/dark theme support. These commitments
take precedence over generic skill preferences. The implemented visual system is
recorded in [DESIGN.md](DESIGN.md).

## Evidence on Hand

- Project case studies: `src/content/projects/`, including Dipsy Dolphin and
  this portfolio.
- Personal writing: `src/content/posts/`.
- Interactive experiments: `src/content/experiments/`, including raycasting,
  Matter.js, and MDX demonstrations.
- Resume source and published artifact: `resume/resume.typ` and
  `public/resume.pdf`.
- Existing identity assets: `src/assets/logo.svg`, `src/assets/barcode.svg`, and
  `public/favicon.svg`.

Use these sources for claims. Do not invent employers, clients, testimonials,
results, or metrics that are absent from the actual content.

## Product Principles

- Give hiring teams and peers equally clear paths to relevant work.
- Explain intent and decisions alongside implementation details.
- Let real projects, writing, and demonstrations supply the evidence.
- Make ongoing publishing and maintenance simple.
- Preserve fast delivery, readability, and useful interaction across devices.
