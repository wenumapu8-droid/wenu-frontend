#!/usr/bin/env node
// apply-labret-color-merge-2026-07-16.mjs
// Consolida 4 productos simples de labret round cabochon 16G silver-tone
// en 1 producto variable por Color. Hace verify GET al final.

import fs from 'node:fs';
import path from 'node:path';

const FE_ENV = '/Users/user1/wenu-frontend/.env';
const WC_BASE = 'https://www.wenumapuonline.com';
const LOG_DIR = '/Users/user1/wenu-frontend/logs';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const CANONICAL_ID = 2434;
const PARENT_SKU = 'WM-PRC-037-parent';
const PARENT_NAME = 'Titanium Round Cabochon Labret 16G (Silver-tone)';
const PARENT_SHORT = '<p>Choose your stone color.</p>';
const COLOR_OPTIONS = ['Pink Opal', 'Champagne CZ', 'Green Fire Opal', 'Aurora Opal'];
const PARENT_GALLERY_IDS = [2688, 2615, 2840, 2614, 2841, 2612];

const FAMILY = [
  { id: 2425, sku: 'WM-PRC-028', legacySku: 'WM-PRC-028-legacy-dup', color: 'Pink Opal', price: '30', imageId: 2688 },
  { id: 2431, sku: 'WM-PRC-034', legacySku: 'WM-PRC-034-legacy-dup', color: 'Champagne CZ', price: '25', imageId: 2615 },
  { id: 2432, sku: 'WM-PRC-035', legacySku: 'WM-PRC-035-legacy-dup', color: 'Green Fire Opal', price: '30', imageId: 2840 },
  { id: 2434, sku: 'WM-PRC-037', legacySku: null, color: 'Aurora Opal', price: '30', imageId: 2612, canonical: true },
];

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

function briefProduct(p) {
  return {
    id: p.id,
    sku: p.sku,
    name: p.name,
    type: p.type,
    status: p.status,
    price: p.price,
    image_count: (p.images || []).length,
    attributes: (p.attributes || []).map(a => ({ name: a.name, options: a.options, variation: a.variation })),
  };
}

function briefVariation(v) {
  return {
    id: v.id,
    sku: v.sku,
    status: v.status,
    price: v.price,
    stock_status: v.stock_status,
    option: (v.attributes || []).map(a => a.option).join(' / '),
    image_id: v.image?.id || null,
  };
}

(async () => {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const log = { started_at: new Date().toISOString(), steps: [], before: {}, after: {} };

  const beforeProducts = {};
  for (const row of FAMILY) {
    const p = await wc('GET', `products/${row.id}`);
    beforeProducts[row.id] = briefProduct(p);
    if (row.canonical) {
      if (p.status !== 'publish') throw new Error(`Canonical ${row.id} no está publish`);
      if (p.type !== 'simple') throw new Error(`Canonical ${row.id} no está simple`);
      if (p.sku !== row.sku) throw new Error(`Canonical SKU inesperado: ${p.sku}`);
    } else {
      if (p.status !== 'publish') throw new Error(`Duplicate ${row.id} no está publish`);
      if (p.sku !== row.sku) throw new Error(`Duplicate SKU inesperado en ${row.id}: ${p.sku}`);
    }
  }
  log.before.products = beforeProducts;

  // 1) liberar SKU del parent futuro
  const step1 = await wc('PUT', `products/${CANONICAL_ID}`, {
    sku: PARENT_SKU,
    name: PARENT_NAME,
    short_description: PARENT_SHORT,
  });
  log.steps.push({ step: 'parent-temp-sku-and-name', result: briefProduct(step1) });

  // 2) liberar SKUs de los duplicados
  for (const row of FAMILY.filter(x => !x.canonical)) {
    const updated = await wc('PUT', `products/${row.id}`, { status: 'draft', sku: row.legacySku });
    log.steps.push({ step: 'archive-duplicate', id: row.id, result: briefProduct(updated) });
  }

  // 3) convertir parent a variable + galería + atributo Color
  const step3 = await wc('PUT', `products/${CANONICAL_ID}`, {
    type: 'variable',
    sku: PARENT_SKU,
    name: PARENT_NAME,
    short_description: PARENT_SHORT,
    attributes: [
      { name: 'Color', visible: true, variation: true, options: COLOR_OPTIONS }
    ],
    images: PARENT_GALLERY_IDS.map(id => ({ id })),
  });
  log.steps.push({ step: 'parent-variable', result: briefProduct(step3) });

  // 4) crear variaciones
  for (const row of FAMILY) {
    const created = await wc('POST', `products/${CANONICAL_ID}/variations`, {
      regular_price: row.price,
      sku: row.sku,
      status: 'publish',
      stock_status: 'instock',
      manage_stock: false,
      image: { id: row.imageId },
      attributes: [{ name: 'Color', option: row.color }],
    });
    log.steps.push({ step: 'create-variation', color: row.color, result: briefVariation(created) });
  }

  // 5) verificación
  const parentAfter = await wc('GET', `products/${CANONICAL_ID}`);
  const varsAfter = await wc('GET', `products/${CANONICAL_ID}/variations?per_page=100`);
  const duplicatesAfter = [];
  for (const row of FAMILY.filter(x => !x.canonical)) {
    duplicatesAfter.push(await wc('GET', `products/${row.id}`));
  }

  log.after.parent = briefProduct(parentAfter);
  log.after.variations = varsAfter.map(briefVariation);
  log.after.duplicates = duplicatesAfter.map(briefProduct);
  log.finished_at = new Date().toISOString();

  const logfile = path.join(LOG_DIR, `apply-labret-color-merge-${ts()}.json`);
  fs.writeFileSync(logfile, JSON.stringify(log, null, 2));

  console.log(JSON.stringify({
    parent_after: log.after.parent,
    variations_after: log.after.variations,
    duplicates_after: log.after.duplicates,
    log_path: logfile,
  }, null, 2));
})();
