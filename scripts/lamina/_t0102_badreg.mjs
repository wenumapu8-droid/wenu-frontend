#!/usr/bin/env node
/**
 * Reparto por zona de los píxeles que el banco marca en la cabecera y el pie de
 * t01-02. Una captura y, para cada pieza, cuántos píxeles de su caja fallan.
 *
 * Existe porque score-panel.mjs devuelve UN número para 1672×88 y con eso no se
 * sabe DÓNDE está el error: acá se ve que las tres cuartas partes del residuo
 * de la cabecera viven en la tipografía —trazada y de texto— y que el chrome
 * (marco, reglas, divisorias, marcas) está por debajo del 0,1 %.
 *
 *   node scripts/lamina/_t0102_badreg.mjs [puerto]
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";
const PORT = process.argv[2] || 4328;
const SLUG = "t01-02-observation-eye";
const ref = PNG.sync.read(readFileSync(`reference/canon/${SLUG}.png`));
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: ref.width, height: ref.height }, deviceScaleFactor: 1 });
await p.goto(`http://localhost:${PORT}/kodex/lamina/${SLUG}/`, { waitUntil: "networkidle" });
const act = PNG.sync.read(await p.screenshot({ animations: "disabled" }));
await b.close();
const d = new PNG({ width: ref.width, height: ref.height });
pixelmatch(ref.data, act.data, d.data, ref.width, ref.height, { threshold: 0.12, includeAA: false });
const regs = [
  ["cab marcaA", 100, 320, 18, 60], ["cab marcaB", 320, 665, 18, 60],
  ["cab bajA", 100, 246, 58, 80], ["cab bajB", 246, 420, 58, 80],
  ["cab arbol", 10, 95, 12, 85], ["cab claves", 700, 1185, 33, 46],
  ["cab valores", 700, 1240, 46, 62], ["cab lema", 1230, 1405, 40, 55],
  ["cab ala", 1490, 1665, 28, 68], ["cab barras", 1525, 1660, 68, 90],
  ["cab tabla", 700, 1650, 26, 34], ["cab tabla2", 700, 1650, 62, 70],
  ["cab marcas", 425, 1670, 76, 85], ["cab marco", 0, 1671, 0, 12],
  ["CAB", 0, 1671, 0, 87],
  ["pie marca", 15, 130, 878, 915], ["pie barras", 165, 390, 880, 912],
  ["pie visual", 400, 540, 886, 906], ["pie built", 665, 950, 884, 906],
  ["pie ppp", 1073, 1295, 885, 906], ["pie ala", 1295, 1485, 872, 920],
  ["pie caja", 1486, 1662, 874, 928], ["pie regla", 0, 1671, 862, 870],
  ["PIE", 0, 1671, 866, 940],
];
const isBad = (x, y) => d.data[(y * ref.width + x) * 4] > 200 && d.data[(y * ref.width + x) * 4 + 1] < 100;
for (const [n, x0, x1, y0, y1] of regs) {
  let c = 0, tot = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { tot++; if (isBad(x, y)) c++; }
  console.log(`  ${n.padEnd(12)} ${String(c).padStart(6)} malos / ${String(tot).padStart(6)}  ${(c / tot * 100).toFixed(2)}%`);
}
