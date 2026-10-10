// Tests for src/lib/receipt.ts — run with `npm run test:receipt`.
//
// The contract under test is DETERMINISM. A receipt artifact whose code,
// checksum or bars change between the build and the browser, or between two
// renders, is worthless: the buyer's printed receipt would stop matching the
// verification page. Every assertion here exists to catch that drift.

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildReceipt,
  checkChars,
  displayChecksum,
  issueCode,
  kindFromParam,
  normalizeSerial,
  signatureBars,
  stripGeometry,
  stripModules,
  verifyCode,
} from '../src/lib/receipt.ts';

test('issueCode has the documented shape', () => {
  assert.match(issueCode('shop', '123'), /^WM-ORD-000123-[0-9A-F]{4}$/);
  assert.match(issueCode('encargo', '26'), /^WM-ENC-000026-[0-9A-F]{4}$/);
  assert.match(issueCode('turno', '7'), /^WM-TRN-000007-[0-9A-F]{4}$/);
});

test('issueCode is stable across calls', () => {
  const first = issueCode('shop', '123');
  for (let i = 0; i < 50; i += 1) {
    assert.equal(issueCode('shop', '123'), first);
  }
});

test('numeric serials are padded so #7 and #000007 are the same artifact', () => {
  assert.equal(normalizeSerial('7'), '000007');
  assert.equal(normalizeSerial('000007'), '000007');
  assert.equal(issueCode('shop', '7'), issueCode('shop', '000007'));
});

test('serials survive Mercado Pago style references', () => {
  // Non-numeric: kept as-is (uppercased, stripped, bounded), not zero-padded.
  assert.equal(normalizeSerial('mp-ab12cd34'), 'MPAB12CD34');
  assert.equal(normalizeSerial('a'.repeat(40)).length, 12);
});

test('empty or junk serials degrade to a valid code instead of throwing', () => {
  for (const junk of ['', '   ', '---', null as unknown as string, undefined as unknown as string]) {
    assert.equal(normalizeSerial(junk), '000000');
  }
  assert.match(issueCode('shop', ''), /^WM-ORD-000000-[0-9A-F]{4}$/);
});

test('different orders get different codes', () => {
  const seen = new Set<string>();
  for (let i = 1; i <= 2000; i += 1) seen.add(issueCode('shop', String(i)));
  assert.equal(seen.size, 2000, 'serial collision');
});

test('the same serial in different kinds is a different artifact', () => {
  const codes = new Set([
    issueCode('shop', '123'),
    issueCode('encargo', '123'),
    issueCode('turno', '123'),
  ]);
  assert.equal(codes.size, 3);
});

test('displayChecksum has the four-group archive shape and is stable', () => {
  const code = issueCode('shop', '123');
  const sum = displayChecksum(code);
  assert.match(sum, /^[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}$/);
  assert.equal(displayChecksum(code), sum);
});

test('displayChecksum is not the hardcoded literal it replaces', () => {
  // KodexSystemLog.astro shipped `7A3F-9C21-E804-D7A1` on every render.
  const literal = '7A3F-9C21-E804-D7A1';
  for (let i = 1; i <= 500; i += 1) {
    assert.notEqual(displayChecksum(issueCode('shop', String(i))), literal);
  }
});

test('checksums differ across codes', () => {
  const seen = new Set<string>();
  for (let i = 1; i <= 2000; i += 1) seen.add(displayChecksum(issueCode('shop', String(i))));
  // 64 bits of output over 2000 inputs: any collision means the hash is broken.
  assert.equal(seen.size, 2000, 'checksum collision');
});

test('signatureBars is deterministic and bounded', () => {
  const code = issueCode('shop', '123');
  const a = signatureBars(code);
  const b = signatureBars(code);
  assert.deepEqual(a, b, 'bars drifted between calls');
  assert.equal(a.length, 42);
  for (const bar of a) {
    assert.ok(bar.w >= 1 && bar.w <= 4, `bar width out of range: ${bar.w}`);
    assert.ok(bar.h >= 0.62 && bar.h <= 1, `bar height out of range: ${bar.h}`);
  }
});

test('signatureBars opens and closes with full-height guard bars', () => {
  const bars = signatureBars(issueCode('shop', '123'));
  for (const i of [0, 1, bars.length - 2, bars.length - 1]) {
    assert.deepEqual(bars[i], { w: 1, h: 1 }, `bar ${i} is not a guard bar`);
  }
});

test('signatureBars actually varies with the code', () => {
  const a = signatureBars(issueCode('shop', '123'));
  const b = signatureBars(issueCode('shop', '124'));
  assert.notDeepEqual(a, b, 'bars do not depend on the code');
});

test('signatureBars respects a requested count, with a floor', () => {
  assert.equal(signatureBars('WM-ORD-000123-0000', 12).length, 12);
  // count below the guard bars still yields a drawable strip.
  assert.ok(signatureBars('WM-ORD-000123-0000', 1).length >= 4);
});

test('stripModules matches the bars it measures', () => {
  const bars = [{ w: 1, h: 1 }, { w: 3, h: 1 }, { w: 2, h: 1 }];
  // widths 1+3+2 = 6, plus one space module between each of the 3 bars = 2.
  assert.equal(stripModules(bars), 8);
});

