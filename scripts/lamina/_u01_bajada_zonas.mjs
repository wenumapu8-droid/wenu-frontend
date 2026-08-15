#!/usr/bin/env node
/**
 * KODEX-∞ · u01-origin-field · reparto del puntaje de la bajada por zona
 *
 * La región `bajada` mide 1000×40 y adentro conviven cinco cosas distintas
 * (sig, guía izquierda, lema, guía derecha, folio). El puntaje de la región
 * dice 3,286 % sin decir cuál de las cinco lo paga. Esto lo reparte con la
 * MISMA métrica que compare.mjs —pixelmatch a 0,12 más el estructural por
 * bloques de 8×8— para no elegir a ojo qué arreglar primero.
 *
 * Uso: node scripts/lamina/_u01_bajada_zonas.mjs
 */
import { PNG } from "pngjs";
import pixelmatch from "pixelmatch";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const ref = PNG.sync.read(readFileSync(join(ROOT, "reference", "canon", "u01-origin-field.png")));
const act = PNG.sync.read(readFileSync(join(ROOT, "scripts", "lamina", "out", "u01-origin-field", "actual.png")));

const Y = 190, H = 40;
const zonas = [
  ["sig  A / -inf", 85, 175],
  ["guia izq", 250, 315],
  ["lema", 315, 812],
  ["guia der", 815, 880],
  ["folio PAGE 01", 965, 1045],
  ["resto vacio", 60, 85],
];

function bloques(a, b, w, h) {
  const lum = (img, px, py) => {
    const i = (py * w + px) * 4;
    return (img.data[i] * 77 + img.data[i + 1] * 150 + img.data[i + 2] * 29) >> 8;
  };
  let suma = 0, n = 0;
  for (let by = 0; by < h; by += 8) {
    for (let bx = 0; bx < w; bx += 8) {
      let sa = 0, sb = 0, c = 0;
      for (let y = by; y < Math.min(by + 8, h); y++)
        for (let x = bx; x < Math.min(bx + 8, w); x++) { sa += lum(a, x, y); sb += lum(b, x, y); c++; }
      if (!c) continue;
      suma += Math.abs(sa / c - sb / c) / 255;
      n++;
    }
  }
  return n ? (suma / n) * 100 : 0;
}

console.log("\nzona                 caja x            px    distintos  pixel%  estruct%   pct");
let totalBad = 0;
for (const [nombre, x0, x1] of zonas) {
  const w = x1 - x0, h = H;
  const a = new PNG({ width: w, height: h });
  const b = new PNG({ width: w, height: h });
  PNG.bitblt(act, a, x0, Y, w, h, 0, 0);
  PNG.bitblt(ref, b, x0, Y, w, h, 0, 0);
  const bad = pixelmatch(a.data, b.data, null, w, h, { threshold: 0.12, includeAA: false });
  const pixel = (bad / (w * h)) * 100;
  const est = bloques(a, b, w, h);
  totalBad += bad;
  console.log(
    `${nombre.padEnd(20)} ${String(x0).padStart(4)}..${String(x1).padStart(4)} ${String(w * h).padStart(6)} ` +
    `${String(bad).padStart(9)}  ${pixel.toFixed(2).padStart(6)}  ${est.toFixed(3).padStart(7)}  ${((pixel + est) / 2).toFixed(3).padStart(6)}`
  );
}
console.log(`\ndistintos sumados en las zonas: ${totalBad}  (la región entera declara 2350)`);
