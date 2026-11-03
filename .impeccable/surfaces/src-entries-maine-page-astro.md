---
version: 1
slug: "src-entries-maine-page-astro"
primary_target: "src/entries/maine/Page.astro"
related_targets: ["src/entries/maine"]
---

# Maine

Scope: the entry page at `/index/maine`. Visitor mode: Browse. Status: first build
2026-11-02 from an open brief ("do the same thing but for the Maine trip… a different
vibe… make them look really good, more fall themed… encompass the whole trip"). Built
in one go at the owner's request. Not yet reviewed section by section.

## Direction contract

THESIS: A field journal of six days in Acadia, darker and slower than Puerto Rico's
bright cream grid. Each day has its own tone, its own light, and a short list of
where it went.

OWN-WORLD: Dark surfaces, one per day: slate (Sat, travel), granite (Sun, the coast),
spruce (Mon, the gardens), plum (Tue, Cadillac at dawn), fog grey (Wed, Schoodic),
lake blue (Thu, Jordan Pond), and near-black for last light. Paper text, the entry's
gold (#f2b93b) for day labels. Marcellus carries everything; mono for times and place
lists. No Barlow.

FIRST VIEWPORT: Split screen. "Maine" and one line (six days, with Trinity, my mom, and
my dad) on dark spruce at left, the Asticou maple over its pond filling the right.

FORM: Each day is a 12-column grid with a sticky day panel (Day n · date, weekday,
places) in the first three columns and the photos in the other nine, staggered.
Landscape-cropped bands for the big moments. Two swipeable filmstrips (scroll-snap,
keyboard-focusable, no JavaScript) for sequences: the Jesup Path boardwalk and the
sunrise from Cadillac. Phones stack the panel above the photos.

## Days

1. Saturday, Oct 10: the plane, Portland airport's Acadia mural.
2. Sunday, Oct 11: the park sign, the Park Loop shore, mom and dad on the rock, Sand
   Beach, tide pools, the Jesup Path and its boardwalk.
3. Monday, Oct 12: Thuya Garden, Eliot Mountain, Asticou Azalea Garden, Bass Harbor
   Head Light at sunset, a buck at dusk.
4. Tuesday, Oct 13: breakfast at 4:52 am, sunrise on Cadillac, Winter Harbor Light,
   Egg Rock Light from the water.
5. Wednesday, Oct 14: Frazer Point, Winter Harbor Light in fog, Schoodic Point under
   the fog bank, a gull on a roof rack, Southwest Harbor's buoy wall.
6. Thursday, Oct 15: the Bar Island sandbar at dawn, Jordan Pond and the Bubbles, mom
   and dad on the lawn. Coda: last light over the sandbar at 6:01 pm.

## Facts and sources

Places come from GPS (reverse geocoded with OpenStreetMap), signs in frame, or
landmarks. Times are capture times. Captions describe only what's in the frame.

## Photos

The edited photos are in `assets/` (1800px, 2600px for the big bands). Their sources,
the edit recipes, and the album downloads were deleted after editing. 19 photos from
Oct 10–11 came from a full-size album of the owner's own photos; the other 81, the hero
included, are 2048px copies from a classic shared album until their originals arrive.

The look came from `scripts/photo-edit.py` with three presets. `fall` warms the
balance, pushes yellows, oranges, and reds, nudges greens toward gold, and split-tones
cool shadows and warm highlights; `dawn` and `fog` keep sunrise and Schoodic's mood.
Clarity and sharpening are light, since heavy settings made foliage gritty. One photo
(mom and dad on the rock) has three strangers removed with LaMa inpainting; the owner
said the other people in frame are intentional.

## People

The owner, Trinity (the owner's girlfriend), and the owner's mom and dad. Confirmed by
the owner: the owner is in the navy Yankees jacket (Frazer Point, the buoy wall) and the
brown hoodie on the sandbar; dad is in the striped blanket on Cadillac; mom is in the orange
jacket ahead of Trinity at Jordan Pond; Thursday's field photo is the owner and Trinity.
