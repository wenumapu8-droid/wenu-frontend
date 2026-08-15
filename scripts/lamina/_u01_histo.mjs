#!/usr/bin/env node
/**
 * u01-origin-field · histograma de luminancia del campo medio
 *
 * `_u01_falta.mjs` localizó el hueco: el anillo r=140..420 tiene 30 % de la
 * tinta de la referencia. Pero "tinta" es un umbral binario (lum > 26), así que
 * hay dos maneras muy distintas de tener la misma luminancia MEDIA y una sola
 * es la de la referencia:
 *
 *   a) muchos píxeles tenues  (lum 4..8)   → media correcta, cobertura cero
 *   b) pocos píxeles brillantes (lum ~150) → media correcta, cobertura alta
 *
 * El histograma distingue las dos. Si la referencia es (b) y el render es (a),
 * el problema no es cuánta luz hay sino cómo está repartida, y subir la opacidad
 * global sólo emborrona más.
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const CX = 561, CY = 675;

const ref = PNG.sync.read(readFileSync(join(ROOT, "reference/canon/u01-origin-field.png")));
const act = PNG.sync.read(readFileSync(join(ROOT, "scripts/lamina/out/u01-origin-field/actual.png")));
const mk = (p) => (x, y) => {
  const i = (y * p.width + x) * 4;
  return 0.299 * p.data[i] + 0.587 * p.data[i + 1] + 0.114 * p.data[i + 2];
};
const lr = mk(ref), la = mk(act);

const CORTES = [0, 4, 8, 14, 20, 26, 40, 60, 90, 130, 180, 256];

function histo(f, r0, r1) {
  const h = new Array(CORTES.length - 1).fill(0);
  let n = 0, suma = 0;
  for (let y = 240; y < 1020; y++) for (let x = 60; x < 1060; x++) {
    const d = Math.hypot(x - CX, y - CY);
    if (d < r0 || d >= r1) continue;
    const v = f(x, y);
    n++; suma += v;
    for (let k = 0; k < CORTES.length - 1; k++) {
      if (v >= CORTES[k] && v < CORTES[k + 1]) { h[k]++; break; }
    }
  }
  return { h, n, media: suma / n };
}

for (const [r0, r1] of [[140, 260], [260, 420], [60, 140]]) {
  const R = histo(lr, r0, r1), A = histo(la, r0, r1);
  console.log(`\n══ anillo r ${r0}..${r1}   ${R.n.toLocaleString()} px`);
  console.log(`   media  ref ${R.media.toFixed(2)}   actual ${A.media.toFixed(2)}`);
  console.log(`   lum        ref        actual`);
  for (let k = 0; k < CORTES.length - 1; k++) {
    const pr = (R.h[k] / R.n) * 100, pa = (A.h[k] / A.n) * 100;
    const marca = CORTES[k] >= 26 ? " ← tinta" : "";
    console.log(
      `   ${String(CORTES[k]).padStart(3)}-${String(CORTES[k + 1]).padEnd(3)}` +
      ` ${String(R.h[k]).padStart(7)} ${pr.toFixed(2).padStart(6)}%` +
      ` ${String(A.h[k]).padStart(7)} ${pa.toFixed(2).padStart(6)}%${marca}`
    );
  }
  const tr = R.h.slice(5).reduce((a, b) => a + b, 0);
  const ta = A.h.slice(5).reduce((a, b) => a + b, 0);
  console.log(`   tinta   ref ${tr}   actual ${ta}   cobertura ${((ta / tr) * 100).toFixed(0)}%`);
  const br = R.h.slice(5).reduce((s, v, i) => s + v * (CORTES[i + 5] + CORTES[i + 6]) / 2, 0) / (tr || 1);
  const ba = A.h.slice(5).reduce((s, v, i) => s + v * (CORTES[i + 5] + CORTES[i + 6]) / 2, 0) / (ta || 1);
  console.log(`   brillo medio de la tinta:  ref ${br.toFixed(0)}   actual ${ba.toFixed(0)}`);
}
