#!/usr/bin/env node
// Fix postbuild audit-catalog FAILs left by publish-drafts-2026-06-05 (categories not set on publish).
// - 8 WM-EAR-* miscategorized [Ear Jewelry, Hangers/Weights] → [Earrings 49]
// - WM-SEP-003 [Septum 426] → [Piercing 174, Septum 60 (child of 174)]
// - WM-PRC-002 [Ear Jewelry 427] → [Piercing 174]
// - WM-CARE-001 [Sin categorizar 15] → [accessories 345]
// - #2086 NO-SKU duplicate ring → status=draft (canonical = #2398 WM-RNG-001)
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
const logf = path.join(ROOT, 'scripts', '.fix-categories-2026-06-05.log');
const log = m => { const l = `[${ts()}] ${m}`; console.log(l); fs.appendFileSync(logf, l + '\n'); };
const sleep = ms => new Promise(r => setTimeout(r, ms));

// id → desired patch (categories as [{id}] or status)
const FIXES = [
  { id: 2545, sku: 'WM-EAR-011', categories: [{ id: 49 }] },
  { id: 2544, sku: 'WM-EAR-010', categories: [{ id: 49 }] },
  { id: 2542, sku: 'WM-EAR-006', categories: [{ id: 49 }] },
  { id: 2541, sku: 'WM-EAR-003', categories: [{ id: 49 }] },
  { id: 2539, sku: 'WM-EAR-002', categories: [{ id: 49 }] },
  { id: 2409, sku: 'WM-EAR-008', categories: [{ id: 49 }] },
  { id: 2408, sku: 'WM-EAR-004', categories: [{ id: 49 }] },
  { id: 2159, sku: 'WM-EAR-001', categories: [{ id: 49 }] },
  { id: 2553, sku: 'WM-EAR-016', categories: [{ id: 49 }] },
  { id: 2552, sku: 'WM-EAR-015', categories: [{ id: 49 }] },
  { id: 2551, sku: 'WM-EAR-014', categories: [{ id: 49 }] },
  { id: 2547, sku: 'WM-EAR-013', categories: [{ id: 49 }] },
  { id: 2546, sku: 'WM-EAR-012', categories: [{ id: 49 }] },
  { id: 2400, sku: 'WM-SEP-003', categories: [{ id: 174 }, { id: 60 }] },
  { id: 2077, sku: 'WM-PRC-002', categories: [{ id: 174 }] },
  { id: 2333, sku: 'WM-CARE-001', categories: [{ id: 345 }] },
  { id: 2086, sku: '(dup ring)', status: 'draft' }, // canonical = #2398 WM-RNG-001
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
      const body = {};
      if (f.categories) body.categories = f.categories;
      if (f.status) body.status = f.status;
      const desc = f.categories
        ? `cats [${before.categories.map(c => c.id + ':' + c.name).join(', ')}] → [${f.categories.map(c => c.id).join(', ')}]`
        : `status ${before.status} → ${f.status}`;
      log(`${APPLY ? 'FIX ' : 'PLAN'} #${f.id} ${f.sku}: ${desc}`);
      backup.push({ id: f.id, sku: f.sku, prev: { status: before.status, categories: before.categories.map(c => ({ id: c.id })) } });
      if (!APPLY) continue;
      await putProduct(f.id, body);
      log(`  done #${f.id}`);
      done++;
      await sleep(800);
    } catch (e) { log(`  ERROR #${f.id}: ${e.message}`); err++; }
  }
  if (APPLY) {
    const bf = path.join(ROOT, 'data', 'backups', `fix-categories-2026-06-05-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(bf), { recursive: true });
    fs.writeFileSync(bf, JSON.stringify(backup, null, 1));
    log(`backup: ${bf}`);
  }
  log(`── fin · aplicados=${done} errores=${err} ──`);
}
main().catch(e => { log(`crash: ${e.stack}`); process.exit(1); });
