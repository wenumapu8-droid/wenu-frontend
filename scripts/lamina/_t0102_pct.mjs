#!/usr/bin/env node
/**
 * Puntaje combinado de un bloque de t01-02 sin escribir historial ni tríptico:
 * lo mismo que score-panel.mjs pero pensado para llamarlo en bucle desde un
 * barrido. Imprime sólo el número.
 *
 *   node scripts/lamina/_t0102_pct.mjs Cabecera [--port 4328]
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const id = process.argv[2];
const i = process.argv.indexOf("--port");
const PORT = i > -1 ? Number(process.argv[i + 1]) : 4321;
const SLUG = "t01-02-observation-eye";
const { caja } = JSON.parse(readFileSync(`scripts/lamina/paneles/${SLUG}.json`, "utf8")).paneles.find((p) => p.id === id);

const ref = PNG.sync.read(readFileSync(`reference/canon/${SLUG}.png`));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: ref.width, height: ref.height }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/kodex/lamina/${SLUG}/`, { waitUntil: "networkidle", timeout: 25000 });
const act = PNG.sync.read(await page.screenshot({ animations: "disabled" }));
await browser.close();

const d = new PNG({ width: ref.width, height: ref.height });
pixelmatch(ref.data, act.data, d.data, ref.width, ref.height, { threshold: 0.12, includeAA: false });
const lum = (img, x, y) => { const j = (y * ref.width + x) * 4; return (img.data[j] * 77 + img.data[j + 1] * 150 + img.data[j + 2] * 29) >> 8; };
let malos = 0, acum = 0, bloques = 0;
for (let by = caja.y; by < caja.y + caja.h; by += 8) for (let bx = caja.x; bx < caja.x + caja.w; bx += 8) {
  let ma = 0, mb = 0, c = 0;
  for (let y = by; y < Math.min(by + 8, caja.y + caja.h); y++) for (let x = bx; x < Math.min(bx + 8, caja.x + caja.w); x++) {
    ma += lum(ref, x, y); mb += lum(act, x, y); c++;
    const j = (y * ref.width + x) * 4;
    if (d.data[j] > 200 && d.data[j + 1] < 100) malos++;
  }
  if (c) { acum += Math.abs(ma / c - mb / c) / 255; bloques++; }
}
console.log((((malos / (caja.w * caja.h)) * 100 + (acum / bloques) * 100) / 2).toFixed(4));
