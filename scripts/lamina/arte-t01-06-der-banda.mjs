#!/usr/bin/env node
/**
 * KODEX-∞ · t01-06 RITUAL DEVICE · ARTE FIJA DE LA BANDA INFERIOR DERECHA
 *
 * Genera src/components/kodex/lamina/t01-06/trazos-banda/*.svg trazando desde
 * reference/canon/t01-06-ritual-device.png las dos piezas PICTÓRICAS de la
 * banda inferior del bloque Derecha. Los .svg NO se editan a mano: se corre
 * esto.
 *
 *   node scripts/lamina/arte-t01-06-der-banda.mjs           # ESC 3, mota 4
 *   ESC=2 node scripts/lamina/arte-t01-06-der-banda.mjs     # variante liviana
 *
 * POR QUÉ TRAZADO Y NO PROCEDURAL
 * -------------------------------
 * El «07. HABITAT / GALLERY MOCKUP» es una FOTOGRAFÍA (la cámara ritual, con
 * textura fotográfica, columnas de glifos y una figura humana) y la pantalla
 * del «08. MOBILE TILE» es esa misma foto en miniatura dentro de un chasis.
 * No son instrumentos ni tienen estado: son arte fija, y el precedente es
 * `arte-t01-07-centro.mjs` (el ORBIT MAP, mismo caso, mismos parámetros:
 * escala 3, mota 4, polígono sobre ampliación por vecino más próximo).
 *
 * Lo que NO entra acá porque es información y va compuesto en Derecha.astro:
 * los títulos «07. HABITAT / GALLERY MOCKUP» y «08. MOBILE TILE», las tres
 * parejas de captions (ENVIRONMENT / LIGHT / SCALE), los tabiques x=1017 y
 * x=1479, la regla punteada y=848 y el borde inferior y=861. Todos medidos
 * con _t0106_hp_probe.mjs y perfil.mjs.
 *
 * CAJAS MEDIDAS (coordenadas del póster, umbral 26):
 *   foto     x 1018..1473 · y 603..809  — borde superior y=604 (339 px de
 *            tinta en la fila), borde inferior y=808, filo derecho x=1471/72
 *   telefono x 1484..1656 · y 597..849  — bbox de tinta 1485..1655 y 598..848,
 *            incluye el borde derecho del panel (x=1655)
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import pixelmatch from "pixelmatch";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-06-ritual-device";
const REF = `reference/canon/${SLUG}.png`;
const DESTINO = "src/components/kodex/lamina/t01-06/trazos-banda";
const TMP = "scripts/lamina/out/_t0106_banda";

/* Origen de la caja del bloque Derecha: left:1013px top:88px (la página). */
const DX = 1013, DY = 88;

/* Parámetros del precedente t01-07 (escala 3, mota 4, polígono). */
const ESC = Number(process.env.ESC ?? 3), MOTA = Number(process.env.MOTA ?? 4);
const CP = 8, LD = 4, PP = 0;

const REGIONES = [
  ["foto", 1018, 603, 456, 207],     // 07 · la fotografía de la cámara ritual
  ["telefono", 1484, 597, 173, 253], // 08 · el teléfono con su pantalla
];

mkdirSync(DESTINO, { recursive: true });
mkdirSync(TMP, { recursive: true });

/** Reescribe el `d` de vtracer a comandos relativos, fundiendo el translate. */
function comprimir(d, tx, ty) {
  let out = "", cx = 0, cy = 0, sx = 0, sy = 0;
  for (const t of d.match(/[MLZz][^MLZz]*/g) || []) {
    if (t[0] === "Z" || t[0] === "z") { out += "z"; cx = sx; cy = sy; continue; }
    const [a, b] = t.slice(1).trim().split(/[,\s]+/);
    const x = Math.round(+a + tx), y = Math.round(+b + ty);
    if (t[0] === "M") { out += `M${x},${y}`; cx = sx = x; cy = sy = y; continue; }
    const dx = x - cx, dy = y - cy;
    if (dx === 0 && dy === 0) continue;
    out += dy === 0 ? `h${dx}` : dx === 0 ? `v${dy}` : `l${dx},${dy}`;
    cx = x; cy = y;
  }
  return out;
}

