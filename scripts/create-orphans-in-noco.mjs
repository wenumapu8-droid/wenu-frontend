#!/usr/bin/env node
/**
 * create-orphans-in-noco.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Crea en NocoDB Piezas los productos que existen en WC pero no en NocoDB
 * (orphans WC-only), usando los datos públicos de WC + defaults conservadores.
 *
 * Política definida por Ocin 2026-06-04:
 *   "ve si en noco está primero, si no está agregalo igual para cualquier producto"
 *
 * Modo dry-run por default. --apply para escribir realmente.
 * Backup snapshot completo de NocoDB Piezas antes de cualquier escritura.
 *
 * Estado inicial de cada record nuevo:
 *   Estado=PENDIENTE_REVISION  (Ocin tiene que pasar y completar Peso g + Categoría definitiva)
 *   Descripción interna="[CARGADO AUTO desde WC orphan 2026-06-04 — verificar datos]" + lo que haya en WC
 *
 * USO
 *   node scripts/create-orphans-in-noco.mjs                # dry-run
 *   node scripts/create-orphans-in-noco.mjs --apply --confirm
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const CONFIRM = args.includes('--confirm');
if (APPLY && !CONFIRM) { console.error('--apply requires --confirm. Run without flags for dry-run.'); process.exit(1); }

// Read env
const env = {};
const envTxt = fs.readFileSync(path.join(os.homedir(),'wenu-agent-hub/.env'),'utf8');
for (const line of envTxt.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) env[m[1]] = m[2].trim();
}
const { NOCODB_URL, NOCODB_TABLE, NOCODB_TOKEN, WOOCOMMERCE_URL, WOOCOMMERCE_KEY, WOOCOMMERCE_SECRET } = env;

// Orphans to create (the 3 we have data for; the 3 NOT FOUND on WC are skipped)
const TARGETS = ['WM-CARE-001', 'WM-SEP-008', 'WM-WOO-593'];

// Manual override map for fields we can't infer perfectly from WC
const OVERRIDES = {
  'WM-CARE-001': {
    'Categoría': 'Other',
    'Línea': 'Aftercare',
    'Material': 'N/A',
    'Peso g': 280,  // estimated: 7.4oz (211g sterile + envase) ≈ 280g
    'Unidad de venta': 'Single',
    'Threading': 'N/A',
    'Subtipo piercing': 'N/A',
    'Descripción interna': 'Recovery brand sterile saline spray. 7.4oz (211g). Sterile, gentle, preservative-free, drug-free. Gift with every piercing appointment at the Truckee studio. Also sold à la carte.',
  },
  'WM-SEP-008': {
    'Categoría': 'Septum',
    'Línea': 'Origin',
    'Material': 'Titanium',
    'Peso g': 2,  // typical septum clicker ≈ 1.5-2.5g
    'Unidad de venta': 'Single',
    'Threading': 'N/A',
    'Subtipo piercing': 'Septum',
    'Descripción interna': 'Silver multi-ring titanium clicker septum, 10mm. Internally threaded. Multi-loop architectural design. URGENT: WC permalink currently points to /producto/ring-wm-rng-001/ — slug needs fix.',
  },
  'WM-WOO-593': {
    'Categoría': 'Plug',
    'Línea': 'Orgánico',
    'Material': 'Walnut wood',
    'Peso g': 12,  // typical wood gauges 12-20g
    'Unidad de venta': 'Pair',
    'Threading': 'Saddle',
    'Subtipo piercing': 'Lobe',
    'Descripción interna': 'Certified walnut wood ear gauges. WARNING: WC photo is incorrect (shows a silver septum clicker, not the actual wood gauges). Photo needs replacement before publishing.',
  },
};

const wcAuth = 'Basic ' + Buffer.from(WOOCOMMERCE_KEY + ':' + WOOCOMMERCE_SECRET).toString('base64');

console.log(`Mode: ${APPLY ? '*** APPLY ***' : 'DRY-RUN'}`);
console.log();

// 1. Backup NocoDB current state
console.log('Step 1: Fetching current NocoDB state for backup…');
const ncList = await fetch(`${NOCODB_URL}/api/v2/tables/${NOCODB_TABLE}/records?limit=300`,
  { headers: { 'xc-token': NOCODB_TOKEN } }).then(r => r.json());
const noco = ncList.list || [];
console.log(`  ${noco.length} records currently in NocoDB`);

if (APPLY) {
  const backupDir = path.join(os.homedir(), 'wenu-agent-hub/data/backups',
    `noco-create-orphans-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  fs.mkdirSync(backupDir, { recursive: true });
  fs.writeFileSync(path.join(backupDir, 'noco-snapshot.json'), JSON.stringify(noco, null, 2));
  console.log(`  Backup → ${backupDir}/noco-snapshot.json`);
}
console.log();

// 2. Build payloads per target
const existingSkus = new Set(noco.map(r => r.SKU));
const payloads = [];

for (const sku of TARGETS) {
  if (existingSkus.has(sku)) {
    console.log(`SKIP ${sku} — already exists in NocoDB`);
    continue;
  }
  // Get WC data
  const wcRes = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products?sku=${encodeURIComponent(sku)}`,
    { headers: { Authorization: wcAuth } }).then(r => r.json());
  if (!Array.isArray(wcRes) || wcRes.length === 0) {
    console.log(`SKIP ${sku} — not found in WC either`);
    continue;
  }
  const wp = wcRes[0];
  const ov = OVERRIDES[sku] || {};

  const payload = {
    'SKU': sku,
    'Title': wp.name.replace(/&amp;/g, '&').replace(/\s*\|\s*WM-.+$/, '').trim(),
    'Nombre interno': wp.name.replace(/&amp;/g, '&').replace(/\s*\|\s*WM-.+$/, '').trim(),
    'Precio venta USD': parseFloat(wp.price) || parseFloat(wp.regular_price) || 0,
    'Cantidad stock': wp.stock_quantity ?? (wp.stock_status === 'instock' ? 1 : 0),
    'Costo USD': 0,
    'Estado': 'PENDIENTE_REVISION',
    'Ubicación vitrina': 'TBD',
    ...ov,
  };
  payloads.push({ sku, payload, wpData: { id: wp.id, status: wp.status, permalink: wp.permalink, image: wp.images?.[0]?.src } });
}

console.log(`\n=== Plan: CREATE ${payloads.length} new NocoDB records ===\n`);
for (const { sku, payload, wpData } of payloads) {
  console.log(`▸ ${sku}  (WC id=${wpData.id}, current status=${wpData.status})`);
  console.log(`    Title:     ${payload.Title}`);
  console.log(`    Price:     $${payload['Precio venta USD']}`);
  console.log(`    Stock:     ${payload['Cantidad stock']}`);
  console.log(`    Peso g:    ${payload['Peso g']}  (estimated)`);
  console.log(`    Categoría: ${payload['Categoría']}`);
  console.log(`    Línea:     ${payload['Línea']}`);
  console.log(`    Material:  ${payload['Material']}`);
  console.log(`    Estado:    ${payload['Estado']}`);
  console.log(`    Desc:      ${payload['Descripción interna'].slice(0, 110)}...`);
  console.log();
}

if (!APPLY) {
  console.log('This was a DRY-RUN. To apply for real:');
  console.log('  node scripts/create-orphans-in-noco.mjs --apply --confirm');
  process.exit(0);
}

// 3. APPLY
console.log('=== APPLYING ===');
let created = 0, errored = 0;
for (const { sku, payload } of payloads) {
  try {
    const r = await fetch(`${NOCODB_URL}/api/v2/tables/${NOCODB_TABLE}/records`, {
      method: 'POST',
      headers: { 'xc-token': NOCODB_TOKEN, 'Content-Type': 'application/json' },
      body: JSON.stringify([payload]),
    }).then(r => r.json());
    if (Array.isArray(r) && r[0]?.Id) {
      console.log(`  ✅ ${sku} → NocoDB Id=${r[0].Id}`);
      created++;
    } else {
      console.log(`  ❌ ${sku}: ${JSON.stringify(r).slice(0, 200)}`);
      errored++;
    }
  } catch (e) {
    console.log(`  ❌ ${sku}: ${e.message}`);
    errored++;
  }
}

console.log();
console.log(`Summary: created=${created}, errored=${errored}`);
