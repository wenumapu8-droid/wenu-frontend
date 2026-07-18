#!/usr/bin/env node
/**
 * publish-drafts-with-image.mjs
 * ────────────────────────────────────────────────────────────────────────────
 * Promueve TODOS los productos en estado 'draft' que tengan al menos 1
 * imagen asignada → status='publish'. Los drafts sin foto se mantienen
 * en draft (regla canon Ocin 2026-06-04: "real photo first, no publicar
 * sin foto").
 *
 * READ-ONLY DRY-RUN por default. --apply --confirm para escribir.
 * Backup automático de los productos a modificar.
 *
 * Reglas que respeta:
 *   ✅ Sólo toca status (no toca name/slug/price/etc.)
 *   ✅ Sólo escribe si el producto tiene al menos 1 imagen
 *   ✅ Backup automático del estado WC pre-publish
 *   ✅ Excluye SKUs problemáticos: WM-WOO-* (legacy) y los que tienen
 *      etiqueta INDICE/ARCHIVO/DUPLICADO en el nombre
 *   ✅ Excluye productos con stock=0 si manage_stock=true (sold out)
 */
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { isKeepDraft, keepDraftReason } from './lib/keep-draft-guard.mjs';

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const CONFIRM = args.includes('--confirm');
if (APPLY && !CONFIRM) { console.error('--apply requires --confirm.'); process.exit(1); }

const env = {};
const envTxt = fs.readFileSync(path.join(os.homedir(),'wenu-agent-hub/.env'),'utf8');
for (const line of envTxt.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.+)$/);
  if (m) env[m[1]] = m[2].trim();
}
const { WOOCOMMERCE_URL, WOOCOMMERCE_KEY, WOOCOMMERCE_SECRET } = env;
const auth = 'Basic ' + Buffer.from(WOOCOMMERCE_KEY + ':' + WOOCOMMERCE_SECRET).toString('base64');

console.log(`Mode: ${APPLY ? '*** APPLY ***' : 'DRY-RUN'}\n`);

