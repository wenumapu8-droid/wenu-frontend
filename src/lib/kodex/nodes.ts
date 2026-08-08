/**
 * src/lib/kodex/nodes.ts — Node loading, indexing, and epistemic layer.
 * 
 * Canon: Exact 10 closed KodexClaimClass values. Never inferred; defaults to UNKNOWN.
 * Loading fix: Uses import.meta.glob with eager: true to resolve JSON at build time.
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

export type KodexCulturalStatus =
  | 'CANONICAL'
  | 'DOCUMENTED'
  | 'HYPOTHESIS'
  | 'NEEDS_CULTURAL_REVIEW'
  | 'STANDARD';

export type RelationshipValidity =
  | 'CANONICAL'
  | 'VALID'
  | 'HYPOTHESIS'
  | 'NEEDS_CULTURAL_REVIEW';

export interface NodeRelationship {
  id: string;
  label: string;
  type: string;
  descriptor?: string;
  validity: RelationshipValidity;
}

export interface NodeVisualAnchor {
  kind: string;
  label: string;
  role?: string;
}

export interface NodeBehavior {
  engine?: string;
  tempo?: number;
  entropy?: number;
  responsiveness?: number;
  persistence?: number;
  topology?: string;
}

export interface EpistemicLayer {
  domains?: string[];
  claimClass?: KodexClaimClass;
  culturalStatus?: KodexCulturalStatus;
  limitations?: string[];
  claims?: string[];
  sourceIds?: string[];
}

export interface KodexNode {
  $schema?: string;
  id: string;
  slug: string;
  type: string;
  title: string;
  subtitle?: string;
  status: string;
  mode?: string;
  accent?: string;
  summary?: string;
  proposition?: string;
  visualAnchor?: NodeVisualAnchor;
  symbols?: string[];
  relationships?: NodeRelationship[];
  protocols?: string[];
  sources?: string[];
  behavior?: NodeBehavior;
  visibility?: string;
  version?: string;
  checksum?: string;
  epistemic?: EpistemicLayer;
  atlasStatus?: string;
  pending?: string[];
  publishable?: boolean;
}

// Hallazgo b fix: import.meta.glob with eager loading for Astro SSG build
const nodeModules = import.meta.glob<{ default: KodexNode }>(
  '../../data/kodex/nodes-atlas/*.json',
  { eager: true }
);

let cachedNodes: KodexNode[] | null = null;

export function getKodexNodes(): KodexNode[] {
  if (cachedNodes) return cachedNodes;

  const nodes: KodexNode[] = [];
  for (const path in nodeModules) {
    const mod = nodeModules[path];
    if (mod) {
      const node = (mod.default || mod) as KodexNode;
      if (node && node.id) {
        if (!node.epistemic) {
          node.epistemic = { claimClass: 'UNKNOWN' };
        } else if (!node.epistemic.claimClass) {
          node.epistemic.claimClass = 'UNKNOWN';
        }
        nodes.push(node);
      }
    }
  }

  cachedNodes = nodes;
  return nodes;
}

export function getNodeBySlug(slug: string): KodexNode | undefined {
  return getKodexNodes().find(node => node.slug === slug);
}

export function getNodesByClaimClass(claimClass: KodexClaimClass): KodexNode[] {
  return getKodexNodes().filter(node => node.epistemic?.claimClass === claimClass);
}

export function getNodesByDomain(domain: string): KodexNode[] {
  return getKodexNodes().filter(node => node.epistemic?.domains?.includes(domain));
}
