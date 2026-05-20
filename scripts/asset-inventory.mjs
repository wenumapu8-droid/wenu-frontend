import { readdir, readFile, stat, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SEARCH_INDEX = path.join(ROOT, 'dist/search-index.json');
const REPORT_PATH = path.join(ROOT, 'docs/asset-inventory.md');
const PUBLIC_IMG_ROOT = path.join(ROOT, 'public/img');
const OBSIDIAN_ROOT = '/Users/user1/Obsidian/WenuAgent';
const OBSIDIAN_PATHS = [
  'brand/07-marketing-collateral',
  'brand/04-photography/product-macro/final',
];
const IMAGE_EXT = /\.(avif|webp|png|jpe?g)$/i;

async function exists(file) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function* walk(dir) {
  if (!(await exists(dir))) return;
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (IMAGE_EXT.test(entry.name)) yield full;
  }
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function tokens(value) {
  return new Set(normalize(value).split(/\s+/).filter(token => token.length >= 3));
}

function productSku(product) {
  const value = `${product.slug || ''} ${product.name || ''}`;
  const match = value.match(/\bwm[-\s]?([a-z]{3})[-\s]?(\d{3})\b/i);
  if (!match) return null;
  return `WM-${match[1].toUpperCase()}-${match[2]}`;
}

function assetSku(asset) {
  const match = asset.relative.match(/\b(WM-[A-Z]{3}-\d{3})\b/i);
  return match ? match[1].toUpperCase() : null;
}

function scoreAsset(product, asset) {
  const sku = productSku(product);
  if (sku && assetSku(asset) === sku) return 100;
  if (sku) return 0;

  const productTokens = tokens(`${product.slug} ${product.name} ${(product.cats || []).join(' ')}`);
  const assetTokens = tokens(asset.relative);
  let score = 0;
  const ignored = new Set(['gold', 'golden', 'steel', 'silver', 'front', 'with', 'black', 'body']);
  for (const token of productTokens) {
    if (ignored.has(token)) continue;
    if (assetTokens.has(token)) score += token.length > 5 ? 2 : 1;
  }
  return score;
}

function groupBySku(assets) {
  const groups = new Map();
  for (const asset of assets) {
    const match = asset.relative.match(/\b(WM-[A-Z]{3}-\d{3})\b/i);
    if (!match) continue;
    const sku = match[1].toUpperCase();
    if (!groups.has(sku)) groups.set(sku, []);
    groups.get(sku).push(asset);
  }
  return groups;
}

async function collectAssets(root, label) {
  const assets = [];
  for await (const file of walk(root)) {
    const st = await stat(file);
    assets.push({
      label,
      path: file,
      relative: path.relative(root, file),
      sizeKb: Math.round(st.size / 1024),
      ext: path.extname(file).toLowerCase().slice(1),
    });
  }
  return assets.sort((a, b) => a.relative.localeCompare(b.relative));
}

async function main() {
  if (!(await exists(SEARCH_INDEX))) {
    throw new Error('dist/search-index.json is missing. Run npm run build before asset inventory.');
  }

  const products = JSON.parse(await readFile(SEARCH_INDEX, 'utf8'));
  const siteAssets = await collectAssets(PUBLIC_IMG_ROOT, 'public/img');
  const obsidianAssets = (
    await Promise.all(OBSIDIAN_PATHS.map(relative => {
      const root = path.join(OBSIDIAN_ROOT, relative);
      return collectAssets(root, relative);
    }))
  ).flat();

  const obsidianSkuGroups = groupBySku(obsidianAssets);
  const marketingBanners = obsidianAssets.filter(asset => /banner|collection|meteorite|ritual/i.test(asset.relative));
  const publicCollections = siteAssets.filter(asset => /brand|categories|products|graphics|sets/i.test(asset.path));
  const productMatches = products.map(product => {
    const ranked = obsidianAssets
      .map(asset => ({ asset, score: scoreAsset(product, asset) }))
      .filter(item => item.score >= 5 || item.score === 100)
      .sort((a, b) => b.score - a.score || a.asset.relative.localeCompare(b.asset.relative))
      .slice(0, 5);
    return { product, ranked };
  });

  const productsWithCandidates = productMatches.filter(item => item.ranked.length > 0);
  const productsWithoutCandidates = productMatches.filter(item => item.ranked.length === 0);

  const lines = [];
  lines.push('# Wenu Mapu Asset Inventory');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');
  lines.push('## Scope');
  lines.push('');
  lines.push('- Read-only inventory. It does not copy, optimize, upload, publish, or edit WooCommerce.');
  lines.push('- Product source: `dist/search-index.json` from the latest successful build.');
  lines.push('- Site assets: `public/img`.');
  lines.push('- Source assets: `Obsidian/WenuAgent/brand/07-marketing-collateral` and `brand/04-photography/product-macro/final`.');
  lines.push('');
  lines.push('## Counts');
  lines.push('');
  lines.push(`- Products in generated search index: ${products.length}`);
  lines.push(`- Site image assets under public/img: ${siteAssets.length}`);
  lines.push(`- Obsidian marketing/product image assets scanned: ${obsidianAssets.length}`);
  lines.push(`- Obsidian SKU folders detected: ${obsidianSkuGroups.size}`);
  lines.push(`- Products with likely Obsidian image candidates: ${productsWithCandidates.length}`);
  lines.push(`- Products with no likely Obsidian image candidate yet: ${productsWithoutCandidates.length}`);
  lines.push('');
  lines.push('## Collection And Marketing Banners');
  lines.push('');
  for (const asset of marketingBanners.slice(0, 30)) {
    lines.push(`- ${asset.relative} (${asset.label}, ${asset.ext}, ${asset.sizeKb} KB)`);
  }
  if (marketingBanners.length === 0) lines.push('- No banner-like source assets found.');
  lines.push('');
  lines.push('## Current Public Collection/Product Assets');
  lines.push('');
  for (const asset of publicCollections.slice(0, 60)) {
    lines.push(`- ${asset.relative} (${asset.ext}, ${asset.sizeKb} KB)`);
  }
  lines.push('');
  lines.push('## Likely Product Image Candidates');
  lines.push('');
  for (const item of productsWithCandidates.slice(0, 40)) {
    lines.push(`### ${item.product.name}`);
    lines.push(`- Product slug: \`${item.product.slug}\``);
    lines.push(`- Current image: ${item.product.image || 'missing'}`);
    lines.push('- Candidate source assets:');
    for (const { asset, score } of item.ranked) {
      lines.push(`  - score ${score}: ${asset.label}/${asset.relative}`);
    }
    lines.push('');
  }
  lines.push('## Products Needing Image Review');
  lines.push('');
  for (const item of productsWithoutCandidates.slice(0, 60)) {
    lines.push(`- ${item.product.slug} — ${item.product.name}`);
  }
  if (productsWithoutCandidates.length > 60) {
    lines.push(`- ...and ${productsWithoutCandidates.length - 60} more.`);
  }
  lines.push('');
  lines.push('## Recommended Next Actions');
  lines.push('');
  lines.push('1. Choose one collection at a time: Ritual, Mystic, Author, Hangers, Saddles, or Tunnels.');
  lines.push('2. Copy only approved final images into `public/img/products` or `public/img/brand` with kebab-case names.');
  lines.push('3. Run `node scripts/clean-images.mjs public/img` and `node scripts/gen-avif.mjs public/img` after copy/approval.');
  lines.push('4. Update website references only after the asset is in `public/img` and the build passes.');
  lines.push('5. Do not write to WooCommerce from this inventory workflow.');
  lines.push('');

  await mkdir(path.dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, `${lines.join('\n')}\n`);
  console.log(`Wrote ${path.relative(ROOT, REPORT_PATH)}`);
  console.log(`products=${products.length}`);
  console.log(`site_assets=${siteAssets.length}`);
  console.log(`obsidian_assets=${obsidianAssets.length}`);
  console.log(`products_with_candidates=${productsWithCandidates.length}`);
  console.log(`products_without_candidates=${productsWithoutCandidates.length}`);
}

main().catch(error => {
  console.error(error.message);
  process.exit(1);
});
