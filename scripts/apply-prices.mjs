#!/usr/bin/env node
/**
 * apply-prices.mjs
 *
 * Sets WooCommerce regular_price for a curated list of products from a CSV.
 * Safe by default: dry-run, backup before any change, reversible log.
 *
 * Source CSV: reports/PRICES-suggested-23-products-2026-05-11.csv
 *   columns: priority,wc_id,name,suggested_price_usd,price_range,category,rationale,notes
 *
 * Env (read from ~/wenu-agent-hub/.env if not set):
 *   WOOCOMMERCE_URL    — e.g. https://www.wenumapuonline.com
 *   WOOCOMMERCE_KEY    — WC consumer key
 *   WOOCOMMERCE_SECRET — WC consumer secret
 *
 * Usage:
 *   node scripts/apply-prices.mjs                      # dry-run (default, never writes)
 *   node scripts/apply-prices.mjs --csv path/to.csv    # custom CSV
 *   node scripts/apply-prices.mjs --apply --confirm    # APPLY (writes regular_price to WC)
 *
 * Apply mode: backs up the full current state of every touched product to
 * .runtime/backups/ before any PUT, writes a reversible log to .runtime/logs/,
 * and only ever changes the `regular_price` field. Nothing else is touched.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const args = process.argv.slice(2);
const has = k => args.includes(k);
const flag = (k, def) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : def; };

const APPLY = has('--apply');
const CONFIRM = has('--confirm');
const CSV = flag('--csv', 'reports/PRICES-suggested-23-products-2026-05-11.csv');

if (APPLY && !CONFIRM) {
  console.error('ERROR: --apply requires --confirm. Run without --apply for dry-run first.');
  process.exit(1);
}

// --- env ---
function readEnv() {
  if (process.env.WOOCOMMERCE_URL && process.env.WOOCOMMERCE_KEY) return;
  const envPath = path.join(os.homedir(), 'wenu-agent-hub/.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
  }
}
readEnv();

const WC_URL = process.env.WOOCOMMERCE_URL;
const WC_KEY = process.env.WOOCOMMERCE_KEY;
const WC_SECRET = process.env.WOOCOMMERCE_SECRET;
if (!WC_URL || !WC_KEY || !WC_SECRET) {
  console.error('ERROR: WC credentials missing (WOOCOMMERCE_URL / WOOCOMMERCE_KEY / WOOCOMMERCE_SECRET).');
  process.exit(2);
}
const wcAuth = 'Basic ' + Buffer.from(WC_KEY + ':' + WC_SECRET).toString('base64');
const api = p => `${WC_URL}/wp-json/wc/v3${p}`;

// --- minimal CSV parser (handles quoted fields with commas) ---
function parseCsv(text) {
  const rows = [];
  let row = [], field = '', inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ''; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const csvText = fs.readFileSync(path.resolve(CSV), 'utf8');
const rows = parseCsv(csvText).filter(r => r.length > 1);
const header = rows.shift();
const col = name => header.indexOf(name);
const items = rows.map(r => ({
  wc_id: r[col('wc_id')],
  name: r[col('name')],
  suggested: r[col('suggested_price_usd')],
})).filter(it => it.wc_id && it.suggested);

console.log(`[apply-prices] mode: ${APPLY ? '*** APPLY ***' : 'DRY-RUN'}`);
console.log(`[apply-prices] CSV: ${CSV} — ${items.length} products`);
console.log();

// --- fetch current state ---
const current = [];
for (const it of items) {
  const res = await fetch(api(`/products/${it.wc_id}`), { headers: { Authorization: wcAuth } });
  if (!res.ok) {
    console.log(`  ! HTTP ${res.status} fetching product ${it.wc_id} (${it.name.slice(0, 40)})`);
    current.push({ ...it, error: `HTTP ${res.status}` });
    continue;
  }
  const p = await res.json();
  current.push({ ...it, full: p, currentPrice: p.regular_price, status: p.status, wcName: p.name });
}

// --- dry-run table ---
console.log('  wc_id  current → suggested   name');
console.log('  ' + '-'.repeat(58));
let changes = 0, errors = 0, samePrice = 0;
for (const c of current) {
  if (c.error) { console.log(`  ${String(c.wc_id).padEnd(6)} ERROR ${c.error}   ${c.name.slice(0, 38)}`); errors++; continue; }
  const cur = c.currentPrice || '(none)';
  const same = String(c.currentPrice) === String(c.suggested);
  if (same) samePrice++; else changes++;
  const mark = same ? '=' : '→';
  console.log(`  ${String(c.wc_id).padEnd(6)} ${String(cur).padStart(7)} ${mark} ${String(c.suggested).padEnd(8)} ${c.wcName ? c.wcName.slice(0, 36) : c.name.slice(0, 36)}`);
}
console.log();
console.log(`  changes: ${changes}, already-set: ${samePrice}, errors: ${errors}`);

if (!APPLY) {
  console.log();
  console.log('  DRY-RUN only — nothing was written.');
  console.log('  To apply:  node scripts/apply-prices.mjs --apply --confirm');
  process.exit(errors > 0 ? 3 : 0);
}

// --- apply ---
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupDir = path.resolve('.runtime/backups');
const logDir = path.resolve('.runtime/logs');
fs.mkdirSync(backupDir, { recursive: true });
fs.mkdirSync(logDir, { recursive: true });

const backupFile = path.join(backupDir, `prices-${stamp}.json`);
fs.writeFileSync(backupFile, JSON.stringify(current.filter(c => c.full).map(c => c.full), null, 2));
console.log(`  backup → ${backupFile}`);

const logFile = path.join(logDir, `apply-prices-${stamp}.log`);
const log = line => fs.appendFileSync(logFile, line + '\n');
log(`# apply-prices ${stamp}`);

let applied = 0, failed = 0;
for (const c of current) {
  if (c.error || String(c.currentPrice) === String(c.suggested)) continue;
  const res = await fetch(api(`/products/${c.wc_id}`), {
    method: 'PUT',
    headers: { Authorization: wcAuth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ regular_price: String(c.suggested) }),
  });
  const body = await res.json();
  if (res.ok && body.id) {
    applied++;
    log(`OK   ${c.wc_id}  ${c.currentPrice || '(none)'} -> ${c.suggested}  reverse: PUT regular_price=${c.currentPrice || ''}`);
    console.log(`  OK  ${c.wc_id}  → $${c.suggested}`);
  } else {
    failed++;
    log(`FAIL ${c.wc_id}  ${res.status}  ${(body.message || '').slice(0, 80)}`);
    console.log(`  !!  ${c.wc_id}  HTTP ${res.status} ${(body.message || '').slice(0, 60)}`);
  }
  await new Promise(r => setTimeout(r, 250));
}

console.log();
console.log(`  applied: ${applied}, failed: ${failed}`);
console.log(`  log → ${logFile}`);
console.log(`  revert: restore regular_price from ${backupFile}`);
