/*
 * Draws a Capture page in the browser, the way the app draws it.
 *
 * Reads the page format Capture stores and publishes (versions 1–5, see Capture's
 * docs/DATA-FORMAT.md) and lays it out with the same rules as Capture's model/PageLayout.kt and
 * model/Magazine.kt: the page is as wide as the screen (up to 760 px), text blocks run to the
 * right margin and rewrap, a block that would overlap the one above is pushed down, ink circled
 * round words follows its words. Published pages are drawn like a PDF export from the app:
 * no editing guides (magazine frames and hints), just the finished page.
 *
 * 1 dp in the app = 1 CSS px here.
 */

// ---------------------------------------------------------------- layout numbers (PageLayout.kt)
export const LINE = 32;
const TOP_LINE = 64;
const RULED_MARGIN = 40;
const SIDE = 20;
const MIN_WIDTH = 120;
export const MAX_WIDTH = 760;
const STAFF_GAP = 9;
const STAFF_PERIOD = 104;
const TAB_PERIOD = 112;
const STAFF_TOP = 72;
const SONG_FIRST_SECTION = 160;
const SONG_SECTION = 192;
const SONG_SECTIONS = ["VERSE 1", "PRE-CHORUS", "CHORUS", "VERSE 2", "BRIDGE", "CHORUS", "OUTRO"];
const MIN_TEXT_WIDTH = 24;
const DEFAULT_SIZE = 18;
const MIN_SIZE = 12;
const AUDIO_W = 176;
const AUDIO_H = 40;

const MUSIC = new Set(["song", "chords", "staff", "tab"]);
const isMagazine = (t) => typeof t === "string" && t.startsWith("mag-");

export const lineHeight = (size) => Math.max(LINE, Math.ceil((size * 1.7) / (LINE / 2)) * (LINE / 2));
const blockX = (x, w) => Math.min(Math.max(x, SIDE), Math.max(SIDE, w - SIDE - MIN_WIDTH));
const blockWidth = (x, w) => Math.max(MIN_WIDTH, w - SIDE - blockX(x, w));

// ---------------------------------------------------------------- paper (ui/Paper.kt)
export const PAPERS = {
  warm: {
    paper: "#F6F0E3", rule: "#D8CDB6", grid: "#E2D8C4", margin: "rgba(192,57,43,0.4)",
    text: "#1F1D1A", accent: "#1F1D1A", hint: "#A89C84", cursor: "#B07800",
    font: 'Roboto, "Segoe UI", system-ui, -apple-system, sans-serif', weight: 400, scale: 1,
  },
  night: {
    paper: "#0E0D0B", rule: "#3A3122", grid: "#2A241A", margin: "#6E5423",
    text: "#EEE7D7", accent: "#E0B44C", hint: "#6E6553", cursor: "#E0B44C",
    font: '"Cormorant", Georgia, serif', weight: 500, scale: 1.15,
  },
};

// ---------------------------------------------------------------- ink (model/Inks.kt)
const INK_WARM = [0xff1f1d1a, 0xff1e4fa8, 0xffc62f2b, 0xff2e7d4f, 0xffe09600];
const INK_NIGHT = [0xffeee7d7, 0xff7fb2ff, 0xffff7a6e, 0xff7fd49b, 0xffe0b44c];

function parseColor(c) {
  if (typeof c === "number") return c >>> 0;
  const s = String(c || "").replace("#", "");
  const v = parseInt(s.length === 6 ? "FF" + s : s, 16);
  return Number.isFinite(v) ? v >>> 0 : 0xff1f1d1a;
}

/** A stored ink colour as it shows on [paper]: the palette's partner on the other paper. */
function inkFor(color, paper) {
  const c = parseColor(color);
  const target = paper === "night" ? INK_NIGHT : INK_WARM;
  const other = paper === "night" ? INK_WARM : INK_NIGHT;
  const i = other.indexOf(c);
  const v = i >= 0 ? target[i] : c;
  return "#" + (v & 0xffffff).toString(16).padStart(6, "0");
}

