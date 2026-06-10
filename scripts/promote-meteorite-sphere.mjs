#!/usr/bin/env node
/**
 * Adjunta macros owner-confirmadas (walkthrough Marimari 2026-05-31) y promueve RAW→READY.
 *
 *   WM-RNG-007 Meteorite Ring 19mm    ← PRO-006 ritual_ring_950 (plata 950 casting)
 *   WM-RNG-008 Meteorite Ring 17.5mm  ← PRO-006  (mismo diseño, otra talla)
 *   WM-RNG-009 Meteorite Ring 16mm    ← PRO-006  (gated: --include-009-010)
 *   WM-RNG-010 Meteorite Ring 18.5mm  ← PRO-006  (gated: --include-009-010)
 *   WM-HAN-020 Polished Sphere Hanger ← PRO-029 "4 Semi esferas detalle"
 *
 * 009/010 quedan fuera por default: su Foto_referencia actual NO calza visualmente con
 * el macro meteorito (dots / banda lisa). Pasar --include-009-010 sólo si el dueño confirma
 * que son la MISMA pieza en otra talla.
 *
 * Uso: node scripts/promote-meteorite-sphere.mjs [--apply] [--include-009-010] [--only-sphere]
 *      sin --apply = dry-run. Backup de Estado+Foto_macro originales antes de escribir.
 */
import fs from 'node:fs';

const BASE = process.env.NOCODB_URL;
const TABLE = process.env.NOCODB_TABLE_PIEZAS;
const TOKEN = process.env.NOCODB_TOKEN;
const APPLY = process.argv.includes('--apply');
const INC = process.argv.includes('--include-009-010');
const ONLY_SPHERE = process.argv.includes('--only-sphere');
if (!BASE || !TABLE || !TOKEN) { console.error('Faltan NOCODB_URL/TABLE_PIEZAS/TOKEN'); process.exit(1); }
const H = { 'xc-token': TOKEN };

const MET = '/tmp/wenu-audit/match/MACRO_meteorite_006.jpg';
const SPH = '/tmp/wenu-audit/match/MACRO_sphere_029.jpg';
let TARGETS = [
  { Id: 164, SKU: 'WM-RNG-007', img: MET },
  { Id: 165, SKU: 'WM-RNG-008', img: MET },
  { Id: 166, SKU: 'WM-RNG-009', img: MET, gated: true },
  { Id: 167, SKU: 'WM-RNG-010', img: MET, gated: true },
  { Id: 49,  SKU: 'WM-HAN-020', img: SPH },
];
if (ONLY_SPHERE) TARGETS = TARGETS.filter(t => t.SKU === 'WM-HAN-020');
else if (!INC) TARGETS = TARGETS.filter(t => !t.gated);

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

for (const t of TARGETS) {
  if (!fs.existsSync(t.img)) { console.error(`FALTA imagen ${t.img}`); process.exit(1); }
}
const done = [];
for (const t of TARGETS) {
  if (!APPLY) { console.log(`[dry-run] ${t.SKU} (id${t.Id}) ← ${t.img.split('/').pop()} → macro + Estado=READY`); continue; }
  const att = await uploadImage(t.img, t.SKU);
  await patchRecord(t.Id, att);
  done.push({ SKU: t.SKU, Id: t.Id, att_path: att[0]?.path });
  console.log(`OK ${t.SKU} (id${t.Id}) → READY · macro ${att[0]?.path}`);
}
console.log(APPLY ? `\nLISTO. ${done.length} promovidos.` : `\n(dry-run — ${TARGETS.length} en plan. Corré con --apply para escribir)`);
