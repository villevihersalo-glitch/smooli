/*
 * The site: a front page of every post, one page per section (a Capture notebook) and one
 * page per post (a Capture page), all from content/site.json, written by Capture's PUBLISH.
 * Addresses: #/  ·  #/s/<section id>  ·  #/p/<page id>  ·  #/projects  ·  #/dot  ·  #/dot/<app>
 */
import { led, ledKey, AMBER, level, MID, DIM } from "./led.js";
import { readPage, renderPage, PAPERS } from "./page.js";
import { dotHome, dotApp } from "./dot.js";

const CONTENT = "content/";
const FILES = CONTENT + "files/";
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const app = document.getElementById("app");
let site = null;
const PROJECTS = "\u0000projects";
const DOT = "\u0000dot";
let dot = null;
const LAMP = { off: "#8b877e", red: "#ff3b30", yellow: "#ffd60a", green: "#32d74b" };
const STATUS = {
  off: "NOT STARTED", red: "PAUSED", yellow: "IN PROGRESS", green: "READY",
};

const el = (tag, cls, kids = []) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  for (const k of [].concat(kids)) if (k) e.append(k);
  return e;
};
const date = (ms) => {
  const d = new Date(ms);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

async function loadSite() {
  if (site) return site;
  const r = await fetch(CONTENT + "site.json", { cache: "no-cache" });
  site = r.ok ? await r.json() : { title: "SMOOLI", sections: [] };
  return site;
}

/** Every post with its section, newest first. */
function allPosts(only) {
  const out = [];
  for (const s of site.sections || []) {
    if (only && s.id !== only) continue;
    for (const p of s.posts || []) out.push({ ...p, section: s });
  }
  return out.sort((a, b) => (b.date || 0) - (a.date || 0));
}

function header(active) {
  const top = el("header", "top");
  const title = el("a", "brand", [led(site.title || "SMOOLI", { pitch: 4, unlit: true })]);
  title.href = "#/";
  top.append(title);
  if (site.tagline) top.append(el("div", "tagline", [led(site.tagline, { pitch: 1.6, color: level(AMBER, MID) })]));
  const nav = el("nav", "sections");
  nav.append(ledKey("ALL", { href: "#/", chosen: !active }));
  if ((site.projects || []).length) nav.append(ledKey("PROJECTS", { href: "#/projects", chosen: active === PROJECTS }));
  nav.append(ledKey(".DOT APPS", { href: "#/dot", chosen: active === DOT }));
  for (const s of site.sections || []) {
    if (!(s.posts || []).length) continue;
    nav.append(ledKey(s.title, { href: "#/s/" + encodeURIComponent(s.id), chosen: active === s.id }));
  }
  top.append(nav);
  return top;
}

function footer() {
  return el("footer", "bottom", [led("MADE IN .CAPTURE  ·  .DOT", { pitch: 1.4, color: level(AMBER, DIM) })]);
}

/** A post on the front page: its paper, cover picture, section, title, date and first words. */
function card(p) {
  const theme = PAPERS[p.section.paper] || PAPERS.warm;
  const a = el("a", "card");
  a.href = "#/p/" + encodeURIComponent(p.id);
  a.style.cssText = `background:${theme.paper};color:${theme.text};font-family:${theme.font}`;
  if (p.cover) {
    const img = el("img", "cover");
    img.src = FILES + p.cover;
    img.alt = "";
    img.loading = "lazy";
    a.append(img);
  }
  const body = el("div", "card-body");
  const meta = el("div", "meta", [led(p.section.title, { pitch: 1.4, color: theme.cursor }), led(date(p.date), { pitch: 1.4, color: theme.hint })]);
  const h = el("h2");
  h.textContent = p.title || "Untitled";
  h.style.cssText = `font-size:${24 * theme.scale}px;color:${theme.accent}`;
  body.append(meta, h);
  if (p.excerpt) {
    const x = el("p");
    x.textContent = p.excerpt;
    x.style.fontSize = 16 * theme.scale + "px";
    body.append(x);
  }
  a.append(body);
  return a;
}

function list(active) {
  const posts = allPosts(active);
  const main = el("main", "list");
  if (!posts.length) main.append(el("div", "empty", [led("NOTHING PUBLISHED YET", { pitch: 2, color: level(AMBER, MID) })]));
  for (const p of posts) main.append(card(p));
  app.replaceChildren(header(active), main, footer());
  const s = active && site.sections.find((x) => x.id === active);
  document.title = s ? `${s.title} · ${site.title}` : site.title;
}

/** The PROJECTS board from Capture: every public project with its status lamp. */
function projects() {
  const main = el("main", "board");
  const legend = el("div", "legend");
  for (const [k, label] of Object.entries(STATUS)) {
    legend.append(el("span", null, [el("i", "lamp " + k), led(label, { pitch: 1.4, color: level(AMBER, MID) })]));
  }
  const grid = el("div", "projects");
  for (const p of site.projects || []) {
    const card = el("article", "project");
    const thumb = el("div", "thumb");
    if (p.image) {
      const img = el("img");
      img.src = FILES + p.image;
      img.alt = "";
      img.loading = "lazy";
      thumb.append(img);
    } else thumb.append(el("div", "ph", [led("NO IMAGE", { pitch: 1.6, color: "#3a3a40" })]));
    const head = el("div", "row");
    const lamp = el("i", "lamp " + (STATUS[p.status] ? p.status : "off"));
    lamp.title = STATUS[p.status] || STATUS.off;
    const title = el("h2");
    title.textContent = p.title || "Untitled";
    head.append(lamp, title);
    const body = el("div", "body", [head]);
    if (p.subtitle) { const x = el("div", "subtitle"); x.textContent = p.subtitle; body.append(x); }
    if (p.notes) { const x = el("div", "notes"); x.textContent = p.notes; body.append(x); }
    const st = STATUS[p.status] ? p.status : "off";
    body.append(el("div", "status", [led(STATUS[st], { pitch: 1.4, color: LAMP[st] })]));
    card.append(thumb, body);
    grid.append(card);
  }
  main.append(legend, grid);
  if (site.projectsUpdated) main.append(el("div", "updated", [led("UPDATED " + date(site.projectsUpdated), { pitch: 1.4, color: level(AMBER, DIM) })]));
  app.replaceChildren(header(PROJECTS), main, footer());
  document.title = `Projects · ${site.title}`;
}

async function post(id) {
  const p = allPosts().find((x) => x.id === id);
  if (!p) return list(null);
  const bar = el("div", "post-bar", [
    ledKey("< BACK", { href: "#/s/" + encodeURIComponent(p.section.id) }),
    led(p.section.title, { pitch: 1.8 }),
    led(date(p.updated || p.date), { pitch: 1.6, color: level(AMBER, MID) }),
  ]);
  const sheet = el("div", "sheet");
  const main = el("main", "post", [bar, sheet]);
  app.replaceChildren(header(p.section.id), main, footer());
  document.title = `${p.title} · ${site.title}`;
  window.scrollTo(0, 0);

  const r = await fetch(CONTENT + "pages/" + encodeURIComponent(id) + ".json", { cache: "no-cache" });
  if (!r.ok) {
    sheet.append(led("PAGE NOT FOUND", { pitch: 2, color: level(AMBER, MID) }));
    return;
  }
  const doc = readPage(await r.json());
  await document.fonts.ready;
  const page = renderPage(sheet, doc, p.section.paper, FILES, p.width);
  fit(sheet, page);
}

/** Scales the page (drawn at its phone width) to fill the column; big screens see it larger. */
function fit(sheet, page) {
  const pageW = page.offsetWidth, pageH = page.offsetHeight;
  const k = Math.min(sheet.parentElement.clientWidth / pageW, 1.6);
  page.style.transform = `scale(${k})`;
  sheet.style.width = pageW * k + "px";
  sheet.style.height = pageH * k + "px";
}

/** The Dot family's pages, from content/dot.json (written by hand; Capture never touches it). */
async function dotPages(id) {
  if (!dot) {
    const r = await fetch(CONTENT + "dot.json", { cache: "no-cache" });
    dot = r.ok ? await r.json() : { apps: [], flows: [] };
  }
  const main = id ? dotApp(dot, id) : dotHome(dot);
  if (!main) return dotPages(null);
  app.replaceChildren(header(DOT), main, footer());
  const a = id && dot.apps.find((x) => x.id === id);
  document.title = a ? `${a.name} · .DOT` : `.DOT apps · ${site.title}`;
  window.scrollTo(0, 0);
}

async function route() {
  await loadSite();
  if (location.hash === "#/projects") return projects();
  const d = location.hash.match(/^#\/dot(?:\/([\w-]+))?$/);
  if (d) return dotPages(d[1] || null);
  const [, kind, id] = location.hash.match(/^#\/(s|p)\/(.+)$/) || [];
  if (kind === "p") return post(decodeURIComponent(id));
  list(kind === "s" ? decodeURIComponent(id) : null);
}

window.addEventListener("hashchange", route);
let resize;
window.addEventListener("resize", () => {
  clearTimeout(resize);
  resize = setTimeout(() => {
    const sheet = document.querySelector(".sheet"), page = sheet && sheet.querySelector(".page");
    if (page) fit(sheet, page);
  }, 120);
});
route();
