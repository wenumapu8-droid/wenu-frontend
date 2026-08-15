#!/usr/bin/env node
/**
 * KODEX-∞ · EXTRACTOR DE CAMPO
 *
 * Lee la referencia de una lámina y escribe la RECETA de su campo: todo lo que
 * hace falta para reconstruirlo, medido y no estimado.
 *
 * Por qué existe. El campo de `u10-commons` se llevó una noche entera de
 * investigación para pasar de 34 % a 85 % de cobertura, y lo que se descubrió
 * quedó hardcodeado dentro de esa lámina: los 28 anillos del perfil radial, las
 * posiciones de 82 glifos, los nueve radios de los anillos concéntricos, los 45
 * radios de la roseta, los pesos de la paleta. Sin extraerlo, la lámina 11
 * cuesta otra noche igual.
 *
 * La distinción que ordena todo esto ya estaba en el método: el NUCLEO de cada
 * lámina es único y caro —es el organismo, y ahí va el criterio—, pero todo lo
 * que lo rodea es la misma clase de cosa medida de otra manera. Esto extrae esa
 * parte.
 *
 * Uso:
 *   node scripts/lamina/extraer-campo.mjs <slug> [--centro x,y] [--radio 560]
 *
 * Escribe `scripts/lamina/campo/<slug>.json` con:
 *
 *   anillos_perfil   28 pesos de muestreo del radio (densidad × área del anillo)
 *   anillos_r        radios donde la densidad radial hace pico
 *   radios_n         cantidad de radios de la roseta, de la densidad angular
 *   angular_perfil   36 pesos de muestreo del ángulo: hacia dónde sale la trama
 *   glifos           [x, y, r] de cada diagrama compacto, en píxeles de lámina
 *   marcas           [x, y, ancho, alto] de cada marca alargada
 *   paleta           colores con su peso, agrupados por tono y saturación
 *   tinta_total      píxeles de tinta de la referencia, para medir cobertura
 */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const slug = process.argv[2];
const arg = (n, d) => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : d; };
if (!slug) {
  console.error("uso: node scripts/lamina/extraer-campo.mjs <slug> [--centro x,y] [--radio 560]");
  process.exit(2);
}

/* La referencia salía fija de `reference/canon/`, y eso deja fuera las que todavía no
   son canon. El canon prohíbe por escrito tratar una imagen de referencia como asset
   canónico sin revisión humana, así que las 54 que aparecieron en Drive viven en
   `reference/pendientes/` — medibles, pero sin ascenderlas a canon por el solo hecho de
   medirlas. `KDX_REFDIR` elige el directorio; sin él nada cambia. */
const REFDIR = process.env.KDX_REFDIR || join("reference", "canon");
const refPath = join(ROOT, REFDIR, `${slug}.png`);
if (!existsSync(refPath)) { console.error(`no existe ${refPath}`); process.exit(2); }
const png = PNG.sync.read(readFileSync(refPath));
const W = png.width, H = png.height;
const lum = (x, y) => {
  const i = (y * W + x) * 4;
  return 0.299 * png.data[i] + 0.587 * png.data[i + 1] + 0.114 * png.data[i + 2];
};

const [CX, CY] = arg("--centro", `${Math.round(W / 2)},${Math.round(H * 0.542)}`).split(",").map(Number);
const RMAX = Number(arg("--radio", Math.round(Math.min(W, H) / 2)));
const T = 26;

/* La región del campo: se excluyen cabecera y pie, que son cromo compartido y
   tienen su propio componente. Se toman de regions/<slug>.json si existe. */
let X0 = Math.round(W * 0.048), Y0 = Math.round(H * 0.16), X1 = W - X0, Y1 = Math.round(H * 0.928);
const regPath = join(ROOT, "scripts", "lamina", "regions", `${slug}.json`);
if (existsSync(regPath)) {
  const rs = JSON.parse(readFileSync(regPath, "utf8")).regions ?? [];
  const campo = rs.filter(r => /hero|campo|centro/i.test(r.id));
  if (campo.length) {
    X0 = Math.min(...campo.map(r => r.x));
    Y0 = Math.min(...campo.map(r => r.y));
    X1 = Math.max(...campo.map(r => r.x + r.w));
    Y1 = Math.max(...campo.map(r => r.y + r.h));
  }
}

/* ── perfil radial ─────────────────────────────────────────────────────────
   Se mide como PESO DE MUESTREO -densidad × área del anillo- y no como densidad
   a secas, porque lo que se sortea después es el radio de cada punto: si se
   usara la densidad, los anillos exteriores recibirían de menos por ser más
   grandes. */
