# KODEX−∞ M1 Vertical Slice Runtime

Status: `LOGIC PROTOTYPE / CREATOR REVIEW REQUIRED`

Branch: `feature/kodex-m1-vertical-slice`

Deployment: `BLOCKED`

## What this branch proves

This branch adds a noindex logic laboratory for the first connected A–Y subgraph.

It proves the relation between:

```text
NODE RECIPE
+ COMMITTED ACTION
+ PRIVACY-MINIMIZED MEMORY
+ STATE-DEPENDENT EDGE
+ MUTATED REVISIT
+ OPTIONAL M
+ TRACE-DERIVED Y
```

It does not claim that the complete visual vertical slice is implemented.

## Coordinate status

Canonical:

- `A` — Threshold / common origin;
- `M` — optional distributed Heart;
- `Y` — trace-derived Return.

Proposed and still requiring Ocín approval:

- `B` — Signal Vortex;
- `C` — Archive Trace Field;
- `H` — Cosmology Core;
- `K` — Archive Tree.

The runtime must not be used as evidence that these proposed assignments are accepted canon.

## Files

```text
src/kodex/experience/
├── types.ts
├── verticalSliceRecipes.ts
└── VerticalSliceRuntime.ts

src/components/kodex/experience/
└── kodex-vertical-slice-client.ts

src/pages/kodex/lab/
└── vertical-slice.astro
```

## Laboratory route

```text
/kodex/lab/vertical-slice/
```

The route is `noindex, nofollow` and does not replace the public KODEX experience.

## Memory model

The prototype stores only local session continuity data:

- current coordinate and mutated instance;
- route trace;
- visit counts;
- committed actions;
- explicit memory flags;
- opened source placeholders;
- traced relations;
- ignored signal markers;
- M manifestations and exact return anchor;
- deterministic growth stage;
- generated Return artifacts.

The lab persists this state in browser `localStorage` under:

```text
kodex:m1:vertical-slice:memory:v0.1.0
```

No network write is performed.

## Runtime rules

### A

One explicit orientation action is required before an exit appears:

- signal → B;
- trace → C;
- relation → H.

### B

- observing the attractor enables H;
- isolating an echo enables C;
- an isolated echo may reappear in B′ after source inspection in C;
- M appears only after committed signal actions;
- Y appears only when the complete trace is eligible.

### C

- opening a source records provenance access;
- tracing a relation creates an archive seed and enables K;
- C may send a trace back into B;
- M requires both source access and a traced relation.

### H

- selecting an orbit creates a relation and enables K;
- displacing the center enables B or B′;
- M requires sufficient relational evidence or a previous M visit.

### K

Growth is explicit and staged:

```text
NONE → SEED → ROOT → TRUNK → BRANCHING → CROWN
```

- planting is a committed action;
- growth never advances passively;
- a branch selection may return to H;
- M requires at least BRANCHING;
- Y requires at least TRUNK plus global Return eligibility.

### M

- entry stores the exact prior coordinate as `returnAnchor`;
- M may be acknowledged without ranking or diagnosis;
- Return restores the exact coordinate and creates a mutated instance;
- M has no conventional exit list because restoration is an explicit action.

### Y

Return eligibility currently requires:

- at least three distinct intermediate coordinates among B, C, H and K;
- at least three committed actions in intermediate coordinates;
- at least one relational evidence type: source, relation, signal echo or rooted growth.

`GENERATE_RETURN` creates a deterministic artifact manifest containing the actual route, actions, flags, source access, relations, M status, growth stage, unresolved questions and re-entry options.

## Delayed consequence

The implemented delayed-consequence path is:

```text
B / ISOLATE_ECHO
→ C / OPEN_SOURCE
→ B′ / B_PRIME_ECHO_STABILIZED
→ Y / artifact contains the echo history
```

This is state logic only. The later visual manifestation must be implemented through the VORTEX adapter after QA.

## Debug API

In the browser console:

```js
window.__kdxM1.snapshot();
window.__kdxM1.serialize();
window.__kdxM1.act("ORIENT_SIGNAL");
window.__kdxM1.go("B");
window.__kdxM1.reset();
```

This API is for internal QA, not a public product contract.

## Manual test route without M

```text
A
ORIENT_SIGNAL
→ B
OBSERVE_ATTRACTOR
→ H
SELECT_ORBIT
→ K
PLANT_SEED
ADVANCE_GROWTH × 3
→ Y
GENERATE_RETURN
```

Depending on the action count and exact growth stage, additional interaction may be required before Y becomes available. The interface exposes only currently valid exits.

## Manual delayed-echo route

```text
A
ORIENT_SIGNAL
→ B
ISOLATE_ECHO
→ C
OPEN_SOURCE
TRACE_ARCHIVE_RELATION
→ B′
OBSERVE_ATTRACTOR
→ H
SELECT_ORBIT
→ K
PLANT_SEED
ADVANCE_GROWTH × 2 or more
→ Y
GENERATE_RETURN
```

Confirm:

- route includes `B′`;
- flag `B_PRIME_ECHO_STABILIZED` exists;
- flag `DELAYED_ECHO_PENDING` is removed;
- Return artifact contains the mutated route.

## Manual M route

```text
A → B
OBSERVE_ATTRACTOR
ISOLATE_ECHO
→ M
ACKNOWLEDGE_RELATION
RETURN_TO_ANCHOR
```

Confirm:

- M manifestation is `M@SIGNAL`;
- `returnAnchor` is B during M;
- Return creates B′;
- M visit is recorded without a score.

## Known boundaries

- ORBITAL and GROWTH renderers are not implemented here;
- C uses a planned FIELD binding with no approved source packet yet;
- M and Y intentionally have no forced organism family;
- the graph uses a finite M1 condition resolver, not the complete A–Y edge resolver;
- source IDs are placeholders until corpus ingestion assigns verified records;
- no server persistence, analytics or public contribution exists;
- build, browser and device QA are still required.

## Production boundary

```text
PUBLIC ROUTE REPLACEMENT: FORBIDDEN IN THIS BRANCH
CANONICAL ASSIGNMENT CLAIM: FORBIDDEN BEFORE CREATOR REVIEW
DEPLOYMENT STATUS: BLOCKED
REQUIRED AUTHORIZATION: APROBAR DEPLOY
```
