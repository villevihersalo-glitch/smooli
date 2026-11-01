/*
 * The site: a front page of every post, one page per section (a Capture notebook) and one
 * page per post (a Capture page), all from content/site.json, written by Capture's PUBLISH.
 * Addresses: #/  ·  #/s/<section id>  ·  #/p/<page id>
 */
import { led, ledKey, AMBER, level, MID, DIM } from "./led.js";
import { readPage, renderPage, PAPERS } from "./page.js";

const CONTENT = "content/";
const FILES = CONTENT + "files/";
const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
const app = document.getElementById("app");
let site = null;

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
  for (const s of site.sections || []) {
    if (!(s.posts || []).length) continue;
    nav.append(ledKey(s.title, { href: "#/s/" + encodeURIComponent(s.id), chosen: active === s.id }));
  }
  top.append(nav);
  return top;
}

function footer() {
  return el("footer", "bottom", [led("MADE IN CAPTURE  ·  BLOCK PARTY", { pitch: 1.4, color: level(AMBER, DIM) })]);
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

async function route() {
  await loadSite();
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
