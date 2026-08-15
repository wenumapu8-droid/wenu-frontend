#!/usr/bin/env node
/**
 * KODEX-∞ · medición de componentes conectados por región
 *
 * Uso: node scripts/lamina/_medir_region_components.mjs <slug> <region-id>
 *
 * Lee reference/canon/<slug>.png, recorta la región declarada en
 * scripts/lamina/regions/<slug>.json, detecta componentes conectados,
 * agrupa por proximidad y escribe:
 *   scripts/lamina/out/<slug>/<region-id>-components.json
 *   scripts/lamina/out/<slug>/<region-id>-audit.md
 */
import { PNG } from "pngjs";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

const slug = process.argv[2];
const regionId = process.argv[3];
if (!slug || !regionId) {
  console.error("uso: node scripts/lamina/_medir_region_components.mjs <slug> <region-id>");
  process.exit(2);
}

const refPath = join(ROOT, "reference", "canon", `${slug}.png`);
if (!existsSync(refPath)) {
  console.error(`no existe la referencia: ${refPath}`);
  process.exit(2);
}

const regionsPath = join(ROOT, "scripts", "lamina", "regions", `${slug}.json`);
if (!existsSync(regionsPath)) {
  console.error(`no existe el archivo de regiones: ${regionsPath}`);
  process.exit(2);
}

const regions = JSON.parse(readFileSync(regionsPath, "utf8"));
const region = regions.regions?.find(r => r.id === regionId);
if (!region) {
  console.error(`regiones disponibles: ${regions.regions?.map(r => r.id).join(", ")}`);
  console.error(`no se encontró la región: ${regionId}`);
  process.exit(2);
}

const X0 = region.x;
const Y0 = region.y;
const X1 = region.x + region.w;
const Y1 = region.y + region.h;

const INK_LUM = 26;
const MIN_AREA = 80;
const CLUSTER_DIST = 45;

function lum(r, g, b) { return 0.299 * r + 0.587 * g + 0.114 * b; }

const buf = readFileSync(refPath);
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

function touchesBorder(c) {
  return c.minX <= 0 || c.minY <= 0 || c.maxX >= W - 1 || c.maxY >= H - 1;
}

const list = [...comps.values()]
  .filter(c => c.area >= MIN_AREA && !touchesBorder(c))
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

const outDir = join(ROOT, "scripts", "lamina", "out", slug);
const outJson = join(outDir, `${regionId}-components.json`);
const outMd = join(outDir, `${regionId}-audit.md`);

writeFileSync(outJson, JSON.stringify({
  source: refPath,
  region: { id: regionId, x0: X0, x1: X1, y0: Y0, y1: Y1, w: W, h: H },
  ink_lum: INK_LUM,
  min_area: MIN_AREA,
  cluster_dist: CLUSTER_DIST,
  components: list,
  clusters,
}, null, 2));

const md = `# KODEX-∞ · ${slug} · ${regionId} audit

- Región: \`x ${X0}..${X1}, y ${Y0}..${Y1}\` (${W}×${H} px)
- Componentes detectados: ${list.length} (área >= ${MIN_AREA})
- Clusters (elementos grandes): ${clusters.length} (distancia <= ${CLUSTER_DIST}px)

## Top clusters

| # | bbox (región) | centro | área | miembros |
|---|---------------|--------|-----:|---------:|
${clusters.slice(0, 15).map((c, i) => `| ${i + 1} | (${c.x},${c.y}) ${c.w}×${c.h} | (${c.cx},${c.cy}) | ${c.area} | ${c.members} |`).join("\n")}

## Archivo de datos

\`scripts/lamina/out/${slug}/${regionId}-components.json\`
`;
writeFileSync(outMd, md);

console.log(`${slug}/${regionId}: ${list.length} componentes, ${clusters.length} clusters`);
console.log("\nTop 10 clusters:");
clusters.slice(0, 10).forEach((c, idx) => {
  console.log(`#${idx + 1} area=${c.area.toString().padStart(5)} members=${c.members.toString().padStart(2)} bbox=(${c.x},${c.y}) ${c.w}x${c.h}  centro=(${c.cx},${c.cy})`);
});
