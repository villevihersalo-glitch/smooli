/*
 * LED lettering in the family's 5 x 7 dot font (docs/LED-SKIN.md): lit dots 72 % of the pitch,
 * unlit dots faint. Letters the font lacks are written in ordinary type in the tint.
 */
import { GLYPHS } from "./glyphs.js";

export const AMBER = "#FFB000";
export const level = (hex, l) => {
  const v = parseInt(hex.slice(1), 16);
  const c = (x) => Math.round(((v >> x) & 255) * l);
  return `rgb(${c(16)},${c(8)},${c(0)})`;
};
export const MID = 0.7, DIM = 0.38, UNLIT = 0.1;

const fits = (text) => [...text.toUpperCase()].every((c) => c === " " || GLYPHS[c]);

/** [text] as LED dots, [pitch] CSS px per dot; or plain tinted type if the font lacks a letter. */
export function led(text, { color = AMBER, pitch = 2, unlit = false } = {}) {
  const t = text.toUpperCase();
  if (!fits(t)) {
    const s = document.createElement("span");
    s.className = "led-fallback";
    s.textContent = text;
    s.style.cssText = `color:${color};font-size:${pitch * 7}px;line-height:${pitch * 7}px`;
    return s;
  }
  const cols = Math.max(1, t.length * 6 - 1);
  const c = document.createElement("canvas");
  const dpr = window.devicePixelRatio || 1;
  c.width = Math.ceil(cols * pitch * dpr);
  c.height = Math.ceil(7 * pitch * dpr);
  c.style.width = cols * pitch + "px";
  c.style.height = 7 * pitch + "px";
  c.className = "led";
  c.setAttribute("role", "img");
  c.setAttribute("aria-label", text);
  const ctx = c.getContext("2d");
  ctx.scale(dpr, dpr);
  const r = pitch * 0.36;
  const dark = unlit ? level(AMBER, UNLIT) : null;
  [...t].forEach((ch, i) => {
    const g = GLYPHS[ch];
    for (let y = 0; y < 7; y++) for (let x = 0; x < 5; x++) {
      const on = g && g[y * 5 + x] === "#";
      if (!on && !dark) continue;
      ctx.fillStyle = on ? color : dark;
      ctx.beginPath();
      ctx.arc((i * 6 + x + 0.5) * pitch, (y + 0.5) * pitch, r, 0, 7);
      ctx.fill();
    }
  });
  return c;
}

/** An LED key: dotted Mid frame, lit label; [chosen] lights the whole key with a dark label. */
export function ledKey(label, { href, chosen = false, pitch = 2 } = {}) {
  const a = document.createElement(href ? "a" : "button");
  if (href) a.href = href;
  a.className = "key" + (chosen ? " chosen" : "");
  a.appendChild(led(label, { color: chosen ? "#000000" : AMBER, pitch }));
  a.setAttribute("aria-label", label);
  return a;
}
