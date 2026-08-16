#!/usr/bin/env node
/** Sonda de luminancia para t01-05 · uso: node _t0105_probe.mjs <modo> ... */
import sharp from "sharp";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const REF = "reference/canon/t01-05-specimen-skull.png";
const png = PNG.sync.read(readFileSync(REF));
const { width: W, height: H, data } = png;
const lum = (x, y) => {
  const i = (y * W + x) * 4;
  return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
};
const rgb = (x, y) => {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2]];
};

const modo = process.argv[2];
const num = (i, d) => (process.argv[i] !== undefined ? Number(process.argv[i]) : d);

if (modo === "cols") {
  // media por columna en banda y0..y1, rango x0..x1
  const [y0, y1, x0, x1] = [num(3), num(4), num(5, 0), num(6, W - 1)];
  const out = [];
  for (let x = x0; x <= x1; x++) {
    let s = 0;
    for (let y = y0; y <= y1; y++) s += lum(x, y);
    out.push([x, +(s / (y1 - y0 + 1)).toFixed(1)]);
  }
  const mx = Math.max(...out.map((o) => o[1]));
  for (const [x, v] of out) if (v > mx * 0.35) console.log(x, v);
} else if (modo === "rows") {
  const [x0, x1, y0, y1] = [num(3), num(4), num(5, 0), num(6, H - 1)];
  const out = [];
  for (let y = y0; y <= y1; y++) {
    let s = 0;
    for (let x = x0; x <= x1; x++) s += lum(x, y);
    out.push([y, +(s / (x1 - x0 + 1)).toFixed(1)]);
  }
  const mx = Math.max(...out.map((o) => o[1]));
  for (const [y, v] of out) if (v > mx * 0.35) console.log(y, v);
} else if (modo === "px") {
  const [x, y] = [num(3), num(4)];
  console.log(x, y, rgb(x, y), lum(x, y));
} else if (modo === "line") {
  // volcado crudo horizontal: y, x0..x1
  const [y, x0, x1] = [num(3), num(4), num(5)];
  const r = [];
  for (let x = x0; x <= x1; x++) r.push(`${x}:${lum(x, y)}`);
  console.log(r.join(" "));
} else if (modo === "vline") {
  const [x, y0, y1] = [num(3), num(4), num(5)];
  const r = [];
  for (let y = y0; y <= y1; y++) r.push(`${y}:${lum(x, y)}`);
  console.log(r.join(" "));
} else if (modo === "crop") {
  const [x, y, w, h, esc] = [num(3), num(4), num(5), num(6), num(7, 4)];
  const dst = process.argv[8] || "/tmp/crop.png";
  await sharp(REF).extract({ left: x, top: y, width: w, height: h }).resize({ width: w * esc, kernel: "nearest" }).png().toFile(dst);
  console.log(dst, w * esc, h * esc);
} else if (modo === "paleta") {
  // colores dominantes en una caja
  const [x0, y0, x1, y1] = [num(3), num(4), num(5), num(6)];
  const m = new Map();
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const [r, g, b] = rgb(x, y);
      if (r + g + b < 40) continue;
      const k = `${r >> 4}-${g >> 4}-${b >> 4}`;
      const e = m.get(k) || { n: 0, r: 0, g: 0, b: 0 };
      e.n++; e.r += r; e.g += g; e.b += b;
      m.set(k, e);
    }
  [...m.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 14).forEach(([k, e]) => {
    const hex = (v) => Math.round(v / e.n).toString(16).padStart(2, "0");
    console.log(String(e.n).padStart(7), "#" + hex(e.r) + hex(e.g) + hex(e.b));
  });
} else {
  console.log("modos: cols rows px line vline crop paleta");
}
