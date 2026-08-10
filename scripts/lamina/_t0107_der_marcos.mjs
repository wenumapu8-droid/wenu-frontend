#!/usr/bin/env node
/** Emite el array `marcos` del bloque Derecha de t01-07: cada línea de chrome
 *  como [x, y, w, h, "#rrggbb"] relativa al origen de la caja (1175, 88).
 *
 *  Una fila/columna es marco si más del 90 % de un tramo largo tiene tinta y
 *  ese tramo es más brillante que sus vecinas de arriba y abajo (una regla es
 *  un pico de 1-2 px; el borde de un organismo no lo es). */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const img = PNG.sync.read(readFileSync("reference/canon/t01-07-cosmology-core.png"));
const { width: W, data } = img;
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const [r, g, b] = px(x, y); return (r * 77 + g * 150 + b * 29) >> 8; };

const BX = 1175, BY = 88;
const X0 = 1175, X1 = 1667, Y0 = 88, Y1 = 865;
const U = 8;          // tinta mínima
const MIN = Number(process.argv[2] ?? 90); // largo mínimo de un tramo de marco
const COB = 0.9;

const salida = [];

/** Runs de tinta a lo largo de un eje, tolerando huecos de hasta 3 px. */
function runs(get, a, b) {
  const out = [];
  let ini = null, hueco = 0;
  for (let i = a; i <= b; i++) {
    if (get(i) > U) { if (ini === null) ini = i; hueco = 0; }
    else if (ini !== null) { hueco++; if (hueco > 3) { out.push([ini, i - hueco]); ini = null; hueco = 0; } }
  }
  if (ini !== null) out.push([ini, b - hueco]);
  return out.filter(([p, q]) => q - p + 1 >= MIN);
}

function color(pts) {
  let r = 0, g = 0, b = 0;
  for (const [x, y] of pts) { const c = px(x, y); r += c[0]; g += c[1]; b += c[2]; }
  const n = pts.length || 1;
  return "#" + [r / n, g / n, b / n].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");
}

// ── filas ────────────────────────────────────────────────────────────────
for (let y = Y0; y <= Y1; y++) {
  for (const [a, b] of runs((x) => lum(x, y), X0, X1)) {
    const n = b - a + 1;
    let cob = 0, mia = 0, arr = 0, aba = 0;
    for (let x = a; x <= b; x++) {
      const l = lum(x, y);
      if (l > U) cob++;
      mia += l; arr += lum(x, Math.max(0, y - 2)); aba += lum(x, Math.min(940, y + 2));
    }
    if (cob / n < COB) continue;
    if (mia / n < (arr / n) * 1.5 || mia / n < (aba / n) * 1.5) continue; // pico contra AMBOS vecinos
    const pts = []; for (let x = a; x <= b; x++) pts.push([x, y]);
    salida.push([a - BX, y - BY, n, 1, color(pts), "fila", Math.round(mia / n)]);
  }
}

// ── columnas ─────────────────────────────────────────────────────────────
for (let x = X0; x <= X1; x++) {
  for (const [a, b] of runs((y) => lum(x, y), Y0, Y1)) {
    const n = b - a + 1;
    let cob = 0, mia = 0, izq = 0, der = 0;
    for (let y = a; y <= b; y++) {
      const l = lum(x, y);
      if (l > U) cob++;
      mia += l; izq += lum(Math.max(0, x - 2), y); der += lum(Math.min(W - 1, x + 2), y);
    }
    if (cob / n < COB) continue;
    if (mia / n < (izq / n) * 1.5 || mia / n < (der / n) * 1.5) continue;
    const pts = []; for (let y = a; y <= b; y++) pts.push([x, y]);
    salida.push([x - BX, a - BY, 1, n, color(pts), "col", Math.round(mia / n)]);
  }
}

for (const s of salida) console.log(`  [${s[0]}, ${s[1]}, ${s[2]}, ${s[3]}, "${s[4]}"],   // ${s[5]} lum ${s[6]}`);
console.error(`\n  ${salida.length} tramos\n`);
