import {
  HOLOCORE_NODE_MAP,
  resolveHoloCoreForNode,
} from '../../kodex/holocore/registry.js';

/**
 * Resolve the visual specimen for a manifestation view.
 *
 * Intermediate causal phases keep their phase-level HoloCore grammar.
 * REALIZED may become node-specific only when the node has an explicit
 * HoloCore registry mapping. Unknown nodes never inherit the registry's
 * generic fallback as if it were an authored mapping.
 */
export function resolveManifestationVisual(view = {}) {
  const phaseSpecimenId = String(view.visualSpecimenId || 'source-chamber');
  const nodeId = String(view.nodeId || '');
  const isExplicitNodeMapping = Boolean(nodeId && HOLOCORE_NODE_MAP[nodeId]);

  if (view.phase === 'REALIZED' && isExplicitNodeMapping) {
    const specimen = resolveHoloCoreForNode(nodeId);
    return Object.freeze({
      specimenId: specimen.id,
      source: 'NODE_MAP',
      nodeId,
    });
  }

  return Object.freeze({
    specimenId: phaseSpecimenId,
    source: 'PHASE_MAP',
    nodeId: nodeId || null,
  });
}
