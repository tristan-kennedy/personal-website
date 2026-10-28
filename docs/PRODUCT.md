# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Tristan Kennedy owns and maintains the site as a personal record of what he has
done, made, visited, and thought about. Adding a small observation should feel as
natural as adding a large project or trip.

Visitors are peers, friends, curious strangers, and potential collaborators who
come to explore his interests and work over time: skimming what is new, wandering
the archive, or spending time with one subject. Hiring teams can still find
professional work, the résumé, and contact details, but recruiting does not shape
the site's structure or voice.

## Product Purpose

An evolving index of Tristan's life and work. Trips, passing thoughts, writing,
projects, experiments, and anything else worth keeping share one lasting home. An
entry does not need to prove professional value or fit a case-study template to
belong.

A good visit leaves someone with a sense of Tristan's interests and something they
wanted to explore. Success for Tristan is adding new material easily and revisiting
older material without rebuilding the site around each new interest.

## Positioning

A personal archive with an editorial sensibility: chronological at its core, varied
in content, informal in presentation. Its apparent haphazardness comes from
juxtaposition, varied scale, and controlled asymmetry over a clear grid and readable
navigation. Trips, photographs, and unfinished thoughts stand equal with
professional work. It is not a fictional newspaper, museum, scrapbook, or other
themed identity.

## Operating Context

- **Homepage (`/`)**: a finite, composed introduction. Hero, About, Favorites (four
  hand-picked entries plus a short Recents listing), a closing quote, and the
  colophon footer. Its composition lives in the homepage surface brief,
  `.impeccable/surfaces/src-pages-index-astro.md`.
- **Index (`/index`)**: the heart of the site. Every entry, newest first, grouped by
  year. Planned later: progressive loading, search over titles, content, keywords,
  and metadata, and a random-entry option. Filtering is optional.
- **Entry pages (`/index/<slug>`)**: one per entry, each free to define its own
  typography, colour, layout, and interaction to suit the material. The only shared
  requirement is an obvious way back. None are built yet; each will be designed with
  the owner section by section.
- **About (`/about`)**: a placeholder in the index's shell until it is designed.
- Publishing happens through the repository. Cloudflare Workers builds and hosts it.

## Capabilities and Constraints

- One metadata collection, `entries`, read from `src/catalog/<slug>.json`. Title and
  date (`YYYY-MM` or `YYYY-MM-DD`) are required. `keywords` is a free-form string
  array (default empty). `link`, `readingTime`, and `featured` (homepage pick order)
  are optional.
- No entry descriptions, fixed content types, or publication statuses. Every record
  is listed and links to `/index/<slug>` whether or not that page exists yet. No
  route-existence checks, redirects, or compatibility aliases.
- The homepage takes four picks (by `featured`) that exclude the newest entry, plus
  the three newest entries for Recents, all from the same records as the index.
- Catalog records are "entries"; their destinations are "pages". The owner rejected
  "worlds".
- Entries need not all show a title, keywords, thumbnail, and date. The data must
  still support identity, linking, chronological order, and search.
- Content and navigation work before JavaScript, by keyboard, and with reduced
  motion.
- The résumé is authored in Typst (`resume/`) and served at `/resume.pdf`.
- Current records: Dipsy Dolphin, This website, Escapism as escapism, Puerto Rico
  (August 2026), and Maine (October 2026). None has a page yet.
- Curated picks will probably be mostly projects and code. Allow that; don't force a
  balanced mix.

## Brand Commitments

The public identity is Tristan Kennedy. Copy is personal, direct, and plain: offhand
rather than polished or inspirational, comfortable with curiosity and unfinished
ideas, and written from actual experience.

The owner rejected the first custom entry pages and the leaking hover previews.
Neither may be restored, and new page designs start only in collaboration with the
owner. Whether previews return at all is undecided.

[henry.codes](https://henry.codes/) and the Hermes Agent site are references for
experimental typography, dithered imagery, and independent experiences. The site
must not look like a copy of either.

## Evidence on Hand

- Listing metadata: `src/catalog/`.
- Résumé source and artifact: `resume/resume.typ`, `public/resume.pdf`.
- Favicon: `public/favicon.svg`.
- The site's own git history, read at build time.

There are no trip stories, photographs, testimonials, clients, or metrics. Never
invent experiences, employers, results, or entry content.

## Product Principles

- Reflect a whole person: work, experiences, and passing thoughts.
- Use chronology to hold varied material together and keep the past reachable.
- Balance a curated homepage with a complete archive.
- Let deliberate variety coexist with clear navigation and readable content.
- Keep the threshold for publishing low and the archive maintainable as it grows.

## Accessibility & Inclusion

Keyboard access, visible focus, meaningful reading order, readable content without
JavaScript or hover, and a full reduced-motion path are requirements.
