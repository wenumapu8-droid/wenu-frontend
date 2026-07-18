#!/usr/bin/env node
// dry-run-labret-color-merge-2026-07-16.mjs
// Familia: labret redondo titanio 16G silver-tone con variantes por color/piedra.
// No escribe nada. Solo inspecciona Woo y deja el plan exacto del merge.

import fs from 'node:fs';
import path from 'node:path';

const FE_ENV = '/Users/user1/wenu-frontend/.env';
const WC_BASE = 'https://www.wenumapuonline.com';
const LOG_DIR = '/Users/user1/wenu-frontend/logs';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15';

const FAMILY = [
  { id: 2425, sku: 'WM-PRC-028', color: 'Pink Opal', price: '30' },
  { id: 2431, sku: 'WM-PRC-034', color: 'Champagne CZ', price: '25' },
  { id: 2432, sku: 'WM-PRC-035', color: 'Green Fire Opal', price: '30' },
  { id: 2434, sku: 'WM-PRC-037', color: 'Aurora Opal', price: '30', canonical: true },
];
const CANONICAL_ID = 2434;
const PARENT_SKU = 'WM-PRC-037-parent';
const PARENT_NAME = 'Titanium Round Cabochon Labret 16G (Silver-tone)';
const PARENT_SHORT = '<p>Choose your stone color.</p>';

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

async function wc(endpoint) {
  const url = `${WC_BASE}/wp-json/wc/v3/${endpoint}${endpoint.includes('?') ? '&' : '?'}${qp}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const text = await res.text();
  if (!res.ok) throw new Error(`${endpoint} -> ${res.status} ${text.slice(0, 400)}`);
  return text ? JSON.parse(text) : null;
}

function uniqBy(arr, keyFn) {
  const seen = new Set();
  const out = [];
  for (const item of arr) {
    const k = keyFn(item);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function ts() {
  const d = new Date();
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}${p(d.getMonth() + 1)}${p(d.getDate())}-${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

(async () => {
  fs.mkdirSync(LOG_DIR, { recursive: true });
  const products = [];
  for (const row of FAMILY) {
    const p = await wc(`products/${row.id}`);
    products.push({
      id: p.id,
      sku: p.sku,
      name: p.name,
      slug: p.slug,
      status: p.status,
      type: p.type,
      price: p.price,
      short_description: p.short_description || '',
      description: p.description || '',
      images: (p.images || []).map(img => ({ id: img.id, name: img.name, src: img.src, alt: img.alt || '' })),
      categories: (p.categories || []).map(c => ({ id: c.id, name: c.name, slug: c.slug })),
      color: row.color,
      canonical: !!row.canonical,
    });
  }

  const canonical = products.find(p => p.id === CANONICAL_ID);
  if (!canonical) throw new Error('canonical not found');

  const parentGallery = uniqBy(
    products.flatMap(p => p.images.map((img, idx) => ({
      src: img.src,
      source_product_id: p.id,
      source_sku: p.sku,
      source_color: p.color,
      image_id: img.id,
      image_name: img.name,
      position_hint: idx,
    }))),
    x => x.src,
  );

  const variations = products.map(p => ({
    source_product_id: p.id,
    source_sku: p.sku,
    color: p.color,
    regular_price: p.price,
    stock_status: 'instock',
    planned_variation_sku: p.sku,
    hero_image: p.images[0] ? { id: p.images[0].id, src: p.images[0].src, name: p.images[0].name } : null,
  }));

  const archiveChildren = products
    .filter(p => p.id !== CANONICAL_ID)
    .map(p => ({
      id: p.id,
      current_sku: p.sku,
      planned_status: 'draft',
      planned_sku: `${p.sku}-legacy-dup`,
      reason: 'merge into canonical variable parent',
    }));

  const parentUpdate = {
    id: canonical.id,
    current_name: canonical.name,
    planned_name: PARENT_NAME,
    current_type: canonical.type,
    planned_type: 'variable',
    current_sku: canonical.sku,
    planned_sku: PARENT_SKU,
    current_status: canonical.status,
    planned_status: 'publish',
    current_image_count: canonical.images.length,
    planned_parent_gallery_count: parentGallery.length,
    planned_attribute: {
      name: 'Color',
      visible: true,
      variation: true,
      options: variations.map(v => v.color),
    },
    planned_short_description: PARENT_SHORT,
  };

  const dryRun = {
    generated_at: new Date().toISOString(),
    family_basis: 'Titanium Round * Labret 16G (Silver-tone) — same base product, color/piedra variants',
    canonical_choice: {
      id: canonical.id,
      sku: canonical.sku,
      reason: 'already approved as canonical in dup-3 and live product is publish with aurora-opal family naming',
    },
    source_products: products.map(p => ({
      id: p.id,
      sku: p.sku,
      name: p.name,
      status: p.status,
      type: p.type,
      price: p.price,
      color: p.color,
      image_count: p.images.length,
      image_names: p.images.map(i => i.name),
    })),
    planned_parent_update: parentUpdate,
    planned_variations: variations,
    planned_gallery: parentGallery,
    planned_archive_duplicates: archiveChildren,
    risks: [
      'El SKU del parent no puede chocar con el SKU de una variación; por eso el parent pasa a WM-PRC-037-parent.',
      'Hay que verificar si conviene conservar todas las fotos negras y claras en una sola galería o dejar solo las más coherentes.',
      'Los textos poéticos individuales hoy viven en productos simples; si se consolida, conviene decidir si van a una descripción general o se pierden del PDP principal.'
    ],
    apply_order: [
      '1. Backup canonical + duplicates',
      '2. PUT canonical -> variable + nombre genérico + sku parent + atributo Color + galería consolidada',
      '3. Crear 4 variations con SKU original + precio + imagen principal por color',
      '4. PUT duplicates -> draft + sku legacy',
      '5. Re-GET canonical + variations + duplicates para verificar write real',
    ]
  };

  const out = path.join(LOG_DIR, `dry-run-labret-color-merge-${ts()}.json`);
  fs.writeFileSync(out, JSON.stringify(dryRun, null, 2));
  console.log(JSON.stringify({
    summary: {
      canonical_id: canonical.id,
      canonical_sku_now: canonical.sku,
      parent_sku_planned: PARENT_SKU,
      source_count: products.length,
      total_images_in_family: products.reduce((n, p) => n + p.images.length, 0),
      unique_gallery_images: parentGallery.length,
      variations: variations.map(v => ({ color: v.color, sku: v.planned_variation_sku, price: v.regular_price, hero_image_id: v.hero_image?.id || null })),
      duplicates_to_draft: archiveChildren.map(x => ({ id: x.id, sku: x.current_sku, legacy_sku: x.planned_sku })),
    },
    log_path: out,
  }, null, 2));
})();
