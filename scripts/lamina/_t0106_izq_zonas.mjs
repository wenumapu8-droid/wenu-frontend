#!/usr/bin/env node
/** Diff por zonas del bloque Izquierda: dice dónde está el error, no cuánto. */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";
import { readFileSync } from "node:fs";
const PORT = Number(process.argv[2] ?? 4326);
const REF = "reference/canon/t01-06-ritual-device.png";
const ref = PNG.sync.read(readFileSync(REF));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: ref.width, height: ref.height }, deviceScaleFactor: 1 });
await p.goto(`http://localhost:${PORT}/kodex/lamina/t01-06-izq-solo/`, { waitUntil: "networkidle" });
await p.evaluate(() => { if (typeof window.__kdxFreeze === "function") window.__kdxFreeze(0); }).catch(() => {});
await p.waitForTimeout(250);
const shot = await p.screenshot({ animations: "disabled" });
await b.close();
const ZONAS = [
  ["p01 marco+rotulos", 16, 97, 399, 27], ["p01 regla", 16, 126, 46, 345],
  ["p01 dispositivo", 56, 126, 198, 350], ["p01 etiquetas", 236, 130, 178, 340],
  ["p01 glifos", 16, 471, 399, 45], ["p01 materiales", 16, 516, 399, 53],
  ["p02 rotulo", 419, 95, 172, 32],
  ["p02 celda1", 427, 130, 193, 110], ["p02 celda2", 427, 249, 193, 109],
  ["p02 celda3", 427, 367, 193, 108], ["p02 celda4", 427, 483, 193, 81],
  ["p05 titulo", 16, 579, 474, 25],
  ["p05 onda A", 20, 604, 226, 72], ["p05 onda B", 252, 604, 236, 72],
  ["p05 stack", 20, 679, 226, 121], ["p05 mapa", 252, 679, 236, 121],
  ["p05 metricas", 16, 800, 474, 49],
  ["p06 rebanada", 493, 579, 127, 270],
  ["vacio inferior", 4, 849, 616, 17],
];
for (const [n, x, y, w, h] of ZONAS) {
  const [a, c] = await Promise.all([
    sharp(REF).extract({ left: x, top: y, width: w, height: h }).png().toBuffer(),
    sharp(shot).extract({ left: x, top: y, width: w, height: h }).png().toBuffer(),
  ]);
  const A = PNG.sync.read(a), C = PNG.sync.read(c);
  const bad = pixelmatch(A.data, C.data, null, w, h, { threshold: 0.12, includeAA: false });
  const lu = (img, px, py) => { const i = (py * w + px) * 4; return (img.data[i] * 77 + img.data[i + 1] * 150 + img.data[i + 2] * 29) >> 8; };
  let acum = 0, k = 0, la = 0, lc = 0;
  for (let by = 0; by < h; by += 8) for (let bx = 0; bx < w; bx += 8) {
    let sa = 0, sc = 0, q = 0;
    for (let yy = by; yy < Math.min(by + 8, h); yy++) for (let xx = bx; xx < Math.min(bx + 8, w); xx++) { sa += lu(A, xx, yy); sc += lu(C, xx, yy); q++; }
    acum += Math.abs(sa / q - sc / q) / 255; k++; la += sa / q; lc += sc / q;
  }
  const est = (acum / k) * 100, pix = (bad / (w * h)) * 100;
  console.log(n.padEnd(20), `${((pix + est) / 2).toFixed(2)}%`.padStart(7), ` pix ${pix.toFixed(1).padStart(5)}  est ${est.toFixed(2).padStart(5)}  lum ref ${(la / k).toFixed(1).padStart(5)} vs ${(lc / k).toFixed(1).padStart(5)}`);
}
