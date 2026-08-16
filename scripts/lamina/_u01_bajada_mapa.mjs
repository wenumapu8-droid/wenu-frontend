#!/usr/bin/env node
/**
 * KODEX-∞ · u01-origin-field · mapa 2D de luminancia de una caja
 *
 * Complemento de `_u01_bajada_lum.mjs`: el perfil por columnas dice CUÁNTA
 * tinta hay, éste dice QUÉ FORMA tiene. Hace falta para distinguir un anillo
 * de un rombo o de un tramo de raya cuando las dos cosas miden 12 px de ancho.
 *
 * Uso: node scripts/lamina/_u01_bajada_mapa.mjs <png> <x0> <x1> <y0> <y1> [num]
 * Escala: . <16   : <40   - <70   + <110   # >=110
 * Con `num` imprime la luminancia cruda: los anillos de la bajada miden 6 px
 * de lado y el centro sub-píxel no se saca de una escala de cinco símbolos.
 */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const [, , file, x0s, x1s, y0s, y1s] = process.argv;
const png = PNG.sync.read(readFileSync(file));
const W = png.width;
const lum = (x, y) => {
  const i = (y * W + x) * 4;
  return (png.data[i] * 77 + png.data[i + 1] * 150 + png.data[i + 2] * 29) >> 8;
};
const ch = (l) => (l < 16 ? "." : l < 40 ? ":" : l < 70 ? "-" : l < 110 ? "+" : "#");
const [x0, x1, y0, y1] = [+x0s, +x1s, +y0s, +y1s];
const num = process.argv[7] === "num";
const rgb = process.argv[7] === "rgb";

if (rgb) {
  /* El píxel más brillante de la caja, en RGB. La opacidad de un rótulo no se
     puede despejar sin saber de qué color es la tinta: `--cb-sig-op` sale de
     dividir esta luminancia por la del `fill` declarado, no de mirar. */
  let best = { l: -1 };
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) {
      const l = lum(x, y), i = (y * png.width + x) * 4;
      if (l > best.l) best = { l, x, y, r: png.data[i], g: png.data[i + 1], b: png.data[i + 2] };
    }
  console.log(`  máximo en (${best.x},${best.y}) = rgb(${best.r},${best.g},${best.b})  lum ${best.l}`);
} else if (num) {
  console.log(`      ${Array.from({ length: x1 - x0 + 1 }, (_, i) => String(x0 + i).slice(-3).padStart(4)).join("")}`);
  for (let y = y0; y <= y1; y++) {
    let row = "";
    for (let x = x0; x <= x1; x++) row += String(lum(x, y)).padStart(4);
    console.log(`${String(y).padStart(5)} ${row}`);
  }
} else {
  console.log(`      ${Array.from({ length: x1 - x0 + 1 }, (_, i) => ((x0 + i) % 10 === 0 ? "|" : " ")).join("")}`);
  for (let y = y0; y <= y1; y++) {
    let row = "";
    for (let x = x0; x <= x1; x++) row += ch(lum(x, y));
    console.log(`${String(y).padStart(5)} ${row}`);
  }
}
