// KODEX −∞ · shared spine.
// One source of truth for every KODEX page — the works, the cosmogonic operations,
// the chapters, the portal ring, the sigil grammar. Pages import from here so the
// universe stays coherent across an interconnected graph of pages (like the vault).

// ════════════════════════════════════════════════════════════════════════
//  THE SOURCE CODE OF THE UNIVERSE  ·  el código fuente del universo
//  This file is the single source of truth from which all of KODEX is generated.
//  So it is fitting that the universe's own generative law lives here, in code.
// ════════════════════════════════════════════════════════════════════════
export const UNIVERSE = `// KODEX −∞ · SOURCE CODE OF THE UNIVERSE
// The universe does not appear once. It keeps originating
// whenever a possibility takes form, relation and memory.

axis       = −∞ → 0 → +∞ → −∞′     // descent · horizon · radiation · return-with-memory
return     = Ω → Δ → O → Γ → M → C → W → R → Ω′
theorem    = Ω′ = R[ W( Γ( O( Δ(Ω) ) ) ) ] ,   Ω′ ≠ Ω
engine     = K(n+1) = ( R ∘ M ∘ T ∘ E )( K(n) )
operations = C01 … C16   // void · waters · fertile dark · matrix · sky-earth split ·
                         // word · sacrifice · craft · levels · earth-from-water ·
                         // genealogy · polarity · cycles · world-axis · eternal · song
signal     = the key that turns potential into radiation   // B/W → colour

function origin() {
  let Ω = potential;                       // −∞
  while (possibility) {                     // it never ends
    Ω = differentiate(Ω);                   // Δ
    Ω = seed(Ω);                            // O · 0
    Ω = unfold(Ω);                          // Γ → M → C → W · +∞
    Ω = dissolve(Ω);                        // R
    Ω = remember(Ω);                        // Ω′  (carries history, loss, memory)
  }
  return Ω;                                 // it does not reproduce the beginning
}
// a possibility given form · belongs to no one, and to all`;

export const num = (n) => 'arch-' + String(n).padStart(2, '0');

// The 16 cosmogonic operations (Atlas Vol. I) — KODEX's machine language.
export const OPERATIONS = {
  C01: 'void / opening', C02: 'primordial waters', C03: 'fertile darkness',
  C04: 'egg / matrix', C05: 'sky–earth split', C06: 'word / thought',
  C07: 'sacrifice / body-world', C08: 'artisanal modelling', C09: 'emergence by levels',
  C10: 'earth from water', C11: 'genealogy / emanation', C12: 'conflict of polarities',
  C13: 'ages & cycles', C14: 'tree / world-axis', C15: 'eternal universe',
  C16: 'song / living land',
};
export const opName = (c) => OPERATIONS[c] || c;

// FAMILIES — one work = one form with many readings. Grouped by Ocin.
export const families = [
  { n: '001', members: [1, 2, 3, 7] }, { n: '002', members: [4, 5, 6] },
  { n: '003', members: [14, 8, 10, 12, 13] }, { n: '004', members: [15, 24] },
  { n: '005', members: [18, 16, 17] }, { n: '006', members: [19, 20, 28, 38, 39] },
  { n: '007', members: [21, 23] }, { n: '008', members: [25, 26] },
  { n: '009', members: [33, 32] }, { n: '010', members: [27, 29, 35, 34] },
  { n: '011', members: [30, 31] }, { n: '012', members: [36, 37] },
  // Tribe Space — ONE work, many readings ("todas de space tribe es la misma obra").
  { n: '013', members: [43, 44, 45, 46, 47, 48, 49, 50, 51, 52] },
].map((f) => {
  const nn = Number(f.n);
  const th = nn <= 12 ? { k: 'achroma', c: '#cfc7b6' }
    : (nn <= 17 ? { k: 'tribe', c: '#c98a3c' } : { k: 'disco', c: '#e0559b' });
  const OPS = {
    achroma: ['C01', 'C03', 'C04', 'C05', 'C14', 'C15'],
    tribe: ['C07', 'C08', 'C11', 'C06', 'C16'],
    disco: ['C13', 'C16', 'C12', 'C11', 'C04'],
  };
  const pool = OPS[th.k];
  const a = pool[nn % pool.length];
  let b = pool[(nn * 3 + 2) % pool.length];
  if (b === a) b = pool[(nn + 1) % pool.length];
  return { ...f, rep: num(f.members[0]), files: f.members.map(num), th, ops: [a, b], dir: 'archive' };
});

