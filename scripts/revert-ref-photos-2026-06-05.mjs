#!/usr/bin/env node
// Revert to draft the products published with reference/wrong-SKU/raw photos (publish-drafts-2026-06-05 batch).
// User decision 2026-06-05: products showing reference images should go back to draft until the real
// curated macro is ready (classification finished in Hermes → I re-upload).
// KEEP published: 5 SKUs that already have a real correct-SKU macro (EAR-008, PRC-011, RNG-006, PLG-002, PLG-008).
// Dry-run by default. --apply to write. Backup (prev status) is reversible.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) { let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1); process.env[m[1]] = v; }
}
const WC_URL = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const wcAuth = `consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;
const ts = () => new Date().toISOString();
const logf = path.join(ROOT, 'scripts', '.revert-ref-photos-2026-06-05.log');
const log = m => { const l = `[${ts()}] ${m}`; console.log(l); fs.appendFileSync(logf, l + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 23 productos a revertir (foto de referencia, de otro SKU, o cruda)
const REVERT = [
  { sku: 'WM-EAR-003', id: 2541 }, { sku: 'WM-EAR-006', id: 2542 }, { sku: 'WM-EAR-010', id: 2544 },
  { sku: 'WM-EAR-011', id: 2545 }, { sku: 'WM-EAR-012', id: 2546 }, { sku: 'WM-EAR-013', id: 2547 },
  { sku: 'WM-EAR-014', id: 2551 }, { sku: 'WM-EAR-015', id: 2552 }, { sku: 'WM-EAR-016', id: 2553 },
  { sku: 'WM-HAN-031', id: 2548 }, { sku: 'WM-HAN-032', id: 2549 }, { sku: 'WM-HAN-033', id: 2550 },
  { sku: 'WM-NCK-006', id: 2540 }, { sku: 'WM-NCK-007', id: 2543 }, { sku: 'WM-HAN-022', id: 2386 },
  { sku: 'WM-PRC-022', id: 2419 }, { sku: 'WM-PRC-023', id: 2420 }, { sku: 'WM-PRC-024', id: 2421 },
  { sku: 'WM-PRC-025', id: 2422 }, { sku: 'WM-PRC-026', id: 2423 }, { sku: 'WM-PRC-027', id: 2424 },
  { sku: 'WM-PRC-028', id: 2425 }, { sku: 'WM-TUN-008', id: 2373 },
];

async function getStatus(id) {
  const r = await fetch(`${WC_URL}/products/${id}?${wcAuth}&_fields=id,sku,status`);
  if (!r.ok) throw new Error(`GET ${id} ${r.status}`);
  return r.json();
}
async function setDraft(id) {
  const r = await fetch(`${WC_URL}/products/${id}?${wcAuth}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'draft' }),
  });
  if (!r.ok) throw new Error(`PUT ${id} ${r.status}: ${(await r.text()).slice(0, 150)}`);
  return r.json();
}

async function main() {
  log(`── ${APPLY ? 'APPLY' : 'DRY-RUN'} · revertir ${REVERT.length} a draft ──`);
  const backup = []; let done = 0, err = 0;
  for (const p of REVERT) {
    try {
      const before = await getStatus(p.id);
      log(`${APPLY ? 'REV ' : 'PLAN'} #${p.id} ${p.sku}: status ${before.status} → draft`);
      backup.push({ id: p.id, sku: p.sku, prev_status: before.status });
      if (!APPLY) continue;
      await setDraft(p.id); log(`  done #${p.id}`); done++; await sleep(700);
    } catch (e) { log(`  ERROR #${p.id} ${p.sku}: ${e.message}`); err++; }
  }
  if (APPLY) {
    const bf = path.join(ROOT, 'data', 'backups', `revert-ref-photos-2026-06-05-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(bf), { recursive: true });
    fs.writeFileSync(bf, JSON.stringify(backup, null, 1));
    log(`backup: ${bf}`);
  }
  log(`── fin · revertidos=${done} errores=${err} ──`);
}
main().catch(e => { log(`crash: ${e.stack}`); process.exit(1); });
