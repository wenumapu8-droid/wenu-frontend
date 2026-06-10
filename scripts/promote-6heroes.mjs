#!/usr/bin/env node
/**
 * Adjunta la macro real (recuperada de _ERROR) y promueve RAW→READY
 * para los 6 héroes confirmados visualmente + por SKU/título 2026-05-30.
 *
 *   WM-HAN-002 Tiger Eye Buddha Hanger      ← DSC_0562  (REEMPLAZA macro errónea)
 *   WM-HAN-003 Triangular Tiger Eye Hanger  ← DSC_0571  (REEMPLAZA macro errónea)
 *   WM-HAN-004 Metatron Mandala Hanger      ← DSC_0433  (REEMPLAZA macro errónea)
 *   WM-HAN-018 Magnetic Greek Key Hangers   ← DSC_0550  (adjunta nueva)
 *   WM-HAN-028 Ornamental Wooden Weights    ← DSC_0559  (adjunta nueva)
 *   WM-SAD-001 Ornamental Opal Saddle       ← DSC_0216  (REEMPLAZA macro PLG-004 errónea)
 *
 * Uso: node scripts/promote-6heroes.mjs --apply   (sin --apply = dry-run)
 * Backup de originales (Estado + Foto_macro) ya escrito en data/backups/promote-6heroes-*.json
 */
import fs from 'node:fs';

const BASE = process.env.NOCODB_URL;
const TABLE = process.env.NOCODB_TABLE_PIEZAS;
const TOKEN = process.env.NOCODB_TOKEN;
const APPLY = process.argv.includes('--apply');
if (!BASE || !TABLE || !TOKEN) { console.error('Faltan NOCODB_URL/TABLE_PIEZAS/TOKEN'); process.exit(1); }
const H = { 'xc-token': TOKEN };

const HEROES = [
  { Id: 2,  SKU: 'WM-HAN-002', img: '/tmp/new-prod/WM-HAN-002-macro.jpg' },
  { Id: 3,  SKU: 'WM-HAN-003', img: '/tmp/new-prod/WM-HAN-003-macro.jpg' },
  { Id: 6,  SKU: 'WM-HAN-004', img: '/tmp/new-prod/WM-HAN-004-macro.jpg' },
  { Id: 47, SKU: 'WM-HAN-018', img: '/tmp/new-prod/WM-HAN-018-macro.jpg' },
  { Id: 75, SKU: 'WM-HAN-028', img: '/tmp/new-prod/WM-HAN-028-macro.jpg' },
  { Id: 24, SKU: 'WM-SAD-001', img: '/tmp/new-prod/WM-SAD-001-macro.jpg' },
];

async function uploadImage(path, sku) {
  const buf = fs.readFileSync(path);
  const fd = new FormData();
  fd.append('file', new Blob([buf], { type: 'image/jpeg' }), `${sku}_macro.jpg`);
  const r = await fetch(`${BASE}/api/v2/storage/upload`, { method: 'POST', headers: H, body: fd });
  if (!r.ok) throw new Error(`upload ${sku} HTTP ${r.status}: ${await r.text()}`);
  return await r.json();
}

async function patchRecord(Id, att) {
  const body = [{ Id, 'Foto macro': att, Estado: 'READY' }];
  const r = await fetch(`${BASE}/api/v2/tables/${TABLE}/records`, {
    method: 'PATCH', headers: { ...H, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`patch ${Id} HTTP ${r.status}: ${await r.text()}`);
  return await r.json();
}

const done = [];
for (const h of HEROES) {
  if (!fs.existsSync(h.img)) { console.error(`FALTA imagen ${h.img}`); continue; }
  if (!APPLY) { console.log(`[dry-run] ${h.SKU} (id${h.Id}) ← ${h.img} → macro + Estado=READY`); continue; }
  const att = await uploadImage(h.img, h.SKU);
  await patchRecord(h.Id, att);
  done.push({ SKU: h.SKU, Id: h.Id, att_path: att[0]?.path });
  console.log(`OK ${h.SKU} (id${h.Id}) → READY · macro ${att[0]?.path}`);
}
console.log(APPLY ? `\nLISTO. ${done.length} promovidos.` : '\n(dry-run — corré con --apply para escribir)');
