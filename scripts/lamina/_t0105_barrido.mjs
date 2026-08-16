#!/usr/bin/env node
/**
 * KODEX-∞ · t01-05 · BARRIDO DE UMBRAL PARA LAS PIEZAS TRAZADAS DE CABECERA/PIE
 *
 * Para cada pieza traza el original con varios umbrales, rasteriza el trazo a
 * escala 1 y busca —analíticamente, no a ojo— el color de relleno que minimiza
 * el error absoluto contra la referencia. Gana el umbral de menor error.
 *
 * El color óptimo sale de mínimos cuadrados por canal sobre la cobertura del
 * trazo (c = Σ R·m / Σ m²): el trazo binarizado se queda el halo del antialias
 * adentro, así que cubre más que el original y quiere MENOS luz. Elegir el
 * color a ojo es justamente lo que hace que una pieza trazada se vea "quemada".
 *
 *   node scripts/lamina/_t0105_barrido.mjs [pieza...]
 */
import sharp from "sharp";
import { PNG } from "pngjs";
import { readFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const SLUG = "t01-05-specimen-skull";
const REF = `reference/canon/${SLUG}.png`;
const img = PNG.sync.read(readFileSync(REF));
const { width: W, data } = img;

/* [nombre, y0, y1, x0, x1, umbrales…] */
const PIEZAS = {
  hdrMarca:  [20, 59, 20, 715, [50, 60, 70, 85, 100, 120, 140]],
  hdrMarcaA: [20, 59, 20, 351, [85, 95, 100, 105, 110, 115]],
  hdrMarcaB: [20, 59, 352, 715, [85, 95, 100, 105, 110, 115]],
  hdrBajada: [66, 84, 20, 305, [26, 32, 38, 45, 52, 60, 70]],
  hdrClaves: [27, 41, 905, 1370, [30, 38, 45, 52, 60, 70, 80]],
  hdrBuilt:  [27, 58, 1398, 1522, [30, 38, 45, 55, 65, 80, 95]],
  hdrAla:    [26, 63, 1528, 1652, [22, 28, 34, 42, 50, 60, 72]],
  ftrMarca:  [885, 912, 22, 162, [20, 26, 32, 38, 45, 52, 60]],
  ftrVdb:    [884, 900, 285, 472, [30, 38, 45, 55, 65, 78, 90]],
  ftrLema:   [891, 907, 685, 950, [22, 28, 34, 42, 50, 60, 72]],
  ftrPpp:    [891, 907, 1138, 1368, [22, 28, 34, 42, 50, 60, 72]],
  ftrAla:    [877, 924, 1436, 1630, [20, 26, 32, 40, 48, 58, 70]],
};

const pedidas = process.argv.slice(2).filter((a) => PIEZAS[a]);
const lista = pedidas.length ? pedidas : Object.keys(PIEZAS);

for (const nombre of lista) {
  const [y0, y1, x0, x1, umbrales] = PIEZAS[nombre];
  const w = x1 - x0 + 1;
  const h = y1 - y0 + 1;

  /* Referencia del recorte, en RGB plano. */
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

    /* Un <svg> anidado por glifo, blanco puro sobre transparente: el canal
       alfa da la cobertura del trazo a escala 1. */
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

    /* Color óptimo por canal, por mínimos cuadrados sobre la cobertura. */
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
    const linea = `  ${nombre}  u=${String(u).padStart(3)}  ${String(man.glifos.length).padStart(2)} glifos  err=${err.toFixed(3)}  fill=${hex}`;
    console.log(linea);
    if (!mejor || err < mejor.err) mejor = { u, err, hex, n: man.glifos.length };
  }
  console.log(`  >>> ${nombre}: umbral ${mejor.u}, fill ${mejor.hex}, err ${mejor.err.toFixed(3)}\n`);
}
