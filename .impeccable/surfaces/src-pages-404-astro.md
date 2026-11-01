---
version: 1
slug: src-pages-404-astro
primary_target: src/pages/404.astro
related_targets: [wrangler.jsonc]
---

# Not found

Scope: the 404 page. Visitor mode: Experience. Status: approved by the owner 2026-10-31.

## Direction contract

THESIS: A printed manual's blank page. One small line, centred on an empty paper
screen, reading "This page intentionally left blank."

## Composition

Paper fills the first screen with no nav or imagery. The line sits in the centre in
Marcellus, and a small mono 404 sits at the foot like a page number. The colophon footer
below carries every link. The emptiness is the joke, so nothing else goes here.

## Hosting

`wrangler.jsonc` sets `not_found_handling: "404-page"`, so Cloudflare serves `404.html`
with a real 404 status for any missing path.

## Rejected

- _The Creation of Adam_'s hands reaching for each other over a huge 404, with "So
  close." The Index already has the arm motif.
