import {
  HOLOCORE_RGX_PROFILE_IDS,
  resolveHoloCoreRGXProfile,
} from '../../kodex/holocore/reference-profiles/rgx-family.js';

const RGX_IDS = new Set(HOLOCORE_RGX_PROFILE_IDS);

const PHASE_RGX_FALLBACK = Object.freeze({
  POTENTIAL: 'source-chamber',
  SIGNAL: 'signal-core',
  INTERFERENCE: 'interference-portal',
  TRANSFORMING: 'signal-vortex',
  REALIZED: 'living-organism',
  TRACE: 'memory-tree',
});

/**
 * Bridge a Manifestation view to the verified RGX profile family.
 *
 * The Manifestation Engine remains authoritative for causal state and authored
 * node mapping. This adapter only selects an RGX rendering profile. It never
 * accepts the RGX registry's generic ORBITAL CITY fallback as an authored node
 * assignment: unsupported ids fall back to the explicit phase grammar.
 */
export function resolveManifestationRGXVisual(view = {}) {
  const phase = String(view.phase || 'POTENTIAL').toUpperCase();
  const requestedId = String(view.visualSpecimenId || '');
  const fallbackId = PHASE_RGX_FALLBACK[phase] || PHASE_RGX_FALLBACK.POTENTIAL;
  const specimenId = RGX_IDS.has(requestedId) ? requestedId : fallbackId;
  const profile = resolveHoloCoreRGXProfile(specimenId);

  return Object.freeze({
    specimenId,
    profile,
    requestedId: requestedId || null,
    source: RGX_IDS.has(requestedId) ? 'MANIFESTATION_VIEW' : 'PHASE_RGX_FALLBACK',
  });
}

export const MANIFESTATION_RGX_PHASE_MAP = PHASE_RGX_FALLBACK;
