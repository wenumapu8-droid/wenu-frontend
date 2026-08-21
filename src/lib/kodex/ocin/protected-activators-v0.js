export const OCIN_PROTECTED_ACTIVATORS_V0 = Object.freeze({
  'OCN-TOR-001': Object.freeze({
    artworkId: 'OCN-TOR-001',
    title: 'Seed Aperture — White Field',
    series: 'Field Recursions',
    sourceRegistry: 'OCÍN_MASTER_ART_REGISTRY v0.8',
    provenanceStatus: 'SOURCE_LINKED',
    rightsStatus: 'CREATOR_OWNED_REVIEW_REQUIRED',
    publicationStatus: 'NOT_APPROVED_FOR_PUBLIC_EXPORT',
    visualStatus: 'VISUALLY_VERIFIED',
    fullViewRequired: true,
    sourceBytesRenderable: false,
    primaryActivation: 'INWARD_SCALE',
    allowedPresentation: Object.freeze([
      'preserve-aspect',
      'full-view-at-rest',
      'environmental-depth-response',
      'reduced-motion-static',
    ]),
    prohibitedPresentation: Object.freeze(['crop', 'source-recolor', 'source-distortion', 'source-overwrite']),
    alt: 'Black-and-white recursive geometric field with mirrored angular motifs shrinking repeatedly toward a dense central aperture.',
    curatorialNote: 'The authored work already contains a scale transition. KODEX should deepen that existing optical descent while preserving the complete image.',
  }),
  'OCN-SQR-001': Object.freeze({
    artworkId: 'OCN-SQR-001',
    title: 'Open Archive Frame',
    series: 'Orbital Architectures',
    sourceRegistry: 'OCÍN_MASTER_ART_REGISTRY v0.8',
    provenanceStatus: 'SOURCE_LINKED',
    rightsStatus: 'CREATOR_OWNED_REVIEW_REQUIRED',
    publicationStatus: 'NOT_APPROVED_FOR_PUBLIC_EXPORT',
    visualStatus: 'VISUALLY_VERIFIED',
    fullViewRequired: true,
    sourceBytesRenderable: false,
    primaryActivation: 'PERIMETER_TRACE',
    allowedPresentation: Object.freeze([
      'preserve-aspect',
      'full-view-at-rest',
      'environmental-perimeter-trace',
      'reduced-motion-static',
    ]),
    prohibitedPresentation: Object.freeze(['crop', 'source-recolor', 'source-distortion', 'source-overwrite']),
    alt: 'Black geometric square border built from mirrored hooked modules surrounding a large empty white center.',
    curatorialNote: 'The authored void behaves as a receptive chamber. The runtime may trace around the frame, but it must never turn the work into a generic UI border.',
  }),
  'OCN-MND-GRY-002': Object.freeze({
    artworkId: 'OCN-MND-GRY-002',
    title: 'Grey Petal Aperture — Star Core',
    series: 'Pale Lattices',
    sourceRegistry: 'OCÍN_MASTER_ART_REGISTRY v0.8',
    provenanceStatus: 'SOURCE_LINKED',
    rightsStatus: 'CREATOR_OWNED_REVIEW_REQUIRED',
    publicationStatus: 'PRIVATE_ARCHIVE_NOT_APPROVED_FOR_PUBLIC_EXPORT',
    visualStatus: 'VISUALLY_VERIFIED',
    fullViewRequired: true,
    sourceBytesRenderable: false,
    primaryActivation: 'APERTURE_BREATH',
    allowedPresentation: Object.freeze([
      'preserve-aspect',
      'full-view-at-rest',
      'environmental-opacity-breath',
      'reduced-motion-static',
    ]),
    prohibitedPresentation: Object.freeze(['crop', 'source-recolor', 'source-distortion', 'source-overwrite']),
    alt: 'Pale grey radial flower with six layered petals and a small star-like center floating in a large white field.',
    curatorialNote: 'Silence and white field are structural. KODEX should lower information density and let the surrounding environment breathe rather than cover the work.',
  }),
});

export const OCIN_PROTECTED_ACTIVATOR_IDS = Object.freeze(Object.keys(OCIN_PROTECTED_ACTIVATORS_V0));

export function getProtectedOcinActivator(artworkId) {
  return OCIN_PROTECTED_ACTIVATORS_V0[artworkId] || null;
}

export function validateProtectedOcinActivator(record) {
  if (!record) return { valid: false, reasons: ['missing-record'] };
  const reasons = [];
  if (!record.fullViewRequired) reasons.push('full-view-not-required');
  if (record.sourceBytesRenderable) reasons.push('private-source-bytes-renderable');
  if (!record.primaryActivation) reasons.push('missing-primary-activation');
  if ((record.prohibitedPresentation || []).includes('crop') === false) reasons.push('crop-not-prohibited');
  if (record.provenanceStatus !== 'SOURCE_LINKED') reasons.push('provenance-not-linked');
  return { valid: reasons.length === 0, reasons };
}
