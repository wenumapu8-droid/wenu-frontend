#!/usr/bin/env node
/* Sonda de medición de reference/canon/u03-return.png (1122x1402).
   Lámina CLARA: la tinta es más OSCURA que el fondo, umbral invertido. */
import { PNG } from "pngjs";
import { readFileSync } from "node:fs";

const png = PNG.sync.read(readFileSync(new URL("../../reference/canon/u03-return.png", import.meta.url)));
const { width: W, height: H, data: D } = png;
const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [D[i], D[i + 1], D[i + 2]];
};
const lum = (x, y) => {
  const [r, g, b] = px(x, y);
  return (r * 77 + g * 150 + b * 29) >> 8;
};

const cmd = process.argv[2];

if (cmd === "bg") {
  // muestras de fondo en zonas vacías
  const pts = [[560, 5], [5, 700], [1117, 700], [560, 1398], [300, 240], [900, 240], [180, 560], [560, 1120], [60, 1250], [1060, 460]];
  for (const [x, y] of pts) console.log(`(${x},${y}) rgb(${px(x, y).join(",")}) L${lum(x, y)}`);
  // histograma grueso de la imagen entera
  let min = 255, max = 0, sum = 0;
  const hist = new Array(16).fill(0);
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) {
    const l = lum(x, y); min = Math.min(min, l); max = Math.max(max, l); sum += l;
    hist[l >> 4]++;
  }
  console.log("min", min, "max", max, "media", (sum / (W * H / 4)).toFixed(1));
  console.log("hist16:", hist.map((v, i) => `${i * 16}:${v}`).join(" "));
} else if (cmd === "fila") {
  // perfil de una fila: tramos de tinta (L < umbral)
  const y = +process.argv[3];
  const umbral = +(process.argv[4] ?? 200);
  let runs = [], en = -1;
  for (let x = 0; x < W; x++) {
    const t = lum(x, y) < umbral;
    if (t && en < 0) en = x;
    if (!t && en >= 0) { runs.push([en, x - 1]); en = -1; }
  }
  if (en >= 0) runs.push([en, W - 1]);
  console.log(`y=${y} umbral<${umbral}:`, runs.map(([a, b]) => (a === b ? `${a}` : `${a}..${b}`)).join(" "));
} else if (cmd === "col") {
  const x = +process.argv[3];
  const umbral = +(process.argv[4] ?? 200);
  let runs = [], en = -1;
  for (let y = 0; y < H; y++) {
    const t = lum(x, y) < umbral;
    if (t && en < 0) en = y;
    if (!t && en >= 0) { runs.push([en, y - 1]); en = -1; }
  }
  if (en >= 0) runs.push([en, H - 1]);
  console.log(`x=${x} umbral<${umbral}:`, runs.map(([a, b]) => (a === b ? `${a}` : `${a}..${b}`)).join(" "));
} else if (cmd === "punto") {
  const x = +process.argv[3], y = +process.argv[4];
  const r = +(process.argv[5] ?? 0);
  for (let dy = -r; dy <= r; dy++) {
    let line = "";
    for (let dx = -r; dx <= r; dx++) line += String(lum(x + dx, y + dy)).padStart(4);
    console.log(`y=${y + dy}`, line);
  }
  console.log(`rgb centro: ${px(x, y).join(",")}`);
} else if (cmd === "zona") {
  // estadísticas de una caja: media L, píxel más oscuro, colores dominantes oscuros
  const [x0, y0, x1, y1] = process.argv.slice(3, 7).map(Number);
  let sum = 0, n = 0, min = 255, minAt = null;
  const cuentas = new Map();
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const l = lum(x, y); sum += l; n++;
    if (l < min) { min = l; minAt = [x, y]; }
    if (l < 210) {
      const [r, g, b] = px(x, y);
      const k = `${r >> 4}.${g >> 4}.${b >> 4}`;
      cuentas.set(k, (cuentas.get(k) || 0) + 1);
    }
  }
  console.log(`zona ${x0},${y0}..${x1},${y1} mediaL ${(sum / n).toFixed(1)} min ${min} en ${minAt}`);
  const top = [...cuentas.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
  for (const [k, v] of top) {
    const [r, g, b] = k.split(".").map((q) => q * 16 + 8);
    console.log(`  ~rgb(${r},${g},${b}) x${v}`);
  }
} else if (cmd === "colorfila") {
  // rgb de los píxeles de tinta de una fila
  const y = +process.argv[3];
  const umbral = +(process.argv[4] ?? 180);
  for (let x = 0; x < W; x++) {
    if (lum(x, y) < umbral) console.log(x, px(x, y).join(","), lum(x, y));
  }
} else if (cmd === "radial") {
  // perfil radial desde un centro: media L por anillo
  const cx = +process.argv[3], cy = +process.argv[4], R = +(process.argv[5] ?? 400);
  for (let r = 0; r < R; r += 5) {
    let s = 0, n = 0;
    for (let a = 0; a < 360; a += 2) {
      const x = Math.round(cx + r * Math.cos((a * Math.PI) / 180));
      const y = Math.round(cy + r * Math.sin((a * Math.PI) / 180));
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      s += lum(x, y); n++;
    }
    console.log(r, (s / n).toFixed(1));
  }
}
