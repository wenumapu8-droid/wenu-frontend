import test from 'node:test';
import assert from 'node:assert/strict';
import {
  KODEX_EVIDENCE_RELATIONS,
  KODEX_EVIDENCE_SOURCES,
  evidenceFor,
  validateEvidenceRegistry,
} from '../src/lib/kodex/evidence-registry.js';

test('evidence registry is internally traceable', () => {
  const report = validateEvidenceRegistry();
  assert.equal(report.valid, true, report.errors.join('\n'));
  assert.equal(report.sources, 3);
  assert.equal(report.relations, 3);
});

test('every evidence source exposes citations and limitations', () => {
  for (const source of Object.values(KODEX_EVIDENCE_SOURCES)) {
    assert.ok(source.sources.length > 0, `${source.id}: missing citations`);
    assert.ok(source.limitations.length > 0, `${source.id}: missing limitations`);
    assert.notEqual(source.epistemicStatus, 'CANONICAL');
  }
});

test('Archive relation is source-backed and declares its boundary', () => {
  const relations = evidenceFor('KDX-SCN-03');
  assert.equal(relations.length, 1);
  assert.equal(relations[0].to, 'KDX-RSCH-015');
  assert.match(relations[0].boundary, /not a claim|not a claim|not.*ISO|OAIS/i);
  assert.ok(relations[0].source);
});

test('Memory relations do not state that human memory literally is a graph', () => {
  const text = KODEX_EVIDENCE_RELATIONS.map((r) => `${r.statement} ${r.boundary}`).join('\n');
  assert.doesNotMatch(text, /human memory (is|=) a graph/i);
  assert.match(text, /does not claim that human memory literally is a graph/i);
});
