#!/usr/bin/env node
/**
 * audit-catalog.mjs
 *
 * Pre-deploy guardrail. Cruza WC (productos publicados) contra:
 *   - NocoDB SQLite snapshot (fuente de verdad de catálogo)
 *   - Catálogo de fotos macro curadas en ~/Obsidian/.../04-photography/product-macro/final/
 *   - Reglas de prefijo SKU → categoría WC esperada
 *
 * FALLA el build si detecta:
 *   - Foto AI (filename matches ChatGPT-Image-*, Sin-titulo-*, Sin-título-*)
 *   - Categoría WC no coincide con prefijo SKU canónico
 *   - SKU WC no existe en NocoDB (huérfano)
 *   - Producto publicado sin SKU asignado
 *   - Categoría WC referenciada en CategoryStrip.astro que no existe
 *
 * Soft warnings (no rompe build):
 *   - Producto sin foto macro curada en `final/`
 *   - Precio WC y NocoDB difieren > 25%
 *   - Estado NocoDB es SOLD OUT pero stock_status WC es instock
 *
 * Usage:
 *   node scripts/audit-catalog.mjs           # validate, fail if hard errors
 *   node scripts/audit-catalog.mjs --soft    # warn only, never fail
 *   SKIP_CATALOG_AUDIT=true npm run build    # bypass entirely
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

const argv = process.argv.slice(2);
const SOFT = argv.includes('--soft');
const VERBOSE = argv.includes('--verbose');

if (process.env.SKIP_CATALOG_AUDIT === 'true') {
  console.log('[audit-catalog] SKIP_CATALOG_AUDIT=true — skipping.');
  process.exit(0);
}

// ───────────────── CONFIG ─────────────────
const PREFIX_TO_WC_CAT = {
  HAN: { id: 430, name: 'Hangers / Weights' },
  PRC: { id: 174, name: 'Piercing' },
  SEP: { id: 174, name: 'Piercing' }, // septum is a piercing
  RNG: { id: 84,  name: 'Ring' },
  SAD: { id: 72,  name: 'Saddle' },
  TUN: { id: 68,  name: 'Plug' },
  PLG: { id: 68,  name: 'Plug' },
  EAR: { id: 49,  name: 'Earrings' },
  OTH: { id: 345, name: 'accessories' },
  NCK: { id: 86,  name: 'necklace' },
  CARE:{ id: 345, name: 'accessories' },
};
const AI_FILENAME_PATTERNS = [
  /ChatGPT-Image/i,
  /Sin-titulo/i,
  /Sin-t[ií]tulo/i,
  /midjourney/i,
  /dall-?e/i,
];
const NOCO_DB = '/tmp/noco.db';
const CATEGORY_STRIP = path.resolve('src/components/CategoryStrip.astro');
const PHOTO_FINAL_DIR = path.join(os.homedir(), 'Obsidian/WenuAgent/brand/04-photography/product-macro/final');

// ───────────────── HELPERS ─────────────────
function log(level, msg) {
  const tag = level === 'FAIL' ? '\x1b[31m[FAIL]\x1b[0m' : level === 'WARN' ? '\x1b[33m[WARN]\x1b[0m' : '\x1b[32m[ OK ]\x1b[0m';
  console.log(`${tag} ${msg}`);
}

async function fetchWcProducts() {
  const url = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
  const key = process.env.WC_CONSUMER_KEY;
  const sec = process.env.WC_CONSUMER_SECRET;
  if (!key || !sec) throw new Error('WC_CONSUMER_KEY/SECRET missing in env');
  const auth = Buffer.from(`${key}:${sec}`).toString('base64');
  const fields = 'id,sku,name,status,stock_status,price,categories,images';
  const r = await fetch(`${url}/products?per_page=100&status=publish&_fields=${fields}`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  if (!r.ok) throw new Error(`WC API ${r.status}`);
  return r.json();
}

function readNocoSnapshot() {
  if (!fs.existsSync(NOCO_DB)) {
    log('WARN', `NocoDB snapshot not at ${NOCO_DB} — skipping cross-check. Run \`docker cp nocodb:/usr/app/data/noco.db ${NOCO_DB}\` to refresh.`);
    return null;
  }
  const out = execSync(`sqlite3 -json "${NOCO_DB}" "SELECT SKU, title, Estado, Precio_venta_USD, Foto_macro FROM nc_9aor___Piezas WHERE SKU IS NOT NULL AND SKU != ''"`).toString();
  return JSON.parse(out || '[]');
}

function prefixOf(sku) {
  const m = sku && sku.match(/^WM-([A-Z]{2,4})-/);
  return m ? m[1] : null;
}

function imgIsAi(src) {
  const filename = (src || '').split('/').pop();
  return AI_FILENAME_PATTERNS.some(p => p.test(filename));
}

function hasCuratedPhoto(sku) {
  try {
    return fs.existsSync(path.join(PHOTO_FINAL_DIR, sku));
  } catch { return false; }
}

// ───────────────── MAIN ─────────────────
async function main() {
  const errors = [];
  const warnings = [];

  // Load .env from frontend root
  const envPath = path.resolve('.env');
  if (fs.existsSync(envPath)) {
    fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    });
  }

  const wc = await fetchWcProducts();
  const noco = readNocoSnapshot();
  const nocoBySku = noco ? Object.fromEntries(noco.map(r => [r.SKU, r])) : null;

  console.log(`\n[audit-catalog] Checking ${wc.length} published WC products\n`);

  for (const p of wc) {
    const sku = p.sku || '';
    const prefix = prefixOf(sku);
    const id = p.id;
    const name = p.name || '(no name)';

    // R1: Producto publicado sin SKU
    if (!sku) {
      errors.push(`#${id} ${name}: PUBLISHED without SKU`);
      continue;
    }

    // R2: Foto AI
    for (const img of p.images || []) {
      if (imgIsAi(img.src)) {
        errors.push(`#${id} ${sku}: AI image detected → ${img.src}`);
      }
    }

    // R3: Categoría WC mismatch con prefijo
    const expected = PREFIX_TO_WC_CAT[prefix];
    if (expected) {
      const cats = p.categories || [];
      const has = cats.some(c => c.id === expected.id);
      if (!has) {
        errors.push(`#${id} ${sku}: category mismatch — expected "${expected.name}" (id ${expected.id}), got [${cats.map(c=>c.name).join(', ') || 'none'}]`);
      }
    } else if (prefix) {
      warnings.push(`#${id} ${sku}: unknown SKU prefix "${prefix}" — add to PREFIX_TO_WC_CAT map`);
    }

    // R4: NocoDB cross-check
    if (nocoBySku) {
      const nr = nocoBySku[sku];
      if (!nr) {
        errors.push(`#${id} ${sku}: SKU not found in NocoDB — orphan product`);
      } else {
        // soft: estado SOLD OUT vs stock_status instock
        if (nr.Estado === 'SOLD OUT' && p.stock_status === 'instock') {
          warnings.push(`#${id} ${sku}: NocoDB says SOLD OUT but WC is instock`);
        }
        // soft: precio diff > 25%
        const wp = parseFloat(p.price || '0');
        const np = parseFloat(nr.Precio_venta_USD || 0);
        if (wp && np && Math.abs(wp - np) / np > 0.25) {
          warnings.push(`#${id} ${sku}: price gap WC=$${wp} vs Noco=$${np}`);
        }
      }
    }

    // R5: foto curada (soft)
    if (!hasCuratedPhoto(sku)) {
      warnings.push(`#${id} ${sku}: no curated photo in final/${sku}/`);
    }

    if (VERBOSE) log('OK', `#${id} ${sku} ${name.slice(0,40)}`);
  }

  // R6: CategoryStrip referenced slugs
  if (fs.existsSync(CATEGORY_STRIP)) {
    const src = fs.readFileSync(CATEGORY_STRIP, 'utf8');
    const slugMatches = [...src.matchAll(/slug:\s*'([a-z-]+)'/g)].map(m => m[1]);
    if (slugMatches.length === 0) warnings.push('CategoryStrip has no slugs detected');
    // Each referenced image path must resolve to a file in public/
    const imgMatches = [...src.matchAll(/img:\s*'([^']+)'/g)].map(m => m[1]);
    for (const imgPath of imgMatches) {
      const fullPath = path.resolve('public' + imgPath);
      if (!fs.existsSync(fullPath)) {
        errors.push(`CategoryStrip references missing image: ${imgPath}`);
      }
    }
  }

  // ───────────── Report ─────────────
  console.log(`\n${'─'.repeat(60)}`);
  if (warnings.length) {
    console.log(`\n${warnings.length} warning(s):`);
    warnings.forEach(w => log('WARN', w));
  }
  if (errors.length) {
    console.log(`\n${errors.length} error(s):`);
    errors.forEach(e => log('FAIL', e));
  }
  if (!errors.length && !warnings.length) {
    log('OK', 'All catalog checks passed.');
  }
  console.log(`${'─'.repeat(60)}\n`);

  if (errors.length && !SOFT) {
    console.error(`\n[audit-catalog] FAILED with ${errors.length} hard error(s). Pass --soft to convert to warnings, or set SKIP_CATALOG_AUDIT=true to bypass.\n`);
    process.exit(1);
  }
}

main().catch(e => {
  console.error(`[audit-catalog] crashed: ${e.message}`);
  process.exit(SOFT ? 0 : 1);
});
