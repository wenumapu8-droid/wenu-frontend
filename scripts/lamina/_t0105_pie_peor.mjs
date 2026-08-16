import { readFileSync } from "node:fs";
import { PNG } from "pngjs";
const p = PNG.sync.read(readFileSync("scripts/lamina/out/t01-05-specimen-skull/paneles/Pie-triptico.png"));
const { width: W, data } = p;
const w = 1672, h = 75, OA = w + 8;
const L = (x, y) => { const i = (y * W + x) * 4; return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8; };
const S = Number(process.argv[2] || 16);
const cells = [];
for (let by = 0; by < h; by += S) for (let bx = 0; bx < w; bx += S) {
  let e = 0, n = 0, sr = 0, sa = 0;
  for (let y = by; y < Math.min(h, by + S); y++) for (let x = bx; x < Math.min(w, bx + S); x++) {
    const r = L(x, y), a = L(OA + x, y); e += Math.abs(r - a); sr += r; sa += a; n++;
  }
  cells.push([e / n, bx, by + 866, sr / n, sa / n]);
}
cells.sort((a, b) => b[0] - a[0]);
console.log(cells.slice(0, 30).map(c => `${c[0].toFixed(1)}@${c[1]},${c[2]}(ref${c[3].toFixed(0)}/act${c[4].toFixed(0)})`).join("\n"));
let tot = 0, cnt = 0;
for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { tot += Math.abs(L(x, y) - L(OA + x, y)); cnt++; }
console.log("MAE global", (tot / cnt).toFixed(3));

/* Bandas por pieza */
const piezas = [
  ["marco izq", 0, 20], ["marca", 20, 168], ["barras", 168, 280], ["vdb+tanda", 280, 480],
  ["hueco1", 480, 685], ["lema", 685, 950], ["hueco2", 950, 1138], ["ppp", 1138, 1370],
  ["hueco3", 1370, 1436], ["ala", 1436, 1632], ["marco der", 1632, 1672],
];
console.log("\npieza            MAE   refMedia actMedia");
for (const [n, a, b] of piezas) {
  let e = 0, c = 0, sr = 0, sa = 0;
  for (let y = 0; y < h; y++) for (let x = a; x < b; x++) { const r = L(x, y), q = L(OA + x, y); e += Math.abs(r - q); sr += r; sa += q; c++; }
  console.log(`${n.padEnd(15)} ${(e / c).toFixed(2).padStart(6)} ${(sr / c).toFixed(2).padStart(8)} ${(sa / c).toFixed(2).padStart(8)}`);
}
/* Filas */
console.log("\nfila  MAE  ref  act");
for (let y = 0; y < h; y++) {
  let e = 0, sr = 0, sa = 0;
  for (let x = 0; x < w; x++) { const r = L(x, y), q = L(OA + x, y); e += Math.abs(r - q); sr += r; sa += q; }
  if (e / w > 0.4) console.log(`y=${y + 866} ${(e / w).toFixed(2)} ${(sr / w).toFixed(2)} ${(sa / w).toFixed(2)}`);
}
