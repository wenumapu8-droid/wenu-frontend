// KODEX−∞ · BOOK DATA — single source for the paginated codex
// (cover /kodex + folios /kodex/folio/*). Data lifted verbatim from the
// original monolith landing (2026-07-25 split "libro digital", owner request).
// NOTE: src/lib/kodex.js belongs to the world.astro session — do not merge.

export const hero = { src: '/img/kodex/works/bw-06.jpg', name: 'DESCENT' };

export const specimens = [
  { i:'I',   file:'bw-01', name:'ROOT',        portal:'−∞',       read:'The tree descends to hold what rises.',           tags:['ROOT','∇','−∞'] },
  { i:'II',  file:'bw-02', name:'FERTILE VOID',portal:'BEFORE',   read:'Dark earth before the seed. All forms possible.', tags:['VOID','○','ORIGIN'] },
  { i:'III', file:'bw-03', name:'LATENCY',     portal:'WINTER',   read:'Life does not vanish. It folds inward.',          tags:['FOLD','◐','CYCLE'] },
  { i:'IV',  file:'bw-04', name:'THRESHOLD',   portal:'0',        read:'The gate between −∞ and +∞. The breathing centre.',tags:['0','⊙','PORTAL'] },
  { i:'V',   file:'bw-05', name:'DARK BLOOM',  portal:'SHADOW',   read:'It flowers in shadow. Form remembers its making.',tags:['BLOOM','✳','MEMORY'] },
  { i:'VI',  file:'bw-06', name:'BOTTOMLESS',  portal:'RITE',     read:'Each answer opens a deeper layer.',               tags:['DEPTH','↓','RITE'] },
  { i:'VII', file:'bw-07', name:'NUCLEUS',     portal:'HORIZON',  read:'Extreme density. Where the map stops describing.',tags:['CORE','●','LIMIT'] },
  { i:'VIII',file:'bw-08', name:'AXIS',        portal:'TRUNK',    read:'Trunk joins the deep and the high.',              tags:['AXIS','│','TRUNK'] },
  { i:'IX',  file:'bw-09', name:'INFINITE SHADOW',portal:'ARCHIVE',read:'The dark archive. All forgotten, not yet understood.',tags:['SHADOW','▚','ARCHIVE'] },
  { i:'X',   file:'bw-10', name:'DISSOLUTION', portal:'SOLVE',    read:'Form loses order to become life again.',          tags:['SOLVE','∴','RETURN'] },
  { i:'XI',  file:'bw-11', name:'RETURN',      portal:'φ',        read:'−∞ → 0 → +∞ → 0. Inhale. Exhale.',                tags:['RETURN','φ','∞'] },
];

