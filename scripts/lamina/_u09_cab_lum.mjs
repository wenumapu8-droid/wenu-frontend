#!/usr/bin/env node
/** u09-source · luminancia media de la referencia en zonas puntuales. */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const ref = PNG.sync.read(readFileSync("reference/canon/u09-source.png"));
const act = PNG.sync.read(readFileSync("scripts/lamina/out/u09-source/actual.png"));

const lum = (png, x, y) => {
  const i = (png.width * y + x) << 2;
  return 0.2126 * png.data[i] + 0.7152 * png.data[i + 1] + 0.0722 * png.data[i + 2];
};

// histograma de luminancia de una caja: media de los px > piso, y cuántos superan 40
const zona = (nombre, x0, x1, y0, y1, piso = 12) => {
  const vs = { ref: [], act: [] };
  for (const [k, png] of [["ref", ref], ["act", act]]) {
    for (let y = y0; y <= y1; y++)
      for (let x = x0; x <= x1; x++) {
        const l = lum(png, x, y);
        if (l > piso) vs[k].push(l);
      }
  }
  const st = (a) => {
    if (!a.length) return "  (sin tinta)";
    a.sort((p, q) => p - q);
    const med = a[Math.floor(a.length / 2)];
    const p90 = a[Math.floor(a.length * 0.9)];
    const sobre40 = a.filter((v) => v >= 40).length;
    return `n=${a.length} mediana=${med.toFixed(0)} p90=${p90.toFixed(0)} >=40:${sobre40}`;
  };
  console.log(`${nombre}\n  ref: ${st(vs.ref)}\n  act: ${st(vs.act)}`);
};

zona("titulo KODEX x 94..437 y 100..150", 94, 437, 100, 150, 60);
zona("titulo SOURCE x 632..942 y 100..150", 632, 942, 100, 150, 60);
