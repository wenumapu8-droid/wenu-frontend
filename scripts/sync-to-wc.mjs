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
 *
 * Always creates products as status=draft. You publish manually in wp-admin.
 * Always backups the WC state of every product touched before modifying.
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
  OTH: [],
};

const slugify = s => (s||'').toLowerCase()
  .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
  .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
  .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,80);

const normSku = s => (s||'').toUpperCase().replace(/_(front|back|detail|angle|macro|lifestyle|card|pair|v\d+)$/i,'');

console.log('[sync-to-wc] mode:', APPLY ? '*** APPLY ***' : 'DRY-RUN');
console.log();

// Fetch NocoDB
console.log('Fetching NocoDB…');
const nrec = await fetch(`${NC_URL}/api/v2/tables/${NC_TABLE}/records?limit=200`, {
  headers: {'xc-token': NC_TOKEN}
}).then(r => r.json());
const noco = nrec.list || [];
console.log(`  ${noco.length} products in NocoDB`);

// Fetch WC
console.log('Fetching WC…');
let wc = [];
for (let page=1; page<=10; page++) {
  const b = await fetch(`${WC_URL}/wp-json/wc/v3/products?per_page=100&status=any&page=${page}`, {
    headers: {Authorization: wcAuth}
  }).then(r => r.json());
  if (!Array.isArray(b) || b.length === 0) break;
  wc = wc.concat(b);
  if (b.length < 100) break;
}
console.log(`  ${wc.length} products in WC`);

const wcByNormSku = {};
for (const p of wc) {
  const k = normSku(p.sku);
  if (k) (wcByNormSku[k] = wcByNormSku[k] || []).push(p);
}

// Filter NocoDB records
let candidates = noco;
if (SKU_FILTER) candidates = candidates.filter(r => r.SKU === SKU_FILTER);
if (ONLY_PHOTO) candidates = candidates.filter(r => Array.isArray(r['Foto macro']) && r['Foto macro'].length);
if (ONLY_STATUS) candidates = candidates.filter(r => r['Estado'] === ONLY_STATUS);

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

  const payload = {
    name,
    sku,
    slug: slugify(name),
    type: 'simple',
    status: 'draft',  // ALWAYS draft. Owner publishes manually.
    regular_price: String(rec['Precio venta USD'] || ''),
    short_description: rec['Nombre ritual'] || '',
    description: rec['Descripción ritual'] || rec['Descripción interna'] || '',
    categories: SKU_PREFIX_TO_CAT[prefix] || [],
    manage_stock: rec['Cantidad stock'] != null,
    stock_quantity: rec['Cantidad stock'] || null,
    meta_data: [
      { key: '_wenu_noco_id', value: String(rec.Id) },
      { key: '_wenu_material', value: Array.isArray(rec.Material)?rec.Material.join(','):(rec.Material||'') },
      { key: '_wenu_linea', value: rec['Línea'] || '' },
    ],
  };

  const action = exists ? 'UPDATE' : 'CREATE';
  console.log(`${action} ${sku.padEnd(15)} ${name.slice(0,40)} $${rec['Precio venta USD']||'-'}`);

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