test('verifyCode accepts a freshly issued code', () => {
  const code = issueCode('encargo', '26');
  const result = verifyCode(code);
  assert.equal(result.status, 'WELL_FORMED');
  assert.equal(result.kind, 'encargo');
  assert.equal(result.label, 'Commission');
  assert.equal(result.serial, '000026');
  assert.equal(result.checksum, displayChecksum(code));
  assert.ok(result.bars.length > 0);
});

test('verifyCode is case- and whitespace-tolerant', () => {
  const code = issueCode('shop', '123');
  assert.equal(verifyCode(`  ${code.toLowerCase()}  `).status, 'WELL_FORMED');
});

test('verifyCode catches an altered check character', () => {
  const code = issueCode('shop', '123');
  const wrongCheck = code.slice(0, -1) + (code.endsWith('0') ? '1' : '0');
  const result = verifyCode(wrongCheck);
  assert.equal(result.status, 'CHECK_MISMATCH');
  assert.equal(result.checksum, null, 'a failed code must not display a checksum');
  assert.equal(result.bars.length, 0, 'a failed code must not render a strip');
});

test('verifyCode catches an altered serial', () => {
  const code = issueCode('shop', '123');
  const tampered = code.replace('000123', '000124');
  assert.equal(verifyCode(tampered).status, 'CHECK_MISMATCH');
});

test('verifyCode rejects junk without throwing', () => {
  for (const junk of ['', 'KDX-UNBOUND', 'WM-ORD-123', 'WM-XXX-000123-0000', '<script>', null, undefined]) {
    const result = verifyCode(junk as string);
    assert.equal(result.status, 'MALFORMED', `accepted junk: ${junk}`);
    assert.equal(result.bars.length, 0);
  }
});

test('every verify result carries a statement that avoids overclaiming', () => {
  const ok = verifyCode(issueCode('shop', '123'));
  assert.ok(ok.statement.length > 0);
  // The honest bound: the page must never imply it confirmed a payment.
  assert.doesNotMatch(ok.statement, /\b(paid|payment confirmed|authentic|guaranteed)\b/i);
  assert.match(ok.statement, /integrity of the code only/i);
});

test('buildReceipt and verifyCode agree on the same order', () => {
  const receipt = buildReceipt('shop', '123');
  const verified = verifyCode(receipt.code);
  assert.equal(verified.status, 'WELL_FORMED');
  assert.equal(verified.kind, receipt.kind);
  assert.equal(verified.serial, receipt.serial);
  assert.equal(verified.checksum, receipt.checksum);
  assert.deepEqual(verified.bars, receipt.bars, 'receipt and verify page draw different strips');
});

test('buildReceipt verifyPath round-trips through a URL', () => {
  const receipt = buildReceipt('turno', '7');
  const url = new URL(receipt.verifyPath, 'https://wenumapuonline.com');
  assert.equal(url.pathname, '/kodex/verify/');
  assert.equal(verifyCode(url.searchParams.get('code')).status, 'WELL_FORMED');
});

test('kindFromParam maps the payment return URL values', () => {
  assert.equal(kindFromParam('encargo'), 'encargo');
  assert.equal(kindFromParam('turno'), 'turno');
  assert.equal(kindFromParam('shop'), 'shop');
  // Unknown or absent `?type=` must not break the receipt.
  assert.equal(kindFromParam(null), 'shop');
  assert.equal(kindFromParam('nonsense'), 'shop');
});

test('checkChars is a pure function of the body', () => {
  assert.equal(checkChars('WM-ORD-000123'), checkChars('WM-ORD-000123'));
  assert.notEqual(checkChars('WM-ORD-000123'), checkChars('WM-ORD-000124'));
  assert.match(checkChars('WM-ORD-000123'), /^[0-9A-F]{4}$/);
});

test('stripGeometry lays bars out left to right with one module of space', () => {
  const geo = stripGeometry([{ w: 1, h: 1 }, { w: 3, h: 0.5 }], 3, 40);
  assert.equal(geo.rects.length, 2);
  assert.deepEqual(geo.rects[0], { x: 0, y: 0, w: 3, h: 40 });
  // first bar 3 wide + 3 of space → second starts at 6, 9 wide, half height.
  assert.deepEqual(geo.rects[1], { x: 6, y: 0, w: 9, h: 20 });
  assert.equal(geo.width, 15, 'no trailing space module');
  assert.equal(geo.height, 40);
});

test('stripGeometry is deterministic and never produces a negative extent', () => {
  const bars = signatureBars(issueCode('shop', '123'));
  assert.deepEqual(stripGeometry(bars), stripGeometry(bars));
  assert.ok(stripGeometry(bars).width > 0);
  assert.equal(stripGeometry([]).width, 0);
  for (const rect of stripGeometry(bars).rects) {
    assert.ok(rect.w > 0 && rect.h > 0, 'degenerate rect would render as nothing');
  }
});

test('stripGeometry width agrees with stripModules', () => {
  const bars = signatureBars(issueCode('shop', '123'));
  assert.equal(stripGeometry(bars, 1, 46).width, stripModules(bars));
});
