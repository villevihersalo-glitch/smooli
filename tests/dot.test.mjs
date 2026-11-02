// The Dot family's pages (content/dot.json). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkDot, flowsFor, youtubeId, playUrl } from "../assets/dot.js";

const dot = JSON.parse(readFileSync(new URL("../content/dot.json", import.meta.url)));

test("dot.json keeps its rules", () => {
  assert.deepEqual(checkDot(dot), []);
  assert.equal(dot.apps.length, 9);
});

test("the apps match the DOT APPS list inside the apps (same ids and names)", () => {
  const inApps = {
    "com.vihersalo.beatpad": ".BEATPAD", "com.vihersalo.mobstudio": ".STUDIO", "com.vihersalo.capture": ".CAPTURE",
    "com.vihersalo.battlewall": ".BATTLEWALL", "com.vihersalo.tapedeck": ".BOOMBOX", "com.vihersalo.dotfinder": ".FINDER",
    "com.vihersalo.doteditor": ".EDITOR", "com.ledwall.app": ".WALLPAPER", "com.vihersalo.calc": ".CALCULATOR",
  };
  assert.deepEqual(Object.fromEntries(dot.apps.map((a) => [a.pkg, a.name])), inApps);
});

test("flows name the apps in them", () => {
  assert.ok(flowsFor(dot, "studio").some((f) => f.id === "song"));
  assert.deepEqual(flowsFor(dot, "calculator"), []);
});

test("YouTube links of every usual kind give the video id", () => {
  for (const s of ["dQw4w9WgXcQ", "https://youtu.be/dQw4w9WgXcQ", "https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=3",
    "https://youtube.com/shorts/dQw4w9WgXcQ", "https://www.youtube.com/embed/dQw4w9WgXcQ"]) assert.equal(youtubeId(s), "dQw4w9WgXcQ");
  assert.equal(youtubeId("not a link"), null);
  assert.equal(playUrl("com.vihersalo.calc"), "https://play.google.com/store/apps/details?id=com.vihersalo.calc");
});
