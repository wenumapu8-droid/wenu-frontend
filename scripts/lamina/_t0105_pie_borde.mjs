import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const img = PNG.sync.read(readFileSync("reference/canon/t01-05-specimen-skull.png"));
const { width: W, data } = img;
const lum = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
console.log("borde inferior, tramo recto x=24..1640");
for (let y = 926; y <= 934; y++) {
  let s = 0, n = 0, mx = 0, mn = 255;
  for (let x = 24; x <= 1640; x++) { const v = lum(x, y); s += v; n++; if (v > mx) mx = v; if (v < mn) mn = v; }
  console.log(`y=${y} media=${(s / n).toFixed(2)} min=${mn} max=${mx}`);
}
console.log("\nregla y=873..874, media por tramos de 100 px");
for (const y of [872, 873, 874, 875]) {
  const out = [];
  for (let x = 6; x <= 1664; x += 100) {
    let s = 0, n = 0;
    for (let k = x; k < Math.min(1665, x + 100); k++) { s += lum(k, y); n++; }
    out.push(`${x}:${(s / n).toFixed(1)}`);
  }
  console.log(`y=${y}  ` + out.join(" "));
}
console.log("\ncantos verticales, media en y=876..926");
for (let x = 4; x <= 12; x++) { let s = 0, n = 0; for (let y = 876; y <= 926; y++) { s += lum(x, y); n++; } console.log(`x=${x} ${(s / n).toFixed(2)}`); }
for (let x = 1659; x <= 1668; x++) { let s = 0, n = 0; for (let y = 876; y <= 926; y++) { s += lum(x, y); n++; } console.log(`x=${x} ${(s / n).toFixed(2)}`); }