// FAMILIES — one work = one form with many readings (variants/effects).
// Grouping given by Ocin. rep = representative (shown); members = all readings.
const num = (n) => 'arch-' + String(n).padStart(2, '0');
const rawFamilies = [
  { n:'001', members:[1,2,3,7] },
  { n:'002', members:[4,5,6] },
  { n:'003', members:[14,8,10,12,13] },
  { n:'004', members:[15,24] },
  { n:'005', members:[18,16,17] },
  { n:'006', members:[19,20,28,38,39] },
  { n:'007', members:[21,23] },
  { n:'008', members:[25,26] },
  { n:'009', members:[33,32] },
  { n:'010', members:[27,29,35,34] },
  { n:'011', members:[30,31] },
  { n:'012', members:[36,37] },
  // Tribe Space — ONE work, many readings (Ocin: "todas de space tribe es la misma obra")
  { n:'013', members:[43,44,45,46,47,48,49,50,51,52] },
];
const OPS_BY_THEME = {
  achroma: ['C01', 'C03', 'C04', 'C05', 'C14', 'C15'],
  tribe: ['C07', 'C08', 'C11', 'C06', 'C16'],
  disco: ['C13', 'C16', 'C12', 'C11', 'C04'],
};
// CURATION — every work carries its reading, technique, inspiration and its
// own sigil (seed). Written in KODEX's system language (Atlas operations,
// the sacred binary, the tools of the machine) — museum plate, not naked design.
const CURATION = {
  '001': { t:'Raíz Umbral',      read:'The first gate: a root system drawn as circuitry — what descends, holds.',
           fx:'ink weave · mirror fold', insp:'the tree that grows downward (C14, world-axis inverted)' },
  '002': { t:'Matriz Fértil',    read:'Dense field before form. Every future pattern is already latent here.',
           fx:'stipple density · optical vibration', insp:'fertile darkness before the seed (C03)' },
  '003': { t:'Teselado Vivo',    read:'One module repeated until it stops being a module and becomes terrain.',
           fx:'modular tessellation · rotation grid', insp:'the egg/matrix that contains all combinations (C04)' },
  '004': { t:'Umbral Partido',   read:'Two symmetries meet and refuse to merge. The split is the doorway.',
           fx:'axial mirror · hard rupture', insp:'sky–earth separation (C05)' },
  '005': { t:'Laberinto Óptico', read:'A path with no dead ends: the eye walks it and returns changed.',
           fx:'labyrinth line · op-art oscillation', insp:'descent by levels into the deep (C09 shadow)' },
  '006': { t:'Tejido Serpiente', read:'The weave breathes — scales, textile, code: three readings of one skin.',
           fx:'serpent weave · chromatic shift', insp:'the living land that sings (C16)' },
  '007': { t:'Ojo Binario',      read:'Centre and periphery exchange places while you watch.',
           fx:'radial pulse · figure-ground flip', insp:'conflict of polarities held in balance (C12)' },
  '008': { t:'Portal Espejo',    read:'The gate repeats itself inward. Each crossing is smaller and truer.',
           fx:'recursive frame · mirror nesting', insp:'threshold upon threshold (C01, opening)' },
  '009': { t:'Señal en Movimiento', read:'The pattern refuses stillness — the only plate that must move to be read.',
           fx:'motion study · living signal (video)', insp:'the eternal universe breathing (C15)',
           video:'/img/kodex/video/plate-009' },
  '010': { t:'Cosmograma',       read:'A map of forces, not places. Read it like sky, not like ground.',
           fx:'orbital geometry · star-chart logic', insp:'ages and cycles overlaid (C13)' },
  '011': { t:'Gemelos de Sombra',read:'Two states of one body: what shows and what holds it from beneath.',
           fx:'positive/negative pair', insp:'shadow as archive of the unlived (C03)' },
  '012': { t:'Frecuencia Tallada',read:'Sound made visible — interference carved into black and white.',
           fx:'wave interference · moiré carve', insp:'the word that orders the void (C06)' },
  '013': { t:'Space Tribe',      read:'One mask, many transmissions. The figure returns wearing the system.',
           fx:'tribal mask · glitch transmission', insp:'the body-world worn as sign (C07)' },
};
const DISCO_CURATION = {
  D01: { t:'Disco Solar I · Ignición',  read:'The signal crosses zero and catches colour.', fx:'fractal sphere · neon radiation', insp:'radiation after collapse (+∞)' },
  D02: { t:'Disco Solar II · Corona',   read:'A ring of heat around a silent centre.', fx:'radial bloom · chroma field', insp:'the crown of the horizon (C05)' },
  D03: { t:'Disco Solar III · Órbitas', read:'Three passes of one sun — the same fire, three distances.', fx:'orbital triptych', insp:'cycles within cycles (C13)' },
  D04: { t:'Disco Solar IV · Pulso',    read:'The disc breathes in pink: inhale mineral, exhale light.', fx:'pulse gradient · fractal skin', insp:'song of the living land (C16)' },
  D05: { t:'Disco Solar V · Retorno',   read:'The last orbit bends home — +∞ curving back toward the dark.', fx:'closing spiral', insp:'return as law (C11 emanation)' },
};

