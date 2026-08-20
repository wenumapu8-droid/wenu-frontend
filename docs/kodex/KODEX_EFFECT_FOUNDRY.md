# KODEX−∞ Effect Foundry

Status: `SPRINT_0 / TRANSLATION PROTOTYPE`

## Purpose

KODEX Effect Foundry is the internal zero-cost production layer for building repeatable visual transformations without depending on Figma, Weave, paid credits, external inference APIs or vendor-specific effect nodes.

The Foundry converts a source image into a parameterized effect recipe. A recipe can be explored in the lab, exported as a static PNG, or embedded as a live Canvas effect inside a KODEX page.

## Current implementation

### Registry

`src/lib/kodex/effectFoundry.js`

Canonical IDs, families, statuses, scene fit, default parameters and runtime input mappings.

### Runtime

`src/lib/kodex/effectFoundryRuntime.js`

Browser-side Canvas 2D translation runtime. It currently implements six effects and does not make network requests.

### Reusable page component

`src/components/kodex/effects/KodexEffectCanvas.astro`

Use this in KODEX scenes when an effect is ready to leave the lab. It can use a real source asset or the generated seed organism and supports optional animation and pointer interaction.

Example:

```astro
---
import KodexEffectCanvas from '../../components/kodex/effects/KodexEffectCanvas.astro';
---

<KodexEffectCanvas
  effectId="KDX-FX-005"
  src="/img/kodex/organisms/example.webp"
  alt="Archive organism fragmenting into a memory mesh"
  animate={true}
  interactive={true}
  params={{ threshold: 0.44, glitchAmount: 0.31, smear: 0.22 }}
/>
```

### Lab

Route:

`/kodex/lab/effect-foundry/`

Source:

`src/pages/kodex/lab/effect-foundry/index.astro`

Functions:

- choose one of the six Sprint 0 effects;
- upload a local image;
- process it only in the browser;
- manipulate generated parameters;
- randomize a recipe;
- preview animated states;
- export the current frame to PNG;
- inspect scene fit, implementation status and fallback intent.

## Sprint 0 registry

| ID | Name | Family | Current status | Priority |
|---|---|---|---|---|
| KDX-FX-001 | ASCII Signal Bloom | SIGNAL | TRANSLATED | 1 |
| KDX-FX-002 | Cross-Stitch Field | SIGNAL | TRANSLATED | 1 |
| KDX-FX-003 | Halftone Mutation | MUTATION | TRANSLATED | 1 |
| KDX-FX-004 | Liquid Mercury Skin | MATTER | TRANSLATED | 2 |
| KDX-FX-005 | Memory Decay Mesh | MEMORY | TRANSLATED | 1 |
| KDX-FX-006 | −∞ Dissolution | RETURN | TRANSLATED | 1 |

`TRANSLATED` means the concept has a working browser translation. It does **not** mean the effect has been visually validated, performance-tested on target mobile devices, or deployed into the canonical seven-scene experience.

## Runtime input grammar

The production direction is to stop treating effects as decorative filters. KODEX state should drive effect parameters.

| KODEX input | Effect parameter |
|---|---|
| `pointer.x` | `distortion` |
| `pointer.y` | `density` |
| `signalStrength` | `bloom` |
| `focus` | `threshold` |
| `anomaly` | `glitchAmount` |
| `time` | `phase` |
| `nodeCount` | `particleCount` |
| `latency` | `smear` |
| `sceneState` | `paletteMode` |

Not every Sprint 0 effect consumes every parameter. The registry defines the parameters that each effect currently exposes.

## Production line

```text
SOURCE / ASSET
      ↓
EFFECT FOUNDRY LAB
      ↓
PARAMETER RECIPE
      ↓
VISUAL REVIEW
      ↓
SELECTED
      ↓
PAGE INTEGRATION VIA KodexEffectCanvas
      ↓
MOBILE / REDUCED-MOTION / PERFORMANCE QA
      ↓
TESTED
      ↓
IMPLEMENTED IN CANONICAL SCENE
      ↓
OPTIONAL GPU TRANSLATION (WEBGL / WEBGPU)
```

### Gate 1 — Source

Required:

- source path or generated seed;
- provenance status;
- intended scene;
- no unlicensed external reference used as production asset.

### Gate 2 — Recipe

Required:

- effect ID;
- parameter values;
- screenshot/export;
- intended interaction mapping;
- fallback plan.

### Gate 3 — Visual review

A human selects or rejects the recipe. A generated result is not automatically canonical.

### Gate 4 — Integration

Use `KodexEffectCanvas.astro`. Do not duplicate the renderer in individual scene files.

### Gate 5 — QA

At minimum verify:

- 390×844 touch viewport;
- 412×915 touch viewport;
- desktop viewport;
- `prefers-reduced-motion`;
- image source failure fallback;
- no console error;
- route build success;
- acceptable frame time for animated effects.

### Gate 6 — GPU promotion

Only effects that pass visual and interaction review should be rewritten as a shader. GPU work is a production optimization / capability expansion, not the exploration layer.

## Cost model

Sprint 0 uses only code already owned by the project and browser APIs:

- Astro;
- Canvas 2D;
- native Pointer Events;
- native File API / Blob URLs;
- existing repository toolchain.

No effect-generation subscription is required.

Future GPU versions should prefer WebGL with the project's existing `three` dependency where it reduces implementation cost. WebGPU can be added selectively when browser support and the effect justify it; it is not a baseline dependency.

## Status policy

Use only these statuses:

- `CONCEPT`
- `GENERATED`
- `SELECTED`
- `TRANSLATED`
- `TESTED`
- `IMPLEMENTED`
- `DEPRECATED`

Never mark a recipe `IMPLEMENTED` because it exists in the lab. `IMPLEMENTED` means it is actually wired into its intended KODEX scene. `TESTED` means the agreed QA has been run and recorded.

## Sprint 1

1. Build recipe persistence/export as JSON.
2. Add a recipe loader to `KodexEffectCanvas`.
3. Add source comparison A/B view.
4. Add performance readout (FPS, frame time, dropped frames).
5. Translate the two highest-value effects to GPU.
6. Wire one approved effect into one canonical scene only.
7. Validate mobile and reduced-motion behavior before expanding to the other scenes.
