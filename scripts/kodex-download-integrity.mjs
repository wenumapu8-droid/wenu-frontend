#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const DIST_ROOT = join(ROOT, 'dist', 'kodex');
const WALLPAPER_ROOT = join(ROOT, 'public', 'kodex-content', 'free', 'wallpapers');

if (!existsSync(DIST_ROOT)) {
  throw new Error('KODEX download integrity requires an Astro build at dist/kodex');
}

const htmlFiles = [];
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) walk(path);
    else if (name === 'index.html') htmlFiles.push(path);
  }
};

const worksIndex = join(DIST_ROOT, 'works', 'index.html');
const volumesRoot = join(DIST_ROOT, 'vol');
if (existsSync(worksIndex)) htmlFiles.push(worksIndex);
if (existsSync(volumesRoot)) walk(volumesRoot);

const DOWNLOAD_RE = /href=["']([^"']*kodex-content\/free\/wallpapers\/[^"']+)["']/g;
const broken = [];
const checked = [];

for (const htmlFile of [...new Set(htmlFiles)]) {
  const html = readFileSync(htmlFile, 'utf8');
  for (const match of html.matchAll(DOWNLOAD_RE)) {
    const href = match[1];
    let pathname;
    try {
      pathname = new URL(href, 'https://kodex.local').pathname;
    } catch {
      broken.push({ page: relative(ROOT, htmlFile), href, reason: 'INVALID_URL' });
      continue;
    }

    const marker = '/kodex-content/free/wallpapers/';
    const markerIndex = pathname.indexOf(marker);
    if (markerIndex < 0) continue;
    const filename = decodeURIComponent(pathname.slice(markerIndex + marker.length));
    const source = join(WALLPAPER_ROOT, filename);
    const entry = { page: relative(ROOT, htmlFile), href, source: relative(ROOT, source) };
    checked.push(entry);
    if (!existsSync(source)) broken.push({ ...entry, reason: 'SOURCE_ASSET_MISSING' });
  }
}

const report = {
  pages_scanned: [...new Set(htmlFiles)].length,
  download_links_checked: checked.length,
  broken_download_links: broken.length,
  broken: broken.slice(0, 50),
};

console.log(JSON.stringify(report, null, 2));

if (broken.length) {
  throw new Error(`KODEX download integrity failed: ${broken.length} rendered wallpaper link(s) have no tracked source asset`);
}
