#!/usr/bin/env node
/**
 * radiografia-comercial.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * CEO mindset audit 2026-06-04: ¿cuántos dólares están atrapados en productos
 * a una tarea de distancia de estar publicados? READ-ONLY.
 *
 * Input:
 *   /tmp/wenu-nocodb-snapshot.json (191 records, fresh)
 *   WC live: /wp-json/wc/v3/products + /reports/top_sellers
 *
 * Output:
 *   /tmp/wenu-radiografia.json (datos estructurados)
 *   stdout: tabla resumen
 *   ~/Obsidian/WenuAgent/30-Auditorias/2026-06-04-radiografia-comercial.md (escrito aparte)
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const env = {};
const envTxt = fs.readFileSync(path.join(os.homedir(),'wenu-agent-hub/.env'),'utf8');
for (const line of envTxt.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) env[m[1]] = m[2].trim();
}
const wcAuth = 'Basic ' + Buffer.from(env.WOOCOMMERCE_KEY+':'+env.WOOCOMMERCE_SECRET).toString('base64');

const all = JSON.parse(fs.readFileSync('/tmp/wenu-nocodb-snapshot.json','utf8'));

// Helpers
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const hasNum = v => typeof v === 'number' && Number.isFinite(v);
const hasPhoto = v => Array.isArray(v) && v.length > 0 && v[0]?.path;
const num = v => hasNum(v) ? v : 0;

// Fetch WC products to know who's already published
console.log('Fetching WC catalog…');
let wc = [];
for (let page = 1; page <= 10; page++) {
  const b = await fetch(`${env.WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100&status=any&page=${page}`,
    { headers: { Authorization: wcAuth } }).then(r => r.json());
  if (!Array.isArray(b) || b.length === 0) break;
  wc = wc.concat(b);
  if (b.length < 100) break;
}
const norm = s => (s||'').toUpperCase().replace(/_(front|back|detail|angle|macro|lifestyle|card|pair|v\d+)$/i,'');
const wcByNormSku = {};
for (const p of wc) {
  const k = norm(p.sku);
  if (k) (wcByNormSku[k] = wcByNormSku[k] || []).push(p);
}
const isInWC = sku => Boolean(wcByNormSku[norm(sku)]);
const wcPublishedStatus = sku => {
  const arr = wcByNormSku[norm(sku)];
  if (!arr) return null;
  return arr.some(p => p.status === 'publish') ? 'publish' : arr[0].status;
};
console.log(`  ${wc.length} products in WC (${Object.keys(wcByNormSku).length} unique normalized SKUs)`);

// Try WC best-sellers report
let topSellers = null;
try {
  const r = await fetch(`${env.WOOCOMMERCE_URL}/wp-json/wc/v3/reports/top_sellers?period=year`,
    { headers: { Authorization: wcAuth } }).then(r => r.json());
  if (Array.isArray(r)) topSellers = r;
} catch {}

// Sales/orders count probe
let salesAvailable = false, lastSale = null;
try {
  const r = await fetch(`${env.WOOCOMMERCE_URL}/wp-json/wc/v3/orders?per_page=5&status=completed`,
    { headers: { Authorization: wcAuth } }).then(r => r.json());
  if (Array.isArray(r) && r.length > 0) {
    salesAvailable = true;
    lastSale = r[0].date_created;
  }
} catch {}

// ============ FASE 1: counts ============
const total = all.length;
const withFotoRef = all.filter(r => hasPhoto(r['Foto referencia'])).length;
const withFotoMacro = all.filter(r => hasPhoto(r['Foto macro'])).length;
const withDesc = all.filter(r => isStr(r['Descripción interna'])).length;
const inWC = all.filter(r => isInWC(r.SKU)).length;
const inWCPublished = all.filter(r => wcPublishedStatus(r.SKU) === 'publish').length;
const withStockGtZero = all.filter(r => num(r['Cantidad stock']) > 0).length;
const withStockAny = all.filter(r => r['Cantidad stock'] != null).length;
const ready = all.filter(r => r['Estado'] === 'READY').length;
const readyInWC = all.filter(r => r['Estado'] === 'READY' && isInWC(r.SKU)).length;
const readyNotPublished = all.filter(r => r['Estado'] === 'READY' && wcPublishedStatus(r.SKU) !== 'publish').length;
const readyAndPublished = all.filter(r => r['Estado'] === 'READY' && wcPublishedStatus(r.SKU) === 'publish').length;
const withCost = all.filter(r => num(r['Costo USD']) > 0).length;

const stockTotal = all.reduce((s,r) => s + num(r['Cantidad stock']), 0);

// ============ FASE 2: tiering ============
// Tier A — READY + photo macro + stock>0  → publicable HOY
// Tier B — READY + sin photo macro       → una sesión foto los desbloquea
// Tier C — has photo macro + sin desc    → documentación los desbloquea
// Tier D — incompletos (multiple gaps)   → no tocar pre-Vegas
function tier(r) {
  const isReady = r['Estado'] === 'READY';
  const hasMacro = hasPhoto(r['Foto macro']);
  const hasRef = hasPhoto(r['Foto referencia']);
  const hasDescL = isStr(r['Descripción interna']);
  const hasStockOk = r['Cantidad stock'] != null;  // null != 0; 0 está OK
  const hasPriceGtZero = num(r['Precio venta USD']) > 0;
  const hasCat = isStr(r['Categoría']);
  const hasWeight = hasNum(r['Peso g']);

  if (isReady && hasMacro && hasStockOk && hasPriceGtZero && hasDescL && hasCat && hasWeight) return 'A';
  if (isReady && !hasMacro && hasPriceGtZero) return 'B';
  if (hasMacro && !hasDescL) return 'C';
  return 'D';
}
const byTier = { A: [], B: [], C: [], D: [] };
for (const r of all) byTier[tier(r)].push(r);

const tierValue = (rs) => rs.reduce((s,r) => s + num(r['Precio venta USD']) * Math.max(num(r['Cantidad stock']), 0), 0);
const tierStockUnits = (rs) => rs.reduce((s,r) => s + Math.max(num(r['Cantidad stock']), 0), 0);

const tiers = {
  A: { count: byTier.A.length, value: tierValue(byTier.A), units: tierStockUnits(byTier.A), samples: byTier.A.slice(0, 5) },
  B: { count: byTier.B.length, value: tierValue(byTier.B), units: tierStockUnits(byTier.B), samples: byTier.B.slice(0, 5) },
  C: { count: byTier.C.length, value: tierValue(byTier.C), units: tierStockUnits(byTier.C), samples: byTier.C.slice(0, 5) },
  D: { count: byTier.D.length, value: tierValue(byTier.D), units: tierStockUnits(byTier.D), samples: byTier.D.slice(0, 5) },
};

// ============ FASE 3: insights ============
// READY but not in WC at all OR not published
const readyNotInWC = all.filter(r => r['Estado'] === 'READY' && !isInWC(r.SKU));
const readyDraftInWC = all.filter(r => r['Estado'] === 'READY' && isInWC(r.SKU) && wcPublishedStatus(r.SKU) !== 'publish');
const readyNotPublishedValue = (readyNotInWC.concat(readyDraftInWC))
  .reduce((s,r) => s + num(r['Precio venta USD']) * Math.max(num(r['Cantidad stock']), 0), 0);

// Top 10 margin (only where cost present)
const withMargin = all.filter(r => num(r['Costo USD']) > 0 && num(r['Precio venta USD']) > 0)
  .map(r => ({
    sku: r.SKU,
    title: r.Title || r['Nombre interno'] || '',
    price: r['Precio venta USD'],
    cost: r['Costo USD'],
    margin_usd: r['Precio venta USD'] - r['Costo USD'],
    margin_pct: ((r['Precio venta USD'] - r['Costo USD']) / r['Precio venta USD'] * 100),
    stock: num(r['Cantidad stock']),
    margin_total: (r['Precio venta USD'] - r['Costo USD']) * Math.max(num(r['Cantidad stock']), 0),
  }))
  .sort((a, b) => b.margin_total - a.margin_total)
  .slice(0, 10);

// Output structured JSON
const out = {
  generated_at: new Date().toISOString(),
  fase1: {
    physical_inventory_proxy: 'N/A — no inventory count outside NocoDB',
    noco_records: total,
    with_foto_referencia: withFotoRef,
    with_foto_macro: withFotoMacro,
    with_descripcion_interna: withDesc,
    in_wc: inWC,
    in_wc_published: inWCPublished,
    with_stock_gt_zero: withStockGtZero,
    with_stock_any: withStockAny,
    ready: ready,
    ready_in_wc: readyInWC,
    ready_published: readyAndPublished,
    ready_not_published: readyNotPublished,
    with_costo_usd: withCost,
    stock_total_units: stockTotal,
  },
  fase2_tiers: tiers,
  fase3: {
    ready_not_published_count: readyNotPublished,
    ready_not_in_wc_at_all: readyNotInWC.length,
    ready_draft_in_wc: readyDraftInWC.length,
    ready_not_published_value_usd: readyNotPublishedValue,
    cost_coverage_pct: (withCost / total * 100).toFixed(1),
    top10_margin: withMargin,
    wc_sales_api_available: salesAvailable,
    last_completed_sale: lastSale,
    top_sellers_data: topSellers,
  },
};
fs.writeFileSync('/tmp/wenu-radiografia.json', JSON.stringify(out, null, 2));

// Console quick view
console.log();
console.log('═══════════════════════════════════════════════════════════════');
console.log('  FASE 1 — RADIOGRAFÍA COMERCIAL  (2026-06-04)');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`Total records NocoDB:           ${total}`);
console.log(`Con Foto referencia:            ${withFotoRef}`);
console.log(`Con Foto macro:                 ${withFotoMacro}`);
console.log(`Con Descripción interna:        ${withDesc}`);
console.log(`Publicados en WC (status=publish): ${inWCPublished}`);
console.log(`Existen en WC (any status):     ${inWC}`);
console.log(`Con stock > 0:                  ${withStockGtZero}  (stock total: ${stockTotal} unidades)`);
console.log(`Estado=READY:                   ${ready}`);
console.log(`READY pero NO publicados:       ${readyNotPublished}`);
console.log(`Con Costo USD registrado:       ${withCost} / ${total} (${(withCost/total*100).toFixed(1)}%)`);
console.log();
console.log('═══════════════════════════════════════════════════════════════');
console.log('  FASE 2 — TIERING DE DINERO ATRAPADO');
console.log('═══════════════════════════════════════════════════════════════');
for (const t of ['A','B','C','D']) {
  const tt = tiers[t];
  console.log(`Tier ${t}:  ${String(tt.count).padStart(3)} productos  |  ${tt.units} unidades  |  $${tt.value.toFixed(0)} USD`);
}
console.log();
console.log('═══════════════════════════════════════════════════════════════');
console.log('  FASE 3 — INSIGHTS COMERCIALES');
console.log('═══════════════════════════════════════════════════════════════');
console.log(`READY no publicados:            ${readyNotPublished} productos  |  $${readyNotPublishedValue.toFixed(0)} USD atrapados`);
console.log(`  → no existen en WC:           ${readyNotInWC.length}`);
console.log(`  → existen en WC pero draft:   ${readyDraftInWC.length}`);
console.log(`Cost coverage:                  ${(withCost/total*100).toFixed(1)}% (solo ${withCost} de ${total} tienen Costo USD)`);
console.log(`WC sales API accesible:         ${salesAvailable ? 'sí' : 'no'}`);
console.log(`Top sellers data:               ${topSellers ? `${topSellers.length} items` : 'N/A'}`);
console.log();
console.log('Top 10 margen $ (cost × stock × margin):');
for (const m of withMargin) {
  console.log(`  ${m.sku.padEnd(15)} $${String(m.price).padStart(4)} - $${String(m.cost).padEnd(6)} = $${m.margin_usd.toFixed(0)}/u  pct=${m.margin_pct.toFixed(0)}%  stock=${m.stock}  total=$${m.margin_total.toFixed(0)}`);
}
console.log();
console.log('Persisted: /tmp/wenu-radiografia.json');
