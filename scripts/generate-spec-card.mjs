#!/usr/bin/env node
/**
 * generate-spec-card.mjs
 *
 * Genera la lámina técnica (spec card) PNG 1080x1350 para un SKU.
 * Toma datos canónicos de NocoDB + foto curada y compone con SVG + sharp.
 *
 * Usage:
 *   node scripts/generate-spec-card.mjs WM-HAN-001
 *   node scripts/generate-spec-card.mjs --all-curated   (todos los SKUs con foto en final/)
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';
import sharp from 'sharp';

const FINAL_DIR = path.join(os.homedir(), 'Obsidian/WenuAgent/brand/04-photography/product-macro/final');
const OUT_DIR = path.resolve('visual-studio/output');
const NOCO = '/tmp/noco.db';

function nocoLookup(sku) {
  const json = execSync(`sqlite3 -json "${NOCO}" "SELECT * FROM nc_9aor___Piezas WHERE SKU='${sku}'"`).toString();
  const arr = JSON.parse(json || '[]');
  return arr[0] || null;
}

function escapeXml(s) {
  if (!s) return '';
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function wrapText(text, maxChars) {
  const words = (text || '').split(/\s+/);
  const lines = [];
  let cur = '';
  for (const w of words) {
    if ((cur + ' ' + w).trim().length <= maxChars) {
      cur = (cur + ' ' + w).trim();
    } else {
      if (cur) lines.push(cur);
      cur = w;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

async function buildSpecCard(sku) {
  const data = nocoLookup(sku);
  if (!data) throw new Error(`SKU ${sku} not found in NocoDB`);

  const skuLower = sku.toLowerCase();
  const finalDir = path.join(FINAL_DIR, sku);
  if (!fs.existsSync(finalDir)) throw new Error(`No curated photo dir ${finalDir}`);
  // Fallback chain: prefer full > medium > thumb (webp first, then avif)
  const files = fs.readdirSync(finalDir);
  const photoFile = files.find(f => /-full\.webp$/.test(f))
    || files.find(f => /-medium\.webp$/.test(f))
    || files.find(f => /-thumb\.webp$/.test(f))
    || files.find(f => /-full\.avif$/.test(f))
    || files.find(f => /-medium\.avif$/.test(f))
    || files.find(f => /-thumb\.avif$/.test(f));
  if (!photoFile) throw new Error(`No photo in ${finalDir}`);
  const photoPath = path.join(finalDir, photoFile);

  // Resize foto a target box 720×540 manteniendo ratio
  const photoBuf = await sharp(photoPath)
    .resize({ width: 720, height: 540, fit: 'inside', background: { r: 8, g: 7, b: 6, alpha: 1 } })
    .png()
    .toBuffer();
  const photoMeta = await sharp(photoBuf).metadata();
  const photoB64 = photoBuf.toString('base64');

  // Specs
  const fmtNum = (v, d=1) => v ? Number(v).toFixed(d).replace(/\.0$/, '') : null;
  const specs = [
    { label: 'Material', value: data.Material || '—' },
    { label: 'Type', value: data.Tipo_de_pieza || '—' },
    { label: 'Size', value: data.Medida_mm ? `${fmtNum(data.Medida_mm,0)}mm` : '—' },
    { label: 'Weight', value: data.Peso_g ? `${fmtNum(data.Peso_g,1)}g` : '—' },
  ];
  const desc = (data.Descripcion_interna || '').replace(/\s+/g, ' ').slice(0, 240);
  const descLines = wrapText(desc, 78).slice(0, 4);

  const title = data.title || sku;
  const price = data.Precio_venta_USD || 0;
  const eyebrow = (data.Tipo_de_pieza || 'Ritual Piece').toUpperCase();
  const photoX = (1080 - photoMeta.width) / 2;
  const photoY = 280;

  // Build SVG
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1350" viewBox="0 0 1080 1350" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#121212"/>
      <stop offset="1" stop-color="#0a0a0a"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1350" fill="url(#bgGrad)"/>
  <!-- inner frame -->
  <rect x="48" y="48" width="984" height="1254" fill="none" stroke="rgba(212,193,163,0.18)" stroke-width="1"/>

  <!-- corner cardinal mark -->
  <g transform="translate(960 80)" opacity="0.35">
    <path d="M24 0 L24 48 M0 24 L48 24" stroke="#f0ede8" stroke-width="0.8" fill="none"/>
    <rect x="14" y="14" width="20" height="20" transform="rotate(45 24 24)" stroke="#f0ede8" stroke-width="1.2" fill="none"/>
    <circle cx="24" cy="24" r="3" fill="#f0ede8"/>
  </g>

  <!-- header -->
  <text x="112" y="138" font-family="'Cormorant Garamond', Georgia, serif" font-size="12" letter-spacing="3" fill="#c9a84c">${escapeXml(eyebrow)}</text>
  <text x="112" y="160" font-family="'Cormorant Garamond', Georgia, serif" font-size="11" letter-spacing="2" fill="#b8b4aa">${escapeXml(sku)}</text>

  <!-- title -->
  <text x="112" y="230" font-family="'Cinzel Decorative', Georgia, serif" font-size="52" font-weight="400" fill="#f0ede8" letter-spacing="-0.5">${escapeXml(title)}</text>

  <!-- photo -->
  <image x="${photoX}" y="${photoY}" width="${photoMeta.width}" height="${photoMeta.height}" xlink:href="data:image/png;base64,${photoB64}"/>

  <!-- specs grid -->
  <line x1="112" y1="900" x2="968" y2="900" stroke="rgba(212,193,163,0.18)" stroke-width="1"/>
  ${specs.map((s, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 112 + col * 440;
    const y = 950 + row * 70;
    return `
    <text x="${x}" y="${y}" font-family="'Cormorant Garamond', Georgia, serif" font-size="10" letter-spacing="2" fill="#b8b4aa">${escapeXml(s.label.toUpperCase())}</text>
    <text x="${x}" y="${y + 28}" font-family="'Cinzel Decorative', Georgia, serif" font-size="24" fill="#f0ede8">${escapeXml(s.value)}</text>`;
  }).join('\n')}
  <line x1="112" y1="1100" x2="968" y2="1100" stroke="rgba(212,193,163,0.18)" stroke-width="1"/>

  <!-- description -->
  ${descLines.map((line, i) => `<text x="112" y="${1140 + i * 22}" font-family="Georgia, serif" font-size="15" fill="rgba(242,237,228,0.85)">${escapeXml(line)}</text>`).join('\n')}

  <!-- footer -->
  <text x="112" y="1252" font-family="'Cinzel Decorative', Georgia, serif" font-weight="700" font-size="20" letter-spacing="8" fill="#c9a84c">WENU MAPU</text>
  <text x="968" y="1242" text-anchor="end" font-family="'Cinzel Decorative', Georgia, serif" font-weight="400" font-size="32" fill="#f0ede8">$${price} USD</text>
  <text x="968" y="1266" text-anchor="end" font-family="'Cormorant Garamond', Georgia, serif" font-style="italic" font-size="13" letter-spacing="1" fill="#b8b4aa">Tribal Jewelry · Connected to the Cosmos</text>
</svg>`;

  const outPath = path.join(OUT_DIR, sku, `${skuLower}-spec-card.png`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  await sharp(Buffer.from(svg)).png().toFile(outPath);
  return outPath;
}

const skus = process.argv.slice(2);
if (skus.includes('--all-curated')) {
  skus.splice(0, skus.length, ...fs.readdirSync(FINAL_DIR).filter(d => d.startsWith('WM-') && fs.statSync(path.join(FINAL_DIR, d)).isDirectory()));
}
if (!skus.length) {
  console.error('Usage: node generate-spec-card.mjs <SKU> [SKU...] | --all-curated');
  process.exit(1);
}

for (const sku of skus) {
  try {
    const out = await buildSpecCard(sku);
    console.log(`✓ ${sku} → ${out}`);
  } catch (e) {
    console.error(`✗ ${sku}: ${e.message}`);
  }
}
