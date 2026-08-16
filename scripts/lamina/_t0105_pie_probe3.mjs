#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const [r, g, b] = px(x, y); return (r * 77 + g * 150 + b * 29) >> 8; };

function filas(nom, x0, x1, y0, y1, umb = 18) {
  console.log(`\n== ${nom} filas x=${x0}..${x1} (umbral ${umb}) ==`);
  for (let y = y0; y <= y1; y++) {
    let n = 0, mx = 0, a = 1e9, b = -1;
    for (let x = x0; x <= x1; x++) { const v = lum(x, y); if (v > umb) { n++; if (x < a) a = x; if (x > b) b = x; } if (v > mx) mx = v; }
    console.log(`y=${y} n=${String(n).padStart(3)} x=${a === 1e9 ? "-" : a + ".." + b} max=${mx}`);
  }
}
function cols(nom, x0, x1, y0, y1, umb = 18) {
  console.log(`\n== ${nom} cols y=${y0}..${y1} ==`);
  let a = 1e9, b = -1;
  for (let x = x0; x <= x1; x++) { let n = 0; for (let y = y0; y <= y1; y++) if (lum(x, y) > umb) n++; if (n) { if (x < a) a = x; if (x > b) b = x; } }
  console.log(`tinta x=${a}..${b}`);
}
filas("marca KODEX-inf", 15, 170, 880, 918);
cols("marca", 0, 200, 883, 915);
filas("barras", 174, 273, 883, 915);
filas("VDB", 285, 480, 883, 915, 25);
cols("VDB", 280, 480, 886, 899, 25);
filas("TANDA01", 285, 360, 898, 916, 25);
cols("TANDA01", 280, 380, 900, 913, 25);
filas("lema", 685, 950, 885, 915);
cols("lema", 680, 960, 888, 912);
filas("ppp", 1138, 1368, 885, 915);
cols("ppp", 1130, 1380, 888, 912);
filas("ala", 1436, 1630, 872, 928, 14);
cols("ala", 1420, 1650, 872, 928, 14);
console.log("\n== TANDA 01 rojo: media rgb de la tinta ==");
let sr = 0, sg = 0, sb = 0, n = 0, mr = 0, mp = null;
for (let y = 900; y <= 913; y++) for (let x = 285; x <= 360; x++) {
  const [r, g, b] = px(x, y);
  if (r - g > 20 && r > 40) { sr += r; sg += g; sb += b; n++; if (r > mr) { mr = r; mp = [x, y, r, g, b]; } }
}
console.log("n=", n, "media=", (sr / n).toFixed(0), (sg / n).toFixed(0), (sb / n).toFixed(0), "pico=", mp);
