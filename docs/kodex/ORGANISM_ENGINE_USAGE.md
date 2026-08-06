# KODEX Universal Organism Engine — Implementation Guide

Status: `FOUNDATION PROTOTYPE / TWO ADAPTERS`

Branch: `feature/kodex-organism-engine-foundation`

Deployment: `BLOCKED`

## What exists in this branch

Implemented foundation:

- typed organism, preset, lifecycle, input and adapter contracts;
- preset factories for `FIELD`, `VORTEX`, `ORBITAL`, `GROWTH`, `SPECIMEN` and `TERRAIN`;
- runtime preset validation;
- adapter registry;
- reusable Astro host component;
- normalized pointer, touch/click, keyboard and audio input feed;
- visibility suspension;
- one-active-WebGL-organism coordination;
- target-FPS and reduced-motion throttling;
- fallback handling;
- WebGL context-loss handling;
- debug metrics surface;
- `FIELD` adapter wrapping the existing three-pass Threshold Portal runtime;
- procedural `VORTEX` adapter with complete GPU disposal;
- static SVG fallback for Signal Vortex;
- noindex comparison laboratory.

Not implemented yet:

- orbital renderer;
- staged SVG/Canvas growth renderer;
- specimen GLB/depth-sprite renderer;
- terrain/layered-plane renderer;
- cross-adapter transition compositor;
- complete GPU resource disposal in the recovered Threshold Portal runtime;
- device performance validation.

Documentation and typed factories do not count as implemented renderers.

## Directory map

```text
src/kodex/organism-engine/
├── types.ts
├── BaseOrganismRuntime.ts
├── presets.ts
├── registry.ts
├── validation.ts
├── preset-library/
│   └── signal-vortex.ts
└── adapters/
    ├── ThresholdPortalAdapter.ts
    └── vortex/
        ├── SignalVortexAdapter.ts
        ├── SignalVortexRuntime.ts
        └── shaders/
            ├── screen.vert
            └── signal-vortex.frag

src/components/kodex/organism/
├── KodexOrganism.astro
└── kodex-organism-client.ts

public/img/kodex/organisms/
└── signal-vortex-fallback.svg
```

## Internal laboratory

```text
/kodex/lab/organism-engine/
```

The lab compares:

- `threshold-portal` — artwork-driven `FIELD`;
- `signal-vortex` — procedural `VORTEX`.

Only the visible organism should run. The route is `noindex` and does not replace a public KODEX scene.

## Use the universal host

```astro
---
import KodexOrganism from "../../../components/kodex/organism/KodexOrganism.astro";
---

<KodexOrganism
  preset="threshold-portal"
  fallback="/img/kodex/works/mandala-0cin-negativo.png"
  label="THRESHOLD · portal vivo sobre la obra"
  description="A radial image field generated from an authored KODEX source image."
  eager={true}
/>
```

Procedural vortex:

```astro
<KodexOrganism
  preset="signal-vortex"
  fallback="/img/kodex/organisms/signal-vortex-fallback.svg"
  label="SIGNAL VORTEX · rotating convergence field"
  description="A procedural spiral organized around a movable attractor."
/>
```

The component always places the fallback in the DOM. The canvas is revealed only after the adapter has loaded and mounted successfully.

## Interaction behavior

Default normalized inputs:

- pointer movement: `[-1, 1]` coordinates;
- tap/click: primary action;
- Enter or Space: primary keyboard action;
- arrow keys: navigation axis;
- optional `window.__kxAudio`: low/mid/high bands;
- `prefers-reduced-motion`: switches the runtime to `REDUCED`;
- hidden tab or offscreen organism: render loop stops.

A primary action emits:

```ts
document.addEventListener("kodex:organism-action", (event) => {
  console.log(event.detail);
});
```

Payload:

```ts
{
  presetId: string;
  family: string;
  action: string;
  memoryWrites: string[];
}
```

The event does not write session memory by itself. The KODEX orchestrator must validate and commit the declared writes.

## Debug API

In the browser console:

```js
window.__kdxOrganisms.list();
window.__kdxOrganisms.setMotion("REDUCED");
window.__kdxOrganisms.setMotion("FULL");
window.__kdxOrganisms.stop();
```

The debug API is for laboratories and QA. It is not a public product contract.

## Create a preset

Prefer a factory instead of writing an untyped object.

```ts
import { createVortexPreset } from "../presets";

export const signalVortexPreset = createVortexPreset({
  id: "signal-vortex",
  fallback: "/img/kodex/organisms/signal-vortex-fallback.svg",
  label: "SIGNAL VORTEX · rotating convergence field",
  sourceId: "KDX-PROCEDURAL-SIGNAL-VORTEX-001",
});
```

A procedural `SHADER` preset does not require a source texture. Asset-driven render modes do require a source, model or sprite sequence.