const NA = 28, PASO = RMAX / NA;
const tinta = new Array(NA).fill(0), area = new Array(NA).fill(0);
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
  const d = Math.hypot(x - CX, y - CY);
  if (d >= RMAX) continue;
  const k = Math.min(NA - 1, Math.floor(d / PASO));
  area[k]++;
  if (lum(x, y) > T) tinta[k]++;
}
const dens = tinta.map((v, k) => (area[k] ? v / area[k] : 0));
const crudos = dens.map((d, k) => d * (2 * k + 1));
const suma = crudos.reduce((a, b) => a + b, 0) || 1;
const anillos_perfil = crudos.map(w => +(w / suma).toFixed(4));

/* ── anillos concéntricos: picos de la densidad radial fina ─────────────── */
const FINO = 4, NF = Math.floor(RMAX / FINO);
const tf = new Array(NF).fill(0), af = new Array(NF).fill(0);
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
  const d = Math.hypot(x - CX, y - CY);
  if (d >= RMAX) continue;
  const k = Math.floor(d / FINO);
  af[k]++;
  if (lum(x, y) > T) tf[k]++;
}
const df = tf.map((v, k) => (af[k] ? (v / af[k]) * 100 : 0));
const medFina = [...df].sort((a, b) => a - b)[Math.floor(NF / 2)];
const anillos_r = [];
for (let k = 2; k < NF - 2; k++) {
  if (df[k] > df[k - 1] && df[k] >= df[k + 1] && df[k] > df[k - 2] && df[k] > df[k + 2] && df[k] > medFina * 1.15) {
    anillos_r.push(k * FINO + FINO / 2);
  }
}

/* ── radios de la roseta: picos de la densidad angular ──────────────────── */
const NANG = 180;
const ta = new Array(NANG).fill(0), aa = new Array(NANG).fill(0);
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
  const dx = x - CX, dy = y - CY, d = Math.hypot(dx, dy);
  if (d < RMAX * 0.07 || d > RMAX * 0.58) continue;
  const k = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * NANG) % NANG;
  aa[k]++;
  if (lum(x, y) > T) ta[k]++;
}
const da = ta.map((v, k) => (aa[k] ? (v / aa[k]) * 100 : 0));
const medAng = [...da].sort((a, b) => a - b)[Math.floor(NANG / 2)];
const picosAng = [];
for (let k = 0; k < NANG; k++) {
  if (da[k] > da[(k - 1 + NANG) % NANG] && da[k] >= da[(k + 1) % NANG] && da[k] > medAng * 1.25) picosAng.push(k);
}
/* ── perfil angular: de dónde sortear el ángulo de cada filamento ─────────
   `radios_n` cuenta los radios de la roseta, que es arte regular. Esto es otra
   cosa: CUÁNTA tinta hay en cada dirección, que es lo que decide hacia dónde
   sale la trama. u01 lo necesitaba porque su campo no es isótropo -la
   referencia pesa 4.769 px hacia arriba-izquierda contra 1.793 hacia abajo- y
   los racimos sorteados con `azar()` le habían quedado justo al revés: 34 % de
   cobertura arriba-izquierda y 202 % abajo.
   Se mide sobre el anillo del campo -0,18 a 0,80 del radio- para no dejar que
   el núcleo, que es isótropo y muy brillante, aplaste la señal. */
const NAP = 36;
const tap = new Array(NAP).fill(0), aap = new Array(NAP).fill(0);
for (let y = Y0; y < Y1; y++) for (let x = X0; x < X1; x++) {
  const dx = x - CX, dy = y - CY, d = Math.hypot(dx, dy);
  if (d < RMAX * 0.18 || d > RMAX * 0.8) continue;
  const k = Math.floor(((Math.atan2(dy, dx) + Math.PI) / (2 * Math.PI)) * NAP) % NAP;
  aap[k]++;
  if (lum(x, y) > T) tap[k]++;
}
/* Densidad y no conteo: la región es un rectángulo, así que las direcciones
   diagonales abarcan más píxeles que las rectas y un conteo crudo las premia. */
const dap = tap.map((v, k) => (aap[k] ? v / aap[k] : 0));
const sumAp = dap.reduce((a, b) => a + b, 0) || 1;
const angular_perfil = dap.map(v => +(v / sumAp).toFixed(4));

let radios_n = 0;
if (picosAng.length > 2) {
  const sep = [];
  for (let i = 1; i < picosAng.length; i++) sep.push((picosAng[i] - picosAng[i - 1]) * 360 / NANG);
  sep.sort((a, b) => a - b);
  const s = sep[Math.floor(sep.length / 2)];
  if (s > 0) radios_n = Math.round(360 / s);
}

