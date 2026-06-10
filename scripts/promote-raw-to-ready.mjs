#!/usr/bin/env node
/**
 * promote-raw-to-ready.mjs
 *
 * Ola A del backlog RAW→READY: promueve a Estado='READY' las piezas que ya
 * estan data-completas (Foto macro + Precio venta + Descripcion ritual) pero
 * siguen marcadas RAW.
 *
 * Seguridad:
 *   - DRY-RUN por defecto. Solo escribe con --apply.
 *   - Backup reversible antes de escribir: data/backups/promote-<ts>.json
 *   - Excluye entradas de indice/archivo ([INDICE / [ARCHIVO en el titulo).
 *
 * Env:
 *   NOCODB_TOKEN  — xc-token (nc_pat_*)  [requerido]
 *   NOCODB_URL    — default http://localhost:8080
 *   NOCODB_TABLE  — default m5s3jnm72tzhk9g
 *
 * Uso:
 *   NOCODB_TOKEN=nc_pat_... node scripts/promote-raw-to-ready.mjs          # dry-run
 *   NOCODB_TOKEN=nc_pat_... node scripts/promote-raw-to-ready.mjs --apply  # escribe
 *
 * Revertir:
 *   node scripts/promote-raw-to-ready.mjs --revert data/backups/promote-<ts>.json
 */

import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const revertIdx = args.indexOf('--revert');
const REVERT = revertIdx !== -1 ? args[revertIdx + 1] : null;
const onlyIdx = args.indexOf('--only-file');
const ONLY = onlyIdx !== -1
  ? new Set(fs.readFileSync(args[onlyIdx + 1], 'utf8').split('\n').map(s => s.trim()).filter(Boolean))
  : null;

const TOKEN = process.env.NOCODB_TOKEN;
const URL = process.env.NOCODB_URL || 'http://localhost:8080';
const TABLE = process.env.NOCODB_TABLE || 'm5s3jnm72tzhk9g';

if (!TOKEN) {
  console.error('ERROR: NOCODB_TOKEN requerido. NocoDB → avatar → Account Settings → Tokens (nc_pat_*).');
  process.exit(1);
}

const H = { 'xc-token': TOKEN, 'Content-Type': 'application/json' };
const recURL = `${URL}/api/v2/tables/${TABLE}/records`;
const backupsDir = path.join(process.cwd(), 'data', 'backups');

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// NocoDB local es flaky (devuelve 400/500 intermitentes). Reintentar con backoff.
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
  console.error(`Fallo tras ${tries} intentos. Ultimo HTTP ${lastStatus}: ${String(lastBody).slice(0, 200)}`);
  process.exit(2);
}

function isEmpty(v) {
  return v == null || v === '' || (Array.isArray(v) && v.length === 0);
}
function get(r, ...keys) {
  for (const k of keys) if (r[k] !== undefined) return r[k];
  return undefined;
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
  // NocoDB v2 acepta array de objetos con el campo Id. Lotes chicos para no estresar al server flaky.
  const results = [];
  const CHUNK = 10;
  for (let i = 0; i < updates.length; i += CHUNK) {
    const slice = updates.slice(i, i + CHUNK);
    const resp = await req(recURL, { method: 'PATCH', body: JSON.stringify(slice) });
    results.push(await resp.json());
  }
  return results;
}

// ---- REVERT ----
if (REVERT) {
  const bak = JSON.parse(fs.readFileSync(REVERT, 'utf8'));
  console.log(`[revert] restaurando ${bak.length} piezas a su Estado previo…`);
  const updates = bak.map(b => ({ Id: b.id, Estado: b.oldEstado }));
  await patch(updates);
  console.log('[revert] listo.');
  process.exit(0);
}

// ---- DRY-RUN / APPLY ----
console.log(`[promote] leyendo ${TABLE} de ${URL}…`);
const records = await fetchAll();
console.log(`  ${records.length} registros`);

const eligible = [];
const excluded = [];
for (const r of records) {
  const estado = get(r, 'Estado');
  if (estado !== 'RAW') continue;
  const foto = get(r, 'Foto macro', 'Foto_macro');
  const precio = get(r, 'Precio venta USD', 'Precio_venta_USD');
  const desc = get(r, 'Descripción ritual', 'Descripcion_ritual', 'Descripción_ritual');
  const sku = get(r, 'SKU');
  const title = get(r, 'Title', 'title') || '';
  const stock = get(r, 'Cantidad stock', 'Cantidad_stock');

  const complete = !isEmpty(foto) && Number(precio) > 0 && !isEmpty(desc);
  if (!complete) continue;

  if (/\[(INDICE|ARCHIVO)/i.test(title)) {
    excluded.push({ sku, title, reason: 'indice/archivo' });
    continue;
  }
  if (ONLY && !ONLY.has(sku)) {
    excluded.push({ sku, title, reason: 'fuera de allowlist' });
    continue;
  }
  eligible.push({ id: r.Id, sku, title: title.slice(0, 48), stock, precio });
}

eligible.sort((a, b) => String(a.sku).localeCompare(String(b.sku)));

console.log(`\n=== ELEGIBLES RAW→READY: ${eligible.length} ===`);
for (const e of eligible) {
  console.log(`  ${e.sku.padEnd(11)} $${String(e.precio).padEnd(5)} stock:${String(e.stock ?? '?').padEnd(3)} ${e.title}`);
}
if (excluded.length) {
  console.log(`\n=== EXCLUIDAS (${excluded.length}) ===`);
  for (const x of excluded) console.log(`  ${x.sku}  [${x.reason}]  ${x.title}`);
}

if (!APPLY) {
  console.log(`\n[dry-run] No se escribio nada. Para aplicar: --apply`);
  process.exit(0);
}

if (eligible.length === 0) { console.log('Nada que promover.'); process.exit(0); }

fs.mkdirSync(backupsDir, { recursive: true });
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(backupsDir, `promote-${ts}.json`);
const backup = eligible.map(e => ({ id: e.id, sku: e.sku, oldEstado: 'RAW' }));
fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
console.log(`\n[backup] ${backupPath}`);

const updates = eligible.map(e => ({ Id: e.id, Estado: 'READY' }));
await patch(updates);
console.log(`[apply] ${eligible.length} piezas promovidas RAW→READY.`);
console.log(`[revert] node scripts/promote-raw-to-ready.mjs --revert ${backupPath}`);
