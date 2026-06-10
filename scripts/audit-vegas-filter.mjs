#!/usr/bin/env node
/**
 * audit-vegas-filter.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Aplica el filtro duro de Ocin (2026-06-04 pre-Vegas) sobre el snapshot
 * crudo de NocoDB y reporta:
 *   - Cuántos productos PASAN los 8 criterios → eligibles para sync a WC
 *   - Cuántos fallan, agrupados por campo faltante
 *   - Lista de SKUs eligibles y SKUs rejected por motivo
 *
 * Filtro duro:
 *   1. Nombre (Title o Nombre interno)
 *   2. SKU
 *   3. Precio venta USD > 0
 *   4. Cantidad stock no-null (puede ser 0)
 *   5. Foto macro (al menos 1 imagen real)
 *   6. Descripción interna no vacía
 *   7. Categoría no vacía
 *   8. Peso g no-null (puede ser estimado)
 *
 * INPUT:  /tmp/wenu-nocodb-snapshot.json (generado por audit-nocodb.mjs)
 * OUTPUT: /tmp/wenu-vegas-filter.json + stdout reporte
 */

import fs from 'node:fs';

const SNAPSHOT = '/tmp/wenu-nocodb-snapshot.json';
if (!fs.existsSync(SNAPSHOT)) {
  console.error(`Snapshot missing at ${SNAPSHOT}. Run audit-nocodb.mjs first.`);
  process.exit(1);
}

const records = JSON.parse(fs.readFileSync(SNAPSHOT, 'utf8'));
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const hasNum = v => typeof v === 'number' && Number.isFinite(v);
const hasPhoto = v => Array.isArray(v) && v.length > 0 && v[0]?.path;

const CRITERIA = [
  { id: 'name',  label: 'Nombre',           test: r => isStr(r.Title) || isStr(r['Nombre interno']) },
  { id: 'sku',   label: 'SKU',              test: r => isStr(r.SKU) },
  { id: 'price', label: 'Precio venta USD>0', test: r => hasNum(r['Precio venta USD']) && r['Precio venta USD'] > 0 },
  { id: 'stock', label: 'Cantidad stock',   test: r => r['Cantidad stock'] != null },
  { id: 'photo', label: 'Foto macro',       test: r => hasPhoto(r['Foto macro']) },
  { id: 'desc',  label: 'Descripción interna', test: r => isStr(r['Descripción interna']) },
  { id: 'cat',   label: 'Categoría',        test: r => isStr(r['Categoría']) },
  { id: 'weight', label: 'Peso g',           test: r => hasNum(r['Peso g']) },
];

const eligible = [];
const rejected = [];
const failByCriterion = Object.fromEntries(CRITERIA.map(c => [c.id, []]));

for (const r of records) {
  const fails = CRITERIA.filter(c => !c.test(r));
  if (fails.length === 0) {
    eligible.push(r);
  } else {
    rejected.push({ sku: r.SKU || `(id ${r.Id})`, title: r.Title || r['Nombre interno'] || '', missing: fails.map(f => f.id) });
    for (const f of fails) failByCriterion[f.id].push(r.SKU || `(id ${r.Id})`);
  }
}

// Reporte stdout
console.log('═══════════════════════════════════════════════════════════════');
console.log('  WENU MAPU — VEGAS FILTER AUDIT  ·  2026-06-04');
console.log('═══════════════════════════════════════════════════════════════');
console.log();
console.log(`Total NocoDB Piezas:  ${records.length}`);
console.log(`✅ Eligible for sync:  ${eligible.length}`);
console.log(`❌ Rejected:           ${rejected.length}`);
console.log();
console.log('── Rejection breakdown (a record can fail multiple criteria) ──');
for (const c of CRITERIA) {
  const n = failByCriterion[c.id].length;
  if (n > 0) console.log(`  ${c.label.padEnd(28)} missing in ${n} records`);
}
console.log();
console.log('── ELIGIBLE SKUs (one line each: SKU · price · stock · photo? · weight g) ──');
for (const r of eligible) {
  console.log(`  ${r.SKU.padEnd(15)} $${String(r['Precio venta USD']).padEnd(6)} stock=${String(r['Cantidad stock']).padEnd(3)} weight=${String(r['Peso g']).padEnd(6)} · ${(r.Title||'').slice(0,40)}`);
}
console.log();
console.log('── REJECTED SKUs (grouped by missing field) ──');
for (const c of CRITERIA) {
  const skus = failByCriterion[c.id];
  if (skus.length === 0) continue;
  console.log();
  console.log(`  Missing ${c.label} (${skus.length}):`);
  // print 6 per line
  for (let i = 0; i < skus.length; i += 6) {
    console.log('    ' + skus.slice(i, i + 6).join('  '));
  }
}

// Persistir
const output = {
  generated_at: new Date().toISOString(),
  total: records.length,
  eligible_count: eligible.length,
  rejected_count: rejected.length,
  by_missing_field: Object.fromEntries(Object.entries(failByCriterion).map(([k, v]) => [k, v])),
  eligible: eligible.map(r => ({
    sku: r.SKU,
    title: r.Title,
    nombre_interno: r['Nombre interno'],
    price: r['Precio venta USD'],
    stock: r['Cantidad stock'],
    weight_g: r['Peso g'],
    category: r['Categoría'],
    material: r.Material,
    line: r['Línea'],
    state: r['Estado'],
    has_macro: hasPhoto(r['Foto macro']),
    has_ref: hasPhoto(r['Foto referencia']),
    desc_len: (r['Descripción interna'] || '').length,
  })),
  rejected,
};
fs.writeFileSync('/tmp/wenu-vegas-filter.json', JSON.stringify(output, null, 2));
console.log();
console.log('Persisted: /tmp/wenu-vegas-filter.json');
