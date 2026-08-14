# KOD-49 — THRESHOLD Frontier Review Packet

Status: **READY FOR FRONTIER VISUAL REVIEW**  
Creator review: **PENDING**  
Deployment: **BLOCKED**

## Read only

1. `docs/kodex/THRESHOLD_FIDELITY_BRIEF.md`
2. `docs/kodex/THRESHOLD_VISUAL_AUDIT_V4.md`
3. `src/components/kodex/threshold/KodexThresholdMembrane.astro`
4. current KOD-49 QA artifact listed below

Do not reconstruct project history unless a contradiction is found.

## Evidence

QA workflow run: `31831633117`  
Evidence head: `edb381b06637a3c25fa95dacdfc30457a52d1de6`  
Artifact: `kodex-threshold-fidelity-qa`  
Artifact ID: `9230942685`  
Artifact digest: `sha256:dc1928a53ba847b3573908cfd0d81df1e94d6202856d743e584ef7654a23f344`

Primary visual files:

- `threshold-desktop-full-open.png`
- `threshold-desktop-full-decay-check.png`
- `threshold-desktop-reduced.png`
- `threshold-desktop-off.png`
- `threshold-390x844-full-open.png`
- `threshold-390x844-full-decay-check.png`
- `threshold-390x844-reduced.png`
- `threshold-390x844-off.png`
- `threshold-412x915-full-open.png`
- `threshold-412x915-full-decay-check.png`
- `threshold-412x915-reduced.png`
- `threshold-412x915-off.png`
- `state-trace.txt`
- `browser-acceptance.txt`

## Verified device/state result

```text
desktop:aware:AWARE
desktop:open:OPEN
desktop:decay:DORMANT
390x844:aware:AWARE
390x844:open:OPEN
390x844:decay:DORMANT
412x915:aware:AWARE
412x915:open:OPEN
412x915:decay:DORMANT
```

No repeated pointer movement is used to reach OPEN after the initial focal dispatch.

## What changed materially

Current membrane candidate uses:

- asymmetric five-lobe outer shell;
- 17 irregular elliptical cavity profiles;
- depth-ranked cavity rendering;
- 10 bridge/tendril links;
- internal occlusion veins;
- matte obsidian outer field;
- localized violet internal field;
- broken mineral/specular edge segments;
- irregularized central aperture;
- low-amplitude embedded glyph texture;
- one native Canvas2D renderer with FULL/REDUCED/OFF behavior.

## Frontier task

Return exactly one verdict:

`FRONTIER_VISUAL_PASS`

or

`REWORK`

If `REWORK`, provide **no more than five** ordered measurable deltas. Do not redesign the full scene.

Judge these axes:

1. **focal dominance** — organism vs copy vs telemetry;
2. **material credibility** — obsidian / mineral / violet hierarchy;
3. **topological richness** — cavities/bridges/occlusion vs generic blob/ring;
4. **depth** — internal and atmospheric Z hierarchy;
5. **motion character** — organismic continuous behavior rather than generic procedural breathing;
6. **mobile composition** — independent crop/recomposition and negative space;
7. **reduced/off equivalence** — concept remains legible without continuous motion;
8. **interaction truthfulness** — proximity modulates; explicit semantic choice crosses.

## Bounded questions

- Does the outer silhouette still need stronger separation/metaball breakup?
- Does the aperture need stronger asymmetric deformation in FULL motion?
- Are the mineral edge events visible enough without becoming chrome decoration?
- Is mobile organism/copy spacing convincing at 390×844 and 412×915?
- Does the current cavity/tendril topology now read as living/mineral rather than as a repeated interface motif?

## Non-goals

Do not:

- replace public `/kodex/`;
- authorize deployment;
- change canonical entry semantics;
- add fabricated telemetry;
- add another heavy renderer;
- open KOD-50 from this review;
- reinterpret a green build as visual acceptance.

`BUILD_PASS != DEVICE_QA_PASS != FRONTIER_VISUAL_PASS != CREATOR_VISUAL_PASS`.
