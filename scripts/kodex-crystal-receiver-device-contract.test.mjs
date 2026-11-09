import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import test from 'node:test';

const routePath = new URL('../src/pages/kodex/lab/crystal-receiver.astro', import.meta.url);
const source = await fs.readFile(routePath, 'utf8');

const forbidden = [
  'localStorage',
  'sessionStorage',
  'coherence',
  'readiness',
  'branch score',
  'branchScore',
  'salience',
  'decay',
  'autoNavigate',
  'pushState(',
  'replaceState(',
];

test('Crystal Receiver current-lineage device remains presentation-only', () => {
  assert.match(source, /receiver-epistemic-contract\.js/);
  assert.match(source, /height:\s*100dvh/);
  assert.match(source, /overflow:\s*hidden/);
  assert.match(source, /NO PERSISTENCE \/ NO VISITOR SCORE/);
  assert.match(source, /VERIFIED <small>EXTERNAL AUTHORITY<\/small>/);
  for (const token of forbidden) {
    assert.equal(source.includes(token), false, `forbidden parallel-authority token present: ${token}`);
  }
});

test('Crystal Receiver verification request fails closed through existing epistemic adapter', () => {
  assert.match(source, /requestedStatus:\s*'VERIFIED'/);
  assert.match(source, /setTruth\(resolved\.resolved_status\)/);
  assert.doesNotMatch(source, /setTruth\(['"]VERIFIED['"]\)/);
});