Register only when its adapter exists:

```ts
organismRegistry
  .registerAdapter(signalVortexAdapter)
  .registerPreset(signalVortexPreset);
```

Registering a preset without an adapter is allowed only in canonical data, not in the active browser registry.

## Implement an adapter

An adapter maps semantic controls and normalized input to one renderer family.

```ts
export const signalVortexAdapter: OrganismAdapterFactory = {
  family: "VORTEX",
  supportedModes: ["SHADER"],
  create(canvas, preset) {
    return new SignalVortexRuntime(canvas, preset);
  },
};
```

Required runtime methods:

```ts
load();
mount();
enter();
start();
stop();
setInput();
setLifecycle();
setQuality();
setMotion();
getMetrics();
exit();
destroy();
```

Use `BaseOrganismRuntime` for new renderers that own their animation loop. Do not use it to wrap a legacy renderer that already owns a loop.

## Signal Vortex controls

The prototype maps semantic controls as follows:

| Control | Visual effect |
|---|---|
| `signal` | luminosity, point density and audio response |
| `memory` | cyan trace contribution |
| `entropy` | turbulence and grain |
| `cohesion` | spiral-arm sharpness |
| `depth` | field envelope |
| `convergence` | twist, radial falloff and event-horizon tension |
| lifecycle | attractor size and structural activation |
| primary action | temporary convergence increase |
| pointer | attractor displacement |

These are synthetic visual controls, not scientific measurements.

## Asset packets

### Image field

Minimum:

```text
source.webp
fallback.avif
```

Enhanced:

```text
source.webp
alpha.webp
height.webp
emission.webp
fallback.avif
```

### Growth

```text
seed.svg
roots.svg
trunk.svg
branches.svg
fallback.svg
```

Growth must reveal actual path structure. Scaling a completed tree from zero is not an acceptable growth implementation.

### Specimen

Preferred:

```text
model.glb
poster.avif
```

Alternatives:

```text
views/000.webp ... views/015.webp
poster.avif
```

or:

```text
source.webp
depth.webp
normal.webp
poster.avif
```

### Terrain

```text
model.glb or layered planes
height.webp
contours.svg
stress-map.webp
poster.avif
```

## Quality ladder

```text
HIGH
→ MEDIUM
→ LOW
→ FALLBACK
```

The base runtime honors the preset target FPS. Reduced motion is capped at 12 FPS and the Vortex shader receives a minimal motion amplitude. New adapters must avoid creating WebGL resources when the selected quality is `FALLBACK`.

The current Threshold adapter maps `FALLBACK` to a stopped low-quality runtime while the host reveals the fallback image. The recovered Threshold runtime still needs complete explicit GPU deletion.

## Preset status discipline

- `EXPERIMENTAL`: contract or early runtime, not integrated;
- `PROTOTYPE`: works in a lab route;
- `IMPLEMENTED`: integrated into a node but not fully validated;
- `TESTED`: passed functional, visual, accessibility and performance gates;
- `DEPRECATED`: retained for traceability.

Never label a preset `TESTED` without recorded evidence.

## Adapter development order

1. `FIELD` — extract and harden Threshold Portal;
2. `VORTEX` — procedural single-pass prototype implemented; feedback extension remains optional;
3. `ORBITAL` — nested transform rig;
4. `GROWTH` — staged SVG/Canvas graph reveal;
5. `SPECIMEN` — choose GLB, depth map or sprite sequence after asset review;
6. `TERRAIN` — layered-plane/GLB construct;
7. cross-adapter transitions.

## Required tests per adapter

Functional:

- mounts once;
- starts only when active;
- stops offscreen and on hidden tab;
- remounts after Astro navigation;
- action event contains declared memory writes;
- context loss reveals fallback;
- destroy removes listeners and GPU resources.

Accessibility:

- focusable host;
- Enter/Space equivalent;
- touch equivalent;
- no hover-only action;
- reduced-motion mode;
- semantic description;
- fallback preserves the node's question and action.

Performance:

- DPR capped;
- one active WebGL organism;
- target FPS honored;
- frame-time recorded;
- no accumulating animation loops;
- texture, buffer, program and framebuffer disposal verified;
- mobile LOW/FALLBACK behavior tested.

Visual:

- source artwork remains identifiable where required;
- no uncontrolled feedback washout;
- movement expresses the declared verb;
- editorial DOM remains legible and stable;
- surface effects do not replace structural motion.

## Production boundary

Do not replace `KodexPortal` on the public route until the universal host reproduces its current behavior and passes regression testing.

The Vortex adapter remains a lab prototype until visual and device QA are recorded.

```text
DEPLOYMENT STATUS: BLOCKED
REQUIRED AUTHORIZATION: APROBAR DEPLOY
```
