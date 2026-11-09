import elementRegistry from './kdx_element_registry.v0.1.json' with { type: 'json' };

export const KDX_PLATE_RENDER_MODEL_PROFILE = Object.freeze({
  version: 'plate-render-model-v0.1.0',
  status: 'IMPLEMENTED_CANDIDATE',
  browserValidated: false,
  purpose: 'Compile validated PlateSpec into a renderer-safe view model using registered IDs only.',
});

const ELEMENTS = new Map(elementRegistry.elements.map((element) => [element.element_id, element]));
const PLATE_TYPES = new Set(['KNOWLEDGE_PLATE', 'JUNCTION_PLATE', 'ACTIVATOR_PLATE']);

export class KdxRenderModelError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = 'KdxRenderModelError';
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}

function requireElement(id, plateType, sceneState) {
  const element = ELEMENTS.get(id);
  if (!element) throw new KdxRenderModelError('UNREGISTERED_ELEMENT', `Renderer cannot resolve element ${id}.`, { id });
  if (!element.allowed_plate_types?.includes(plateType)) {
    throw new KdxRenderModelError('PLATE_ELEMENT_MISMATCH', `${id} is not allowed on ${plateType}.`, { id, plateType });
  }
  if (!element.allowed_scene_roles?.includes(sceneState)) {
    throw new KdxRenderModelError('SCENE_ELEMENT_MISMATCH', `${id} is not allowed in ${sceneState}.`, { id, sceneState });
  }
  return element;
}

export function compilePlateRenderModel(spec) {
  if (!spec || typeof spec !== 'object') throw new KdxRenderModelError('INVALID_SPEC', 'PlateSpec object required.');
  if (!PLATE_TYPES.has(spec.plate_type)) throw new KdxRenderModelError('INVALID_PLATE_TYPE', `Unsupported plate type ${spec.plate_type}.`);
  if (spec.responsive_profile?.primary_shell !== '100dvh') {
    throw new KdxRenderModelError('VIEWPORT_CONTRACT_BLOCK', 'Renderer requires primary_shell=100dvh.');
  }

  const slots = (spec.slots || []).map((slot) => {
    if (!slot.element_id) {
      if (slot.required) throw new KdxRenderModelError('REQUIRED_SLOT_EMPTY', `Required slot ${slot.slot_id} has no element_id.`);
      return Object.freeze({ ...slot, element: null });
    }
    return Object.freeze({ ...slot, element: requireElement(slot.element_id, spec.plate_type, spec.scene_state) });
  });

  const motion = (spec.motion_profile?.element_ids || []).map((id) => requireElement(id, spec.plate_type, spec.scene_state));
  const artwork = spec.artwork_contract
    ? Object.freeze({
        artwork_id: spec.artwork_contract.artwork_id,
        render_source_bytes: spec.artwork_contract.source_bytes_renderable === true,
        object_fit: 'contain',
        preserve_aspect: true,
        crop_allowed: false,
        recolor_allowed: false,
        distort_allowed: false,
      })
    : null;

  if (spec.plate_type === 'ACTIVATOR_PLATE' && spec.primary_payload?.payload_type === 'ARTWORK' && !artwork) {
    throw new KdxRenderModelError('ARTWORK_CONTRACT_REQUIRED', 'Artwork activator cannot render without artwork_contract.');
  }

  return Object.freeze({
    render_id: `RENDER-${spec.plate_id}`,
    plate_id: spec.plate_id,
    plate_type: spec.plate_type,
    scene_state: spec.scene_state,
    semantic_node: spec.semantic_node,
    macro_signal: spec.macro_signal,
    communication_mode: spec.communication_mode,
    primary_payload: Object.freeze({ ...spec.primary_payload }),
    slots: Object.freeze(slots),
    motion: Object.freeze(motion),
    route_slate: Object.freeze((spec.route_slate || []).map((route) => Object.freeze({ ...route }))),
    artwork,
    activation_profile: spec.activation_profile ? Object.freeze({ ...spec.activation_profile }) : null,
    provenance_refs: Object.freeze([...(spec.provenance_refs || [])]),
    shell: Object.freeze({ height: '100dvh', page_scroll: false }),
    accessibility: Object.freeze({
      keyboard_required: spec.qa_requirements?.includes('KEYBOARD') === true,
      focus_required: spec.qa_requirements?.includes('FOCUS') === true,
      reduced_motion_required: spec.qa_requirements?.includes('REDUCED_MOTION') === true,
      motion_required_for_meaning: false,
    }),
    evidence: Object.freeze({
      render_status: 'NOT_RUN',
      browser_validated: false,
      human_curator_acceptance: 'NOT_RUN',
    }),
  });
}
