# KODEX−∞ Manifestation Recipe P0.4

**Status:** IMPLEMENTED_CANDIDATE / ADDITIVE / NO DEPLOY

## Objective

Connect the currently verified Semantic IR → Geometric Transduction → Natural Law → Geometric Memory lineage to the existing `KodexWorld` compositor through one deterministic, stateless recipe contract.

This slice does **not** create another renderer, route engine, memory store, causal state machine or Assembly OS dialect.

## Audited baseline

Base branch: `feat/kodex-geometric-memory-signature-p0-3`

Base exact-green head: `abddd6809e4eba020e8e2cbf24cb97cc0ab509aa`.

Existing implementation reused:

- Semantic IR compiler and existing Assembly OS adapters;
- Geometric Transduction registry with the existing 12 primitive IDs;
- Natural Law trace-only registry/profile;
- Geometric Memory Signature derived from existing route memory only;
- protected Ocín activation contracts;
- `KodexWorld` persistent WebGL2 compositor;
- existing `mirror`, `distort`, `color`, feedback and composite shaders;
- existing mobile/reduced-motion browser evidence infrastructure.

## Important audit finding: RADIAL_SYMMETRY already exists

The requested first operator did **not** require a new shader.

`src/kodex/shaders/mirror.frag` already implements polar radial folding:

- segments → `u_seg` (1..24)
- rotation → `u_angle`
- mix → `u_mix`

P0.4 therefore crosswalks semantic `RADIAL_SYMMETRY` → existing runtime effect `mirror`.

Unsupported imagined parameters such as `reflection_mode` fail closed rather than pretending the current shader implements them.

## New bridge

### `generative-geometry-crosswalk.v0.1.js`

Maps the broader KODEX generative grammar onto the existing Geometric Transduction vocabulary with explicit mapping classes:

- DIRECT
- DERIVED
- COMPOSITE
- VISUAL_ONLY
- UNSUPPORTED

It never creates new primitive IDs. Unknown concepts fail closed.

### `manifestation-recipe.js`

A stateless compiler that consumes:

- semantic intent;
- scene id;
- generative geometry concepts;
- source-scoped Natural Law patterns;
- registered protected Ocín activation metadata;
- bounded visual operators;
- deterministic seed;
- render tier;
- optional existing Geometric Memory Signature.

It emits legal `KodexWorld` runtime parameters plus a traceable deterministic `plan_id`.

Same recipe + same seed + same memory snapshot must compile to the same plan.

## Memory boundary

Memory is never stored here.

The recipe may consume the already-derived Geometric Memory Signature and map descriptive history to bounded visual parameters:

- revisit ratio → bounded radial segment variation / feedback persistence;
- branch density → bounded distortion variation;
- depth band → bounded radial complexity.

These are visual descriptions of route history, not engagement scores or psychological/spiritual profiles.

## Existing `KodexWorld` extension

`KodexWorld` remains the renderer.

P0.4 adds only a narrow `applyPlan(plan)` adapter plus explicit render tiers and measured telemetry fields.

The old 60 Hz-tuned frame interpolation is converted to delta-time damping using exponential decay, preserving approximately the previous feel while reducing refresh-rate dependence.

No shader pipeline replacement occurs.

## Protected Ocín source boundary — current blocker

The requested proof originally called for direct protected Ocín artwork pixels in the live transformation.

The current authoritative protected artwork contracts explicitly say:

- `source_bytes_renderable: false`
- crop: prohibited
- source recolor: prohibited
- source distortion: prohibited
- public export: not approved

P0.4 therefore does **not** bypass that gate.

The lab consumes the registered `OCN-MND-GRY-002` activation contract and visibly reports `WITHHELD_BY_PROTECTED_SOURCE_CONTRACT`, while the live WebGL proof uses a neutral generated substrate.

This proves the integration chain without falsely claiming that protected Ocín source pixels have been authorized.

The exact full success condition `OCÍN ARTWORK PIXELS → GEOMETRIC RULE → TRANSFORMATION` remains blocked until an approved derivative/runtime-safe asset is explicitly registered.

## Lab

Internal route:

`/kodex/lab/manifestation-recipe/`

The lab exposes:

- SOURCE CONTRACT
- PLAN ID
- GEOMETRY CROSSWALK
- OPERATORS
- EXISTING KODEXWORLD STATE
- MEMORY SIGNATURE
- SEED / RENDER TELEMETRY
- LIVE RADIAL SYMMETRY / DISTORT / FEEDBACK controls

Interaction mapping is presentation-only and maps onto existing `KodexWorld` phases:

- DORMANT → E00
- AWARE → T01
- OPEN → M11
- RETURN → R10

No second persistent state machine is introduced.

## Divergent Manifestation Engine lineage

PR #71 / #76 already contain a separate tested causal Manifestation lineage (`POTENTIAL → SIGNAL → INTERFERENCE → TRANSFORMING → REALIZED → TRACE`) that diverged before the current Semantic IR / Natural Law / Geometric Memory stack.

P0.4 does not silently recreate or overwrite it.

This recipe compiler is stateless and can later become a consumer/adapter during an explicit lineage-convergence task. Branch convergence is a separate integration decision because the histories are materially diverged.

## Tests / evidence gates

Unit contract:

`scripts/kodex-manifestation-recipe.test.mjs`

Checks include:

- deterministic plan output;
- `RADIAL_SYMMETRY` reuses `mirror`;
- source bytes remain blocked;
- input memory snapshot is not mutated;
- unknown geometry/operator ids fail closed;
- unsupported operator params fail closed;
- render tiers reduce effect-chain budget deterministically.

Browser evidence:

`scripts/kodex-manifestation-recipe-browser-evidence.mjs`

Profiles:

- desktop 1440×900
- mobile 390×844
- mobile 412×915
- reduced-motion 1280×800

Checks:

- no horizontal overflow;
- live painted WebGL signal;
- explicit protected-source withholding;
- `RADIAL_SYMMETRY → mirror` runtime reuse;
- existing OPEN state activation;
- memory snapshot changes deterministic plan;
- reduced motion compiles to STATIC tier.

## Creator gate

This slice may be promoted only after evidence and creator review:

- MEANING_CARRIED
- DECORATIVE_ONLY
- MISLEADING

Additional review:

- SYSTEMIC_GAIN
- RESOURCE_GAIN
- AUTHORIAL_FIDELITY

## Deployment

No merge or deployment is authorized by this document.
