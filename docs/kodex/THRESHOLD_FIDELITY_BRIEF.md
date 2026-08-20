# KOD-49 — THRESHOLD Fidelity Implementation Brief

Branch: `feature/kodex-threshold-visual-scaffold-v1`
Base: `feature/kodex-vertical-slice-v0` at `f218a07f428e52e5c0e3484882cea622d93bb7f3`
Deployment: BLOCKED

## Read first

Canonical factory packet:
`wenumapu8-droid/kodex-minus-infinity@main:ops/factory/packets/KOD-49.yaml`

Visual Scaffold method:
`wenumapu8-droid/kodex-minus-infinity@main:ops/factory/VISUAL_SCAFFOLD_PROTOCOL.md`

Frontier visual gate:
`wenumapu8-droid/kodex-minus-infinity@main:ops/factory/FRONTIER_VISUAL_GATE.md`

Application source:
`src/pages/kodex/lab/visible-assembly/index.astro`

## Scope

Improve **THRESHOLD only** for Scene Fidelity Sprint 01.
Do not redesign Archive, Heart or Return in this packet.
Do not alter public `/kodex/`.
Do not redefine JourneyState topology.

Preserve the already-green KOD-47 functional journey.

## Canonical target

THRESHOLD is voluntary entry.
It recognizes presence without claiming identity.

Primary question:
`WILL YOU ENTER A SYSTEM THAT REMEMBERS TRANSFORMATION?`

Copy anchors:
- `THE GATE IS A LIVING AGREEMENT.`
- `ENTER VOLUNTARILY.`

Visual language:
- living membrane / portal organism;
- obsidian field;
- mineral/violet signal;
- central aperture;
- SDF/metaball cellular geometry;
- reaction-diffusion-inspired surface treatment;
- asymmetric organic growth.

Do not describe the renderer as biologically alive or use reaction-diffusion as evidence of biological life.

## Interaction target

- pointer proximity increases local membrane tension;
- dwell may stabilize/open the aperture visually;
- crossing remains an explicit press/tap/keyboard semantic action;
- return/re-entry may use real remembered route variables to alter the gate;
- no hover-only essential action;
- no passive pointer history persistence.

## First composition targets

These are initial measurable hypotheses, not immutable canon:

- dominant portal/membrane: ~50–65% viewport occupation desktop;
- mobile crop may occupy ~60–80% viewport;
- three readable depth planes: atmosphere / organism / semantic UI;
- preserve negative space around the aperture;
- copy should not cover the aperture center;
- peripheral telemetry remains subordinate;
- avoid broad global violet haze; concentrate spectral/bloom energy locally around the active organism.

## Visual Scaffold architecture

Keep three separable layers:

1. **Functional base** — existing semantic route/JourneyState/buttons.
2. **Visual scaffold** — optional temporary target image/treatment only when an approved KODEX asset is available and provenance is clear.
3. **Live native layers** — CSS/SVG/Canvas/WebGL, real typography, interaction, masks, light, particles and transitions.

Do not invent an external reference asset path.
If no approved scaffold asset is locally available, build the native layer and leave scaffold support explicit but disabled.

## Implementation preference

Reuse existing KODEX effect/input/runtime infrastructure before adding dependencies.
Prefer a bounded component/renderer rather than embedding a large one-off script into the page.
Keep one active heavy renderer maximum.

A likely decomposition is:
- `ThresholdMembrane` visual host/component;
- renderer adapter or Canvas/WebGL effect;
- state mapping from THRESHOLD interaction state;
- CSS/UI composition in the scene host;
- SVG/static fallback.

This is a suggestion, not permission to duplicate existing abstractions. Inspect repo reality first.

## Required modes

- FULL
- REDUCED
- OFF
- no-WebGL fallback

Reduced motion should use static aperture states + opacity/contrast/line-weight changes rather than continuous tunnel motion.

## Evidence before review

- build/test PASS;
- desktop capture;
- 390×844 capture;
- 412×915 capture;
- reduced-motion capture/state;
- no-WebGL usable;
- keyboard and touch crossing remain equivalent;
- no horizontal overflow;
- no fabricated numeric telemetry;
- short report with `VISUAL_IMPACT` and `NATIVE_IMPLEMENTATION` estimates.

## Authority routing

Claude Max / Claude Pro:
ambiguous visual/art-direction judgment and frontier re-audit.

Codex:
difficult renderer/integration implementation once deltas are bounded.

OpenCode/OpenClaude:
mechanical/deterministic deltas, tests and repetitive fixes.

Creator:
final visual acceptance.

## Stop instead of inventing when

- an approved scaffold asset cannot be located/provenanced;
- a new canonical scene meaning would be required;
- current integration branch moved and creates ownership collision;
- implementation would require replacing public `/kodex/`;
- scientific/cultural meaning is ambiguous.

Production deployment remains blocked without exact creator phrase `APROBAR DEPLOY`.
