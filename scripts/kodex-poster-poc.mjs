import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = '/Users/user1/wenu-frontend';
const driveRoot = '/Users/user1/Library/CloudStorage/GoogleDrive-wenu.mapu8@gmail.com/Mi unidad/book/0cin';
const outDir = path.join(root, 'kodex-source/printful-poc');

const posters = [
  {
    slug: 'kodex-ocin-32302-cardinal-bloom',
    title: 'KODEX -∞ / Cardinal Bloom 32302',
    source: path.join(driveRoot, 'image3A32302_mirror.jpg'),
    sizeIn: 12,
  },
  {
    slug: 'kodex-ocin-30110-mandala-axis',
    title: 'KODEX -∞ / Mandala Axis 30110',
    source: path.join(driveRoot, 'Mandala/Blanco y negro/image3A30110_mirror4.png'),
    sizeIn: 12,
  },
  {
    slug: 'kodex-ocin-30211-square-field',
    title: 'KODEX -∞ / Square Field 30211',
    source: path.join(driveRoot, 'Cuadrado/PSX_20210320_220311.jpg'),
    sizeIn: 10,
  },
];

const dpi = 300;
const bleedIn = 0.125;

await fs.mkdir(outDir, { recursive: true });

const results = [];

for (const poster of posters) {
  const printWidthIn = poster.sizeIn;
  const printHeightIn = poster.sizeIn;
  const bleed = Math.round(bleedIn * dpi);
  const canvasWidth = printWidthIn * dpi + bleed * 2;
  const canvasHeight = printHeightIn * dpi + bleed * 2;

  const base = sharp(poster.source, { limitInputPixels: false }).rotate();
  const meta = await base.metadata();
  if (!meta.width || !meta.height) {
    throw new Error(`Could not read image dimensions: ${poster.source}`);
  }

  const art = await base
    .resize(canvasWidth, canvasHeight, {
      fit: 'contain',
      background: '#f8f7f2',
      kernel: sharp.kernel.lanczos3,
      withoutEnlargement: false,
    })
    .modulate({ saturation: 0.94, brightness: 0.985 })
    .sharpen({ sigma: 0.72, m1: 0.55, m2: 1.8 })
    .jpeg({ quality: 94, mozjpeg: true })
    .toBuffer();

  const printPath = path.join(
    outDir,
    `${poster.slug}-${printWidthIn}x${printHeightIn}-300dpi-bleed.jpg`,
  );
  await fs.writeFile(printPath, art);

  const artDataUri = `data:image/jpeg;base64,${art.toString('base64')}`;
  const proofLine = `${printWidthIn}X${printHeightIn} PRINT PROOF · ORIGINAL FROM DRIVE / BOOK / 0CIN`;
  const previewSvg = `
<svg width="1400" height="1800" viewBox="0 0 1400 1800" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="36" stdDeviation="38" flood-color="#000" flood-opacity="0.48"/>
    </filter>
    <linearGradient id="wall" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#12100d"/>
      <stop offset="0.55" stop-color="#080706"/>
      <stop offset="1" stop-color="#1b1713"/>
    </linearGradient>
  </defs>
  <rect width="1400" height="1800" fill="url(#wall)"/>
  <rect x="108" y="106" width="1184" height="1588" fill="none" stroke="#2a2520" stroke-width="2"/>
  <rect x="190" y="210" width="1020" height="1020" rx="2" fill="#f2ede4" filter="url(#shadow)"/>
  <image href="${artDataUri}" x="218" y="238" width="964" height="964" preserveAspectRatio="xMidYMid meet"/>
  <text x="190" y="1578" fill="#f2ede4" font-family="Georgia, serif" font-size="44" letter-spacing="0">${poster.title}</text>
  <text x="190" y="1632" fill="#a8a39a" font-family="Arial, sans-serif" font-size="22" letter-spacing="4">WENU MAPU / OUTER SPACE DIMENSIONS</text>
  <text x="190" y="1680" fill="#8a6a43" font-family="Arial, sans-serif" font-size="18" letter-spacing="3">${proofLine}</text>
</svg>`;

  const mockupPath = path.join(outDir, `${poster.slug}-mockup.jpg`);
  await sharp(Buffer.from(previewSvg)).jpeg({ quality: 92, mozjpeg: true }).toFile(mockupPath);

  const webPreviewPath = path.join(outDir, `${poster.slug}-web-preview.webp`);
  await sharp(printPath)
    .resize(1200, 1600, { fit: 'contain', background: '#080706', kernel: sharp.kernel.lanczos3 })
    .webp({ quality: 88 })
    .toFile(webPreviewPath);

  const metadata = {
    slug: poster.slug,
    title: poster.title,
    family: 'KODEX -∞',
    source: poster.source,
    sourcePixels: { width: meta.width, height: meta.height },
    printWidthIn,
    printHeightIn,
    dpi,
    bleedIn,
    printPixelsWithBleed: { width: canvasWidth, height: canvasHeight },
    outputs: {
      printFile: printPath,
      mockup: mockupPath,
      webPreview: webPreviewPath,
    },
    printfulUse: {
      status: 'proof-of-concept',
      recommendedProduct: 'small square poster / art print test',
      apiStatus: 'not used yet',
      doNotPublishWithout: ['owner price', 'Printful API token', 'Woo kodex category isolation'],
    },
    nftUse: {
      status: 'asset-ready-for-metadata-draft',
      humanOnly: 'wallet connection, gas payment, and mint signature',
    },
  };

  await fs.writeFile(path.join(outDir, `${poster.slug}.json`), `${JSON.stringify(metadata, null, 2)}\n`);
  results.push(metadata);
}

const readmeRows = results
  .map((item) => {
    const printName = path.basename(item.outputs.printFile);
    const mockupName = path.basename(item.outputs.mockup);
    const previewName = path.basename(item.outputs.webPreview);
    return `### ${item.title}

- Source: \`${item.source}\`
- Source pixels: \`${item.sourcePixels.width}x${item.sourcePixels.height}\`
- Print proof: \`${printName}\` (${item.printWidthIn}x${item.printHeightIn} in, 300 DPI, ${item.bleedIn} in bleed)
- Mockup: \`${mockupName}\`
- Web/Pinterest preview: \`${previewName}\`
- Metadata: \`${item.slug}.json\`
`;
  })
  .join('\n');

await fs.writeFile(
  path.join(outDir, 'README.md'),
  `# KODEX Printful / Pinterest / NFT POC\n\n` +
    `Generated from real Ocin/Wenu Mapu source artwork in Google Drive \`book/0cin\`, not AI-invented imagery.\n\n` +
    `## Current Set\n\n${readmeRows}\n` +
    `## Operational Status\n\n` +
    `- Printful API: not used yet. Use only after \`PRINTFUL_API_TOKEN\`, owner pricing, and product-size approval are present.\n` +
    `- WooCommerce: do not create or publish products until category \`kodex\` is isolated from the jewelry shop.\n` +
    `- NFT: assets are ready for metadata drafting. Minting remains human-only: wallet connection, gas payment, and signature.\n` +
    `- Pinterest: mockups and web previews are ready for a manual pin kit.\n`,
);

console.log(JSON.stringify({ generated: results.length, outDir, posters: results }, null, 2));
