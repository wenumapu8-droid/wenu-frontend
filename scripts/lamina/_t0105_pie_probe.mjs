#!/usr/bin/env node
/* Sonda del PIE de t01-05: perfiles de tinta por fila y por columna. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, height: H, data } = img;
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const [r, g, b] = px(x, y); return (r * 77 + g * 150 + b * 29) >> 8; };

const Y0 = 860, Y1 = H - 1;
console.log("W,H =", W, H);

console.log("\n== filas y=860..940: n(lum>18), max, x del max ==");
for (let y = Y0; y <= Y1; y++) {
  let n = 0, mx = 0, mxx = -1;
  for (let x = 0; x < W; x++) { const v = lum(x, y); if (v > 18) n++; if (v > mx) { mx = v; mxx = x; } }
  console.log(`y=${y}  n=${String(n).padStart(4)}  max=${String(mx).padStart(3)} @x=${mxx}`);
}

console.log("\n== columnas: tramos con tinta (lum>18) en y=866..940 ==");
const on = [];
for (let x = 0; x < W; x++) {
  let n = 0;
  for (let y = 866; y <= 940; y++) if (lum(x, y) > 18) n++;
  on.push(n > 0);
}
let i = 0;
while (i < W) {
  if (!on[i]) { i++; continue; }
  let j = i; while (j + 1 < W && on[j + 1]) j++;
  console.log(`x=${i}..${j}  (${j - i + 1})`);
  i = j + 1;
}

console.log("\n== TANDA 01 (rojo): pixeles con r-g>25 en y=866..940 ==");
let rx0 = 1e9, rx1 = -1, ry0 = 1e9, ry1 = -1, best = 0, bpx = null;
for (let y = 866; y <= 940; y++) for (let x = 0; x < W; x++) {
  const [r, g, b] = px(x, y);
  if (r - g > 25 && r > 45) { if (x < rx0) rx0 = x; if (x > rx1) rx1 = x; if (y < ry0) ry0 = y; if (y > ry1) ry1 = y; if (r > best) { best = r; bpx = [x, y, r, g, b]; } }
}
console.log("caja roja", { rx0, rx1, ry0, ry1 }, "pico", bpx);

console.log("\n== filas de la caja roja ==");
for (let y = ry0; y <= ry1; y++) {
  let n = 0, x0 = 1e9, x1 = -1;
  for (let x = 0; x < W; x++) { const [r, g] = px(x, y); if (r - g > 25 && r > 45) { n++; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
  console.log(`y=${y} n=${n} x=${x0}..${x1}`);
}

console.log("\n== marco: perfil de columnas x=0..20 y x=1650..1671 en y=900 ==");
for (const x of [...Array(22).keys()].map(k => k).concat([...Array(22).keys()].map(k => 1650 + k))) {
  if (x >= W) continue;
  console.log(`x=${x}  lum(y=900)=${lum(x, 900)}  lum(y=870)=${lum(x, 870)}`);
}