// ---------------------------------------------------------------- magazine (model/Magazine.kt)
const KINDS = {
  PHOTO: { size: 0 },
  KICKER: { size: 13, bold: true },
  HEADLINE: { size: 36, bold: true },
  DECK: { size: 20, italic: true },
  BYLINE: { size: 13 },
  BODY: { size: 18 },
  QUOTE: { size: 26, italic: true },
  CAPTION: { size: 13, italic: true },
  NOTES: { size: 15 },
};

export function magazineRegions(t, w) {
  const out = [];
  let y = 0;
  const m = SIDE, GAP = 8;
  const up = (v) => Math.max(LINE * 2, Math.ceil(v / (LINE / 2)) * (LINE / 2));
  const space = (dp = LINE) => { y += dp; };
  const text = (kind, lines = 1) => {
    const h = lines * lineHeight(KINDS[kind].size);
    out.push({ kind, x: m, y, w: w - 2 * m, h });
    y += h;
  };
  const photo = (ratio, cols = 1, bleed = false) => {
    let h;
    if (cols === 1 && bleed) {
      h = up(w * ratio);
      out.push({ kind: "PHOTO", x: 0, y, w, h });
    } else {
      const cw = (w - 2 * m - GAP * (cols - 1)) / cols;
      h = up(cw * ratio);
      for (let i = 0; i < cols; i++) out.push({ kind: "PHOTO", x: m + i * (cw + GAP), y, w: cw, h });
    }
    y += h;
  };
  switch (t) {
    case "mag-street":
      space(); text("KICKER"); text("HEADLINE", 2); photo(0.75, 1, true); text("CAPTION"); space(16);
      text("DECK", 2); text("BYLINE"); text("BODY", 6); text("QUOTE", 2); space(16);
      photo(1, 3); text("CAPTION"); text("BODY", 6); break;
    case "mag-travel":
      photo(0.62, 1, true); space(16); text("KICKER"); text("HEADLINE", 2); text("DECK", 2); text("BYLINE");
      text("BODY", 5); photo(1.3, 2); text("CAPTION"); text("QUOTE", 2); text("BODY", 5);
      photo(0.5); text("CAPTION"); text("NOTES", 4); break;
    case "mag-food":
      space(); text("KICKER"); text("HEADLINE", 2); photo(1, 1, true); text("CAPTION"); text("DECK", 2); space(16);
      photo(1, 2); space(GAP); photo(1, 2); text("CAPTION"); text("NOTES", 6); text("NOTES", 8); text("QUOTE", 2); break;
    case "mag-portrait":
      photo(1.25, 1, true); space(16); text("KICKER"); text("HEADLINE", 2); text("DECK", 2); text("BYLINE");
      text("QUOTE", 3); text("BODY", 6); photo(1.4, 2); text("CAPTION"); text("BODY", 6); break;
    case "mag-nature":
      space(); text("KICKER"); text("HEADLINE", 2); photo(0.5, 1, true); text("CAPTION"); text("DECK", 2);
      text("BODY", 5); photo(0.66); text("QUOTE", 2); space(16); photo(0.8, 3); text("CAPTION"); text("BODY", 6); break;
    case "mag-wildlife":
      photo(0.66, 1, true); text("CAPTION"); space(16); text("KICKER"); text("HEADLINE", 2); text("DECK", 2);
      text("BYLINE"); text("BODY", 5); photo(0.75, 2); text("CAPTION"); text("QUOTE", 2); text("NOTES", 4); break;
    case "mag-sport":
      space(); text("KICKER"); text("HEADLINE", 2); photo(0.6, 1, true); text("CAPTION"); photo(0.75, 4);
      text("CAPTION"); text("DECK", 2); text("BYLINE"); text("BODY", 5); text("QUOTE", 2); photo(0.66); text("BODY", 5); break;
    case "mag-fashion":
      photo(1.4, 1, true); space(16); text("KICKER"); text("HEADLINE", 2); text("DECK", 2); text("NOTES", 2);
      photo(1.4, 2); text("CAPTION"); text("QUOTE", 2); text("BODY", 5); photo(1.4, 3); text("CAPTION"); break;
  }
  return out;
}

