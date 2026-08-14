import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../docs/kodex/visual-assembly');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const fail = (message) => { console.error(`KODEX Hero Media contract FAIL: ${message}`); process.exit(1); };
const assert = (condition, message) => { if (!condition) fail(message); };

const schema = read('hero_media_resolution.schema.json');
const example = read('examples/hero-media.ocn-tor-001.unresolved.json');

assert(schema.title === 'KODEX Hero Media Resolution v0.1', 'unexpected schema title');
assert(schema.properties?.public_export_allowed?.type === 'boolean', 'public_export_allowed must be boolean');
assert(schema.properties?.resolution_status?.enum?.includes('UNRESOLVED'), 'UNRESOLVED state missing');
assert(schema.properties?.resolution_status?.enum?.includes('BLOCKED'), 'BLOCKED state missing');

assert(/^OCN-/.test(example.id), 'Ocín example must use an OCN-* ID');
assert(example.source_class === 'OCIN', 'example source_class must be OCIN');
assert(example.resolution_status === 'UNRESOLVED', 'example must remain unresolved until authoritative registry lookup');
assert(example.public_export_allowed === false, 'unresolved source must block public export');
assert(example.provenance_status === 'NEEDS_CONFIRMATION', 'unresolved source provenance must remain NEEDS_CONFIRMATION');
assert(example.rights_status === 'NEEDS_CONFIRMATION', 'unresolved source rights must remain NEEDS_CONFIRMATION');
assert(Array.isArray(example.allowed_transformations) && example.allowed_transformations.length === 0, 'unresolved source cannot grant transformations');
assert(example.source_registry_ref === 'CANONICAL_OCIN_REGISTRY_REQUIRED', 'example must defer to canonical Ocín registry');

console.log(JSON.stringify({
  ok: true,
  sourceId: example.id,
  resolutionStatus: example.resolution_status,
  publicExportAllowed: example.public_export_allowed,
  allowedTransformations: example.allowed_transformations.length,
}, null, 2));
