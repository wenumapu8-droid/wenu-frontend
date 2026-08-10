#!/usr/bin/env node
/**
 * KODEX-∞ · t01-07 COSMOLOGY CORE · ARTE FIJA DEL BLOQUE CENTRO
 *
 * Genera src/components/kodex/lamina/t01-07/trazos-centro/*.svg trazando desde
 * reference/canon/t01-07-cosmology-core.png las cinco regiones del bloque. Los
 * .svg NO se editan a mano: se corre esto.
 *
 *   node scripts/lamina/arte-t01-07-centro.mjs             # genera
 *   node scripts/lamina/arte-t01-07-centro.mjs --barrer    # barre parámetros
 *
 * Escribe SÓLO en trazos-centro/ y en scripts/lamina/out/_t0107_centro. La
 * lámina la arman cinco agentes a la vez y `scripts/lamina/glyphs/<slug>/` es
 * un cajón único que ya se pisaron entre sí una vez.
 *
 * POR QUÉ TRAZADO Y NO PROCEDURAL
 * -------------------------------
 * El «04. ORBIT MAP» no es un instrumento: es una ilustración fija —planetas
 * con textura fotográfica, nebulosa, ~700 marcas de órbita—. No hay reconstrucción
 * paramétrica que se le acerque. Medido sobre esta misma caja, con el diff del
 * banco (píxel 0,12 + estructural 8×8):
 *
 *   escala  mota  colorPrec  layerDiff  modo      combinado   SVG
 *      1      4       6          16      spline     ~9,3 %    1,3 MB
 *      1      2       8           4      spline      2,49 %   3,4 MB
 *      2      4       8           4      polígono    0,74 %   4,2 MB
 *      2      2       8           4      polígono    0,52 %   5,1 MB
 *      3      4       8           4      polígono    0,20 %   8,0 MB  ← elegida
 *      3      6       8           4      polígono    0,69 %   4,4 MB
 *      4      9       8           4      polígono    0,78 %   4,1 MB
 *
 * El parámetro que manda es `mota` (filterSpeckle) leído en el espacio ampliado:
 * a escala 3 una mota de 4 conserva manchas de media unidad de póster, que es
 * exactamente el tamaño de las marcas de órbita. Subirla a 6 las borra y el
 * puntaje se triplica. La escala 4 no mejora porque para mantener el archivo
 * acotado hay que subir la mota a 9 y se pierde lo mismo.
 *
 * DÓNDE SE PARÓ, Y POR QUÉ NO SE SIGUIÓ
 * ------------------------------------
 * Con escala 3 la mota barre así, medido en Chromium con score-panel.mjs sobre
 * la caja entera (no rasterizado, el número del banco):
 *
 *   mota    combinado   píxel   estructural   peso de trazos-centro/
 *     4       0,19 %     0,19      0,20            3,74 MB   ← puesto
 *     3       0,19 %     0,19      0,20            3,76 MB
 *     2       0,07 %     0,00      0,14            8,16 MB
 *
 * Con mota 2 el término de píxel da CERO: no queda un solo píxel fuera del
 * umbral 0,12 del banco. Está a un `MOTA=2` de distancia y NO está puesto. La
 * razón no es el puntaje sino qué es cada cosa: con mota 4 esto sigue siendo un
 * trazo —68 mil polígonos que dibujan las marcas de órbita, los planetas y la
 * tipografía—, y con mota 2 son 174 mil y lo que se agrega son manchas de medio
 * píxel, o sea el antialias del PNG. Ahí deja de trazarse el dibujo y se pasa a
 * codificar la trama, que es justo lo que prohíbe «cero imágenes».
 *
 * Por el mismo motivo se descartó una capa de corrección leída píxel a píxel
 * sobre el residuo (la doctrina del código de barras llevada al extremo): con
 * un piso de 8 por canal son 48.197 píxeles, 8,08 % de la caja, y comprimidos
 * por tramos pesan más que la mitad de lo que ahorró bajar la mota. Es la
 * referencia recodificada, no un dibujo.
 *
 * Quien quiera el 0,07 % lo tiene con MOTA=2; queda anotado, no elegido.
 *
 * En modo polígono sobre una ampliación por vecino más próximo, todos los
 * segmentos caen en la retícula de la ampliación y son ejes puros. Por eso el
 * `d` se reescribe a comandos relativos `h`/`v`: mismo dibujo exacto, 55 % menos
 * bytes. La verificación de que el reescrito rasteriza IDÉNTICO al original está
 * en la propia corrida (--verificar, activado por defecto).
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { PNG } from "pngjs";
import sharp from "sharp";
import pixelmatch from "pixelmatch";
import { vectorize, ColorMode, PathSimplifyMode, Hierarchical } from "@neplex/vectorizer";

const SLUG = "t01-07-cosmology-core";
const REF = `reference/canon/${SLUG}.png`;
const DESTINO = "src/components/kodex/lamina/t01-07/trazos-centro";
const TMP = "scripts/lamina/out/_t0107_centro";

/* Origen de la caja del bloque: left:408px top:88px. */
const DX = 408, DY = 88, BW = 767, BH = 778;