/** Traza una región y devuelve el SVG listo para incrustar. */
async function trazar([nombre, x, y, w, h]) {
  const raster = await sharp(REF)
    .extract({ left: x, top: y, width: w, height: h })
    .resize({ width: w * ESC, height: h * ESC, kernel: "nearest" })
    .png()
    .toBuffer();

  const bruto = await vectorize(raster, {
    colorMode: ColorMode.Color,
    hierarchical: Hierarchical.Stacked,
    filterSpeckle: MOTA,
    colorPrecision: CP,
    layerDifference: LD,
    mode: PathSimplifyMode.Polygon,
    cornerThreshold: 60,
    lengthThreshold: 4,
    maxIterations: 10,
    spliceThreshold: 45,
    pathPrecision: PP,
  });

  const cuerpo = [...bruto.matchAll(/<path d="([^"]+)"\s+fill="([^"]+)"(?:\s+transform="translate\(([-\d.]+),([-\d.]+)\)")?/g)]
    .map(([, d, fill, tx, ty]) => `<path d="${comprimir(d, +(tx ?? 0), +(ty ?? 0))}" fill="${fill}"/>`)
    .join("");

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w * ESC} ${h * ESC}"` +
    ` preserveAspectRatio="none" shape-rendering="crispEdges" style="position:absolute;left:${x - DX}px;top:${y - DY}px;display:block">` +
    `${cuerpo}</svg>`;

  return { nombre, x, y, w, h, svg, bruto, paths: (cuerpo.match(/<path/g) || []).length };
}

/** Diff del banco (píxel 0,12 + estructural 8×8) de un PNG contra otro. */
function medir(actBuf, refBuf, w, h) {
  const a = PNG.sync.read(refBuf), b = PNG.sync.read(actBuf);
  const lum = (im, px, py) => { const i = (py * w + px) * 4; return (im.data[i] * 77 + im.data[i + 1] * 150 + im.data[i + 2] * 29) >> 8; };
  let acum = 0, bl = 0;
  for (let by = 0; by < h; by += 8) for (let bx = 0; bx < w; bx += 8) {
    let sa = 0, sb = 0, c = 0;
    for (let yy = by; yy < Math.min(by + 8, h); yy++) for (let xx = bx; xx < Math.min(bx + 8, w); xx++) { sa += lum(a, xx, yy); sb += lum(b, xx, yy); c++; }
    acum += Math.abs(sa / c - sb / c) / 255; bl++;
  }
  const estructural = (acum / bl) * 100;
  const pixel = (pixelmatch(a.data, b.data, null, w, h, { threshold: 0.12, includeAA: false }) / (w * h)) * 100;
  return { pixel, estructural, pct: (pixel + estructural) / 2 };
}

// ── corrida ────────────────────────────────────────────────────────────────

let total = 0;
for (const r of REGIONES) {
  const p = await trazar(r);

  /* Verificación pieza por pieza: se rasteriza el trazo solo, sobre negro, y
     se mide contra el recorte real de la referencia. */
  const solo =
    `<svg xmlns="http://www.w3.org/2000/svg" width="${p.w}" height="${p.h}">` +
    `<rect width="${p.w}" height="${p.h}" fill="#000"/>` +
    p.svg.replace(/ style="[^"]*"/, "") +
    `</svg>`;
  const rast = await sharp(Buffer.from(solo)).flatten({ background: "#000" }).png().toBuffer();
  const refBox = await sharp(REF).extract({ left: p.x, top: p.y, width: p.w, height: p.h }).png().toBuffer();
  const m = medir(rast, refBox, p.w, p.h);
  writeFileSync(`${TMP}/${p.nombre}.png`, rast);

  writeFileSync(`${DESTINO}/${p.nombre}.svg`, p.svg);
  total += p.svg.length;
  console.log(`  ${p.nombre.padEnd(10)} ${String(p.w).padStart(4)}×${String(p.h).padStart(3)}  ${String(p.paths).padStart(6)} paths  ${(p.svg.length / 1024 / 1024).toFixed(2)} MB  →  ${m.pct.toFixed(3)} %  (píxel ${m.pixel.toFixed(3)} · estructural ${m.estructural.toFixed(3)})`);
}
console.log(`  ————— ${(total / 1024 / 1024).toFixed(2)} MB en total  →  ${TMP}/`);
