#!/usr/bin/env node
/**
 * Calibrador de celdas de la cabecera y el pie de t01-02. Una sola captura del
 * dev server y, para cada rectángulo de interés, la media rgb de la referencia
 * contra la del render, más el factor por el que habría que multiplicar el
 * relleno para que las dos medias coincidan.
 *
 * Existe porque score-panel.mjs devuelve UN número para 1672×88 y con eso no se
 * puede afinar el color de cinco celdas de texto: el número se mueve menos que
 * el ruido de la medición. Acá cada celda se ve sola.
 *
 *   node scripts/lamina/_t0102_cabpie_celdas.mjs [--port 4328]
 */
import { chromium } from "playwright";
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const PORT = Number(arg("--port", 4321));
const SLUG = "t01-02-observation-eye";

const ref = PNG.sync.read(readFileSync(`reference/canon/${SLUG}.png`));
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: ref.width, height: ref.height }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:${PORT}/kodex/lamina/${SLUG}/`, { waitUntil: "networkidle", timeout: 25000 });
const act = PNG.sync.read(await page.screenshot({ animations: "disabled" }));
await browser.close();

/** [nombre, x0, x1, y0, y1] — coordenadas del póster. */
const celdas = [
  ["cab TANDA-01", 714, 767, 51, 59],
  ["cab 01.00.00", 817, 865, 51, 59],
  ["cab 2025-05-22", 921, 982, 51, 59],
  ["cab 16:9 / 4K", 1027, 1081, 51, 59],
  ["cab KX∞-V2.0", 1134, 1190, 51, 59],
  ["cab claves", 708, 1180, 35, 44],
  ["cab marca A", 104, 315, 22, 56],
  ["cab marca B", 318, 660, 22, 56],
  ["cab bajada A", 104, 244, 60, 78],
  ["cab bajada B", 245, 415, 60, 78],
  ["cab árbol", 15, 89, 17, 80],
  ["cab lema", 1232, 1400, 42, 53],
  ["cab ala", 1494, 1660, 31, 64],
  ["cab barras", 1529, 1657, 72, 87],
  ["cab regla marcas", 660, 960, 78, 82],
  ["cab tabla filete", 703, 1645, 28, 30],
  ["CABECERA", 0, 1671, 0, 87],
  ["pie KODEX", 20, 125, 883, 909],
  ["pie barras", 170, 384, 885, 907],
  ["pie VISUAL SYS", 407, 535, 892, 900],
  ["pie BUILT FOR", 670, 945, 889, 902],
  ["pie PATTERN.", 1078, 1290, 890, 902],
  ["pie ala", 1300, 1480, 877, 915],
  ["pie TANDA-01", 1511, 1635, 893, 912],
  ["pie caja", 1491, 1657, 878, 924],
  ["PIE", 0, 1671, 866, 940],
];

const media = (img, x0, x1, y0, y1) => {
  let r = 0, g = 0, b = 0, c = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = (y * img.width + x) * 4;
    r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; c++;
  }
  return [r / c, g / c, b / c];
};

console.log("  celda                 referencia          render              ×");
for (const [n, ...r] of celdas) {
  const a = media(ref, ...r), b = media(act, ...r);
  const sa = a[0] + a[1] + a[2], sb = b[0] + b[1] + b[2];
  const f = sb > 0.5 ? (sa / sb).toFixed(2) : "—";
  const fmt = (v) => v.map((k) => k.toFixed(1).padStart(5)).join(" ");
  console.log(`  ${n.padEnd(18)} ${fmt(a)}   ${fmt(b)}   ${String(f).padStart(5)}`);
}
