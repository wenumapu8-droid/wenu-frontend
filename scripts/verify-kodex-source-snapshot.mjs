import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const file = path.resolve(here, '../docs/kodex/visual-assembly/source-snapshots/ocin-a-candidates-2026-08-14.json');
const snapshot = JSON.parse(fs.readFileSync(file, 'utf8'));
const fail = (message) => { console.error(`KODEX source snapshot FAIL: ${message}`); process.exit(1); };
const assert = (condition, message) => { if (!condition) fail(message); };

assert(snapshot.schema === 'kdx.ocin-registry-snapshot.v0.1', 'unexpected snapshot schema');
assert(snapshot.snapshot_date === '2026-08-14', 'snapshot date mismatch');
assert(snapshot.source_registry?.title === 'OCÍN_MASTER_ART_REGISTRY — v0.3 ACTIVE', 'source registry title mismatch');
assert(snapshot.source_registry?.spreadsheet_id === '1GhrGI3E9tQJ6voYe3lZViV8h4MV6ogsB5wZ2SrGjmOA', 'source registry ID mismatch');
assert(snapshot.source_registry?.sheet === 'Works', 'source registry sheet mismatch');
assert(snapshot.snapshot_policy?.is_live_registry === false, 'snapshot must never claim to be live registry');
assert(snapshot.snapshot_policy?.may_grant_new_rights === false, 'snapshot cannot grant new rights');
assert(snapshot.snapshot_policy?.must_recheck_before_public_export === true, 'fresh registry recheck must be required before public export');
assert(Array.isArray(snapshot.works) && snapshot.works.length === 15, 'expected exactly 15 A-candidate rows in this dated snapshot');

const ids = new Set();
for (const work of snapshot.works) {
  assert(/^OCN-/.test(work.id), `invalid source ID ${work.id}`);
  assert(!ids.has(work.id), `duplicate source ID ${work.id}`);
  ids.add(work.id);
  assert(work.curation_tier === 'A_CANDIDATE', `${work.id} is not A_CANDIDATE`);
  assert(work.provenance_status === 'SOURCE LINKED', `${work.id} provenance mismatch`);
  assert(work.rights_status === 'CREATOR-OWNED / PUBLIC USE REQUIRES EXPLICIT APPROVAL', `${work.id} rights mismatch`);
  assert(work.public_export_allowed === false, `${work.id} must remain blocked for public export`);
  assert(work.kodex_activation_status === 'MAPPED / NOT_IMPLEMENTED', `${work.id} must not claim runtime implementation`);
  assert(Array.isArray(work.allowed_transformations), `${work.id} allowed_transformations must be an array`);
  if (work.allowed_transformations_status === 'NEEDS_CURATORIAL_PASS') {
    assert(work.allowed_transformations.length === 0, `${work.id} cannot convert NEEDS_CURATORIAL_PASS into granted transformations`);
  }
}

const threshold = snapshot.works.find((work) => work.id === 'OCN-TOR-001');
assert(threshold, 'OCN-TOR-001 missing');
assert(threshold.registry_row === 20, 'OCN-TOR-001 registry row mismatch');
assert(threshold.title === 'Seed Aperture — White Field', 'OCN-TOR-001 title mismatch');
assert(threshold.scenes.includes('THRESHOLD') && threshold.scenes.includes('RETURN'), 'OCN-TOR-001 scene mapping mismatch');
assert(threshold.drive_id === '1zHWSdJ0UoHtLW_Oyj72XQQtCcX-Qi-UY', 'OCN-TOR-001 Drive ID mismatch');

console.log(JSON.stringify({
  ok: true,
  snapshotDate: snapshot.snapshot_date,
  sourceRegistry: snapshot.source_registry.title,
  aCandidates: snapshot.works.length,
  publicExportAllowed: snapshot.works.filter((work) => work.public_export_allowed).length,
  needsFreshRegistryBeforePublicExport: snapshot.snapshot_policy.must_recheck_before_public_export,
}, null, 2));
