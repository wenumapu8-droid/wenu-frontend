#!/usr/bin/env node
// KODEX −∞ · cablear packs post-hosting
//
// Usage:
//   node scripts/kodex-wire-packs.mjs \
//     --achroma https://.../kodex-achroma.zip \
//     --disco   https://.../kodex-disco-solar.zip \
//     --tribe   https://.../kodex-tribe.zip \
//     --archive https://.../kodex-archive.zip
//
// Optional: --dry-run    (print planned changes, no writes)
//           --skip-wc    (skip WC PUT, only edit store.astro)
//           --skip-astro (skip store.astro edit, only WC PUT)
//
// What it does:
//   1. PUT WC products 3434/3435/3436/3437 → adds downloads[] with the URL
//      and flips downloadable=true, download_limit=-1, download_expiry=-1.
//   2. Runs a validation curl on each URL (HEAD, expect 200 + content-type zip).
//   3. Optionally flips status draft → publish (only with --publish flag).
//
// Backup: writes /tmp/kodex-wire-packs-backup-<timestamp>.json with the
// full prior state of each product before mutating.

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const PACK_MAP = {
  achroma: { id: 3434, slug: 'kodex-pack-achroma',     name: 'ACHROMA',     file: 'kodex-achroma.zip'     },
  disco:   { id: 3435, slug: 'kodex-pack-disco-solar', name: 'DISCO SOLAR', file: 'kodex-disco-solar.zip' },
  tribe:   { id: 3436, slug: 'kodex-pack-tribe-space', name: 'TRIBE SPACE', file: 'kodex-tribe.zip'       },
  archive: { id: 3437, slug: 'kodex-pack-archive',     name: 'THE ARCHIVE', file: 'kodex-archive.zip'     },
};

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const k = a.slice(2);
      const v = argv[i + 1]?.startsWith('--') || argv[i + 1] === undefined ? true : argv[++i];
      args[k] = v;
    }
  }
  return args;
}

async function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  const raw = readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return env;
}

async function httpHead(url) {
  return new Promise((resolve) => {
    const r = spawnSync('curl', ['-sS', '-I', '-L', '--max-time', '15', url], { encoding: 'utf8' });
    const out = r.stdout || '';
    const status = out.match(/HTTP\/[\d.]+ (\d+)/)?.[1] || '000';
    const ct = out.match(/content-type:\s*([^\r\n]+)/i)?.[1]?.trim() || '';
    const len = out.match(/content-length:\s*(\d+)/i)?.[1] || '0';
    resolve({ status, contentType: ct, length: +len });
  });
}

async function wcPut(env, id, body) {
  const url = `https://www.wenumapuonline.com/wp-json/wc/v3/products/${id}`;
  const auth = Buffer.from(`${env.WC_CONSUMER_KEY}:${env.WC_CONSUMER_SECRET}`).toString('base64');
  const r = spawnSync('curl', [
    '-sS', '-X', 'PUT', url,
    '-H', 'Content-Type: application/json',
    '-H', `Authorization: Basic ${auth}`,
    '-d', JSON.stringify(body),
    '-w', '\nHTTP=%{http_code}',
  ], { encoding: 'utf8' });
  const raw = r.stdout || '';
  const [json, meta] = raw.split(/\nHTTP=/);
  return { status: meta?.trim() || '000', body: json };
}

async function wcGet(env, id) {
  const url = `https://www.wenumapuonline.com/wp-json/wc/v3/products/${id}`;
  const auth = Buffer.from(`${env.WC_CONSUMER_KEY}:${env.WC_CONSUMER_SECRET}`).toString('base64');
  const r = spawnSync('curl', ['-sS', '-H', `Authorization: Basic ${auth}`, url], { encoding: 'utf8' });
  return JSON.parse(r.stdout);
}

async function main() {
  const args = parseArgs(process.argv);
  if (args.help) {
    console.log(readFileSync(new URL(import.meta.url), 'utf8').split('\n').filter(l => l.startsWith('//')).join('\n'));
    process.exit(0);
  }
  const urls = {
    achroma: args.achroma, disco: args.disco, tribe: args.tribe, archive: args.archive,
  };
  const missing = Object.entries(urls).filter(([k, v]) => !v || v === true).map(([k]) => k);
  if (missing.length && !args['skip-wc']) {
    console.error(`[wire-packs] FAIL: missing URLs for: ${missing.join(', ')}`);
    console.error(`Usage: node scripts/kodex-wire-packs.mjs --achroma <url> --disco <url> --tribe <url> --archive <url>`);
    process.exit(1);
  }

  const env = await loadEnv();
  console.log(`[wire-packs] dry-run=${!!args['dry-run']}  publish=${!!args.publish}\n`);

  // 1. Validate each URL is reachable and looks like a zip.
  console.log('── URL validation ──');
  for (const [key, url] of Object.entries(urls)) {
    if (!url || url === true) continue;
    const head = await httpHead(url);
    const ok = head.status === '200' && (head.contentType.includes('zip') || head.contentType.includes('octet-stream'));
    console.log(`  ${ok ? '✓' : '✗'} ${key.padEnd(8)}  ${head.status}  ${head.contentType}  ${(head.length / 1e6).toFixed(1)}MB  ${url}`);
    if (!ok && !args.force) {
      console.error(`\n[wire-packs] FAIL: ${key} URL not reachable or not a zip. Use --force to override.`);
      process.exit(2);
    }
  }

  if (args['skip-wc']) {
    console.log('\n[wire-packs] --skip-wc set. Done.');
    return;
  }

  // 2. Backup current WC state.
  console.log('\n── WC backup ──');
  const backup = {};
  for (const key of Object.keys(urls)) {
    const p = PACK_MAP[key];
    backup[key] = await wcGet(env, p.id);
    console.log(`  ✓ backed up ${p.slug} (id ${p.id}, status ${backup[key].status})`);
  }
  const backupPath = `/tmp/kodex-wire-packs-backup-${Date.now()}.json`;
  writeFileSync(backupPath, JSON.stringify(backup, null, 2));
  console.log(`  Backup saved to ${backupPath}`);

  if (args['dry-run']) {
    console.log('\n[wire-packs] DRY RUN — no WC writes. Done.');
    return;
  }

  // 3. PUT downloads[] for each product.
  console.log('\n── WC PUT downloads ──');
  for (const [key, url] of Object.entries(urls)) {
    if (!url || url === true) continue;
    const p = PACK_MAP[key];
    const body = {
      downloadable: true,
      downloads: [{ name: p.file, file: url }],
      download_limit: -1,
      download_expiry: -1,
    };
    if (args.publish) body.status = 'publish';
    const { status, body: resp } = await wcPut(env, p.id, body);
    if (status === '200') {
      const j = JSON.parse(resp);
      console.log(`  ✓ ${p.slug.padEnd(30)}  status=${j.status}  downloads=${j.downloads?.length || 0}`);
    } else {
      console.error(`  ✗ ${p.slug} → HTTP ${status}: ${resp.slice(0, 200)}`);
    }
  }

  console.log('\n[wire-packs] Done.');
  console.log(`Rollback: node -e "const b=require('${backupPath}'); ...")  # see backup file`);
  console.log(`Next: npm run build && ./deploy-now.sh`);
}

main().catch(e => { console.error(e); process.exit(1); });
