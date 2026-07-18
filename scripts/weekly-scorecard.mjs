#!/usr/bin/env node
/**
 * weekly-scorecard.mjs — Wenu Mapu continuous-improvement loop.
 * Mide señales OBJETIVAS cada semana, puntúa por área, compara con la corrida
 * anterior (delta), actualiza el doc maestro y manda el reporte a Telegram (Hermes bot).
 * Read-only sobre la tienda/sitio. Las áreas que no se pueden medir por script
 * (UX, marca, contenido, procesos) mantienen su baseline y se marcan "manual".
 *
 *   node scripts/weekly-scorecard.mjs            # corre + envía a Telegram
 *   node scripts/weekly-scorecard.mjs --no-send  # corre sin enviar (test)
 */
import fs from 'node:fs';

const HOME = process.env.HOME;
const FE = `${HOME}/wenu-frontend`;
const STATE = `${HOME}/.wenu-scorecard-state.json`;
const DOC = `${HOME}/Obsidian/WenuAgent/00-Index/SCORECARD-WENU.md`;
const SEND = !process.argv.includes('--no-send');

const loadEnv = (p) => { const o = {}; try { for (const l of fs.readFileSync(p, 'utf8').split('\n')) { const m = l.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/); if (m) { let v = m[2].trim(); if (/^["'].*["']$/.test(v)) v = v.slice(1, -1); o[m[1]] = v; } } } catch {} return o; };
const fe = loadEnv(`${FE}/.env`);
const her = loadEnv(`${HOME}/.hermes/.env`);
const TOK = her.TELEGRAM_BOT_TOKEN;
let CID = ''; try { CID = String(JSON.parse(fs.readFileSync(`${HOME}/.hermes/channel_directory.json`, 'utf8')).platforms.telegram[0].id); } catch {}

const WC = (fe.WC_URL || 'https://www.wenumapuonline.com/wp-json/wc/v3').replace(/["']/g, '');
const SITE = WC.replace(/\/wp-json\/wc\/v3\/?$/, '');
const auth = `consumer_key=${encodeURIComponent(fe.WC_CONSUMER_KEY || '')}&consumer_secret=${encodeURIComponent(fe.WC_CONSUMER_SECRET || '')}`;
const getText = async (u, ms = 25000) => { try { const r = await fetch(u, { headers: { 'user-agent': 'Mozilla/5.0 (wenu-scorecard)' }, redirect: 'follow', signal: AbortSignal.timeout(ms) }); return await r.text(); } catch { return ''; } };
const getJSON = async (u, ms = 20000) => { try { const r = await fetch(u, { signal: AbortSignal.timeout(ms) }); return await r.json(); } catch { return null; } };
const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

async function measure() {
  const s = {}; const notes = {};

  // ── Catálogo: % de publicados con imagen real (no placeholder) ──
  let pub = 0, real = 0;
  for (let page = 1; page <= 6; page++) {
    const arr = await getJSON(`${WC}/products?status=publish&per_page=100&page=${page}&_fields=id,images&${auth}`);
    if (!Array.isArray(arr) || arr.length === 0) break;
    for (const p of arr) { pub++; const src = (p.images && p.images[0] && p.images[0].src) || ''; if (src && !/placeholder/i.test(src)) real++; }
    if (arr.length < 100) break;
  }
  s.catalogo = pub ? clamp((real / pub) * 100) : 0;
  notes.catalogo = `${real}/${pub} publicados con foto real`;

  // ── SEO técnico (live): 4 chequeos de 25 c/u ──
  const home = await getText(`${SITE}/`);
  const shop = await getText(`${SITE}/shop/`);
  const contact = await getText(`${SITE}/contact/`);
  let seo = 0; const seoBits = [];
  if (/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(home)) { seo += 25; seoBits.push('home meta ✓'); } else seoBits.push('home meta ✗');
  if (/application\/ld\+json/i.test(home)) { seo += 25; seoBits.push('JSON-LD ✓'); } else seoBits.push('JSON-LD ✗');
  if (/<meta[^>]+name=["']description["'][^>]+content=["'][^"']{20,}/i.test(shop)) { seo += 25; seoBits.push('shop meta ✓'); } else seoBits.push('shop meta ✗');
  if (contact && !/rel=["']canonical["'][^>]*contact-2/i.test(contact)) { seo += 25; seoBits.push('canonical ✓'); } else seoBits.push('canonical ✗');
  s.seo = clamp(seo); notes.seo = seoBits.join(' · ');

  // ── Pagos: backend alcanzable ──
  let payHttp = 0;
  try { const r = await fetch('https://api.wenumapuonline.com/shop/order', { method: 'GET', signal: AbortSignal.timeout(12000) }); payHttp = r.status; } catch { payHttp = 0; }
  // reachable pero con riesgos conocidos (punto único, sin tarjeta USD) → techo 50
  s.pagos = payHttp >= 200 && payHttp < 500 ? 50 : 15;
  notes.pagos = payHttp ? `backend HTTP ${payHttp} (sin fallback / sin tarjeta USD)` : 'backend NO responde';

  // ── Servicios/automatizaciones: launchd clave arriba ──
  let up = 0; const svc = ['ai.hermes.gateway', 'com.wenu.email-agent'];
  try { const { execSync } = await import('node:child_process'); const list = execSync('launchctl list 2>/dev/null', { encoding: 'utf8' }).split('\n'); up = svc.filter((n) => { const ln = list.find((l) => l.endsWith('\t' + n) || l.trim().split(/\s+/).pop() === n); return ln && /^\d+$/.test(ln.trim().split(/\s+/)[0]); }).length; } catch {}
  s.automatizaciones = clamp(50 + (up / svc.length) * 40); // 50 base + hasta 40 por servicios vivos
  notes.automatizaciones = `${up}/${svc.length} servicios clave vivos`;

  return { s, notes };
}

const BASELINE = { pagos: 42, seo: 48, infra: 50, procesos: 60, contenido: 65, automatizaciones: 68, catalogo: 70, ux: 78, sitio: 80, marca: 82 };
const MANUAL = ['infra', 'procesos', 'contenido', 'ux', 'sitio', 'marca'];
const LABEL = { pagos: 'Pagos', seo: 'SEO', infra: 'Infra', procesos: 'Procesos', contenido: 'Contenido', automatizaciones: 'Automatiz.', catalogo: 'Catálogo', ux: 'UX/UI', sitio: 'Sitio', marca: 'Marca' };

async function main() {
  const prev = (() => { try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); } catch { return { scores: {}, ts: null }; } })();
  const { s: measured, notes } = await measure();
  const scores = { ...BASELINE, ...(prev.scores || {}) , ...measured }; // manual áreas persisten; medidas se refrescan
  const overall = clamp(Object.values(scores).reduce((a, b) => a + b, 0) / Object.keys(scores).length);
  const prevOverall = prev.scores && Object.keys(prev.scores).length ? clamp(Object.values({ ...BASELINE, ...prev.scores }).reduce((a, b) => a + b, 0) / 10) : null;

  const arrow = (d) => d > 0 ? `▲+${d}` : d < 0 ? `▼${d}` : '=';
  const deltaOf = (k) => prev.scores && prev.scores[k] != null ? scores[k] - prev.scores[k] : 0;

  // ranking peores 3 (para "dónde mejorar")
  const worst = Object.keys(scores).sort((a, b) => scores[a] - scores[b]).slice(0, 3);

  const lines = [];
  lines.push(`Scorecard Wenu Mapu — ${new Date().toISOString().slice(0, 10)}`);
  lines.push(`GLOBAL: ${overall}/100 ${prevOverall != null ? arrow(overall - prevOverall) : '(v1)'}`);
  lines.push('');
  lines.push('Medido esta semana:');
  for (const k of Object.keys(measured)) lines.push(`  ${LABEL[k]}: ${scores[k]}% ${arrow(deltaOf(k))} — ${notes[k]}`);
  lines.push('');
  lines.push('A mejorar (3 más flojos): ' + worst.map((k) => `${LABEL[k]} ${scores[k]}%`).join(' · '));
  lines.push('(Áreas manuales — UX/marca/sitio/infra/procesos/contenido — mantienen baseline hasta revisión.)');
  const report = lines.join('\n');

  // persistir estado
  fs.writeFileSync(STATE, JSON.stringify({ ts: new Date().toISOString(), overall, scores, notes }, null, 2));

  // actualizar bloque en el doc maestro
  try {
    let doc = fs.readFileSync(DOC, 'utf8');
    const block = `\n<!-- AUTO-WEEKLY-START -->\n## 🔄 Última medición automática (${new Date().toISOString().slice(0, 10)})\nGLOBAL **${overall}%**${prevOverall != null ? ` (${arrow(overall - prevOverall)})` : ''}\n\n` +
      Object.keys(measured).map((k) => `- **${LABEL[k]}** ${scores[k]}% ${arrow(deltaOf(k))} — ${notes[k]}`).join('\n') + `\n<!-- AUTO-WEEKLY-END -->\n`;
    doc = /<!-- AUTO-WEEKLY-START -->[\s\S]*<!-- AUTO-WEEKLY-END -->/.test(doc)
      ? doc.replace(/<!-- AUTO-WEEKLY-START -->[\s\S]*<!-- AUTO-WEEKLY-END -->/, block.trim())
      : doc + block;
    fs.writeFileSync(DOC, doc);
  } catch (e) { console.error('doc update skip:', e.message); }

  console.log(report);

  // enviar a Telegram
  if (SEND && TOK && CID) {
    const r = await fetch(`https://api.telegram.org/bot${TOK}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: CID, text: report }),
    });
    const j = await r.json().catch(() => ({}));
    console.log('telegram:', j.ok ? `ok msg ${j.result?.message_id}` : `FAIL ${j.description}`);
  } else console.log('telegram: skipped (--no-send o faltan token/chat_id)');
}
main().catch((e) => { console.error('FATAL', e); process.exit(1); });
