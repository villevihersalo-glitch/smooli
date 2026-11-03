// Brush and spray ink, matching Capture's model/InkLooks.kt (InkLooksTest checks the same numbers). Run: node --test
import { test } from "node:test";
import assert from "node:assert/strict";
import { rand, seedOf, sprayDots, sprayRadius, brushWidths } from "../assets/page.js";

test("the spray's random sequence is the phone's", () => {
  const r = rand(12345);
  assert.ok(Math.abs(r() - 0.9797282) < 1e-6);
  assert.ok(Math.abs(r() - 0.3067522) < 1e-6);
  assert.equal(seedOf([10, 4.5]), 5504722);
});

test("spray stays near its path; brush is thick across the nib", () => {
  const line = (x0, y0, x1, y1, n = 20) => Array.from({ length: n * 2 }, (_, k) => {
    const t = Math.floor(k / 2) / (n - 1);
    return k % 2 === 0 ? x0 + (x1 - x0) * t : y0 + (y1 - y0) * t;
  });
  const dots = sprayDots(line(10, 50, 210, 50), 4);
  assert.ok(dots.length / 3 > 100);
  for (let k = 0; k < dots.length; k += 3) assert.ok(Math.abs(dots[k + 1] - 50) <= sprayRadius(4) + 1e-6);
  assert.ok(brushWidths(line(0, 100, 100, 0), 10)[10] > 9); // up and to the right: across the nib
  assert.ok(brushWidths(line(0, 0, 100, 100), 10)[10] < 3.5); // down and to the right: along it
});
