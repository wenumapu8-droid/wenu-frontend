export const orbitalCityRGXProfile = Object.freeze({
  id: 'orbital-city-rgx-v1',
  conceptId: 'orbital-city',
  title: 'ORBITAL CITY',
  renderMode: 'REFERENCE-GROUNDED ASCII + VECTOR SCAFFOLD',
  epistemicStatus: 'SPECULATIVE',
  sourceStatus: 'VISUAL_REFERENCE + MACHINE_REFERENCE',
  sourceRefs: Object.freeze([
    'CURRENT_CONVERSATION:CIUDAD_AEREA_ORBITAL_REFERENCE',
    'DRIVE_ATLAS:KDX-ROOT-RAW-009:ASCII_REACTOR_ENERGY_CORE',
  ]),
  loopSeconds: 24,
  axisX: 0.5,
  // Values below are normalized viewport coordinates. They are not physical
  // dimensions. Their purpose is to preserve the hierarchy and relative
  // topology of the reference plate inside a bounded runtime.
  layers: Object.freeze([
    Object.freeze({ id: 'atmosphere', type: 'cloud', y: 0.14, rx: 0.31, ry: 0.075, weight: 0.42 }),
    Object.freeze({ id: 'crown', type: 'ring', y: 0.255, rx: 0.12, ry: 0.026, nodes: 4, weight: 0.72 }),
    Object.freeze({ id: 'upper-platforms', type: 'ring', y: 0.355, rx: 0.27, ry: 0.055, nodes: 8, weight: 0.9 }),
    Object.freeze({ id: 'mid-platforms', type: 'ring', y: 0.47, rx: 0.23, ry: 0.046, nodes: 6, weight: 0.82 }),
    Object.freeze({ id: 'habitat-ring', type: 'habitat', y: 0.61, rx: 0.365, ry: 0.082, nodes: 16, spokes: 16, weight: 1 }),
    Object.freeze({ id: 'service-orbit', type: 'ring', y: 0.755, rx: 0.265, ry: 0.052, nodes: 8, weight: 0.86 }),
    Object.freeze({ id: 'lower-interface', type: 'ring', y: 0.835, rx: 0.135, ry: 0.03, nodes: 5, weight: 0.72 }),
    Object.freeze({ id: 'planetary-interface', type: 'planet', y: 0.965, rx: 0.53, ry: 0.13, weight: 0.62 }),
  ]),
  density: Object.freeze({
    desktopCellPx: 6,
    mobileCellPx: 7,
    targetDesktopColumnsAt1440: 240,
    glyphSet: 'micro',
    ditherStrength: 0.34,
  }),
});

export function profileToField(layer) {
  return Object.freeze({
    ...layer,
    cx: orbitalCityRGXProfile.axisX * 2 - 1,
    cy: layer.y * 2 - 1,
    rx: layer.rx * 2,
    ry: layer.ry * 2,
  });
}
