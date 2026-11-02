# PROJECT.md — Smooli (Ville's site)

> Ville's blog and portfolio, published from Capture on his phone: writing, music, photography,
> making, coffee, software. Capture pages drawn as they look in the app, in the Dot family's LED skin.

## Status
- **Stage:** Live on GitHub Pages; Ville publishes from Capture
- **Last updated:** 2026-11-02 — by Claude (.DOT APPS pages)
- **Home tool for code:** Claude
- **Repo:** github.com/villevihersalo-glitch/smooli (public)
- **How to build/run:** Nothing to build. GitHub Pages serves `main`. Locally: `python3 -m http.server`.
- **Plan:** Capture's `docs/PUBLISH.md`

## Next step
- [ ] Ville reads the .DOT APPS pages (`#/dot`) and fixes any wording; sends YouTube links of explainer videos as he
  makes them (they go into `content/dot.json`). Otherwise nothing pending: Ville publishes as he writes.

## Scope
**In now:** front page of posts, the .DOT APPS pages (the Dot app family, how the apps work together, one page per app with videos), a PROJECTS page (Capture's project board, public cards with status lamps), sections (one per BLOG notebook), post pages drawing Capture
pages (all papers incl. song sheets and magazine layouts, ink, pictures, chords, sounds), LED skin.

**Parking lot (ideas, not planned):**
- About page, own domain, RSS feed, cover-picture choice, post order by hand

## Done
Newest first, one line each:
- 2026-11-02 — .DOT APPS (Ville: one home for the family, with explainers and videos): `#/dot` shows the nine Dot apps
  and three ways they work together (beat → song, photo → everywhere, battle a friend) as numbered steps with app chips;
  `#/dot/<app>` has what it does, features, works with, its flows, videos (YouTube or a file) and GET IT ON GOOGLE PLAY
  once released. From `content/dot.json` (hand-written; Capture never touches it; `docs/DOT.md`). Tests: dot rules
- 2026-11-02 — Song sheet: a section labelled on the page prints no name of its own (as Capture 0.11.2; songs from Mobstudio)
- 2026-11-01 — Live: Ville switched on GitHub Pages and published his board and first pages from Capture; everything works
- 2026-11-01 — PROJECTS page: Capture's board cards marked ON WEBSITE, with pictures, status lamps (in progress pulses), subtitle and notes; key in the menu when there are any; demo projects
- 2026-11-01 — Capture 0.10.0 publishes here (PUBLISH / UPDATE / UNPUBLISH); posts list their `files` in site.json
- 2026-11-01 — First version: front page with LED-key sections and paper cards, post pages drawing Capture pages
  at their phone width scaled to fit, content format (`docs/FORMAT.md`), demo posts (Street magazine, song with
  chords and a looping beat, ruled page with ink), layout tests matching Capture

## Decisions log
- **.DOT APPS pages live in `content/dot.json`** (2026-11-02), apart from Capture's `site.json`, so publishing never
  touches them; videos go on YouTube and are embedded (no-cookie), not stored in the repo
- **Name: Smooli**, public repo on GitHub Pages (Ville, 2026-11-01)
- **Pages are drawn at the width they were written at on the phone and scaled to fit** (pictures and ink are
  placed for that width; text then wraps exactly as on the phone). Up to 1.6× on big screens
- **Published pages look like Capture's PDF export:** no editing guides (magazine frames and hints, CHORDS/LYRICS hints)
- **Plain HTML/CSS/JS, no build step** (nothing to install or break; GitHub Pages serves it as is)
- **PROJECTS page** (Ville, 2026-11-01): the board's public cards, in the browser LED Board's look (lamps keep their own colours)
- Addresses use `#/…` so every link works on GitHub Pages without server rules

## Known problems
- Text measured by the browser can wrap a word differently from the phone now and then (different
  font engines); circled words can then sit slightly off
- The night paper's Garamond is bundled; warm paper uses Roboto where the reader has it, else a similar sans

## Open questions
- Own domain? (GitHub Pages can serve one for free)
