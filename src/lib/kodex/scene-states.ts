/**
 * src/lib/kodex/scene-states.ts — Cross-visit relationship axis & mutation bound.
 * 
 * Reconciles the two orthogonal axes of KODEX:
 * 1. Single-visit state (estado.ts): idle -> aware -> locked -> active -> transitionOut
 * 2. Cross-visit relationship (blueprint): dormant -> aware -> resonant -> mutated -> remembered
 * 
 * Rule: Memory mutation is strictly bounded to a ceiling of 0.35 max.
 */

export type RelationshipState =
  | 'dormant'
  | 'aware'
  | 'resonant'
  | 'mutated'
  | 'remembered';

export interface SceneAxisState {
  visitState: string;            // From single-visit machine (idle..transitionOut)
  relationshipState: RelationshipState; // Across visits
  returnCount: number;
  memoryWeight: number;          // 0..1
  mutationAmount: number;        // 0..0.35 hard ceiling
}

/**
 * Hard ceiling of 0.35 for memory alteration.
 * "La memoria debe alterar de forma pequeña pero perceptible, nunca deformar la obra."
 */
export const MAX_MUTATION_CEILING = 0.35;

export function mutationAmount(memoryWeight: number): number {
  if (typeof memoryWeight !== 'number' || isNaN(memoryWeight)) return 0;
  const raw = memoryWeight * MAX_MUTATION_CEILING;
  return Number(Math.min(MAX_MUTATION_CEILING, Math.max(0, raw)).toFixed(3));
}

export function getRelationshipState(returnCount: number, memoryWeight: number): RelationshipState {
  if (returnCount <= 0) return 'dormant';
  if (returnCount === 1) return 'aware';
  if (returnCount <= 3) return 'resonant';
  if (returnCount <= 7 || memoryWeight > 0.5) return 'mutated';
  return 'remembered';
}

export function computeSceneAxisState(
  visitState: string,
  returnCount: number,
  memoryWeight: number
): SceneAxisState {
  const mut = mutationAmount(memoryWeight);
  const rel = getRelationshipState(returnCount, memoryWeight);

  return {
    visitState: visitState || 'idle',
    relationshipState: rel,
    returnCount: Math.max(0, returnCount),
    memoryWeight: Math.max(0, Math.min(1, memoryWeight)),
    mutationAmount: mut,
  };
}
