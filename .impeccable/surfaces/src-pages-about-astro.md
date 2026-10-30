---
version: 1
slug: src-pages-about-astro
primary_target: src/pages/about.astro
related_targets: [src/components/about/, src/lib/site.ts, src/lib/history.ts, src/lib/dither/, scripts/dither.mjs]
---

# About

Scope: the About page at `/about`. Visitor mode: Experience. Status: first full
build done 2026-10-29; second pass the same day (new copy, record player, the
last three sections merged into Loose ends). Refinements follow with the owner.

## Direction contract

THESIS: "Me, at length." The homepage gives the short version. This page is the
long one: one long paper sheet broken by rules and changes in scale rather than
alternating surfaces, with a single charcoal band where the films are.

ITS OWN PAGE: The page borrows the system (Barlow against Marcellus,
edge-running rules, terminal voice, dithering) and makes its own compositions
rather than reusing the homepage's poster rows, status ribbon, or git log texture.
The owner asked for less charcoal here, so paper carries the page.

STORY: See Tristan, learn where he is, what he does all day and on this site, what
he watches and listens to, what he's still wondering, and how to answer him.

COPY: Each section carries a short blurb, all set the same way (`Blurb.astro`:
body sans, 44ch). Mixing serif and sans blurbs was tried and rejected. Blurbs are
drawn from the résumé, from what the owner has said, and from what the site
itself does, never invented. All of it lives in `about` in `src/lib/site.ts`
so the owner can rewrite it in one place. The opener's blurb must not repeat the
homepage's About paragraphs.

HEADINGS: Sections open with a Marcellus sentence that continues "Me, at
length.": "Where I’ve lived.", "What I do.", "Still turning over:" (Media keeps
its vertical MEDIA.). No hairline-and-caps labels or other eyebrows above
headings; those were tried and read as generic. Separation comes from the
headings and section spacing, not rules.

FIRST VIEWPORT: The shared nav row, then a huge Marcellus "Me," with AT LENGTH. in
Barlow caps across its foot. A heavy rule runs from the caps to the right edge, and
the dithered cut-out portrait stands on that rule in columns 3–4, breaking it.

SURFACES: Paper everywhere except the Media band (charcoal) and the footer.

## Sections

- **Opener.** "Me," in Marcellus at roughly display scale, bleeding off the left
  gutter, with "at length" in the script face laid across it and over the heavy
  rule, the way "briefly" crosses "Me," on the homepage. The rule runs to the
  right edge. The portrait (charcoal dither on a paper silhouette, cut at the
  shoulders) stands on the rule from columns 3–4, its head rising above the top
  of "Me,". Below, one blurb in columns 3–4, under the portrait like a caption.
  On phones the portrait goes full width beneath "Me," and the blurb follows.
- **Where.** The coordinates from `site.ts` set huge in Marcellus, over a
  dithered map of the eastern US in muted ink (`src/lib/dither/where.ts` holds the
  projection, framed to fit every stop). Every move in `moves` is flown on the
  map: a dashed charcoal route of bowed legs, a cross at each stop, and a small
  dithered plane with a paper halo flying it once when the section comes into
  view, pausing at each stop. Beside the blurb, a numbered mono list of the
  stops; each turns from muted to ink as the plane reaches it. Without
  JavaScript or with reduced motion, the whole route is drawn as a static SVG of
  dots and no plane flies. Between 700 and 1280px the map leaves the background and gets its own
  row between the coordinates and the blurb, centred on the route, so the
  route never crosses the text. On phones a crop of the wide map read as
  noise, so phones get their own map (`where-phone.png`, 160×124 dots, framed
  on the route with Florida, the Gulf, and the Atlantic coast so it reads as
  the eastern US), drawn at 2px dots, 3px from 560px, with a smaller plane.
  On phones the blurb comes before the map, and the list of stops is pulled up
  over the map's lower left with its paper halo, the same overlap the wide
  layout has.
- **Work.** "What I do." in columns 1–2 beside two blurbs in 3–4: where the
  owner works now (not the current project) and, broadly, what they build. Then
  the tools as editorial prose, not a list: one paragraph for work and one for
  home (set lower), muted, with each tool name in ink so the paragraph scans.
  Then the terminal listing (`$ cat ~/work` with readable dates, `$ cat ~/school`,
  `$ open resume.pdf`). Then "The one I keep redoing: this website." in
  Marcellus with the change count from `getHistory()` as a quiet second line
  ("56 changes so far."). A huge Barlow numeral was tried and read as corny.
  Under it, a full-bleed dithered strip with one column of dots per week of
  commits, solid where a change is major.
