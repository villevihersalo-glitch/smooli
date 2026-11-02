// Layout rules must match Capture's (model/PageLayout.kt, model/Magazine.kt). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { labelledSongSections, lineHeight, magazineRegions, place, readPage, pageTitle } from "../assets/page.js";

test("line heights land on whole half-lines, like the app", () => {
  assert.equal(lineHeight(18), 32);
  assert.equal(lineHeight(20), 48);
  assert.equal(lineHeight(26), 48);
  assert.equal(lineHeight(36), 64);
  assert.equal(lineHeight(13), 32);
});

test("the Street layout at phone width matches the app's parts", () => {
  const r = magazineRegions("mag-street", 393).map((x) => [x.kind, Math.round(x.x * 10) / 10, x.y, Math.round(x.w * 10) / 10, x.h]);
  assert.deepEqual(r, [
    ["KICKER", 20, 32, 353, 32], ["HEADLINE", 20, 64, 353, 128], ["PHOTO", 0, 192, 393, 304],
    ["CAPTION", 20, 496, 353, 32], ["DECK", 20, 544, 353, 96], ["BYLINE", 20, 640, 353, 32],
    ["BODY", 20, 672, 353, 192], ["QUOTE", 20, 864, 353, 96], ["PHOTO", 20, 976, 112.3, 128],
    ["PHOTO", 140.3, 976, 112.3, 128], ["PHOTO", 260.7, 976, 112.3, 128], ["CAPTION", 20, 1104, 353, 32],
    ["BODY", 20, 1136, 353, 192],
  ]);
});

test("every magazine layout has photos, a headline and a quote, inside the page", () => {
  for (const t of ["street", "travel", "food", "portrait", "nature", "wildlife", "sport", "fashion"]) {
    const r = magazineRegions("mag-" + t, 393);
    const kinds = new Set(r.map((x) => x.kind));
    assert.ok(kinds.has("PHOTO") && kinds.has("HEADLINE") && kinds.has("QUOTE"), t);
    for (const x of r) assert.ok(x.x >= 0 && x.x + x.w <= 393.01, t);
  }
});

test("a block that would overlap the one above is pushed below it; a short line leaves room beside it", () => {
  const blocks = [
    { id: "a", x: 48, y: 32, size: 18 },
    { id: "b", x: 48, y: 64, size: 18 },
    { id: "c", x: 300, y: 32, size: 18 },
  ];
  const heights = new Map([["a", 96], ["b", 32], ["c", 32]]);
  const widths = new Map([["a", 200], ["b", 100], ["c", 40]]);
  const p = place(blocks, heights, 393, widths);
  assert.equal(p.get("b").y, 128); // under a's three lines
  assert.equal(p.get("c").y, 32);  // beside a's text, not under it
});

test("older pages read with what they lack filled in", () => {
  const d = readPage({ v: 1, blocks: [{ id: "x", x: 48, y: 64, text: "hi" }] });
  assert.equal(d.template, "ruled");
  assert.equal(d.blocks[0].size, 18);
  assert.deepEqual(d.images, []);
  assert.equal(pageTitle(d), "hi");
  assert.equal(pageTitle(readPage({ template: "song", song: { title: "Night Drive" } })), "Night Drive");
});

test("song sheet sections with their own label print no name (as in Capture)", () => {
  const doc = { template: "song", tags: [
    { kind: "section", text: "HOOK", x: 16, y: 164 },
    { kind: "section", text: "VERSE", x: 16, y: 160 + 2 * 192 + 4 },
    { kind: "section", text: "LOW", x: 16, y: 280 },
    { kind: "chord", text: "Am", x: 16, y: 356 },
  ] };
  assert.deepEqual([...labelledSongSections(doc, new Map())].sort(), [0, 2]);
  assert.equal(labelledSongSections({ ...doc, template: "chords" }, new Map()).size, 0);
});
