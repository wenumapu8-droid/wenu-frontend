#!/usr/bin/env node
/**
 * KODEX-∞ · PERFIL DE TINTA DE UNA BANDA
 *
 * Mide, columna por columna, dónde hay tinta en una banda horizontal —de la
 * referencia, del render, o de las dos enfrentadas.
 *
 * Por qué existe: la cabecera de u10 tuvo los dos títulos a la mitad de alto
 * durante toda la construcción de la lámina. `textLength` clavaba el ancho, así
 * que el ancho salía bien y el alto no lo miraba nadie — y el puntaje global
 * decía "5,7 %" sin decir de qué. Esta medición se escribió cuatro veces a mano
 * como `node -e` antes de que alguien la guardara. Mientras la forma barata de
 * mirar una banda sea "abrir el PNG y estimar", los agentes van a estimar.
 *
 * Uso:
 *   node scripts/lamina/perfil.mjs <slug> --banda y0,y1 [opciones]
 *
 *   --banda y0,y1     franja vertical a medir (obligatorio)
 *   --x x0,x1         acotar en horizontal (por defecto, toda la lámina)
 *   --umbral N        luminancia mínima para contar como tinta (por defecto 40)
 *   --sep N           separación mínima entre tramos, en px (por defecto 1:
 *                     cada glifo por separado). Subilo para agrupar palabras.
 *   --comparar        enfrenta referencia contra el render de la última vuelta
 *   --cuerpo          resuelve el font-size a partir de la versal medida
 *   --fuente ruta     .woff para --cuerpo (por defecto Cormorant Garamond 400)
 *
 * Ejemplos:
 *   # los dos títulos de u10, glifo por glifo, ref contra render
 *   node scripts/lamina/perfil.mjs u10-commons --banda 98,172 --comparar
 *
 *   # qué cuerpo hay que pedir para esa versal
 *   node scripts/lamina/perfil.mjs u10-commons --banda 98,172 --cuerpo
 */
import { PNG } from "pngjs";
import { readFileSync, existsSync } from "node:fs";
import { inflateSync } from "node:zlib";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const argv = process.argv;
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 ? argv[i + 1] : d; };
const flag = (n) => argv.includes(n);

const slug = argv[2];
if (!slug || !arg("--banda")) {
  console.error("uso: node scripts/lamina/perfil.mjs <slug> --banda y0,y1 [--x x0,x1] [--umbral 40] [--sep 1] [--comparar] [--cuerpo] [--fuente ruta.woff]");
  process.exit(2);
}

const [Y0, Y1] = arg("--banda").split(",").map(Number);
const UMBRAL = Number(arg("--umbral", 40));
const SEP = Number(arg("--sep", 1));
const FUENTE = arg("--fuente", "node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-400-normal.woff");

/* ── medición ─────────────────────────────────────────────────────────────── */

/** Tramos de tinta de una banda: [x0, x1, yTop, yBot] por tramo. */
function perfil(file, x0, x1) {
  const png = PNG.sync.read(readFileSync(file));
  const W = png.width;
  const lum = (x, y) => {
    const i = (y * W + x) * 4;
    return (png.data[i] * 77 + png.data[i + 1] * 150 + png.data[i + 2] * 29) >> 8;
  };
  const a = Math.max(0, x0);
  const b = Math.min(W - 1, x1);
  const hay = [];
  for (let x = a; x <= b; x++) {
    let on = false;
    for (let y = Y0; y < Y1 && !on; y++) if (lum(x, y) > UMBRAL) on = true;
    hay.push(on);
  }
  // tramos contiguos, uniendo los separados por menos de SEP px
  const bruto = [];
  let s = -1;
  for (let i = 0; i < hay.length; i++) {
    if (hay[i] && s < 0) s = i;
    if ((!hay[i] || i === hay.length - 1) && s >= 0) {
      bruto.push([s + a, (hay[i] ? i : i - 1) + a]);
      s = -1;
    }
  }
  const tramos = [];
  const huecos = [];
  for (const t of bruto) {
    const ult = tramos[tramos.length - 1];
    if (ult && t[0] - ult[1] - 1 < SEP) {
      huecos.push({ x0: ult[1] + 1, x1: t[0] - 1, px: t[0] - ult[1] - 1 });
      ult[1] = t[1];
    } else tramos.push([...t]);
  }
  return {
    W,
    huecos,
    tramos: tramos.map(([xa, xb]) => {
      let top = Infinity, bot = -1;
      for (let y = Y0; y < Y1; y++) {
        for (let x = xa; x <= xb; x++) {
          if (lum(x, y) > UMBRAL) { if (y < top) top = y; bot = y; break; }
        }
      }
      return { x0: xa, x1: xb, w: xb - xa + 1, top, bot, alto: bot - top + 1 };
    }),
  };
}

/** Versal/cuerpo real de la fuente: OS/2.sCapHeight sobre head.unitsPerEm. */
function razonVersal(rutaWoff) {
  const b = readFileSync(join(ROOT, rutaWoff));
  const n = b.readUInt16BE(12);
  const tablas = {};
  for (let i = 0; i < n; i++) {
    const o = 44 + i * 20;
    const tag = b.toString("ascii", o, o + 4);
    const off = b.readUInt32BE(o + 4), cl = b.readUInt32BE(o + 8), ol = b.readUInt32BE(o + 12);
    let d = b.subarray(off, off + cl);
    if (cl < ol) d = inflateSync(d);
    tablas[tag] = d;
  }
  const upm = tablas["head"].readUInt16BE(18);
  const os2 = tablas["OS/2"];
  if (os2.readUInt16BE(0) < 2) return null;
  const cap = os2.readInt16BE(88);
  return { upm, cap, razon: cap / upm };
}

/* ── salida ───────────────────────────────────────────────────────────────── */