// ---------------------------------------------------------------- reading a page

/** A page document with every field it may lack filled in (older versions have fewer). */
export function readPage(json) {
  const d = typeof json === "string" ? JSON.parse(json) : json;
  return {
    v: d.v || 1,
    template: d.template || "ruled",
    blocks: (d.blocks || []).map((b) => ({
      id: b.id, x: +b.x || 0, y: +b.y || 0, text: b.text || "",
      bold: !!b.bold, italic: !!b.italic, underline: !!b.underline, size: +b.size || DEFAULT_SIZE,
      spans: (b.spans || []).map(([s, e, k]) => ({ s, e, k })),
    })),
    strokes: (d.strokes || []).map((s) => ({
      kind: s.kind || "pen", color: s.color, width: +s.width || 2, anchor: s.anchor || null, pts: s.pts || [],
    })),
    images: (d.images || []).map((i) => ({ file: i.file, x: +i.x, y: +i.y, w: +i.w, h: +i.h })),
    audio: (d.audio || []).map((a) => ({ file: a.file, x: +a.x, y: +a.y, name: a.name || "Sound", ms: +a.ms || 0, loop: !!a.loop })),
    tags: (d.tags || []).map((t) => ({ kind: t.kind || "chord", text: t.text || "", x: +t.x, y: +t.y, anchor: t.anchor || null })),
    song: d.song || null,
  };
}

/** A page's title for lists: the song title on music paper, else its first line of text. */
export function pageTitle(doc) {
  if (MUSIC.has(doc.template) && doc.song && doc.song.title) return doc.song.title;
  const first = [...doc.blocks].sort((a, b) => a.y - b.y || a.x - b.x).find((b) => b.text.trim());
  return first ? first.text.trim().split("\n")[0].slice(0, 80) : "Untitled";
}

// ---------------------------------------------------------------- text

const URL_RE = /\b((https?:\/\/|www\.)[^\s<>"]+[^\s<>".,;:!?)\]}'])/gi;

function esc(s) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

/** A block's text as HTML: per-word bold (in the paper's accent), italic, underline, and links. */
function blockHtml(b, theme) {
  const n = b.text.length;
  const marks = Array.from({ length: n }, () => ({ b: false, i: false, u: false, link: null }));
  for (const sp of b.spans) for (let k = Math.max(0, sp.s); k < Math.min(n, sp.e); k++) marks[k][sp.k] = true;
  for (const m of b.text.matchAll(URL_RE)) {
    const url = /^www\./i.test(m[0]) ? "https://" + m[0] : m[0];
    for (let k = m.index; k < m.index + m[0].length; k++) marks[k].link = url;
  }
  let html = "";
  let k = 0;
  while (k < n) {
    const m = marks[k];
    let e = k + 1;
    while (e < n && marks[e].b === m.b && marks[e].i === m.i && marks[e].u === m.u && marks[e].link === m.link) e++;
    let piece = esc(b.text.slice(k, e));
    const style = [];
    if (m.b) style.push(`font-weight:700;color:${theme.accent}`);
    if (m.i) style.push("font-style:italic");
    if (m.u) style.push("text-decoration:underline");
    if (style.length) piece = `<span style="${style.join(";")}">${piece}</span>`;
    if (m.link) piece = `<a href="${esc(m.link)}" rel="noopener" target="_blank">${piece}</a>`;
    html += piece;
    k = e;
  }
  return html;
}

function blockStyle(b, theme) {
  const size = b.size * theme.scale;
  return [
    `font-family:${theme.font}`,
    `font-size:${size}px`,
    `line-height:${lineHeight(b.size)}px`,
    `font-weight:${b.bold ? 700 : theme.weight}`,
    `font-style:${b.italic ? "italic" : "normal"}`,
    `text-decoration:${b.underline ? "underline" : "none"}`,
    `color:${b.bold ? theme.accent : theme.text}`,
  ].join(";");
}

/**
 * Places blocks like PageLayout.place: reading order, each pushed below any block above that
 * it would overlap, using measured heights and the width the text really uses.
 */
