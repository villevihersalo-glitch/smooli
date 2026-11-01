# PROJECT.md — Smooli (Ville's site)

> Ville's blog and portfolio, published from Capture on his phone: writing, music, photography,
> making, coffee, software. Capture pages drawn as they look in the app, in the Block Party LED skin.

## Status
- **Stage:** Step 1 built: the site draws Capture pages (three demo posts); waiting for GitHub Pages to be switched on
- **Last updated:** 2026-11-01 — by Claude (first version of the site)
- **Home tool for code:** Claude
- **Repo:** github.com/villevihersalo-glitch/smooli (public)
- **How to build/run:** Nothing to build. GitHub Pages serves `main`. Locally: `python3 -m http.server`.
- **Plan:** Capture's `docs/PUBLISH.md`

## Next step
- [ ] Ville switches on GitHub Pages (Settings → Pages → Deploy from a branch → `main`, `/ (root)`) and
  looks at the demo site on his phone and computer. Then step 2 in Capture: BLOG notebooks and
  PUBLISH / UPDATE / UNPUBLISH.

## Scope
**In now:** front page of posts, sections (one per BLOG notebook), post pages drawing Capture
pages (all papers incl. song sheets and magazine layouts, ink, pictures, chords, sounds), LED skin.

**Parking lot (ideas, not planned):**
- About page, own domain, RSS feed, cover-picture choice, post order by hand

## Done
Newest first, one line each:
- 2026-11-01 — First version: front page with LED-key sections and paper cards, post pages drawing Capture pages
  at their phone width scaled to fit, content format (`docs/FORMAT.md`), demo posts (Street magazine, song with
  chords and a looping beat, ruled page with ink), layout tests matching Capture

## Decisions log
- **Name: Smooli**, public repo on GitHub Pages (Ville, 2026-11-01)
- **Pages are drawn at the width they were written at on the phone and scaled to fit** (pictures and ink are
  placed for that width; text then wraps exactly as on the phone). Up to 1.6× on big screens
- **Published pages look like Capture's PDF export:** no editing guides (magazine frames and hints, CHORDS/LYRICS hints)
- **Plain HTML/CSS/JS, no build step** (nothing to install or break; GitHub Pages serves it as is)
- Addresses use `#/…` so every link works on GitHub Pages without server rules

## Known problems
- Text measured by the browser can wrap a word differently from the phone now and then (different
  font engines); circled words can then sit slightly off
- The night paper's Garamond is bundled; warm paper uses Roboto where the reader has it, else a similar sans

## Open questions
- Own domain? (GitHub Pages can serve one for free)
