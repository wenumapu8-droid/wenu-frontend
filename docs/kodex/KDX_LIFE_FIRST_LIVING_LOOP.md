# KDX.LIFE — First Living Loop

**Status:** IMPLEMENTED_CANDIDATE / NOT_RUNTIME_WIRED  
**Version:** v0.1  
**Branch:** `feat/kdx-life-first-living-loop`  
**Base:** `feat/kdx-engine-v0-slice-01`

## Purpose

Prove the smallest operational form of the KODEX thesis:

`OBSERVATION → SIGNAL → STATE → MEMORY → CONSEQUENCE`

The acceptance test is intentionally narrow:

1. an explicit action A occurs in THRESHOLD;
2. the existing KODEX memory authority records the fact;
3. KDX.LIFE reads that fact without creating storage;
4. a later state B becomes visibly different;
5. when the memory fact is absent/reset, B disappears.

If step 4 does not happen, the archive stored data but did not remember in the KODEX sense.

## Non-negotiable authority rule

KDX.LIFE **does not create another persistence engine**.

The current THRESHOLD work on `fix/kodex-threshold-hold-gate-20260912` already owns the meaningful event:

- `threshold_crossed`
- existing memory module: `src/lib/kodex/memoria.ts`
- existing shared store: `kx-journey`
- existing readers: `eventos()` and `pesoDeMemoria()`

The bridge in this slice is therefore read-only. It accepts those readers by dependency injection and derives a semantic consequence. It exposes no `commit`, storage key, localStorage call, identity field, psychological score or hidden inference.

## Implemented candidate

`src/kodex/engine/kdxLifeMemoryBridge.js`

Exports:

- `deriveKdxLifeMemoryState(...)`
- `createKdxLifeMemoryBridge(...)`

Input contract:

```js
{
  events: MemoryEvent[],
  memoryWeight: number // normalized 0..1
}
```

Output contract:

```js
{
  authority: 'EXTERNAL_READ_ONLY_MEMORY',
  readOnly: true,
  facts: {
    thresholdCrossed,
    thresholdCrossCount,
    latestThresholdCross,
    memoryWeight
  },
  consequence: {
    semanticState: 'DORMANT' | 'REMEMBERED',
    recallVisible,
    recallStrength
  }
}
```

`recallStrength` is a design/runtime parameter, not a psychological measurement. It is bounded and derived only from the explicit KODEX memory weight.

## First Living Loop proof encoded in tests

The contract suite now checks:

- `threshold_seen` alone does not activate recall;
- `threshold_crossed` activates `REMEMBERED` + `recallVisible`;
- the mapping is deterministic and immutable;
- removing/resetting the memory fact removes the consequence;
- unrelated events do not masquerade as THRESHOLD memory;
- the bridge has no write/commit API;
- memory weight is clamped to 0..1.

These are contract tests only until CI/build evidence is attached to the PR.

## Production wiring after branch convergence

Once the THRESHOLD branch and KDX Engine branch share a base, wire the bridge to the existing authority rather than copying its logic:

```js
import { eventos, pesoDeMemoria } from '../../lib/kodex/memoria';
import { createKdxLifeMemoryBridge } from './kdxLifeMemoryBridge.js';

const lifeMemory = createKdxLifeMemoryBridge({
  readEvents: eventos,
  readMemoryWeight: pesoDeMemoria,
});

const life = lifeMemory.read();
```

Then one downstream scene/organism must consume `life.consequence` in a small, perceivable and reversible way. Candidate v0.1 consequence:

- no memory: semantic state `DORMANT`;
- prior `threshold_crossed`: semantic state `REMEMBERED`;
- `recallStrength` modulates one visible property such as organism cohesion, ghost persistence or signal stability;
- reset local KODEX memory: the visible difference disappears.

The exact visual mapping belongs to the scene/renderer contract and should not be hard-coded inside the memory bridge.

## What this does not claim

- It does not claim the full seven-scene living system is implemented.
- It does not claim production wiring is complete.
- It does not infer attention, emotion, spirituality, identity or intent.
- It does not add collective memory, world signals, sensors or network persistence.
- It does not change canon by itself.

## Next gate

Promote from `IMPLEMENTED_CANDIDATE` only after all of the following are evidenced:

1. branch convergence with canonical THRESHOLD memory producer;
2. real downstream consumer wired;
3. action A → memory → consequence B reproduced in browser;
4. reset → B disappears;
5. pointer/touch/keyboard path remains intact;
6. reduced motion remains understandable;
7. `npm run test:kodex:core` passes;
8. relevant integrity audit passes;
9. build passes;
10. visual/runtime evidence is attached.

## Architectural rule

**SIGNAL MUST HAVE CONSEQUENCE. MEMORY MUST BE CONSUMED LATER.**

A stored event that never modifies a later state is telemetry, not living memory.