export function place(blocks, heights, pageW, widths) {
  const out = new Map();
  const placed = [];
  for (const b of [...blocks].sort((a, c) => a.y - c.y || a.x - c.x)) {
    const x = blockX(b.x, pageW);
    const w = blockWidth(b.x, pageW);
    const h = heights.get(b.id) ?? lineHeight(b.size);
    const cw = widths.has(b.id) ? Math.min(Math.max(widths.get(b.id), MIN_TEXT_WIDTH), w) : w;
    let top = b.y;
    for (const p of placed) if (p.x < x + cw && x < p.x + p.cw) top = Math.max(top, p.y + p.h);
    const box = { x, y: top, w, h, cw };
    placed.push(box);
    out.set(b.id, box);
  }
  return out;
}

// ---------------------------------------------------------------- paper drawing (ui/Paper.kt)

function label(ctx, theme, s, x, y, size = 10, { accent = false, bold = false } = {}) {
  ctx.save();
  ctx.fillStyle = accent ? withAlpha(theme.accent, 0.75) : theme.hint;
  ctx.font = `${bold || accent ? 700 : 400} ${size}px ${theme.font}`;
  ctx.textBaseline = "top";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "1.5px";
  ctx.fillText(s, x, y + 2);
  ctx.restore();
}

function withAlpha(hex, a) {
  const v = parseInt(hex.slice(1, 7), 16);
  return `rgba(${(v >> 16) & 255},${(v >> 8) & 255},${v & 255},${a})`;
}

function hline(ctx, color, y, x0, x1, width = 1) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.lineTo(x1, y);
  ctx.stroke();
}

function drawTemplate(ctx, doc, theme, w, h, mag) {
  ctx.fillStyle = theme.paper;
  ctx.fillRect(0, 0, w, h);
  switch (doc.template) {
    case "ruled":
      for (let y = TOP_LINE; y < h; y += LINE) hline(ctx, theme.rule, y, 0, w);
      ctx.strokeStyle = theme.margin;
      ctx.beginPath(); ctx.moveTo(RULED_MARGIN, 0); ctx.lineTo(RULED_MARGIN, h); ctx.stroke();
      break;
    case "grid": {
      const s = LINE / 2;
      ctx.strokeStyle = theme.grid; ctx.lineWidth = 0.75;
      ctx.beginPath();
      for (let x = s; x < w; x += s) { ctx.moveTo(x, 0); ctx.lineTo(x, h); }
      for (let y = s; y < h; y += s) { ctx.moveTo(0, y); ctx.lineTo(w, y); }
      ctx.stroke();
      break;
    }
    case "dotted": {
      const s = LINE / 2;
      ctx.fillStyle = theme.rule;
      for (let y = s; y < h; y += s) for (let x = s; x < w; x += s) { ctx.beginPath(); ctx.arc(x, y, 1.1, 0, 7); ctx.fill(); }
      break;
    }
    case "staff": staves(ctx, theme, w, h, 5, STAFF_PERIOD, false); break;
    case "tab": staves(ctx, theme, w, h, 6, TAB_PERIOD, true); break;
    case "chords":
      for (let y = 96; y < h; y += 2 * LINE) {
        hline(ctx, theme.rule, y, 0, w);
        ctx.fillStyle = theme.rule;
        for (let x = 8; x < w; x += 6) { ctx.beginPath(); ctx.arc(x, y - LINE, 0.7, 0, 7); ctx.fill(); }
      }
      // The app's CHORDS / LYRICS hints are left off: on a published page they'd sit under real chords.
      break;
    case "song": {
      const third = w / 3;
      label(ctx, theme, "TITLE", 16, 42);
      hline(ctx, theme.rule, 64, 0, w);
      label(ctx, theme, "KEY", 16, 74);
      label(ctx, theme, "BPM", third + 8, 74);
      label(ctx, theme, "TIME", third * 2 + 8, 74);
      hline(ctx, theme.rule, 96, 0, third - 8);
      hline(ctx, theme.rule, 96, third, third * 2 - 8);
      hline(ctx, theme.rule, 96, third * 2, w);
      for (let top = SONG_FIRST_SECTION, i = 0; top < h; top += SONG_SECTION, i++) {
        label(ctx, theme, SONG_SECTIONS[i % SONG_SECTIONS.length], 16, top + 12, 12, { accent: true });
        for (let k = 2; k <= 5; k++) hline(ctx, theme.rule, top + k * LINE, 0, w);
      }
      break;
    }
    default:
      // Magazine paper, published like an export: only the rules round a pull quote that has words in it.
      if (mag) for (const r of mag.regions) {
        if (r.kind === "QUOTE" && r.filled) {
          hline(ctx, withAlpha(theme.accent, 0.55), r.y + 6, r.x, r.x + r.w, 1.5);
          hline(ctx, withAlpha(theme.accent, 0.55), r.y + r.h - 6, r.x, r.x + r.w, 1.5);
        }
      }
  }
}

