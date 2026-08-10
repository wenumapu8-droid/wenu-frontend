#!/usr/bin/env node
/**
 * Barrido de encogido y ganancia para una pieza trazada de la cabecera o el pie
 * de t01-02. Parchea el .astro, espera al HMR, saca una captura y cuenta los
 * píxeles que el banco marca DENTRO de la caja de esa pieza.
 *
 * Existe porque el trazador binariza y devuelve la silueta CON el halo de
 * antialias, así que la tinta sale ~1 px más ancha que el núcleo del original;
 * cuánto hay que meterla no se puede saber sin medirlo, y cambia por pieza
 * (depende del umbral con que se binarizó).
 *
 *   node scripts/lamina/_t0102_barrido.mjs <archivo> "<etiqueta>" x0 x1 y0 y1 [--port 4328]
 */
import { chromium } from "playwright";
import pixelmatch from "pixelmatch";
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";

const [archivo, etiqueta, ...resto] = process.argv.slice(2);
const [x0, x1, y0, y1] = resto.slice(0, 4).map(Number);
const i = process.argv.indexOf("--port");
const PORT = i > -1 ? Number(process.argv[i + 1]) : 4321;
const SLUG = "t01-02-observation-eye";
const CAJA = JSON.parse(readFileSync("scripts/lamina/paneles/t01-02-observation-eye.json", "utf8"))
  .paneles.filter((p) => p.id === (archivo === "Cabecera" ? "Cabecera" : "Pie"))
  .map((p) => [p.caja.x, p.caja.y, p.caja.w, p.caja.h])[0];
const ruta = `src/components/kodex/lamina/t01-02/${archivo}.astro`;

const ref = PNG.sync.read(readFileSync(`reference/canon/${SLUG}.png`));
const original = readFileSync(ruta, "utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: ref.width, height: ref.height }, deviceScaleFactor: 1 });

/** Reemplaza encoge/gain de la pieza cuya etiqueta coincide. */
function parchear(sigma, encoge, gain) {
  const re = new RegExp(`sigma: [\\d.]+, encoge: [-\\d.]+, gain: [\\d.]+, et: "${etiqueta.replace(/[.*+?^$()|[\]\\]/g, "\\$&")}"`);
  if (!re.test(original)) { console.error(`no encuentro la pieza "${etiqueta}"`); process.exit(2); }
  writeFileSync(ruta, original.replace(re, `sigma: ${sigma}, encoge: ${encoge}, gain: ${gain}, et: "${etiqueta}"`));
}

async function medir() {
  await new Promise((r) => setTimeout(r, 900));
  await page.goto(`http://localhost:${PORT}/kodex/lamina/${SLUG}/`, { waitUntil: "networkidle", timeout: 25000 });
  const act = PNG.sync.read(await page.screenshot({ animations: "disabled" }));
  const d = new PNG({ width: ref.width, height: ref.height });
  pixelmatch(ref.data, act.data, d.data, ref.width, ref.height, { threshold: 0.12, includeAA: false });
  let malos = 0, sa = 0, sb = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const i = (y * ref.width + x) * 4;
    if (d.data[i] > 200 && d.data[i + 1] < 100) malos++;
    sa += ref.data[i] + ref.data[i + 1] + ref.data[i + 2];
    sb += act.data[i] + act.data[i + 1] + act.data[i + 2];
  }
  /* La misma métrica combinada del banco, pero sobre la caja del BLOQUE: mitad
     diff de píxel y mitad diff estructural por bloques de 8×8. Optimizar sólo
     el recuento de píxeles marcados lleva a subir la tinta hasta donde el
     estructural empieza a pagarlo, y al revés. */
  const [px, py, pw, ph] = CAJA;
  const lum = (img, x, y) => { const i = (y * ref.width + x) * 4; return (img.data[i] * 77 + img.data[i + 1] * 150 + img.data[i + 2] * 29) >> 8; };
  let malosCaja = 0, acum = 0, bloques = 0;
  for (let by = py; by < py + ph; by += 8) for (let bx = px; bx < px + pw; bx += 8) {
    let ma = 0, mb = 0, c = 0;
    for (let y = by; y < Math.min(by + 8, py + ph); y++) for (let x = bx; x < Math.min(bx + 8, px + pw); x++) {
      ma += lum(ref, x, y); mb += lum(act, x, y); c++;
      const i = (y * ref.width + x) * 4;
      if (d.data[i] > 200 && d.data[i + 1] < 100) malosCaja++;
    }
    if (c) { acum += Math.abs(ma / c - mb / c) / 255; bloques++; }
  }
  const pct = ((malosCaja / (pw * ph)) * 100 + (acum / bloques) * 100) / 2;
  return { malos, pct, ratio: sb > 0 ? sa / sb : 1 };
}

const sigmas = (process.env.SIGMAS || "0.9,1.1").split(",").map(Number);
const encoges = (process.env.ENCOGES || "0,0.15,0.3").split(",").map(Number);
let mejor = null;
for (const sg of sigmas) for (const e of encoges) {
  /* Dos pasadas: la primera fija el encogido, la segunda corrige la ganancia
     para que la media de tinta de la celda vuelva a la de la referencia. Sin
     esa corrección el barrido mide dos cosas a la vez y siempre gana el
     encogido que menos tinta quita. */
  parchear(sg, e, 1);
  const a = await medir();
  let gain = +Math.min(2.2, Math.max(0.6, a.ratio)).toFixed(3);
  parchear(sg, e, gain);
  const b = await medir();
  console.log(`  sigma ${String(sg).padEnd(4)} encoge ${String(e).padEnd(5)} gain ${String(gain).padEnd(6)} bloque ${b.pct.toFixed(3)}%  (gain 1 → ${a.pct.toFixed(3)}%)`);
  if (a.pct < b.pct) { gain = 1; b.pct = a.pct; b.malos = a.malos; }
  if (!mejor || b.pct < mejor.pct) mejor = { sg, e, gain, pct: b.pct };
}
parchear(mejor.sg, mejor.e, mejor.gain);
console.log(`  → mejor: sigma ${mejor.sg} · encoge ${mejor.e} · gain ${mejor.gain} · bloque ${mejor.pct.toFixed(3)}%  (dejado aplicado)`);
await browser.close();
