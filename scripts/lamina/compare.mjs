#!/usr/bin/env node
/**
 * KODEX-∞ · BANCO DE FOTOCOPIA
 *
 * Captura una lámina construida en código y la mide contra su referencia.
 *
 * Por qué existe: sin un número, "se parece" es una opinión y un equipo de
 * agentes no converge — cada uno cree que ya está. Con un número por región,
 * cada quien sabe si su panel mejoró o empeoró, y el trabajo se puede repartir
 * sin que nadie pise a nadie.
 *
 * El puntaje es POR REGIÓN, no global. Un diff global de una lámina de 1672×941
 * está dominado por el héroe (que es procedural y nunca va a dar 0) y esconde
 * que un panel de texto está entero mal. Por región se ve dónde duele.
 *
 * Uso:
 *   node scripts/lamina/compare.mjs <slug> [--url http://localhost:4321/...] [--open]
 *
 * Salidas en scripts/lamina/out/<slug>/:
 *   actual.png        captura al tamaño exacto de la referencia
 *   diff.png          mapa de diferencias completo
 *   score.json        puntaje global y por región
 *   regions/<id>.png  recorte de cada región (actual | referencia | diff)
 */

import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const slug = process.argv[2];
if (!slug) {
  console.error("uso: node scripts/lamina/compare.mjs <slug> [--url ...]");
  process.exit(2);
}
const urlArg = process.argv.indexOf("--url");
const url = urlArg > -1 ? process.argv[urlArg + 1] : `http://localhost:4321/kodex/lamina/${slug}/`;

/* Mismo KDX_REFDIR que extraer-campo.mjs: las referencias de Drive pendientes
   de revisión se miden desde reference/pendientes/ sin ascenderlas a canon. */
const refPath = join(ROOT, process.env.KDX_REFDIR || join("reference", "canon"), `${slug}.png`);
if (!existsSync(refPath)) {
  console.error(`no existe la referencia: ${refPath}`);
  process.exit(2);
}

const regionsPath = join(HERE, "regions", `${slug}.json`);
const regions = existsSync(regionsPath)
  ? JSON.parse(readFileSync(regionsPath, "utf8")).regions
  : [];

const outDir = join(HERE, "out", slug);
mkdirSync(join(outDir, "regions"), { recursive: true });

const ref = PNG.sync.read(readFileSync(refPath));
const { width, height } = ref;

/**
 * Captura. Dos decisiones que importan:
 *
 * - deviceScaleFactor 1 y viewport exacto: si se captura a 2x y se reescala,
 *   el reescalado introduce diferencia propia y el puntaje deja de medir el
 *   diseño para medir el resampleo.
 * - animations "disabled" congela CSS/Web Animations, pero NO congela un
 *   canvas WebGL con su propio rAF. Para eso la página expone
 *   window.__kdxFreeze(t) y acá se llama antes de capturar: si no, dos
 *   corridas de la misma página dan puntajes distintos y el loop persigue
 *   ruido. Es el mismo error que ya costó caro en AUDIT-VISUAL, donde siete
 *   capturas eran la misma imagen.
 */
const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width, height },
  deviceScaleFactor: 1,
});
await page.goto(url, { waitUntil: "networkidle" });
await page
  .evaluate(() => {
    if (typeof window.__kdxFreeze === "function") window.__kdxFreeze(0);
  })
  .catch(() => {});
await page.waitForTimeout(400);
const shot = await page.screenshot({ animations: "disabled" });

/**
 * COMPLEJIDAD, junto al puntaje y no dentro de él.
 *
 * El banco no distingue «reproducido en código» de «vectorizado desde el PNG»,
 * y esa distinción es todo el proyecto. Medido: COSMOLOGY CORE trazada da
 * 0,19 % con 67.483 paths, 9,3 MB y CERO canvas; DESCENT TUNNEL, procedural,
 * da 5,61 % con 303 paths y 308 KB. El banco premia con 30× menos error a la
 * versión 30× más pesada — y que no puede estar viva, porque sin canvas no hay
 * organismo ni máquina de estados.
 *
 * No lo meto DENTRO del puntaje a propósito. Ponderar fidelidad contra peso es
 * elegir qué clase de obra es KODEX, y eso lo decide el creador, no una
 * constante que yo inventé. Se mide, se muestra al lado, y quien lea el número
 * no puede leerlo sin esto.
 */
const forma = await page.evaluate(() => ({
  paths: document.querySelectorAll("path, polygon, polyline").length,
  canvas: document.querySelectorAll("canvas").length,
  nodos: document.querySelectorAll("*").length,
  bytes: document.documentElement.outerHTML.length,
}));
await browser.close();

writeFileSync(join(outDir, "actual.png"), shot);
const actual = PNG.sync.read(shot);

if (actual.width !== width || actual.height !== height) {
  console.error(
    `tamaño distinto: referencia ${width}x${height}, captura ${actual.width}x${actual.height}`
  );
  process.exit(1);
}

