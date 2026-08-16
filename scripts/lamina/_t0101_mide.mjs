/**
 * Medidor ad-hoc de la lámina t01-01 (bloque header/footer/banda inferior).
 * Uso: node scripts/lamina/_t0101_mide.mjs <modo> [args]
 */
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const img = PNG.sync.read(readFileSync("reference/canon/t01-01-threshold-portal.png"));
const { width: W, height: H, data } = img;
const px = (x, y) => { const i = (y * W + x) * 4; return [data[i], data[i + 1], data[i + 2]]; };
const lum = (x, y) => { const [r, g, b] = px(x, y); return (r * 77 + g * 150 + b * 29) >> 8; };

const modo = process.argv[2];
const N = (i, d) => (process.argv[i] !== undefined ? Number(process.argv[i]) : d);

if (modo === "filas") {
  // perfil de tinta por fila en una banda
  const y0 = N(3), y1 = N(4), x0 = N(5, 0), x1 = N(6, W - 1), t = N(7, 12);
  for (let y = y0; y <= y1; y++) {
    let n = 0, max = 0, sx0 = -1, sx1 = -1;
    for (let x = x0; x <= x1; x++) { const l = lum(x, y); if (l > t) { n++; if (sx0 < 0) sx0 = x; sx1 = x; } if (l > max) max = l; }
    console.log(String(y).padStart(4), "n=" + String(n).padStart(5), "max=" + String(max).padStart(3), "x=" + sx0 + ".." + sx1);
  }
}

if (modo === "cols") {
  const x0 = N(3), x1 = N(4), y0 = N(5), y1 = N(6), t = N(7, 12);
  for (let x = x0; x <= x1; x++) {
    let n = 0, max = 0, sy0 = -1, sy1 = -1;
    for (let y = y0; y <= y1; y++) { const l = lum(x, y); if (l > t) { n++; if (sy0 < 0) sy0 = y; sy1 = y; } if (l > max) max = l; }
    console.log(String(x).padStart(5), "n=" + String(n).padStart(4), "max=" + String(max).padStart(3), "y=" + sy0 + ".." + sy1);
  }
}

if (modo === "runs") {
  // tramos de columnas con tinta (para separar glifos/celdas)
  const x0 = N(3), x1 = N(4), y0 = N(5), y1 = N(6), t = N(7, 12), gap = N(8, 2);
  const runs = []; let r = null;
  for (let x = x0; x <= x1; x++) {
    let n = 0;
    for (let y = y0; y <= y1; y++) if (lum(x, y) > t) n++;
    if (n > 0) r = r ? [r[0], x] : [x, x];
    else if (r && x - r[1] > gap) { runs.push(r); r = null; }
  }
  if (r) runs.push(r);
  console.log(runs.map(([a, b]) => `${a}..${b}(${b - a + 1})`).join("  "));
  console.log("total", runs.length);
}

if (modo === "vruns") {
  const y0 = N(3), y1 = N(4), x0 = N(5), x1 = N(6), t = N(7, 12), gap = N(8, 1);
  const runs = []; let r = null;
  for (let y = y0; y <= y1; y++) {
    let n = 0;
    for (let x = x0; x <= x1; x++) if (lum(x, y) > t) n++;
    if (n > 0) r = r ? [r[0], y] : [y, y];
    else if (r && y - r[1] > gap) { runs.push(r); r = null; }
  }
  if (r) runs.push(r);
  console.log(runs.map(([a, b]) => `${a}..${b}(${b - a + 1})`).join("  "));
}

if (modo === "caja") {
  // caja de tinta y color dominante
  const x0 = N(3), x1 = N(4), y0 = N(5), y1 = N(6), t = N(7, 12);
  let ax = 1e9, bx = -1, ay = 1e9, by = -1, acc = [0, 0, 0], n = 0, maxl = 0, mx = [0, 0, 0];
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const l = lum(x, y);
    if (l > t) { if (x < ax) ax = x; if (x > bx) bx = x; if (y < ay) ay = y; if (y > by) by = y; const c = px(x, y); acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; n++; if (l > maxl) { maxl = l; mx = c; } }
  }
  console.log("tinta", ax + ".." + bx, ay + ".." + by, "n=" + n,
    "media rgb(" + acc.map((v) => Math.round(v / n)).join(",") + ")",
    "max rgb(" + mx.join(",") + ") lum " + maxl);
}

if (modo === "punto") {
  const x = N(3), y = N(4);
  console.log(x, y, px(x, y), "lum", lum(x, y));
}

if (modo === "rect") {
  // media de color de un rectángulo sólido
  const x0 = N(3), x1 = N(4), y0 = N(5), y1 = N(6);
  let acc = [0, 0, 0], n = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = px(x, y); acc[0] += c[0]; acc[1] += c[1]; acc[2] += c[2]; n++; }
  const m = acc.map((v) => Math.round(v / n));
  console.log("rgb(" + m.join(",") + ")  #" + m.map((v) => v.toString(16).padStart(2, "0")).join(""));
}
