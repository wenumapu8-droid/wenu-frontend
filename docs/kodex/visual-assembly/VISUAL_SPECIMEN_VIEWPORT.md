# KODEX−∞ Visual Specimen Viewport — Contract Proposal v0.1

Status: **ARCHITECTURE PREP / NOT RUNTIME**  
Epistemic status: **INFERRED + CANON-CONSTRAINED**

## Purpose

Define the central KODEX display surface that can make a concept, authored work, field, diagram or live material appear to be running inside an instrument-like visual emulator while keeping the source, effect, interface and semantic state separable.

This is not a generic image carousel and not permission to restyle source artwork.

Working technical name:

`Visual Specimen Viewport`

The user-facing experience may read as a screen, aperture, holographic specimen chamber, emulator or living display depending on the scene recipe.

## Core rule

```text
AUTHORIZED SOURCE
      ↓
SPECIMEN VIEWPORT
      ├─ source layer
      ├─ optional approved live-effect layer
      ├─ bounded field/diagram layer
      ├─ viewport mask/frame
      └─ semantic metadata outside master pixels
      ↓
LOOP / INTERACTION / FALLBACK
```

The viewport changes how a source is **presented and activated**. It does not silently change what the source **is**.

## Separation of identities

- `OCN-*` = authored Ocín source/work.
- `KDX-VIS-*` = editorial/interface primitive.
- `KDX-FX-*` = live material/procedural effect.
- `RCP-*` = composition grammar.
- `VSP-*` = proposed viewport presentation profile, if this namespace is later accepted.

A viewport profile must never be stored as if it were an artwork, scene coordinate or scientific source.

## Input contract

```ts
interface VisualSpecimenViewportInput {
  source: HeroMediaResolution;
  visualMode: string;
  recipeId: string;
  presentationProfile: string;
  effectKitId?: string;
  componentIds?: string[];
  displayState: 'OFF' | 'BOOT' | 'IDLE' | 'ACTIVE' | 'LOOP' | 'FALLBACK';
  motionMode: 'FULL' | 'REDUCED' | 'OFF';
  viewport: 'desktop' | 'mobile';
  seed: number;
  loop?: {
    enabled: boolean;
    durationMs: number;
    phase: number;
  };
}
```

`displayState` is presentation state only. It must not replace canonical scene/journey state.

## Render-layer contract

The viewport may contain these independent layers, in order:

1. `BACKPLATE`
2. `SOURCE_MASTER`
3. `SOURCE_DERIVATIVE` — only when source permissions explicitly allow it
4. `LIVE_EFFECT`
5. `FIELD_OR_DIAGRAM`
6. `MASK_OR_APERTURE`
7. `FRAME_AND_MARKERS`
8. `LIVE_METADATA`
9. `INTERACTION_STATE`

Rules:

- `SOURCE_MASTER` remains independently addressable and recoverable.
- Critical text stays semantic/live whenever technically possible.
- Interface glyphs are never burned into the master source.
- A scientific-looking field remains decorative/interpretive unless backed by an eligible verified source.
- Culture-specific symbols require provenance/permission before entering any layer.

## Presentation modes

The same governed viewport can host different render technologies without changing its contract:

### `STATIC_MASTER`

Authorial raster/vector source shown intact with layout-only transforms allowed by the resolver.

### `SVG_SYSTEM`

Vector specimen or diagram with deterministic transforms and semantic fallback.

### `CANVAS_2D`

Procedural field/material with explicit state, seed and fallback.

### `WEBGL_SHADER`

GPU material/field. One heavy renderer maximum per scene unless a measured performance budget explicitly permits more.

### `VIDEO_LOOP`

Authored video or rendered loop with poster-frame fallback and reduced-motion replacement.

### `PARTICLE_FIELD`

Bounded generative field driven by scene variables. Must declare seed, parameter envelope and semantic role.

### `MODEL_3D`

Optional 3D specimen. Requires static poster/fallback and pointer/touch/keyboard-equivalent controls when interaction carries meaning.

## Loop contract

A KODEX loop is a state-preserving temporal cycle, not an arbitrary GIF reset.

Required properties:

- deterministic for the same source + profile + seed + state;
- no visible hard cut at loop boundary unless intentionally canonical;
- bounded phase and amplitude;
- source remains legible throughout the cycle unless disappearance itself is the explicit concept;
- interaction may perturb the phase but must converge back to a valid loop state;
- motion cannot be the only carrier of semantic information.

Recommended default envelope for quiet/live specimen loops:

- duration: `6–18 s`;
- one dominant motion family;
- one secondary micro-motion family maximum;
- no random full-layout reconfiguration inside one loop;
- no unbounded particle accumulation.

These numbers are implementation heuristics, not canon.

## Reduced-motion contract

Every FULL loop must define an equivalent reduced state before promotion.

```text
FULL        → continuous bounded temporal field
REDUCED     → discrete state/keyframe + opacity/contrast changes
OFF         → stable authored/static state
NO RENDERER → poster/source fallback
```

