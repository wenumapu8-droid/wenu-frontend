#!/usr/bin/env node
/**
 * audit-nocodb.mjs
 *
 * Refreshes the product audit by pulling all NocoDB records and computing
 * field completeness per product. Outputs:
 *   - /tmp/wenu-nocodb-snapshot.json   (raw records)
 *   - /tmp/wenu-audit.json              (per-product audit)
 *   - ~/Obsidian/WenuAgent/20-Operaciones/audit-productos-<YYYY-MM-DD>.md
 *
 * Required env:
 *   NOCODB_TOKEN   — xc-token API key (nc_pat_*)
 *   NOCODB_URL     — base URL, default http://localhost:8080
 *   NOCODB_TABLE   — table id of "Piezas", default m5s3jnm72tzhk9g
 *
 * Usage:
 *   NOCODB_TOKEN=nc_pat_... node scripts/audit-nocodb.mjs
 *   node scripts/audit-nocodb.mjs --help
 *
 * Read-only. Does NOT modify NocoDB or WC.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(fs.readFileSync(import.meta.url.replace('file://',''), 'utf8').split('\n').slice(1, 22).join('\n'));
  process.exit(0);
}

const TOKEN = process.env.NOCODB_TOKEN;
const URL = process.env.NOCODB_URL || 'http://localhost:8080';
const TABLE = process.env.NOCODB_TABLE || 'm5s3jnm72tzhk9g';

if (!TOKEN) {
  console.error('ERROR: NOCODB_TOKEN env var required.');
  console.error('Get it from http://localhost:8080 → avatar → Account Settings → Tokens');
  process.exit(1);
}

const REQUIRED = {
  'Title':              { weight: 10, label: 'Título inglés' },
  'SKU':                { weight: 10, label: 'SKU' },
  'Foto macro':         { weight: 10, label: 'Foto macro' },
  'Categoría':          { weight: 8,  label: 'Categoría' },
  'Material':           { weight: 8,  label: 'Material' },
  'Precio venta USD':   { weight: 10, label: 'Precio venta' },
  'Cantidad stock':     { weight: 6,  label: 'Stock' },
  'Costo USD':          { weight: 4,  label: 'Costo' },
  'Descripción ritual': { weight: 9,  label: 'Descripción ritual' },
  'Descripción interna':{ weight: 3,  label: 'Descripción interna' },
  'Nombre ritual':      { weight: 6,  label: 'Nombre ritual mapudungun' },
  'Nombre interno':     { weight: 4,  label: 'Nombre interno' },
  'Peso g':             { weight: 5,  label: 'Peso (g)' },
  'Línea':              { weight: 3,  label: 'Línea de colección' },
  'Estado':             { weight: 2,  label: 'Estado workflow' },
  'Foto referencia':    { weight: 2,  label: 'Foto referencia' },
  'Subtipo piercing':   { weight: 1,  label: 'Subtipo piercing' },
  'Threading':          { weight: 1,  label: 'Threading' },
  'Unidad de venta':    { weight: 2,  label: 'Unidad venta' },
  'Ubicación vitrina':  { weight: 1,  label: 'Ubicación física' },
  'URL WooCommerce':    { weight: 3,  label: 'URL WC' },
  'URL post IG':        { weight: 2,  label: 'URL post IG' },
  'Notas':              { weight: 1,  label: 'Notas internas' },
};

console.log(`[audit-nocodb] fetching ${TABLE} from ${URL}…`);

const resp = await fetch(`${URL}/api/v2/tables/${TABLE}/records?limit=200`, {
  headers: { 'xc-token': TOKEN }
});
if (!resp.ok) {
  console.error(`HTTP ${resp.status} fetching NocoDB`);
  process.exit(2);
}
const data = await resp.json();
const records = data.list || [];
console.log(`  fetched ${records.length} records`);

const snapshotPath = '/tmp/wenu-nocodb-snapshot.json';
fs.writeFileSync(snapshotPath, JSON.stringify(records, null, 2));
console.log(`  snapshot → ${snapshotPath}`);

const audit = records.map(r => {
  const missing = [], present = [];
  let score = 0, maxScore = 0;
  for (const [field, meta] of Object.entries(REQUIRED)) {
    maxScore += meta.weight;
    const v = r[field];
    const isEmpty = v == null || v === '' || (Array.isArray(v) && v.length === 0);
    if (isEmpty) missing.push(meta.label);
    else { present.push(meta.label); score += meta.weight; }
  }
  const fotos = Array.isArray(r['Foto macro']) ? r['Foto macro'] : [];
  let photoNote = '';
  if (fotos.length === 0) photoNote = 'FALTA · necesita sesión foto macro';
  else {
    const f = fotos[0];
    if (f.width && f.height) {
      const minDim = Math.min(f.width, f.height);
      if (minDim < 1200) photoNote = `⚠️ resolución baja (${f.width}x${f.height})`;
      else photoNote = `✓ ${f.width}x${f.height}`;
    }
  }
  return {
    id: r.Id, sku: r.SKU,
    name: r.Title || r['Nombre interno'] || '(sin nombre)',
    price: r['Precio venta USD'],
    score, maxScore,
    completeness: Math.round(100 * score / maxScore),
    missing, present_count: present.length, photoNote
  };
}).sort((a, b) => a.completeness - b.completeness);

const auditPath = '/tmp/wenu-audit.json';
fs.writeFileSync(auditPath, JSON.stringify(audit, null, 2));
console.log(`  audit  → ${auditPath}`);

// Generate Markdown
const today = new Date().toISOString().slice(0, 10);
const mdPath = path.join(os.homedir(), 'Obsidian/WenuAgent/20-Operaciones', `audit-productos-${today}.md`);
const md = [
  '---',
  'tipo: audit-productos',
  `fecha: ${today}`,
  `fuente: NocoDB Inventario maestro (${records.length} productos)`,
  'tags: [productos, audit, workflow]',
  '---',
  '',
  `# Auditoría productos · ${today}`,
  '',
  `> Generado automáticamente por \`scripts/audit-nocodb.mjs\`.`,
  '',
  `## Resumen`,
  '',
  `- Total productos: **${records.length}**`,
  `- Foto macro OK (>1200px): ${audit.filter(a => a.photoNote.startsWith('✓')).length}`,
  `- Foto baja resolución: ${audit.filter(a => a.photoNote.startsWith('⚠️')).length}`,
  `- FALTA foto: ${audit.filter(a => a.photoNote.startsWith('FALTA')).length}`,
  '',
  '## Auditoría por producto',
  '',
  ...audit.map(a => {
    const icon = a.completeness >= 85 ? '🟢' : a.completeness >= 70 ? '🟡' : '🔴';
    return `### ${icon} ${a.sku} · ${a.name}\n\n` +
      `- Completitud: **${a.completeness}%** (${a.score}/${a.maxScore})\n` +
      `- Precio: $${a.price || '—'}\n` +
      `- Foto: ${a.photoNote}\n` +
      (a.missing.length ? `- **Faltan:** ${a.missing.join(' · ')}\n` : `- **Completo** ✓\n`);
  }),
  '',
  '<!-- wenu-backlinks -->',
  '[[Home]] · [[workflow-producto]] · [[photos-retake-' + today + ']]',
].join('\n');
fs.writeFileSync(mdPath, md);
console.log(`  markdown → ${mdPath}`);
console.log('[audit-nocodb] done');
