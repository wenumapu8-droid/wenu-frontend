#!/usr/bin/env node
/**
 * Re-traza SÓLO el logotipo del pie de t01-02 y reescribe sus tres exports en
 * arte.ts. Nada más se toca.
 *
 * Por qué existe: el generador (arte-t01-02-cabpie.mjs) leyó ese logotipo en la
 * ventana x=20..125 y ahí no entra entero. Barrido columna por columna entre
 * y=883 y y=909, la tinta corre de x=25 a x=155: 25..117 es "KODEX", 119..129
 * el guión y 133..155 el ∞. Con la ventana vieja la lámina decía "KODEX−" y le
 * faltaba el símbolo que le da el nombre a la marca.
 *
 * Mismo método que el generador: barre umbral × desenfoque, rasteriza el trazo
 * a 1× y resuelve por mínimos cuadrados el relleno que mejor explica la banda.
 * Escribe en su PROPIA carpeta de glifos y no en la compartida, que es donde
 * dos agentes de la misma lámina se pisan la salida.
 *
 *   node scripts/lamina/_t0102_ftrmarca.mjs
 */
import { readFileSync, writeFileSync, mkdirSync, cpSync, rmSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { PNG } from "pngjs";
import sharp from "sharp";

const SLUG = "t01-02-observation-eye";
const BAND = "883,909";
const XR = "20,160";
/** Desplazamiento de la caja del pie: las y de arte.ts ya vienen restadas. */
const DY = 866;
const MIO = `scripts/lamina/glyphs/_t0102_ftrmarca`;

const img = PNG.sync.read(readFileSync(`reference/canon/${SLUG}.png`));
const { width: W, data } = img;

function trazar(umbral) {
  execFileSync("node", ["scripts/lamina/glyphs.mjs", SLUG, "--band", BAND, "--x", XR, "--umbral", String(umbral)], { stdio: "pipe" });
  /* La salida del trazador es compartida por toda la lámina: se copia enseguida
     a una carpeta propia para que otro agente no la sobreescriba a mitad. */
  if (existsSync(MIO)) rmSync(MIO, { recursive: true });
  cpSync(`scripts/lamina/glyphs/${SLUG}`, MIO, { recursive: true });
  const man = JSON.parse(readFileSync(`${MIO}/manifiesto.json`, "utf8"));
  return man.glifos.map((g) => {
    const svg = readFileSync(`${MIO}/${g.id}.svg`, "utf8");
    const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
    const ds = [...svg.matchAll(/<path d="([^"]+)"(?:[^>]*transform="([^"]+)")?/g)].map((m) => [m[1], m[2] ?? ""]);
    return { x: g.caja.x, y: g.caja.y, w: g.caja.w, h: g.caja.h, vw: +vb[1], vh: +vb[2], d: ds };
  });
}

async function cobertura(glifos, r, sigma) {
  const cuerpo = glifos.map((g) =>
    `<svg x="${g.x - r.x0}" y="${g.y - r.y0}" width="${g.w}" height="${g.h}" viewBox="0 0 ${g.vw} ${g.vh}" preserveAspectRatio="none">` +
    g.d.map(([d, tr]) => `<path d="${d}"${tr ? ` transform="${tr}"` : ""} fill="#fff"/>`).join("") + `</svg>`
  ).join("");
  const filtro = sigma > 0
    ? `<defs><filter id="b" x="-30%" y="-60%" width="160%" height="220%" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="${sigma}"/></filter></defs><g filter="url(#b)">${cuerpo}</g>`
    : cuerpo;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${r.w}" height="${r.h}" viewBox="0 0 ${r.w} ${r.h}"><rect width="${r.w}" height="${r.h}" fill="#000"/>${filtro}</svg>`;
  const { data: px } = await sharp(Buffer.from(svg)).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const cov = new Float64Array(r.w * r.h);
  for (let i = 0; i < cov.length; i++) cov[i] = px[i * 3] / 255;
  return cov;
}

function ajustar(cov, r) {
  const num = [0, 0, 0];
  let den = 0, ref2 = 0;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const c = cov[y * r.w + x];
    const i = ((y + r.y0) * W + (x + r.x0)) * 4;
    den += c * c;
    for (let k = 0; k < 3; k++) { num[k] += c * data[i + k]; ref2 += data[i + k] * data[i + k]; }
  }
  const k = num.map((n) => (den > 0 ? Math.min(255, Math.max(0, Math.round(n / den))) : 0));
  let res = 0;
  for (let y = 0; y < r.h; y++) for (let x = 0; x < r.w; x++) {
    const c = cov[y * r.w + x];
    const i = ((y + r.y0) * W + (x + r.x0)) * 4;
    for (let j = 0; j < 3; j++) { const d = data[i + j] - k[j] * c; res += d * d; }
  }
  return { k, res: Math.sqrt(res / ref2) };
}

const [by0, by1] = BAND.split(",").map(Number);
const [bx0, bx1] = XR.split(",").map(Number);
const r = { x0: bx0, y0: by0, w: bx1 - bx0 + 1, h: by1 - by0 + 1 };
let top = null;
for (const u of [14, 18, 22, 26, 32, 38, 45, 52, 60, 70]) {
  const gl = trazar(u);
  if (!gl.length) continue;
  for (const s of [0, 0.35, 0.5, 0.7, 0.9, 1.1, 1.4]) {
    const cov = await cobertura(gl, r, s);
    const { k, res } = ajustar(cov, r);
    if (!top || res < top.res) top = { u, s, k, res, gl };
  }
}
console.log(`  ftrMarca  umbral ${top.u}  sigma ${top.s}  fill rgb(${top.k})  residuo ${(top.res * 100).toFixed(2)}%  ${top.gl.length} glifos`);

const gl = top.gl.map((g) => ({ ...g, y: g.y - DY }));
const ruta = "src/components/kodex/lamina/t01-02/arte.ts";
let ts = readFileSync(ruta, "utf8");
ts = ts.replace(/\/\*\* umbral \d+ · sigma [\d.]+ · residuo [\d.]+ % \*\/\nexport const ftrMarca = .*\nexport const ftrMarcaTinta = ".*";\nexport const ftrMarcaSigma = [\d.]+;/,
  `/** umbral ${top.u} · sigma ${top.s} · residuo ${(top.res * 100).toFixed(2)} % · ventana x=${XR} (re-trazado: la del generador cortaba el ∞) */\n` +
  `export const ftrMarca = ${JSON.stringify(gl)} as unknown as Glifo[];\n` +
  `export const ftrMarcaTinta = "rgb(${top.k})";\nexport const ftrMarcaSigma = ${top.s};`);
writeFileSync(ruta, ts);
console.log(`  ok → ${ruta}`);
