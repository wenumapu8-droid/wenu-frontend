import fs from 'node:fs/promises';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const manifestPath = path.join(root, 'kodex-source/printful-poc/printful-files-manifest.json');
const outputPath = path.join(root, 'kodex-source/printful-poc/printful-products-payload.json');

const token = process.env.PRINTFUL_API_TOKEN;
const create = process.argv.includes('--create');

const productPlan = {
  'kodex-ocin-32302-cardinal-bloom': {
    sku: 'WM-KDX-PRT-32302-12',
    variant_id: 4464,
    size: '12x12',
    printful_cost: '8.89',
    suggested_retail_price: '33.00',
  },
  'kodex-ocin-30110-mandala-axis': {
    sku: 'WM-KDX-PRT-30110-12',
    variant_id: 4464,
    size: '12x12',
    printful_cost: '8.89',
    suggested_retail_price: '33.00',
  },
  'kodex-ocin-30211-square-field': {
    sku: 'WM-KDX-PRT-30211-10',
    variant_id: 6239,
    size: '10x10',
    printful_cost: '7.89',
    suggested_retail_price: '29.00',
  },
};

if (create && !token) {
  console.error('Missing PRINTFUL_API_TOKEN. Use: node --env-file=.env scripts/printful-kodex-products.mjs --create');
  process.exit(1);
}

const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'));
const payloads = manifest.items.map((item) => {
  const plan = productPlan[item.slug];
  if (!plan) throw new Error(`Missing product plan for ${item.slug}`);
  const printFileId = item.printful?.printFile?.id;
  const mockupUrl = item.files?.mockup;
  if (!printFileId) throw new Error(`Missing Printful printFile id for ${item.slug}`);

  return {
    slug: item.slug,
    title: item.title,
    sku: plan.sku,
    variant_id: plan.variant_id,
    size: plan.size,
    printful_cost: plan.printful_cost,
    suggested_retail_price: plan.suggested_retail_price,
    request: {
      sync_product: {
        external_id: plan.sku,
        name: `${item.title} - ${plan.size} Enhanced Matte Poster`,
        thumbnail: mockupUrl,
        is_ignored: true,
      },
      sync_variants: [
        {
          external_id: `${plan.sku}-V1`,
          variant_id: plan.variant_id,
          retail_price: plan.suggested_retail_price,
          is_ignored: true,
          sku: plan.sku,
          files: [
            {
              type: 'default',
              id: printFileId,
              visible: true,
            },
          ],
          availability_status: 'active',
        },
      ],
    },
  };
});

const results = [];
for (const payload of payloads) {
  if (!create) {
    console.log(`${payload.sku}: dry-run ${payload.size} variant ${payload.variant_id} cost ${payload.printful_cost} retail ${payload.suggested_retail_price}`);
    results.push({ ...payload, created: false });
    continue;
  }

  const res = await fetch('https://api.printful.com/store/products', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload.request),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`${payload.sku}: HTTP ${res.status} ${JSON.stringify(body).slice(0, 800)}`);
  }
  console.log(`${payload.sku}: created sync product ${body.result?.id} (${body.result?.name})`);
  results.push({ ...payload, created: true, printful_result: body.result });
}

await fs.writeFile(outputPath, `${JSON.stringify({
  generatedAt: new Date().toISOString(),
  create,
  note: create
    ? 'Created as ignored sync products/variants. Review and unignore in Printful/Woo before selling.'
    : 'Dry-run only. Suggested retail prices are placeholders pending owner approval.',
  items: results,
}, null, 2)}\n`);

console.log(`wrote ${path.relative(root, outputPath)}`);
