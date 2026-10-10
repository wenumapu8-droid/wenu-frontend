// ─── RECEIPT / ORDER ARTIFACT ───────────────────────────────────────────────
// Turns an order reference into a stable, printable artifact: a canonical code,
// a display checksum and a data-derived signature strip (the "barcode" of the
// KODEX visual language).
//
// WHY THIS EXISTS. Three pieces on the site were decorative and disconnected:
//
//   1. `/gracias` showed a bare `Order reference: #123` line — nothing a buyer
//      could keep, verify or recognise as an artifact.
//   2. The KODEX barcode (`.kx-threshold__barcode`, `07-kodex-data-barcodes.svg`)
//      was pure ornament: fixed bars, carrying no data.
//   3. `KodexSystemLog.astro` shipped a HARDCODED checksum (`7A3F-9C21-E804-D7A1`)
//      on every render — the same "verifiable checksum" for every page.
//
// This module makes all three derive from one real input. Same order reference
// always yields the same code, the same checksum and the same bars — on the
// server, in the browser, and a year from now. Determinism is the whole point:
// a receipt whose barcode reshuffles on reload is not a receipt.
//
// ─── WHAT THIS IS NOT ───────────────────────────────────────────────────────
// Read this before writing any copy around it.
//
//   * The hash is FNV-1a. It is NOT cryptographic. It detects typos, truncation
//     and casual malformation. It does NOT resist forgery: anyone with this file
//     can mint a well-formed code.
//   * A code that passes `verifyCode` is WELL-FORMED, not PAID and not GENUINE.
//     It proves the string was shaped by this system, nothing more. Payment
//     state lives in Postgres (wenu-platform), never in the URL.
//   * The signature strip is NOT an optical barcode standard (not Code128, not
//     EAN, not QR) and has NOT been validated against a scanner. Do not label it
//     "scannable" anywhere in the UI. It is a deterministic visual signature,
//     verifiable by recomputation, not by a phone camera.
//
// Honest naming is load-bearing here: the site sells one-of-one pieces, and an
// authenticity claim the system cannot actually back is worse than none.

/** The three things the site takes money for. Matches `?type=` on `/gracias`. */
export type ReceiptKind = 'shop' | 'encargo' | 'turno';

/** Three-letter segment that lands in the code. Stable: never renumber these. */
const KIND_SEGMENT: Record<ReceiptKind, string> = {
  shop: 'ORD',
  encargo: 'ENC',
  turno: 'TRN',
};

/** Human label per kind, for the receipt heading. */
const KIND_LABEL: Record<ReceiptKind, string> = {
  shop: 'Order',
  encargo: 'Commission',
  turno: 'Booking',
};

/** `?type=` values accepted from the payment return URL, mapped to a kind. */
export function kindFromParam(raw: string | null | undefined): ReceiptKind {
  if (raw === 'encargo') return 'encargo';
  if (raw === 'turno') return 'turno';
  return 'shop';
}

export function labelFor(kind: ReceiptKind): string {
  return KIND_LABEL[kind];
}

// ─── HASH ───────────────────────────────────────────────────────────────────
// FNV-1a, 32-bit, two passes with different offset bases to get 64 bits of
// output. Chosen over anything heavier because it must run identically in Astro
// frontmatter (build) and in the browser (query-string path) with zero deps and
// no async crypto. See "WHAT THIS IS NOT" above for the security boundary.

const FNV_PRIME = 0x01000193;
const FNV_OFFSET_A = 0x811c9dc5;
const FNV_OFFSET_B = 0x7fed7fed;

function fnv1a(input: string, offset: number): number {
  let hash = offset >>> 0;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i) & 0xff;
    // Math.imul keeps the multiply in 32-bit space; `*` would lose precision.
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash >>> 0;
}

function hex(value: number, digits: number): string {
  return (value >>> 0).toString(16).toUpperCase().padStart(digits, '0').slice(-digits);
}

// ─── CODE ───────────────────────────────────────────────────────────────────

/** `WM-ORD-000123` — the part a check character is computed over. */
function codeBody(kind: ReceiptKind, id: string): string {
  return `WM-${KIND_SEGMENT[kind]}-${normalizeSerial(id)}`;
}

