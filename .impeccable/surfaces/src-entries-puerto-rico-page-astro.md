---
version: 1
slug: "src-entries-puerto-rico-page-astro"
primary_target: "src/entries/puerto-rico/Page.astro"
related_targets: ["src/entries/puerto-rico"]
---

# Puerto Rico

Scope: the entry page at `/index/puerto-rico`. Visitor mode: Browse. Status: first build
2026-11-02 from an open brief ("primarily photos with some fun text here and there…
a full exploration of my trip… split into meaningful parts"). The owner asked for the
whole page to be planned and built in one go. Not yet reviewed section by section.

## Direction contract

THESIS: The trip as its camera roll, in order. The photos carry it; text only names
places, times, and the few things worth saying. The one story is the missing day.

OWN-WORLD: Cream paper (#f6efdd) and charcoal, with the entry's own inks: pink
(#ee6f9a) for Old San Juan, coral (#f28b6a) on charcoal for the lost day, teal
(#62c8c4) for Vieques, and a yellow (#f5c95a) band for the last photo. Barlow caps for
chapters and the title (with a pink misregistered shadow), Marcellus for the few
lines of text, mono for times and the terminal coda.

FIRST VIEWPORT: "PUERTO RICO" huge on cream, one plain line of what and when, then
the "I ♥ Puerto Rico" street full bleed.

FORM: Four chapters by day on a 12-column grid with controlled asymmetry: big and
small photos, staggered pairs and threes, two full-bleed photos, and sub-labels by
place. Phones stack, with some photos inset to keep the rhythm. No JavaScript, no
lightbox, no entrances.

## Sections

- **Old San Juan** (Wed Jul 29, 3:51–5:17 pm, all on a camera): Paseo de la Princesa,
  the streets, El Morro, back through town. Ends on the frog mural's "Debí tirar más
  fotos" (I should have taken more photos), set beside it as a quote.
- **El Yunque** (Thu Jul 30): a charcoal band with "0 photos", twelve empty tiles like
  an album still loading, and the owner's account: Las Paylas, the phone in the
  water, the man with a metal detector who found it and hasn't mailed it. It ends on
  the next file, IMG_0002, a cat in Luquillo at 6:56 the next morning.
- **Vieques** (Fri Jul 31 – Sat Aug 1): horses, the beach at Esperanza and its
  chickens, Playa Negra's hermit crabs and black sand, I ♥ Vieques, then Saturday's
  horse past the Esperanza sign (full bleed), the road to Playa Navío, and a rooster
  on a table. "19 of 81 photos have a horse in them" is counted from the album.
- **Lechón** (Sun Aug 2): the last photo, in Guavate, on yellow, with a terminal coda:
  `$ where phone` / found by some guy with a metal detector / not mailed yet.

## Facts and sources

Places come from each photo's GPS (reverse geocoded with OpenStreetMap) or from what
is plainly in the frame. Old San Juan has no GPS; its place names are recognisable
landmarks. Times are capture times in local time. Nothing else is invented: no
companions, feelings, or plans. Alt text avoids saying whose hands or which person
where that isn't certain.

## Photos

The edited photos are in `assets/` (1800px, 2600px full-bleed). The originals (from
the owner's full-size shared album) and the edit recipes were deleted after editing.
Edits from `scripts/photo-edit.py` are restrained: lifted shadows and recovered
highlights on the flat camera frames, sky masks to bring back cloud, light warmth, and
almost nothing on the iPhone frames. Clarity and sharpening are light, since heavy
settings made foliage and old stone gritty. Astro's `<Image>` makes the responsive
WebP sizes.

## Open questions for the owner

- Keep the two videos out, or add one?

Answered 2026-11-02: the owner is at the I ♥ Vieques sign. The owner's sister is at the frog
mural, walking away at El Morro, and holding the black sand. The rock slide was Las
Paylas, and the lechón was in Guavate (its GPS reads Cidra, near the Cayey line).
