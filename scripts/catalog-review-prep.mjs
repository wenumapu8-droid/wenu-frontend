#!/usr/bin/env node
/**
 * catalog-review-prep.mjs
 *
 * Helper compartido entre el skill Claude Code `wenu-catalog-review` y
 * el equivalente Hermes. Prepara TODOS los datos necesarios para la
 * revisión visual interactiva producto-por-producto:
 *
 *   1. Refresh NocoDB snapshot (docker cp)
 *   2. Fetch WC productos publicados con sku, name, price, images, categories
 *   3. Descargar primer image de cada producto a /tmp/price-review/<id>.jpg
 *   4. Cross-match con NocoDB por SKU
 *   5. Emitir /tmp/catalog-review-prep.json con todo listo
 *
 * Usage:
 *   node scripts/catalog-review-prep.mjs              # produce JSON listo
 *   node scripts/catalog-review-prep.mjs --published  # solo published (default)
 *   node scripts/catalog-review-prep.mjs --all        # incluir drafts
 *   node scripts/catalog-review-prep.mjs --skip-photos  # no descargar fotos
 *
 * Lectura del JSON:
 *   const review = JSON.parse(fs.readFileSync('/tmp/catalog-review-prep.json'))
 *   for (const item of review.items) {
 *     // item = { wc: {...}, noco: {...} | null, photo_local: 'path' | null, flags: [...] }
 *   }
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

const argv = process.argv.slice(2);
const INCLUDE_ALL = argv.includes('--all');
const SKIP_PHOTOS = argv.includes('--skip-photos');

const OUT_DIR = '/tmp/price-review';
const OUT_JSON = '/tmp/catalog-review-prep.json';
const NOCO_DB = '/tmp/noco.db';

function log(level, msg) {
  const tag = level === 'FAIL' ? '\x1b[31m[FAIL]\x1b[0m' : level === 'WARN' ? '\x1b[33m[WARN]\x1b[0m' : '\x1b[32m[ OK ]\x1b[0m';
  console.log(`${tag} ${msg}`);
}

function loadEnv() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) {
    throw new Error('.env not found. Run from ~/wenu-frontend.');
  }
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
}

function refreshNocoSnapshot() {
  log('OK', 'Refreshing NocoDB snapshot...');
  try {
    execSync(`docker cp nocodb:/usr/app/data/noco.db ${NOCO_DB}`, { stdio: 'pipe' });
    log('OK', `NocoDB snapshot at ${NOCO_DB}`);
  } catch (e) {
    log('WARN', `docker cp failed (${e.message}). Using existing snapshot if any.`);
  }
}

function readNoco() {
  if (!fs.existsSync(NOCO_DB)) {
    log('WARN', 'No NocoDB snapshot. Returning empty.');
    return {};
  }
  const json = execSync(`sqlite3 -json "${NOCO_DB}" "SELECT SKU, title, Estado, Precio_venta_USD, Material, Tipo_de_pieza, Foto_macro FROM nc_9aor___Piezas WHERE SKU IS NOT NULL AND SKU != ''"`).toString();
  const rows = JSON.parse(json || '[]');
  return Object.fromEntries(rows.map(r => [r.SKU, r]));
}

async function fetchWc(includeAll) {
  const url = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
  const key = process.env.WC_CONSUMER_KEY;
  const sec = process.env.WC_CONSUMER_SECRET;
  if (!key || !sec) throw new Error('WC_CONSUMER_KEY/SECRET missing');
  const auth = Buffer.from(`${key}:${sec}`).toString('base64');
  const status = includeAll ? 'any' : 'publish';
  const fields = 'id,sku,name,status,stock_status,price,regular_price,categories,images';
  const r = await fetch(`${url}/products?per_page=100&status=${status}&_fields=${fields}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!r.ok) throw new Error(`WC API ${r.status}`);
  return r.json();
}

async function downloadPhoto(url, dest) {
  if (fs.existsSync(dest)) return true;
  try {
    const r = await fetch(url);
    if (!r.ok) return false;
    const buf = Buffer.from(await r.arrayBuffer());
    fs.writeFileSync(dest, buf);
    return true;
  } catch { return false; }
}

const AI_PATTERNS = [/ChatGPT-Image/i, /Sin-titulo/i, /Sin-t[ií]tulo/i, /midjourney/i, /dall-?e/i];
const PREFIX_TO_CAT = {
  HAN: 430, PRC: 174, SEP: 174, RNG: 84, SAD: 72, TUN: 68, PLG: 68, EAR: 49, OTH: 345, NCK: 86, CARE: 345,
};

function detectFlags(wc, noco) {
  const flags = [];
  const sku = wc.sku || '';
  const prefix = sku.match(/^WM-([A-Z]{2,4})-/)?.[1];

  for (const img of wc.images || []) {
    if (AI_PATTERNS.some(p => p.test(img.src.split('/').pop()))) {
      flags.push({ level: 'FAIL', code: 'ai-photo', detail: img.src.split('/').pop() });
    }
  }

  if (!sku && wc.status === 'publish') {
    flags.push({ level: 'FAIL', code: 'published-without-sku' });
  }

  if (prefix && PREFIX_TO_CAT[prefix]) {
    const expected = PREFIX_TO_CAT[prefix];
    const has = (wc.categories || []).some(c => c.id === expected);
    if (!has) flags.push({ level: 'FAIL', code: 'category-mismatch', expected_cat_id: expected, current: (wc.categories || []).map(c => c.name) });
  }

  if (sku && !noco) {
    flags.push({ level: 'FAIL', code: 'orphan-in-noco' });
  }

  if (noco && noco.Estado === 'SOLD OUT' && wc.stock_status === 'instock') {
    flags.push({ level: 'WARN', code: 'noco-sold-wc-instock' });
  }

  if (noco) {
    const wp = parseFloat(wc.price || 0);
    const np = parseFloat(noco.Precio_venta_USD || 0);
    if (wp && np && Math.abs(wp - np) / np > 0.25) {
      flags.push({ level: 'WARN', code: 'price-gap', wc_price: wp, noco_price: np, gap_pct: Math.round((wp - np) / np * 100) });
    }
  }

  return flags;
}

// ───────────────── MAIN ─────────────────
(async () => {
  loadEnv();
  refreshNocoSnapshot();
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const noco = readNoco();
  const wc = await fetchWc(INCLUDE_ALL);
  log('OK', `Fetched ${wc.length} WC products`);

  const items = [];
  for (const p of wc) {
    const nocoRow = noco[p.sku] || null;
    const photoUrl = p.images?.[0]?.src;
    const photoLocal = photoUrl ? path.join(OUT_DIR, `${p.id}.jpg`) : null;
    if (photoUrl && !SKIP_PHOTOS) {
      const ok = await downloadPhoto(photoUrl, photoLocal);
      if (!ok) log('WARN', `photo download failed for ${p.id}`);
    }
    items.push({
      wc: {
        id: p.id, sku: p.sku, name: p.name, price: p.price, regular_price: p.regular_price,
        status: p.status, stock_status: p.stock_status,
        categories: (p.categories || []).map(c => ({ id: c.id, name: c.name })),
        photo_url: photoUrl, photo_local: photoLocal,
      },
      noco: nocoRow ? {
        sku: nocoRow.SKU, title: nocoRow.title, estado: nocoRow.Estado,
        precio_venta_usd: nocoRow.Precio_venta_USD, material: nocoRow.Material,
        tipo_de_pieza: nocoRow.Tipo_de_pieza, foto_macro: nocoRow.Foto_macro,
      } : null,
      flags: detectFlags(p, nocoRow),
    });
  }

  const summary = {
    generated_at: new Date().toISOString(),
    wc_total: wc.length,
    noco_total: Object.keys(noco).length,
    items_with_failures: items.filter(i => i.flags.some(f => f.level === 'FAIL')).length,
    items_with_warnings: items.filter(i => i.flags.some(f => f.level === 'WARN')).length,
    items,
  };
  fs.writeFileSync(OUT_JSON, JSON.stringify(summary, null, 2));
  log('OK', `Wrote ${OUT_JSON} with ${items.length} items`);
  log('OK', `Failures: ${summary.items_with_failures} · Warnings: ${summary.items_with_warnings}`);
  log('OK', `Photos in ${OUT_DIR}/`);
  console.log('\nNext: skill wenu-catalog-review consumes this JSON and walks the owner through each item.\n');
})().catch(e => {
  console.error(`[catalog-review-prep] ${e.message}`);
  process.exit(1);
});
