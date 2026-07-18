#!/usr/bin/env node
/**
 * tmp-build-product-index.mjs  (one-shot, not committed)
 *
 * Builds the Product Memory Index:
 *   ~/Obsidian/WenuAgent/00-MEMORY/product-index.json
 *   ~/Obsidian/WenuAgent/00-MEMORY/product-index.md
 *
 * Spine = WooCommerce products (full REST, status=any). NocoDB (Piezas) merged
 * on top by normalized SKU. Read-only on both sources. No commit.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ── env (two .env files) ────────────────────────────────────────────────────
function loadEnv(p) {
  const out = {};
  try {
    for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  } catch {}
  return out;
}
const feEnv = loadEnv('/Users/user1/wenu-frontend/.env');
const hubEnv = loadEnv('/Users/user1/wenu-agent-hub/.env');

const WC_URL = 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WC_KEY = feEnv.WC_CONSUMER_KEY || hubEnv.WOOCOMMERCE_KEY;
const WC_SECRET = feEnv.WC_CONSUMER_SECRET || hubEnv.WOOCOMMERCE_SECRET;
const NOCO_URL = hubEnv.NOCODB_URL || 'http://localhost:8080';
const NOCO_TOKEN = hubEnv.NOCODB_TOKEN;
const NOCO_TABLE = hubEnv.NOCODB_TABLE || 'm5s3jnm72tzhk9g';

const OUT_DIR = path.join(os.homedir(), 'Obsidian/WenuAgent/00-MEMORY');
fs.mkdirSync(OUT_DIR, { recursive: true });

// ── helpers ─────────────────────────────────────────────────────────────────
const decodeEntities = (s) => !s ? s : s
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&quot;/g, '"').replace(/&#0?39;/g, "'").replace(/&apos;/g, "'")
  .replace(/&nbsp;/g, ' ').replace(/&ndash;|&#8211;/g, '–')
  .replace(/&mdash;|&#8212;/g, '—').replace(/&hellip;/g, '…')
  .replace(/&#8217;/g, "'").replace(/&#8220;|&#8221;/g, '"');
const clean = (html) => decodeEntities((html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());

// Strip legacy variant suffixes for SKU matching.
const normSku = (s) => (s || '').toString().trim().toUpperCase()
  .replace(/_(FRONT|BACK|DETAIL|ANGLE|MACRO|LIFESTYLE|CARD|PAIR|V\d+)$/i, '');

// Known hand-forged pieces (Ortega) per canonical sync rules.
const HANDMADE = new Set(['WM-RNG-001', 'WM-RNG-002', 'WM-RNG-007', 'WM-RNG-008']);

// ── color inference from material + name ────────────────────────────────────
function inferColor(material, name) {
  const t = `${material || ''} ${name || ''}`.toLowerCase();
  const rules = [
    [/opal|ópalo/, 'multicolor iridescent'],
    [/labradorite|labradorita/, 'blue/green flash'],
    [/moonstone|piedra luna/, 'white/blue sheen'],
    [/turquoise|turquesa/, 'turquoise'],
    [/amethyst|amatista/, 'purple'],
    [/jade/, 'green'],
    [/amber|ámbar|ambar/, 'amber/honey'],
    [/onyx|obsidian|obsidiana|ónix|onix/, 'black'],
    [/(wood|madera|horn|cuerno|bone|hueso|coco|coconut)/, 'natural brown'],
    [/(quartz|cuarzo|crystal|cristal)/, 'clear/white'],
    [/(copper|cobre)/, 'copper/red'],
    [/meteorite|meteorito/, 'dark metallic'],
    [/(bronze|brass|bronce|laton|latón)/, 'bronze/gold'],
    [/(gold|oro|18k|14k|gold-?fill)/, 'gold'],
    [/(sterling|silver|plata|alpaca|titanium|titanio|steel|acero|niobium|niobio|white\s?gold)/, 'silver'],
  ];
  for (const [re, color] of rules) if (re.test(t)) return color;
  return 'neutral metal';
}

// ── visual keywords from name + material + category ─────────────────────────
const SHAPE_WORDS = [
  'triangle','triangular','circle','circular','round','spiral','dart','ring','hoop',
  'crescent','moon','star','sun','solar','hook','drop','teardrop','spike','spear',
  'cross','geometric','organic','chain','articulated','disc','dome','cone','helix',
  'leaf','feather','serpent','snake','vilu','arrow','dagger','blade','coil','knot',
  'oval','square','diamond','tunnel','plug','weight','cluster','flower','floral',
];
function inferKeywords(name, material, cats) {
  const t = `${name || ''}`.toLowerCase();
  const kw = new Set();
  for (const w of SHAPE_WORDS) if (new RegExp(`\\b${w}`).test(t)) kw.add(w);
  const color = inferColor(material, name);
  if (color !== 'neutral metal') kw.add(color);
  const mat = (material || '').toLowerCase();
  if (/bronze|bronce/.test(mat)) kw.add('bronze gold tone');
  if (/silver|plata|sterling|alpaca/.test(mat)) kw.add('silver tone');
  for (const c of cats || []) kw.add(String(c).toLowerCase());
  return [...kw].slice(0, 10);
}

// ── form factor from category + sale unit ───────────────────────────────────
function inferForm(cats, saleUnit, name) {
  const c = (cats || []).map((x) => String(x).toLowerCase()).join(' ');
  const u = (saleUnit || '').toLowerCase();
  const pair = /par|pair/.test(u);
  if (/hanger|aro|earring|pendient/.test(c)) return pair ? 'earring pair' : 'earring (single/pair)';
  if (/ear weight|weight|peso/.test(c)) return 'ear weight';
  if (/plug|tunnel|expansion|gauge/.test(c)) return 'ear gauge (plug/tunnel)';
  if (/ring|anillo/.test(c)) return 'ring';
  if (/necklace|collar/.test(c)) return 'necklace';
  if (/amulet|amuleto|pendant/.test(c)) return 'pendant';
  if (/labret/.test(c)) return 'labret stud';
  if (/septum/.test(c)) return 'septum';
  if (/accessor|sculpt|art/.test(c)) return 'object / sculpture';
  return 'piece';
}

// ── fetch WooCommerce (all statuses, paginated) ─────────────────────────────
async function fetchWoo() {
  if (!WC_KEY || !WC_SECRET) throw new Error('Missing WC credentials');
  const auth = `consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
  const all = [];
  for (let page = 1; ; page++) {
    const res = await fetch(`${WC_URL}/products?per_page=100&page=${page}&status=any&${auth}`);
    if (!res.ok) throw new Error(`WC HTTP ${res.status} page ${page}`);
    const data = await res.json();
    all.push(...data);
    if (data.length < 100) break;
  }
  return all;
}

// ── fetch NocoDB (best-effort) ──────────────────────────────────────────────
async function fetchNoco() {
  if (!NOCO_TOKEN) { console.warn('[noco] no token — skipping'); return []; }
  try {
    const res = await fetch(`${NOCO_URL}/api/v2/tables/${NOCO_TABLE}/records?limit=1000`,
      { headers: { 'xc-token': NOCO_TOKEN } });
    if (!res.ok) { console.warn(`[noco] HTTP ${res.status} — skipping`); return []; }
    const j = await res.json();
    return j.list || [];
  } catch (e) { console.warn('[noco] failed:', e.message); return []; }
}

// ── main ────────────────────────────────────────────────────────────────────
const woo = await fetchWoo();
console.log(`[woo] fetched ${woo.length} products`);
const noco = await fetchNoco();
console.log(`[noco] fetched ${noco.length} records`);

// index NocoDB by normalized SKU
const nocoBySku = new Map();
for (const r of noco) {
  const k = normSku(r.SKU);
  if (k && !nocoBySku.has(k)) nocoBySku.set(k, r);
}
const matchedNocoSkus = new Set();

const firstStr = (v) => {
  if (v == null) return null;
  if (Array.isArray(v)) return v.length ? (typeof v[0] === 'object' ? (v[0].title || v[0].path || null) : v[0]) : null;
  const s = String(v).trim();
  return s === '' ? null : s;
};
const igFromUrl = (url) => {
  if (!url) return null;
  const m = String(url).match(/instagram\.com\/([^\/?#]+)/i);
  if (!m) return null;
  // Skip post/reel permalinks — those aren't profile handles.
  if (/^(p|reel|reels|tv|stories|explore)$/i.test(m[1])) return null;
  return '@' + m[1];
};
// Marketplace / dropship suppliers → imported, not independent maker.
const MARKETPLACE = /aliexpress|alibaba|amazon|dhgate|temu|wish|ebay|shein|1688/i;
// Treat NocoDB placeholder values as empty.
const meaningful = (v) => {
  const s = firstStr(v);
  if (!s) return null;
  return /^(n\/?a|none|other|otro|-|—|tbd|\?)$/i.test(s) ? null : s;
};

const entries = woo.map((p) => {
  const skuRaw = p.sku || '';
  const nocoKey = normSku(skuRaw);
  const n = nocoBySku.get(nocoKey) || null;
  if (n) matchedNocoSkus.add(nocoKey);

  const cats = (p.categories || []).map((c) => c.name);
  if (n && n['Categoría'] && !cats.includes(n['Categoría'])) cats.push(n['Categoría']);

  const material = firstStr(n?.Material) || null;
  const weightWoo = p.weight ? Math.round(parseFloat(p.weight) * 1000) : null; // kg→g
  const weightNoco = n?.['Peso g'] != null && n['Peso g'] !== '' ? Number(n['Peso g']) : null;

  const proveedor = firstStr(n?.Proveedor);
  const ig = igFromUrl(n?.['URL post IG']);
  let origin = 'imported-curated';
  if (HANDMADE.has(nocoKey)) origin = 'handmade';
  else if (proveedor && !MARKETPLACE.test(proveedor)) origin = 'curated-independent';

  const descPublic = clean(p.short_description) || clean(p.description)
    || firstStr(n?.['Descripción ritual']) || null;
  const descInternal = firstStr(n?.['Descripción interna']) || null;

  const photosWoo = (p.images || []).map((i) => i.src).filter(Boolean);
  const photosLocal = [];
  for (const f of (Array.isArray(n?.['Foto macro']) ? n['Foto macro'] : []))
    if (f?.path) photosLocal.push(f.path);

  const priceWoo = p.price ? Number(p.price) : null;
  const priceNoco = n?.['Precio venta USD'] != null && n['Precio venta USD'] !== '' ? Number(n['Precio venta USD']) : null;

  const stockQtyWoo = p.stock_quantity;
  const stockQtyNoco = n?.['Cantidad stock'] != null && n['Cantidad stock'] !== '' ? Number(n['Cantidad stock']) : null;

  return {
    sku: skuRaw || nocoKey || `(no-sku:${p.slug})`,
    slug: p.slug,
    name: decodeEntities(p.name),
    status_woo: p.status,
    categories: [...new Set(cats)],
    material_primary: material,
    weight_g: (() => { const w = weightNoco ?? weightWoo; return w == null ? null : Math.round(w * 10) / 10; })(),
    dimensions_mm: firstStr(n?.['Medida mm']) || (p.dimensions && (p.dimensions.length || p.dimensions.width) ? `${p.dimensions.length||'?'}x${p.dimensions.width||'?'}x${p.dimensions.height||'?'} cm` : null),
    origin,
    origin_artist: proveedor || null,
    ig_credit: ig,
    technique: meaningful(n?.Threading) || meaningful(n?.['Tipo de pieza']) || null,
    line: firstStr(n?.['Línea']) || null,
    estado_noco: firstStr(n?.Estado) || null,
    description_internal: descInternal,
    description_public: descPublic,
    keywords_visual: inferKeywords(p.name, material, cats),
    color_dominant_expected: inferColor(material, p.name),
    color_noco: firstStr(n?.Color) || null,
    form_factor: inferForm(cats, n?.['Unidad de venta'], p.name),
    stock_status: p.stock_status,
    stock_quantity: stockQtyWoo ?? stockQtyNoco,
    price_usd: priceWoo ?? priceNoco,
    photos_woo: photosWoo,
    photos_local: photosLocal,
    photos_pending: photosWoo.length === 0,
    has_nocodb: !!n,
    notes: firstStr(n?.Notas) || null,
  };
});

// NocoDB records with no WC counterpart — surfaced in report, not in spine.
const nocoOnly = noco.filter((r) => {
  const k = normSku(r.SKU);
  return k && !matchedNocoSkus.has(k);
}).map((r) => ({ sku: r.SKU, name: r.Title || r['Nombre interno'] || '(sin nombre)', estado: r.Estado || null }));

// ── write JSON ──────────────────────────────────────────────────────────────
const withPhotos = entries.filter((e) => !e.photos_pending).length;
const withNoco = entries.filter((e) => e.has_nocodb).length;
const payload = {
  meta: {
    generated: new Date().toISOString(),
    generator: 'scripts/tmp-build-product-index.mjs',
    sources: ['WooCommerce REST (status=any)', `NocoDB Piezas (${noco.length} records)`],
    total_products: entries.length,
    with_photos: withPhotos,
    without_photos: entries.length - withPhotos,
    with_nocodb_merge: withNoco,
    woo_only: entries.length - withNoco,
    nocodb_only_unmatched: nocoOnly.length,
  },
  products: entries,
  nocodb_only_unmatched: nocoOnly,
};
const jsonPath = path.join(OUT_DIR, 'product-index.json');
fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

// ── write Markdown ──────────────────────────────────────────────────────────
const today = new Date().toISOString().slice(0, 10);
const rows = entries
  .sort((a, b) => (a.sku || '').localeCompare(b.sku || ''))
  .map((e) => {
    const photos = e.photos_pending ? '<span style="color:red">**NO**</span>' : `${e.photos_woo.length}`;
    const noco = e.has_nocodb ? '✓' : '—';
    return `| \`${e.sku}\` | ${e.name} | ${e.origin}${e.origin_artist ? ' · ' + e.origin_artist : ''} | ${e.stock_status} | ${photos} | ${noco} |`;
  });
const md = [
  '---',
  'tipo: product-memory-index',
  `generado: ${today}`,
  `fuente: WooCommerce + NocoDB`,
  'tags: [productos, memoria, indice, catalogo]',
  '---',
  '',
  '# Product Memory Index — Wenu Mapu',
  '',
  '> Memoria maestra permanente de cada producto. Fuente única para que cualquier agente',
  `> tenga contexto completo en 1 lectura. Datos: \`product-index.json\` (misma carpeta).`,
  `> Generado automáticamente — re-correr \`scripts/tmp-build-product-index.mjs\` para refrescar.`,
  '',
  '## Resumen',
  '',
  `- **Total productos (Woo):** ${entries.length}`,
  `- **Con fotos:** ${withPhotos}  ·  **Sin fotos:** ${entries.length - withPhotos}`,
  `- **Con info NocoDB:** ${withNoco}  ·  **Solo Woo:** ${entries.length - withNoco}`,
  `- **Registros NocoDB sin match en Woo:** ${nocoOnly.length}`,
  '',
  '## Catálogo',
  '',
  '| SKU | Name | Origin | Stock | Photos | NocoDB |',
  '|---|---|---|---|---|---|',
  ...rows,
  '',
  '## NocoDB sin contraparte en WooCommerce',
  '',
  '> Piezas en el inventario maestro que aún no existen como producto en la tienda.',
  '',
  '| SKU | Name | Estado |',
  '|---|---|---|',
  ...nocoOnly.sort((a, b) => (a.sku || '').localeCompare(b.sku || '')).map((r) => `| \`${r.sku}\` | ${r.name} | ${r.estado || '—'} |`),
  '',
].join('\n');
const mdPath = path.join(OUT_DIR, 'product-index.md');
fs.writeFileSync(mdPath, md);

console.log('\n=== DONE ===');
console.log('JSON:', jsonPath);
console.log('MD  :', mdPath);
console.log(`products=${entries.length} withPhotos=${withPhotos} withoutPhotos=${entries.length - withPhotos} withNoco=${withNoco} wooOnly=${entries.length - withNoco} nocoOnlyUnmatched=${nocoOnly.length}`);