// DISCO SOLAR — Ocin's real colour works: pink-neon fractal spheres. +∞ made colour.
// Groupings by Ocin: D3–D5, D6–D8, D9–D11 are each one work (many readings).
const dnum = (n) => 'disco-' + String(n).padStart(2, '0');
export const discoWorks = [[1], [2], [3, 4, 5], [6, 7, 8], [9, 10, 11]].map((members, k) => {
  const opsA = ['C13', 'C16', 'C12', 'C11', 'C04'], opsB = ['C16', 'C04', 'C13', 'C12', 'C11'];
  return { n: 'D' + String(k + 1).padStart(2, '0'), rep: dnum(members[0]), files: members.map(dnum),
    th: { k: 'disco', c: '#e0559b' }, ops: [opsA[k % 5], opsB[k % 5]], dir: 'disco' };
});

// 3 themed movements — works from beginning to end, each its own colour.
export const archThemes = [
  { key: 'achroma', roman: 'i', name: 'Achroma', tag: 'THE TRUE FORMS · BLACK & WHITE', acc: '#cfc7b6',
    desc: 'Black and white — the sacred binary. Shadow and light, the form before colour.',
    fams: families.filter((f) => Number(f.n) <= 12) },
  { key: 'tribe', roman: 'ii', name: 'Tribe Space', tag: 'MASK · BODY · SIGN', acc: '#c98a3c',
    desc: 'The figure returns — tribal architecture, worn and redrawn as one system.',
    fams: families.filter((f) => Number(f.n) >= 13) },
  { key: 'disco', roman: 'iii', name: 'Disco Solar', tag: 'THE SOLAR DISC · SIGNAL IN COLOUR', acc: '#e0559b',
    desc: 'The solar disc — pink-neon fractal spheres where the signal becomes radiation. +∞ made colour.',
    fams: discoWorks },
];

// Chapters (the pages of the codex) with their governing law + sigil seed.
export const CHAPTERS = [
  { slug: 'descent',   roman: 'II',   name: 'Descent',            seed: 211, ops: ['C01', 'C03'], term: '−∞ = gravity · collapse · memory\\nx → −∞  :  depth without a known floor' },
  { slug: 'archive',   roman: 'III',  name: 'The Archive',        seed: 373, ops: ['C11', 'C16'], term: 'A = S × B × M × T\\nif any factor → 0  then  A = 0' },
  { slug: 'machine',   roman: 'IV',   name: 'The Machine',        seed: 457, ops: ['C06', 'C08'], term: 'K(n+1) = ( R ∘ M ∘ T ∘ E )( K(n) )\\nexcavate · transmute · manifest · return' },
  { slug: 'cosmology', roman: 'V',    name: 'Cosmology',          seed: 727, ops: ['C05', 'C13'], term: '−∞ gravity   0 horizon   +∞ radiation\\ncollapse → accretion → radiation → matter' },
  { slug: 'geometry',  roman: 'VI',   name: 'Geometry of Return', seed: 521, ops: ['C04', 'C14'], term: 'r(θ) = r0 · e^(bθ)\\ncycle + memory = helix' },
  { slug: 'flow',      roman: 'VII',  name: 'Flow Field',         seed: 613, ops: ['C02', 'C12'], term: 'v(x,y) = α(−y,x)/(x²+y²+ε) − β(x,y)\\nsignal flips β  →  the field breathes' },
  { slug: 'organisms', roman: 'VIII', name: 'Organisms',          seed: 883, ops: ['C11', 'C15'], term: 'E 00 → T 01 → M 11 → R 10 → 00\\none bit per step  ·  gray code' },
];

