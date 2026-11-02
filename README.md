# Smooli

Ville's blog and portfolio: writing, music, photography, making, coffee and software, published
straight from a paper notebook on his phone with [Capture](https://github.com/villevihersalo-glitch/capture).
Each post is a Capture page drawn the way the app draws it (paper, handwriting-style ink, magazine
layouts, song sheets with chords, beats that play), inside the Dot family's LED-amber skin.

- **Live site:** GitHub Pages from `main` (Settings → Pages → Deploy from a branch → `main` / root).
- **No build step:** plain HTML, CSS and JavaScript modules in `assets/`; content in `content/`.
- **Content format:** `docs/FORMAT.md` (written by Capture's PUBLISH, read by the site).
- **Demo pages:** `python3 tools/demo.py` writes three sample posts (generated pictures and beat).
- **Check:** `node --test tests/*.test.mjs` (also runs on every push): the page layout must match Capture's.
- **Try it locally:** `python3 -m http.server` in the repo, then open http://localhost:8000.

| File | What's there |
|---|---|
| `assets/page.js` | Draws a Capture page: paper, text placement, ink, pictures, chords, sounds, magazine layouts |
| `assets/app.js` | Front page, sections, posts (addresses `#/`, `#/s/<id>`, `#/p/<id>`) |
| `assets/led.js`, `glyphs.js` | LED lettering in the family's 5 × 7 dot font |
| `assets/site.css` | The LED board and keys, cards, the page sheet |
| `assets/fonts/` | Cormorant Garamond for night paper (SIL Open Font License, `OFL.txt`) |
