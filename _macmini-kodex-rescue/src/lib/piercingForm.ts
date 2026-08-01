import type { WooProduct } from './woo';

/**
 * Layer 1 of the many-to-many piercing taxonomy: derive the JEWELRY FORM,
 * gauge and diameter from a product (name/slug today; swap to WC attributes
 * once inventory loads Placement/Gauge/Diameter). The form + diameter then map
 * to ALL compatible placements via `placement-matrix.ts` (§7 of the domain doc).
 */

export type Form =
  | 'ring' | 'clicker' | 'circular-barbell' | 'curved-barbell' | 'straight-barbell'
  | 'stud' | 'nostril-screw'
  | 'plug' | 'tunnel' | 'hanger' | 'weight' | 'saddle' | 'taper'
  | 'unknown';

/** Finger rings / non-piercing pieces that must never read as a piercing "ring". */
const NOT_PIERCING_RING = /finger|meteorite|vacamuerta|honeycomb|signet|band ring|wedding/i;

export function deriveForm(p: WooProduct): Form {
  const h = `${p.slug} ${p.name}`.toLowerCase();

  if (/clicker/.test(h)) return 'clicker';
  if (/circular barbell|horseshoe/.test(h)) return 'circular-barbell';
  if (/curved barbell|banana|navel|belly/.test(h)) return 'curved-barbell';
  if (/nostril screw|l-?bend|nose bone/.test(h)) return 'nostril-screw';
  if (/\bplug\b/.test(h)) return 'plug';
  if (/tunnel/.test(h)) return 'tunnel';
  if (/hanger/.test(h)) return 'hanger';
  if (/\bweight\b|ear weight/.test(h)) return 'weight';
  if (/\bsaddle\b/.test(h)) return 'saddle';
  if (/\btaper\b/.test(h)) return 'taper';
  if ((/seamless|segment|captive|\bcbr\b|\bhoop\b|\bring\b/.test(h)) && !NOT_PIERCING_RING.test(h)) return 'ring';
  if (/labret|flat[\s-]?back|push[\s-]?pin|threadless|neometal|top pin|stone top|cabochon|\bstud\b|labret top|internally threaded|\bpiercing\b/.test(h)) return 'stud';
  if (/straight barbell|industrial|tongue|\bbarbell\b/.test(h)) return 'straight-barbell';
  return 'unknown';
}

const GAUGE_BY_G: Record<number, number> = {
  20: 0.8, 18: 1.0, 16: 1.2, 14: 1.6, 12: 2.0, 10: 2.4, 8: 3.2, 6: 4, 4: 5, 2: 6, 0: 8,
};

/** Wire thickness in mm (gauge). Parses "1.2x8mm", "16G", "1.6mm". */
export function deriveGaugeMm(name: string): number | null {
  const x = name.match(/(\d\.\d)\s*[x×]\s*\d/);
  if (x) return parseFloat(x[1]);
  const g = name.match(/\b(\d{1,2})\s*g\b/i);
  if (g && GAUGE_BY_G[+g[1]] != null) return GAUGE_BY_G[+g[1]];
  return null;
}

/**
 * Ring/clicker inner diameter (or barbell length) in mm. We pick the largest
 * plausible standalone "Nmm" (>=4) — that's the diameter, not the gauge (~0.8–2mm).
 * Note: in "1.2x8mm" the "8mm" has no word boundary after the x, so it is ignored
 * here unless it's the only signal (handled by the x-fallback).
 */
export function deriveDiameterMm(name: string): number | null {
  const all = [...name.matchAll(/\b(\d{1,2}(?:\.\d)?)\s*mm\b/gi)]
    .map(m => parseFloat(m[1]))
    .filter(v => v >= 4);
  if (all.length) return Math.max(...all);
  const x = name.match(/\d\.\d\s*[x×]\s*(\d{1,2})/);
  if (x) return parseFloat(x[1]);
  return null;
}