/* Parámetros elegidos por el barrido de arriba. */
const ESC = 3, MOTA = Number(process.env.MOTA ?? 4), CP = 8, LD = 4, PP = 0;

/**
 * Las cinco regiones, en coordenadas del PÓSTER. Teselan la caja entera sin
 * hueco ni solape: el trazo de cada una es opaco hasta su borde, así que dos
 * regiones vecinas no dejan costura.
 *
 * Los cortes NO son redondos, salieron de sondear la luminancia media por
 * columna y por fila dentro de la caja:
 *   · y=555  · cima del marco de PARALLAX LAYERS (18,3 contra 3,6 de la fila anterior)
 *   · y=613  · filo superior de la banda de paneles 08/09/10 (16,0 / 22,4)
 *   · x=666  · tabique entre 08 y 09 (33,0 contra 0,5 de sus vecinas)
 *   · x=1013 · tabique entre 09 y 10 (38,2)
 * El marco del panel 04 vive en x=411/1171 e y=105/605, dentro de la región 1;
 * el canto de la columna del póster (x=403 y x=1177) cae FUERA de esta caja y
 * es de los bloques vecinos.
 */
const REGIONES = [
  ["heroMapa", 408, 88, 767, 467],   // 04 · título, marco y mapa orbital
  ["heroPie", 408, 555, 767, 58],    // 04 · PARALLAX LAYERS, glifos de NADIR, DEPTH FIELD
  ["p08Logica", 408, 613, 258, 253], // 08 · ORBITAL LOGIC (PSEUDO CODE)
  ["p09Datos", 666, 613, 347, 253],  // 09 · ORBITAL SYSTEM DATA
  ["p10Telemetria", 1013, 613, 162, 253], // 10 · CORE TELEMETRY
];

const img = PNG.sync.read(readFileSync(REF));

mkdirSync(DESTINO, { recursive: true });
mkdirSync(TMP, { recursive: true });

/**
 * Reescribe el `d` de vtracer a comandos relativos y le funde el translate del
 * path. Sin esto el archivo pesa el doble: vtracer escribe cada vértice como
 * `L2112,1401 ` (11 bytes) cuando el salto real es `h-186` (5).
 */
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

/** Diff del banco (píxel 0,12 + estructural 8×8) de un PNG contra la referencia. */
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

const piezas = [];
for (const r of REGIONES) piezas.push(await trazar(r));

/* Verificación: se rasteriza el montaje entero y se mide contra la caja real.
   Es la prueba de que la compresión a h/v no movió un solo píxel y de que las
   cinco regiones teselan sin costura. */
const montaje =
  `<svg xmlns="http://www.w3.org/2000/svg" width="${BW}" height="${BH}"><rect width="${BW}" height="${BH}" fill="#000"/>` +
  piezas.map((p) => p.svg.replace(/ style="[^"]*"/, ` x="${p.x - DX}" y="${p.y - DY}"`)).join("") +
  `</svg>`;
const rast = await sharp(Buffer.from(montaje)).flatten({ background: "#000" }).png().toBuffer();
const refBox = await sharp(REF).extract({ left: DX, top: DY, width: BW, height: BH }).png().toBuffer();
const m = medir(rast, refBox, BW, BH);
writeFileSync(`${TMP}/montaje.png`, rast);

let total = 0;
for (const p of piezas) {
  writeFileSync(`${DESTINO}/${p.nombre}.svg`, p.svg);
  total += p.svg.length;
  console.log(`  ${p.nombre.padEnd(14)} ${String(p.w).padStart(4)}×${String(p.h).padStart(3)}  ${String(p.paths).padStart(6)} paths  ${(p.svg.length / 1024 / 1024).toFixed(2)} MB  (bruto ${(p.bruto.length / 1024 / 1024).toFixed(2)} MB)`);
}
console.log(`  ————— ${(total / 1024 / 1024).toFixed(2)} MB en total`);
console.log(`  montaje rasterizado: ${m.pct.toFixed(3)} %  (píxel ${m.pixel.toFixed(3)} · estructural ${m.estructural.toFixed(3)})`);
console.log(`  → ${TMP}/montaje.png`);
