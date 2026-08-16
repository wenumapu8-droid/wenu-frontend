#!/usr/bin/env node
/**
 * Sonda de medición de `reference/canon/u01-origin-field.png`.
 *
 * Vive en el repo y no en /tmp a propósito: otros agentes están midiendo sus
 * propias láminas al mismo tiempo y el scratchpad se pisa.
 *
 *   rows|cols  --x0 --x1 --y0 --y1 --u        perfil de tinta
 *   box        --x0 --x1 --y0 --y1 --u        caja envolvente de la tinta
 *   grid       --c                            mapa de luminancia media
 *   radial     --cx --cy --paso --rmax        perfil radial (para el héroe)
 *   color      --x0.. --u                     colores dominantes
 *   cmp        --ref otro.png                 diff por bandas contra otra lámina
 *   crop       --x0 --y0 --w --h --z --out    recorte ampliado
 */
import { readFileSync, writeFileSync } from "node:fs";
import { PNG } from "pngjs";

const ROOT = "/Users/galvazincia/kodex-work";
const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i > -1 ? process.argv[i + 1] : d;
};
const img = PNG.sync.read(readFileSync(arg("--png", `${ROOT}/reference/canon/u01-origin-field.png`)));
const W = img.width, H = img.height;
const L = (im, x, y) => {
  const i = (y * im.width + x) * 4;
  return (im.data[i] * 77 + im.data[i + 1] * 150 + im.data[i + 2] * 29) >> 8;
};
const lum = (x, y) => L(img, x, y);

const cmd = process.argv[2];
const x0 = +arg("--x0", 0), x1 = +arg("--x1", W - 1);
const y0 = +arg("--y0", 0), y1 = +arg("--y1", H - 1);
const u = +arg("--u", 40);

if (cmd === "rows") {
  for (let y = y0; y <= y1; y++) {
    let n = 0, max = 0, first = -1, last = -1, s = 0;
    for (let x = x0; x <= x1; x++) {
      const l = lum(x, y);
      if (l > max) max = l;
      if (l >= u) { n++; s += l; if (first < 0) first = x; last = x; }
    }
    if (n) console.log(`y=${y} n=${n} max=${max} media=${(s / n).toFixed(0)} x=${first}..${last}`);
  }
} else if (cmd === "cols") {
  for (let x = x0; x <= x1; x++) {
    let n = 0, max = 0, first = -1, last = -1, s = 0;
    for (let y = y0; y <= y1; y++) {
      const l = lum(x, y);
      if (l > max) max = l;
      if (l >= u) { n++; s += l; if (first < 0) first = y; last = y; }
    }
    if (n) console.log(`x=${x} n=${n} max=${max} media=${(s / n).toFixed(0)} y=${first}..${last}`);
  }
} else if (cmd === "box") {
  let mnx = 1e9, mxx = -1, mny = 1e9, mxy = -1, n = 0, sum = 0, max = 0;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const l = lum(x, y); sum += l; if (l > max) max = l;
    if (l >= u) { n++; if (x < mnx) mnx = x; if (x > mxx) mxx = x; if (y < mny) mny = y; if (y > mxy) mxy = y; }
  }
  console.log(`tinta x=${mnx}..${mxx} y=${mny}..${mxy} n=${n} media=${(sum / ((x1 - x0 + 1) * (y1 - y0 + 1))).toFixed(2)} max=${max}`);
} else if (cmd === "grid") {
  const cs = +arg("--c", 25);
  for (let by = 0; by < H; by += cs) {
    let line = String(by).padStart(4) + " ";
    for (let bx = 0; bx < W; bx += cs) {
      let s = 0, c = 0;
      for (let y = by; y < Math.min(by + cs, H); y++) for (let x = bx; x < Math.min(bx + cs, W); x++) { s += lum(x, y); c++; }
      const m = s / c;
      line += m < 0.5 ? " ." : m < 2 ? " :" : m < 5 ? " -" : m < 10 ? " =" : m < 20 ? " *" : m < 40 ? " #" : " @";
    }
    console.log(line);
  }
} else if (cmd === "radial") {
  const cx = +arg("--cx", 561), cy = +arg("--cy", 675);
  const paso = +arg("--paso", 10), rmax = +arg("--rmax", 600);
  for (let r = 0; r < rmax; r += paso) {
    let s = 0, c = 0, mx = 0, ink = 0;
    const n = Math.max(48, Math.round(r * 3));
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      const x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r);
      if (x < 0 || y < 0 || x >= W || y >= H) continue;
      const l = lum(x, y); s += l; c++; if (l > mx) mx = l; if (l >= 30) ink++;
    }
    if (c) console.log(`r=${String(r).padStart(3)} media=${(s / c).toFixed(2)} max=${mx} ink%=${(ink / c * 100).toFixed(1)}`);
  }
} else if (cmd === "color") {
  const bins = new Map();
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    if (lum(x, y) < u) continue;
    const i = (y * W + x) * 4;
    const r = img.data[i], g = img.data[i + 1], b = img.data[i + 2];
    const k = `${r >> 4}-${g >> 4}-${b >> 4}`;
    const e = bins.get(k) || [0, 0, 0, 0];
    e[0] += r; e[1] += g; e[2] += b; e[3]++;
    bins.set(k, e);
  }
  for (const [, e] of [...bins.entries()].sort((a, b) => b[1][3] - a[1][3]).slice(0, 12))
    console.log(`rgb(${(e[0] / e[3]).toFixed(0)},${(e[1] / e[3]).toFixed(0)},${(e[2] / e[3]).toFixed(0)})  n=${e[3]}`);
} else if (cmd === "cmp") {
  const otra = PNG.sync.read(readFileSync(arg("--ref", `${ROOT}/reference/canon/u02-threshold.png`)));
  const paso = +arg("--paso", 10);
  for (let by = y0; by <= y1; by += paso) {
    let s = 0, c = 0;
    for (let y = by; y < Math.min(by + paso, y1 + 1); y++) for (let x = x0; x <= x1; x++) { s += Math.abs(lum(x, y) - L(otra, x, y)); c++; }
    console.log(`y=${String(by).padStart(4)} dif=${(s / c).toFixed(2)}`);
  }
} else if (cmd === "crop") {
  const w = +arg("--w", 100), h = +arg("--h", 100), z = +arg("--z", 4);
  const out = arg("--out", "/tmp/_u01_crop.png");
  const o = new PNG({ width: w * z, height: h * z });
  for (let yy = 0; yy < h * z; yy++) for (let xx = 0; xx < w * z; xx++) {
    const sx = x0 + Math.floor(xx / z), sy = y0 + Math.floor(yy / z);
    const si = (sy * W + sx) * 4, di = (yy * w * z + xx) * 4;
    for (let k = 0; k < 4; k++) o.data[di + k] = sx < W && sy < H ? img.data[si + k] : k === 3 ? 255 : 0;
  }
  writeFileSync(out, PNG.sync.write(o));
  console.log("ok", out);
} else {
  console.log("cmds: rows cols box grid radial color cmp crop");
}
