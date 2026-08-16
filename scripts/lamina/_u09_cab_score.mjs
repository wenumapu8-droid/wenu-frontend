#!/usr/bin/env node
/**
 * u09-source · cabecera: pct (misma métrica que compare.mjs / score-panel.mjs)
 * + COBERTURA (tinta act / tinta ref, umbral de luminancia 26 — el mismo 26 de
 * compare.mjs). score-panel.mjs no reporta cobertura y la vara de esta vuelta
 * es cobertura, por eso existe este script. Guarda el crop del render en
 * out/u09-source/paneles/cabecera-actual.png para perfilarlo.
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const slug = "u09-source";
const PORT = Number(process.argv[2] ?? 4321);
const caja = { x: 0, y: 0, w: 1122, h: 232 };

const refPath = join(ROOT, "reference", "canon", `${slug}.png`);
const refFull = PNG.sync.read(readFileSync(refPath));
const url = `http://localhost:${PORT}/kodex/lamina/${slug}/`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: refFull.width, height: refFull.height }, deviceScaleFactor: 1 });
try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
} catch {
  console.error(`no responde ${url} — levantá el dev server`);
  await browser.close();
  process.exit(2);
}
await page.evaluate(() => { if (typeof window.__kdxFreeze === "function") window.__kdxFreeze(0); }).catch(() => {});
await page.waitForTimeout(300);
const shot = await page.screenshot({ animations: "disabled" });
await browser.close();

const { x, y, w, h } = caja;
const [refBuf, actBuf] = await Promise.all([
  sharp(refPath).extract({ left: x, top: y, width: w, height: h }).png().toBuffer(),
  sharp(shot).extract({ left: x, top: y, width: w, height: h }).png().toBuffer(),
]);
const a = PNG.sync.read(refBuf);
const b = PNG.sync.read(actBuf);
const d = new PNG({ width: w, height: h });
const bad = pixelmatch(a.data, b.data, d.data, w, h, { threshold: 0.12, includeAA: false });

const lumAt = (img, px, py) => {
  const i = (py * w + px) * 4;
  return (img.data[i] * 77 + img.data[i + 1] * 150 + img.data[i + 2] * 29) >> 8;
};
let tintaRef = 0, tintaAct = 0;
for (let py = 0; py < h; py++)
  for (let px = 0; px < w; px++) {
    if (lumAt(a, px, py) > 26) tintaRef++;
    if (lumAt(b, px, py) > 26) tintaAct++;
  }
const cobertura = tintaRef ? (tintaAct / tintaRef) * 100 : 100;

const BLOQUE = 8;
let acum = 0, bloques = 0;
for (let by = 0; by < h; by += BLOQUE)
  for (let bx = 0; bx < w; bx += BLOQUE) {
    let sa = 0, sb = 0, c = 0;
    for (let yy = by; yy < Math.min(by + BLOQUE, h); yy++)
      for (let xx = bx; xx < Math.min(bx + BLOQUE, w); xx++) { sa += lumAt(a, xx, yy); sb += lumAt(b, xx, yy); c++; }
    if (c) { acum += Math.abs(sa / c - sb / c) / 255; bloques++; }
  }
const estructural = bloques ? (acum / bloques) * 100 : 0;
const pixelPct = (bad / (w * h)) * 100;
const pct = (pixelPct + estructural) / 2;

const outDir = join(HERE, "out", slug, "paneles");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "cabecera-actual.png"), PNG.sync.write(b));
const hp = join(outDir, "cabecera-hist.json");
const hist = existsSync(hp) ? JSON.parse(readFileSync(hp, "utf8")) : [];
const previo = hist.length ? hist[hist.length - 1] : null;
hist.push({ n: hist.length + 1, pct: +pct.toFixed(3), pixel: +pixelPct.toFixed(3), estructural: +estructural.toFixed(3), cobertura: +cobertura.toFixed(1) });
writeFileSync(hp, JSON.stringify(hist, null, 2));

const dir = previo === null ? "línea base" : `cobertura ${previo.cobertura} → ${cobertura.toFixed(1)} · pct ${previo.pct} → ${pct.toFixed(3)}`;
console.log(`cabecera  cobertura ${cobertura.toFixed(1)}%  pct ${pct.toFixed(3)}%  (pixel ${pixelPct.toFixed(2)} · estructural ${estructural.toFixed(2)})   ${dir}`);
