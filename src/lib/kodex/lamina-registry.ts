/**
 * KODEX-∞ · REGISTRO DE LAMINAS Y LABS
 *
 * Codifica el LOTE C del TELAR (ledger 2026-08-29 en
 * `docs/kodex/18-LOTE-C-ARCHIVE-LEDGER-2026-08-29.md`) como dato
 * ejecutable. Cada lamina y lab del repositorio declara su estado
 * canonico VIVO / HUECO / ARCHIVO / AMBIGUA y la razon.
 *
 *   VIVO     · montada como nodo en una escena del corredor.
 *   HUECO    · declarada visible pero sin dato -- se muestra como hueco.
 *   ARCHIVO  · no entra al corredor. Se anota por que.
 *   AMBIGUA  · bloqueada esperando decision autoral (crear nodo en atlas,
 *              reclasificar a chamber KDX-CH-*, o archivar).
 *
 * REGLA DURA canonica: `src/pages/kodex/lab/**` = biblioteca de laboratorio,
 * no escenas del corredor. Los 27 labs son ARCHIVO por regla preexistente
 * (memoria 2026-08-15 project-kodex-ya-existe).
 *
 * Este registro NO monta ni cablea nada por si mismo. Es la fuente de
 * verdad que consumen: (a) el gate de experiencia para validar; (b) los
 * componentes que arman listas de nodos por escena.
 */

/** Los estados de cierre canonicos (los mismos del TELAR). */
export type EstadoLamina = 'VIVO' | 'HUECO' | 'ARCHIVO' | 'AMBIGUA';

/** Escenas del corredor donde una lamina VIVO puede estar montada. */
export type EscenaCorredor =
  | 'THRESHOLD' | 'PROLOGUE' | 'DESCENT' | 'ARCHIVE'
  | 'MACHINE' | 'COSMOLOGY' | 'RETURN';

export interface EntradaLamina {
  /** Slug del archivo, sin extension ni carpeta. */
  slug: string;
  /** Ruta relativa desde el root del repo. */
  path: string;
  /** `lamina` para pages/kodex/lamina/, `lab` para pages/kodex/lab/. */
  kind: 'lamina' | 'lab';
  status: EstadoLamina;
  /** Solo para VIVO: escena del corredor donde vive. */
  scene?: EscenaCorredor;
  /** Solo para AMBIGUA/VIVO: KDX-IMG-NNN del atlas si aplica. */
  atlas_ref?: string;
  /** Razon obligatoria del status. */
  reason: string;
}

/**
 * REGISTRO CANONICO -- LOTE C cerrado (donde corresponde) el 2026-08-29.
 *
 * Los 24 labs originales + los 3 nuevos (index.astro en carpetas) van
 * como ARCHIVO por regla dura. Las 5 YA_MONTADA se verificaron con grep
 * en LaminaOrganismo.astro. Los 8 experimentales quedan ARCHIVO
 * candidato hasta que el creador vete. Las 25 AMBIGUA quedan bloqueadas
 * en curaduria del atlas.
 */
