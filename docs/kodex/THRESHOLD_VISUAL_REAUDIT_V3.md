# KOD-49 — THRESHOLD Visual Re-Audit v3

Status: **REWORK / D7 SYNCHRONY FIXED / MATERIAL GAP REMAINS**

This re-audit inspects the current KOD-49 device evidence after the focal-point and stationary-dwell correction. It evaluates the rendered still states against the v1 decomposed reference contract. Continuous motion quality is **not** scored from still captures.

## Evidence inspected

Head: `339e53c41caf088c86aa7dadfd875d048b3546ad`

Workflows:
- `KODEX Threshold Fidelity CI` run `31825588096` — SUCCESS
- `KODEX Vertical Slice` run `31825588155` — SUCCESS

QA artifact:
- name: `kodex-threshold-fidelity-qa`
- id: `9228711705`
- digest: `sha256:729f90a43a31f4a4ce7139bbbe2caf34c9ef32a7d451349564a43cc4101fb3c7`

Current captures inspected:
- `threshold-desktop-full-open.png`
- `threshold-desktop-full-decayed.png`
- `threshold-390x844-full-open.png`
- `threshold-412x915-reduced.png`

Browser acceptance now proves:
- desktop focal sync + stationary dwell reaches OPEN;
- 390×844 focal sync + stationary dwell reaches OPEN;
- 412×915 focal sync + stationary dwell reaches OPEN;
- predictable decay back to DORMANT on all three viewports;
- no horizontal overflow;
- keyboard FULL → REDUCED → OFF control;
- native canvas present;
- entry remains explicit.

## Provisional scores

These are visual-direction scores, not release gates.

`VISUAL_IMPACT (still-frame provisional): 67 / 100`

`NATIVE_IMPLEMENTATION (structural / CI): 72 / 100`

Motion quality is excluded from the Visual Impact score until an 8–12 s FULL-motion capture/manual browser pass is reviewed.

| Dimension | Score | Current evidence |
|---|---:|---|
| composition / focal hierarchy | 8/10 | dominant organism + strong headline; desktop overlap is now intentional |
| typography / editorial rhythm | 8/10 | headline, microtype and telemetry read as one system |
| object material complexity | 4/10 | improved shell/cavities, but visible result still reads as layered violet field + circular cavity necklace |
| depth / Z separation | 6/10 | scene has multiple planes; organism interior still behaves largely as one shallow plane |
| KODEX-specific system density | 7/10 | truthful telemetry and indexing are now substantial without becoming fake HUD |
| palette / light | 6/10 | obsidian/violet direction holds; broad violet bands still carry too much of the form |
| mobile composition | 8/10 | focal object is large, cropped with intention and remains present into the text transition |
| finish / reference-level presence | 6/10 | strong designed screen; material object is not yet reference-grade |

## What is now accepted structurally — preserve

1. **D7a focal synchrony:** page semantics and membrane now use the same focal contract: desktop `0.60 / 0.46`, compact `0.50 / 0.32`.
2. **D7b stationary dwell:** OPEN no longer depends on pointer-event count; elapsed dwell works while the pointer remains stationary.
3. Explicit voluntary entry remains separate from atmospheric proximity.
4. No fake biometrics/authentication/energy/frequency telemetry was introduced.
5. Desktop/mobile have no horizontal overflow.
6. Mobile is compositionally distinct rather than a shrunken desktop poster.
7. Reduced and OFF states remain available.
8. Macro `THRESHOLD`, source/state microcopy and visual index remain subordinate to the semantic headline.

## Remaining frontier deltas

### D9 — Break the circular cavity necklace

Current still-frame problem: although the renderer contains 26 non-uniform cavities, the visible result resolves as a fairly regular annulus of dark circular holes around the aperture.

Target property: biological/mineral topology rather than radial ornament.

Implementation target:
- keep only ~10–14 clearly readable circular/near-circular cavities;
- turn 8–12 others into elliptical, merged, clipped or partially occluded voids;
- add 6–10 bridge/tendril/strut forms that cross or hide cavity edges;
- produce at least 3 visibly different cavity scales;
- remove any immediate impression of a uniform ring around the aperture.

Do not copy the reference mesh. Preserve the system property: irregular high-curvature shell with cavities that belong to the material.

### D10 — Material hierarchy, not broad violet bands

Current problem: the organism is more complex than v1, but large translucent violet layers still define most of its volume. The outer contour reads as a large smooth poster-shape outline.

Target:
- matte obsidian body carries mass;
- narrow mineral/chrome highlights reveal local curvature;
- violet appears primarily as internal/translucent signal matter;
- outer contour stops functioning as the dominant object boundary.

Implementation target:
- reduce outer contour prominence ~30–40%;
- reduce broad violet field opacity ~15–25%;
- increase localized rim/specular contrast around selected cavities ~25–35%;
- create at least three visibly distinct material responses: matte shell / mineral rim / translucent internal signal.

### D11 — Add internal occlusion and real Z variation

Current problem: shell, cavities and aperture separate from the page, but the cavity field itself remains visually shallow.

Implementation target:
- 4–6 cavities partially disappear behind foreground shell/bridge forms;
- 3–5 cavities sit deeper with lower contrast/smaller scale;
- at least 2 foreground structural forms cross the cavity field;
- internal violet matter should appear behind shell edges rather than simply glowing beneath all layers;
- preserve central aperture legibility.

### D12 — Preserve current composition while material work changes

Do **not** solve D9–D11 by adding more UI, labels or global glow.

Preserve:
- desktop headline scale and left/right tension;
- current mobile object scale/crop;
- current truthful telemetry density;
- explicit CTA placement;
- monochrome + mineral violet signal discipline.

The remaining gap is primarily the **organism**, not the editorial frame.

### D13 — FULL-motion frontier evidence required

CI now proves motion semantics, not motion quality.

Before `FRONTIER_VISUAL_PASS`, capture:
- desktop FULL motion, 8–12 s, including far → near → stationary OPEN → far decay;
- 390×844 FULL motion, 8–12 s, same state path.

Frontier reviewer must inspect:
- local deformation actually follows the nearest region rather than globally scaling;
- breath feels slow/organic and not like an obvious short loop;
- cavity bridges and specular response remain coherent while moving;
- the transition to OPEN does not collapse the organism into a simple expanding ring.

## Routing

### Frontier / difficult renderer work

D9–D11 are now frontier-level material/topology decisions. Route to the frontier renderer lane (Claude Max / Codex according to current factory ownership), not to a volume worker as open-ended art direction.

### Deterministic worker

Only take bounded QA/CSS/test deltas after D9–D11 are specified by the frontier review. Do not independently redesign the membrane.

## Gate

`D7a/D7b: FUNCTIONAL + DEVICE QA PASS`

`D9–D11: REWORK`

Next:

`FRONTIER MATERIAL IMPLEMENTATION → CI + DEVICE CAPTURES → FULL-MOTION RE-AUDIT → CREATOR VISUAL REVIEW`

This document does not authorize merge, public `/kodex/` replacement, KOD-50 write-lane activation or deployment.
