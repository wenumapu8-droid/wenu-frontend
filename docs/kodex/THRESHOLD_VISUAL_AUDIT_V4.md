# KOD-49 — THRESHOLD Visual Audit v4

Status: **FRONTIER_REVIEW_READY / CREATOR_REVIEW_PENDING**  
Deployment: **BLOCKED**

This audit follows the material/topology pass on the native Canvas2D membrane and the successful desktop/mobile state-evidence run. It does not declare `FRONTIER_VISUAL_PASS` or creator acceptance.

## Evidence head

- branch: `feature/kodex-threshold-visual-scaffold-v1`
- material renderer commit: `316f5d11c06783719edfe5d971fdb1a57acb87e7`
- diagnostic/QA head: `edb381b06637a3c25fa95dacdfc30457a52d1de6`
- Threshold Fidelity CI: PASS
- Vertical Slice build: PASS
- evidence viewports: desktop 1440×1000, mobile 390×844, mobile 412×915
- evidence modes: FULL/OPEN, FULL/DECAY, REDUCED, OFF

## State contract

State trace is now deterministic across all three viewports:

```text
desktop:   AWARE → OPEN → DORMANT
390×844:   AWARE → OPEN → DORMANT
412×915:   AWARE → OPEN → DORMANT
```

The pointer is moved once to the shared focal point, then left stationary. `OPEN` therefore proves elapsed-time dwell rather than repeated pointer events. A single move outside the influence field then decays to `DORMANT` without additional movement.

## Material delta since v3

The previous visual candidate read as a regular violet cavity collar around a largely flat central aperture. The new native renderer now adds:

- explicitly irregular elliptical cavities with independent aspect ratio, rotation, depth and radial position;
- bridge/tendril connections between selected cavities;
- a matte obsidian outer shell separated from localized violet internal matter;
- foreground/background cavity ordering;
- dark occlusion veins crossing the internal field;
- broken mineral/specular rim arcs instead of a continuous luminous outline;
- an irregularized central aperture boundary;
- lower-amplitude embedded metadata/glyph texture;
- responsive material scaling while preserving the shared focal contract.

## Current visual judgment

### Composition — PASS FOR FRONTIER REVIEW

The organism remains the dominant event on desktop and mobile. Copy avoids replacing the aperture as the visual center. Mobile is recomposed vertically rather than treated as a scaled desktop canvas.

### Material hierarchy — SUBSTANTIAL PASS

The scene now distinguishes:

1. black atmospheric field;
2. matte obsidian organism mass;
3. localized violet internal matter;
4. cavity depth/occlusion;
5. mineral/specular edge events;
6. semantic UI.

The previous global purple treatment is materially reduced.

### Topology — SUBSTANTIAL PASS

The cavity system no longer behaves as a uniform ring of equal circular holes. Elliptical voids, bridges and occlusion layers establish a more biological/mineral topology.

A remaining art-direction concern is that the outer silhouette still resolves as one large coherent membrane body rather than a truly unstable/metaball field. This is now a frontier/creator judgment, not a deterministic defect.

### Interaction — DEVICE QA PASS

Focal point, dwell, decay and semantic state are synchronized across tested viewports. Entry remains explicit; proximity alone never crosses the gate.

### Reduced motion — DEVICE QA PASS

Reduced and OFF modes remain readable and preserve the semantic action. Meaning is not dependent on continuous movement.

## Remaining frontier questions

Frontier/creator review should answer only these bounded questions:

1. Does the outer silhouette need one more level of asymmetric breakup/metaball separation?
2. Is the aperture sufficiently alive, or should the central opening deform more strongly in FULL motion?
3. Are the mineral highlights too restrained or appropriately subordinate?
4. Does mobile preserve enough negative space around the organism/copy boundary?
5. Does the FULL breathing behavior read as organismic rather than generic procedural animation when watched continuously?

## Gate decision

`CONTRACT / BUILD / DEVICE QA: PASS`

`FRONTIER VISUAL: READY FOR REVIEW — NOT YET PASS`

`CREATOR VISUAL: PENDING`

Do not open a public route replacement and do not deploy. KOD-50 remains outside this visual-fidelity write lane until the KOD-49 visual gate is explicitly closed or the orchestrator creates a non-conflicting lane.
