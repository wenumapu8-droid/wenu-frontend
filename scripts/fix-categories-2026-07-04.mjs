#!/usr/bin/env node
// Follow-up to fix-categories-2026-07-03: 3 more products the postbuild audit flags with
// only their legacy leaf category, missing the canonical parent the audit maps by SKU prefix.
// Convention (rest of catalog): keep BOTH the legacy leaf and the canonical parent.
// Verified vs NocoDB snapshot 2026-07-04 (table nc_9aor___Piezas): all 3 SKUs exist with
// matching titles/types (HAN-014 "Hanger with Black Stone", HAN-027 "Diamond Walnut Wood
// Hangers", SEP-002 "6mm Gold Titanium Septum Ring").
// Dry-run by default. --apply to write. Backup (prev state) + log are reversible.
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');

for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) {
    let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}
const WC_URL = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const wcAuth = `consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;

const ts = () => new Date().toISOString();
const logf = path.join(ROOT, 'scripts', '.fix-categories-2026-07-04.log');
const log = m => { const l = `[${ts()}] ${m}`; console.log(l); fs.appendFileSync(logf, l + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// keep legacy leaf + add canonical parent (74 Hanger→+430 Hangers/Weights; 426 Septum→+174 Piercing)
const FIXES = [
  { id: 2381, sku: 'WM-HAN-014', categories: [{ id: 74 }, { id: 430 }] },
  { id: 2075, sku: 'WM-HAN-027', categories: [{ id: 74 }, { id: 430 }] },
  { id: 2055, sku: 'WM-SEP-002', categories: [{ id: 426 }, { id: 174 }] },
];

async function getProduct(id) {
  const r = await fetch(`${WC_URL}/products/${id}?${wcAuth}&_fields=id,sku,name,status,categories`);
  if (!r.ok) throw new Error(`GET ${id} ${r.status}`);
  return r.json();
}
async function putProduct(id, body) {
  const r = await fetch(`${WC_URL}/products/${id}?${wcAuth}`, {
    method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`PUT ${id} ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return r.json();
}

async function main() {
  log(`── ${APPLY ? 'APPLY' : 'DRY-RUN'} · ${FIXES.length} fixes ──`);
  const backup = [];
  let done = 0, err = 0;
  for (const f of FIXES) {
    try {
      const before = await getProduct(f.id);
      if (before.sku !== f.sku) throw new Error(`SKU mismatch: WC has "${before.sku}", expected "${f.sku}" — skipping`);
      const desc = `cats [${before.categories.map(c => c.id + ':' + c.name).join(', ')}] → [${f.categories.map(c => c.id).join(', ')}]`;
      log(`${APPLY ? 'FIX ' : 'PLAN'} #${f.id} ${f.sku}: ${desc}`);
      backup.push({ id: f.id, sku: f.sku, prev: { categories: before.categories.map(c => ({ id: c.id })) } });
      if (!APPLY) continue;
      await putProduct(f.id, { categories: f.categories });
      log(`  done #${f.id}`);
      done++;
      await sleep(800);
    } catch (e) { log(`  ERROR #${f.id}: ${e.message}`); err++; }
  }
  if (APPLY) {
    const bf = path.join(ROOT, 'data', 'backups', `fix-categories-2026-07-04-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(bf), { recursive: true });
    fs.writeFileSync(bf, JSON.stringify(backup, null, 1));
    log(`backup: ${bf}`);
  }
  log(`── fin · aplicados=${done} errores=${err} ──`);
}
main().catch(e => { log(`crash: ${e.stack}`); process.exit(1); });