function staves(ctx, theme, w, h, lines, period, tab) {
  const left = 16, right = w - 16;
  for (let top = STAFF_TOP; top + STAFF_GAP * (lines - 1) < h; top += period) {
    ctx.strokeStyle = theme.rule;
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    for (let i = 0; i < lines; i++) { ctx.moveTo(left, top + i * STAFF_GAP); ctx.lineTo(right, top + i * STAFF_GAP); }
    ctx.stroke();
    const bottom = top + STAFF_GAP * (lines - 1);
    ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(left, top); ctx.lineTo(left, bottom); ctx.moveTo(right, top); ctx.lineTo(right, bottom); ctx.stroke();
    if (tab) {
      const step = (bottom - top) / 3;
      ctx.fillStyle = theme.hint;
      ctx.font = `700 10px ${theme.font}`;
      ctx.textBaseline = "middle";
      ["T", "A", "B"].forEach((c, i) => ctx.fillText(c, left + 6, top + step * (i + 0.5)));
    }
  }
}

// ---------------------------------------------------------------- ink (inkPath in ui/Paper.kt)

function inkPath(p, kind, width) {
  const n = p.length / 2;
  if (n === 0) return "";
  if (kind === "arrow" && p.length >= 4) {
    const x0 = p[p.length - 4], y0 = p[p.length - 3], x1 = p[p.length - 2], y1 = p[p.length - 1];
    const len = Math.max(12, width * 4);
    const back = Math.atan2(y0 - y1, x0 - x1), spread = (28 * Math.PI) / 180;
    const hx = (a) => x1 + len * Math.cos(back + a), hy = (a) => y1 + len * Math.sin(back + a);
    return `M${p[0]},${p[1]}L${x1},${y1}M${hx(spread)},${hy(spread)}L${x1},${y1}L${hx(-spread)},${hy(-spread)}`;
  }
  if (n === 1) return `M${p[0]},${p[1]}l0.01,0`;
  if (n === 2) return `M${p[0]},${p[1]}L${p[2]},${p[3]}`;
  let d = `M${p[0]},${p[1]}`;
  for (let i = 1; i < n - 1; i++) {
    const cx = p[2 * i], cy = p[2 * i + 1];
    d += `Q${cx},${cy} ${(cx + p[2 * i + 2]) / 2},${(cy + p[2 * i + 3]) / 2}`;
  }
  return d + `L${p[2 * n - 2]},${p[2 * n - 1]}`;
}

