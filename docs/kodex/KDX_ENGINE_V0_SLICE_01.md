# KDX Engine v0.1 — Slice 01

Status: IMPLEMENTED_CANDIDATE / NOT MERGED / NOT DEPLOYED / NOT CANON

## Purpose

Extract a reusable KDX runtime boundary from the existing KODEX product lineage without creating a parallel renderer, router, memory authority or scene system.

## What this slice introduces

- `KdxSignalBus` + immutable `SignalFrame` contract.
- Renderer contract independent of WebGL/Astro/DOM.
- `KdxEngineCore` orchestration layer.
- `KodexWorldRendererAdapter` for the existing WebGL2 runtime.
- Three distinct software presets executed through the same engine core:
  - THRESHOLD
  - SIGNAL_FIELD
  - AUDIO_ORGANISM
- Explicit-memory-write rule at the engine boundary.
- Node tests proving contract behavior and 3-experiences / 1-core reuse.

## Hard boundaries

This slice does NOT:

- replace `JourneyState`;
- create a second memory store;
- create a second navigation authority;
- change canonical scene order;
- auto-navigate;
- infer psychological/spiritual state;
- write memory from dwell/pointer/audio passively;
- merge or deploy anything.

## Extraction direction

```text
Browser/device adapters
        ↓
KdxSignalBus → SignalFrame
        ↓
KdxEngineCore
        ↓
RendererContract
        ↓
KodexWorldRendererAdapter
        ↓
Existing KodexWorld WebGL2 runtime
```

The existing `KodexWorld` remains the renderer. The new layer makes its input contract reusable.

## Compatibility rule

Existing KODEX behavior remains the default. `KodexWorld` can continue binding its legacy DOM pointer/touch listeners unless explicitly constructed for external KDX signal control.

## Next slices

### Slice 02 — device adapters
- PointerAdapter
- TouchAdapter
- KeyboardAdapter
- AudioSignalAdapter
- clock/timing adapter
- reduced-motion-aware signal policy

### Slice 03 — state bridge
- map the existing scene state vocabulary to an engine-facing state contract;
- preserve one state authority per scene;
- no parallel state machine.

### Slice 04 — memory bridge
- adapter over existing explicit JourneyState / semantic-memory writes;
- no passive writes;
- deterministic route/memory evidence.

### Slice 05 — three browser proofs
Mount THRESHOLD, SIGNAL_FIELD and AUDIO_ORGANISM through the same `KdxEngineCore` and collect desktop/mobile/reduced-motion evidence.

## Milestone

KDX Engine v0.1 reaches the first technology proof when three visually distinct experiences execute from configuration through one core, with tests and browser evidence, while the current KODEX experience remains behaviorally intact.