// Fetch all drafts
console.log('Fetching all draft products in WC…');
let drafts = [];
for (let p = 1; p <= 10; p++) {
  const r = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products?per_page=100&status=draft&page=${p}`,
    { headers: { Authorization: auth } }).then(r => r.json());
  if (!Array.isArray(r) || r.length === 0) break;
  drafts = drafts.concat(r);
  if (r.length < 100) break;
}
console.log(`  ${drafts.length} drafts total`);

// Classify
const EXCLUDE_PATTERNS = [
  /\bWM-WOO-/i,                                    // legacy IDs imported from old WP
  /\[(INDICE|ARCHIVO|DUPLICADO)/i,                  // explicit marker tags
  /^Untitled/i,
  /_(front|back|detail|angle|macro|lifestyle|card|pair|v\d+)$/i,  // legacy SKU variants
];
const EXCLUDE_NAME_PATTERNS = [
  / \| WM-/i,                                       // "Name | WM-SKU-NNN" = legacy duplicate
];

const toPublish = [];
const keepDraft = { noImage: [], excluded: [], soldOut: [], keepDraftFlag: [] };

for (const p of drafts) {
  const sku = p.sku || '(no-sku)';
  const name = p.name || '';

  // GUARD anti-republicación: si el producto está marcado keep-draft
  // (meta _wenu_keep_draft, tag keep-draft/duplicado/archivado, o marcador
  // [DUPLICADO]/[ARCHIVO]/[NO-PUBLICAR] en el nombre) NUNCA se republica,
  // aunque tenga foto, stock y SKU válido. Esto frena que los drafts vuelvan solos.
  if (isKeepDraft(p)) {
    keepDraft.keepDraftFlag.push({ sku, name, id: p.id, reason: keepDraftReason(p) });
    continue;
  }

  // Exclude products with no canonical SKU
  if (!p.sku || p.sku.trim() === '' || p.sku === '(no-sku)') {
    keepDraft.excluded.push({ sku: '(empty)', name, id: p.id, reason: 'no SKU' });
    continue;
  }

  // Exclude by SKU pattern (legacy variants) or name pattern (legacy "| WM-XXX")
  if (EXCLUDE_PATTERNS.some(rx => rx.test(sku) || rx.test(name))) {
    keepDraft.excluded.push({ sku, name, id: p.id, reason: 'excluded pattern (sku)' });
    continue;
  }
  if (EXCLUDE_NAME_PATTERNS.some(rx => rx.test(name))) {
    keepDraft.excluded.push({ sku, name, id: p.id, reason: 'excluded pattern (name)' });
    continue;
  }

  // Exclude if no image
  if (!p.images || p.images.length === 0) {
    keepDraft.noImage.push({ sku, name, id: p.id });
    continue;
  }

  // Exclude if managed stock = 0 (sold out)
  if (p.manage_stock && (p.stock_quantity === 0 || p.stock_quantity === null)) {
    keepDraft.soldOut.push({ sku, name, id: p.id, stock: p.stock_quantity });
    continue;
  }

  toPublish.push({ id: p.id, sku, name, price: p.price, images: p.images.length });
}

console.log();
console.log(`╔══════════════════════════════════════════╗`);
console.log(`║  Classification                          ║`);
console.log(`╚══════════════════════════════════════════╝`);
console.log(`✅ TO PUBLISH  : ${String(toPublish.length).padStart(3)}  (have image + in stock + not excluded)`);
console.log(`🔒 keep draft  : ${String(keepDraft.keepDraftFlag.length).padStart(3)}  MARCADO no-republicar (_wenu_keep_draft / tag / [DUPLICADO])`);
console.log(`⬜ keep draft  : ${String(keepDraft.noImage.length).padStart(3)}  no image (priority: upload missing photos)`);
console.log(`⬜ keep draft  : ${String(keepDraft.soldOut.length).padStart(3)}  sold out / no stock`);
console.log(`⬜ keep draft  : ${String(keepDraft.excluded.length).padStart(3)}  excluded (WOO-legacy, INDICE/ARCHIVO patterns)`);
console.log();

if (toPublish.length > 0) {
  console.log('── Products that will go LIVE ──');
  for (const p of toPublish) {
    console.log(`  PUBLISH id=${String(p.id).padStart(4)}  ${p.sku.padEnd(13)}  $${String(p.price).padStart(4)}  ${p.images}img  ${p.name.slice(0,55)}`);
  }
}

if (keepDraft.keepDraftFlag.length > 0) {
  console.log();
  console.log('── Stay draft: MARCADO no-republicar (protegido del republish) ──');
  for (const p of keepDraft.keepDraftFlag) console.log(`  🔒 ${p.sku.padEnd(13)}  ${String(p.reason).padEnd(28)}  ${p.name.slice(0,45)}`);
}

if (keepDraft.noImage.length > 0) {
  console.log();
  console.log('── Stay draft: NO IMAGE (need photo upload first) ──');
  for (const p of keepDraft.noImage.slice(0, 15)) console.log(`  draft   ${p.sku.padEnd(13)}  ${p.name.slice(0,60)}`);
  if (keepDraft.noImage.length > 15) console.log(`  … and ${keepDraft.noImage.length - 15} more`);
}

if (keepDraft.soldOut.length > 0) {
  console.log();
  console.log('── Stay draft: SOLD OUT ──');
  for (const p of keepDraft.soldOut) console.log(`  draft   ${p.sku.padEnd(13)}  stock=${p.stock}  ${p.name.slice(0,55)}`);
}

if (keepDraft.excluded.length > 0) {
  console.log();
  console.log('── Stay draft: EXCLUDED ──');
  for (const p of keepDraft.excluded) console.log(`  draft   ${p.sku.padEnd(13)}  ${p.name.slice(0,55)}`);
}

if (!APPLY) {
  console.log();
  console.log(`This was DRY-RUN. To publish ${toPublish.length} products live:`);
  console.log('  node scripts/publish-drafts-with-image.mjs --apply --confirm');
  process.exit(0);
}

// APPLY — backup + PUT
console.log();
console.log('=== APPLYING ===');
const backupDir = path.join(os.homedir(), 'wenu-agent-hub/data/backups',
  `wc-publish-${new Date().toISOString().replace(/[:.]/g, '-')}`);
fs.mkdirSync(backupDir, { recursive: true });
fs.writeFileSync(path.join(backupDir, 'pre-publish.json'),
  JSON.stringify(toPublish.map(p => ({ id: p.id, sku: p.sku, oldStatus: 'draft' })), null, 2));
console.log(`Backup → ${backupDir}/pre-publish.json`);

let published = 0, errored = 0;
for (const p of toPublish) {
  try {
    const r = await fetch(`${WOOCOMMERCE_URL}/wp-json/wc/v3/products/${p.id}`, {
      method: 'PUT',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'publish' }),
    }).then(r => r.json());
    if (r.id && r.status === 'publish') {
      console.log(`  ✅ ${p.sku.padEnd(13)} → publish`);
      published++;
    } else {
      console.log(`  ❌ ${p.sku.padEnd(13)} → ${JSON.stringify(r).slice(0,200)}`);
      errored++;
    }
  } catch (e) {
    console.log(`  ❌ ${p.sku.padEnd(13)} → ${e.message}`);
    errored++;
  }
}

console.log();
console.log(`Summary: published=${published}, errored=${errored}`);
console.log(`Revert: edit each from wp-admin or run script in reverse (not implemented).`);
console.log(`Backup at: ${backupDir}`);