// SIGIL — original talisman in KODEX's own grammar (point · circle · axis · spiral ·
// threshold · weave · sequence — exactly Atlas rule 5). Deterministic per seed.
export function sigilSvg(seed) {
  let s = (seed * 2654435761) >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const cx = 50, W = 100, H = 250, sw = 1.35;
  const G = [
    (y) => `<circle cx="${cx}" cy="${y}" r="11" fill="none" stroke="currentColor" stroke-width="${sw}"/><circle cx="${cx}" cy="${y}" r="2.4" fill="currentColor"/>`,
    (y) => `<circle cx="${cx}" cy="${y}" r="3.1" fill="currentColor"/>`,
    (y) => `<path d="M${cx - 11} ${y}H${cx + 11}M${cx} ${y - 11}V${y + 11}" stroke="currentColor" stroke-width="${sw}"/>`,
    (y) => `<path d="M${cx} ${y - 10}L${cx + 10} ${y + 8}L${cx - 10} ${y + 8}Z" fill="none" stroke="currentColor" stroke-width="${sw}"/>`,
    (y) => `<path d="M${cx} ${y + 10}L${cx + 10} ${y - 8}L${cx - 10} ${y - 8}Z" fill="none" stroke="currentColor" stroke-width="${sw}"/>`,
    (y) => `<path d="M${cx - 9} ${y - 6}L${cx} ${y + 6}L${cx + 9} ${y - 6}" fill="none" stroke="currentColor" stroke-width="${sw}"/>`,
    (y) => `<path d="M${cx - 13} ${y - 5}h26M${cx - 13} ${y}h26M${cx - 13} ${y + 5}h26" stroke="currentColor" stroke-width="1.15"/>`,
    (y) => `<rect x="${cx - 8}" y="${y - 8}" width="16" height="16" fill="none" stroke="currentColor" stroke-width="${sw}" transform="rotate(45 ${cx} ${y})"/>`,
    (y) => `<path d="M${cx} ${y - 12}V${y + 12}M${cx - 6} ${y - 8}h12M${cx - 6} ${y + 8}h12" stroke="currentColor" stroke-width="1.15"/>`,
    (y) => `<path d="M${cx + 9} ${y}a9 9 0 1 1 -6.5 -8.4" fill="none" stroke="currentColor" stroke-width="${sw}"/>`,
  ];
  const parts = [`<rect x="7" y="7" width="${W - 14}" height="${H - 14}" fill="none" stroke="currentColor" stroke-width="1" opacity=".4"/>`];
  const rows = 6 + Math.floor(rnd() * 3);
  const top = 30, bottom = H - 30, step = (bottom - top) / (rows - 1);
  for (let i = 0; i < rows; i++) parts.push(G[Math.floor(rnd() * G.length)](top + i * step));
  return `<svg viewBox="0 0 ${W} ${H}" class="kx-sigil__svg" aria-hidden="true">${parts.join('')}</svg>`;
}

// PORTAL SIGIL — one compact centred glyph per chapter-door.
export function portalSigil(seed, formIndex) {
  let s = (seed * 2654435761) >>> 0;
  const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  const forms = [
    () => `<path d="M50 24V76M24 50H76" stroke="currentColor" stroke-width="1.6"/><circle cx="50" cy="50" r="6.5" fill="none" stroke="currentColor" stroke-width="1.4"/>`,
    () => `<circle cx="50" cy="50" r="3.6" fill="currentColor"/><path d="M50 20V34M50 66V80M20 50H34M66 50H80" stroke="currentColor" stroke-width="1.5"/>`,
    () => { let p = ''; for (let k = 0; k < 6; k++) { const a = k / 6 * 6.283; p += `<path d="M50 50L${(50 + 26 * Math.cos(a)).toFixed(1)} ${(50 + 26 * Math.sin(a)).toFixed(1)}" stroke="currentColor" stroke-width="1.3"/>`; } return p + `<circle cx="50" cy="50" r="4" fill="currentColor"/>`; },
    () => `<path d="M50 22L73 63H27Z" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M50 78L73 37H27Z" fill="none" stroke="currentColor" stroke-width="1.1" opacity=".55"/>`,
    () => `<circle cx="50" cy="46" r="15" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M50 61v18M42 79h16" stroke="currentColor" stroke-width="1.4"/>`,
    () => { let p = `<circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" stroke-width="1.4"/>`; for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283; p += `<circle cx="${(50 + 23 * Math.cos(a)).toFixed(1)}" cy="${(50 + 23 * Math.sin(a)).toFixed(1)}" r="2.1" fill="currentColor"/>`; } return p; },
    () => `<path d="M32 70 Q50 18 68 70" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M50 30v48" stroke="currentColor" stroke-width="1.3"/><circle cx="50" cy="29" r="3.2" fill="currentColor"/>`,
    () => `<rect x="35" y="35" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.4" transform="rotate(45 50 50)"/><circle cx="50" cy="50" r="4.5" fill="none" stroke="currentColor" stroke-width="1.3"/>`,
  ];
  const rot = Math.floor(rnd() * 4) * 15;
  const inner = forms[formIndex % forms.length]();
  return `<svg viewBox="0 0 100 100" class="kx-portal__svg" aria-hidden="true"><g transform="rotate(${rot} 50 50)">${inner}</g><path d="M50 6V15M50 85V94M6 50H15M85 50H94" stroke="currentColor" stroke-width="1" opacity=".45"/></svg>`;
}