- **Media (charcoal).** The one dark room, films and music. MEDIA. runs vertically up the left
  edge in Barlow caps. Beside it, a muted serif blurb, then the latest four
  Letterboxd watches filling the row edge to edge (four across, two by two on
  phones), read from the public RSS at build time. Each poster ships as a
  greyscale source plus a static 76-dot dither; the canvas re-dithers the
  source at the live `--dot` count (`src/lib/dither/poster.ts`), so the posters
  grow with the window and stay on whole dots. Muted ink on charcoal, all one
  size and top-aligned (varied sizes were tried and rejected), each with
  its title in Marcellus and the rating and watch date in mono. The Letterboxd
  link closes the posters. The listening line is the section's bottom edge: a
  band split charcoal over paper, with a dotted line just above the edge that
  wipes in from the page's left edge. The album sleeve (Apple Music artwork
  dithered at build time, 100 dots; 80 dots below 480px, from its own 80-dot dither so it stays on whole dots) sits across the edge with the
  record (`src/lib/dither/record.ts`) peeking out, sliding further out on hover
  or focus. The words ride the line: the track in Marcellus with its original
  title, the artist, and the time. The line doubles as the progress bar,
  filling solid from the left while the band is on screen. The label turns at
  33⅓ rpm while the sheen stays fixed under the sun. On phones the words move
  to one row in the charcoal above the sleeve (beside a full-size sleeve they
  wrapped into a column too narrow to read), and the line still runs along the
  edge into it. Rejected: a record and
  tonearm beside a plain sentence (clip art), a large sleeve with the track set
  huge inside the section (too much room for one song), and a small row inside
  the section (the line wants to be the boundary). Static frame
  `public/dither/record.png`; reduced motion keeps the record and clock still.
  If the feed or artwork fails at build, the section keeps what it can; the
  build never fails over it.
- **TL;DR.** Understated, like the other text sections: "TL;DR." in columns
  1–2, and in 3–4 one run-on paragraph set like the other blurbs (body sans,
  44ch) and like the Work tools: ink-muted, with the owner's small opinions
  (`opinions`) in ink between the open questions (`questions`). Only some
  items carry a note: a mono superscript links to a margin note under the
  heading in columns 1–2, bottom-aligned with the paragraph (stacked after it
  on phones). Serif and Barlow versions of the paragraph were tried first and
  read as too loud. No email or
  invitation to write: the footer carries contact, and this page only adds new
  information. Opinions and notes in `site.ts` are filler takes the owner will
  rewrite. The questions are spread evenly through the opinions so the
  paragraph ends on the last question. Picked from four live variants (mixed sprawl, opposing
  ribbons, footnoted sprawl, one written thought); the owner chose the
  footnoted sprawl, then asked for it smaller with fewer notes. Rejected for
  this slot: big Settled / Unsettled columns, the questions alone in every
  arrangement (zig-zag with a full-width caps email, a numbered list, a huge
  run-on paragraph, a dithered field cycling one question), a giant dithered
  "?", a charcoal "Write to me." panel, a terminal `$ mail` listing, and an
  `$ ls ~/index` listing. Then the colophon.

## Phones

Phones keep every idea at full strength without letting the page sprawl:
section headings at 16vw, the coordinates at 19vw, and "Me," at 52vw with "at
length" hanging below it (the heavy rule is dropped; it was a stub at that
width).  Each job in
the terminal listing is two lines (role; company with the dates on the
right), and the stop list is tighter. MEDIA. runs in caps across the top of
the dark room, and the Where map is swapped for its phone version.

## Portrait

- Source: the owner's head-and-shoulders photo (400×400 JPEG on a dark teal
  backdrop, supplied 2026-10-29). The original stays out of the repository.
- Provenance of `public/dither/portrait-source.png`: mirrored so the light falls
  from the upper right, background removed with a colour key flood-filled from
  the edges (median 5, alpha eroded 1px), then greyscale with CLAHE (48px tiles,
  slope 3), a light sharpen, levels 0.08–0.85, and gamma 1.6.
- `public/dither/portrait.png` is the static frame:
  `node scripts/dither.mjs photo public/dither/portrait-source.png public/dither/portrait.png 220`,
  which uses the shared threshold and keeps the silhouette's transparency.
- The canvas reads the source and dithers it at the live `--dot` count, so it
  stays on whole dots at every size.
- Entrance: the portrait develops: the threshold rises from blank paper to the
  final image over about 0.9s on a canvas. Reduced motion and no-JavaScript show
  the static PNG.
- This supersedes the "dithered portrait" rejection for the homepage's About
  section, on the owner's request. It stays off the homepage.

## Entrances

Sideways, once, through `src/lib/reveal.ts`, staggered within each section:
opener (rule draws in from the right edge, as on the homepage, "Me," slides in, AT LENGTH. follows, portrait
develops), where (map fades up, coordinates slide in), work (rows arrive like
output), films (posters slide in from the right one after another, then the line draws
left to right into the sleeve and the track), tl;dr (heading slides in, the paragraph and notes fade up).

## Data

- `site.ts` holds `work` (role, company, dates; copied from `resume/resume.typ`),
  `stack`, `questions`, and the page copy in `about`. Nothing personal lives
  elsewhere.
- `src/lib/letterboxd.ts` reads the RSS once per build and dithers posters with
  sharp. Empty or failed feed means no posters, not a broken build.
- The sleeve is dithered from `now.listening.artwork` by `src/lib/dither/remote.ts`,
  which the posters share.
- The commit strip comes from `getHistory()`.

## Open with the owner

- The blurbs are drafts built from the résumé; the owner rewrites them in their
  own voice.
- Whether "Where" grows dots for entry places later. That needs a location field
  on entries, which is a content-model change to decide separately.
- Whether `/index` later takes a matching heading treatment.