/**
 * Serials come from two different worlds: our own Postgres ids (plain integers)
 * and Mercado Pago / NOWPayments references (long alphanumerics). Normalize both
 * into something that fits on a printed line and survives a round trip through a
 * URL, while staying injective enough that two orders don't collide.
 */
export function normalizeSerial(id: string): string {
  const cleaned = String(id ?? '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!cleaned) return '000000';
  // Pure numeric ids read as a sequence to a human — pad them so #7 and #000007
  // are the same artifact and sort together.
  if (/^\d+$/.test(cleaned)) return cleaned.padStart(6, '0').slice(-12);
  return cleaned.slice(0, 12);
}

/** 4 hex chars appended to the body, so a mistyped code fails fast. */
export function checkChars(body: string): string {
  return hex(fnv1a(body, FNV_OFFSET_A) & 0xffff, 4);
}

/** `WM-ORD-000123-A4F7` — the canonical code. This is what goes on the receipt. */
export function issueCode(kind: ReceiptKind, id: string): string {
  const body = codeBody(kind, id);
  return `${body}-${checkChars(body)}`;
}

/**
 * `A4F7-9C21-E804-D7A1` — the long display checksum for the HUD/receipt readout.
 * Replaces the hardcoded literal in KodexSystemLog.astro. Four groups so it
 * reads like archive material, 64 bits so two orders practically never match.
 */
export function displayChecksum(code: string): string {
  const a = fnv1a(code, FNV_OFFSET_A);
  const b = fnv1a(code, FNV_OFFSET_B);
  return [hex(a >>> 16, 4), hex(a & 0xffff, 4), hex(b >>> 16, 4), hex(b & 0xffff, 4)].join('-');
}

// ─── SIGNATURE STRIP ────────────────────────────────────────────────────────

export interface SignatureBar {
  /** Width in module units (1–4). The component scales a module to px. */
  w: number;
  /** Height as a fraction of the strip height (0.62–1). */
  h: number;
}

/**
 * xorshift32 — a deterministic stream seeded by the code. Not for anything that
 * needs unpredictability; used here only so the bars are a stable function of
 * the code rather than `Math.random()` noise.
 */
function xorshift32(seed: number): () => number {
  let state = seed >>> 0 || 0x9e3779b9;
  return () => {
    state ^= state << 13; state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;  state >>>= 0;
    return state >>> 0;
  };
}

const BAR_WIDTHS = [1, 1, 2, 1, 3, 2, 1, 4];
const BAR_HEIGHTS = [1, 0.84, 1, 0.72, 0.92, 1, 0.62, 0.88];

/**
 * Derive the bars from the code. Deterministic: same code, same strip, forever.
 * Guard bars at both ends (full height, width 1) give the strip the printed
 * registration look the KODEX boards already use.
 */
export function signatureBars(code: string, count = 42): SignatureBar[] {
  const next = xorshift32(fnv1a(code, FNV_OFFSET_B));
  const inner = Math.max(2, count - 4);
  const bars: SignatureBar[] = [
    { w: 1, h: 1 },
    { w: 1, h: 1 },
  ];
  for (let i = 0; i < inner; i += 1) {
    const n = next();
    bars.push({
      w: BAR_WIDTHS[n % BAR_WIDTHS.length],
      h: BAR_HEIGHTS[(n >>> 8) % BAR_HEIGHTS.length],
    });
  }
  bars.push({ w: 1, h: 1 }, { w: 1, h: 1 });
  return bars;
}

/** Total module width of a strip — the component needs it for the viewBox. */
export function stripModules(bars: SignatureBar[]): number {
  // +1 module of space after every bar except the last.
  return bars.reduce((sum, bar) => sum + bar.w + 1, 0) - 1;
}

// ─── BUILD + VERIFY ─────────────────────────────────────────────────────────

export interface Receipt {
  kind: ReceiptKind;
  label: string;
  /** Canonical code, e.g. `WM-ORD-000123-A4F7`. */
  code: string;
  /** Normalized serial, e.g. `000123`. */
  serial: string;
  /** Long display checksum, e.g. `A4F7-9C21-E804-D7A1`. */
  checksum: string;
  bars: SignatureBar[];
  /** Site-relative verification URL. */
  verifyPath: string;
}

export function buildReceipt(kind: ReceiptKind, id: string, barCount = 42): Receipt {
  const code = issueCode(kind, id);
  return {
    kind,
    label: KIND_LABEL[kind],
    code,
    serial: normalizeSerial(id),
    checksum: displayChecksum(code),
    bars: signatureBars(code, barCount),
    verifyPath: `/kodex/verify/?code=${encodeURIComponent(code)}`,
  };
}

export type VerifyStatus =
  /** Shape and check character both agree: issued by this system. */
  | 'WELL_FORMED'
  /** Right shape, wrong check character — a typo or an edited code. */
  | 'CHECK_MISMATCH'
  /** Doesn't match the code grammar at all. */
  | 'MALFORMED';

export interface VerifyResult {
  status: VerifyStatus;
  /** Uppercased input, trimmed. Echoed back even when malformed. */
  code: string;
  kind: ReceiptKind | null;
  label: string | null;
  serial: string | null;
  checksum: string | null;
  bars: SignatureBar[];
  /** One line of plain truth about what the status does and does not prove. */
  statement: string;
}

const CODE_GRAMMAR = /^WM-(ORD|ENC|TRN)-([A-Z0-9]{1,12})-([0-9A-F]{4})$/;

const SEGMENT_KIND: Record<string, ReceiptKind> = { ORD: 'shop', ENC: 'encargo', TRN: 'turno' };

/**
 * Validate a code's integrity. Deliberately offline: the site is static, so
 * there is no registry to ask at request time. That bounds what this can claim —
 * see "WHAT THIS IS NOT". `statement` carries that bound into the UI so the page
 * cannot accidentally overpromise.
 */
export function verifyCode(raw: string | null | undefined, barCount = 42): VerifyResult {
  const code = String(raw ?? '').trim().toUpperCase();

  const match = CODE_GRAMMAR.exec(code);
  if (!match) {
    return {
      status: 'MALFORMED',
      code,
      kind: null, label: null, serial: null, checksum: null,
      bars: [],
      statement: 'This is not a Wenu Mapu reference. Check the code on your receipt.',
    };
  }

  const [, segment, serial, check] = match;
  const kind = SEGMENT_KIND[segment];
  const body = `WM-${segment}-${serial}`;

  if (checkChars(body) !== check) {
    return {
      status: 'CHECK_MISMATCH',
      code,
      kind, label: KIND_LABEL[kind], serial, checksum: null,
      bars: [],
      statement: 'The check characters do not match. The code was mistyped or altered.',
    };
  }

  return {
    status: 'WELL_FORMED',
    code,
    kind,
    label: KIND_LABEL[kind],
    serial,
    checksum: displayChecksum(code),
    bars: signatureBars(code, barCount),
    statement:
      'This reference was issued by Wenu Mapu. Integrity of the code only — ' +
      'payment and shipping status are confirmed by us directly, not by this page.',
  };
}

// ─── STRIP GEOMETRY ─────────────────────────────────────────────────────────
// Shared by the Astro template (build-time path) and the client script
// (query-string path). Both MUST draw from this one function: if the receipt
// and the verification page computed their own rects, the two strips could
// drift apart and the artifact would stop being recognisable.

export interface StripRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface StripGeometry {
  width: number;
  height: number;
  rects: StripRect[];
}

/**
 * Lay the bars out in user units. `module` is the width of one module and
 * `height` the full strip height; short bars hang from the top edge so the
 * baseline stays flat, the way a printed strip does.
 */
export function stripGeometry(bars: SignatureBar[], module = 3, height = 46): StripGeometry {
  const rects: StripRect[] = [];
  let x = 0;
  for (const bar of bars) {
    const w = bar.w * module;
    const h = Math.round(height * bar.h * 100) / 100;
    rects.push({ x, y: 0, w, h });
    x += w + module;
  }
  return { width: Math.max(0, x - module), height, rects };
}
