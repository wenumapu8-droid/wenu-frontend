import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../docs/kodex/visual-assembly');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const fail = (message) => { console.error(`KODEX Hero Media contract FAIL: ${message}`); process.exit(1); };
const assert = (condition, message) => { if (!condition) fail(message); };

const schema = read('hero_media_resolution.schema.json');
const unresolved = read('examples/hero-media.ocn-tor-001.unresolved.json');
const blocked = read('examples/hero-media.ocn-tor-001.registry-blocked.json');

assert(schema.title === 'KODEX Hero Media Resolution v0.1', 'unexpected schema title');
assert(schema.properties?.public_export_allowed?.type === 'boolean', 'public_export_allowed must be boolean');
assert(schema.properties?.resolution_status?.enum?.includes('UNRESOLVED'), 'UNRESOLVED state missing');
assert(schema.properties?.resolution_status?.enum?.includes('BLOCKED'), 'BLOCKED state missing');

assert(/^OCN-/.test(unresolved.id), 'Ocín unresolved example must use an OCN-* ID');
assert(unresolved.source_class === 'OCIN', 'unresolved source_class must be OCIN');
assert(unresolved.resolution_status === 'UNRESOLVED', 'pre-lookup example must remain UNRESOLVED');
assert(unresolved.public_export_allowed === false, 'unresolved source must block public export');
assert(unresolved.provenance_status === 'NEEDS_CONFIRMATION', 'unresolved provenance must remain NEEDS_CONFIRMATION');
assert(unresolved.rights_status === 'NEEDS_CONFIRMATION', 'unresolved rights must remain NEEDS_CONFIRMATION');
assert(Array.isArray(unresolved.allowed_transformations) && unresolved.allowed_transformations.length === 0, 'unresolved source cannot grant transformations');
assert(unresolved.source_registry_ref === 'CANONICAL_OCIN_REGISTRY_REQUIRED', 'unresolved example must defer to canonical Ocín registry');

assert(blocked.id === unresolved.id, 'blocked lookup example must resolve the same source ID');
assert(blocked.source_class === 'OCIN', 'blocked source_class must be OCIN');
assert(blocked.resolution_status === 'BLOCKED', 'registry-grounded source must remain BLOCKED while public approval is absent');
assert(blocked.public_export_allowed === false, 'registry-blocked source must block public export');
assert(blocked.provenance_status === 'SOURCE LINKED', 'registry-blocked source should preserve registry provenance status');
assert(blocked.rights_status === 'CREATOR-OWNED / PUBLIC USE REQUIRES EXPLICIT APPROVAL', 'registry rights status mismatch');
assert(Array.isArray(blocked.allowed_transformations) && blocked.allowed_transformations.length === 0, 'NEEDS_CURATORIAL_PASS must not be promoted into transformations');
assert(blocked.source_registry_ref.includes('OCÍN_MASTER_ART_REGISTRY_v0.3_ACTIVE'), 'blocked example must name the active source registry');
assert(blocked.source_registry_ref.includes('Works!row20'), 'blocked example must identify the source registry row');

console.log(JSON.stringify({
  ok: true,
  sourceId: blocked.id,
  preLookupStatus: unresolved.resolution_status,
  postLookupStatus: blocked.resolution_status,
  publicExportAllowed: blocked.public_export_allowed,
  allowedTransformations: blocked.allowed_transformations.length,
  provenanceStatus: blocked.provenance_status,
  rightsStatus: blocked.rights_status,
}, null, 2));
