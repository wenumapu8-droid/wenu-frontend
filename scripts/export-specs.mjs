#!/usr/bin/env node
// ─── EXPORT SPECS — NocoDB → src/data/specs-by-sku.json ──────────────────────
// WooCommerce ships EMPTY attributes, so the live product page (src/pages/p/
// [slug].astro) currently *guesses* material/size/etc. from the product name
// (src/lib/specs.ts). The real, honest, structured per-piece data lives in
// NocoDB (source of truth). This script pulls it out and freezes it into a
// committed JSON keyed by SKU, which the build merges into each PDP.
//
//   • Runs locally on the Mac where NocoDB Docker is up (localhost:8080).
//   • Reads creds from env, falling back to ~/wenu-platform/.env.
//   • Output committed → builds in CI never need NocoDB live.
//   • Honest by default: a field absent in NocoDB is simply omitted (the page
//     then falls back to the name-derived value, or shows nothing — never a
//     fabricated spec).
//
// Re-run whenever the catalog's structured data changes:
//   node scripts/export-specs.mjs
//
// NocoDB's list endpoint has a known intermittent empty/500 bug, so we retry.

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'src', 'data', 'specs-by-sku.json');

// ── Load NocoDB creds: env first, then ~/wenu-platform/.env ──
function loadEnvFallback() {
  const p = join(homedir(), 'wenu-platform', '.env');
  if (!existsSync(p)) return {};
  const out = {};
  for (const line of readFileSync(p, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}
const fb = loadEnvFallback();
const NOCODB_URL   = process.env.NOCODB_URL   || fb.NOCODB_URL   || 'http://localhost:8080';
const NOCODB_TOKEN = process.env.NOCODB_TOKEN || fb.NOCODB_TOKEN;
const TABLE        = process.env.NOCODB_TABLE_PIEZAS || fb.NOCODB_TABLE_PIEZAS || 'm5s3jnm72tzhk9g';

if (!NOCODB_TOKEN) {
  console.error('✖ NOCODB_TOKEN not found (env or ~/wenu-platform/.env). Is NocoDB configured?');
  process.exit(1);
}

const FIELDS = [
  'SKU', 'Estado', 'Material', 'Color', 'Medida US', 'Medida mm',
  'Threading', 'Peso g', 'Tipo de pieza', 'Subtipo piercing',
  'Unidad de venta', 'Packaging',
];

async function fetchAll() {
  const url = `${NOCODB_URL}/api/v2/tables/${TABLE}/records`
    + `?limit=300&fields=${FIELDS.map(encodeURIComponent).join(',')}`;
  for (let i = 1; i <= 8; i++) {
    try {
      const res = await fetch(url, { headers: { 'xc-token': NOCODB_TOKEN } });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data?.list) ? data.list : [];
        if (list.length) return list;
        console.warn(`  try ${i}: empty list (NocoDB intermittent bug), retrying…`);
      } else {
        console.warn(`  try ${i}: HTTP ${res.status}, retrying…`);
      }
    } catch (e) {
      console.warn(`  try ${i}: ${e.message}, retrying…`);
    }
    await new Promise(r => setTimeout(r, 1500));
  }
  throw new Error('NocoDB returned no rows after 8 attempts — aborting (would not overwrite good JSON).');
}

// ── Normalizers — turn raw NocoDB values into clean, display-ready facts ──
const clean = v => (v == null ? null : String(v).trim());
const isEmpty = v => v == null || v === '' || v === '—' || /^(other|n\/?a|none|mixed)$/i.test(String(v).trim());

// Canonical material family → honest editorial label (mirrors specs.ts copy).
const MATERIAL_LABEL = {
  'Titanium':        'ASTM F-136 implant-grade titanium',
  'Stainless steel': 'Surgical-grade stainless steel',
  'Silver':          'Sterling silver (925)',
  'Brass':           'Brass',
  'Bronze':          'Bronze',
  'Wood':            'Wood',
  'Stone':           'Natural stone',
  'Resin':           'Hand-poured resin',
  // 'Mixed' intentionally omitted → page falls back to name-derived material.
};

function normSize(us, mm) {
  // Medida US: "16G" / "00G" / "1/2\"" / "—"  ·  Medida mm: "1.2mm (16g)" / "12mm" / "Other"
  const u = isEmpty(us) ? null : clean(us);
  const m = isEmpty(mm) ? null : clean(mm);
  if (u && m) {
    // avoid "16G · 1.2mm (16g)" redundancy when mm already names the gauge
    if (m.toLowerCase().includes(u.toLowerCase().replace('g', 'g'))) return m;
    return `${u} · ${m}`;
  }
  return u || m || null;
}

function normWeight(g) {
  const n = parseFloat(g);
  if (!Number.isFinite(n) || n <= 0) return null;
  return `${n.toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 1 : 0 })} g`;
}

function normColor(c) {
  if (isEmpty(c)) return null;
  // "Silver,Other" → "Silver"  ·  "Black wood,Bronze" → "Black wood · Bronze"
  return clean(c).split(',').map(s => s.trim()).filter(s => s && !/^other$/i.test(s)).join(' · ') || null;
}

const PACKAGING_LABEL = {
  'Cloth bag':     'Cloth pouch',
  'Cíclop bag':    'Branded pouch',
  'Floating frame':'Floating-frame display box',
  'Box':           'Gift box',
  'Cardboard card':'Branded carton',
};

function build(rows) {
  const out = {};
  let kept = 0;
  for (const r of rows) {
    const sku = clean(r.SKU);
    if (!sku) continue;
    const spec = {};
    const mat = clean(r.Material);
    if (mat && MATERIAL_LABEL[mat]) spec.material = MATERIAL_LABEL[mat];
    else if (mat && !isEmpty(mat)) spec.material = mat;
    const size = normSize(r['Medida US'], r['Medida mm']);
    if (size) spec.size = size;
    if (!isEmpty(r.Threading)) spec.threading = clean(r.Threading);
    const wt = normWeight(r['Peso g']);
    if (wt) spec.weight = wt;
    if (!isEmpty(r['Tipo de pieza'])) spec.type = clean(r['Tipo de pieza']);
    if (!isEmpty(r['Subtipo piercing'])) spec.placement = clean(r['Subtipo piercing']);
    const sold = clean(r['Unidad de venta']);
    if (sold) spec.soldAs = /pair/i.test(sold) ? 'Pair' : 'Single piece';
    const pkg = clean(r.Packaging);
    if (pkg && PACKAGING_LABEL[pkg]) spec.packaging = PACKAGING_LABEL[pkg];
    else if (pkg && !isEmpty(pkg)) spec.packaging = pkg;
    const color = normColor(r.Color);
    if (color) spec.color = color;
    spec._estado = clean(r.Estado) || null;
    if (Object.keys(spec).length > 1) { out[sku] = spec; kept++; }
  }
  return { out, kept };
}

console.log('→ Fetching catalog from NocoDB…');
const rows = await fetchAll();
console.log(`  got ${rows.length} rows`);
const { out, kept } = build(rows);
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n');
console.log(`✓ Wrote ${kept} SKUs → src/data/specs-by-sku.json`);
