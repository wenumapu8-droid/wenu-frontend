import fs from 'node:fs/promises';
import path from 'node:path';

const root = '/Users/user1/wenu-frontend';
const pocDir = path.join(root, 'kodex-source/printful-poc');
const nftDir = path.join(root, 'kodex-source/nft-draft');
const imageDir = path.join(nftDir, 'images');
const metadataDir = path.join(nftDir, 'metadata');

const pieces = [
  {
    id: 1,
    slug: 'kodex-ocin-32302-cardinal-bloom',
    name: 'KODEX -∞ / Cardinal Bloom 32302',
    image: 'kodex-ocin-32302-cardinal-bloom-web-preview.webp',
    operation: 'cardinal bloom',
    source: 'Google Drive / book / 0cin / image3A32302_mirror.jpg',
    sourcePixels: '3464x3464',
    format: 'square print proof',
  },
  {
    id: 2,
    slug: 'kodex-ocin-30110-mandala-axis',
    name: 'KODEX -∞ / Mandala Axis 30110',
    image: 'kodex-ocin-30110-mandala-axis-web-preview.webp',
    operation: 'mandala axis',
    source: 'Google Drive / book / 0cin / Mandala / Blanco y negro / image3A30110_mirror4.png',
    sourcePixels: '3103x3194',
    format: 'square print proof',
  },
  {
    id: 3,
    slug: 'kodex-ocin-30211-square-field',
    name: 'KODEX -∞ / Square Field 30211',
    image: 'kodex-ocin-30211-square-field-web-preview.webp',
    operation: 'square field',
    source: 'Google Drive / book / 0cin / Cuadrado / PSX_20210320_220311.jpg',
    sourcePixels: '2048x2048',
    format: 'square print proof',
  },
];

await fs.mkdir(imageDir, { recursive: true });
await fs.mkdir(metadataDir, { recursive: true });

for (const piece of pieces) {
  const imageName = `${String(piece.id).padStart(2, '0')}-${piece.slug}.webp`;
  await fs.copyFile(path.join(pocDir, piece.image), path.join(imageDir, imageName));

  const metadata = {
    name: piece.name,
    description:
      'A KODEX -∞ archive piece by Ocin / Wenu Mapu. Generated from real founder-made source artwork and prepared as a draft collectible asset. Minting, wallet connection, gas payment, and signature remain human-only.',
    image: `ipfs://REPLACE_WITH_IMAGE_CID/${imageName}`,
    external_url: 'https://wenumapuonline.com/kodex',
    attributes: [
      { trait_type: 'Collection', value: 'KODEX -∞' },
      { trait_type: 'Artist', value: 'Ocin / Wenu Mapu' },
      { trait_type: 'Operation', value: piece.operation },
      { trait_type: 'Source Archive', value: 'book / 0cin' },
      { trait_type: 'Source Pixels', value: piece.sourcePixels },
      { trait_type: 'Format', value: piece.format },
      { trait_type: 'Mint Status', value: 'draft only' },
    ],
    provenance: {
      source: piece.source,
      local_preview: path.join('images', imageName),
      human_only: ['wallet connection', 'gas payment', 'mint signature'],
    },
  };

  await fs.writeFile(
    path.join(metadataDir, `${String(piece.id).padStart(2, '0')}-${piece.slug}.json`),
    `${JSON.stringify(metadata, null, 2)}\n`,
  );
}

await fs.writeFile(
  path.join(nftDir, 'collection.json'),
  `${JSON.stringify(
    {
      name: 'KODEX -∞',
      description:
        'Draft NFT collection package for KODEX -∞ by Ocin / Wenu Mapu. Prepared locally from real source artwork. No wallet action, payment, gas, or mint signature is performed by automation.',
      external_url: 'https://wenumapuonline.com/kodex',
      seller_fee_basis_points: 0,
      fee_recipient: 'REPLACE_WITH_OWNER_WALLET_ONLY_BY_HUMAN',
      status: 'draft',
    },
    null,
    2,
  )}\n`,
);

await fs.writeFile(
  path.join(nftDir, 'README.md'),
  `# KODEX -∞ NFT Draft\n\n` +
    `This package prepares metadata only. It does not mint, connect a wallet, pay gas, or sign transactions.\n\n` +
    `## Contents\n\n` +
    `- \`images/\` - local preview images copied from the Printful/Pinterest POC.\n` +
    `- \`metadata/\` - OpenSea-style draft metadata with placeholder IPFS image URLs.\n` +
    `- \`collection.json\` - draft collection-level metadata.\n\n` +
    `## Human-Only Steps\n\n` +
    `1. Choose the final marketplace/platform.\n` +
    `2. Upload images to IPFS or platform storage.\n` +
    `3. Replace \`ipfs://REPLACE_WITH_IMAGE_CID/...\` in metadata.\n` +
    `4. Connect owner wallet, pay gas if needed, and sign mint transaction manually.\n\n` +
    `## Operational Blockers\n\n` +
    `- Owner wallet address is not filled in, by design.\n` +
    `- Final rights/licensing language is pending owner approval.\n` +
    `- Minting is intentionally blocked until Ocin signs manually.\n`,
);

console.log(JSON.stringify({ generated: pieces.length, nftDir }, null, 2));
