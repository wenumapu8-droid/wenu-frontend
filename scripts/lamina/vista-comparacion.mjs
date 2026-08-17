#!/usr/bin/env node
/**
 * KODEX-∞ · VISTA DE COMPARACIÓN — el material del veredicto autoral
 *
 * Genera la vista referencia|construido de TODAS las láminas medidas, para la
 * revisión KEEP / REFINE / REJECT del creador (KOD-70: AUTHORIAL_STATE es una
 * prueba distinta de QA_STATE — la cobertura dice que funciona, no que se ve
 * y se siente como KODEX; eso sólo lo dice el creador mirando).
 *
 * Antes esta vista se armaba a mano y quedó congelada en las 18 originales.
 * Este script la regenera entera desde disco: recorre scripts/lamina/out/,
 * busca la referencia en canon/ o pendientes/, compone el par lado a lado y
 * escribe el índice con cobertura y diferencia por lámina.
 *
 * Uso:  node scripts/lamina/vista-comparacion.mjs
 * Sale: ~/Trabajos-Aparte/KODEX/vistas/comparacion/  (fuera de dist/ a
 *       propósito: npm run build borra dist/ entero)
 */
import sharp from "sharp";
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { homedir } from "node:os";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const OUT = join(homedir(), "Trabajos-Aparte", "KODEX", "vistas", "comparacion");
mkdirSync(OUT, { recursive: true });

const refDe = (slug) => {
  for (const dir of ["canon", "pendientes"]) {
    const p = join(ROOT, "reference", dir, `${slug}.png`);
    if (existsSync(p)) return p;
  }
  return null;
};

const filas = [];
for (const slug of readdirSync(join(HERE, "out")).sort()) {
  const scorePath = join(HERE, "out", slug, "score.json");
  const actualPath = join(HERE, "out", slug, "actual.png");
  if (!existsSync(scorePath) || !existsSync(actualPath)) continue;
  const ref = refDe(slug);
  if (!ref) continue; // sin referencia no hay comparación honesta
  const s = JSON.parse(readFileSync(scorePath, "utf8"));
  if (s.global?.cobertura == null) continue;

  /* el par: referencia | construido, misma altura, con canal de 8px */
  const ALTO = 640;
  const a = await sharp(ref).resize({ height: ALTO }).toBuffer();
  const b = await sharp(actualPath).resize({ height: ALTO }).toBuffer();
  const ma = await sharp(a).metadata();
  const mb = await sharp(b).metadata();
  await sharp({
    create: {
      width: ma.width + mb.width + 8,
      height: ALTO,
      channels: 3,
      background: { r: 24, g: 24, b: 28 },
    },
  })
    .composite([
      { input: a, left: 0, top: 0 },
      { input: b, left: ma.width + 8, top: 0 },
    ])
    .png()
    .toFile(join(OUT, `${slug}.png`));

  filas.push({ s: slug, cob: +s.global.cobertura.toFixed(1), dif: +(s.global.pct ?? 0).toFixed(3) });
}
filas.sort((x, y) => y.cob - x.cob);
writeFileSync(join(OUT, "datos.json"), JSON.stringify(filas, null, 1));

const html = `<!doctype html><meta charset="utf-8">
<title>KODEX · comparación referencia | construido</title>
<style>
  body{margin:0;background:#101014;color:#e8e4dc;font:14px/1.5 ui-monospace,monospace;padding:24px}
  h1{font-size:18px;letter-spacing:.1em} p{color:#8a867e;max-width:70ch}
  .fila{margin:34px 0} img{max-width:100%;display:block;border:1px solid #26262c}
  .meta{display:flex;gap:18px;margin:6px 0;font-size:13px}
  .cob{color:#9ad} .veredicto{color:#c9a84c;letter-spacing:.14em}
</style>
<h1>REFERENCIA | CONSTRUIDO · ${filas.length} láminas</h1>
<p>Izquierda la plancha de referencia, derecha lo construido en código. La cobertura es
QA_STATE — dice que la tinta está, no que la lámina esté bien. El veredicto
KEEP / REFINE / REJECT es tuyo y no lo puede dar ningún agente.</p>
${filas
  .map(
    (f) => `<div class="fila">
  <div class="meta"><b>${f.s}</b><span class="cob">cobertura ${f.cob}%</span><span>diff ${f.dif}%</span>
  <span class="veredicto">KEEP / REFINE / REJECT → _____</span></div>
  <img src="${f.s}.png" loading="lazy" alt="${f.s}: referencia y construido lado a lado">
</div>`,
  )
  .join("\n")}
`;
writeFileSync(join(OUT, "index.html"), html);
console.log(`  ${filas.length} pares regenerados → ${OUT}`);