const [X0, X1] = arg("--x", "0,99999").split(",").map(Number);
const ref = join(ROOT, "reference", "canon", `${slug}.png`);
if (!existsSync(ref)) { console.error(`no existe la referencia: ${ref}`); process.exit(2); }
const render = join(ROOT, "scripts", "lamina", "out", slug, "actual.png");

const fila = (t) =>
  `x ${String(t.x0).padStart(4)}..${String(t.x1).padStart(4)} (w ${String(t.w).padStart(3)})  ` +
  `y ${t.top}..${t.bot} (alto ${String(t.alto).padStart(2)})`;

const R = perfil(ref, X0, X1);
console.log(`\n${slug} · banda y ${Y0}..${Y1} · umbral ${UMBRAL} · sep ${SEP}\n`);

if (!flag("--comparar")) {
  console.log("REFERENCIA");
  R.tramos.forEach((t, i) => console.log(`  ${String(i + 1).padStart(2)}. ${fila(t)}`));
} else {
  if (!existsSync(render)) {
    console.error(`\nno hay render todavía: ${render}\ncorré primero  node scripts/lamina/iterate.mjs ${slug}`);
    process.exit(2);
  }
  const A = perfil(render, X0, X1);
  console.log("  #  referencia                              render                                  Δx0  Δalto");
  const n = Math.max(R.tramos.length, A.tramos.length);
  for (let i = 0; i < n; i++) {
    const r = R.tramos[i], a = A.tramos[i];
    if (!r) { console.log(`  ${String(i + 1).padStart(2)}. ${"—".padEnd(38)}  ${fila(a)}   SOBRA en el render`); continue; }
    if (!a) { console.log(`  ${String(i + 1).padStart(2)}. ${fila(r)}   ${"—".padEnd(38)}   FALTA en el render`); continue; }
    const dx = a.x0 - r.x0, dh = a.alto - r.alto;
    const mal = Math.abs(dx) > 2 || Math.abs(dh) > 1 ? "  ←" : "";
    console.log(`  ${String(i + 1).padStart(2)}. ${fila(r)}   ${fila(a)}   ${String(dx).padStart(4)} ${String(dh).padStart(5)}${mal}`);
  }
  console.log("\n  Δ en x mayor a 2 px o en alto mayor a 1 px: eso es lo que el puntaje te está");
  console.log("  cobrando. El puntaje dice que fallaste; esta tabla dice por qué.");
}

/* Huecos ambiguos: el error que costó un ciclo en u10 — el tramo 80..374 parecía
   la palabra KODEX y en realidad era KODEX más el guion, separados por 8 px. */
if (R.huecos.length) {
  console.log(`\n  OJO · ${R.huecos.length} hueco(s) menores a --sep ${SEP} px quedaron fusionados:`);
  for (const h of R.huecos) console.log(`    x ${h.x0}..${h.x1} — hueco de ${h.px} px`);
  console.log("    Verificá que cada tramo sea UNA sola cosa antes de usar su ancho como cota.");
}

if (flag("--cuerpo")) {
  const f = razonVersal(FUENTE);
  if (!f) { console.error("\nla fuente no declara sCapHeight (OS/2 versión < 2)"); process.exit(2); }
  console.log(`\n  ${FUENTE.split("/").pop()}`);
  console.log(`  OS/2.sCapHeight ${f.cap} / head.unitsPerEm ${f.upm} = razón versal/cuerpo ${f.razon.toFixed(5)}`);

  if (SEP > 1) {
    console.log(`\n  --cuerpo necesita los glifos SUELTOS y estás corriendo con --sep ${SEP}.`);
    console.log("  Sacá el --sep (o ponelo en 1) y volvé a correr.");
    process.exit(2);
  }

  /* La versal se saca por MODA y no por promedio ni mediana: las redondas
     (O, C, S) rebasan 1-2 px por arriba y por abajo, así que cualquier medida
     que las incluya devuelve un cuerpo de más. Las planas son mayoría en casi
     toda palabra, y la moda se queda con ellas. Medir la versal de KODEX
     incluyendo la O da 51 → cuerpo 81,6; la moda da 49 → cuerpo 78,4, que es
     el que calza contra la referencia. */
  const altos = R.tramos.map(t => t.alto).filter(h => h > 8);
  if (!altos.length) { console.log("\n  no hay tramos altos en esta banda"); process.exit(0); }
  const cuenta = new Map();
  for (const h of altos) cuenta.set(h, (cuenta.get(h) ?? 0) + 1);
  const [versal, veces] = [...cuenta.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0];
  const rebasan = altos.filter(h => h > versal).length;

  console.log(`\n  alturas de glifo: ${[...cuenta.entries()].sort((a, b) => a[0] - b[0]).map(([h, n]) => `${h}px ×${n}`).join("  ")}`);
  console.log(`  versal = ${versal} px (moda, ${veces} de ${altos.length} glifos)`);
  console.log(`  → font-size = ${versal} / ${f.razon.toFixed(5)} = ${(versal / f.razon).toFixed(2)}`);
  if (rebasan) {
    console.log(rebasan === 1
      ? "\n  El glifo más alto es el rebase de una redonda (O, C, S, G), no cuerpo de"
      : `\n  Los ${rebasan} glifos más altos son el rebase de las redondas (O, C, S, G), no cuerpo de`);
    console.log("  más. La versal real es la de las planas (K, D, E, X, T, H, M, N).");
  }
  const bases = R.tramos.filter(t => t.alto === versal).map(t => t.bot);
  const base = [...new Set(bases)].sort((a, b) => b - a)[0];
  if (base != null) console.log(`\n  línea de base = ${base + 1} (las planas terminan en ${base}; las redondas, un px más abajo)`);
}
console.log("");