export const families = rawFamilies.map((f) => {
  const nn = Number(f.n);
  const th = nn <= 12 ? { k: 'achroma', c: '#cfc7b6' }
    : (nn <= 17 ? { k: 'tribe', c: '#c98a3c' } : { k: 'disco', c: '#e0559b' });
  const pool = OPS_BY_THEME[th.k];
  const a = pool[nn % pool.length];
  let b = pool[(nn * 3 + 2) % pool.length];
  if (b === a) b = pool[(nn + 1) % pool.length];
  const cur = CURATION[f.n] || {};
  return { ...f, ...cur, rep: num(f.members[0]), files: f.members.map(num), th, ops: [a, b],
    dir: 'archive', seed: 100 + nn * 37 };
});

// DISCO SOLAR — Ocin's real colour works (public/img/kodex/disco/).
const dnum = (n) => 'disco-' + String(n).padStart(2, '0');
const discoGroups = [[1], [2], [3, 4, 5], [6, 7, 8], [9, 10, 11]];
export const discoWorks = discoGroups.map((members, k) => {
  const opsA = ['C13', 'C16', 'C12', 'C11', 'C04'];
  const opsB = ['C16', 'C04', 'C13', 'C12', 'C11'];
  const n = 'D' + String(k + 1).padStart(2, '0');
  return { n, ...(DISCO_CURATION[n] || {}), rep: dnum(members[0]), files: members.map(dnum),
    th: { k: 'disco', c: '#e0559b' }, ops: [opsA[k % 5], opsB[k % 5]], dir: 'disco', seed: 700 + k * 53 };
});

// The 16 cosmogonic operations (Atlas Vol. I) — KODEX's machine language.
export const OPERATIONS = {
  C01: 'void / opening',        C02: 'primordial waters',   C03: 'fertile darkness',
  C04: 'egg / matrix',          C05: 'sky–earth split',     C06: 'word / thought',
  C07: 'sacrifice / body-world',C08: 'artisanal modelling', C09: 'emergence by levels',
  C10: 'earth from water',      C11: 'genealogy / emanation',C12: 'conflict of polarities',
  C13: 'ages & cycles',         C14: 'tree / world-axis',   C15: 'eternal universe',
  C16: 'song / living land',
};
export const opName = (c) => OPERATIONS[c] || c;

// THE ARCHIVE — 3 themed movements. Order follows Ocin's palette law:
// B/W true forms → tribe/weave → colour (Disco Solar last).
export const archThemes = [
  { key: 'achroma', roman: 'i',   name: 'Achroma',     tag: 'THE TRUE FORMS · BLACK & WHITE', acc: '#cfc7b6',
    desc: 'Black and white — the sacred binary. Shadow and light, the form before colour.',
    fams: families.filter((f) => +f.n <= 12) },
  { key: 'tribe',   roman: 'ii',  name: 'Tribe Space', tag: 'MASK · BODY · SIGN',             acc: '#c98a3c',
    desc: 'The figure returns — tribal architecture, worn and redrawn as system.',
    fams: families.filter((f) => +f.n >= 13 && +f.n <= 17) },
  { key: 'disco',   roman: 'iii', name: 'Disco Solar', tag: 'THE SOLAR DISC · SIGNAL IN COLOUR', acc: '#e0559b',
    desc: 'The solar disc — pink-neon fractal spheres where the signal becomes radiation. +∞ made colour.',
    fams: discoWorks },
];

// SIGIL — original talisman in KODEX's own grammar. Deterministic per seed.
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

// PORTAL SIGIL — one compact centred glyph per folio-door.
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
  return `<svg viewBox="0 0 100 100" class="kx-portal__svg" aria-hidden="true">`
    + `<g transform="rotate(${rot} 50 50)">${inner}</g>`
    + `<path d="M50 6V15M50 85V94M6 50H15M85 50H94" stroke="currentColor" stroke-width="1" opacity=".45"/>`
    + `</svg>`;
}

