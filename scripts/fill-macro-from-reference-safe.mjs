#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const SAFE_SKUS = [
  'WM-EAR-002','WM-EAR-003','WM-EAR-006','WM-EAR-007','WM-EAR-010','WM-EAR-011','WM-EAR-012','WM-EAR-013','WM-EAR-014','WM-EAR-015','WM-EAR-016','WM-EAR-017','WM-EAR-018','WM-EAR-019',
  'WM-HAN-015','WM-HAN-016','WM-HAN-021','WM-HAN-027','WM-HAN-031','WM-HAN-032','WM-HAN-033',
  'WM-NCK-001','WM-NCK-002','WM-NCK-003','WM-NCK-004','WM-NCK-005','WM-NCK-006','WM-NCK-007','WM-NCK-008',
  'WM-OTH-004','WM-OTH-005','WM-PLG-018'
];

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const TOKEN = process.env.NOCODB_TOKEN;
const URL = process.env.NOCODB_URL || 'http://localhost:8080';
const TABLE = process.env.NOCODB_TABLE || 'm5s3jnm72tzhk9g';
const H = { 'xc-token': TOKEN, 'Content-Type': 'application/json' };
const recURL = `${URL}/api/v2/tables/${TABLE}/records`;
const backupsDir = path.join(process.cwd(), 'data', 'backups');

if (!TOKEN) {
  console.error('ERROR: NOCODB_TOKEN requerido.');
  process.exit(1);
}

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function req(url, opts = {}, tries = 8) {
  let lastStatus = 0, lastBody = '';
  for (let i = 0; i < tries; i++) {
    try {
      const resp = await fetch(url, { headers: H, ...opts });
      if (resp.ok) return resp;
      lastStatus = resp.status;
      lastBody = await resp.text().catch(() => '');
    } catch (e) {
      lastBody = e.message;
    }
    await sleep(400 * (i + 1));
  }
  console.error(`Fallo tras ${tries} intentos. Ultimo HTTP ${lastStatus}: ${String(lastBody).slice(0, 300)}`);
  process.exit(2);
}

async function fetchAll() {
  const out = [];
  let offset = 0;
  while (true) {
    const resp = await req(`${recURL}?limit=200&offset=${offset}`);
    const data = await resp.json();
    const list = data.list || [];
    out.push(...list);
    if (list.length < 200) break;
    offset += 200;
  }
  return out;
}

async function patch(updates) {
  const results = [];
  const CHUNK = 10;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const slice = updates.slice(i, i + CHUNK);
    const resp = await req(recURL, { method: 'PATCH', body: JSON.stringify(slice) });
    results.push(await resp.json());
  }
  return results;
}

console.log(`[fill-macro] leyendo ${TABLE} de ${URL}...`);
const records = await fetchAll();
const bySku = new Map(records.map(r => [r.SKU, r]));
const updates = [];
const backup = [];
const skipped = [];

for (const sku of SAFE_SKUS) {
  const r = bySku.get(sku);
  if (!r) {
    skipped.push({ sku, reason: 'missing record' });
    continue;
  }
  const macro = r['Foto macro'];
  const ref = r['Foto referencia'];
  if (Array.isArray(macro) && macro.length > 0) {
    skipped.push({ sku, reason: 'already has macro', macro_count: macro.length });
    continue;
  }
  if (!Array.isArray(ref) || ref.length === 0) {
    skipped.push({ sku, reason: 'missing reference' });
    continue;
  }
  backup.push({
    Id: r.Id,
    SKU: sku,
    Title: r.Title,
    oldFotoMacro: macro || [],
    oldFotoReferencia: ref || []
  });
  updates.push({
    Id: r.Id,
    'Foto macro': [ref[0]]
  });
}

console.log(`candidatos seguros: ${SAFE_SKUS.length}`);
console.log(`updates listos: ${updates.length}`);
if (skipped.length) {
  console.log('skipped:');
  for (const s of skipped) console.log(JSON.stringify(s));
}
for (const u of updates) {
  const b = backup.find(x => x.Id === u.Id);
  console.log(`OK ${b.SKU} <= ${b.oldFotoReferencia?.[0]?.title || b.oldFotoReferencia?.[0]?.path || 'ref[0]'}`);
}

if (!APPLY) {
  console.log('[dry-run] no se escribio nada. usar --apply para aplicar');
  process.exit(0);
}

if (updates.length === 0) {
  console.log('Nada para aplicar.');
  process.exit(0);
}

fs.mkdirSync(backupsDir, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupsDir, `fill-macro-from-reference-${ts}.json`);
fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
console.log(`[backup] ${backupPath}`);
await patch(updates);
console.log(`[apply] ${updates.length} registros actualizados.`);
console.log(`[revert-manual] usar backup ${backupPath} para restaurar Foto macro si hace falta.`);
