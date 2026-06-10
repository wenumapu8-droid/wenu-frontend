#!/usr/bin/env node
/**
 * find-photos-on-disk.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Para cada SKU NocoDB sin "Foto macro", busca matches por:
 *   1. SKU literal en cualquier path bajo /Volumes/LaCie/Wenu mapu
 *   2. Fuzzy match del slug de Title contra los nombres de carpeta de
 *      /Volumes/LaCie/Wenu mapu/00_CATALOGO_VIVO/<old_wcid>_<slug>/
 *
 * Output:
 *   - Tabla a stdout: SKU · candidatos encontrados (top 3)
 *   - JSON detallado: /tmp/wenu-photo-disk-match.json
 *
 * READ-ONLY. Nunca copia ni mueve archivos. Es solo de descubrimiento.
 */
import fs from 'node:fs';
import path from 'node:path';

const SNAPSHOT = '/tmp/wenu-vegas-filter.json';
const DISK_ROOT = '/Volumes/LaCie/Wenu mapu';
if (!fs.existsSync(SNAPSHOT)) { console.error('Run audit-vegas-filter.mjs first.'); process.exit(1); }
if (!fs.existsSync(DISK_ROOT)) { console.error('LaCie not mounted at', DISK_ROOT); process.exit(2); }

const data = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const noPhoto = new Set(data.by_missing_field.photo);

// We need the full record (title) for fuzzy match — re-load raw snapshot:
const RAW = '/tmp/wenu-nocodb-snapshot.json';
if (!fs.existsSync(RAW)) { console.error('Raw snapshot missing.'); process.exit(3); }
const all = JSON.parse(fs.readFileSync(RAW, 'utf8'));
const recsNoPhoto = all.filter(r => noPhoto.has(r.SKU));

console.log(`Searching disk for ${recsNoPhoto.length} SKUs without macro photo…`);
console.log();

// Index 00_CATALOGO_VIVO folder names
const catalogoVivo = path.join(DISK_ROOT, '00_CATALOGO_VIVO');
const folders = fs.existsSync(catalogoVivo)
  ? fs.readdirSync(catalogoVivo).map(name => {
      const m = name.match(/^(\d+)_(.+)$/);
      return { name, wcId: m?.[1], slug: m?.[2] || name };
    })
  : [];
console.log(`  ${folders.length} folders in 00_CATALOGO_VIVO indexed.`);
console.log();

const slugify = s => (s||'').toLowerCase()
  .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
  .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');

const tokens = s => new Set(slugify(s).split('-').filter(t => t.length > 2));
const jaccard = (a, b) => {
  const inter = [...a].filter(x => b.has(x)).length;
  const uni = new Set([...a, ...b]).size;
  return uni === 0 ? 0 : inter / uni;
};

const countPhotosInFolder = (folder) => {
  const full = path.join(catalogoVivo, folder);
  let count = 0;
  for (const sub of ['editadas','raw','vitrina','web']) {
    const dir = path.join(full, sub);
    if (!fs.existsSync(dir)) continue;
    try {
      count += fs.readdirSync(dir).filter(f => /\.(jpe?g|png|webp|avif|heic|nef|cr2|arw)$/i.test(f)).length;
    } catch {}
  }
  return count;
};

const results = [];
for (const rec of recsNoPhoto) {
  const title = rec.Title || rec['Nombre interno'] || '';
  const recTokens = tokens(title);
  const matches = folders.map(f => ({
    folder: f.name,
    wcId: f.wcId,
    score: jaccard(recTokens, tokens(f.slug)),
    photos: countPhotosInFolder(f.name),
  }))
  .filter(m => m.score > 0.15 || m.photos > 0)
  .sort((a, b) => b.score - a.score)
  .slice(0, 3);
  results.push({ sku: rec.SKU, title, matches });
}

// Output
let withMatch = 0, totalCandidates = 0;
console.log('SKU              | Title                                         | Best folder candidate (score · photos)');
console.log('─'.repeat(140));
for (const r of results) {
  const top = r.matches[0];
  if (top && top.score > 0.25) withMatch++;
  totalCandidates += r.matches.length;
  const topStr = top ? `${top.folder.slice(0,50)} (${top.score.toFixed(2)}·${top.photos}img)` : '(no candidates)';
  console.log(`${r.sku.padEnd(16)} | ${r.title.slice(0,44).padEnd(44)} | ${topStr}`);
}
console.log('─'.repeat(140));
console.log();
console.log(`SKUs with high-confidence match (score > 0.25): ${withMatch} of ${recsNoPhoto.length}`);
console.log(`Total folder candidates explored: ${totalCandidates}`);

fs.writeFileSync('/tmp/wenu-photo-disk-match.json', JSON.stringify(results, null, 2));
console.log();
console.log('Persisted: /tmp/wenu-photo-disk-match.json');
