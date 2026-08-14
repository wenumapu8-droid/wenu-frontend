export const CORE_SCENE_ORDER = Object.freeze([
  'threshold', 'prologue', 'descent', 'archive', 'machine', 'cosmology', 'return',
]);

const scene = (value) => Object.freeze(value);

export const KODEX_SCENES = Object.freeze({
  threshold: scene({
    id: 'KDX-SCN-00', key: 'threshold', index: 0, role: 'core', status: 'CANONICAL',
    label: 'THRESHOLD', narrativeRole: 'voluntary-entry', density: 1,
    href: '/kodex/', worlds: ['signal', 'potential'], next: ['prologue'],
    memoryEvents: ['threshold_seen', 'threshold_crossed', 'threshold_returned'],
    renderer: { motion: 'living-membrane', reduced: 'static-aperture', fallback: 'svg-dom' },
  }),
  prologue: scene({
    id: 'KDX-SCN-01', key: 'prologue', index: 1, role: 'core', status: 'CANONICAL',
    label: 'PROLOGUE', narrativeRole: 'first-transmission', density: 2,
    href: '/kodex/folio/i/', worlds: ['signal', 'observer'], next: ['descent'],
    memoryEvents: ['prologue_seen', 'transmission_received'],
    renderer: { motion: 'interference', reduced: 'type-stabilization', fallback: 'svg-dom' },
  }),
  descent: scene({
    id: 'KDX-SCN-02', key: 'descent', index: 2, role: 'core', status: 'CANONICAL',
    label: 'DESCENT', narrativeRole: 'depth-and-instability', density: 3,
    href: '/kodex/folio/ii/', worlds: ['potential', 'biology', 'cosmos', 'consciousness'], next: ['archive'],
    memoryEvents: ['descent_entered', 'depth_changed'],
    renderer: { motion: 'domain-warp', reduced: 'stacked-depth', fallback: 'svg-dom' },
  }),
  archive: scene({
    id: 'KDX-SCN-03', key: 'archive', index: 3, role: 'core', status: 'CANONICAL',
    label: 'ARCHIVE', narrativeRole: 'traceable-memory', density: 3,
    href: '/kodex/folio/iii/', worlds: ['memory', 'ocin', 'culture', 'biology'], next: ['machine'],
    memoryEvents: ['archive_entered', 'artifact_opened', 'relation_followed'],
    renderer: { motion: 'index-reveal', reduced: 'static-index', fallback: 'html-svg' },
  }),
  machine: scene({
    id: 'KDX-SCN-04', key: 'machine', index: 4, role: 'core', status: 'CANONICAL',
    label: 'MACHINE', narrativeRole: 'visible-transformation-logic', density: 4,
    href: '/kodex/folio/iv/', worlds: ['machine', 'signal', 'network'], next: ['cosmology'],
    memoryEvents: ['machine_entered', 'protocol_run'],
    renderer: { motion: 'state-driven', reduced: 'discrete-state', fallback: 'html-svg' },
  }),
  cosmology: scene({
    id: 'KDX-SCN-05', key: 'cosmology', index: 5, role: 'core', status: 'CANONICAL',
    label: 'COSMOLOGY', narrativeRole: 'large-scale-relations', density: 2,
    href: '/kodex/folio/v/', worlds: ['cosmos', 'network', 'signal'], next: ['return'],
    memoryEvents: ['cosmology_entered', 'relation_mapped'],
    renderer: { motion: 'orbital-drift', reduced: 'static-field-map', fallback: 'svg' },
  }),
  return: scene({
    id: 'KDX-SCN-06', key: 'return', index: 6, role: 'core', status: 'CANONICAL',
    label: 'RETURN', narrativeRole: 'reintegration-not-reset', density: 1,
    href: '/kodex/folio/vi/', worlds: ['memory', 'return'], next: ['threshold'],
    memoryEvents: ['return_started', 'route_signature_created', 'return_completed'],
    renderer: { motion: 'trace-assembly', reduced: 'structural-remap', fallback: 'svg' },
  }),
});

