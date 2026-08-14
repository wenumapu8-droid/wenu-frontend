# KOD-49 — GPU Recovery Decision v1

Status: **COMBINE / DO NOT REPLACE PRIMARY ORGANISM**  
Scope: PR #35 current Canvas2D material candidate vs PR #46 recovered WebGL lane.  
This is an implementation decision, not a creator visual pass.

## Decision

**COMBINE selectively.**

Keep the current `KodexThresholdMembrane.astro` Canvas2D renderer as the primary foreground organism for the present KOD-49 closure lane.

Do **not** replace it wholesale with PR #46's recovered `threshold-portal` shader.

Preserve the recovered GPU work as a reusable live-effect/runtime candidate and salvage only the parts that strengthen depth, temporal continuity or fallback architecture after frontier review confirms they are needed.

## Why the Canvas2D candidate remains primary

The current KOD-49 renderer already expresses the specific visual deltas requested by the material re-audit:

- irregular elliptical cavities with distinct depth values;
- bridge/tendril connections;
- asymmetric shell lobes;
- obsidian outer mass;
- localized violet inner matter;
- mineral/specular rim treatment;
- foreground/background cavity ordering and occlusion;
- local pointer-angle deformation;
- shared focal/state contract proven by browser QA.

Those properties map directly to the current THRESHOLD target and the D9/D10/D11 material requirements.

## Why the recovered shader should not become the foreground hero unchanged

The recovered fragment shader is valuable authored code, but its present visual grammar is materially different from the current target:

1. Twelve concentric/radial tunnel bands dominate the field.
2. Eight repeated radial blades reinforce rotational symmetry.
3. The authored palette is black + saturated red + white, not the present obsidian/mineral-violet target.
4. `u_pointer` is supplied by the WebGL runtime but is not consumed by the recovered fragment shader, so pointer proximity does not locally deform the rendered field.
5. The shader's strongest asset is temporal feedback/tunnel continuity, not cellular membrane morphology.

Using it unchanged as the foreground would regress the exact cavity/topology/material work already achieved in PR #35.

## What to salvage from PR #46

### KEEP

- WebGL2 fullscreen runtime pattern;
- ping-pong feedback targets;
- `u_time` / `u_delta` temporal contract;
- DPR cap;
- visibility/intersection suspension;
- context-loss fallback;
- resource disposal;
- reduced-motion stop/static behavior;
- authored temporal feedback idea.

### ADAPT ONLY IF FRONTIER REVIEW CALLS FOR IT

- a low-intensity rear signal/feedback field behind the Canvas2D organism;
- bounded temporal persistence inside the aperture;
- optional state-linked field intensity;
- future `KDX-FX-*` extraction after canonical kit governance.

### DO NOT PORT UNCHANGED

- red palette;
- concentric tunnel-ring dominance;
- eight-blade radial motif;
- duplicate visual-state ownership;
- a second full-screen heavy renderer unless measured performance and visual gain justify it.

## Proposed layer relationship

```text
REAR SIGNAL FIELD (optional recovered/tuned GPU feedback)
        ↓
PRIMARY ORGANISM (current Canvas2D membrane)
        ↓
APERTURE / OCCLUSION
        ↓
SEMANTIC UI / CTA / truthful telemetry
```

The optional GPU field must remain visually subordinate. It may add depth or temporal memory but cannot replace the membrane's semantic state contract.

## Integration gate

Do not integrate GPU into the current fidelity route merely because the recovery lane exists.

Sequence:

1. finish current FULL-motion frontier review of PR #35;
2. if the review identifies insufficient rear-field depth/temporal persistence, perform one bounded A/B integration;
3. keep Canvas2D as state owner and foreground organism;
4. cap GPU contribution to a rear/aperture field;
5. rerun desktop + 390×844 + 412×915 + REDUCED/OFF/fallback evidence;
6. measure performance before retaining two render layers;
7. creator review decides whether the combined version is stronger.

## Verdict

`PR #46 = COMBINE AS OPTIONAL KDX-FX/REAR-FIELD SOURCE, NOT PRIMARY THRESHOLD REPLACEMENT.`

No merge, public-route change, KOD-50 authorization or deployment is implied by this decision.
