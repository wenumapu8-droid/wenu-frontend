#!/usr/bin/env node
/**
 * u01-origin-field · ¿dónde está el centro del campo?
 *
 * `extraer-campo.mjs` toma por defecto (W/2, H·0,542) = (561,760), pero
 * `u01/Campo.astro` declara el núcleo medido en (561,675). Ochenta y cinco
 * píxeles de diferencia mueven TODO lo que la receta extrae: el perfil radial,
 * los radios de los anillos concéntricos y el conteo de radios de la roseta.
 * Antes de usar la receta hay que saber cuál de los dos centros es el real.
 *
 * Mide tres cosas sobre la referencia, en la región del campo:
 *   · el píxel más brillante
 *   · el centroide de tinta
 *   · la luminancia media sobre circunferencias de radio r, para cada candidato
 *
 * El centro verdadero es el que da el pico más alto cerca de r=0 y la caída
 * monótona: un centro corrido aplana el perfil porque promedia el núcleo con su
 * vecindario.
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const png = PNG.sync.read(readFileSync(join(ROOT, "reference/canon/u01-origin-field.png")));
const W = png.width, H = png.height;
const lum = (x, y) => {
  const i = (y * W + x) * 4;
  return 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
};

const X0 = 60, X1 = 1060, Y0 = 240, Y1 = 1020;

let best = 0, bx = 0, by = 0;
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
  const v = lum(x, y);
  if (v > best) { best = v; bx = x; by = y; }
}
console.log(`pixel mas brillante : (${bx},${by})  lum ${best.toFixed(1)}`);

let sx = 0, sy = 0, n = 0;
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
  if (lum(x, y) > 26) { sx += x; sy += y; n++; }
}
console.log(`centroide de tinta  : (${(sx / n).toFixed(1)},${(sy / n).toFixed(1)})  ${n} px\n`);

const RS = [1, 10, 20, 30, 41, 51, 66, 91, 120, 160, 200, 260, 320, 400];
for (const [cx, cy] of [[561, 675], [561, 760], [bx, by]]) {
  const out = [];
  for (const r of RS) {
    let s = 0, c = 0;
    for (let a = 0; a < 720; a++) {
      const x = Math.round(cx + Math.cos((a / 720) * Math.PI * 2) * r);
      const y = Math.round(cy + Math.sin((a / 720) * Math.PI * 2) * r);
      if (x < 0 || x >= W || y < 0 || y >= H) continue;
      s += lum(x, y); c++;
    }
    out.push(`${r}:${(s / c).toFixed(1)}`);
  }
  console.log(`centro (${cx},${cy})`);
  console.log(`  ${out.join("  ")}`);
}
