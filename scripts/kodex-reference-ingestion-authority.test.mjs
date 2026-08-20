import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();
const readJson = (relativePath) => JSON.parse(fs.readFileSync(path.join(root, relativePath), 'utf8'));

const authority = readJson('data/kodex/reference-ingestion-authority.v0.1.json');
const registry = readJson('data/kodex/reference-registry.v0.1.json');
const feelingsWheel = readJson('data/kodex/references/REF-UX-003-feelings-wheel.json');

const findReference = (id) => registry.references.find((reference) => reference.id === id);
const forbiddenAuthorityKeys = new Set([
  'source_id',
  'SOURCE_ID',
  'canonical_source_id',
  'canonicalSourceId',
  'canon_id',
  'canonId'
]);

const collectAuthorityAssignments = (value, trail = []) => {
  if (!value || typeof value !== 'object') return [];
  const hits = [];
  for (const [key, child] of Object.entries(value)) {
    const nextTrail = [...trail, key];
    if (forbiddenAuthorityKeys.has(key) && child !== null && child !== '') {
      hits.push({ trail: nextTrail.join('.'), value: child });
    }
    hits.push(...collectAuthorityAssignments(child, nextTrail));
  }
  return hits;
};

test('Drive Source Registry remains the only source-ID authority', () => {
  assert.equal(authority.schema, 'KODEX_REFERENCE_INGESTION_AUTHORITY_v0.1');
  assert.equal(authority.mode, 'INGESTION_MIRROR_NON_AUTHORITATIVE');
  assert.equal(authority.source_registry.title, 'KODEX−∞ SOURCE REGISTRY v1');
  assert.equal(authority.source_registry.drive_file_id, '17DE5IOyAZoL2NKJjxTs47VB6SJlS0HXQsLRyICbXshI');
  assert.equal(authority.source_registry.authority, 'CANONICAL_SOURCE_REGISTRY');
  assert.equal(authority.source_registry.source_id_required_for_reconciliation, true);
  assert.equal(authority.branch_registry.authority, 'INGESTION_ONLY');
  assert.equal(authority.branch_registry.may_grant_canon, false);
  assert.equal(authority.branch_registry.may_grant_runtime_authority, false);
  assert.equal(authority.branch_registry.may_grant_rights, false);
});

test('branch-local reference registry cannot silently promote itself to canon', () => {
  assert.equal(registry.rules?.reference_is_not_canon, true);
  assert.match(String(registry.rules?.runtime_authority ?? ''), /existing KODEX engines\/registries remain authoritative/i);

  const forbiddenStatuses = new Set(['CANONICAL', 'CANON', 'CANON_APPROVED', 'SOURCE_AUTHORITY']);
  for (const reference of registry.references) {
    assert.ok(!forbiddenStatuses.has(reference.status), `${reference.id} must not claim canonical authority`);
  }
});

test('unreconciled creator-supplied references stay fail-closed until Drive SOURCE_ID exists', () => {
  const expected = new Map([
    ['REF-VIS-001', findReference('REF-VIS-001')],
    ['REF-UX-001', findReference('REF-UX-001')],
    ['REF-UX-003', feelingsWheel]
  ]);

  for (const record of authority.unreconciled) {
    assert.equal(record.source_id, null, `${record.reference_id} must not invent a SOURCE_ID`);
    assert.equal(record.reconciliation_status, 'UNRECONCILED_FAIL_CLOSED');

    const candidate = expected.get(record.reference_id);
    assert.ok(candidate, `${record.reference_id} candidate evidence must exist`);
    assert.deepEqual(
      collectAuthorityAssignments(candidate),
      [],
      `${record.reference_id} candidate evidence must not self-assign canonical/source authority`
    );
  }
});
