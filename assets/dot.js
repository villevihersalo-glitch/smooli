/*
 * The Dot family on the site (content/dot.json, written by hand, never by Capture's PUBLISH):
 *   #/dot          every app, and how they work together
 *   #/dot/<app>    one app: what it does, its features, the apps it works with, explainer videos
 */
import { led, ledKey, AMBER, level, MID, DIM } from "./led.js";

const GREEN = "#39ff6a";

/** The rules dot.json must keep (also run by tests/dot.test.mjs). Returns a list of problems. */
export function checkDot(dot) {
  const out = [];
  const ids = new Set((dot.apps || []).map((a) => a.id));
  for (const a of dot.apps || []) {
    if (!a.name || !a.name.startsWith(".")) out.push(`${a.id}: name must start with a dot`);
    for (const w of a.with || []) if (!ids.has(w) || w === a.id) out.push(`${a.id}: works with unknown ${w}`);
    for (const v of a.videos || []) if (!youtubeId(v.youtube) && !v.file) out.push(`${a.id}: video needs youtube or file`);
  }
  for (const f of dot.flows || []) for (const s of f.steps || []) if (!ids.has(s.app)) out.push(`${f.id}: unknown app ${s.app}`);
  if (ids.size !== (dot.apps || []).length) out.push("app ids repeat");
  return out;
}

/** The flows an app takes part in. */
export const flowsFor = (dot, id) => (dot.flows || []).filter((f) => f.steps.some((s) => s.app === id));

/** A YouTube video id from an id or any usual YouTube link, else null. */
export function youtubeId(s) {
  if (!s) return null;
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = String(s).match(/(?:youtu\.be\/|v=|shorts\/|embed\/)([\w-]{11})/);
  return m ? m[1] : null;
}

/** The Google Play page for an app. */
export const playUrl = (pkg) => "https://play.google.com/store/apps/details?id=" + pkg;

function el(tag, cls, kids = []) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  for (const k of [].concat(kids)) if (k) e.append(k);
  return e;
}
const text = (tag, cls, t) => { const e = el(tag, cls); e.textContent = t; return e; };
const appOf = (dot, id) => (dot.apps || []).find((a) => a.id === id);

/** A small app chip that links to its page. */
function chip(dot, id) {
  const a = appOf(dot, id);
  const k = ledKey(a ? a.name : id, { href: "#/dot/" + id, pitch: 1.6 });
  k.classList.add("chip");
  return k;
}

function flow(dot, f) {
  const box = el("section", "flow");
  box.id = "flow-" + f.id;
  box.append(led(f.title, { pitch: 2.2 }));
  if (f.about) box.append(text("p", "flow-about", f.about));
  const ol = el("ol", "steps");
  for (const s of f.steps) ol.append(el("li", null, [chip(dot, s.app), text("span", null, s.what)]));
  box.append(ol);
  return box;
}

/** #/dot: the family. */
export function dotHome(dot) {
  const main = el("main", "dot");
  main.append(el("div", "dot-head", [led(dot.title || ".DOT", { pitch: 5, unlit: true }), led(dot.tagline || "", { pitch: 1.6, color: level(AMBER, MID) })]));
  if (dot.intro) main.append(text("p", "dot-intro", dot.intro));
  main.append(el("h2", "dot-h", [led("HOW THEY WORK TOGETHER", { pitch: 2, color: level(AMBER, MID) })]));
  const flows = el("div", "flows");
  for (const f of dot.flows || []) flows.append(flow(dot, f));
  main.append(flows);
  main.append(el("h2", "dot-h", [led("THE APPS", { pitch: 2, color: level(AMBER, MID) })]));
  const grid = el("div", "dot-apps");
  for (const a of dot.apps || []) {
    const card = el("a", "dot-app");
    card.href = "#/dot/" + a.id;
    card.append(led(a.name, { pitch: 2.6 }), led(a.tagline || "", { pitch: 1.4, color: level(AMBER, MID) }));
    card.append(text("p", null, a.about));
    card.append(el("div", "dot-app-foot", [led(a.released ? "ON GOOGLE PLAY" : "COMING SOON", { pitch: 1.3, color: a.released ? GREEN : level(AMBER, DIM) }),
      (a.videos || []).length ? led(`${a.videos.length} VIDEO${a.videos.length > 1 ? "S" : ""}`, { pitch: 1.3, color: level(AMBER, MID) }) : null]));
    grid.append(card);
  }
  main.append(grid);
  return main;
}

function video(v) {
  const box = el("figure", "video");
  const yt = youtubeId(v.youtube);
  if (yt) {
    const f = el("iframe");
    f.src = `https://www.youtube-nocookie.com/embed/${yt}`;
    f.title = v.title || "Video";
    f.loading = "lazy";
    f.allow = "encrypted-media; picture-in-picture; fullscreen";
    f.allowFullscreen = true;
    box.append(f);
  } else {
    const m = el("video");
    m.src = "content/dot/" + v.file;
    m.controls = true;
    m.preload = "metadata";
    m.playsInline = true;
    box.append(m);
  }
  if (v.title) box.append(text("figcaption", null, v.title));
  return box;
}

/** #/dot/<app>: one app. */
export function dotApp(dot, id) {
  const a = appOf(dot, id);
  if (!a) return null;
  const main = el("main", "dot dot-one");
  main.append(el("div", "post-bar", [ledKey("< .DOT", { href: "#/dot" })]));
  main.append(el("div", "dot-head", [led(a.name, { pitch: 5 }), led(a.tagline || "", { pitch: 1.8, color: level(AMBER, MID) })]));
  main.append(text("p", "dot-intro", a.about));
  const store = a.released
    ? (() => { const x = ledKey("GET IT ON GOOGLE PLAY", { href: playUrl(a.pkg) }); x.target = "_blank"; x.rel = "noopener"; return x; })()
    : led("COMING SOON TO GOOGLE PLAY", { pitch: 1.8, color: level(AMBER, MID) });
  main.append(el("div", "dot-store", [store]));
  if ((a.videos || []).length) {
    main.append(el("h2", "dot-h", [led("VIDEOS", { pitch: 2, color: level(AMBER, MID) })]));
    main.append(el("div", "videos", a.videos.map(video)));
  }
  if ((a.features || []).length) {
    main.append(el("h2", "dot-h", [led("WHAT IT DOES", { pitch: 2, color: level(AMBER, MID) })]));
    main.append(el("ul", "features", a.features.map((f) => text("li", null, f))));
  }
  if ((a.with || []).length) {
    main.append(el("h2", "dot-h", [led("WORKS WITH", { pitch: 2, color: level(AMBER, MID) })]));
    main.append(el("div", "chips", a.with.map((w) => chip(dot, w))));
  }
  const fl = flowsFor(dot, id);
  if (fl.length) {
    main.append(el("h2", "dot-h", [led("IN THE FAMILY", { pitch: 2, color: level(AMBER, MID) })]));
    const flows = el("div", "flows");
    for (const f of fl) flows.append(flow(dot, f));
    main.append(flows);
  }
  return main;
}
