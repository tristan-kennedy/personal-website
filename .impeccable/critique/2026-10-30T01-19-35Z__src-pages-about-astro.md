---
target: About page
total_score: 26
max_score: 32
na_heuristics: 7,10
p0_count: 0
p1_count: 1
target_identity: "file:C:\\Users\\tdoug\\Development\\Projects\\personal-website\\src\\pages\\about.astro"
target_fingerprint: "sha256:4dabf46f5ce84490c0bf731d5fc7d804a9b6d7c1260b18ae230d049815e7aab1"
target_path: "C:\\Users\\tdoug\\Development\\Projects\\personal-website\\src\\pages\\about.astro"
timestamp: 2026-10-30T01-19-35Z
slug: src-pages-about-astro
---
# About page critique (after second pass)

Method: dual-agent (A: design review, B: detector + browser)

## Design Health Score
| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | Live data reads as live |
| 2 | Match system / real world | 3 | ISO dates; degree listed under ~/work |
| 3 | User control and freedom | 3 | Record spins with no pause outside reduced motion |
| 4 | Consistency and standards | 3 | Profile links repeated before footer (fixed) |
| 5 | Error prevention | 4 | Feed failure degrades cleanly |
| 6 | Recognition rather than recall | 3 | "The other one that doesn't pay" antecedent (fixed) |
| 7 | Flexibility and efficiency | n/a | Experience surface |
| 8 | Aesthetic and minimalist design | 3 | Blurbs share one template |
| 9 | Error recovery | 4 | Feed fallback link |
| 10 | Help and documentation | n/a | Experience surface |
| Total | | 26/32 | Good |

## Specificity
Authored, not category-interchangeable. Every section has its own idea. Undercut by one repeated blurb template (cols 1-2, serif then sans) and an opener whose text block echoes the homepage About.

## Detector
CLI: about.astro clean; components/about 8 advisory design-system-font-size (15/17/21px off the ramp). Overlay: no anti-patterns. No overflow at 1440 or 375. Contrast AA/AAA. Focus visible. Phone tap targets under 44px on standalone links (fixed).

## Priority issues
- [P1] Blurbs share one placement and voice; opener text echoes homepage. Give each blurb its own placement (Where note at the Rogers dot, Work blurb in empty col 1, Films as caption, Loose ends blurb before the questions).
- [P2] Opener: comma of "Me," collides with the period after AT LENGTH.; phone rule shrinks to a stub.
- [P2] FILMS. sat beside the record, not the posters (fixed: self-start). Record never stops; poster orphan on phones.
- [P2] Loose ends tail duplicated the footer (fixed: profile row removed).
- [P2] Work: empty col 1 at desktop, degree under ~/work, ISO dates.

## Minor
Rogers dot reads as punctuation on phones; 4th question falls short of the right edge; Loose ends bottom padding tighter than section spacing; empty commit weeks read as gaps; font sizes off the ramp.

## Questions
- Should the opener drop the two-column text entirely?
- Should Work get a heading as loud as FILMS. for a second beat on paper?
- Should the record stop after a few turns, or lift the arm on click?
