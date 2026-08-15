#!/usr/bin/env node
/**
 * KODEX-∞ · MIRAR UN GLIFO TRAZADO ANTES DE PEGARLO
 *
 * `glyphs.mjs` devuelve nodos y KB, y ninguno de los dos dice si el trazo es el
 * dibujo o es la trama del campo que se coló por el umbral. Esto lo rasteriza
 * al lado del recorte de la referencia, ampliado, para poder verlo.
 *
 * Uso: node scripts/lamina/_u10_ver_glifo.mjs <ruta.svg> <x>,<y>,<w>,<h> [--escala 5]
 */
import sharp from "sharp";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const svg = process.argv[2];
const [x, y, w, h] = (process.argv[3] ?? "").split(",").map(Number);
const E = Number(arg("--escala", 5));
if (!svg || [x, y, w, h].some((v) => !Number.isFinite(v))) {
  console.error("uso: node scripts/lamina/_u10_ver_glifo.mjs <ruta.svg> <x>,<y>,<w>,<h> [--escala 5]");
  process.exit(2);
}

/* El trazo viene en negro sobre transparente: se pinta blanco sobre negro para
   compararlo con la referencia, que es tinta clara sobre negro. */
const fuente = readFileSync(svg, "utf8").replace(/fill="[^"]*"/g, 'fill="#ffffff"');
const trazo = await sharp(Buffer.from(fuente))
  .resize({ width: w * E, height: h * E, kernel: "nearest" })
  .flatten({ background: "#000" })
  .raw().toBuffer({ resolveWithObject: true });

const ref = PNG.sync.read(readFileSync(join(ROOT, "reference/canon/u10-commons.png")));
const out = new PNG({ width: w * E, height: h * E * 2 + 8 });
for (let j = 0; j < h * E; j++) {
  for (let i = 0; i < w * E; i++) {
    const s = ((y + Math.floor(j / E)) * ref.width + x + Math.floor(i / E)) * 4;
    const o = (j * w * E + i) * 4;
    for (let c = 0; c < 3; c++) out.data[o + c] = Math.min(255, ref.data[s + c] * 2);
    out.data[o + 3] = 255;
  }
}
const ch = trozo => trozo;
for (let j = 0; j < h * E; j++) {
  for (let i = 0; i < w * E; i++) {
    const s = (j * w * E + i) * trazo.info.channels;
    const o = ((j + h * E + 8) * w * E + i) * 4;
    for (let c = 0; c < 3; c++) out.data[o + c] = trazo.data[s + (trazo.info.channels > 2 ? c : 0)];
    out.data[o + 3] = 255;
  }
}
const dst = join(ROOT, "scripts/lamina/out/u10-commons/glifo.png");
writeFileSync(dst, PNG.sync.write(out));
console.log(`  ${dst}   arriba la referencia, abajo el trazo  (x${E})`);
