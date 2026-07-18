#!/usr/bin/env node
/** Auditoría de configuración WooCommerce (read-only): envíos, pagos, emails, impuestos, general, páginas. */
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
for (const line of fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) { let v = m[2]; if (/^["'].*["']$/.test(v)) v = v.slice(1, -1); process.env[m[1]] = v; }
}
const WC = process.env.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3';
const auth = `consumer_key=${encodeURIComponent(process.env.WC_CONSUMER_KEY)}&consumer_secret=${encodeURIComponent(process.env.WC_CONSUMER_SECRET)}`;
const get = async (p) => { const r = await fetch(`${WC}${p}${p.includes('?') ? '&' : '?'}${auth}`); if (!r.ok) return { __err: r.status }; return r.json(); };

const line = (s) => console.log(s);
line('\n========== AUDITORÍA WOOCOMMERCE ' + new Date().toISOString().slice(0,16) + ' ==========');

// 1. GENERAL
const gkeys = ['woocommerce_currency','woocommerce_default_country','woocommerce_allowed_countries','woocommerce_specific_allowed_countries','woocommerce_ship_to_countries','woocommerce_specific_ship_to_countries','woocommerce_calc_taxes','woocommerce_store_address','woocommerce_store_city'];
line('\n--- GENERAL ---');
for (const k of gkeys) { const s = await get(`/settings/general/${k}`); if (!s.__err) line(`  ${k.replace('woocommerce_','')} = ${JSON.stringify(s.value)}`); }

// 2. SHIPPING
line('\n--- ENVÍOS (zonas + métodos) ---');
const zones = await get('/shipping/zones');
if (zones.__err) line('  error zones ' + zones.__err);
else {
  const allZones = [...zones, { id: 0, name: 'Resto del mundo (Rest of World)' }];
  for (const z of allZones) {
    const locs = z.id !== 0 ? await get(`/shipping/zones/${z.id}/locations`) : [{ code: '*', type: 'everywhere' }];
    const methods = await get(`/shipping/zones/${z.id}/methods`);
    const locStr = Array.isArray(locs) ? locs.map(l => `${l.type}:${l.code}`).join(', ') : '?';
    line(`  ZONA "${z.name}" [${locStr}]`);
    if (Array.isArray(methods) && methods.length) for (const m of methods) {
      const cost = m.settings?.cost?.value ?? m.settings?.min_amount?.value ?? '';
      line(`      → ${m.method_title} (${m.method_id}) ${m.enabled ? '🟢' : '⚪'} ${cost ? 'cost=' + cost : ''} ${m.settings?.title?.value ? '"' + m.settings.title.value + '"' : ''}`);
    } else line('      (sin métodos)');
  }
}

// 3. TAX
line('\n--- IMPUESTOS ---');
const taxes = await get('/taxes');
line(`  calc_taxes activo? (ver general arriba) · tasas definidas: ${Array.isArray(taxes) ? taxes.length : taxes.__err}`);

// 4. PAYMENT GATEWAYS — return / back urls
line('\n--- PAGOS: URLs de retorno (éxito/rechazo/pendiente) ---');
for (const id of ['woo-mercado-pago-basic','woo-mercado-pago-custom','nowpayments','bacs','cod']) {
  const g = await get(`/payment_gateways/${id}`);
  if (g.__err) { line(`  ${id}: err ${g.__err}`); continue; }
  const st = g.settings || {};
  const urlKeys = Object.keys(st).filter(k => /url|return|success|fail|pending|cancel|redirect|back/i.test(k));
  line(`  ${id} ${g.enabled ? '🟢' : '⚪'} "${g.title}"`);
  if (urlKeys.length) for (const k of urlKeys) line(`      ${k} = ${JSON.stringify(st[k]?.value ?? st[k])}`);
  else line('      (sin campos de URL de retorno visibles vía API)');
}

// 5. EMAILS
line('\n--- EMAILS (notificaciones) ---');
const emailGroups = ['email_new_order','email_cancelled_order','email_failed_order','email_customer_on_hold_order','email_customer_processing_order','email_customer_completed_order','email_customer_refunded_order','email_customer_invoice','email_customer_note','email_customer_new_account'];
for (const g of emailGroups) {
  const s = await get(`/settings/${g}`);
  if (s.__err) continue;
  const en = s.find(x => x.id === 'enabled');
  const rec = s.find(x => x.id === 'recipient');
  line(`  ${g.replace('email_','')}: ${en ? (en.value === 'yes' ? '🟢 on' : '⚪ off') : '?'}${rec && rec.value ? ' → ' + rec.value : ''}`);
}

line('\n========== FIN AUDITORÍA ==========\n');