// PORTALS — the chapter-doors on a ring.
//
// P0 FIX (24-08-2026): six of the eight hrefs pointed at routes that do not
// exist. Verified by curl against the live preview at localhost:4500 on the
// CANONICAL_INTEGRATION_BASE (converge/kodex-todo @ 56bc3576):
//   /kodex/descent /kodex/machine /kodex/cosmology
//   /kodex/geometry /kodex/flow /kodex/organisms   -> all 404
// The scenes DO exist, under the folio corridor. Each door below is now
// re-pointed at the route that actually answers 200. `r` (roman numeral),
// `name` and `seed` are preserved verbatim — only `href` changed.
//
// Canonical corridor (verified 200, this base):
//   /kodex           THRESHOLD (frozen by the creator)
//   /kodex/folio/i   PROLOGUE   ii DESCENT   iii ARCHIVE
//   /kodex/folio/iv  MACHINE     v COSMOLOGY  vi RETURN
//
// Prologue previously pointed at /kodex#prologue. That anchor does exist
// (id="prologue" is present in the served THRESHOLD markup) so it was not a
// hard 404 — but it lands on a section of THRESHOLD, not on the PROLOGUE
// scene. It now points at the scene itself, /kodex/folio/i/.
//
// Archive previously pointed at /kodex/archive, which is a real 200 page
// ("The Archive"). It now points at /kodex/folio/iii/ ("03 · ARCHIVE") so the
// whole ring lives in one corridor. /kodex/archive is untouched and still
// resolves; nothing else in the repo links here.
//
// GEOMETRY / FLOW / ORGANISMS: no route exists for these three, anywhere.
// Searched src/pages/** and curl-probed every candidate. The folio corridor
// only accepts i..vi (see getStaticPaths in src/pages/kodex/folio/[folio].astro)
// and none of those six is named Geometry, Flow or Organisms. The nearest
// things in the repo are lab experiments — /kodex/lab/geometric-memory,
// /kodex/lab/organism-engine, /kodex/lab/signal-vortex (all 200) — but those
// are internal lab pages, not canonical scenes, and wiring public chapter-doors
// to them would be inventing canon. The one repo-sourced hint is the folio VI
// lede in src/lib/kodexBook.js: "Geometry, organisms, and the white door."
// which suggests they may be sub-movements of RETURN rather than doors of
// their own — but that is a creator decision, not an implementation one.
// Until the creator rules (build them, fold them into RETURN, or drop them
// from the ring) their href is null and they carry status: 'MISSING'.
// A null href renders as a non-link (Astro omits null attributes), so these
// doors go dormant instead of shipping a visitor to an error page.
export const portals = [
  { r: 'I', name: 'Prologue', href: '/kodex/folio/i/', seed: 137 },
  { r: 'II', name: 'Descent', href: '/kodex/folio/ii/', seed: 211 },
  { r: 'III', name: 'Archive', href: '/kodex/folio/iii/', seed: 373 },
  { r: 'IV', name: 'Machine', href: '/kodex/folio/iv/', seed: 457 },
  { r: 'V', name: 'Cosmology', href: '/kodex/folio/v/', seed: 727 },
  { r: 'VI', name: 'Geometry', href: null, seed: 521, status: 'MISSING' },
  { r: 'VII', name: 'Flow', href: null, seed: 613, status: 'MISSING' },
  { r: 'VIII', name: 'Organisms', href: null, seed: 883, status: 'MISSING' },
].map((p, i, a) => {
  const ang = -Math.PI / 2 + i / a.length * Math.PI * 2;
  return { ...p, i, x: (50 + 40 * Math.cos(ang)).toFixed(2), y: (50 + 40 * Math.sin(ang)).toFixed(2) };
});
