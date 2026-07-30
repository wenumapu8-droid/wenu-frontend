import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const outDir = path.join(root, 'kodex-source/pinterest');
const width = 1000;
const height = 1500;

const pins = [
  {
    slug: 'kodex-store-archive-made-matter',
    source: 'public/img/kodex/works/conjuncion.jpg',
    title: 'KODEX - Archive Made Matter',
    kicker: 'KODEX - INFINITY',
    headline: 'ARCHIVE MADE MATTER',
    line: 'Free plates, print proofs, editions.',
    destination: 'https://www.wenumapuonline.com/kodex/store/',
    board: 'KODEX - Wenu Mapu',
  },
  {
    slug: 'kodex-cardinal-bloom-print',
    source: 'public/img/kodex/printful/kodex-ocin-32302-cardinal-bloom-mockup.jpg',
    title: 'KODEX Cardinal Bloom Print Proof',
    kicker: 'PRINT PROOF',
    headline: 'CARDINAL BLOOM',
    line: 'Founder-made Ocin archive, prepared for print.',
    destination: 'https://00b00418.wenu-frontend.pages.dev/img/kodex/printful/kodex-ocin-32302-cardinal-bloom-12x12-300dpi-bleed.jpg',
    board: 'KODEX Prints',
  },
  {
    slug: 'kodex-mandala-axis-print',
    source: 'public/img/kodex/printful/kodex-ocin-30110-mandala-axis-mockup.jpg',
    title: 'KODEX Mandala Axis Print Proof',
    kicker: 'PRINT PROOF',
    headline: 'MANDALA AXIS',
    line: 'Black and white geometry from the Ocin archive.',
    destination: 'https://00b00418.wenu-frontend.pages.dev/img/kodex/printful/kodex-ocin-30110-mandala-axis-12x12-300dpi-bleed.jpg',
    board: 'KODEX Prints',
  },
  {
    slug: 'kodex-square-field-print',
    source: 'public/img/kodex/printful/kodex-ocin-30211-square-field-mockup.jpg',
    title: 'KODEX Square Field Print Proof',
    kicker: 'PRINT PROOF',
    headline: 'SQUARE FIELD',
    line: 'Dense signal, square format, print-ready.',
    destination: 'https://00b00418.wenu-frontend.pages.dev/img/kodex/printful/kodex-ocin-30211-square-field-10x10-300dpi-bleed.jpg',
    board: 'KODEX Prints',
  },
  {
    slug: 'kodex-achroma-true-forms',
    source: 'public/img/kodex/works/bw-06.jpg',
    title: 'KODEX Achroma - True Forms',
    kicker: 'ACHROMA',
    headline: 'TRUE FORMS',
    line: 'Black and white ritual geometry.',
    destination: 'https://www.wenumapuonline.com/kodex/movement/achroma/',
    board: 'KODEX Achroma',
  },
  {
    slug: 'kodex-achroma-descent',
    source: 'public/img/kodex/works/bw-02.jpg',
    title: 'KODEX Achroma - Descent',
    kicker: 'ACHROMA',
    headline: 'DESCENT',
    line: 'A body of line, shadow, and orientation.',
    destination: 'https://www.wenumapuonline.com/kodex/folio/ii/',
    board: 'KODEX Achroma',
  },
  {
    slug: 'kodex-disco-solar-signal',
    source: 'public/img/kodex/disco/disco-01.jpg',
    title: 'KODEX Disco Solar - Signal in Colour',
    kicker: 'DISCO SOLAR',
    headline: 'SIGNAL IN COLOUR',
    line: 'Neon fractal field from the archive.',
    destination: 'https://www.wenumapuonline.com/kodex/movement/disco/',
    board: 'KODEX Disco Solar',
  },
  {
    slug: 'kodex-disco-solar-radiance',
    source: 'public/img/kodex/disco/disco-05.jpg',
    title: 'KODEX Disco Solar - Radiance',
    kicker: 'DISCO SOLAR',
    headline: 'RADIANCE FIELD',
    line: 'Colour as movement, archive as signal.',
    destination: 'https://www.wenumapuonline.com/kodex/movement/disco/',
    board: 'KODEX Disco Solar',
  },
  {
    slug: 'kodex-tribe-space-body-signal',
    source: 'public/img/kodex/behance/tribe-01.webp',
    title: 'KODEX Tribe Space - Body Signal',
    kicker: 'TRIBE SPACE',
    headline: 'BODY SIGNAL',
    line: 'Mask, body, sign, and ritual presence.',
    destination: 'https://www.wenumapuonline.com/kodex/movement/tribe/',
    board: 'KODEX Tribe Space',
  },
  {
    slug: 'kodex-tribe-space-mask',
    source: 'public/img/kodex/behance/tribe-04.webp',
    title: 'KODEX Tribe Space - Mask Field',
    kicker: 'TRIBE SPACE',
    headline: 'MASK FIELD',
    line: 'A visual language between body and archive.',
    destination: 'https://www.wenumapuonline.com/kodex/movement/tribe/',
    board: 'KODEX Tribe Space',
  },
  {
    slug: 'kodex-archive-plate-27',
    source: 'public/img/kodex/archive/arch-27.jpg',
    title: 'KODEX Archive Plate 27',
    kicker: 'THE ARCHIVE',
    headline: 'PLATE 27',
    line: 'A complete work from the KODEX archive.',
    destination: 'https://www.wenumapuonline.com/kodex/works/',
    board: 'KODEX Archive',
  },
  {
    slug: 'kodex-archive-plate-31',
    source: 'public/img/kodex/archive/arch-31.jpg',
    title: 'KODEX Archive Plate 31',
    kicker: 'THE ARCHIVE',
    headline: 'PLATE 31',
    line: 'Matter, symbol, and technology in one field.',
    destination: 'https://www.wenumapuonline.com/kodex/works/',
    board: 'KODEX Archive',
  },
  {
    slug: 'kodex-free-downloads',
    source: 'public/img/kodex/archive/arch-15.jpg',
    title: 'KODEX Free Downloads',
    kicker: 'FREE DOWNLOAD',
    headline: 'TAKE THE PLATE',
    line: 'Free archive plates for print, remix, projection.',
    destination: 'https://www.wenumapuonline.com/kodex/store/#downloads',
    board: 'KODEX - Wenu Mapu',
  },
  {
    slug: 'kodex-nft-draft-collectible',
    source: 'kodex-source/nft-draft/images/01-kodex-ocin-32302-cardinal-bloom.webp',
    title: 'KODEX NFT Draft - Cardinal Bloom',
    kicker: 'NFT DRAFT',
    headline: 'COLLECTIBLE FILE',
    line: 'Prepared asset. Minting remains human-signed.',
    destination: 'https://www.wenumapuonline.com/kodex',
    board: 'KODEX Collectibles',
  },
  {
    slug: 'kodex-wenu-mapu-outer-space-dimensions',
    source: 'public/img/brand/ritual-space-cosmos.webp',
    title: 'Wenu Mapu - Outer Space Dimensions',
    kicker: 'WENU MAPU',
    headline: 'OUTER SPACE DIMENSIONS',
    line: 'The body is a small cosmos. The archive is open.',
    destination: 'https://www.wenumapuonline.com/kodex/',
    board: 'Wenu Mapu - Outer Space Dimensions',
  },
];

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function csvCell(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

function description(pin) {
  return `${pin.line} KODEX archive by Ocin / Wenu Mapu. Dark ritual luxury, founder-made visual work, no stock imagery.`;
}

function altText(pin) {
  return `${pin.headline} pin using real KODEX artwork with dark editorial framing and Wenu Mapu archive typography.`;
}

function overlay(pin) {
  return Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="shade" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="#080706" stop-opacity="0.18"/>
      <stop offset="0.48" stop-color="#080706" stop-opacity="0"/>
      <stop offset="1" stop-color="#080706" stop-opacity="0.88"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#shade)"/>
  <rect x="46" y="46" width="908" height="1408" fill="none" stroke="#d6c1a3" stroke-opacity="0.46" stroke-width="2"/>
  <rect x="68" y="68" width="864" height="1364" fill="none" stroke="#f2ede4" stroke-opacity="0.12" stroke-width="1"/>
  <text x="82" y="124" fill="#f2ede4" opacity="0.86" font-family="Inter, Helvetica, Arial, sans-serif" font-size="24" letter-spacing="5">${esc(pin.kicker)}</text>
  <text x="82" y="1292" fill="#f2ede4" font-family="Georgia, 'Times New Roman', serif" font-size="66" font-weight="700">${esc(pin.headline)}</text>
  <text x="82" y="1356" fill="#d6c1a3" font-family="Inter, Helvetica, Arial, sans-serif" font-size="30">${esc(pin.line)}</text>
  <text x="82" y="1406" fill="#a8a39a" font-family="Inter, Helvetica, Arial, sans-serif" font-size="22" letter-spacing="3">WENU MAPU / KODEX</text>
</svg>`);
}

await fs.mkdir(outDir, { recursive: true });

const rows = [[
  'file',
  'title',
  'description',
  'alt_text',
  'destination_url',
  'board',
]];

for (let i = 0; i < pins.length; i += 1) {
  const pin = pins[i];
  const src = path.join(root, pin.source);
  const filename = `${String(i + 1).padStart(2, '0')}-${pin.slug}.jpg`;
  const out = path.join(outDir, filename);

  const base = await sharp(src)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .modulate({ brightness: 0.82, saturation: 0.92 })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();

  await sharp(base)
    .composite([{ input: overlay(pin), blend: 'over' }])
    .jpeg({ quality: 92, mozjpeg: true })
    .toFile(out);

  rows.push([
    filename,
    pin.title,
    description(pin),
    altText(pin),
    pin.destination,
    pin.board,
  ]);
}

await fs.writeFile(
  path.join(outDir, 'pins.csv'),
  `${rows.map(row => row.map(csvCell).join(',')).join('\n')}\n`
);

await fs.writeFile(
  path.join(outDir, 'README.md'),
  `# KODEX Pinterest Pack\n\n15 ready-to-upload Pinterest pins generated from real KODEX/Wenu Mapu assets.\n\n- Format: 1000x1500 JPG\n- Metadata: pins.csv\n- Publishing status: local package only; no Pinterest API action performed.\n`
);

console.log(`wrote ${pins.length} pins to ${path.relative(root, outDir)}`);
