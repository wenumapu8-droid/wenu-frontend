#!/usr/bin/env node
/**
 * KODEX-∞ · medición puntual: componentes conectados en hero-center de u10-commons
 * Entrada: reference/canon/u10-commons.png
 * Región: x 433..689, y 224..1301 (256x1077)
 * Salida: bounding boxes de los componentes más grandes (por área de tinta).
 */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", ".."); // ~/kodex-work

const REF = join(ROOT, "reference", "canon", "u10-commons.png");
const OUT = join(ROOT, "scripts", "lamina", "out", "u10-commons", "hero-center-components.json");

const X0 = 433, X1 = 689, Y0 = 224, Y1 = 1301;
const INK_LUM = 26;   // píxel cuenta como tinta si luminancia > este valor
const MIN_AREA = 80;  // descartar ruido puntual

function lum(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }

const buf = readFileSync(REF);
const png = PNG.sync.read(buf);
const W = X1 - X0, H = Y1 - Y0;
const mask = new Uint8Array(W * H);
for (let y = Y0; y < Y1; y++) {
  for (let x = X0; x < X1; x++) {
    const i = (y * png.width + x) * 4;
    const l = lum(png.data[i], png.data[i + 1], png.data[i + 2]);
    mask[(y - Y0) * W + (x - X0)] = l > INK_LUM ? 1 : 0;
  }
}

// Connected components (4-connectivity) con union-find
const parent = new Int32Array(W * H).fill(-1);
function find(a) { while (parent[a] !== a) { parent[a] = parent[parent[a]]; a = parent[a]; } return a; }
function union(a, b) { const ra = find(a), rb = find(b); if (ra !== rb) parent[rb] = ra; }

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!mask[i]) continue;
    parent[i] = i;
    if (x > 0 && mask[i - 1]) union(i, i - 1);
    if (y > 0 && mask[i - W]) union(i, i - W);
  }
}

const comps = new Map();
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = y * W + x;
    if (!mask[i]) continue;
    const r = find(i);
    let c = comps.get(r);
    if (!c) {
      c = { area: 0, minX: x, maxX: x, minY: y, maxY: y };
      comps.set(r, c);
    }
    c.area++;
    if (x < c.minX) c.minX = x;
    if (x > c.maxX) c.maxX = x;
    if (y < c.minY) c.minY = y;
    if (y > c.maxY) c.maxY = y;
  }
}

const list = [...comps.values()]
  .filter(c => c.area >= MIN_AREA)
  .sort((a, b) => b.area - a.area)
  .map((c, idx) => ({
    rank: idx + 1,
    area: c.area,
    x: c.minX,
    y: c.minY,
    w: c.maxX - c.minX + 1,
    h: c.maxY - c.minY + 1,
    cx: Math.round((c.minX + c.maxX) / 2),
    cy: Math.round((c.minY + c.maxY) / 2),
  }));

// Clustering por proximidad de centros para recuperar los elementos semánticos grandes
const CLUSTER_DIST = 45;
const seen = new Set();
const clusters = [];
for (const seed of list) {
  if (seen.has(seed.rank)) continue;
  const queue = [seed];
  seen.add(seed.rank);
  let minX = seed.x, minY = seed.y, maxX = seed.x + seed.w - 1, maxY = seed.y + seed.h - 1;
  let totalArea = seed.area;
  const members = [seed.rank];
  for (let i = 0; i < queue.length; i++) {
    const a = queue[i];
    for (const b of list) {
      if (seen.has(b.rank)) continue;
      const dx = a.cx - b.cx, dy = a.cy - b.cy;
      if (Math.sqrt(dx * dx + dy * dy) <= CLUSTER_DIST) {
        seen.add(b.rank);
        queue.push(b);
        members.push(b.rank);
        totalArea += b.area;
        minX = Math.min(minX, b.x);
        minY = Math.min(minY, b.y);
        maxX = Math.max(maxX, b.x + b.w - 1);
        maxY = Math.max(maxY, b.y + b.h - 1);
      }
    }
  }
  clusters.push({
    members: members.length,
    area: totalArea,
    x: minX,
    y: minY,
    w: maxX - minX + 1,
    h: maxY - minY + 1,
    cx: Math.round((minX + maxX) / 2),
    cy: Math.round((minY + maxY) / 2),
  });
}
clusters.sort((a, b) => b.area - a.area);

writeFileSync(OUT, JSON.stringify({
  source: REF,
  region: { x0: X0, x1: X1, y0: Y0, y1: Y1, w: W, h: H },
  ink_lum: INK_LUM,
  min_area: MIN_AREA,
  cluster_dist: CLUSTER_DIST,
  components: list,
  clusters,
}, null, 2));

console.log(`Encontrados ${list.length} componentes en hero-center (área >= ${MIN_AREA})`);
console.log(`Agrupados en ${clusters.length} clusters (distancia <= ${CLUSTER_DIST}px)`);
console.log("\nTop 10 clusters (elementos grandes):");
clusters.slice(0, 10).forEach((c, idx) => {
  console.log(`#${idx + 1} area=${c.area.toString().padStart(5)} members=${c.members.toString().padStart(2)} bbox=(${c.x},${c.y}) ${c.w}x${c.h}  centro=(${c.cx},${c.cy})`);
});
