#!/usr/bin/env node
/**
 * KODEX-∞ · PUNTAJE DE UN SOLO PANEL
 *
 * Mide UN panel contra su referencia sin construir el sitio.
 *
 * Por qué existe: en la primera lámina los agentes verificaban su trabajo
 * corriendo `astro build` entero — 19 segundos y 1.558 páginas para mirar un
 * recuadro de 547×110. Repetido cientos de veces, ése fue uno de los dos
 * grandes sumideros de costo (el otro fue redibujar a ojo lo que se puede
 * trazar). Con esto un agente se puntúa a sí mismo en ~2 segundos y puede
 * iterar solo hasta que el número baje, en vez de entregar a ciegas y esperar
 * una vuelta completa del equipo.
 *
 * Sirve el dev server (que ya tiene HMR) en vez de construir, y recorta la
 * captura a la caja del panel.
 *
 * Uso:
 *   node scripts/lamina/score-panel.mjs <slug> <PanelId> [--port 4321] [--triptico]
 *
 * Salida: una línea con el porcentaje, y código de salida 0 siempre (el número
 * es el dato, no un fallo).
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

const slug = process.argv[2];
const panelId = process.argv[3];
const arg = (n, d) => {
  const i = process.argv.indexOf(n);
  return i > -1 ? process.argv[i + 1] : d;
};
const PORT = Number(arg("--port", 4321));
const triptico = process.argv.includes("--triptico");

if (!slug || !panelId) {
  console.error("uso: node scripts/lamina/score-panel.mjs <slug> <PanelId> [--port 4321] [--triptico]");
  process.exit(2);
}

const panelesPath = join(HERE, "paneles", `${slug}.json`);
if (!existsSync(panelesPath)) {
  console.error(`falta ${panelesPath}`);
  process.exit(2);
}
const panel = JSON.parse(readFileSync(panelesPath, "utf8")).paneles.find((p) => p.id === panelId);
if (!panel) {
  console.error(`panel "${panelId}" no está en ${slug}.json`);
  process.exit(2);
}

const refPath = join(ROOT, "reference", "canon", `${slug}.png`);
const refFull = PNG.sync.read(readFileSync(refPath));
const { width: W, height: H } = refFull;
const url = `http://localhost:${PORT}${process.env.KDX_PAGINA ?? `/kodex/lamina/${slug}/`}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
try {
  await page.goto(url, { waitUntil: "networkidle", timeout: 25000 });
} catch {
  console.error(`no responde ${url} — levantá el dev server con: npm run dev`);
  await browser.close();
  process.exit(2);
}
await page
  .evaluate(() => { if (typeof window.__kdxFreeze === "function") window.__kdxFreeze(0); })
  .catch(() => {});
await page.waitForTimeout(300);
const shot = await page.screenshot({ animations: "disabled" });
await browser.close();

const { x, y, w, h } = panel.caja;
const [refBuf, actBuf] = await Promise.all([
  sharp(refPath).extract({ left: x, top: y, width: w, height: h }).png().toBuffer(),
  sharp(shot).extract({ left: x, top: y, width: w, height: h }).png().toBuffer(),
]);
const a = PNG.sync.read(refBuf);
const b = PNG.sync.read(actBuf);
const d = new PNG({ width: w, height: h });
const bad = pixelmatch(a.data, b.data, d.data, w, h, { threshold: 0.12, includeAA: false });

/**
 * Misma métrica combinada que compare.mjs, y por la misma razón: el diff píxel
 * a píxel solo PREMIA DEJAR EL PANEL VACÍO en zonas de textura (con densidad
 * p < 0,5 el óptimo de p + q − 2pq está en q = 0). Si este script usara otra
 * métrica que el banco, los agentes optimizarían contra un número distinto del
 * que después se les mide, que es peor que no medir.
 */
const BLOQUE = 8;
const lumAt = (img, px, py) => {
  const i = (py * w + px) * 4;
  return (img.data[i] * 77 + img.data[i + 1] * 150 + img.data[i + 2] * 29) >> 8;
};
let acum = 0, bloques = 0;
for (let by = 0; by < h; by += BLOQUE) {
  for (let bx = 0; bx < w; bx += BLOQUE) {
    let sa = 0, sb = 0, c = 0;
    for (let yy = by; yy < Math.min(by + BLOQUE, h); yy++) {
      for (let xx = bx; xx < Math.min(bx + BLOQUE, w); xx++) { sa += lumAt(a, xx, yy); sb += lumAt(b, xx, yy); c++; }
    }
    if (c) { acum += Math.abs(sa / c - sb / c) / 255; bloques++; }
  }
}
const estructural = bloques ? (acum / bloques) * 100 : 0;
const pixelPct = (bad / (w * h)) * 100;
const pct = (pixelPct + estructural) / 2;

// Historial por panel: sin esto un agente no sabe si su último cambio mejoró o
// empeoró, que es la única pregunta que importa mientras itera.
const outDir = join(HERE, "out", slug, "paneles");
mkdirSync(outDir, { recursive: true });
const hp = join(outDir, `${panelId}${process.env.KDX_PAGINA ? "-solo" : ""}.json`);
const hist = existsSync(hp) ? JSON.parse(readFileSync(hp, "utf8")) : [];
const previo = hist.length ? hist[hist.length - 1].pct : null;
hist.push({ n: hist.length + 1, pct: +pct.toFixed(3), pixel: +pixelPct.toFixed(3), estructural: +estructural.toFixed(3) });
writeFileSync(hp, JSON.stringify(hist, null, 2));

if (triptico) {
  const gap = 8;
  const esc = Math.max(1, Math.min(3, Math.floor(2200 / (w * 3 + gap * 2))));
  await sharp({ create: { width: w * 3 + gap * 2, height: h, channels: 3, background: "#303030" } })
    .composite([
      { input: refBuf, left: 0, top: 0 },
      { input: actBuf, left: w + gap, top: 0 },
      { input: PNG.sync.write(d), left: (w + gap) * 2, top: 0 },
    ])
    .resize({ width: (w * 3 + gap * 2) * esc, kernel: "nearest" })
    .png()
    .toFile(join(outDir, `${panelId}${process.env.KDX_PAGINA ? "-solo" : ""}-triptico.png`));
}

const flecha = previo === null ? "línea base" : pct < previo ? `MEJORA ${(previo - pct).toFixed(2)}` : pct > previo ? `EMPEORÓ ${(pct - previo).toFixed(2)}` : "igual";
console.log(`  ${panelId}  ${pct.toFixed(2)}%   (${flecha})   pixel ${pixelPct.toFixed(2)} · estructural ${estructural.toFixed(2)}   caja ${x},${y} ${w}×${h}`);
if (triptico) console.log(`  → scripts/lamina/out/${slug}/paneles/${panelId}-triptico.png  (referencia | actual | diff)`);
