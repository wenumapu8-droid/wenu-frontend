#!/usr/bin/env node
// fix-septum-duplicate-2026-07-16.mjs
// Objetivo: dejar como canónico el producto variable WM-SEP-008 (#1828)
// y sacar el duplicado publish WM-SEP-002 (#2055), reasignando el SKU de la variación dorada.
//
// DRY-RUN por default. Usar --apply para escribir.

import fs from 'node:fs';
import path from 'node:path';

const FE_ENV = '/Users/user1/wenu-frontend/.env';
const WC_BASE = 'https://www.wenumapuonline.com';
const LOG_DIR = '/Users/user1/wenu-frontend/logs';
const APPLY = process.argv.includes('--apply');
const MODE = APPLY ? 'APPLY' : 'DRY-RUN';

const PARENT_ID = 1828; // WM-SEP-008 canonical variable parent
const DUPLICATE_ID = 2055; // WM-SEP-002 duplicate simple product
const EXPECTED = {
  parentSku: 'WM-SEP-008',
  duplicateSku: 'WM-SEP-002',
  goldOption: 'Gold 8mm',
  silverOption: 'Silver 10mm'
};

function loadEnv(p) {
  const out = {};
  for (const line of fs.readFileSync(p, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

const env = loadEnv(FE_ENV);
const qp = new URLSearchParams({ consumer_key: env.WC_CONSUMER_KEY, consumer_secret: env.WC_CONSUMER_SECRET });
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

async function wc(method, endpoint, body) {
  const url = `${WC_BASE}/wp-json/wc/v3/${endpoint}${endpoint.includes('?') ? '&' : '?'}${qp}`;
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json', 'User-Agent': UA },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${endpoint} -> ${res.status} ${text.slice(0, 500)}`);
  return text ? JSON.parse(text) : null;
}

function ts() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

function summarizeProduct(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    slug: p.slug,
    type: p.type,
    status: p.status,
    price: p.price,
    image_count: (p.images || []).length,
    attributes: (p.attributes || []).map(a => ({ name: a.name, variation: a.variation, options: a.options })),
    permalink: p.permalink,
  };
}

function summarizeVariation(v) {
  return {
    id: v.id,
    sku: v.sku,
    status: v.status,
    price: v.price,
    stock_status: v.stock_status,
    option: (v.attributes || []).map(a => a.option).join(' / '),
    image_id: v.image?.id || null,
    image_name: v.image?.name || null,
  };
}

(async () => {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const log = { started_at: new Date().toISOString(), mode: MODE, evidence: {}, actions: [] };

  const parent = await wc('GET', `products/${PARENT_ID}`);
  const duplicate = await wc('GET', `products/${DUPLICATE_ID}`);
  const variations = await wc('GET', `products/${PARENT_ID}/variations?per_page=100`);

  log.evidence.parent_before = summarizeProduct(parent);
  log.evidence.duplicate_before = summarizeProduct(duplicate);
  log.evidence.variations_before = variations.map(summarizeVariation);

  if (parent.sku !== EXPECTED.parentSku) throw new Error(`Parent SKU inesperado: ${parent.sku}`);
  if (duplicate.sku !== EXPECTED.duplicateSku) throw new Error(`Duplicate SKU inesperado: ${duplicate.sku}`);
  if (parent.type !== 'variable') throw new Error(`Parent ${PARENT_ID} no es variable`);
  if (duplicate.status !== 'publish') throw new Error(`Duplicate ${DUPLICATE_ID} ya no está publish; revisar manualmente`);

  const gold = variations.find(v => (v.attributes || []).some(a => a.option === EXPECTED.goldOption));
  const silver = variations.find(v => (v.attributes || []).some(a => a.option === EXPECTED.silverOption));
  if (!gold) throw new Error(`No encontré variación ${EXPECTED.goldOption}`);
  if (!silver) throw new Error(`No encontré variación ${EXPECTED.silverOption}`);

  const plan = [
    {
      label: 'duplicate simple -> draft + legacy sku',
      endpoint: `products/${DUPLICATE_ID}`,
      body: { status: 'draft', sku: 'WM-SEP-002-legacy-dup' },
      dry_run_note: `Producto simple duplicado ${DUPLICATE_ID} pasaría a draft y liberaría el SKU WM-SEP-002`
    },
    {
      label: 'variation gold sku -> WM-SEP-002',
      endpoint: `products/${PARENT_ID}/variations/${gold.id}`,
      body: { sku: 'WM-SEP-002' },
      dry_run_note: `Variación ${gold.id} (${EXPECTED.goldOption}) pasaría de sku=${gold.sku} a sku=WM-SEP-002`
    },
    {
      label: 'variation silver sku -> WM-SEP-008',
      endpoint: `products/${PARENT_ID}/variations/${silver.id}`,
      body: { sku: 'WM-SEP-008' },
      dry_run_note: `Variación ${silver.id} (${EXPECTED.silverOption}) quedaría sku=WM-SEP-008`
    }
  ];

  console.log(`\n=== fix-septum-duplicate-2026-07-16 [${MODE}] ===\n`);
  console.log('Parent:', JSON.stringify(summarizeProduct(parent), null, 2));
  console.log('Duplicate:', JSON.stringify(summarizeProduct(duplicate), null, 2));
  console.log('Variations before:', JSON.stringify(variations.map(summarizeVariation), null, 2));
  console.log('\nPlanned actions:');

  for (const step of plan) {
    const item = { label: step.label, endpoint: step.endpoint, body: step.body, result: APPLY ? 'pending' : 'planned' };
    if (APPLY) {
      const updated = await wc('PUT', step.endpoint, step.body);
      item.result = 'ok';
      item.after = step.endpoint.includes('/variations/') ? summarizeVariation(updated) : summarizeProduct(updated);
    } else {
      item.note = step.dry_run_note;
    }
    log.actions.push(item);
    console.log(`- [${item.result}] ${step.label}`);
    if (!APPLY) console.log(`  ${step.dry_run_note}`);
  }

  if (APPLY) {
    const parentAfter = await wc('GET', `products/${PARENT_ID}`);
    const duplicateAfter = await wc('GET', `products/${DUPLICATE_ID}`);
    const variationsAfter = await wc('GET', `products/${PARENT_ID}/variations?per_page=100`);
    log.evidence.parent_after = summarizeProduct(parentAfter);
    log.evidence.duplicate_after = summarizeProduct(duplicateAfter);
    log.evidence.variations_after = variationsAfter.map(summarizeVariation);
    console.log('\nVerification after apply:');
    console.log(JSON.stringify({
      parent_after: summarizeProduct(parentAfter),
      duplicate_after: summarizeProduct(duplicateAfter),
      variations_after: variationsAfter.map(summarizeVariation)
    }, null, 2));
  }

  log.finished_at = new Date().toISOString();
  const logfile = path.join(LOG_DIR, `fix-septum-duplicate-${ts()}.json`);
  fs.writeFileSync(logfile, JSON.stringify(log, null, 2));
  console.log(`\nLog: ${logfile}`);
  console.log(APPLY ? 'APPLY completo.' : 'Dry-run completo. Usar --apply para ejecutar.');
})();
