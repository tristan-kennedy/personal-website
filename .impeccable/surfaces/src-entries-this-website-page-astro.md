---
version: 1
slug: "src-entries-this-website-page-astro"
primary_target: "src/entries/this-website/Page.astro"
related_targets: ["src/entries/this-website"]
---

# This website

Scope: the entry page at `/index/this-website`. Visitor mode: Read. Status: first build
2026-11-02. The owner picked "seven sites in one" from five directions and asked for a
descriptive story, light on technical detail, with a table of contents near the top. Not
yet reviewed section by section with the owner.

## Direction contract

THESIS: The page wears every version of the site it describes. Seven chapters, oldest
first, each set in that version's real palette, type, and layout idiom, so the history
reads as a change of clothes you scroll through and lands back in the current system.
It refuses the case study and the screenshot gallery.

OWN-WORLD: Seven real systems lifted from git. Astro's starter white with its violet
blur. Gruvbox cream with unstyled system type. Gruvbox dark bento boxes in Oswald and
Nunito Sans under CRT scanlines. Pale grey `#f4f3f2`, Inter 900, one red square. The red
`#d62828` intro. The dark `#0e0e10` collection rows in light Inter. Then charcoal, paper,
Barlow, and Marcellus.

STORY: See that the site has been rebuilt six times, pick a version or read in order,
watch each one in its own clothes with a real capture of its build, then arrive at the
present and why it's an archive now.

FIRST VIEWPORT: Charcoal. `$ cd ..` and the date along the top. THIS WEBSITE at display
scale with the heavy rule running right, a Marcellus lead, then the contents: seven
full-width stripes, each in its own version's colours and face.

FORM: A long read in seven full-bleed bands, numbered because the order is the story.
Signature: the contents stripes are a swatch book of the site's history, and each band
redraws its era's own heading. seed: none. No roll ran; the owner picked this direction from five ("Yeah go
ahead and go the direction of the seven sites in one"), which
replaced the concept presentation, and the build is code-led.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review,
the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Sections

- **Header.** Title, lead, and the contents as seven era stripes with month and commit
  count. Counts come from `getHistory()` by date range, so the last one grows.
- **1 Hello.** Astro starter white, centred column, the first page's code.
- **2 Welcome to My Portfolio Dashboard.** Gruvbox cream, the title at body size and
  the sentence under it at `text-3xl`, as Tailwind's reset left them. The theme script.
- **3 Hello, I'm Tristan Kennedy.** Gruvbox dark bento boxes under the real CRT
  scanline gradient, without its flicker. The CRT CSS.
- **4 Index.** Swiss grey, Inter 900, the red square. The Markdown stub's frontmatter.
- **5 Hello world.** The red intro's eight greetings as the heading. The intro code.
- **6 Make all the pages real.** Dark collection rows, red count. The May fix log.
- **7 Completely redo the website again.** Paper and the current system. This entry's
  own `entry.json`, imported live, then a closing line with the build's commit count
  and latest commit.

## Notes

- Screenshots are real builds of old commits, captured at 1440×900 in headless Edge on
  2026-11-02 with reduced motion forced (except the intro, caught mid-play), light mode.
  Reduced motion also switched the October 2025 CRT on, which is how that version
  behaved. Recapture by checking out the commit, `pnpm install`, `astro build`, and
  serving `dist/`.
- The old case study (`src/content/projects/personal-portfolio.mdx`, last at `dc609cf`)
  is quoted, not reprinted.
- Motion: the title's wipe, the contents stripes fanning in one after another like a
  swatch book opening, and each screenshot fading in plainly when reached (owner asked
  for subtle entrances 2026-11-03). Screenshots had a slide-in at first, and the finish
  review cut it as one entrance repeated across seven different eras, so they only fade,
  with no movement that would belong to one era's idiom.
- Era fonts load only on this page: Inter, Oswald, Nunito Sans from `@fontsource`.
- Everything stated comes from the code and commit history. Lines that read as opinion
  speak for the owner and need their approval.

## Open with the owner

- Reading the copy in their own voice, especially the closing chapter.
- Whether to mention the Valentine's Day page at all.
