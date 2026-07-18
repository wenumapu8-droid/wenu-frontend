#!/usr/bin/env node
/**
 * wc-payments-cleanup-2026-07-05.mjs — limpia el checkout WC (aprobado owner).
 * Desactiva PayPal + métodos europeos ppcp-* + WooPayments-family muertos.
 * Deja activos: bacs (Bank Transfer/Wise/Zelle) y cod (Venmo/Cash App/Zelle).
 * DRY-RUN por default. --apply para escribir. Backup reversible del estado previo.
 */
import fs from 'node:fs';
import path from 'node:path';
const APPLY = process.argv.includes('--apply');
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) { let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1); process.env[m[1]] = v; }
}
const WC = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const auth = `consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;

const DISABLE = [
  'ppcp-gateway',
  'ppcp-bancontact', 'ppcp-blik', 'ppcp-eps', 'ppcp-ideal', 'ppcp-mybank', 'ppcp-p24', 'ppcp-trustly', 'ppcp-multibanco',
  'woocommerce_payments_affirm', 'woocommerce_payments_afterpay_clearpay', 'woocommerce_payments_klarna',
  'woocommerce_payments_apple_pay', 'woocommerce_payments_google_pay', 'woocommerce_payments_amazon_pay',
];
const KEEP = ['bacs', 'cod'];

async function main() {
  console.log(`\n=== payments cleanup · ${APPLY ? 'APPLY' : 'DRY-RUN'} ===\n`);
  const all = await (await fetch(`${WC}/payment_gateways?${auth}`)).json();
  const backup = { ts: new Date().toISOString(), gateways: all.map(g => ({ id: g.id, enabled: g.enabled })) };
  const bdir = path.join(ROOT, 'data', 'backups');
  fs.mkdirSync(bdir, { recursive: true });
  const bpath = path.join(bdir, `wc-payments-2026-07-05-${Date.now()}.json`);
  fs.writeFileSync(bpath, JSON.stringify(backup, null, 2));
  console.log(`backup → ${bpath}\n`);

  console.log('KEEP (activos):', KEEP.join(', '));
  for (const id of KEEP) { const g = all.find(x => x.id === id); console.log(`  ${g && g.enabled ? '🟢' : '⚪'} ${id} — ${g ? g.title : 'NOT FOUND'}`); }
  console.log('\nDISABLE:');
  for (const id of DISABLE) {
    const g = all.find(x => x.id === id);
    if (!g) { console.log(`  ⚠ ${id} not found`); continue; }
    if (!g.enabled) { console.log(`  – ${id} already off`); continue; }
    if (APPLY) {
      const r = await fetch(`${WC}/payment_gateways/${id}?${auth}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ enabled: false }) });
      const j = await r.json();
      console.log(`  ✓ ${id} → enabled=${j.enabled}`);
    } else console.log(`  → would disable ${id} (${g.title})`);
  }
  // final state
  if (APPLY) {
    const after = await (await fetch(`${WC}/payment_gateways?${auth}&_fields=id,title,enabled`)).json();
    console.log('\n=== checkout final (activos) ===');
    for (const g of after) if (g.enabled) console.log(`  🟢 ${g.id} — ${g.title}`);
  }
  console.log(`\n=== done. revert: restaurar desde ${path.basename(bpath)} ===\n`);
}
main().catch(e => { console.error('FATAL', e); process.exit(1); });
