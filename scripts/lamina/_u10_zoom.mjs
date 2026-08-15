#!/usr/bin/env node
/**
 * KODEX-∞ · u10-commons · LUPA SOBRE LA REFERENCIA
 *
 * Recorta una caja de la referencia, la amplía por vecino más cercano y le sube
 * el contraste, para poder LEER lo que la lámina dice en una zona antes de
 * transcribirlo. Sin esto, el texto de 7 px de versal se transcribe a ojo y se
 * inventa contenido, que es lo único que el canon prohíbe de plano.
 *
 * Uso: node scripts/lamina/_u10_zoom.mjs x0,y0,x1,y1 [--escala 4] [--ganancia 3]
 *      [--render] [--salida out.png]
 */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const [x0, y0, x1, y1] = (process.argv[2] ?? "").split(",").map(Number);
if ([x0, y0, x1, y1].some((v) => !Number.isFinite(v))) {
  console.error("uso: node scripts/lamina/_u10_zoom.mjs x0,y0,x1,y1 [--escala 4] [--ganancia 3] [--render]");
  process.exit(2);
}
const E = Number(arg("--escala", 4));
const G = Number(arg("--ganancia", 3));
const slug = "u10-commons";
const src = process.argv.includes("--render")
  ? join(ROOT, "scripts/lamina/out", slug, "actual.png")
  : join(ROOT, "reference", "canon", `${slug}.png`);
const dst = arg("--salida", join(ROOT, "scripts/lamina/out", slug, "zoom.png"));

const png = PNG.sync.read(readFileSync(src));
const w = x1 - x0, h = y1 - y0;
const out = new PNG({ width: w * E, height: h * E });
for (let y = 0; y < h * E; y++) {
  for (let x = 0; x < w * E; x++) {
    const i = (((y0 + Math.floor(y / E)) * png.width) + x0 + Math.floor(x / E)) * 4;
    const o = (y * w * E + x) * 4;
    for (let c = 0; c < 3; c++) out.data[o + c] = Math.min(255, png.data[i + c] * G);
    out.data[o + 3] = 255;
  }
}
writeFileSync(dst, PNG.sync.write(out));
console.log(`  ${dst}  ${w}x${h} → ${w * E}x${h * E}  (x${E}, ganancia ${G})`);