function inkSvg(doc, placed, paper, highlighters, w, h) {
  let paths = "";
  for (const s of doc.strokes) {
    if ((s.kind === "highlighter") !== highlighters) continue;
    let ox = 0, oy = 0;
    if (s.anchor) {
      const b = placed.get(s.anchor);
      if (!b) continue;
      ox = b.x; oy = b.y;
    }
    const color = inkFor(s.color, paper);
    const op = s.kind === "highlighter" ? (paper === "night" ? 0.45 : 0.38) : 1;
    paths += `<path transform="translate(${ox},${oy})" d="${inkPath(s.pts, s.kind, s.width)}" stroke="${color}" stroke-opacity="${op}" stroke-width="${s.width}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  }
  if (!paths) return null;
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.setAttribute("width", w);
  el.setAttribute("height", h);
  el.setAttribute("class", "ink");
  el.innerHTML = paths;
  return el;
}

// ---------------------------------------------------------------- the page

function clock(ms) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function div(cls, style, html) {
  const d = document.createElement("div");
  if (cls) d.className = cls;
  if (style) d.style.cssText = style;
  if (html != null) d.innerHTML = html;
  return d;
}

/**
 * Draws [doc] (from [readPage]) into [host] on [paper] ("warm" / "night"), [files] being the
 * URL folder its pictures and sounds are in, [width] the page width it was written at on the
 * phone (pictures and ink are placed for that width, so the page is drawn at it and scaled to
 * fit by the caller). Returns the page element.
 */
export function renderPage(host, doc, paper, files, width) {
  const theme = PAPERS[paper] || PAPERS.warm;
  const pageW = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH * 2, width || 393));
  const page = div("page", `width:${pageW}px;background:${theme.paper};font-family:${theme.font}`);
  host.appendChild(page);

  // Text first, so it can be measured; it's placed once every block's size is known.
  const heights = new Map(), widths = new Map(), els = new Map();
  for (const b of doc.blocks) {
    if (!b.text) continue;
    const el = div("block", `${blockStyle(b, theme)};width:${blockWidth(b.x, pageW)}px`, blockHtml(b, theme));
    page.appendChild(el);
    els.set(b.id, el);
  }
  for (const [id, el] of els) {
    heights.set(id, el.offsetHeight);
    const range = document.createRange();
    range.selectNodeContents(el);
    const left = el.getBoundingClientRect().left;
    let right = 0;
    for (const r of range.getClientRects()) right = Math.max(right, r.right - left);
    widths.set(id, right);
  }
  const placed = place(doc.blocks.filter((b) => els.has(b.id)), heights, pageW, widths);
  for (const [id, el] of els) {
    const box = placed.get(id);
    const b = doc.blocks.find((x) => x.id === id);
    // Text sits on the ruled line like in the app: the extra line height goes above it.
    const half = Math.max(0, (lineHeight(b.size) - b.size * theme.scale * 1.25) / 2);
    el.style.left = box.x + "px";
    el.style.top = box.y + half + "px";
  }

  // Magazine parts with something in them (only those get their printed rules).
  let mag = null;
  if (isMagazine(doc.template)) {
    const regions = magazineRegions(doc.template, pageW);
    for (const r of regions) {
      const inside = (px, py) => px >= r.x && px <= r.x + r.w && py >= r.y && py < r.y + r.h;
      r.filled = r.kind === "PHOTO"
        ? doc.images.some((i) => inside(i.x + i.w / 2, i.y + i.h / 2))
        : doc.blocks.some((b) => b.text.trim() && placed.get(b.id) && inside(placed.get(b.id).x + 1, placed.get(b.id).y + 1));
    }
    mag = { regions };
  }

  // How tall: everything on it, plus a little paper below.
  let bottom = 0;
  for (const b of placed.values()) bottom = Math.max(bottom, b.y + b.h);
  for (const i of doc.images) bottom = Math.max(bottom, i.y + i.h);
  for (const a of doc.audio) bottom = Math.max(bottom, a.y + AUDIO_H);
  for (const t of doc.tags) {
    const off = t.anchor ? placed.get(t.anchor) : { x: 0, y: 0 };
    if (off) bottom = Math.max(bottom, off.y + t.y + 26);
  }
  for (const s of doc.strokes) {
    const oy = s.anchor ? (placed.get(s.anchor)?.y ?? 0) : 0;
    for (let i = 1; i < s.pts.length; i += 2) bottom = Math.max(bottom, s.pts[i] + oy);
  }
  if (MUSIC.has(doc.template)) bottom = Math.max(bottom, doc.template === "song" ? 160 : 96);
  const pageH = Math.ceil(bottom + 48);
  page.style.height = pageH + "px";

  // Paper.
  const canvas = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(pageW * dpr);
  canvas.height = Math.round(pageH * dpr);
  canvas.style.cssText = `width:${pageW}px;height:${pageH}px`;
  canvas.className = "paper";
  const ctx = canvas.getContext("2d");
  ctx.scale(dpr, dpr);
  drawTemplate(ctx, doc, theme, pageW, pageH, mag);
  page.prepend(canvas);

  // Song details, in the song sheet's slots or one line at the top.
  if (MUSIC.has(doc.template) && doc.song) {
    const s = doc.song;
    const at = (x, y, style, t) => page.appendChild(div("label", `left:${x}px;top:${y}px;${style}`, esc(String(t))));
    const big = `font-size:${20 * theme.scale}px;font-weight:700;color:${theme.accent}`;
    const small = `font-size:${16 * theme.scale}px;color:${theme.text}`;
    if (doc.template === "song") {
      const third = pageW / 3;
      if (s.title) at(64, 34, big + `;max-width:${pageW - 84}px`, s.title);
      if (s.key) at(50, 70, small, s.key);
      if (s.bpm > 0) at(third + 46, 70, small, s.bpm);
      if (s.time) at(third * 2 + 52, 70, small, s.time);
    } else {
      const line = [s.title, s.key, s.bpm > 0 ? `${s.bpm} BPM` : "", s.time].filter(Boolean).join("  ·  ");
      if (line) at(20, 18, `font-size:${14 * theme.scale}px;font-weight:700;color:${theme.cursor}`, line);
    }
  }

  // Pictures under highlighter, text and ink.
  for (const i of doc.images) {
    const img = document.createElement("img");
    img.src = files + i.file;
    img.alt = "";
    img.loading = "lazy";
    img.className = "pic";
    img.style.cssText = `left:${i.x}px;top:${i.y}px;width:${i.w}px;height:${i.h}px`;
    page.insertBefore(img, page.children[1] || null);
  }
  const under = inkSvg(doc, placed, paper, true, pageW, pageH);
  if (under) page.insertBefore(under, [...page.children].find((c) => c.classList.contains("block")) || null);

  // Chords and section labels.
  for (const t of doc.tags) {
    const off = t.anchor ? placed.get(t.anchor) : { x: 0, y: 0 };
    if (!off) continue;
    const x = off.x + t.x, y = off.y + t.y;
    if (t.kind === "chord") {
      page.appendChild(div("label", `left:${x}px;top:${y}px;font-weight:700;font-size:${16 * theme.scale}px;color:${theme.cursor}`, esc(t.text)));
    } else {
      page.appendChild(div("section-tag", `left:${x}px;top:${y}px;color:${theme.cursor};border-color:${withAlpha(theme.cursor, 0.7)}`, esc(t.text.toUpperCase())));
    }
  }

  // Sounds: the LED pill from the app, playing the file.
  for (const a of doc.audio) {
    const chip = div("sound", `left:${a.x}px;top:${a.y}px;width:${AUDIO_W}px;height:${AUDIO_H}px`);
    chip.innerHTML = `<span class="play"></span><span class="name">${esc(a.name)}</span><span class="len">${clock(a.ms)}${a.loop ? " LOOP" : ""}</span>`;
    const audio = new Audio(files + a.file);
    audio.loop = a.loop;
    audio.preload = "none";
    chip.setAttribute("role", "button");
    chip.setAttribute("aria-label", `Play ${a.name}`);
    chip.addEventListener("click", () => {
      if (audio.paused) {
        document.querySelectorAll(".sound.playing").forEach((c) => c.dispatchEvent(new Event("stop")));
        audio.play();
        chip.classList.add("playing");
      } else chip.dispatchEvent(new Event("stop"));
    });
    chip.addEventListener("stop", () => { audio.pause(); chip.classList.remove("playing"); });
    audio.addEventListener("ended", () => chip.classList.remove("playing"));
    page.appendChild(chip);
  }

  const over = inkSvg(doc, placed, paper, false, pageW, pageH);
  if (over) page.appendChild(over);
  return page;
}
