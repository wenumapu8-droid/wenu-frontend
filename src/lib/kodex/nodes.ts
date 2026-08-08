import { assetUrl } from './volumenes';

export type KodexNodeAccent = 'gold' | 'red' | 'violet' | 'cyan' | 'acid' | 'magenta' | 'indigo' | 'bone';

export interface KodexNodeSpecimen {
  kind: string;
  label: string;
  role?: string;
  src?: string; // Resolved from manifest
}

export interface KodexNodeRelation {
  id: string;
  label: string;
  type: string;
  href?: string;
}

export interface KodexNodeProtocol {
  id: string;
  label: string;
  steps: string[];
}

export interface KodexNodeSource {
  label: string;
  type: string;
  path?: string;
}

export interface KodexNodeAction {
  label: string;
  href: string;
  primary?: boolean;
}

export interface KodexNodeBehavior {
  engine: string;
  tempo: number;
  entropy: number;
  responsiveness: number;
  persistence: number;
  topology: string;
  states?: string[];
  verbs?: string[];
}

/**
 * Clases de claim del canon. Cerradas: son diez, ni una más.
 * Ver canon/KODEX_EPISTEMIC_STANDARD.md.
 */
export type KodexClaimClass =
  | 'OBSERVED'
  | 'DERIVED'
  | 'ESTIMATED'
  | 'PROXY'
  | 'INTERPRETATION'
  | 'TESTIMONY'
  | 'SPECULATION'
  | 'MYTHOPOETIC'
  | 'SYNTHETIC'
  | 'UNKNOWN';

/**
 * Estatus cultural. Gobierna si un nodo puede mostrarse sin revisión previa.
 * Derivado de SENSITIVITY en el Visual Atlas: CRITICAL → AUTHORIZATION_REQUIRED.
 */
export type KodexCulturalStatus =
  | 'STANDARD'
  | 'REVIEW_REQUIRED'
  | 'AUTHORIZATION_REQUIRED';

export interface KodexNodeEpistemic {
  /** Dominios de conocimiento (BIO, PHY, MATH, ANC, REL, SYM…). No son clases de claim. */
  domains?: string[];
  claimClass?: KodexClaimClass;
  culturalStatus?: KodexCulturalStatus;
  /** Lo que la fuente NO permite afirmar. Viaja con el nodo, no en una nota aparte. */
  limitations?: string[];
  /** IDs de claim que sostienen este nodo (CLM-*). */
  claims?: string[];
  /** IDs de fuente trazable (SRC-*). */
  sourceIds?: string[];
}

export interface KodexNode {
  id: string;
  slug: string;
  type: string;
  title: string;
  subtitle?: string;
  status: string;
  mode: string;
  accent: KodexNodeAccent;
  summary: string;
  proposition: string;
  visualAnchor: {
    kind: string;
    label: string;
    role?: string;
    src?: string; // Resolved from manifest
  };
  specimens?: KodexNodeSpecimen[];
  relationships: KodexNodeRelation[];
  symbols: string[];
  protocols: KodexNodeProtocol[];
  sources: KodexNodeSource[];
  behavior: KodexNodeBehavior;
  visibility: string;
  version: string;
  checksum: string;
  provenance?: string;
  /**
   * Capa epistémica. Opcional: los nodos escritos a mano siguen siendo válidos sin ella.
   *
   * El canon (canon/KODEX_EPISTEMIC_STANDARD.md en kodex-minus-infinity) exige que un nodo
   * nunca colapse evidencia, tradición, especulación y construcción autoral en una sola
   * categoría de verdad. Estos campos son el vehículo de esa distinción dentro del código.
   *
   * `claimClass` NUNCA se infiere. Sin evidencia explícita queda 'UNKNOWN'.
   */
  epistemic?: KodexNodeEpistemic;
  editorial?: {
    language: string;
    body: string;
  };
  actions?: KodexNodeAction[];
}

/**
 * Carga todos los nodos de KODEX.
 *
 * Usa `import.meta.glob`, no el filesystem. La versión anterior resolvía el directorio
 * con `new URL('../../data/kodex/nodes', import.meta.url)`, y en build eso apunta al
 * bundle en `dist/`, no a `src/`. El resultado era silencioso y total:
 *
 *     [kodex] No nodes directory found at .../dist/data/kodex/nodes
 *
 * devolvía `[]`, y ninguna ruta de nodo llegó a generarse nunca — tampoco la del nodo
 * original. Se leía como si el enrutado hubiera sido retirado del repo; en realidad el
 * cargador nunca encontró nada. El comentario original ya anticipaba la causa.
 *
 * `import.meta.glob` con `eager` resuelve los JSON en tiempo de compilación, así que
 * funciona igual en dev, en build y en cualquier adaptador.
 *
 * La firma sigue siendo async para no romper a quien ya la espera con `await`.
 */
const NODE_MODULES = import.meta.glob<{ default: KodexNode }>(
  '../../data/kodex/nodes/*.json',
  { eager: true },
);

export async function getKodexNodes(): Promise<KodexNode[]> {
  const nodes = Object.values(NODE_MODULES)
    .map((mod) => mod.default)
    .filter((node): node is KodexNode => Boolean(node?.slug));

  if (nodes.length === 0) {
    console.warn('[kodex] no se cargó ningún nodo desde src/data/kodex/nodes/*.json');
  }
  return nodes.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Gets a specific Kodex node by slug.
 */
export async function getKodexNode(slug: string): Promise<KodexNode | undefined> {
  const nodes = await getKodexNodes();
  return nodes.find((n) => n.slug === slug);
}
