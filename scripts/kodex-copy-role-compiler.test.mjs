import assert from 'node:assert/strict';
import test from 'node:test';

import {
  KDX_COPY_COMPILER_PROFILE,
  KdxCopyCompileError,
  compileSourceLinkedCopy,
  tryCompileSourceLinkedCopy,
} from '../src/lib/kodex/grammar/copy-role-compiler.js';

test('copy compiler is referential and does not generate copy text', () => {
  assert.equal(KDX_COPY_COMPILER_PROFILE.generatesCopy, false);
  assert.equal(KDX_COPY_COMPILER_PROFILE.fabricatedTelemetryAllowed, false);
  const slots = compileSourceLinkedCopy([
    { source_kind: 'NODE_TITLE', source_ref: 'repo:nodes#SCI-BIOLOGY.title', status: 'PROPOSED' },
    { source_kind: 'NODE_SUMMARY', source_ref: 'repo:nodes#SCI-BIOLOGY.summary', status: 'PROPOSED' },
    { source_kind: 'EVIDENCE', source_ref: 'paper:doi:10.example/source', source_type: 'PAPER', status: 'VERIFIED' },
  ], 'KNOWLEDGE_PLATE');
  assert.deepEqual(slots, [
    { role: 'TITLE', source_ref: 'repo:nodes#SCI-BIOLOGY.title', status: 'PROPOSED' },
    { role: 'DECK', source_ref: 'repo:nodes#SCI-BIOLOGY.summary', status: 'PROPOSED' },
    { role: 'EVIDENCE', source_ref: 'paper:doi:10.example/source', status: 'VERIFIED' },
  ]);
  assert.ok(slots.every((slot) => !Object.hasOwn(slot, 'text')));
});

test('compiler output ordering is deterministic regardless of input order', () => {
  const sources = [
    { source_kind: 'SOURCE_NOTE', source_ref: 'repo:z', status: 'PROPOSED' },
    { source_kind: 'NODE_TITLE', source_ref: 'repo:title', status: 'CANON_CANDIDATE' },
    { source_kind: 'LABEL', source_ref: 'repo:label', status: 'PROPOSED' },
    { source_kind: 'NODE_SUMMARY', source_ref: 'repo:summary', status: 'PROPOSED' },
  ];
  const forward = compileSourceLinkedCopy(sources, 'KNOWLEDGE_PLATE');
  const reverse = compileSourceLinkedCopy([...sources].reverse(), 'KNOWLEDGE_PLATE');
  assert.deepEqual(reverse, forward);
  assert.deepEqual(forward.map((slot) => slot.role), ['TITLE', 'DECK', 'LABEL', 'SOURCE_NOTE']);
});

test('duplicate role/source records resolve deterministically to strongest allowed status', () => {
  const slots = compileSourceLinkedCopy([
    { source_kind: 'NODE_TITLE', source_ref: 'repo:nodes#title', status: 'PROPOSED' },
    { source_kind: 'NODE_TITLE', source_ref: 'repo:nodes#title', status: 'VERIFIED' },
  ], 'KNOWLEDGE_PLATE');
  assert.deepEqual(slots, [{ role: 'TITLE', source_ref: 'repo:nodes#title', status: 'VERIFIED' }]);
});

test('explicit role_hint is allowed but result still follows canonical role order', () => {
  const slots = compileSourceLinkedCopy([
    { source_kind: 'CUSTOM', role_hint: 'SOURCE_NOTE', source_ref: 'registry:OCN-TOR-001', status: 'VERIFIED' },
    { source_kind: 'NODE_TITLE', source_ref: 'registry:OCN-TOR-001#title', status: 'VERIFIED' },
  ], 'ACTIVATOR_PLATE');
  assert.deepEqual(slots.map((slot) => slot.role), ['TITLE', 'SOURCE_NOTE']);
});

test('compiler rejects provenance-free, unknown-role and invalid-status copy', () => {
  assert.throws(
    () => compileSourceLinkedCopy([{ source_kind: 'NODE_TITLE', status: 'PROPOSED' }], 'KNOWLEDGE_PLATE'),
    (error) => error instanceof KdxCopyCompileError && error.code === 'MISSING_SOURCE_REF',
  );
  assert.throws(
    () => compileSourceLinkedCopy([{ source_kind: 'UNMAPPED', source_ref: 'x:y', status: 'PROPOSED' }], 'KNOWLEDGE_PLATE'),
    (error) => error instanceof KdxCopyCompileError && error.code === 'UNRESOLVED_COPY_ROLE',
  );
  assert.throws(
    () => compileSourceLinkedCopy([{ source_kind: 'NODE_TITLE', source_ref: 'x:y', status: 'IMPLEMENTED_CANDIDATE' }], 'KNOWLEDGE_PLATE'),
    (error) => error instanceof KdxCopyCompileError && error.code === 'INVALID_COPY_STATUS',
  );
});

test('compiler blocks fabricated telemetry and unverified evidence', () => {
  assert.throws(
    () => compileSourceLinkedCopy([
      { source_kind: 'NODE_TITLE', source_ref: 'repo:title', status: 'PROPOSED' },
      { source_kind: 'TELEMETRY', source_ref: 'mock:fps', source_type: 'SYMBOLIC', status: 'PROPOSED' },
    ], 'KNOWLEDGE_PLATE'),
    (error) => error instanceof KdxCopyCompileError && error.code === 'UNVERIFIED_TELEMETRY',
  );
  assert.throws(
    () => compileSourceLinkedCopy([
      { source_kind: 'NODE_TITLE', source_ref: 'repo:title', status: 'PROPOSED' },
      { source_kind: 'EVIDENCE', source_ref: 'mock:claim', source_type: 'PAPER', status: 'NEEDS_CONFIRMATION' },
    ], 'KNOWLEDGE_PLATE'),
    (error) => error instanceof KdxCopyCompileError && error.code === 'UNVERIFIED_EVIDENCE',
  );
  const slots = compileSourceLinkedCopy([
    { source_kind: 'NODE_TITLE', source_ref: 'repo:title', status: 'PROPOSED' },
    { source_kind: 'TELEMETRY', source_ref: 'runtime:fps', source_type: 'RUNTIME_MEASUREMENT', status: 'VERIFIED' },
    { source_kind: 'EVIDENCE', source_ref: 'paper:doi:10.example/verified', source_type: 'PAPER', status: 'VERIFIED' },
  ], 'KNOWLEDGE_PLATE');
  assert.ok(slots.some((slot) => slot.role === 'TELEMETRY'));
  assert.ok(slots.some((slot) => slot.role === 'EVIDENCE'));
});

test('strict compilation refuses to invent a missing title role', () => {
  const result = tryCompileSourceLinkedCopy([
    { source_kind: 'NODE_SUMMARY', source_ref: 'repo:nodes#summary', status: 'PROPOSED' },
  ], 'JUNCTION_PLATE');
  assert.equal(result.ok, false);
  assert.equal(result.error.code, 'MISSING_REQUIRED_COPY_ROLE');
});

test('compiler enforces PlateSpec slot bound', () => {
  const tooMany = [
    { source_kind: 'NODE_TITLE', source_ref: 'repo:title', status: 'PROPOSED' },
    ...Array.from({ length: 12 }, (_, index) => ({ source_kind: 'LABEL', source_ref: `repo:label-${index}`, status: 'PROPOSED' })),
  ];
  assert.throws(
    () => compileSourceLinkedCopy(tooMany, 'KNOWLEDGE_PLATE'),
    (error) => error instanceof KdxCopyCompileError && error.code === 'COPY_SLOT_LIMIT',
  );
});
