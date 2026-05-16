import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'docs/asset-board.html');
const SOURCES = [
  { label: 'Website brand assets', root: path.join(ROOT, 'public/img/brand'), limit: 80 },
  { label: 'Website product assets', root: path.join(ROOT, 'public/img/products'), limit: 80 },
  {
    label: 'Obsidian marketing banners',
    root: '/Users/user1/Obsidian/WenuAgent/brand/07-marketing-collateral/banners',
    limit: 80,
  },
  {
    label: 'Obsidian product macro finals',
    root: '/Users/user1/Obsidian/WenuAgent/brand/04-photography/product-macro/final',
    limit: 240,
  },
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

function htmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function srcFor(file) {
  if (file.startsWith(ROOT)) {
    return path.relative(path.dirname(OUT), file).split(path.sep).join('/');
  }
  return `file://${file}`;
}

function skuFrom(relative) {
  const match = relative.match(/\b(WM-[A-Z]{3}-\d{3})\b/i);
  return match ? match[1].toUpperCase() : '';
}

async function collect(source) {
  const files = [];
  for await (const file of walk(source.root)) {
    const st = await stat(file);
    const relative = path.relative(source.root, file);
    files.push({
      ...source,
      file,
      relative,
      src: srcFor(file),
      sizeKb: Math.round(st.size / 1024),
      sku: skuFrom(relative),
      ext: path.extname(file).toLowerCase().slice(1),
    });
  }
  return files.sort((a, b) => {
    const skuOrder = a.sku.localeCompare(b.sku);
    return skuOrder || a.relative.localeCompare(b.relative);
  }).slice(0, source.limit);
}

const sections = [];
for (const source of SOURCES) {
  sections.push({ source, assets: await collect(source) });
}

const total = sections.reduce((sum, section) => sum + section.assets.length, 0);
const now = new Date().toISOString();

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Wenu Mapu Asset Board</title>
  <style>
    :root {
      color-scheme: dark;
      --bg: #080706;
      --panel: #15110d;
      --line: #3a3026;
      --text: #f2ede4;
      --muted: #a8a39a;
      --accent: #c4935a;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      line-height: 1.45;
    }
    header {
      padding: 32px clamp(18px, 4vw, 56px) 20px;
      border-bottom: 1px solid var(--line);
    }
    main { padding: 24px clamp(18px, 4vw, 56px) 56px; }
    h1, h2, p { margin: 0; }
    h1 { font-size: clamp(28px, 4vw, 52px); font-weight: 650; letter-spacing: 0; }
    h2 { margin: 36px 0 14px; font-size: 18px; color: var(--accent); letter-spacing: 0; }
    .meta { margin-top: 10px; color: var(--muted); max-width: 850px; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
      gap: 14px;
    }
    .card {
      min-width: 0;
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      overflow: hidden;
    }
    .thumb {
      width: 100%;
      aspect-ratio: 1 / 1;
      background: #0e0b09;
      display: grid;
      place-items: center;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      display: block;
    }
    .body { padding: 10px; }
    .name {
      font-size: 12px;
      overflow-wrap: anywhere;
    }
    .details {
      margin-top: 8px;
      color: var(--muted);
      font-size: 11px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .tag {
      border: 1px solid var(--line);
      border-radius: 999px;
      padding: 2px 7px;
    }
  </style>
</head>
<body>
  <header>
    <h1>Wenu Mapu Asset Board</h1>
    <p class="meta">Generated ${htmlEscape(now)}. Local review board only: no uploads, no WooCommerce writes, no production deploys. Total assets shown: ${total}.</p>
  </header>
  <main>
    ${sections.map(section => `
      <section>
        <h2>${htmlEscape(section.source.label)} · ${section.assets.length}</h2>
        <div class="grid">
          ${section.assets.map(asset => `
            <article class="card">
              <div class="thumb">
                <img src="${htmlEscape(asset.src)}" alt="${htmlEscape(asset.relative)}" loading="lazy">
              </div>
              <div class="body">
                <p class="name">${htmlEscape(asset.relative)}</p>
                <div class="details">
                  ${asset.sku ? `<span class="tag">${htmlEscape(asset.sku)}</span>` : ''}
                  <span class="tag">${htmlEscape(asset.ext)}</span>
                  <span class="tag">${asset.sizeKb} KB</span>
                </div>
              </div>
            </article>
          `).join('')}
        </div>
      </section>
    `).join('')}
  </main>
</body>
</html>
`;

await mkdir(path.dirname(OUT), { recursive: true });
await writeFile(OUT, html);
console.log(`Wrote ${path.relative(ROOT, OUT)}`);
console.log(`assets=${total}`);
