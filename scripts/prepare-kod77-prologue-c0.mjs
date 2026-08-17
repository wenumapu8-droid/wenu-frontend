import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const EXPECTED_RAW_SHA256 = 'ca93a8c962548fc58bfd7dbc64e9bbb5b3877d4c3c04591c016293dd2289642f';
const DRIVE_FILE_ID = '1AOq9GpXN7GUWp7jvYLx56Zpya20ExVA8';
const sourceArg = process.argv[2];

if (!sourceArg) {
  throw new Error('Usage: node scripts/prepare-kod77-prologue-c0.mjs /absolute/path/to/ojo_final-03-03.png');
}

const sourcePath = path.resolve(sourceArg);
if (!fs.existsSync(sourcePath)) throw new Error(`[KOD-77] Source does not exist: ${sourcePath}`);

const raw = fs.readFileSync(sourcePath);
const rawSha256 = crypto.createHash('sha256').update(raw).digest('hex');
if (rawSha256 !== EXPECTED_RAW_SHA256) {
  throw new Error(`[KOD-77] Raw SHA-256 mismatch. Expected ${EXPECTED_RAW_SHA256}, received ${rawSha256}. Refuse to ingest.`);
}

const rawMeta = await sharp(raw).metadata();
if (rawMeta.width !== 5460 || rawMeta.height !== 4704 || !rawMeta.hasAlpha) {
  throw new Error(`[KOD-77] Unexpected raw metadata ${rawMeta.width}×${rawMeta.height}, alpha=${rawMeta.hasAlpha}. Refuse to ingest.`);
}

const repoRoot = path.resolve(new URL('..', import.meta.url).pathname, '..');
const outDir = path.join(repoRoot, 'public/img/kodex/proof');
const docsDir = path.join(repoRoot, 'docs/proofs');
const outPath = path.join(outDir, 'prologue-c0-eye.png');
const manifestPath = path.join(docsDir, 'KOD-77-prologue-c0-provenance.json');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(docsDir, { recursive: true });

// Web derivative only: no trim, crop, rotation, repaint, style transfer or
// generative processing. Resize preserves the full original aspect/canvas and
// alpha; PNG remains lossless for the line artwork.
await sharp(raw)
  .resize({ width: 2048, fit: 'inside', withoutEnlargement: true })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outPath);

const derivative = fs.readFileSync(outPath);
const derivativeSha256 = crypto.createHash('sha256').update(derivative).digest('hex');
const derivativeMeta = await sharp(derivative).metadata();

const manifest = {
  id: 'KOD-77-PROLOGUE-C0',
  status: 'INTERNAL_REVERSIBLE_PROOF',
  source: {
    driveFileId: DRIVE_FILE_ID,
    filename: 'ojo_final-03-03.png',
    rawSha256,
    rawBytes: raw.length,
    width: rawMeta.width,
    height: rawMeta.height,
    hasAlpha: Boolean(rawMeta.hasAlpha),
    custody: 'WENU_MAPU_DRIVE',
    folderLineage: ['Portafolio', 'Escenarios', 'ECOS'],
    creatorAttribution: 'NEEDS_CONFIRMATION',
  },
  derivative: {
    path: '/img/kodex/proof/prologue-c0-eye.png',
    sha256: derivativeSha256,
    bytes: derivative.length,
    width: derivativeMeta.width,
    height: derivativeMeta.height,
    hasAlpha: Boolean(derivativeMeta.hasAlpha),
    transform: 'LOSSLESS_PNG_RESIZE_ONLY_NO_CROP_NO_TRIM',
  },
  truthBoundary: [
    'CONTROLLED_ASSET_DOES_NOT_PROVE_CREATOR_ATTRIBUTION',
    'PROBE_PASS_DOES_NOT_IMPLY_CANON',
    'PROBE_PASS_DOES_NOT_IMPLY_MERGE_OR_DEPLOY',
  ],
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: 'PASS', ...manifest }, null, 2));
