"""Writes the demo content (three sample pages) until Capture's first PUBLISH replaces it.

Run from the repo root: python3 tools/demo.py
Pictures and the beat are generated here (no one else's photos or samples).
"""
import json, math, random, struct, time, wave, os
from PIL import Image, ImageDraw, ImageFilter

random.seed(7)
C = "content"
os.makedirs(f"{C}/pages", exist_ok=True)
os.makedirs(f"{C}/files", exist_ok=True)
DAY = 86400_000
now = int(time.time() * 1000)


def page(pid, doc):
    json.dump(doc, open(f"{C}/pages/{pid}.json", "w"), ensure_ascii=False, separators=(",", ":"))


def night_street(name, w, h, hue):
    """An abstract neon street at night: dark buildings, a wet road, out-of-focus lights."""
    img = Image.new("RGB", (w, h))
    d = ImageDraw.Draw(img)
    for y in range(h):
        t = y / h
        d.line([(0, y), (w, y)], fill=(int(10 + 25 * t), int(8 + 10 * t), int(22 + 30 * (1 - t))))
    for _ in range(14):
        bw = random.randint(w // 14, w // 5)
        bx = random.randint(-bw // 2, w)
        bh = random.randint(h // 3, int(h * 0.85))
        d.rectangle([bx, h - bh, bx + bw, h], fill=(6, 6, 12))
        for wy in range(h - bh + 8, h - h // 6, 14):
            for wx in range(bx + 6, bx + bw - 6, 12):
                if random.random() < 0.25:
                    d.rectangle([wx, wy, wx + 5, wy + 7], fill=(220, 170, 90))
    glow = Image.new("RGB", (w, h))
    g = ImageDraw.Draw(glow)
    palette = [(255, 60, 120), (255, 176, 0), (60, 200, 255), (255, 90, 40)]
    for _ in range(40):
        r = random.randint(w // 60, w // 18)
        x, y = random.randint(0, w), random.randint(h // 3, h)
        c = palette[(hue + random.randint(0, 1)) % len(palette)]
        g.ellipse([x - r, y - r, x + r, y + r], fill=c)
    glow = glow.filter(ImageFilter.GaussianBlur(w / 60))
    img = Image.blend(img, glow, 0.55)
    img.save(f"{C}/files/{name}", quality=84)


def beat(name, bpm=92):
    """One bar of a boom-bap loop, synthesised."""
    sr = 22050
    n = int(sr * 60 / bpm * 4)
    out = [0.0] * n
    step = n // 16
    def add(at, f):
        for i in range(min(n - at, sr // 3)):
            out[at + i] += f(i / sr)
    for k in (0, 7, 10):
        add(k * step, lambda t: math.sin(2 * math.pi * (50 + 90 * math.exp(-t * 30)) * t) * math.exp(-t * 9) * 0.9)
    for k in (4, 12):
        add(k * step, lambda t: (random.random() * 2 - 1) * math.exp(-t * 18) * 0.5 + math.sin(2 * math.pi * 190 * t) * math.exp(-t * 25) * 0.3)
    for k in range(0, 16, 2):
        add(k * step, lambda t: (random.random() * 2 - 1) * math.exp(-t * 90) * 0.18)
    with wave.open(f"{C}/files/{name}", "w") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, s * 0.8)) * 32000)) for s in out))


# ------------------------------------------------------------------ writing: ruled paper with ink
writing = {
    "v": 4, "template": "ruled",
    "blocks": [
        {"id": "w1", "x": 48, "y": 32, "text": "Building in public", "bold": True, "size": 26},
        {"id": "w2", "x": 48, "y": 96, "text": (
            "Everything on this site starts as a page in a notebook on my phone. "
            "Songs, photos, coffee notes, half-built tools. When a page is ready I tap "
            "PUBLISH and it lands here, looking the way it did on paper.")},
        {"id": "w3", "x": 48, "y": 320, "text": "The site is the working example.", "italic": True, "spans": [[4, 8, "b"]]},
    ],
    "strokes": [
        # Highlighter under "Building", a circle round "PUBLISH", an arrow from the margin.
        {"id": "s1", "kind": "highlighter", "color": "#FFE09600", "width": 14, "anchor": "w1", "pts": [0, 34, 70, 33, 140, 34]},
        {"id": "s2", "kind": "pen", "color": "#FFC62F2B", "width": 2.5, "anchor": "w2", "pts": []},  # filled below
        {"id": "s3", "kind": "arrow", "color": "#FF1E4FA8", "width": 2.5, "pts": [360, 270, 330, 236]},
    ],
}
ring = []
for i in range(25):
    a = i / 24 * 2 * math.pi + 0.3
    ring += [round(98 + 46 * math.cos(a), 1), round(144 + 17 * math.sin(a), 1)]
writing["strokes"][1]["pts"] = ring

# ------------------------------------------------------------------ music: chords paper, night
lyrics = ["Lights go by on the highway", "I keep on driving all night", "Radio low and the city", "Fading away in the light"]
chords = [[("Am", 0), ("F", 110)], [("C", 0), ("G", 140)], [("Am", 0), ("F", 120)], [("C", 0), ("G", 90), ("Am", 170)]]
music = {
    "v": 4, "template": "chords",
    "song": {"title": "Night Drive", "key": "Am", "bpm": 92, "time": "4/4"},
    "blocks": [{"id": f"l{i}", "x": 24, "y": 64 + i * 64, "text": t} for i, t in enumerate(lyrics)],
    "tags": [{"id": f"c{i}{k}", "kind": "chord", "text": c, "x": x, "y": -28, "anchor": f"l{i}"}
             for i, row in enumerate(chords) for k, (c, x) in enumerate(row)],
    "audio": [{"id": "a1", "file": "demo-beat.wav", "x": 20, "y": 336, "name": "Night Drive beat", "ms": 2609, "loop": True}],
}

# ------------------------------------------------------------------ photography: Street magazine
street = {
    "v": 5, "template": "mag-street",
    "blocks": [
        {"id": "k", "x": 24, "y": 32, "text": "STREET", "bold": True, "size": 13},
        {"id": "h", "x": 24, "y": 64, "text": "Bangkok after dark", "bold": True, "size": 36},
        {"id": "cap", "x": 24, "y": 496, "text": "Sukhumvit, 23:40. 35 mm, f/2, 1/60 s.", "italic": True, "size": 13},
        {"id": "d", "x": 24, "y": 544, "text": "Neon, rain and the hum of a city that never quite sleeps.", "italic": True, "size": 20},
        {"id": "by", "x": 24, "y": 640, "text": "Words and pictures by Ville", "size": 13},
        {"id": "b", "x": 24, "y": 672, "text": (
            "I walk the same few streets every night with one camera and one lens. "
            "The light changes more than the places do: a food cart, a taxi, a sign that "
            "flickers on the beat of a song somewhere upstairs.")},
        {"id": "q", "x": 24, "y": 864, "text": "“The light changes more than the places do.”", "italic": True, "size": 26},
        {"id": "c2", "x": 24, "y": 1104, "text": "Contact sheet: three frames, one corner.", "italic": True, "size": 13},
    ],
    "images": [
        {"id": "i1", "file": "demo-street-1.jpg", "x": 0, "y": 192, "w": 393, "h": 304},
        {"id": "i2", "file": "demo-street-2.jpg", "x": 20, "y": 976, "w": 112.3, "h": 128},
        {"id": "i3", "file": "demo-street-3.jpg", "x": 140.3, "y": 976, "w": 112.3, "h": 128},
        {"id": "i4", "file": "demo-street-4.jpg", "x": 260.7, "y": 976, "w": 112.3, "h": 128},
    ],
}

night_street("demo-street-1.jpg", 1179, 912, 0)
for i in (2, 3, 4):
    night_street(f"demo-street-{i}.jpg", 400, 456, i)
beat("demo-beat.wav")

page("demo-writing", writing)
page("demo-night-drive", music)
page("demo-bangkok", street)

site = {
    "format": "smooli.site", "version": 1,
    "title": "SMOOLI",
    "tagline": "WRITING / MUSIC / PHOTOS / MAKING / CODE",
    "demo": True,
    "projects": [
        {"id": "demo-p1", "title": "Capture", "subtitle": "Paper notebook for songs, photos and notes", "status": "yellow",
         "notes": "Publishing to this site from the phone.", "image": "demo-street-2.jpg", "updated": now},
        {"id": "demo-p2", "title": "Beat Pad", "subtitle": "16 pads, step sequencer, kits", "status": "green",
         "notes": "Piano and guitar sounds in.", "image": None, "updated": now},
        {"id": "demo-p3", "title": "Battle Wall", "subtitle": "Freestyle and graffiti battles", "status": "red",
         "notes": "Waiting for a phone test.", "image": "demo-street-3.jpg", "updated": now},
        {"id": "demo-p4", "title": "Hilux RN20", "subtitle": "V6 swap", "status": "off", "notes": "", "image": None, "updated": now},
    ],
    "projectsUpdated": now,
    "sections": [
        {"id": "demo-photos", "title": "Photography", "paper": "warm", "posts": [
            {"id": "demo-bangkok", "title": "Bangkok after dark", "date": now - 1 * DAY, "updated": now - 1 * DAY,
             "excerpt": "Neon, rain and the hum of a city that never quite sleeps. (Sample page)",
             "cover": "demo-street-1.jpg", "template": "mag-street", "width": 393}]},
        {"id": "demo-music", "title": "Music", "paper": "night", "posts": [
            {"id": "demo-night-drive", "title": "Night Drive", "date": now - 2 * DAY, "updated": now - 2 * DAY,
             "excerpt": "Am, F, C, G at 92 BPM, with the beat looping under it. (Sample page)",
             "cover": None, "template": "chords", "width": 393}]},
        {"id": "demo-writing", "title": "Writing", "paper": "warm", "posts": [
            {"id": "demo-writing", "title": "Building in public", "date": now - 3 * DAY, "updated": now - 3 * DAY,
             "excerpt": "Everything on this site starts as a page in a notebook on my phone. (Sample page)",
             "cover": None, "template": "ruled", "width": 393}]},
    ],
}
json.dump(site, open(f"{C}/site.json", "w"), ensure_ascii=False, indent=1)
print("demo content written")
