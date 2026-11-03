# The Dot pages (`#/dot`)

The site's **.DOT APPS** key opens a page about the whole Dot app family (`#/dot`) and one page per app
(`#/dot/<id>`, e.g. `#/dot/studio`). Everything on them comes from `content/dot.json`, which is written by hand
(Capture's PUBLISH never touches it).

- **apps**: `id`, `name` (starts with a dot), `pkg` (the app id, same as the DOT APPS list inside the apps),
  `released` (true once it's on Google Play: the page then shows GET IT ON GOOGLE PLAY), `tagline`, `about`,
  `features`, `with` (ids of the apps it works with), `videos`.
- **videos**: `{ "title": "…", "youtube": "<a YouTube link or id>" }`, or `{ "title": "…", "file": "x.mp4" }` for a
  video kept in `content/dot/` (mind GitHub Pages' 1 GB limit; YouTube is the better home for videos).
- **flows**: how the apps work together, as numbered steps, each with the app doing it.

`tests/dot.test.mjs` checks the rules (names, links between apps, the same ten apps as inside the apps).
When an app is released, set `released` here **and** in every app's `DotFamily`.
