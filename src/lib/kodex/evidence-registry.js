// KODEX−∞ · V0 evidence registry
// Source basis: KODEX_RESEARCH_DOSSIER_MASTER / KDX-RSCH-005, 006, 015.
// This file does not promote research into canon. It exposes source-backed
// evidence with explicit knowledge class, limitations and KODEX translation.

export const KODEX_EVIDENCE_SOURCES = Object.freeze({
  'KDX-RSCH-005': Object.freeze({
    id: 'KDX-RSCH-005',
    title: 'Temporal & Multilayer Graphs',
    epistemicStatus: 'VERIFIED_SOURCE_PACKET',
    knowledgeClass: 'REALITY_MODEL',
    productionReady: true,
    claims: [
      'In temporal networks, event order changes which paths and propagation are possible.',
      'Multilayer networks formalize systems in which the same node participates in multiple relation layers.',
      'Spreading activation is an established model of semantic memory in which activation propagates and decays across a network.',
    ],
    limitations: [
      'A graph is a model of memory relations, not a literal anatomical claim about human memory.',
      'Temporal-graph metrics are not a mystical description of consciousness.',
    ],
    sources: [
      { label: 'Kivelä et al. (2014) — Multilayer networks', href: 'https://doi.org/10.1093/comnet/cnu016' },
      { label: 'Holme & Saramäki (2012) — Temporal networks', href: 'https://arxiv.org/abs/1108.1780' },
      { label: 'Collins & Loftus (1975) — Spreading activation', href: 'https://doi.org/10.1037/0033-295X.82.6.407' },
    ],
  }),
  'KDX-RSCH-006': Object.freeze({
    id: 'KDX-RSCH-006',
    title: 'Memory + Privacy Architecture',
    epistemicStatus: 'VERIFIED_SOURCE_PACKET',
    knowledgeClass: 'REALITY_MODEL',
    productionReady: true,
    claims: [
      'Local-first software treats the local copy as primary and cloud synchronization as secondary.',
      'Data minimization, retention limits and deletion are design constraints rather than hidden implementation details.',
    ],
    limitations: [
      'Local-first does not eliminate security or privacy risk.',
      'Telemetry still requires an explicit policy and consent boundary.',
    ],
    sources: [
      { label: 'Kleppmann et al. (2019) — Local-first software', href: 'https://doi.org/10.1145/3359591.3359737' },
      { label: 'GDPR — Regulation (EU) 2016/679', href: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj' },
    ],
  }),
  'KDX-RSCH-015': Object.freeze({
    id: 'KDX-RSCH-015',
    title: 'Archive & Living Memory / OAIS',
    epistemicStatus: 'VERIFIED_SOURCE_PACKET',
    knowledgeClass: 'REALITY',
    productionReady: true,
    claims: [
      'OAIS separates what enters an archive, what is preserved, and what is served to a user.',
      'Preservation metadata includes provenance, integrity/fixity and rights information.',
    ],
    limitations: [
      'OAIS is a reference model, not preservation software and not a guarantee of permanent preservation.',
    ],
    sources: [
      { label: 'Lavoie (2014) — OAIS Reference Model Introductory Guide', href: 'https://www.dpconline.org/docs/technology-watch-reports/1359-dpctw14-02/file' },
    ],
  }),
});

export const KODEX_EVIDENCE_RELATIONS = Object.freeze([
  Object.freeze({
    id: 'KDX-REL-MEMORY-TEMPORAL-001',
    from: 'KDX-CON-MEMORY',
    to: 'KDX-RSCH-005',
    relation: 'MODELED_BY',
    layer: 'scientific-model',
    statement: 'KODEX may model remembered routes as a temporal multilayer graph because sequence and relation layer are first-order structure in those models.',
    boundary: 'KODEX translation; does not claim that human memory literally is a graph.',
  }),
  Object.freeze({
    id: 'KDX-REL-MEMORY-PRIVACY-001',
    from: 'KDX-CON-MEMORY',
    to: 'KDX-RSCH-006',
    relation: 'CONSTRAINED_BY',
    layer: 'privacy-architecture',
    statement: 'Journey memory should be minimal, inspectable and local-first before any optional synchronization layer.',
    boundary: 'Architecture policy; does not claim perfect privacy.',
  }),
  Object.freeze({
    id: 'KDX-REL-ARCHIVE-OAIS-001',
    from: 'KDX-SCN-03',
    to: 'KDX-RSCH-015',
    relation: 'ARCHITECTURE_INFORMED_BY',
    layer: 'archive-model',
    statement: 'ARCHIVE can preserve source/master records separately from the derivatives rendered into the experience.',
    boundary: 'OAIS-inspired implementation, not a claim that KODEX is ISO-certified.',
  }),
]);

export function evidenceFor(targetId) {
  return KODEX_EVIDENCE_RELATIONS
    .filter((relation) => relation.from === targetId || relation.to === targetId)
    .map((relation) => ({
      ...relation,
      source: KODEX_EVIDENCE_SOURCES[relation.to] || null,
    }));
}

export function validateEvidenceRegistry() {
  const errors = [];
  for (const relation of KODEX_EVIDENCE_RELATIONS) {
    if (!relation.id || !relation.from || !relation.to || !relation.relation) {
      errors.push(`malformed relation: ${relation.id || 'UNKNOWN'}`);
    }
    const source = KODEX_EVIDENCE_SOURCES[relation.to];
    if (!source) errors.push(`${relation.id}: missing source ${relation.to}`);
    if (source && (!source.limitations?.length || !source.sources?.length)) {
      errors.push(`${source.id}: source packet must expose limitations and citations`);
    }
  }
  return { valid: errors.length === 0, errors, sources: Object.keys(KODEX_EVIDENCE_SOURCES).length, relations: KODEX_EVIDENCE_RELATIONS.length };
}
