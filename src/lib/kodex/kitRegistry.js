// KODEX−∞ Kit Protocol — central machine-readable registry.
// Un KIT = MODULO + CONTRATO + EJEMPLO + FALLBACK/ACCEPTANCE, y se indexa acá.
// REGLA DURA (COWORK): REUSAR, NUNCA REINVENTAR. Si un módulo está en este registry,
// se importa desde su path único; prohibido re-implementarlo en una escena.
// Schema: kdx.kit-registry.v1
import { KODEX_EFFECTS, effectById } from './effectFoundry.js';
import { EFFECT_SCENE_CANDIDATES } from './effectRecipes.js';

export const KIT_REGISTRY_SCHEMA = 'kdx.kit-registry.v1';

// Componentes reusables del subtree KODEX. Cada entrada es un KIT con sus 4 piezas.
const KITS = Object.freeze({
  'kodex-effect-canvas': {
    id: 'kodex-effect-canvas',
    kind: 'component',
    path: 'src/components/kodex/effects/KodexEffectCanvas.astro',
    purpose: 'Render any KDX-FX effect from a source image or generated seed organism, with optional animation and pointer interaction.',
    pieces: {
      module: 'src/components/kodex/effects/KodexEffectCanvas.astro',
      contract: 'src/lib/kodex/effectFoundry.js + src/lib/kodex/effectRecipes.js',
      example: 'src/pages/kodex/lab/effect-foundry/smoke.astro',
      fallbackAcceptance: 'effectFoundryRuntime.js drawSeedOrganism() + prefers-reduced-motion guard',
    },
    props: ['effectId', 'src', 'alt', 'class', 'width', 'height', 'animate', 'interactive', 'params', 'runtimeMap'],
    scenes: ['ARCHIVE', 'MACHINE', 'COSMOLOGY', 'DESCENT', 'RETURN', 'PROLOGUE'],
  },
});

// Efectos del Foundry, ya indexados por el runtime. Se exponen tal cual (no se inventan).
export const KODEX_EFFECT_REGISTRY = Object.freeze(
  KODEX_EFFECTS.map((effect) => ({
    id: effect.id,
    slug: effect.slug,
    name: effect.name,
    family: effect.family,
    status: effect.status,
    scenes: effect.scenes,
    purpose: effect.purpose,
    implementation: effect.implementation,
    fallback: effect.fallback,
    parameters: effect.parameters.map((p) => ({ key: p.key, label: p.label, min: p.min, max: p.max, step: p.step, value: p.value })),
  })),
);

// Escenas → candidatos PROPOSED (no canon). Fuente: effectRecipes.js.
export const KODEX_SCENE_KIT_CANDIDATES = Object.freeze(EFFECT_SCENE_CANDIDATES);

// Índice maestro: qué KIT/efecto usa cada escena (TODO: candidatos hasta frontier re-audit).
export function kitIndex() {
  const byId = Object.fromEntries(KODEX_EFFECT_REGISTRY.map((e) => [e.id, e]));
  return {
    schema: KIT_REGISTRY_SCHEMA,
    components: KITS,
    effects: byId,
    sceneCandidates: EFFECT_SCENE_CANDIDATES,
  };
}

// KIT MANIFEST por escena: qué módulo usa cada lámina del recorrido, con su
// contrato (params), su referencia y las capturas de aceptación. Fuente de
// verdad para el Kit Protocol (COWORK): "cada escena declara su kit".
export const KIT_MANIFESTS = Object.freeze({
  PROLOGUE: {
    scene: 'kodex/folio/i',
    motor: { id: 'KDX-FX-001', role: 'ascii signal bloom over the artwork', params: { density: 16, threshold: 0.22, bloom: 0.9, glitchAmount: 0.16 }, status: 'WIRED_PENDING_FRONTIER' },
    existing: ['KodexAscii bed', 'KodexCrtLayer observe', 'network-vortex'],
    acceptance: ['qa-artifacts/folio-motor/prologue-*.png'],
  },
  DESCENT: {
    scene: 'kodex/folio/ii',
    motor: { id: 'KDX-FX-003', role: 'halftone mutation over the artwork', params: { density: 11, threshold: 0.16, distortion: 0.28, phase: 0.14 }, status: 'WIRED_PENDING_FRONTIER' },
    existing: ['network-vortex', 'KodexCrtLayer descent'],
    acceptance: ['qa-artifacts/folio-motor/descent-*.png'],
  },
  MACHINE: {
    scene: 'kodex/folio/iv',
    motor: { id: 'KDX-FX-004', role: 'liquid mercury skin over the artwork', params: { threshold: 0.34, bloom: 0.85, distortion: 0.2, smear: 0.2 }, status: 'WIRED_PENDING_FRONTIER' },
    existing: ['machine-canvas', 'KodexAscii signal', 'KodexCrtLayer machine', 'network-vortex'],
    acceptance: ['qa-artifacts/folio-motor/machine-*.png'],
  },
  RETURN: {
    scene: 'kodex/folio/vi',
    motor: { id: 'KDX-FX-006', role: 'dissolution over the artwork', params: { phase: 0.28, distortion: 0.22, bloom: 0.6, glitchAmount: 0.2 }, status: 'WIRED_PENDING_FRONTIER' },
    existing: ['KodexCrtLayer return'],
    acceptance: ['qa-artifacts/folio-motor/return-*.png'],
  },
  ARCHIVE: {
    scene: 'kodex/archive/conjuncion',
    motor: { id: 'KDX-FX-005', role: 'memory decay mesh over the artwork', params: { density: 14, threshold: 0.42, glitchAmount: 0.24, smear: 0.2 }, status: 'WIRED_PENDING_FRONTIER' },
    existing: ['kx-frame chapter (obra completa)'],
    acceptance: ['qa-artifacts/archive-motor/*.png'],
  },
});

// Validación del Kit Protocol: un efecto es usable si tiene módulo, contrato y fallback.
export function kitIsUsable(effectId) {
  const effect = effectById(effectId);
  if (!effect) return { ok: false, reason: 'unknown effect', effectId };
  const canvasKit = KITS['kodex-effect-canvas'];
  return {
    ok: true,
    effectId,
    module: canvasKit.pieces.module,
    contract: canvasKit.pieces.contract,
    example: canvasKit.pieces.example,
    fallback: effect.fallback || canvasKit.pieces.fallbackAcceptance,
    via: 'kodex-effect-canvas',
  };
}

// Valida el Kit Protocol de una escena: el motor del manifest existe y tiene sus 4 piezas.
export function sceneKitUsable(sceneKey) {
  const manifest = KIT_MANIFESTS[sceneKey];
  if (!manifest) return { ok: false, reason: 'unknown scene', sceneKey };
  const usable = kitIsUsable(manifest.motor.id);
  return {
    ok: usable.ok,
    sceneKey,
    manifest,
    kit: usable,
    acceptance: manifest.acceptance,
  };
}
