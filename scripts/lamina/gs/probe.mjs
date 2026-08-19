/* KODEX-∞ · GAIA SENTINEL · sonda de perfil de tinta.
   Perfil por fila/columna dentro de una banda, para hallar bordes de caja. */
import sharp from "sharp";
import { readFileSync } from "node:fs";

const REF = "reference/pendientes/gaia-sentinel.png";
const { data, info } = await sharp(REF).raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels: C } = info;
const lum = (x, y) => {
  const i = (y * W + x) * C;
  return (data[i] * 77 + data[i + 1] * 150 + data[i + 2] * 29) >> 8;
};

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > -1 ? Number(process.argv[i + 1]) : d;
};
const modo = process.argv[2] || "col";
const x0 = arg("--x0", 0), x1 = arg("--x1", W), y0 = arg("--y0", 0), y1 = arg("--y1", H);
const umbral = arg("--u", 80);

if (modo === "col") {
  for (let x = x0; x < x1; x++) {
    let n = 0, s = 0;
    for (let y = y0; y < y1; y++) { const l = lum(x, y); if (l > umbral) n++; s += l; }
    console.log(`${x}\t${n}\t${(s / (y1 - y0)).toFixed(1)}`);
  }
} else if (modo === "row") {
  for (let y = y0; y < y1; y++) {
    let n = 0, s = 0;
    for (let x = x0; x < x1; x++) { const l = lum(x, y); if (l > umbral) n++; s += l; }
    console.log(`${y}\t${n}\t${(s / (x1 - x0)).toFixed(1)}`);
  }
} else if (modo === "mapa") {
  /* mapa de luminancia media por celdas */
  const cw = arg("--cw", 64), ch = arg("--ch", 64);
  for (let y = y0; y < y1; y += ch) {
    const fila = [];
    for (let x = x0; x < x1; x += cw) {
      let s = 0, n = 0;
      for (let yy = y; yy < Math.min(y + ch, y1); yy++)
        for (let xx = x; xx < Math.min(x + cw, x1); xx++) { s += lum(xx, yy); n++; }
      fila.push(String(Math.round(s / n)).padStart(4));
    }
    console.log(String(y).padStart(5) + " |" + fila.join(""));
  }
} else if (modo === "tinta") {
  /* cobertura y luminancia media de una caja */
  let n = 0, s = 0, tot = 0;
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const l = lum(x, y); if (l > 26) n++; s += l; tot++; }
  console.log(`caja ${x0},${y0} ${x1-x0}x${y1-y0}  tinta ${n}/${tot} (${(100*n/tot).toFixed(1)}%)  lum media ${(s/tot).toFixed(1)}`);
} else if (modo === "color") {
  /* color pico: promedio de los píxeles más luminosos de la caja */
  const px = [];
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * W + x) * C;
    px.push([lum(x, y), data[i], data[i+1], data[i+2]]);
  }
  px.sort((a, b) => b[0] - a[0]);
  const top = px.slice(0, Math.max(1, Math.round(px.length * arg("--frac", 0.02))));
  const m = top.reduce((a, p) => [a[0]+p[1], a[1]+p[2], a[2]+p[3]], [0,0,0]).map(v => Math.round(v / top.length));
  console.log(`pico rgb(${m.join(",")})  #${m.map(v=>v.toString(16).padStart(2,"0")).join("")}  n=${top.length}`);
}
