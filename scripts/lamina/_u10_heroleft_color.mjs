#!/usr/bin/env node
// Color medio de la tinta (lum > umbral) de cada cluster grande de hero-left.
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const img = PNG.sync.read(readFileSync("reference/canon/u10-commons.png"));
const { width: W, data } = img;
const cajas = [
  ["galaxia", 227, 397, 74, 56, 30],
  ["angel", 361, 395, 36, 48, 30],
  ["cetro", 341, 632, 56, 109, 30],
  ["rosa", 352, 950, 69, 55, 26],
];
for (const [n, x0, y0, w, h, u] of cajas) {
  let r = 0, g = 0, b = 0, c = 0;
  for (let y = y0; y < y0 + h; y++)
    for (let x = x0; x < x0 + w; x++) {
      const i = (y * W + x) * 4;
      const l = (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
      if (l > u) { r += data[i]; g += data[i + 1]; b += data[i + 2]; c++; }
    }
  console.log(n, `tinta=${c}px`, `rgb(${Math.round(r / c)} ${Math.round(g / c)} ${Math.round(b / c)})`);
}
