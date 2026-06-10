#!/usr/bin/env node
/**
 * generate-collection-banner.mjs
 *
 * Genera banner 2400×1029 por categoría usando fotos macro REALES
 * (sin AI, solo composite sharp + SVG brand). Output a
 * public/img/categories/banner-<cat>.{png,webp,avif}
 *
 * Layout: foto cuadrada izquierda + texto/iconografía derecha sobre
 * gradient obsidian → bronze + sutil mapuche pattern.
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import sharp from 'sharp';

const FINAL = path.join(os.homedir(), 'Obsidian/WenuAgent/brand/04-photography/product-macro/final');
const OUT = path.resolve('public/img/categories');

const COLLECTIONS = [
  {
    slug: 'hangers',
    label: 'HANGERS · WEIGHTS',
    tagline: 'Ancestral coils, worn',
    hero_sku: 'WM-HAN-001',
    icon: 'spiral',
  },
  {
    slug: 'piercing',
    label: 'PIERCING',
    tagline: 'Body as sacred territory',
    hero_sku: 'WM-PRC-001',
    icon: 'cardinal-cross',
  },
  {
    slug: 'saddle',
    label: 'SADDLE EXPANSIONS',
    tagline: 'Stone and metal, opened',
    hero_sku: 'WM-SAD-001',
    icon: 'kultrun',
  },
  {
    slug: 'tunnels',
    label: 'TUNNELS',
    tagline: 'Passages between worlds',
    hero_sku: 'WM-TUN-005',
    icon: 'volcano',
  },
  {
    slug: 'earrings',
    label: 'EARRINGS',
    tagline: 'Hoops, signals, memory',
    hero_sku: 'WM-EAR-001',
    icon: 'copihue',
  },
  {
    slug: 'ritual',
    label: 'RITUAL OBJECTS',
    tagline: 'Beyond adornment',
    hero_sku: 'WM-OTH-001',
    icon: 'meteor',
  },
];

const ICON_PATHS = {
  spiral: 'M24 24 m-12 0 a12 12 0 1 1 0 0.01 M24 24 m-8 0 a8 8 0 1 0 0 -0.01 M24 24 m-4 0 a4 4 0 1 1 0 0.01',
  'cardinal-cross': 'M24 4 L24 44 M4 24 L44 24 M14 14 L34 34 M34 14 L14 34',
  kultrun: 'M24 12 m-12 0 a12 6 0 1 0 24 0 a12 6 0 1 0 -24 0 M24 12 L24 36',
  volcano: 'M8 40 L24 8 L40 40 Z M16 28 L32 28',
  copihue: 'M24 24 m-8 0 a8 4 0 1 0 16 0 a8 4 0 1 0 -16 0 M16 24 L8 40 M32 24 L40 40 M24 16 L24 8',
  meteor: 'M36 8 L8 40 M32 12 L20 28 M28 16 L24 32',
};

async function findHeroPhoto(sku) {
  const dir = path.join(FINAL, sku);
  if (!fs.existsSync(dir)) return null;
  const files = fs.readdirSync(dir);
  const f = files.find(x => /-full\.webp$/.test(x))
        || files.find(x => /-medium\.webp$/.test(x))
        || files.find(x => /-full\.avif$/.test(x))
        || files.find(x => /-medium\.avif$/.test(x));
  return f ? path.join(dir, f) : null;
}

function escapeXml(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

async function buildBanner(coll) {
  const W = 2400, H = 1029;
  const heroPath = await findHeroPhoto(coll.hero_sku);
  if (!heroPath) throw new Error(`No hero photo for ${coll.hero_sku}`);

  // Foto: circular mask 620×620, posicionado a la derecha del centro
  // Strategy: aplicar máscara circular vía SVG con clipPath, foto adentro
  // y vignette radial alrededor para fade orgánico al background brand
  const heroBuf = await sharp(heroPath)
    .resize({ width: 800, height: 800, fit: 'cover', position: 'center' })
    .modulate({ brightness: 0.92, saturation: 0.88 })  // suavizar contra background
    .png()
    .toBuffer();
  const heroB64 = heroBuf.toString('base64');

  const iconPath = ICON_PATHS[coll.icon] || ICON_PATHS['cardinal-cross'];

  // Layout editorial: TEXTO LEFT · FOTO CIRCULAR RIGHT
  // Foto centrada en circle mask con vignette suave que se funde al bg
  const photoSize = 720;
  const photoCx = 1820, photoCy = H / 2;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <radialGradient id="bg" cx="0.4" cy="0.5" r="0.85">
      <stop offset="0" stop-color="#121212"/>
      <stop offset="0.6" stop-color="#121212"/>
      <stop offset="1" stop-color="#0a0a0a"/>
    </radialGradient>
    <radialGradient id="emberGlow" cx="0.75" cy="0.5" r="0.45">
      <stop offset="0" stop-color="#c9a84c" stop-opacity="0.14"/>
      <stop offset="1" stop-color="#c9a84c" stop-opacity="0"/>
    </radialGradient>
    <!-- clipPath for circular photo -->
    <clipPath id="photoClip">
      <circle cx="${photoCx}" cy="${photoCy}" r="${photoSize/2}"/>
    </clipPath>
    <!-- radial fade to blend photo edges to background -->
    <radialGradient id="photoFade" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0.55" stop-color="#0a0a0a" stop-opacity="0"/>
      <stop offset="0.95" stop-color="#0a0a0a" stop-opacity="0.85"/>
      <stop offset="1" stop-color="#0a0a0a" stop-opacity="1"/>
    </radialGradient>
    <!-- soft outer ring -->
    <radialGradient id="haloRing" cx="0.5" cy="0.5" r="0.55">
      <stop offset="0.92" stop-color="#c9a84c" stop-opacity="0"/>
      <stop offset="0.98" stop-color="#c9a84c" stop-opacity="0.25"/>
      <stop offset="1" stop-color="#c9a84c" stop-opacity="0"/>
    </radialGradient>
  </defs>

  <!-- bg layers -->
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#emberGlow)"/>

  <!-- photo with circular clip + radial fade -->
  <g clip-path="url(#photoClip)">
    <image x="${photoCx - 400}" y="${photoCy - 400}" width="800" height="800" xlink:href="data:image/png;base64,${heroB64}" preserveAspectRatio="xMidYMid slice"/>
    <rect x="${photoCx - 400}" y="${photoCy - 400}" width="800" height="800" fill="url(#photoFade)"/>
  </g>
  <!-- subtle ember halo around photo edge -->
  <circle cx="${photoCx}" cy="${photoCy}" r="${photoSize/2 + 4}" fill="none" stroke="rgba(196,147,90,0.35)" stroke-width="1"/>
  <circle cx="${photoCx}" cy="${photoCy}" r="${photoSize/2 + 60}" fill="url(#haloRing)" opacity="0.6"/>

  <!-- LEFT: text composition centered ~840px from left -->
  <!-- icon brand top-left -->
  <g transform="translate(280 ${photoCy - 240}) scale(2.4)" fill="none" stroke="#c9a84c" stroke-width="1.4" opacity="0.9">
    <path d="${iconPath}"/>
  </g>

  <!-- thin vertical accent line -->
  <line x1="280" y1="${photoCy - 80}" x2="280" y2="${photoCy + 200}" stroke="rgba(212,193,163,0.22)" stroke-width="1"/>

  <!-- eyebrow -->
  <text x="320" y="${photoCy - 60}" font-family="'Cormorant Garamond', Georgia, serif" font-size="14" letter-spacing="5" fill="#c9a84c">WENU MAPU  ·  COLLECTION</text>

  <!-- main label, wrapped if needed -->
  <text x="320" y="${photoCy + 30}" font-family="'Cinzel Decorative', Georgia, serif" font-size="92" font-weight="400" fill="#f0ede8" letter-spacing="-1.5">${escapeXml(coll.label)}</text>

  <!-- tagline italic -->
  <text x="320" y="${photoCy + 100}" font-family="Georgia, serif" font-style="italic" font-size="30" fill="rgba(214,193,163,0.78)">${escapeXml(coll.tagline)}</text>

  <!-- SKU subtle bottom -->
  <text x="320" y="${photoCy + 175}" font-family="'Cormorant Garamond', Georgia, serif" font-size="11" letter-spacing="2" fill="rgba(168,163,154,0.55)">FEATURED · ${escapeXml(coll.hero_sku)}</text>

  <!-- corner mark right top -->
  <g transform="translate(${W-120} 80)" opacity="0.35">
    <path d="M0 24 L48 24 M24 0 L24 48" stroke="#f0ede8" stroke-width="0.8" fill="none"/>
    <circle cx="24" cy="24" r="3" fill="#f0ede8"/>
  </g>

  <!-- wordmark bottom left -->
  <text x="280" y="${H-60}" font-family="'Cinzel Decorative', Georgia, serif" font-size="20" letter-spacing="6" fill="#c9a84c">WENU MAPU</text>
  <text x="280" y="${H-38}" font-family="'Cormorant Garamond', Georgia, serif" font-size="10" letter-spacing="3" fill="rgba(168,163,154,0.6)">TRIBAL JEWELRY · CONNECTED TO THE COSMOS</text>
</svg>`;

  fs.mkdirSync(OUT, { recursive: true });
  const stem = `banner-${coll.slug}`;
  await sharp(Buffer.from(svg)).png().toFile(path.join(OUT, `${stem}.png`));
  await sharp(Buffer.from(svg)).webp({ quality: 88 }).toFile(path.join(OUT, `${stem}.webp`));
  await sharp(Buffer.from(svg)).avif({ quality: 70 }).toFile(path.join(OUT, `${stem}.avif`));
  return stem;
}

for (const coll of COLLECTIONS) {
  try {
    const stem = await buildBanner(coll);
    console.log(`✓ ${coll.slug.padEnd(10)} → ${stem}.{png,webp,avif}  hero=${coll.hero_sku}`);
  } catch (e) {
    console.error(`✗ ${coll.slug}: ${e.message}`);
  }
}
