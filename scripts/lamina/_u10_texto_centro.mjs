#!/usr/bin/env node
/**
 * KODEX-∞ · u10-commons · LÍNEAS DE TEXTO DE LA COLUMNA CENTRAL
 *
 * La franja `hero-center` no falla por el campo: falla porque su texto está en
 * otro lado. El tríptico lo muestra y esto lo mide.
 *
 * El campo estelar contamina cualquier barrido de filas, así que se sube el
 * umbral: el texto de los paneles es `#d8d4d0` a `fill-opacity .45` (luminancia
 * ~96) y `#b18ae0` a `.62` (~90), mientras el campo se dibuja con alfas de 0,04
 * a 0,5 sobre tinta ya oscura. Con umbral 70 y exigiendo varios píxeles brillantes
 * por fila, quedan las líneas de base y no la trama.
 *
 * Uso: node scripts/lamina/_u10_texto_centro.mjs [--umbral 70] [--min 6] [--render]
 */
import { PNG } from "pngjs";
import { readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
const UMBRAL = Number(arg("--umbral", 70));
const MIN = Number(arg("--min", 6));
const slug = "u10-commons";

const X0 = 433, X1 = 689, Y0 = 224, Y1 = 1402;

function cargar(ruta) {
  const png = PNG.sync.read(readFileSync(ruta));
  const { width: W, data } = png;
  return (x, y) => {
    const i = (y * W + x) * 4;
    return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
  };
}

/** Bandas de filas con texto: [yTop, yBot, xIzq, xDer, píxeles]. */
function lineas(lum) {
  const cuenta = [], izq = [], der = [];
  for (let y = Y0; y < Y1; y++) {
    let n = 0, a = 1e9, b = -1;
    for (let x = X0; x < X1; x++) if (lum(x, y) > UMBRAL) { n++; if (x < a) a = x; if (x > b) b = x; }
    cuenta.push(n); izq.push(a); der.push(b);
  }
  const out = [];
  let s = -1;
  for (let i = 0; i <= cuenta.length; i++) {
    const hay = i < cuenta.length && cuenta[i] >= MIN;
    if (hay && s < 0) s = i;
    if (!hay && s >= 0) {
      let px = 0, a = 1e9, b = -1;
      for (let k = s; k < i; k++) { px += cuenta[k]; if (izq[k] < a) a = izq[k]; if (der[k] > b) b = der[k]; }
      out.push({ y0: s + Y0, y1: i - 1 + Y0, alto: i - s, x0: a, x1: b, px });
      s = -1;
    }
  }
  return out;
}

const ref = cargar(join(ROOT, "reference", "canon", `${slug}.png`));
const actPath = join(ROOT, "scripts/lamina/out", slug, "actual.png");

console.log(`\n  ${slug} · columna central x ${X0}..${X1} · umbral ${UMBRAL} · min ${MIN} px por fila\n`);
const tabla = (t, ls) => {
  console.log(`  ${t}  (${ls.length} líneas)`);
  for (const l of ls) {
    console.log(
      `    y ${String(l.y0).padStart(4)}..${String(l.y1).padStart(4)} (alto ${String(l.alto).padStart(2)}, base ${String(l.y1).padStart(4)})  ` +
      `x ${String(l.x0).padStart(4)}..${String(l.x1).padStart(4)} (ancho ${String(l.x1 - l.x0 + 1).padStart(3)}, centro ${String(Math.round((l.x0 + l.x1) / 2)).padStart(4)})  ${String(l.px).padStart(5)} px`
    );
  }
  console.log("");
};
tabla("REFERENCIA", lineas(ref));
if (process.argv.includes("--render") && existsSync(actPath)) tabla("RENDER", lineas(cargar(actPath)));
