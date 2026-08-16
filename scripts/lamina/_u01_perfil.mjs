#!/usr/bin/env node
/**
 * Perfil radial del campo: captura contra referencia.
 *
 * El diff global no dice DÓNDE está mal una nube radial —puede estar gorda
 * adentro y flaca afuera y dar el mismo número que si estuviera bien—. Esto
 * compara la luminancia media sobre cada circunferencia centrada en el núcleo,
 * que es la magnitud que gobierna cómo se lee el campo.
 *
 *   node scripts/lamina/_u01_perfil.mjs
 */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const ROOT = "/Users/galvazincia/kodex-work";
const ref = PNG.sync.read(readFileSync(`${ROOT}/reference/canon/u01-origin-field.png`));
const act = PNG.sync.read(readFileSync(`${ROOT}/scripts/lamina/out/u01-origin-field/actual.png`));
const W = ref.width, H = ref.height;
const L = (im, x, y) => {
  const i = (y * W + x) * 4;
  return (im.data[i] * 77 + im.data[i + 1] * 150 + im.data[i + 2] * 29) >> 8;
};
const CX = 561, CY = 675;

/** Media sobre la circunferencia de radio r, saltando lo que cae fuera. */
function anillo(im, r) {
  let s = 0, c = 0;
  const n = Math.max(240, Math.round(r * 8));
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x = Math.round(CX + Math.cos(a) * r);
    const y = Math.round(CY + Math.sin(a) * r);
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    s += L(im, x, y); c++;
  }
  return c ? s / c : 0;
}

const barra = (v) => "█".repeat(Math.max(0, Math.round(v * 1.1))).padEnd(46, " ");
console.log("   r    ref  actual   dif");
let e2 = 0, n = 0;
for (let r = 10; r <= 460; r += 10) {
  const a = anillo(ref, r), b = anillo(act, r);
  e2 += (a - b) * (a - b); n++;
  console.log(
    `${String(r).padStart(4)}  ${a.toFixed(1).padStart(5)}  ${b.toFixed(1).padStart(6)}  ${(b - a).toFixed(1).padStart(6)}  ref ${barra(a)}`
  );
  console.log(`                                    act ${barra(b)}`);
}
console.log(`\n  RMS del perfil: ${Math.sqrt(e2 / n).toFixed(2)}`);
