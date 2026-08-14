export type KodexInteractionRole =
  | 'REVEAL'
  | 'TRANSFORM'
  | 'TRACE'
  | 'COMPARE'
  | 'NAVIGATE'
  | 'ORIENT'
  | 'ANNOTATE'
  | 'CONTRIBUTE'
  | 'CONTEMPLATE';

export interface KodexInteractionEventDetail {
  id: string;
  interactionId: string;
  nodeId: string;
  role: KodexInteractionRole;
  semanticTarget: string;
  stateBefore: string;
  stateAfter: string;
  writesToMemory: boolean;
  sourceIds: string[];
  claimIds: string[];
  createdAt: number;
}

export const KODEX_INTERACTION_EVENT = 'kodex:interaction' as const;

export function createKodexInteractionEvent(
  detail: Omit<KodexInteractionEventDetail, 'id' | 'createdAt'>,
): CustomEvent<KodexInteractionEventDetail> {
  const createdAt = Date.now();
  const id = `${detail.nodeId}:${detail.interactionId}:${createdAt}`;

  return new CustomEvent<KodexInteractionEventDetail>(KODEX_INTERACTION_EVENT, {
    bubbles: true,
    composed: true,
    detail: {
      ...detail,
      id,
      createdAt,
      sourceIds: [...new Set(detail.sourceIds)],
      claimIds: [...new Set(detail.claimIds)],
    },
  });
}

export function isMeaningfulKodexInteraction(
  detail: KodexInteractionEventDetail,
): boolean {
  if (!detail.writesToMemory) return false;

  return (
    detail.stateBefore !== detail.stateAfter ||
    detail.sourceIds.length > 0 ||
    detail.claimIds.length > 0 ||
    ['NAVIGATE', 'ANNOTATE', 'CONTRIBUTE'].includes(detail.role)
  );
}
