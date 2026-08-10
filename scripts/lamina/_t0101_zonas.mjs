/**
 * Diff por zonas: dice DÓNDE está el error dentro de un panel, que es lo que el
 * porcentaje global no dice. Toma una captura del dev server y compara los
 * rectángulos que se le pasen (en coordenadas del póster).
 *
 * Uso: node scripts/lamina/_t0101_zonas.mjs <x0,y0,x1,y1:nombre> ...
 *      node scripts/lamina/_t0101_zonas.mjs --recorte <x0,y0,x1,y1> <escala>
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";

const SLUG = "t01-01-threshold-portal";
const REF = `reference/canon/${SLUG}.png`;
const { width: W, height: H } = PNG.sync.read(readFileSync(REF));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto(`http://localhost:4321/kodex/lamina/${SLUG}/`, { waitUntil: "networkidle", timeout: 25000 });
/* La lámina la escriben varios agentes a la vez y el dev server sirve la página
   entera. Si CUALQUIER panel está a medio guardar, Astro devuelve su pantalla
   de error —blanca, a página completa— y todas las zonas miden ~94 %. Sin este
   corte esos números entran en el historial como si fueran medidas. */
const roto = await page.evaluate(() => document.body.innerText.includes("An error occurred") || !!document.querySelector("vite-error-overlay"));
if (roto) {
  console.error("  la página está en error (otro panel a medio guardar) — no se mide");
  await browser.close();
  process.exit(3);
}
await page.evaluate(() => { if (typeof window.__kdxFreeze === "function") window.__kdxFreeze(0); }).catch(() => {});
await page.waitForTimeout(250);
const shot = await page.screenshot({ animations: "disabled" });
await browser.close();
writeFileSync("scripts/lamina/_t0101_shot.png", shot);

if (process.argv[2] === "--recorte") {
  const [x0, y0, x1, y1] = process.argv[3].split(",").map(Number);
  const esc = Number(process.argv[4] ?? 3);
  const w = x1 - x0 + 1, h = y1 - y0 + 1, gap = 4;
  const [a, b] = await Promise.all([
    sharp(REF).extract({ left: x0, top: y0, width: w, height: h }).png().toBuffer(),
    sharp(shot).extract({ left: x0, top: y0, width: w, height: h }).png().toBuffer(),
  ]);
  await sharp({ create: { width: w, height: h * 2 + gap, channels: 3, background: "#303030" } })
    .composite([{ input: a, left: 0, top: 0 }, { input: b, left: 0, top: h + gap }])
    .resize({ width: w * esc, kernel: "nearest" })
    .png()
    .toFile("scripts/lamina/_t0101_par.png");
  console.log(`  → scripts/lamina/_t0101_par.png  (arriba referencia, abajo actual) ×${esc}`);
} else {
  for (const spec of process.argv.slice(2)) {
    const [caja, nombre] = spec.split(":");
    const [x0, y0, x1, y1] = caja.split(",").map(Number);
    const w = x1 - x0 + 1, h = y1 - y0 + 1;
    const [a, b] = await Promise.all([
      sharp(REF).extract({ left: x0, top: y0, width: w, height: h }).png().toBuffer(),
      sharp(shot).extract({ left: x0, top: y0, width: w, height: h }).png().toBuffer(),
    ]);
    const pa = PNG.sync.read(a), pb = PNG.sync.read(b);
    const bad = pixelmatch(pa.data, pb.data, null, w, h, { threshold: 0.12, includeAA: false });

    /* Misma métrica combinada que score-panel.mjs: media del diff píxel a píxel
       y del error de luminancia por bloques de 8. Medir la zona con otra
       fórmula que el banco es afinar contra un número que después no se cobra. */
    const BLOQUE = 8;
    const lumAt = (img, px, py) => { const i = (py * w + px) * 4; return (img.data[i] * 77 + img.data[i + 1] * 150 + img.data[i + 2] * 29) >> 8; };
    let acum = 0, bloques = 0;
    for (let by = 0; by < h; by += BLOQUE) for (let bx = 0; bx < w; bx += BLOQUE) {
      let sa = 0, sb = 0, c = 0;
      for (let yy = by; yy < Math.min(by + BLOQUE, h); yy++) for (let xx = bx; xx < Math.min(bx + BLOQUE, w); xx++) { sa += lumAt(pa, xx, yy); sb += lumAt(pb, xx, yy); c++; }
      if (c) { acum += Math.abs(sa / c - sb / c) / 255; bloques++; }
    }
    const est = bloques ? (acum / bloques) * 100 : 0;
    const pix = (bad / (w * h)) * 100;
    console.log(`  ${(nombre ?? caja).padEnd(16)} ${(((pix + est) / 2)).toFixed(2).padStart(6)}%   pixel ${pix.toFixed(2).padStart(6)} · estructural ${est.toFixed(2).padStart(5)}   ${w}×${h}`);
  }
}
