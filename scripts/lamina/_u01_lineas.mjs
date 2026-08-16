#!/usr/bin/env node
/**
 * Compara línea de texto por línea de texto la captura contra la referencia.
 *
 * El puntaje por región dice que un rótulo está mal pero no si está corrido, si
 * está ancho o si está demasiado brillante — y las tres cosas se arreglan
 * distinto. Esto devuelve, para cada línea de las dos imágenes, la caja de
 * tinta y el color medio, que es exactamente lo que hace falta para decidir.
 *
 *   node scripts/lamina/_u01_lineas.mjs x0 x1 y0 y1 [umbral]
 */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const ROOT = "/Users/galvazincia/kodex-work";
const imgs = {
  ref: PNG.sync.read(readFileSync(`${ROOT}/reference/canon/u01-origin-field.png`)),
  act: PNG.sync.read(readFileSync(`${ROOT}/scripts/lamina/out/u01-origin-field/actual.png`)),
};
const [x0, x1, y0, y1, uArg] = process.argv.slice(2).map(Number);
const u = uArg || 55;

function lineas(im) {
  const W = im.width;
  const lum = (x, y) => {
    const i = (y * W + x) * 4;
    return (im.data[i] * 77 + im.data[i + 1] * 150 + im.data[i + 2] * 29) >> 8;
  };
  const filas = [];
  for (let y = y0; y <= y1; y++) {
    let n = 0;
    for (let x = x0; x <= x1; x++) if (lum(x, y) >= u) n++;
    filas.push(n);
  }
  const out = [];
  let ini = -1;
  for (let i = 0; i < filas.length; i++) {
    if (filas[i] >= 2 && ini < 0) ini = i;
    else if (filas[i] < 2 && ini >= 0) { out.push([ini + y0, i - 1 + y0]); ini = -1; }
  }
  if (ini >= 0) out.push([ini + y0, y1]);
  return out
    .filter(([a, b]) => b - a >= 3)
    .map(([a, b]) => {
      let mn = 1e9, mx = -1, r = 0, g = 0, bl = 0, c = 0;
      for (let x = x0; x <= x1; x++)
        for (let y = a; y <= b; y++) {
          if (lum(x, y) < u) continue;
          const i = (y * W + x) * 4;
          r += im.data[i]; g += im.data[i + 1]; bl += im.data[i + 2]; c++;
          if (x < mn) mn = x; if (x > mx) mx = x;
        }
      return { a, b, mn, mx, an: mx - mn + 1, rgb: [r / c | 0, g / c | 0, bl / c | 0], n: c };
    });
}

const R = lineas(imgs.ref);
const A = lineas(imgs.act);
const fmt = (l) => l
  ? `y=${l.a}..${l.b} x=${l.mn}..${l.mx} an=${String(l.an).padStart(4)} rgb(${l.rgb.join(",")}) n=${l.n}`
  : "—";
for (let i = 0; i < Math.max(R.length, A.length); i++) {
  console.log(`ref  ${fmt(R[i])}`);
  console.log(`act  ${fmt(A[i])}`);
  if (R[i] && A[i]) {
    console.log(
      `     Δizq ${(A[i].mn - R[i].mn).toString().padStart(4)}  Δder ${(A[i].mx - R[i].mx).toString().padStart(4)}` +
      `  Δancho ${(A[i].an - R[i].an).toString().padStart(4)}  Δy ${(A[i].a - R[i].a).toString().padStart(3)}` +
      `  brillo ×${(A[i].rgb[1] / (R[i].rgb[1] || 1)).toFixed(2)}`
    );
  }
  console.log();
}
