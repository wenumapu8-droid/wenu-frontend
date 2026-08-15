#!/usr/bin/env node
/**
 * u01-origin-field · ¿DÓNDE falta la tinta?
 *
 * La cobertura global es 73,3 % (52.188 px de tinta contra 71.183 de la
 * referencia): faltan ~19.000 px. El puntaje dice cuánto falta, no dónde, y la
 * regla del brief es AGREGAR donde falta, no sacar donde sobra. Esto lo
 * localiza en tres cortes, sobre `out/<slug>/actual.png` contra la referencia:
 *
 *   · por banda horizontal   — para saber si falta una franja entera de lámina
 *   · por anillo radial      — desde el centro medido (561,675)
 *   · por sector angular     — para ver si falta un lado del campo
 *
 * Umbral 26, el mismo que usa `extraer-campo.mjs`, para que los totales sean
 * comparables con la receta.
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const T = 26;
const CX = 561, CY = 675;

const ref = PNG.sync.read(readFileSync(join(ROOT, "reference/canon/u01-origin-field.png")));
const act = PNG.sync.read(readFileSync(join(ROOT, "scripts/lamina/out/u01-origin-field/actual.png")));
const W = ref.width, H = ref.height;
console.log(`ref ${W}x${H}   actual ${act.width}x${act.height}\n`);

const mk = (p) => (x, y) => {
  const i = (y * p.width + x) * 4;
  return 0.299 * p.data[i] + 0.587 * p.data[i + 1] + 0.114 * p.data[i + 2];
};
const lr = mk(ref), la = mk(act);

const barra = (r, a) => {
  const pct = r ? (a / r) * 100 : 0;
  const n = Math.round(Math.min(pct, 150) / 5);
  return `${"█".repeat(Math.min(n, 20))}${pct > 100 ? "+" : ""}`;
};

/* ── por banda horizontal de 50 px ─────────────────────────────────────── */
console.log("banda y        ref     act    cob%   falta");
let tr = 0, ta = 0;
for (let y0 = 0; y0 < H; y0 += 50) {
  let r = 0, a = 0;
  for (let y = y0; y < Math.min(y0 + 50, H); y++) for (let x = 0; x < W; x++) {
    if (lr(x, y) > T) r++;
    if (la(x, y) > T) a++;
  }
  tr += r; ta += a;
  const cob = r ? (a / r) * 100 : 0;
  console.log(
    `${String(y0).padStart(4)}-${String(y0 + 50).padEnd(5)} ${String(r).padStart(6)} ${String(a).padStart(6)}` +
    ` ${cob.toFixed(0).padStart(5)}%  ${String(Math.max(0, r - a)).padStart(6)}  ${barra(r, a)}`
  );
}
console.log(`TOTAL          ${tr}  ${ta}   ${((ta / tr) * 100).toFixed(1)}%  falta ${tr - ta}\n`);

/* ── por anillo radial de 20 px ────────────────────────────────────────── */
console.log("radio          ref     act    cob%   falta");
const PASO = 20, NR = 30;
const rr = new Array(NR).fill(0), ra = new Array(NR).fill(0);
for (let y = 240; y < 1020; y++) for (let x = 60; x < 1060; x++) {
  const k = Math.floor(Math.hypot(x - CX, y - CY) / PASO);
  if (k >= NR) continue;
  if (lr(x, y) > T) rr[k]++;
  if (la(x, y) > T) ra[k]++;
}
for (let k = 0; k < NR; k++) {
  const cob = rr[k] ? (ra[k] / rr[k]) * 100 : 0;
  console.log(
    `${String(k * PASO).padStart(4)}-${String(k * PASO + PASO).padEnd(5)} ${String(rr[k]).padStart(6)} ${String(ra[k]).padStart(6)}` +
    ` ${cob.toFixed(0).padStart(5)}%  ${String(Math.max(0, rr[k] - ra[k])).padStart(6)}  ${barra(rr[k], ra[k])}`
  );
}

/* ── por sector angular de 30° ─────────────────────────────────────────── */
console.log("\nsector         ref     act    cob%");
const NS = 12;
const sr = new Array(NS).fill(0), sa = new Array(NS).fill(0);
for (let y = 240; y < 1020; y++) for (let x = 60; x < 1060; x++) {
  const d = Math.hypot(x - CX, y - CY);
  if (d > 520) continue;
  const k = Math.floor(((Math.atan2(y - CY, x - CX) + Math.PI) / (2 * Math.PI)) * NS) % NS;
  if (lr(x, y) > T) sr[k]++;
  if (la(x, y) > T) sa[k]++;
}
for (let k = 0; k < NS; k++) {
  const cob = sr[k] ? (sa[k] / sr[k]) * 100 : 0;
  console.log(
    `${String(k * 30 - 180).padStart(5)}°       ${String(sr[k]).padStart(6)} ${String(sa[k]).padStart(6)}` +
    ` ${cob.toFixed(0).padStart(5)}%  ${barra(sr[k], sa[k])}`
  );
}