// Chapter dividers — sigil + terminal data fragment typed on reveal.
export const chapters = {
  prologue:  { n: 'I',    title: 'Prologue',           seed: 137, term: 'you hold an unfinished codex\nit descends before it rises' },
  descent:   { n: 'II',   title: 'Descent',            seed: 211, term: '−∞ = gravity · collapse · memory\nx → −∞  :  depth without a known floor' },
  archive:   { n: 'III',  title: 'The Archive',        seed: 373, term: 'A = S × B × M × T\nif any factor → 0  then  A = 0' },
  machine:   { n: 'IV',   title: 'The Machine',        seed: 457, term: 'K(n+1) = ( R ∘ M ∘ T ∘ E )( K(n) )\nexcavate · transmute · manifest · return' },
  cosmology: { n: 'V',    title: 'Cosmology',          seed: 727, term: '−∞ gravity   0 horizon   +∞ radiation\ncollapse → accretion → radiation → matter' },
  geometry:  { n: 'VI',   title: 'Geometry of Return', seed: 521, term: 'r(θ) = r0 · e^(bθ)\ncycle + memory = helix' },
  flow:      { n: 'VII',  title: 'Flow Field',         seed: 613, term: 'v(x,y) = α(−y,x)/(x²+y²+ε) − β(x,y)\nsignal flips β  →  the field breathes' },
  organisms: { n: 'VIII', title: 'Organisms',          seed: 883, term: 'E 00 → T 01 → M 11 → R 10 → 00\none bit per step  ·  gray code' },
};

// THE FOLIOS — the pages of the digital book. Each one is its own presentation:
// distinct accent, distinct rhythm, content remixed (art + text + live engines).
export const folios = [
  { slug:'i',   n:'I',   name:'Prologue',  stage:'PROLOGUE',  col:'207,199,182', acc:'#cfc7b6', seed:137,
    lede:'The opening. Read slowly.' },
  { slug:'ii',  n:'II',  name:'Descent',   stage:'DESCENT',   col:'150,160,175', acc:'#96a0af', seed:211,
    lede:'Eight strata. The fall is the reading.' }, // 2026-08-28: manifest real tiene 8 estratos
  { slug:'iii', n:'III', name:'Archive',   stage:'ARCHIVE',   col:'207,199,182', acc:'#cfc7b6', seed:373,
    lede:'Three movements. Every work is alive.' },
  { slug:'iv',  n:'IV',  name:'Machine',   stage:'MACHINE',   col:'201,168,76',  acc:'#c9a84c', seed:457,
    lede:'The code speaks. The machine makes.' },
  { slug:'v',   n:'V',   name:'Cosmology', stage:'COSMOLOGY', col:'224,85,155',  acc:'#e0559b', seed:727,
    lede:'The doctrine. The field breathes.' },
  { slug:'vi',  n:'VI',  name:'Return',    stage:'RETURN',    col:'207,199,182', acc:'#cfc7b6', seed:521,
    lede:'Geometry, organisms, and the white door.' },
];

// PORTALS — the folio-doors, arranged on a ring (the codex index).
export const portals = folios.map((f, i, a) => {
  const ang = -Math.PI / 2 + i / a.length * Math.PI * 2;
  return { r: f.n, name: f.name, href: `/kodex/folio/${f.slug}/`, seed: f.seed, i,
    x: (50 + 40 * Math.cos(ang)).toFixed(2), y: (50 + 40 * Math.sin(ang)).toFixed(2) };
});

// ORGANISMOS — los sub-universos: órganos de una misma inteligencia creativa
export const organs = [
  { name:'Wenu Mapu',       dom:'body · jewelry · piercing · ritual technology',        state:'MANIFESTED' },
  { name:'Soma',            dom:'biology · fungi · inner change · consciousness',       state:'EXCAVATION' },
  { name:'Disco Solar',     dom:'speculative artifacts · WebAR · spirit interfaces',    state:'TRANSMUTATION' },
  { name:'Cosmic Serpent',  dom:'DNA · cycles · the unconscious · archetypes',          state:'LATENT' },
  { name:'Practice',        dom:'research · art direction · UX/UI · 3D · systems',      state:'ACTIVE' },
];
