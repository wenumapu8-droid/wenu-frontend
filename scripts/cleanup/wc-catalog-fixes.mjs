#!/usr/bin/env node
/**
 * Apply small, reversible catalog fixes to WooCommerce.
 *
 * Safe default:
 *   node scripts/cleanup/wc-catalog-fixes.mjs --group=prices-top10
 *
 * Execute:
 *   node scripts/cleanup/wc-catalog-fixes.mjs --group=prices-top10 --execute
 *
 * Writes a before/after log to .runtime/catalog-fixes-<timestamp>.json.
 */

import fs from 'node:fs';
import path from 'node:path';

const scriptPath = new URL(import.meta.url).pathname;
const repoRoot = path.resolve(path.dirname(scriptPath), '../..');
const envPath = path.join(repoRoot, '.env');

if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] ||= m[2].trim();
  }
}

const WC_URL = (process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3').replace(/\/+$/, '');
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;

if (!WC_KEY || !WC_SECRET) {
  console.error('Missing WC_CONSUMER_KEY / WC_CONSUMER_SECRET in .env');
  process.exit(1);
}

const args = process.argv.slice(2);
const execute = args.includes('--execute');
const group = (args.find(arg => arg.startsWith('--group=')) || '--group=prices-top10').split('=')[1];

const GROUPS = {
  'prices-top10': [
    { id: 2086, regular_price: '260' },
    { id: 2085, regular_price: '240' },
    { id: 2076, regular_price: '52' },
    { id: 2077, regular_price: '52' },
    { id: 2060, regular_price: '58' },
    { id: 2055, regular_price: '45' },
    { id: 2054, regular_price: '48' },
    { id: 2069, regular_price: '62' },
    { id: 2066, regular_price: '68' },
    { id: 2073, regular_price: '75' },
  ],
  'prices-next13': [
    { id: 2059, regular_price: '38' },
    { id: 2061, regular_price: '42' },
    { id: 2062, regular_price: '32' },
    { id: 2063, regular_price: '55' },
    { id: 2064, regular_price: '28' },
    { id: 2065, regular_price: '22' },
    { id: 2067, regular_price: '68' },
    { id: 2068, regular_price: '58' },
    { id: 2056, regular_price: '72' },
    { id: 2057, regular_price: '35' },
    { id: 2058, regular_price: '48' },
    { id: 2070, regular_price: '62' },
    { id: 2074, regular_price: '55' },
  ],
  'prices-final4': [
    { id: 2083, regular_price: '45' },
    { id: 2075, regular_price: '86' },
    { id: 2072, regular_price: '95' },
    { id: 2071, regular_price: '42' },
  ],
  'names-basic': [
    { id: 2059, name: 'Drop Ring', slug: 'drop-ring' },
    { id: 2061, name: 'Gold Titanium Marquise Piercing with Onyx Stone', slug: 'gold-titanium-marquise-onyx-piercing' },
    { id: 2062, name: 'Three Dot Titanium Piercing', slug: 'three-dot-titanium-piercing' },
    { id: 2063, name: 'Lotus Flower Expansion', slug: 'lotus-flower-expansion' },
    { id: 2064, name: 'Wood Tunnel Expansion', slug: 'wood-tunnel-expansion' },
    { id: 2065, name: 'Dark Wood Smooth Plug', slug: 'dark-wood-smooth-plug' },
    { id: 2067, name: 'Ornamental Wood Ear Weights', slug: 'ornamental-wood-ear-weights' },
    { id: 2068, name: 'Bronze Spiral Expansion', slug: 'bronze-spiral-expansion' },
    { id: 2056, name: 'Golden Triangular Geometric Ear Weight', slug: 'golden-triangular-geometric-ear-weight' },
    { id: 2057, name: 'Golden Multi-Ring Expansion Clicker', slug: 'golden-multi-ring-expansion-clicker' },
    { id: 2058, name: 'Gold-Tone Septum Chain', slug: 'gold-tone-septum-chain' },
    { id: 2074, name: 'Heavy Gauge Hoop Hanger', slug: 'heavy-gauge-hoop-hanger' },
  ],
  'names-final4': [
    { id: 2072, name: 'Octagonal Wood Sunglasses', slug: 'octagonal-wood-sunglasses' },
    { id: 2071, name: 'Carved Ethnic Ring', slug: 'carved-ethnic-ring' },
  ],
  'descriptions-core3': [
    {
      id: 1811,
      name: 'Curated Stone Plug 10mm | WM-PLG-004',
      slug: 'curated-stone-plug-10mm-wm-plg-004',
      short_description: 'A curated 10mm stone plug with natural mineral character. Polished for everyday wear and selected as a one-of-one catalogue piece.',
      description: '<p>A curated 10mm stone plug selected for its natural mineral character. The surface is polished smooth for daily wear, while the color and internal variation stay specific to this individual piece.</p><p>This is a one-of-one catalogue item: the stone pattern, tone, and visible structure will not repeat exactly in the next plug. Wear it as a quiet material piece, or pair it with other stone and wood forms in the Wenu Mapu catalogue.</p>',
    },
    {
      id: 1786,
      name: 'Curated Surgical Steel Body Hanger 10mm | WM-HAN-003',
      slug: 'curated-surgical-steel-body-hanger-10mm-wm-han-003',
      short_description: 'A curated 10mm surgical steel body hanger. Clean profile, polished surface, and an accessible everyday weight.',
      description: '<p>A curated 10mm surgical steel body hanger with a clean polished profile. The form is simple, durable, and easy to combine with other pieces in a stretched-lobe setup.</p><p>This piece sits in the accessible everyday tier of the catalogue: body jewelry with a clear silhouette, practical material, and enough presence to read from the side without feeling heavy.</p>',
    },
    {
      id: 593,
      name: 'Certified Walnut Wood Ear Gauges',
      slug: 'certified-walnut-wood-ear-gauges',
      short_description: 'Certified walnut wood ear gauges with visible grain and a warm, lightweight feel. Handmade for stretched lobes.',
      description: '<p>Certified walnut wood ear gauges made for stretched lobes. Walnut is warm, lightweight, and visibly alive in the grain: each pair carries small differences in line, tone, and surface movement.</p><p>The wood is polished smooth so it sits comfortably against the skin. Keep it dry, avoid shower or pool wear, and refresh the surface occasionally with a small amount of mineral oil. This is the catalogue anchor for Wenu Mapu wood pieces: grounded, tactile, and made for daily presence.</p>',
    },
  ],
  'names-generic24': [
    { id: 1829, name: 'Septum Ring | WM-SEP-001', slug: 'septum-ring-wm-sep-001' },
    { id: 1828, name: 'Ring | WM-RNG-001', slug: 'ring-wm-rng-001' },
    { id: 1826, name: 'Stone Plug 10mm | WM-PLG-015', slug: 'stone-plug-10mm-wm-plg-015' },
    { id: 1825, name: 'Stone Plug 10mm | WM-PLG-014', slug: 'stone-plug-10mm-wm-plg-014' },
    { id: 1822, name: 'Stone Plug 10mm | WM-PLG-013', slug: 'stone-plug-10mm-wm-plg-013' },
    { id: 1820, name: 'Stone Plug 10mm | WM-PLG-012', slug: 'stone-plug-10mm-wm-plg-012' },
    { id: 1818, name: 'Stone Plug 10mm | WM-PLG-011', slug: 'stone-plug-10mm-wm-plg-011' },
    { id: 1817, name: 'Stone Plug 10mm | WM-PLG-010', slug: 'stone-plug-10mm-wm-plg-010' },
    { id: 1816, name: 'Stone Plug 10mm | WM-PLG-009', slug: 'stone-plug-10mm-wm-plg-009' },
    { id: 1815, name: 'Stone Plug 10mm | WM-PLG-008', slug: 'stone-plug-10mm-wm-plg-008' },
    { id: 1814, name: 'Stone Plug 10mm | WM-PLG-007', slug: 'stone-plug-10mm-wm-plg-007' },
    { id: 1813, name: 'Stone Plug 10mm | WM-PLG-006', slug: 'stone-plug-10mm-wm-plg-006' },
    { id: 1812, name: 'Stone Plug 10mm | WM-PLG-005', slug: 'stone-plug-10mm-wm-plg-005' },
    { id: 1810, name: 'Stone Plug 10mm Detail | WM-PLG-004', slug: 'stone-plug-10mm-detail-wm-plg-004' },
    { id: 1807, name: 'Stone Plug 10mm | WM-PLG-003', slug: 'stone-plug-10mm-wm-plg-003' },
    { id: 1804, name: 'Stone Plug 10mm | WM-PLG-002', slug: 'stone-plug-10mm-wm-plg-002' },
    { id: 1802, name: 'Stone Plug 10mm | WM-PLG-001', slug: 'stone-plug-10mm-wm-plg-001' },
    { id: 1800, name: 'Steel Labret 10mm | WM-LAB-003', slug: 'steel-labret-10mm-wm-lab-003' },
    { id: 1793, name: 'Steel Labret 10mm | WM-LAB-002', slug: 'steel-labret-10mm-wm-lab-002' },
    { id: 1788, name: 'Steel Labret 10mm | WM-LAB-001', slug: 'steel-labret-10mm-wm-lab-001' },
    { id: 1787, name: 'Surgical Steel Hanger 10mm | WM-HAN-004', slug: 'surgical-steel-hanger-10mm-wm-han-004' },
    { id: 1785, name: 'Surgical Steel Hanger 10mm Detail | WM-HAN-003', slug: 'surgical-steel-hanger-10mm-detail-wm-han-003' },
    { id: 1783, name: 'Surgical Steel Hanger 10mm | WM-HAN-002', slug: 'surgical-steel-hanger-10mm-wm-han-002' },
    { id: 1782, name: 'Surgical Steel Hanger 10mm | WM-HAN-001', slug: 'surgical-steel-hanger-10mm-wm-han-001' },
  ],
};

const fixes = GROUPS[group];
if (!fixes) {
  console.error(`Unknown group "${group}". Available: ${Object.keys(GROUPS).join(', ')}`);
  process.exit(2);
}

function authQS() {
  return `consumer_key=${encodeURIComponent(WC_KEY)}&consumer_secret=${encodeURIComponent(WC_SECRET)}`;
}

function snapshot(product) {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    sku: product.sku,
    status: product.status,
    price: product.price,
    regular_price: product.regular_price,
    images: Array.isArray(product.images) ? product.images.length : 0,
    categories: Array.isArray(product.categories) ? product.categories.map(c => c.slug) : [],
  };
}

