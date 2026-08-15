import type { KodexOrganismActionEventDetail } from './runtime/journey-memory-bridge';

export interface ManifestationTraceView {
  intentId: string | null;
  nodeId: string | null;
  phase: string;
  traced: boolean;
  traceLength?: number;
}

/**
 * Translate a completed manifestation TRACE into the existing semantic
 * organism-action memory contract. This does not create storage and does not
 * preserve wall-clock timing; JourneyState remains the only persisted route
 * memory authority.
 */
export function manifestationTraceToJourneyAction(
  view: ManifestationTraceView,
): KodexOrganismActionEventDetail | null {
  if (!view.traced || view.phase !== 'TRACE' || !view.intentId) return null;

  const memoryWrites = [
    `manifestation:${view.intentId}:realized`,
    view.nodeId ? `manifestation-node:${view.nodeId}` : null,
  ].filter((value): value is string => Boolean(value));

  return {
    id: `manifestation:${view.intentId}:trace:${Math.max(0, Number(view.traceLength) || 0)}`,
    createdAt: 0,
    presetId: 'manifestation-state-v0.1.0',
    family: 'MANIFESTATION',
    action: 'WRITE_TRACE',
    memoryWrites,
  };
}
