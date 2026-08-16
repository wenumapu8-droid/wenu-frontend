#!/usr/bin/env node
/* Sonda 2 del PIE de t01-05: zonas sueltas, reglas y marco. */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const [r, g, b] = px(x, y); return (r * 77 + g * 150 + b * 29) >> 8; };

function zona(nom, x0, x1, y0, y1, umb = 12) {
  console.log(`\n== ${nom}  x=${x0}..${x1} y=${y0}..${y1} ==`);
  for (let y = y0; y <= y1; y++) {
    let s = "";
    let mx = 0;
    for (let x = x0; x <= x1; x++) { const v = lum(x, y); if (v > mx) mx = v; s += v > umb ? (v > 90 ? "#" : v > 40 ? "+" : ".") : " "; }
    console.log(`${y} |${s}| max=${mx}`);
  }
}

zona("suelto 471..580", 468, 580, 880, 915);
zona("suelto 1045..1065", 1044, 1066, 880, 915);
zona("suelto 1395..1425", 1394, 1426, 880, 915);
zona("regla y=874", 300, 430, 870, 878);

console.log("\n== regla y=873/874: extension (lum>10) ==");
for (const y of [872, 873, 874, 875]) {
  let x0 = 1e9, x1 = -1, n = 0, sum = 0;
  for (let x = 0; x < W; x++) { const v = lum(x, y); if (v > 10) { n++; sum += v; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
  console.log(`y=${y} n=${n} x=${x0}..${x1} lumMedia=${n ? (sum / n).toFixed(1) : 0}`);
}

console.log("\n== marco: borde inferior, filas 925..935 con umbral 6 ==");
for (let y = 925; y <= 935; y++) {
  let x0 = 1e9, x1 = -1, n = 0, sum = 0;
  for (let x = 0; x < W; x++) { const v = lum(x, y); if (v > 6) { n++; sum += v; if (x < x0) x0 = x; if (x > x1) x1 = x; } }
  console.log(`y=${y} n=${n} x=${x0}..${x1} media=${n ? (sum / n).toFixed(1) : 0}`);
}

console.log("\n== marco: columnas del borde derecho, y=900 y y=880 ==");
for (let x = 1650; x < W; x++) console.log(`x=${x} y900=${lum(x, 900)} y880=${lum(x, 880)} y920=${lum(x, 920)}`);

console.log("\n== esquinas inferiores (umbral 6) ==");
zona("esq izq", 0, 24, 918, 936, 6);
zona("esq der", 1648, 1671, 918, 936, 6);

console.log("\n== barras: extension real ==");
for (let x = 164; x <= 285; x++) {
  let n = 0, mx = 0;
  for (let y = 885; y <= 915; y++) { const v = lum(x, y); if (v > 18) n++; if (v > mx) mx = v; }
  if (n) console.log(`x=${x} n=${n} max=${mx}`);
}
