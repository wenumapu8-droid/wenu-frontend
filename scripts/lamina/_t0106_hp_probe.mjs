#!/usr/bin/env node
/* Sonda de medición para la CABECERA y el PIE de t01-06 RITUAL DEVICE.
   No genera nada: sólo imprime lo que hay en el PNG. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-06-ritual-device.png"));
const { width: W, data } = img;
const rgb = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const p = rgb(x, y); return (p[0] * 77 + p[1] * 150 + p[2] * 29) >> 8; };

/** caja de tinta dentro de una ventana */
function caja(x0, x1, y0, y1, thr) {
  let ax = 1e9, ay = 1e9, bx = -1, by = -1, n = 0, pico = 0, pr = [0, 0, 0];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const v = lum(x, y);
    if (v > pico) { pico = v; pr = rgb(x, y); }
    if (v > thr) { n++; if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y; }
  }
  return { x: ax, y: ay, w: bx - ax + 1, h: by - ay + 1, n, pico, pr: pr.join(",") };
}
const modo = process.argv[2];
if (modo === "caja") {
  const [x0, x1, y0, y1, thr] = process.argv.slice(3).map(Number);
  console.log(JSON.stringify(caja(x0, x1, y0, y1, thr ?? 30)));
} else if (modo === "cols") {
  // perfil de columnas: cuenta de píxeles con tinta por columna en una banda
  const [x0, x1, y0, y1, thr] = process.argv.slice(3).map(Number);
  const out = [];
  for (let x = x0; x <= x1; x++) { let n = 0; for (let y = y0; y <= y1; y++) if (lum(x, y) > (thr ?? 20)) n++; out.push([x, n]); }
  console.log(out.filter(([, n]) => n > 0).map(([x, n]) => `${x}:${n}`).join(" "));
} else if (modo === "rows") {
  const [x0, x1, y0, y1, thr] = process.argv.slice(3).map(Number);
  for (let y = y0; y <= y1; y++) { let n = 0, mx = 0; for (let x = x0; x <= x1; x++) { const v = lum(x, y); if (v > (thr ?? 20)) n++; if (v > mx) mx = v; } console.log(y, n, mx); }
} else if (modo === "runsx") {
  // tramos horizontales con tinta en una fila
  const [y, x0, x1, thr] = process.argv.slice(3).map(Number);
  const r = []; let s = -1;
  for (let x = x0; x <= x1; x++) { const v = lum(x, y) > (thr ?? 20); if (v && s < 0) s = x; if (!v && s >= 0) { r.push([s, x - 1]); s = -1; } }
  if (s >= 0) r.push([s, x1]);
  console.log(JSON.stringify(r));
} else if (modo === "runsy") {
  // tramos verticales con tinta en una columna
  const [x, y0, y1, thr] = process.argv.slice(3).map(Number);
  const r = []; let s = -1;
  for (let y = y0; y <= y1; y++) { const v = lum(x, y) > (thr ?? 20); if (v && s < 0) s = y; if (!v && s >= 0) { r.push([s, y - 1]); s = -1; } }
  if (s >= 0) r.push([s, y1]);
  console.log(JSON.stringify(r));
} else if (modo === "px") {
  const [x0, x1, y] = process.argv.slice(3).map(Number);
  for (let x = x0; x <= x1; x++) console.log(x, rgb(x, y).join(","), lum(x, y));
} else if (modo === "py") {
  const [x, y0, y1] = process.argv.slice(3).map(Number);
  for (let y = y0; y <= y1; y++) console.log(y, rgb(x, y).join(","), lum(x, y));
}
