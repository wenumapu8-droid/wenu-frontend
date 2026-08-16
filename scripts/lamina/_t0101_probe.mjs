/**
 * Sonda de métrica: mide la mono del navegador (avance, versal y distancia de
 * la caja de línea a la cima de la versal) en vez de suponerla, y compara la
 * tinta ya renderizada de la lámina contra la del original en una banda.
 *
 * Existe porque las tres constantes de tipografia.ts son de la fuente que
 * resuelva la máquina, no del póster: suponer 0,727 de versal cuando la fuente
 * da 0,74 corre cada texto un píxel y el banco lo cobra en todos sus glifos.
 *
 * Uso: node scripts/lamina/_t0101_probe.mjs            → métrica de la fuente
 *      node scripts/lamina/_t0101_probe.mjs x0 x1 y0 y1 → tinta ref vs actual
 */
import { chromium } from "playwright";
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

if (process.argv.length > 3) {
  const [x0, x1, y0, y1] = process.argv.slice(2).map(Number);
  const lee = (f) => {
    const p = PNG.sync.read(readFileSync(f));
    return (x, y) => { const i = (y * p.width + x) * 4; return (p.data[i] * 77 + p.data[i + 1] * 150 + p.data[i + 2] * 29) >> 8; };
  };
  for (const [f, n] of [["reference/canon/t01-01-threshold-portal.png", "ref"], ["scripts/lamina/_t0101_shot.png", "act"]]) {
    const lum = lee(f);
    let ax = 1e9, bx = -1, ay = 1e9, by = -1;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (lum(x, y) > 12) {
      if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y;
    }
    console.log(`  ${n}  x ${ax}..${bx} (${bx - ax + 1})   y ${ay}..${by} (${by - ay + 1})`);
  }
  process.exit(0);
}

const b = await chromium.launch();
const p = await b.newPage();
await p.setContent(
  `<div style="position:absolute;left:0;top:0;font-family:ui-monospace,'SF Mono',Menlo,Consolas,monospace;font-size:100px;line-height:1;white-space:pre">` +
  `<span id="s">HHHHHHHHHH</span><span id="b" style="display:inline-block;width:0;height:0;vertical-align:baseline"></span></div>`
);
const m = await p.evaluate(() => {
  const s = document.getElementById("s").getBoundingClientRect();
  const base = document.getElementById("b").getBoundingClientRect();
  const c = document.createElement("canvas"); c.width = 300; c.height = 300;
  const x = c.getContext("2d");
  x.fillStyle = "#000"; x.fillRect(0, 0, 300, 300);
  x.font = "100px ui-monospace, 'SF Mono', Menlo, Consolas, monospace";
  x.textBaseline = "alphabetic";
  x.fillStyle = "#fff"; x.fillText("H", 20, 200);
  const d = x.getImageData(0, 0, 300, 300).data;
  let top = -1;
  for (let y = 0; y < 300 && top < 0; y++) for (let xx = 0; xx < 300; xx++) if (d[(y * 300 + xx) * 4] > 128) { top = y; break; }
  return { avance: s.width / 10 / 100, versal: (200 - top) / 100, baseCaja: (base.top - s.top) / 100 };
});
console.log(`  AVANCE ${m.avance.toFixed(5)} em   VERSAL ${m.versal.toFixed(5)} em   base desde la caja ${m.baseCaja.toFixed(5)} em`);
console.log(`  CIMA (caja → cima de versal) ${(m.baseCaja - m.versal).toFixed(5)} em`);
await b.close();
