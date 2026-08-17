import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
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

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptsDir, '..');
const outDir = path.join(repoRoot, 'public/img/kodex/proof');
const docsDir = path.join(repoRoot, 'docs/proofs');
const outPath = path.join(outDir, 'prologue-c0-eye-mask.png');
const manifestPath = path.join(docsDir, 'KOD-77-prologue-c0-provenance.json');
fs.mkdirSync(outDir, { recursive: true });
fs.mkdirSync(docsDir, { recursive: true });

// The raw source is black line art on transparency. KODEX CRT samples RGB and
// deliberately ignores source alpha, so feeding the raw PNG would render the
// line art nearly black/invisible. This branch therefore creates a TECHNICAL
// ADAPTER, not a repaint: same full canvas, same geometry, no trim/crop/rotate,
// converting black-on-transparent to an emissive white-on-black luminance mask.
// The existing OBSERVE CRT is still responsible for violet tint/effects.
await sharp(raw)
  .resize({ width: 2048, fit: 'inside', withoutEnlargement: true })
  .flatten({ background: '#ffffff' })
  .negate({ alpha: false })
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
    path: '/img/kodex/proof/prologue-c0-eye-mask.png',
    sha256: derivativeSha256,
    bytes: derivative.length,
    width: derivativeMeta.width,
    height: derivativeMeta.height,
    hasAlpha: Boolean(derivativeMeta.hasAlpha),
    transform: 'TECHNICAL_ADAPTER_BLACK_LINE_ALPHA_TO_WHITE_ON_BLACK_LUMINANCE_MASK',
    geometry: 'FULL_CANVAS_PRESERVED_NO_CROP_NO_TRIM_NO_ROTATION',
    purpose: 'MAKE_CONTROLLED_LINEART_VISIBLE_TO_EXISTING_RGB_ONLY_OBSERVE_CRT',
  },
  truthBoundary: [
    'RAW_SOURCE_UNMODIFIED',
    'TECHNICAL_MASK_IS_NOT_A_NEW_ARTWORK',
    'CONTROLLED_ASSET_DOES_NOT_PROVE_CREATOR_ATTRIBUTION',
    'PROBE_PASS_DOES_NOT_IMPLY_CANON',
    'PROBE_PASS_DOES_NOT_IMPLY_MERGE_OR_DEPLOY',
  ],
};

fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
console.log(JSON.stringify({ status: 'PASS', ...manifest }, null, 2));
