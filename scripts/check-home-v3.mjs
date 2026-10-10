#!/usr/bin/env node
/**
 * Source-only non-destructive regression guard for Home V3.
 * Not a replacement for Astro build or browser testing.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join, dirname } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFileSync(join(root,p), 'utf8');
const page = read('src/pages/index.astro');
const hero = read('src/components/HeroCarousel.astro');
const entrances = read('src/components/HomeEditorialSelection.astro');
let failures = 0;
function test(label, valid) {
  console.log((valid ? 'PASS ' : 'FAIL ') + label);
  if(!valid) failures++;
}

for(const token of [
  '<DesignYourEarBanner />',
  '<CatalogDeck products={catalogDeck} />',
  '<SignalBand products={showcaseProducts} categories={signalCategories} />',
  '<EmberCore />',
  '<PowerAnimalsOracle />',
  '<Newsletter />',
  '<IgFollowGallery />'
]) test('Retain ' + token, page.includes(token));
test('Flag gated',page.includes("PUBLIC_WENU_HOME_V3 === 'true'"));
test('Three real Woo photo doors',page.includes('getHeroImage(piece)') && page.includes('v3Entrances.length === 3'));
test('Baseline marquee kept',page.includes('data-explore-marquee')&&page.includes('explore--collections'));
test('Fallback when missing photos',page.includes('!v3EntrancesReady'));
test('No shadow catalog or fabricated prices',!entrances.includes('$')&&!entrances.includes('USD'));
test('Wültufe CTA preserved',hero.includes('href="/constelaciones"'));
test('Hero arrows/dots retained',hero.includes('data-hero-next')&&hero.includes('data-hero-prev')&&hero.includes('data-hero-dots'));
test('Hero AVIF photo plus WebP',hero.includes('wm-han-001-xlarge.avif')&&hero.includes('wm-han-001-full.webp'));
test('Archive seasonal tag',page.includes('From the archive · Strawberry Moon'));
test('Hero V3 does not autoplay',hero.includes('if (reduce || editorialV3) return'));
if(failures) {
  console.error(failures+' source-level regression(s). DO NOT MERGE.');
  process.exitCode=1;
} else {
  console.log('Source parity PASS. NEXT: build, WooCommerce, browser & mobile QA.');
}
