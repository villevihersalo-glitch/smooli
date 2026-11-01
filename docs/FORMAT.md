# What Capture publishes (format 1)

Capture's PUBLISH writes these files into this repo through GitHub's API (one commit per
publish). The site only reads them.

| Path | What |
|---|---|
| `content/site.json` | The table of contents (below) |
| `content/pages/<page id>.json` | A published page, exactly Capture's page document (versions 1–5, Capture's `docs/DATA-FORMAT.md`) |
| `content/files/<name>` | Its pictures (JPEG, resized for the web) and sounds |

```json
{
  "format": "smooli.site", "version": 1,
  "title": "SMOOLI",
  "tagline": "WRITING / MUSIC / PHOTOS / MAKING / CODE",
  "sections": [                      // one per BLOG notebook, in the order Capture lists them
    { "id": "<notebook id>", "title": "Photography", "paper": "warm",   // warm | night
      "posts": [
        { "id": "<page id>", "title": "Bangkok after dark",
          "date": 1761955200000,       // first published (ms)
          "updated": 1761955200000,    // last UPDATE (ms)
          "excerpt": "Neon, rain and…",
          "cover": "img-….jpg",        // first picture on the page, or null
          "template": "mag-street",
          "width": 393,                // page width on the phone (dp): the page is drawn at it and scaled
          "files": ["img-….jpg"] }     // pictures and sounds the page shows (so UNPUBLISH knows what to delete)
      ] }
  ]
}
```

- **Title**: the song title on music paper, else the page's first line of text. **Excerpt**: the
  first sentences of text (standfirst on magazine paper).
- **UNPUBLISH** removes the post from `site.json` and deletes its page file. Picture and sound
  files no other published page uses are deleted too.
- `demo: true` marks the sample content from `tools/demo.py`; the first real publish replaces it.
- Readers ignore fields they don't know, so later versions can add without breaking older sites.
