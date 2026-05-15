#!/usr/bin/env node
/**
 * wc-unpublish.mjs
 *
 * Despublica (status='draft') productos en WooCommerce con backup y log para rollback.
 *
 * Uso:
 *   node scripts/cleanup/wc-unpublish.mjs --dry-run           # preview (default)
 *   node scripts/cleanup/wc-unpublish.mjs --execute --group=A # ejecuta Grupo A
 *   node scripts/cleanup/wc-unpublish.mjs --execute --group=B # ejecuta Grupo B
 *   node scripts/cleanup/wc-unpublish.mjs --restore <log.json> # revierte un log
 *
 * Requiere WC_URL, WC_CONSUMER_KEY, WC_CONSUMER_SECRET en .env (parent dir).
 *
 * Output:
 *   .runtime/unpublish-log-<YYYY-MM-DDTHH:MM>.json
 */

import fs from 'node:fs';
import path from 'node:path';

// --- Load .env from parent dir ---
const envPath = path.resolve(import.meta.url.replace('file://', ''), '../../../.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.+)$/);
    if (m) process.env[m[1]] ||= m[2];
  }
}

const WC_URL    = process.env.WC_URL    || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const WC_KEY    = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;
if (!WC_KEY || !WC_SECRET) {
  console.error('ERROR: WC_CONSUMER_KEY / WC_CONSUMER_SECRET missing in .env');
  process.exit(1);
}

const argv = process.argv.slice(2);
const dryRun  = !argv.includes('--execute');
const group   = (argv.find(a => a.startsWith('--group=')) || '--group=A').split('=')[1].toUpperCase();
const restore = argv.find(a => a.startsWith('--restore='))?.split('=')[1];

// Target groups
const GROUPS = {
  A: { // Basura clara — nombre sin contexto, sin nada
    label: 'Grupo A — basura clara',
    ids: [
      { id: 2079, name: 'Aonik' },
      { id: 2074, name: 'Ear Weights' },
    ],
  },
  B: { // Publicados sin imagen, recuperables (necesitan foto + precio)
    label: 'Grupo B — publicados sin imagen (recuperables)',
    ids: [
      { id: 2084, name: 'Ritual Ring Vacamuerta No.19' },
      { id: 2082, name: 'Ornamental Brass Wood Hangers' },
      { id: 2081, name: 'Teardrop Ammonite Plugs (Walnut & Bronze)' },
      { id: 2063, name: 'Flor Loto Expansión' },
      { id: 2059, name: 'Anillo Gota' },
      { id: 2058, name: 'Golden Surgical Steel Septum (chain)' },
      { id: 2053, name: 'Pendiente aro gran calibre' },
      { id: 2052, name: 'Expansor brillante gota de agua' },
      { id: 2051, name: 'Fluorita tapón' },
      { id: 2050, name: 'Medusa expansión' },
    ],
  },
};

function authQS() {
  return `consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
}

async function getProduct(id) {
  const r = await fetch(`${WC_URL}/products/${id}?${authQS()}`);
  if (!r.ok) throw new Error(`GET ${id}: HTTP ${r.status}`);
  return await r.json();
}

async function setStatus(id, status) {
  const r = await fetch(`${WC_URL}/products/${id}?${authQS()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!r.ok) throw new Error(`POST ${id}: HTTP ${r.status} ${await r.text()}`);
  return await r.json();
}

async function main() {
  // --- RESTORE mode ---
  if (restore) {
    const log = JSON.parse(fs.readFileSync(restore, 'utf8'));
    console.log(`[restore] reading ${restore} — ${log.actions.length} actions`);
    for (const a of log.actions) {
      try {
        await setStatus(a.id, a.before.status);
        console.log(`  ✓ ${a.id} restored → ${a.before.status}`);
      } catch (e) {
        console.log(`  ✗ ${a.id} FAIL: ${e.message}`);
      }
    }
    console.log('[restore] done');
    return;
  }

  // --- UNPUBLISH mode ---
  const target = GROUPS[group];
  if (!target) { console.error(`Unknown group: ${group}`); process.exit(2); }

  const mode = dryRun ? 'DRY-RUN' : 'EXECUTE';
  console.log(`[wc-unpublish] ${mode} · ${target.label} · ${target.ids.length} products`);
  console.log('');

  const actions = [];
  for (const t of target.ids) {
    process.stdout.write(`  ${t.id} ${t.name.slice(0, 50).padEnd(50)} `);
    try {
      const before = await getProduct(t.id);
      const beforeSnap = {
        id: before.id,
        status: before.status,
        name: before.name,
        slug: before.slug,
        price: before.price,
        sku: before.sku,
      };
      if (dryRun) {
        process.stdout.write(`[would set: ${before.status} → draft]\n`);
        actions.push({ id: t.id, before: beforeSnap, after: null, dryRun: true });
      } else {
        if (before.status === 'draft') {
          process.stdout.write(`[already draft — skip]\n`);
          actions.push({ id: t.id, before: beforeSnap, after: beforeSnap, skipped: true });
        } else {
          const after = await setStatus(t.id, 'draft');
          process.stdout.write(`[${before.status} → ${after.status}] ✓\n`);
          actions.push({
            id: t.id,
            before: beforeSnap,
            after: { id: after.id, status: after.status, name: after.name, slug: after.slug, price: after.price, sku: after.sku },
          });
        }
      }
    } catch (e) {
      process.stdout.write(`✗ FAIL: ${e.message}\n`);
      actions.push({ id: t.id, error: e.message });
    }
    // small pause to avoid rate limiting
    await new Promise(r => setTimeout(r, 250));
  }

  // Write log
  const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 16);
  const logPath = path.resolve(import.meta.url.replace('file://', ''), `../../../.runtime/unpublish-${group}-${mode.toLowerCase()}-${ts}.json`);
  fs.mkdirSync(path.dirname(logPath), { recursive: true });
  fs.writeFileSync(logPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    mode,
    group,
    label: target.label,
    actions,
  }, null, 2));
  console.log('');
  console.log(`[wc-unpublish] log → ${logPath}`);
  if (dryRun) console.log('[wc-unpublish] DRY-RUN complete — add --execute to apply');
}

main().catch(e => { console.error(e); process.exit(3); });