/* ── glifos y marcas: componentes conectados del campo ──────────────────── */
const w = X1 - X0, h = Y1 - Y0;
const mask = new Uint8Array(w * h);
let tintaTotal = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  if (lum(X0 + x, Y0 + y) > T) { mask[y * w + x] = 1; tintaTotal++; }
}
const parent = new Int32Array(w * h).fill(-1);
const find = a => { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; };
const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; };
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const i = y * w + x;
  if (!mask[i]) continue;
  parent[i] = i;
  if (x > 0 && mask[i - 1]) union(i, i - 1);
  if (y > 0 && mask[i - w]) union(i, i - w);
}
const comps = new Map();
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
  const i = y * w + x;
  if (!mask[i]) continue;
  const r = find(i);
  const o = comps.get(r) ?? { a: 0, x0: x, x1: x, y0: y, y1: y };
  o.a++;
  if (x < o.x0) o.x0 = x; if (x > o.x1) o.x1 = x;
  if (y < o.y0) o.y0 = y; if (y > o.y1) o.y1 = y;
  comps.set(r, o);
}
const glifos = [], marcas = [];
for (const o of comps.values()) {
  const an = o.x1 - o.x0 + 1, al = o.y1 - o.y0 + 1;
  const cx = (o.x0 + o.x1) / 2 + X0, cy = (o.y0 + o.y1) / 2 + Y0;
  const d = Math.hypot(cx - CX, cy - CY);
  if (d < RMAX * 0.1 || d > RMAX * 0.94) continue;
  const rel = Math.max(an, al) / Math.min(an, al);
  if (o.a >= 61 && o.a <= 400 && an <= 70 && al <= 70 && rel <= 2.4) {
    glifos.push(Math.round(cx), Math.round(cy), Math.round(Math.max(an, al) / 2));
  } else if (o.a >= 40 && o.a <= 500 && rel > 2.4 && Math.max(an, al) <= 110) {
    marcas.push(Math.round(cx), Math.round(cy), an, al);
  }
}

/* ── paleta ────────────────────────────────────────────────────────────── */
const cubos = new Map();
for (let y = Y0; y < Y1; y += 2) for (let x = X0; x < X1; x += 2) {
  const i = (y * W + x) * 4, r = png.data[i], g = png.data[i + 1], b = png.data[i + 2];
  if (0.299 * r + 0.587 * g + 0.114 * b < 45) continue;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), dd = mx - mn;
  let hu = -1;
  if (dd > 6) {
    if (mx === r) hu = ((g - b) / dd + 6) % 6;
    else if (mx === g) hu = (b - r) / dd + 2;
    else hu = (r - g) / dd + 4;
    hu = Math.round(hu * 60 / 15) * 15;
  }
  const sat = mx ? dd / mx : 0;
  const clase = sat < 0.12 ? "neutro" : sat < 0.35 ? "suave" : "vivo";
  const k = `${hu}|${clase}`;
  const c = cubos.get(k) ?? { n: 0, r: 0, g: 0, b: 0, clase };
  c.n++; c.r += r; c.g += g; c.b += b;
  cubos.set(k, c);
}
const totalPal = [...cubos.values()].reduce((s, c) => s + c.n, 0) || 1;
const paleta = [...cubos.entries()]
  .sort((a, b) => b[1].n - a[1].n).slice(0, 11)
  .map(([, c]) => ({
    rgb: [c.r, c.g, c.b].map(v => Math.round(v / c.n)).join(","),
    peso: +(c.n / totalPal * 100).toFixed(1),
    clase: c.clase,
  }));

const receta = {
  slug, centro: [CX, CY], radio: RMAX, region: { x: X0, y: Y0, w, h },
  tinta_total: tintaTotal,
  anillos_perfil, anillos_r, radios_n, angular_perfil,
  glifos, marcas, paleta,
};
const outDir = join(ROOT, "scripts", "lamina", "campo");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, `${slug}.json`), JSON.stringify(receta, null, 1) + "\n");

console.log(`\n  ${slug} · receta del campo`);
console.log(`  centro (${CX},${CY})  radio ${RMAX}  tinta ${tintaTotal.toLocaleString()} px\n`);
console.log(`  anillos concentricos : ${anillos_r.length}   ${anillos_r.slice(0, 9).join(", ")}${anillos_r.length > 9 ? " …" : ""}`);
console.log(`  radios de la roseta  : ${radios_n || "sin roseta detectable"}`);
console.log(`  glifos compactos     : ${glifos.length / 3}`);
console.log(`  marcas alargadas     : ${marcas.length / 4}`);
console.log(`  paleta               : ${paleta.slice(0, 3).map(p => `${p.peso}% ${p.clase}`).join("  ")}`);
console.log(`\n  → scripts/lamina/campo/${slug}.json\n`);
