#!/usr/bin/env node
/**
 * KODEX-∞ · t01-06 RITUAL DEVICE · BARRIDO DE UMBRAL DE LAS PIEZAS TRAZADAS
 * DE LA CABECERA Y DEL PIE.
 *
 * Mismo método que en t01-05: para cada pieza se traza el original con varios
 * umbrales, se rasteriza el trazo a escala 1 y se busca —por mínimos cuadrados
 * sobre la cobertura, no a ojo— el relleno que minimiza el error absoluto medio
 * contra la referencia. Gana el umbral de menor error.
 *
 *   node scripts/lamina/_t0106_barrido.mjs [pieza...]
 */
import sharp from "sharp";
import { PNG } from "pngjs";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SLUG = "t01-06-ritual-device";
const REF = `reference/canon/${SLUG}.png`;
const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;

/* [y0, y1, x0, x1, umbrales…] — todo en coordenadas del póster. */
const PIEZAS = {
  hdrTitulo:   [17, 64, 20, 955, [50, 65, 80, 95, 110, 125, 140]],
  hdrBajada:   [73, 90, 22, 392, [26, 32, 38, 45, 52, 60, 70]],
  hdrCoreSeed: [46, 58, 812, 878, [20, 26, 32, 38, 45, 52]],
  hdrClaves:   [30, 41, 938, 1295, [22, 28, 34, 40, 48, 56, 66]],
  hdrVals:     [45, 71, 938, 1215, [30, 38, 46, 56, 66, 78, 92]],
  hdrActive:   [45, 58, 1248, 1296, [24, 30, 38, 46, 56, 68]],
  hdrAla:      [22, 62, 1468, 1648, [24, 30, 38, 46, 56, 68, 80]],
  hdrBuilt:    [68, 83, 1452, 1660, [24, 30, 38, 46, 56, 68, 80]],
  ftrMarca:    [880, 905, 18, 150, [24, 30, 38, 46, 56, 68, 80]],
  ftrLema:     [884, 899, 626, 994, [24, 30, 38, 46, 56, 68, 80]],
  ftrPpp:      [885, 899, 1130, 1362, [24, 30, 38, 46, 56, 68, 80]],
  ftrAla:      [869, 916, 1398, 1620, [20, 26, 32, 40, 48, 58, 70]],
};

const pedidas = process.argv.slice(2).filter((a) => PIEZAS[a]);
const lista = pedidas.length ? pedidas : Object.keys(PIEZAS);

for (const nombre of lista) {
  const [y0, y1, x0, x1, umbrales] = PIEZAS[nombre];
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;

  const ref = new Float64Array(w * h * 3);
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++) {
      const i = ((y + y0) * W + (x + x0)) * 4;
      ref[(y * w + x) * 3] = data[i];
      ref[(y * w + x) * 3 + 1] = data[i + 1];
      ref[(y * w + x) * 3 + 2] = data[i + 2];
    }

  let mejor = null;
  for (const u of umbrales) {
    const out = `barrido-${nombre}-${u}`;
    execFileSync("node", [
      "scripts/lamina/glyphs.mjs", SLUG,
      "--band", `${y0},${y1}`, "--x", `${x0},${x1}`,
      "--umbral", String(u), "--out", out,
    ], { stdio: "ignore" });
    const manPath = `scripts/lamina/glyphs/${SLUG}/${out}/manifiesto.json`;
    if (!existsSync(manPath)) continue;
    const man = JSON.parse(readFileSync(manPath, "utf8"));
    if (!man.glifos.length) continue;

    const piezas = man.glifos.map((g) => {
      const svg = readFileSync(`scripts/lamina/glyphs/${SLUG}/${out}/${g.id}.svg`, "utf8");
      const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
      const ds = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)];
      const cuerpo = ds.map((m) => `<path d="${m[1]}"${m[2] ? ` transform="${m[2]}"` : ""} fill="#fff"/>`).join("");
      return `<svg x="${g.caja.x - x0}" y="${g.caja.y - y0}" width="${g.caja.w}" height="${g.caja.h}" viewBox="0 0 ${vb[1]} ${vb[2]}" preserveAspectRatio="none">${cuerpo}</svg>`;
    }).join("");
    const doc = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${piezas}</svg>`;

    const raw = await sharp(Buffer.from(doc)).ensureAlpha().raw().toBuffer();
    const m = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) m[i] = raw[i * 4 + 3] / 255;

    let mm = 0;
    const rm = [0, 0, 0];
    for (let i = 0; i < w * h; i++) {
      mm += m[i] * m[i];
      rm[0] += ref[i * 3] * m[i];
      rm[1] += ref[i * 3 + 1] * m[i];
      rm[2] += ref[i * 3 + 2] * m[i];
    }
    if (mm === 0) continue;
    const c = rm.map((v) => Math.max(0, Math.min(255, Math.round(v / mm))));

    let err = 0;
    for (let i = 0; i < w * h; i++)
      for (let k = 0; k < 3; k++) err += Math.abs(ref[i * 3 + k] - c[k] * m[i]);
    err /= w * h * 3;

    const hex = "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
    console.log(`  ${nombre}  u=${String(u).padStart(3)}  ${String(man.glifos.length).padStart(2)} glifos  err=${err.toFixed(3)}  fill=${hex}`);
    if (!mejor || err < mejor.err) mejor = { u, err, hex, n: man.glifos.length };
  }
  if (mejor) console.log(`  >>> ${nombre}: umbral ${mejor.u}, fill ${mejor.hex}, err ${mejor.err.toFixed(3)}\n`);
}