export const KODEX_ORBITALS = Object.freeze({
  observer: scene({ id: 'KDX-ORB-01', key: 'observer', role: 'orbital', status: 'CANONICAL_NODE', label: 'OBSERVER', routingStatus: 'SCENE_DEPENDENT', worlds: ['observer', 'consciousness'], affinity: ['prologue', 'descent', 'cosmology'] }),
  heart: scene({ id: 'KDX-ORB-02', key: 'heart', role: 'orbital', status: 'CANONICAL_NODE', label: 'HEART', routingStatus: 'SCENE_DEPENDENT', worlds: ['body', 'memory', 'orientation'], affinity: ['descent', 'archive', 'cosmology', 'return'] }),
  'digital-altar': scene({ id: 'KDX-ORB-03', key: 'digital-altar', role: 'orbital', status: 'CANONICAL_NODE', label: 'DIGITAL ALTAR', routingStatus: 'SCENE_DEPENDENT', worlds: ['memory', 'contribution'], affinity: ['archive', 'return'] }),
  'signal-temple': scene({ id: 'KDX-ORB-04', key: 'signal-temple', role: 'orbital', status: 'CANONICAL_NODE', label: 'SIGNAL TEMPLE', routingStatus: 'SCENE_DEPENDENT', worlds: ['memory', 'machine', 'signal'], affinity: ['machine', 'cosmology', 'return'] }),
  gaia: scene({ id: 'KDX-ORB-05', key: 'gaia', role: 'orbital', status: 'CANONICAL_VISUAL_MODE', label: 'GAIA / LIVING FIELD', routingStatus: 'NEEDS_SCENE_PLACEMENT', worlds: ['biology', 'earth'], affinity: ['archive', 'cosmology'] }),
});

export const FOLIO_TO_SCENE = Object.freeze({ i: 'prologue', ii: 'descent', iii: 'archive', iv: 'machine', v: 'cosmology', vi: 'return' });

export function getSceneDefinition(key) {
  return KODEX_SCENES[key] || KODEX_ORBITALS[key] || null;
}

export function resolveSceneId({ pathname = '', hash = '', elementId = '' } = {}) {
  const candidate = String(elementId || hash || '').replace(/^#/, '').toLowerCase();
  if (KODEX_SCENES[candidate]) return candidate;
  const match = pathname.match(/\/kodex\/folio\/(i{1,3}|iv|v|vi)\/?$/i);
  if (match) return FOLIO_TO_SCENE[match[1].toLowerCase()] || null;
  if (/\/kodex\/?$/.test(pathname)) return 'threshold';
  return null;
}

export function getSceneCandidates(currentKey, { includeOrbitals = false } = {}) {
  const current = KODEX_SCENES[currentKey];
  if (!current) return [];
  const core = current.next.map((key) => ({ ...KODEX_SCENES[key], transitionClass: 'CANONICAL' }));
  if (!includeOrbitals) return core;
  const orbitals = Object.values(KODEX_ORBITALS)
    .filter((node) => node.affinity.includes(currentKey))
    .map((node) => ({ ...node, transitionClass: 'SCENE_DEPENDENT' }));
  return [...core, ...orbitals];
}

export function validateSceneRegistry() {
  const errors = [];
  const core = Object.values(KODEX_SCENES);
  if (core.length !== 7) errors.push(`expected 7 core scenes, found ${core.length}`);
  const indexes = new Set();
  const ids = new Set();
  for (const item of [...core, ...Object.values(KODEX_ORBITALS)]) {
    if (ids.has(item.id)) errors.push(`duplicate id ${item.id}`);
    ids.add(item.id);
    if (item.role === 'core') {
      if (indexes.has(item.index)) errors.push(`duplicate core index ${item.index}`);
      indexes.add(item.index);
      if (!item.href) errors.push(`${item.key} has no href`);
      for (const next of item.next) if (!KODEX_SCENES[next]) errors.push(`${item.key} -> missing ${next}`);
    }
  }
  for (let i = 0; i < 7; i += 1) if (!indexes.has(i)) errors.push(`missing core index ${i}`);
  return { valid: errors.length === 0, errors, coreCount: core.length, orbitalCount: Object.keys(KODEX_ORBITALS).length };
}