export const LAMINA_REGISTRY: ReadonlyArray<EntradaLamina> = Object.freeze([
  // ── VIVO · 5 laminas montadas en LaminaOrganismo (verificado 2026-08-29) ──
  {
    slug: 't01-02-observation-eye',
    path: 'src/pages/kodex/lamina/t01-02-observation-eye.astro',
    kind: 'lamina', status: 'VIVO', scene: 'PROLOGUE',
    reason: 'Montada en LaminaOrganismo.astro para PROLOGUE.',
  },
  {
    slug: 't01-03-descent-tunnel',
    path: 'src/pages/kodex/lamina/t01-03-descent-tunnel.astro',
    kind: 'lamina', status: 'VIVO', scene: 'DESCENT',
    reason: 'Montada en LaminaOrganismo.astro para DESCENT.',
  },
  {
    slug: 't01-04-archive-tree',
    path: 'src/pages/kodex/lamina/t01-04-archive-tree.astro',
    kind: 'lamina', status: 'VIVO', scene: 'ARCHIVE',
    reason: 'Montada en LaminaOrganismo.astro para ARCHIVE.',
  },
  {
    slug: 't01-06-ritual-device',
    path: 'src/pages/kodex/lamina/t01-06-ritual-device.astro',
    kind: 'lamina', status: 'VIVO', scene: 'MACHINE',
    reason: 'Montada en LaminaOrganismo.astro para MACHINE.',
  },
  {
    slug: 't01-07-cosmology-core',
    path: 'src/pages/kodex/lamina/t01-07-cosmology-core.astro',
    kind: 'lamina', status: 'VIVO', scene: 'COSMOLOGY',
    reason: 'Montada en LaminaOrganismo.astro para COSMOLOGY.',
  },

  // ── ARCHIVO · 8 laminas experimentales (aprobado en ledger 2026-08-29) ──
  {
    slug: 'pend-01', path: 'src/pages/kodex/lamina/pend-01.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Prefijo pend-* = pendiente/experimental sin nodo en atlas.',
  },
  {
    slug: 'pend-20', path: 'src/pages/kodex/lamina/pend-20.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Prefijo pend-* = pendiente/experimental sin nodo en atlas.',
  },
  {
    slug: 't01-05-specimen-skull',
    path: 'src/pages/kodex/lamina/t01-05-specimen-skull.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Variante experimental que no entro al corredor.',
  },
  {
    slug: 't01-06-izq-solo',
    path: 'src/pages/kodex/lamina/t01-06-izq-solo.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Descomposicion del t01-06 principal (ritual-device).',
  },
  {
    slug: 'teorema-del-retorno',
    path: 'src/pages/kodex/lamina/teorema-del-retorno.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Estudio autoral sin cableado al atlas.',
  },
  {
    slug: 'u05-genesis', path: 'src/pages/kodex/lamina/u05-genesis.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Serie UNIVERSE GATE, no catalogada en el atlas.',
  },
  {
    slug: 'u06-memory', path: 'src/pages/kodex/lamina/u06-memory.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Serie UNIVERSE GATE, no catalogada en el atlas.',
  },
  {
    slug: 'u08-anomaly', path: 'src/pages/kodex/lamina/u08-anomaly.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Serie UNIVERSE GATE, no catalogada en el atlas.',
  },
  {
    slug: 'u10-commons', path: 'src/pages/kodex/lamina/u10-commons.astro',
    kind: 'lamina', status: 'ARCHIVO',
    reason: 'Serie UNIVERSE GATE, no catalogada en el atlas.',
  },

  // ── AMBIGUA · 25 laminas bloqueadas en curaduria del atlas ──
  // Mencionan escenas del corredor pero NO tienen entrada en kodex-atlas.json.
  // Salida requiere decision autoral: (A) crear nodo en atlas, (B) reclasificar
  // a chamber KDX-CH-*, o (C) declarar ARCHIVO.
  {
    slug: 'akashic-crown', path: 'src/pages/kodex/lamina/akashic-crown.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN sin entrada en atlas.',
  },
  {
    slug: 'anatomical-star', path: 'src/pages/kodex/lamina/anatomical-star.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN sin entrada en atlas.',
  },
  {
    slug: 'gaia-sentinel', path: 'src/pages/kodex/lamina/gaia-sentinel.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN sin entrada en atlas.',
  },
  {
    slug: 'genesis-cradle', path: 'src/pages/kodex/lamina/genesis-cradle.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN sin entrada en atlas.',
  },
  {
    slug: 'heart-chamber', path: 'src/pages/kodex/lamina/heart-chamber.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona todas 7 escenas; candidata a chamber HEART (KDX-CH-*).',
  },
  {
    slug: 'impossible-forms-vol-1',
    path: 'src/pages/kodex/lamina/impossible-forms-vol-1.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona RETURN sin entrada en atlas.',
  },
  {
    slug: 'kx05-procession-field',
    path: 'src/pages/kodex/lamina/kx05-procession-field.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona RETURN sin entrada en atlas.',
  },
  {
    slug: 'kx06-diagonal-code-band',
    path: 'src/pages/kodex/lamina/kx06-diagonal-code-band.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona RETURN sin entrada en atlas.',
  },
  {
    slug: 'mycelial-oracle',
    path: 'src/pages/kodex/lamina/mycelial-oracle.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN sin entrada en atlas.',
  },
  {
    slug: 'null-knot', path: 'src/pages/kodex/lamina/null-knot.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona RETURN sin entrada en atlas.',
  },
  {
    slug: 'origin-forge', path: 'src/pages/kodex/lamina/origin-forge.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN sin entrada en atlas.',
  },
  {
    slug: 'silence-engine', path: 'src/pages/kodex/lamina/silence-engine.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN; candidata a chamber SILENCE.',
  },
  {
    slug: 'soul-weaver', path: 'src/pages/kodex/lamina/soul-weaver.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN sin entrada en atlas.',
  },
  {
    slug: 'star-compass-seal',
    path: 'src/pages/kodex/lamina/star-compass-seal.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona RETURN+THRESHOLD sin entrada en atlas.',
  },
  {
    slug: 'star-lattice', path: 'src/pages/kodex/lamina/star-lattice.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN+THRESHOLD sin entrada en atlas.',
  },
  {
    slug: 't01-01-threshold-portal',
    path: 'src/pages/kodex/lamina/t01-01-threshold-portal.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona DESCENT+THRESHOLD sin entrada en atlas.',
  },
  {
    slug: 't01-08-signal-bloom',
    path: 'src/pages/kodex/lamina/t01-08-signal-bloom.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona DESCENT+RETURN sin entrada en atlas.',
  },
  {
    slug: 'u01-origin-field',
    path: 'src/pages/kodex/lamina/u01-origin-field.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'UNIVERSE GATE, menciona THRESHOLD sin entrada en atlas.',
  },
  {
    slug: 'u02-threshold', path: 'src/pages/kodex/lamina/u02-threshold.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'UNIVERSE GATE, menciona RETURN+THRESHOLD sin entrada en atlas.',
  },
  {
    slug: 'u03-return', path: 'src/pages/kodex/lamina/u03-return.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'UNIVERSE GATE, menciona RETURN sin entrada en atlas.',
  },
  {
    slug: 'u04-alphabet', path: 'src/pages/kodex/lamina/u04-alphabet.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'UNIVERSE GATE, menciona RETURN+THRESHOLD sin entrada en atlas.',
  },
  {
    slug: 'u07-observer', path: 'src/pages/kodex/lamina/u07-observer.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'UNIVERSE GATE, candidata a chamber OBSERVER (KDX-CH-*).',
  },
  {
    slug: 'u09-source', path: 'src/pages/kodex/lamina/u09-source.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'UNIVERSE GATE, menciona ARCHIVE+THRESHOLD sin entrada en atlas.',
  },
  {
    slug: 'void-orchard', path: 'src/pages/kodex/lamina/void-orchard.astro',
    kind: 'lamina', status: 'AMBIGUA',
    reason: 'Menciona ARCHIVE+RETURN sin entrada en atlas.',
  },

  // ── ARCHIVO · 27 labs (biblioteca de laboratorio, no corredor) ──
  // Regla canonica preexistente: `pages/kodex/lab/**` es biblioteca, ninguno
  // entra al viaje. Se conservan como noindex para inspeccion tecnica.
  { slug: 'altar', path: 'src/pages/kodex/lab/altar.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'archive-evidence', path: 'src/pages/kodex/lab/archive-evidence.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'archivo-cromo', path: 'src/pages/kodex/lab/archivo-cromo.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'command-shell', path: 'src/pages/kodex/lab/command-shell.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'crystal-receiver', path: 'src/pages/kodex/lab/crystal-receiver.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'deep-navigation', path: 'src/pages/kodex/lab/deep-navigation.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'effect-foundry', path: 'src/pages/kodex/lab/effect-foundry/index.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'effect-foundry-smoke', path: 'src/pages/kodex/lab/effect-foundry/smoke.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab de humo del effect foundry.' },
  { slug: 'geometric-memory', path: 'src/pages/kodex/lab/geometric-memory.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'golden-plates', path: 'src/pages/kodex/lab/golden-plates/index.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'heart-chamber-lab', path: 'src/pages/kodex/lab/heart-chamber/index.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, chamber en otro registro.' },
  { slug: 'heart', path: 'src/pages/kodex/lab/heart.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, chamber HEART esta en KDX-CH-*.' },
  { slug: 'interaction-v0', path: 'src/pages/kodex/lab/interaction-v0/index.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'manifestation-recipe', path: 'src/pages/kodex/lab/manifestation-recipe.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'observe-v2', path: 'src/pages/kodex/lab/observe-v2.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'ocin-authorial', path: 'src/pages/kodex/lab/ocin-authorial/index.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'organism-engine', path: 'src/pages/kodex/lab/organism-engine.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'scene-registry', path: 'src/pages/kodex/lab/scene-registry.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'semantic-ir', path: 'src/pages/kodex/lab/semantic-ir/index.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'semantic-wheel', path: 'src/pages/kodex/lab/semantic-wheel.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'signal-vortex', path: 'src/pages/kodex/lab/signal-vortex.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'temple', path: 'src/pages/kodex/lab/temple.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'threshold-fidelity', path: 'src/pages/kodex/lab/threshold-fidelity/index.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'v0-readiness', path: 'src/pages/kodex/lab/v0-readiness.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
  { slug: 'visible-assembly', path: 'src/pages/kodex/lab/visible-assembly/index.astro', kind: 'lab', status: 'ARCHIVO', reason: 'lab = biblioteca, no corredor.' },
] as const);

/** Cuenta por estado, para reportes y tests. */
export function conteoPorEstado(): Record<EstadoLamina, number> {
  const c: Record<EstadoLamina, number> = { VIVO: 0, HUECO: 0, ARCHIVO: 0, AMBIGUA: 0 };
  for (const e of LAMINA_REGISTRY) c[e.status] += 1;
  return c;
}

/** Todas las laminas montadas en una escena del corredor. */
export function laminasDeEscena(scene: EscenaCorredor): EntradaLamina[] {
  return LAMINA_REGISTRY.filter((e) => e.status === 'VIVO' && e.scene === scene);
}

/** Entrada por slug canonico. */
export function laminaPorSlug(slug: string): EntradaLamina | undefined {
  return LAMINA_REGISTRY.find((e) => e.slug === slug);
}

/** Las que estan bloqueadas esperando decision autoral. */
export function laminasAmbiguas(): EntradaLamina[] {
  return LAMINA_REGISTRY.filter((e) => e.status === 'AMBIGUA');
}
