import test from 'node:test';
import assert from 'node:assert/strict';

class LocalStorageMock {
  constructor() { this.map = new Map(); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
  clear() { this.map.clear(); }
}

globalThis.localStorage = new LocalStorageMock();

const { record, readSpecimen } = await import('../src/kodex/return/memory.js');

test('RETURN memory stores only route/effect/cycle evidence', () => {
  localStorage.clear();
  record({ type: 'view', work: '/kodex/' });
  record({ type: 'signal' });
  record({ type: 'effect', effect: 'KDX-FX-001' });
  const raw = JSON.parse(localStorage.getItem('kx-journey'));
  assert.deepEqual(Object.keys(raw).sort(), ['cycle', 'effects', 'views']);
  assert.equal(raw.signal, undefined);
  assert.equal(raw.started, undefined);
  assert.equal(raw.last, undefined);
});

test('RETURN derivation is deterministic and has no engagement memory score', () => {
  localStorage.clear();
  record({ type: 'view', work: '/kodex/folio/i/' });
  record({ type: 'effect', effect: 'KDX-FX-001' });
  const a = readSpecimen('fixture');
  const b = readSpecimen('fixture');
  assert.deepEqual(a, b);
  assert.equal('memory' in a, false);
  assert.match(a.code, /^KDX-C\d{2}-R10-[RL]-[0-9A-F]{6}$/);
});