async function wcGet(id) {
  const res = await fetch(`${WC_URL}/products/${id}?${authQS()}`);
  if (!res.ok) throw new Error(`GET ${id}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

async function wcUpdate(id, payload) {
  const res = await fetch(`${WC_URL}/products/${id}?${authQS()}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`PUT ${id}: HTTP ${res.status} ${await res.text()}`);
  return res.json();
}

const log = {
  createdAt: new Date().toISOString(),
  group,
  execute,
  actions: [],
};

console.log(`[wc-catalog-fixes] ${execute ? 'EXECUTE' : 'DRY-RUN'} · ${group} · ${fixes.length} products`);

for (const fix of fixes) {
  const before = await wcGet(fix.id);
  const beforeSnap = snapshot(before);
  const payload = Object.fromEntries(
    Object.entries(fix).filter(([key]) => key !== 'id')
  );

  const changes = Object.entries(payload)
    .map(([key, value]) => `${key}: ${JSON.stringify(beforeSnap[key] ?? before[key] ?? '')} -> ${JSON.stringify(value)}`)
    .join(', ');

  process.stdout.write(`  ${fix.id} ${String(before.name).slice(0, 44).padEnd(44)} ${changes}`);

  if (!execute) {
    console.log(' [dry]');
    log.actions.push({ id: fix.id, before: beforeSnap, payload, dryRun: true });
    continue;
  }

  const after = await wcUpdate(fix.id, payload);
  const afterSnap = snapshot(after);
  console.log(' [ok]');
  log.actions.push({ id: fix.id, before: beforeSnap, payload, after: afterSnap });
}

const runtimeDir = path.join(repoRoot, '.runtime');
fs.mkdirSync(runtimeDir, { recursive: true });
const logPath = path.join(runtimeDir, `catalog-fixes-${group}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
fs.writeFileSync(logPath, JSON.stringify(log, null, 2));
console.log(`Log: ${logPath}`);
