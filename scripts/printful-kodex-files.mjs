import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const sourceDir = path.join(root, 'kodex-source/printful-poc');
const publicBase = (
  process.env.KODEX_PRINTFUL_PUBLIC_BASE ||
  'https://www.wenumapuonline.com/img/kodex/printful'
).replace(/\/+$/, '');

const token = process.env.PRINTFUL_API_TOKEN;
const dryRun = process.argv.includes('--dry-run');

const slugs = [
  'kodex-ocin-32302-cardinal-bloom',
  'kodex-ocin-30110-mandala-axis',
  'kodex-ocin-30211-square-field',
];

if (!token && !dryRun) {
  console.error('Missing PRINTFUL_API_TOKEN. Use: node --env-file=.env scripts/printful-kodex-files.mjs');
  process.exit(1);
}

async function readJson(file) {
  return JSON.parse(await fs.readFile(file, 'utf8'));
}

function publicUrl(localFile) {
  return `${publicBase}/${path.basename(localFile)}`;
}

async function postPrintfulFile(item, kind, fileUrl) {
  const res = await fetch('https://api.printful.com/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      url: fileUrl,
      filename: path.basename(fileUrl),
      visible: true,
    }),
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${item.slug} ${kind}: HTTP ${res.status} ${JSON.stringify(body).slice(0, 500)}`);
  }

  return body.result;
}

const manifest = [];

for (const slug of slugs) {
  const item = await readJson(path.join(sourceDir, `${slug}.json`));
  const files = {
    printFile: publicUrl(item.outputs.printFile),
    mockup: publicUrl(item.outputs.mockup),
    webPreview: publicUrl(item.outputs.webPreview),
  };

  const entry = {
    slug: item.slug,
    title: item.title,
    product: item.product,
    files,
    skipped: {
      webPreview: 'Printful file API rejects webp; keep this asset for site/Pinterest only.',
    },
    printful: {},
  };

  if (dryRun) {
    console.log(JSON.stringify({ dryRun: true, slug: item.slug, files }, null, 2));
  } else {
    for (const kind of ['printFile', 'mockup']) {
      const url = files[kind];
      const uploaded = await postPrintfulFile(item, kind, url);
      entry.printful[kind] = {
        id: uploaded.id,
        status: uploaded.status,
        filename: uploaded.filename,
        preview_url: uploaded.preview_url || null,
      };
      console.log(`${item.slug} ${kind}: file ${uploaded.id} (${uploaded.status})`);
    }
  }

  manifest.push(entry);
}

const outPath = path.join(sourceDir, 'printful-files-manifest.json');
await fs.writeFile(outPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  dryRun,
  note: 'File uploads only. No Printful products, Woo products, prices, or sync variants are created by this script.',
  items: manifest,
}, null, 2)}\n`);

console.log(`wrote ${path.relative(root, outPath)}`);