The concept, CTA and navigation must remain understandable in all four conditions.

## Source-transform boundary

The viewport asks the source resolver what is allowed. It never decides permissions itself.

Examples:

```text
source says crop + mask + responsive-scale
→ viewport may use those operations

source says NEEDS_CURATORIAL_PASS
→ viewport must use master intact or remain blocked

source says NOT_APPROVED_FOR_PUBLIC_EXPORT
→ internal planning is allowed only according to project policy; public render stays blocked
```

An effect kit cannot override this boundary.

## Visual behavior

The viewport should feel like KODEX is **running the concept** rather than merely displaying a thumbnail.

Valid activation strategies include:

- aperture reveal;
- focal-plane shift;
- local field deformation;
- bounded orbital motion;
- phase drift;
- scale recursion;
- scan/probe progression;
- layer-depth separation;
- reversible polarity state;
- source-safe parallax;
- metadata/state change outside source pixels.

Avoid by default:

- generic glitch overlays;
- random RGB splitting;
- whole-image AI repainting;
- permanent chromatic haze;
- fake scientific telemetry;
- symbols with invented cultural provenance;
- motion that exists only to make the page look busy.

## Layout relationship

The specimen viewport is a **content surface**, not necessarily the whole scene.

Typical recipes:

```text
RCP-MONOLITH
  1 large Visual Specimen Viewport
  + minimal metadata
  + 2–4 KDX-VIS primitives

RCP-ARCHIVE-COLLAGE
  2–5 smaller viewport instances
  + shared editorial grid
  + no blending of source masters

RCP-SIGNAL-BOARD
  1 primary viewport
  + state/signal overlays
  + semantic telemetry

RCP-QUIET-FIELD
  1 small viewport
  + 70–90% negative field
```

## Runtime output

```ts
interface VisualSpecimenViewportOutput {
  sourceId: string;
  sourceResolutionStatus: 'RESOLVED' | 'UNRESOLVED' | 'BLOCKED';
  renderer: string;
  rendererState: string;
  loopPhase: number;
  fallbackActive: boolean;
  appliedTransformations: string[];
  activeEffectKitIds: string[];
  visualComponentIds: string[];
  performanceTier: string;
  epistemicFlags: string[];
}
```

The debug representation should make it possible to prove that no unauthorized source transformation occurred.

## Deterministic reconstruction

Given the same:

```text
source resolution
+ visual mode
+ recipe
+ viewport profile
+ governed components
+ effect kit
+ seed
+ state
+ viewport size class
```

another agent/runtime should be able to reconstruct the same structural composition and loop behavior.

Pixel-for-pixel equality is not required for procedural renderers unless a specific test demands it. Structural identity and bounded parameter equivalence are required.

## Performance contract

Initial rule:

- at most one heavy live renderer per scene;
- suspend or degrade offscreen/inactive viewports;
- cap device-pixel ratio where appropriate;
- no renderer may block the semantic path;
- fallback must be available before promotion;
- mobile may select a cheaper presentation profile rather than simply lowering resolution.

Performance budgets should be measured before hard numeric thresholds are promoted.

## Accessibility/input contract

- semantic actions exist outside the visual renderer;
- hover-only meaning is prohibited;
- pointer/touch/keyboard parity is required where interaction changes state or navigation;
- `prefers-reduced-motion` must be respected;
- decorative canvas/WebGL can remain `aria-hidden` when equivalent semantic content is present;
- source alt/caption metadata comes from the source registry, not the visual effect.

## Relationship to memory

The viewport is one place where KODEX can make memory visible without pretending memory is literal data that does not exist.

Permitted memory-driven variation can include previously observed route/state variables such as:

- previously visited coordinate;
- prior choice category;
- accumulated route depth;
- remembered visual mode;
- prior signal state;
- explicit session variables already defined by the runtime.

A viewport must not fabricate biometric, identity or behavioral telemetry.

## Proposed first proof

After the current KOD-49 visual gate closes:

1. noindex lab route only;
2. one explicitly approved Ocín source or generated/non-rights-blocked specimen;
3. one `RCP-MONOLITH` composition;
4. one viewport instance;
5. at most one approved effect kit;
6. 3–4 governed `KDX-VIS-*` components maximum;
7. deterministic seed;
8. FULL / REDUCED / OFF / fallback;
9. desktop + two mobile widths;
10. expose debug output and assembly JSON;
11. run contract/build/device/frontier/creator gates separately.

## Definition of done

The viewport contract is proven only when:

- a source can be swapped without rewriting the scene shell;
- a presentation profile can be swapped without mutating source permissions;
- another agent can reconstruct the structural result from data;
- mobile is independently composed;
- reduced motion preserves meaning;
- fallback preserves access;
- provenance and epistemic boundaries remain visible to the runtime;
- one visual component cannot silently create its own parallel visual system.

This proposal does not authorize runtime implementation, canonical namespace promotion or deployment.
