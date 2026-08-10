#!/usr/bin/env node
/** Los peores bloques de 8×8 del bloque Izquierda: dónde queda el error.
 *  uso: node scripts/lamina/_t0104_izq_peor.mjs [puerto] [n] */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import sharp from "sharp";
import { readFileSync } from "node:fs";

const PORT = Number(process.argv[2] || 4331);
const N = Number(process.argv[3] || 24);
const CAJA = { x: 4, y: 88, w: 396, h: 778 };

const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1672, height: 941 }, deviceScaleFactor: 1 });
await p.goto(`http://localhost:${PORT}/kodex/lamina/t01-04-archive-tree/`, { waitUntil: "load", timeout: 60000 });
await p.waitForTimeout(2500);
const shot = await p.screenshot({ timeout: 60000 });
await b.close();

const [ra, rb] = await Promise.all([
  sharp("reference/canon/t01-04-archive-tree.png").extract({ left: CAJA.x, top: CAJA.y, width: CAJA.w, height: CAJA.h }).png().toBuffer(),
  sharp(shot).extract({ left: CAJA.x, top: CAJA.y, width: CAJA.w, height: CAJA.h }).png().toBuffer(),
]);
const A = PNG.sync.read(ra), B = PNG.sync.read(rb);
const lum = (im, x, y) => { const i = (y * CAJA.w + x) * 4; return (im.data[i] * 77 + im.data[i + 1] * 150 + im.data[i + 2] * 29) >> 8; };

const bloques = [];
for (let by = 0; by < CAJA.h; by += 8) for (let bx = 0; bx < CAJA.w; bx += 8) {
  let sa = 0, sb = 0, n = 0;
  for (let y = by; y < Math.min(by + 8, CAJA.h); y++) for (let x = bx; x < Math.min(bx + 8, CAJA.w); x++) { sa += lum(A, x, y); sb += lum(B, x, y); n++; }
  bloques.push({ bx, by, d: Math.abs(sa / n - sb / n), ref: sa / n, act: sb / n });
}
bloques.sort((a, b) => b.d - a.d);
for (const q of bloques.slice(0, N)) {
  console.log(`caja ${String(q.bx).padStart(3)},${String(q.by).padStart(3)}  póster ${String(q.bx + 4).padStart(4)},${String(q.by + 88).padStart(3)}  Δ${q.d.toFixed(1).padStart(6)}  ref ${q.ref.toFixed(1).padStart(6)}  act ${q.act.toFixed(1).padStart(6)}`);
}
const tot = bloques.reduce((a, q) => a + q.d / 255, 0) / bloques.length * 100;
console.log(`\nestructural ${tot.toFixed(3)} %   ·   bloques con Δ>8: ${bloques.filter((q) => q.d > 8).length} de ${bloques.length}`);
