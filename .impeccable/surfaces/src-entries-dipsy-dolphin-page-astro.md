---
version: 1
slug: "src-entries-dipsy-dolphin-page-astro"
primary_target: "src/entries/dipsy-dolphin/Page.astro"
related_targets: ["src/entries/dipsy-dolphin"]
---

# Dipsy Dolphin

Scope: the entry page at `/index/dipsy-dolphin`. Visitor mode: Read. Status: first build
2026-11-01 from an open brief ("generally the same, make any improvements, get creative,
paper not charcoal"), then a full Impeccable pass the same day after the owner found it
tacky and buggy in places. The owner then asked for the movable Dipsy back, plus numbered
sections and a table of contents. Not yet reviewed section by section with the owner.

## Direction contract

THESIS: A calm paper essay with the real sprite on top of it, the way Dipsy lives on a
desktop. It stands in the layout at the start and end, and you can move it in between.

OWN-WORLD: Site paper and type, plus Dipsy's own material: the seven real bubble styles
from `presentation_policy.py`, Segoe UI in bubbles, full-colour screenshots, the sprite
at pixelated 10fps. The site's heavy rule runs from caps headings as it does on the title.
Numbers and contents are structure this article warrants, not a pattern for every entry.

STORY: Meet Dipsy on the title, read why it exists, see how the model is kept in its
place, see what shipped and what didn't, read the verdict, download it or head back.

FIRST VIEWPORT: DIPSY / DOLPHIN at display scale locked to the foot of the screen, heavy
rule running right from DOLPHIN, the sprite standing on the "IN" with its real hello in
the onboarding bubble over its head. Capped by 35dvh so the bubble clears the top row on
short laptops. Phones keep all of it, with the title filling the width and the bubble
aligned right.

FORM: Essay on the four-column grid. One reading column, always starting at column 2.

## Sections

- **Poster.** See first viewport. The title wipes in like the homepage name. The sprite
  talks for two loops, then settles to idle, all in CSS.
- **Intro.** Lead sentence, then the contents in column 1 beside four paragraphs and a
  small note. The note says what the floating Dipsy is and that its lines are scripted.
  Keep it honest if the lines change.
- **Screenshots.** The three from the original article, each three columns wide, bleeding
  off one edge, with its caption in the free margin column at the image's foot. They
  slide in once from their own edge. Their words are real model output. Capped at 1400px
  because the sources are only about 1000px wide.
- **Headings.** `components/SectionHeading.astro`. Six numbered sections, alternating caps with
  a heavy rule and Marcellus. Titles start on the reading column, with the number large in
  column 1. `sections` in the page feeds both the headings and the contents.
- **Character first.** Rules set large in Marcellus between hairlines, then the product
  test quoted from the repo's brief.
- **Everyone keeps to their own job.** The old file tree, rewritten as a table of who
  owns what.
- **Never trust the dolphin.** A trimmed parser excerpt whose code lines up with the
  reading column, then the seven real actions, then the third screenshot.
- **Two poses.** The cast: seven animations standing on one heavy rule.
  Idle and talk are live sprites. The other five are dithered silhouettes on the shared
  `--dot`, labelled "no sprite". Then the seven bubbles as a specimen sheet with their
  real reveal and hold values, and the voice.
- **One installer.** The release path and what packaging taught.
- **Git log.** Charcoal band, the project's real fifteen commits in the terminal voice.
  It sits between two `paper` wrappers so it gets charcoal's own muted and selection
  colours.
- **What I'd keep.** After the git log. The verdict, the paused status, download and source links, and
  Dipsy idling on the top edge of the footer.

## The floating Dipsy

`components/stage.ts`. It appears once the title sprite scrolls away and leaves when the
footer sprite arrives, so one Dipsy hands over to the other. Drag to move, click to
poke, arrow keys to move, Enter to poke, Esc to quit, as in the app. Scroll remarks come
from `data-remark` on sections, with a 12s cooldown so it never nags, per the repo's
interruption policy. Two idle lines after 45s of nothing. Delivery uses the real chunk,
pause, and hold values in `components/bubbles.ts`. On phones its home is the screen edge, so
it covers less of the text.

Without JavaScript the floater never appears, every sprite shows its first frame, and all
content is there. Reduced motion shows still sprites, and lines appear whole.

## Rejected

The owner rejected these. Don't restore them without working it through with them.

- The "You be the model" parser sandbox and its teal Windows desktop band.
- Clickable bubble specimens.

## Notes

- Sprite strips are the 24 frames of each pose in `assets/dipsy/` of
  `tristan-kennedy/virtual-desktop-assistant`.
- `assets/talk.png` is a separate sheet for the Index scene in `peek.ts`.
- Screenshots are plain `<img>` rather than `astro:assets`, because the image service
  can't resolve `sharp` under pnpm here.
- Dipsy's scripted lines are invented on purpose and disclosed in the intro note.
- Facts in the essay come from the original article and the repo. Section titles are
  ours.

## Open with the owner

- Reading the rewritten copy in their own voice.