/**
 * Diferencia estructural por bloques.
 *
 * ESTO EXISTE PORQUE EL DIFF PÍXEL A PÍXEL PREMIA DEJAR EL PANEL VACÍO.
 *
 * Lo demostró un agente midiendo, no discutiendo: en una zona con textura
 * estocástica —polvo, ruido, ramificaciones, glitch— la referencia y una
 * reproducción CORRECTA no coinciden píxel a píxel, porque el grano no está en
 * los mismos sitios. Con densidad p en la referencia y q en la copia, la
 * fracción que difiere es p + q − 2pq, que para p < 0,5 se MINIMIZA en q = 0.
 * O sea: negro puntúa mejor que la textura correcta. Medido en la lámina 2 —
 * MotionNotes vacío daba 10,04 % y con contenido correcto 11,98 %.
 *
 * Optimizar contra eso apaga los organismos. Otro agente lo dijo desde el otro
 * lado: «el óptimo del banco cae siempre más oscuro que la referencia».
 *
 * El arreglo es comparar en baja frecuencia: se promedia la luminancia en
 * bloques de 8×8 y se mide cuánto se aparta cada bloque. Un panel vacío tiene
 * todos los bloques en cero y se aparta muchísimo; una textura correcta tiene
 * la misma densidad y el mismo brillo aunque el grano caiga en otro lado, y
 * casi no se aparta. Premia reproducir, no apagar.
 */
const BLOQUE = 8;
function diffEstructural(a, b, w, h) {
  const lum = (img, px, py) => {
    const i = (py * w + px) * 4;
    return (img.data[i] * 77 + img.data[i + 1] * 150 + img.data[i + 2] * 29) >> 8;
  };
  let suma = 0;
  let n = 0;
  for (let by = 0; by < h; by += BLOQUE) {
    for (let bx = 0; bx < w; bx += BLOQUE) {
      let sa = 0, sb = 0, c = 0;
      for (let y = by; y < Math.min(by + BLOQUE, h); y++) {
        for (let x = bx; x < Math.min(bx + BLOQUE, w); x++) {
          sa += lum(a, x, y); sb += lum(b, x, y); c++;
        }
      }
      if (!c) continue;
      // Normalizado a 255: el resultado es comparable con el % de píxeles.
      suma += Math.abs(sa / c - sb / c) / 255;
      n++;
    }
  }
  return n ? (suma / n) * 100 : 0;
}

/**
 * Diferencia una caja. Devuelve el % combinado.
 *
 * El puntaje es el promedio del diff píxel a píxel y del estructural. Ninguno
 * de los dos solo sirve: el píxel castiga la textura correcta, y el estructural
 * solo no distingue un dibujo bien puesto de uno con el mismo brillo medio en
 * otro sitio. Juntos, un panel vacío no puede ganarle a uno bien hecho.
 */
function diffBox(box, writeTo) {
  const { x, y, w, h } = box;
  const a = new PNG({ width: w, height: h });
  const b = new PNG({ width: w, height: h });
  const d = new PNG({ width: w, height: h });
  PNG.bitblt(actual, a, x, y, w, h, 0, 0);
  PNG.bitblt(ref, b, x, y, w, h, 0, 0);
  const bad = pixelmatch(a.data, b.data, d.data, w, h, {
    threshold: 0.12,
    includeAA: false,
  });
  const estructural = diffEstructural(a, b, w, h);
  if (writeTo) {
    // Tríptico: actual | referencia | diff. Un agente que solo ve el mapa de
    // diff no sabe hacia dónde corregir; viendo los tres, sí.
    const trip = new PNG({ width: w * 3 + 16, height: h });
    for (let i = 0; i < trip.data.length; i++) trip.data[i] = i % 4 === 3 ? 255 : 0;
    PNG.bitblt(a, trip, 0, 0, w, h, 0, 0);
    PNG.bitblt(b, trip, 0, 0, w, h, w + 8, 0);
    PNG.bitblt(d, trip, 0, 0, w, h, w * 2 + 16, 0);
    writeFileSync(writeTo, PNG.sync.write(trip));
  }
  const pixel = (bad / (w * h)) * 100;

  /* COBERTURA · cuanta del dibujo de la referencia esta puesto.
   *
   * `pct` mide diferencia promedio, y eso no alcanza para decidir si una lamina
   * esta hecha. La referencia de u10-commons es 93,1 % fondo negro: una lamina
   * COMPLETAMENTE VACIA puntua 6,9 % contra ella, y la construida puntuaba
   * 4,03 % con apenas el 34 % de la tinta. Todo el rango de calidad vive en
   * siete puntos y una pagina en blanco esta a tres de una terminada.
   *
   * Por eso el calco de PNG gana: es la forma mas eficiente de bajar `pct`.
   * Las dos laminas mejor puntuadas del proyecto -0,57 % y 0,78 %- son eso, y
   * pesan 9,8 y 13,3 MB de SVG. La metrica premiaba lo que el metodo prohibe.
   *
   * `cobertura` no se puede enganar dejando la lamina vacia: cuenta pixeles de
   * tinta de cada lado y los divide. 100 significa que hay tanta tinta como en
   * la referencia; 34 significa que faltan dos tercios del dibujo. Es el numero
   * que hay que mirar ANTES del puntaje. */
  let tintaRef = 0, tintaAct = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    const la = 0.299 * a.data[i] + 0.587 * a.data[i + 1] + 0.114 * a.data[i + 2];
    const lb = 0.299 * b.data[i] + 0.587 * b.data[i + 1] + 0.114 * b.data[i + 2];
    if (lb > 26) tintaRef++;
    if (la > 26) tintaAct++;
  }
  const cobertura = tintaRef ? (tintaAct / tintaRef) * 100 : 100;

  return {
    bad,
    total: w * h,
    pixel: +pixel.toFixed(3),
    estructural: +estructural.toFixed(3),
    pct: +((pixel + estructural) / 2).toFixed(3),
    cobertura: +cobertura.toFixed(1),
    tinta_ref: tintaRef,
    tinta_actual: tintaAct,
  };
}

