#!/usr/bin/env node
/** Detecta bordes continuos: columnas/filas con alta cobertura de tinta. */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const png = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, height: H, data } = png;
const lum = (x, y) => {
  const i = (y * W + x) * 4;
  return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
};
const n = (i, d) => (process.argv[i] !== undefined ? Number(process.argv[i]) : d);
const modo = process.argv[2];
const [x0, x1, y0, y1, umbral, cob] = [n(3), n(4), n(5), n(6), n(7, 8), n(8, 0.85)];
if (modo === "v") {
  for (let x = x0; x <= x1; x++) {
    let c = 0;
    for (let y = y0; y <= y1; y++) if (lum(x, y) >= umbral) c++;
    const f = c / (y1 - y0 + 1);
    if (f >= cob) console.log("x", x, f.toFixed(2));
  }
} else {
  for (let y = y0; y <= y1; y++) {
    let c = 0;
    for (let x = x0; x <= x1; x++) if (lum(x, y) >= umbral) c++;
    const f = c / (x1 - x0 + 1);
    if (f >= cob) console.log("y", y, f.toFixed(2));
  }
}
