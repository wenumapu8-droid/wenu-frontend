#!/usr/bin/env node
/**
 * sync-to-wc.mjs
 *
 * Syncs products from NocoDB → WooCommerce.
 * Safe by default: dry-run, status=draft, backup before any change.
 *
 * Required env:
 *   NOCODB_TOKEN       — xc-token API key
 *   WOOCOMMERCE_URL    — e.g. https://www.wenumapuonline.com
 *   WOOCOMMERCE_KEY    — WC consumer key
 *   WOOCOMMERCE_SECRET — WC consumer secret
 *
 * Reads .env from ~/wenu-agent-hub/.env automatically if env vars missing.
 *
 * Usage:
 *   # Dry-run all products (default — never modifies WC):
 *   node scripts/sync-to-wc.mjs
 *
 *   # Dry-run a single SKU with detail:
 *   node scripts/sync-to-wc.mjs --sku WM-HAN-001
 *
 *   # Apply (REQUIRES --apply AND --confirm):
 *   node scripts/sync-to-wc.mjs --apply --confirm --sku WM-HAN-001
 *   node scripts/sync-to-wc.mjs --apply --confirm  # ALL (dangerous)
 *
 *   # Filter:
 *   node scripts/sync-to-wc.mjs --only-with-photo
 *   node scripts/sync-to-wc.mjs --only-status READY
 *   node scripts/sync-to-wc.mjs --skip-existing  (don't update products already in WC)
 *   node scripts/sync-to-wc.mjs --vegas-filter    (8 hard criteria + Estado=READY — recommended pre-Vegas)
 *
 * Always creates products as status=draft. You publish manually in wp-admin.
 * Always backups the WC state of every product touched before modifying.
 *
 * Field mapping (NocoDB → WC):
 *   Title / Nombre interno  → name
 *   SKU                     → sku
 *   Precio venta USD        → regular_price
 *   Cantidad stock          → stock_quantity (manage_stock=true)
 *   Peso g                  → weight (DIVIDED by 1000 — WC store unit is kg)
 *   Categoría (vía prefix)  → categories
 *   Descripción ritual/int. → description
 *   Nombre ritual           → short_description
 *   (meta) Origen           → _wenu_origin (default 'imported-curated')
 *   (meta) Material         → _wenu_material
 *   (meta) Línea            → _wenu_linea
 *   (meta) Peso g raw       → _wenu_peso_g (preserved for reference)
 *   (meta) Noco Id          → _wenu_noco_id
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(fs.readFileSync(import.meta.url.replace('file://',''), 'utf8').split('\n').slice(1, 35).join('\n'));
  process.exit(0);
}

const flag = (k, def) => {
  const i = args.indexOf(k);
  return i >= 0 ? args[i+1] : def;
};
const has = k => args.includes(k);

const APPLY = has('--apply');
const CONFIRM = has('--confirm');
const SKU_FILTER = flag('--sku');
const ONLY_PHOTO = has('--only-with-photo');
const ONLY_STATUS = flag('--only-status');
const SKIP_EXISTING = has('--skip-existing');
// VEGAS FILTER (Ocin 2026-06-04 pre-Vegas): aplica los 8 criterios duros
// definidos por el dueño antes de tocar WC. Filtra por:
//   1. Title o Nombre interno (no vacío)
//   2. SKU (no vacío)
//   3. Precio venta USD > 0
//   4. Cantidad stock no-null (puede ser 0)
//   5. Foto macro (al menos 1 imagen real)
//   6. Descripción interna (no vacía)
//   7. Categoría (no vacía)
//   8. Peso g (no-null, gramos — se convierte a kg en payload WC)
// + Estado === 'READY' (certificación visual del dueño)
const VEGAS_FILTER = has('--vegas-filter');

if (APPLY && !CONFIRM) {
  console.error('ERROR: --apply requires --confirm to actually modify WC.');
  console.error('Run without --apply to see dry-run first.');
  process.exit(1);
}

// Read env from .env files if not set
function readEnv() {
  if (process.env.WOOCOMMERCE_URL && process.env.WOOCOMMERCE_KEY) return;
  const envPath = path.join(os.homedir(), 'wenu-agent-hub/.env');
  if (!fs.existsSync(envPath)) return;
  const text = fs.readFileSync(envPath, 'utf8');
  for (const line of text.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
readEnv();

const WC_URL = process.env.WOOCOMMERCE_URL;
const WC_KEY = process.env.WOOCOMMERCE_KEY;
const WC_SECRET = process.env.WOOCOMMERCE_SECRET;
const NC_TOKEN = process.env.NOCODB_TOKEN;
const NC_URL = process.env.NOCODB_URL || 'http://localhost:8080';
const NC_TABLE = process.env.NOCODB_TABLE || 'm5s3jnm72tzhk9g';

if (!WC_URL || !WC_KEY || !WC_SECRET) {
  console.error('ERROR: WC credentials missing. Set WOOCOMMERCE_URL / WOOCOMMERCE_KEY / WOOCOMMERCE_SECRET.');
  process.exit(2);
}
if (!NC_TOKEN) {
  console.error('ERROR: NOCODB_TOKEN required.');
  process.exit(2);
}

const wcAuth = 'Basic ' + Buffer.from(WC_KEY+':'+WC_SECRET).toString('base64');

const SKU_PREFIX_TO_CAT = {
  HAN: [{id:74}, {id:430}],
  PLG: [{id:68}],
  RNG: [{id:84}],
  LAB: [{id:80}],
  SEP: [{id:426}],
  SAD: [{id:72}],
  TUN: [{id:68}, {id:58}],
  EAR: [{id:427}, {id:430}],
  PRC: [{id:174}],
  NCK: [{id:86}],
  AMU: [{id:431}],
  OTH: [{id:345}],
};

const slugify = s => (s||'').toLowerCase()
  .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
  .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);

const normSku = s => (s||'').toUpperCase().replace(/_(front|back|detail|angle|macro|lifestyle|card|pair|v\d+)$/i,'');

console.log('[sync-to-wc] mode:', APPLY ? '*** APPLY ***' : 'DRY-RUN');
console.log();

// Fetch NocoDB — paginated (max 100 per page in v2 API)
console.log('Fetching NocoDB…');
async function fetchNocoPage(offset, tries = 10) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(`${NC_URL}/api/v2/tables/${NC_TABLE}/records?limit=100&offset=${offset}`,
        { headers: { 'xc-token': NC_TOKEN } });
      if (r.ok) return (await r.json()).list || [];
    } catch {}
    await new Promise(rr => setTimeout(rr, 1500 * (i + 1)));
  }
  throw new Error(`NocoDB page ${offset} failed after ${tries} tries`);
}
let noco = [];
for (let off = 0; off < 1000; off += 100) {
  const page = await fetchNocoPage(off);
  if (page.length === 0) break;
  noco = noco.concat(page);
  if (page.length < 100) break;
  await new Promise(r => setTimeout(r, 800));
}
console.log(`  ${noco.length} products in NocoDB`);

// Fetch WC — including trash (orphan SKUs from past failed syncs block CREATE
// with "already in lookup table" errors. We treat trashed records as UPDATE
// targets and restore them to draft.)
console.log('Fetching WC (publish/draft/private/pending + trash)…');
let wc = [];
// status=any covers publish/draft/private/pending but NOT trash
for (let page=1; page<=10; page++) {
  const b = await fetch(`${WC_URL}/wp-json/wc/v3/products?per_page=100&status=any&page=${page}`, {
    headers: {Authorization: wcAuth}
  }).then(r => r.json());
  if (!Array.isArray(b) || b.length === 0) break;
  wc = wc.concat(b);
  if (b.length < 100) break;
}
const liveCount = wc.length;
for (let page=1; page<=5; page++) {
  const b = await fetch(`${WC_URL}/wp-json/wc/v3/products?per_page=100&status=trash&page=${page}`, {
    headers: {Authorization: wcAuth}
  }).then(r => r.json());
  if (!Array.isArray(b) || b.length === 0) break;
  wc = wc.concat(b);
  if (b.length < 100) break;
}
console.log(`  ${liveCount} live + ${wc.length - liveCount} in trash = ${wc.length} total in WC`);

const wcByNormSku = {};
for (const p of wc) {
  // SKU in trash often has trailing whitespace padding — trim before indexing
  const k = normSku((p.sku || '').trim());
  if (k) (wcByNormSku[k] = wcByNormSku[k] || []).push(p);
}

// Filter NocoDB records
let candidates = noco;
if (SKU_FILTER) candidates = candidates.filter(r => r.SKU === SKU_FILTER);
if (ONLY_PHOTO) candidates = candidates.filter(r => Array.isArray(r['Foto macro']) && r['Foto macro'].length);
if (ONLY_STATUS) candidates = candidates.filter(r => r['Estado'] === ONLY_STATUS);

// Vegas filter — 8 hard criteria + Estado=READY
if (VEGAS_FILTER) {
  const isStr = v => typeof v === 'string' && v.trim().length > 0;
  const hasNum = v => typeof v === 'number' && Number.isFinite(v);
  const hasPhoto = v => Array.isArray(v) && v.length > 0 && v[0]?.path;
  const before = candidates.length;
  candidates = candidates.filter(r =>
    (isStr(r.Title) || isStr(r['Nombre interno'])) &&
    isStr(r.SKU) &&
    hasNum(r['Precio venta USD']) && r['Precio venta USD'] > 0 &&
    r['Cantidad stock'] != null &&
    hasPhoto(r['Foto macro']) &&
    isStr(r['Descripción interna']) &&
    isStr(r['Categoría']) &&
    hasNum(r['Peso g']) &&
    r['Estado'] === 'READY'
  );
  console.log(`[vegas-filter] ${before} → ${candidates.length} after hard 8-criteria + Estado=READY`);
}

console.log();
console.log(`Filtered: ${candidates.length} candidates`);
console.log();

// Backup current WC state of affected products
if (APPLY) {
  const backupDir = path.join(os.homedir(), 'wenu-agent-hub/data/backups', `wc-sync-${new Date().toISOString().replace(/[:.]/g,'-')}`);
  fs.mkdirSync(backupDir, {recursive: true});
  const affected = candidates.flatMap(r => wcByNormSku[normSku(r.SKU)] || []);
  fs.writeFileSync(path.join(backupDir, 'wc-state.json'), JSON.stringify(affected, null, 2));
  console.log(`Backup → ${backupDir}/wc-state.json (${affected.length} products)`);
  console.log();
}

let created = 0, updated = 0, skipped = 0, errored = 0;

for (const rec of candidates) {
  const sku = rec.SKU;
  const matches = wcByNormSku[normSku(sku)] || [];
  const exists = matches.length > 0;

  if (exists && SKIP_EXISTING) { skipped++; continue; }

  const name = rec.Title || rec['Nombre interno'] || sku;
  const prefix = (sku.split('-')[1] || '');

  // Weight conversion: NocoDB stores grams, WC store unit is kg (verified
  // 2026-06-04 via wp-json/wc/v3/settings/products). Convert /1000.
  const pesoG = typeof rec['Peso g'] === 'number' ? rec['Peso g'] : null;
  const weightKg = pesoG != null ? (pesoG / 1000).toFixed(4) : '';

  // Origen canon (Ocin rule): default 'imported-curated' to NEVER claim
  // handmade on imported pieces. The handful of actually-handmade pieces
  // (Ortega rings — WM-RNG-001/002/007/008) must be flipped manually.
  const origen = rec['Origen'] || 'imported-curated';

  // SAFETY 2026-06-04: payload differs on CREATE vs UPDATE.
  // - CREATE: sets status='draft' + slug (we own the URL from scratch)
  // - UPDATE (live product): NEVER sends status or slug. Keeping current
  //   WC values prevents silent un-publishing of live products and avoids
  //   breaking established permalinks / shared links / SEO.
  // - UPDATE (trashed product): sends status='draft' to RESTORE the record
  //   from trash. Otherwise the record stays in the bin and the sync is
  //   effectively a no-op for that SKU.
  const existingStatus = exists ? matches[0].status : null;
  const isTrashed = existingStatus === 'trash';
  const commonPayload = {
    name,
    sku,
    type: 'simple',
    regular_price: String(rec['Precio venta USD'] || ''),
    short_description: rec['Nombre ritual'] || '',
    description: rec['Descripción ritual'] || rec['Descripción interna'] || '',
    categories: SKU_PREFIX_TO_CAT[prefix] || [],
    manage_stock: rec['Cantidad stock'] != null,
    stock_quantity: rec['Cantidad stock'] || null,
    weight: weightKg,
    meta_data: [
      { key: '_wenu_noco_id', value: String(rec.Id) },
      { key: '_wenu_material', value: Array.isArray(rec.Material)?rec.Material.join(','):(rec.Material||'') },
      { key: '_wenu_linea', value: rec['Línea'] || '' },
      { key: '_wenu_origin', value: origen },
      { key: '_wenu_peso_g', value: pesoG != null ? String(pesoG) : '' },
    ],
  };
  const payload = exists
    ? (isTrashed ? { ...commonPayload, status: 'draft' } : commonPayload)
    : { ...commonPayload, slug: slugify(name), status: 'draft' };

  const action = exists ? (isTrashed ? 'RESTORE' : 'UPDATE ') : 'CREATE ';
  console.log(`${action} ${sku.padEnd(15)} ${name.slice(0,38).padEnd(38)} $${String(rec['Precio venta USD']||'-').padStart(4)} stock=${String(rec['Cantidad stock']??'-').padStart(2)} w=${String(weightKg||'-').padStart(7)}kg origen=${origen}`);

  if (!APPLY) continue;

  try {
    if (exists) {
      const wcId = matches[0].id;
      const r = await fetch(`${WC_URL}/wp-json/wc/v3/products/${wcId}`, {
        method: 'PUT',
        headers: {Authorization: wcAuth, 'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      }).then(r => r.json());
      if (r.id) updated++; else { console.log('  ERR', r.message||JSON.stringify(r).slice(0,80)); errored++; }
    } else {
      const r = await fetch(`${WC_URL}/wp-json/wc/v3/products`, {
        method: 'POST',
        headers: {Authorization: wcAuth, 'Content-Type': 'application/json'},
        body: JSON.stringify(payload),
      }).then(r => r.json());
      if (r.id) created++; else { console.log('  ERR', r.message||JSON.stringify(r).slice(0,80)); errored++; }
    }
  } catch(e) { console.log('  ERR', e.message); errored++; }
}

console.log();
console.log('--- Summary ---');
console.log(`created: ${created}, updated: ${updated}, skipped: ${skipped}, errored: ${errored}`);
if (!APPLY) {
  console.log();
  console.log('This was a DRY-RUN. To apply for real:');
  console.log('  node scripts/sync-to-wc.mjs --apply --confirm   # ALL');
  console.log('  node scripts/sync-to-wc.mjs --apply --confirm --sku WM-XXX-001   # one');
}