const full = diffBox({ x: 0, y: 0, w: width, h: height }, null);
{
  const d = new PNG({ width, height });
  pixelmatch(actual.data, ref.data, d.data, width, height, { threshold: 0.12, includeAA: false });
  writeFileSync(join(outDir, "diff.png"), PNG.sync.write(d));
}

const perRegion = regions.map((r) => {
  const res = diffBox(r, join(outDir, "regions", `${r.id}.png`));
  return { id: r.id, nombre: r.nombre ?? r.id, dueno: r.dueno ?? null, ...r, ...res };
});
perRegion.sort((a, b) => b.pct - a.pct);

const score = {
  slug,
  url,
  referencia: `reference/canon/${slug}.png`,
  px: `${width}x${height}`,
  generado: new Date().toISOString(),
  _metrica: "pct = promedio de (a) diff pixel a pixel y (b) diff estructural por bloques de 8x8. El estructural existe porque el diff a secas premia dejar el panel vacio en zonas de textura: ver el comentario en compare.mjs.",
  global: { pct: full.pct, pixel: full.pixel, estructural: full.estructural, cobertura: full.cobertura, tinta_ref: full.tinta_ref, tinta_actual: full.tinta_actual, distintos: full.bad, total: full.total },
  forma: { ...forma, mb: +(forma.bytes / 1048576).toFixed(2), sospecha_trazado: forma.canvas === 0 && forma.paths > 8000 },
  regiones: perRegion.map((r) => ({
    id: r.id,
    nombre: r.nombre,
    caja: { x: r.x, y: r.y, w: r.w, h: r.h },
    pct: r.pct,
    cobertura: r.cobertura,
    pixel: r.pixel,
    estructural: r.estructural,
    distintos: r.bad,
  })),
};
writeFileSync(join(outDir, "score.json"), JSON.stringify(score, null, 2));

const bar = (p) => "█".repeat(Math.min(40, Math.round(p / 2.5))).padEnd(40, "·");
console.log(`\n  ${slug}  ${width}x${height}`);
/* La cobertura va PRIMERO y con su propio veredicto. El puntaje solo se puede
   leer de una lamina que ya tiene su dibujo puesto: con el 34 % de la tinta, un
   4 % de diferencia no significa "casi lista", significa "casi vacia". */
{
  const c = full.cobertura;
  const bloques = Math.max(0, Math.min(40, Math.round(c / 2.5)));
  const veredicto = c < 60 ? "FALTA DIBUJO — no mires el puntaje todavia"
                  : c < 85 ? "incompleta"
                  : c > 140 ? "sobra tinta: se esta dibujando de mas"
                  : "completa";
  console.log(`  COBERTURA ${c.toFixed(0).padStart(4)}%  ${"█".repeat(bloques)}${"·".repeat(40 - bloques)}`);
  console.log(`          tinta ${full.tinta_actual.toLocaleString()} de ${full.tinta_ref.toLocaleString()} px de la referencia  ·  ${veredicto}`);
  console.log("");
}
console.log(`  GLOBAL  ${full.pct.toFixed(2).padStart(6)}%  ${bar(full.pct)}`);
console.log(`          pixel ${full.pixel.toFixed(2)}%  ·  estructural ${full.estructural.toFixed(2)}%`);
const mb = (forma.bytes / 1048576).toFixed(2);
const trazada = forma.canvas === 0 && forma.paths > 8000;
console.log(
  `          forma: ${forma.paths.toLocaleString("es")} paths · ${forma.canvas} canvas · ${mb} MB` +
  (trazada ? "   ⚠ SIN CANVAS Y MUY DENSA: probablemente el PNG vectorizado, no código" : "")
);
if (trazada) {
  console.log("          el puntaje NO es comparable con el de una lámina procedural.");
}
console.log();
for (const r of perRegion) {
  console.log(`  ${r.id.padEnd(22)} ${r.pct.toFixed(2).padStart(6)}%  ${bar(r.pct)}`);
}
console.log(`\n  → ${join("scripts/lamina/out", slug)}/\n`);
