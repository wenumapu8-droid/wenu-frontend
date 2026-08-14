# KOD-49 — THRESHOLD Visual Audit v5

Status: **D13 EVIDENCE COMPLETE / FRONTIER FULL-MOTION REVIEW READY / CREATOR REVIEW PENDING**  
Deployment: **BLOCKED**

This audit supersedes the evidence-status portion of v4 after adding explicit FULL-motion capture. It does **not** declare `FRONTIER_VISUAL_PASS` or creator acceptance.

## Evidence head

- branch: `feature/kodex-threshold-visual-scaffold-v1`
- evidence head: `acd3a3209d24024f137e5fcb741916ad758c2110`
- Threshold Fidelity CI run: `31849935974` — PASS
- build: PASS
- artifact: `kodex-threshold-fidelity-qa` id `9237215281`
- artifact digest: `sha256:1c3a204c62669dce635bea11335c7856ea12693df7c63261c7b522621aba9ef8`
- still evidence: desktop 1440×1000, 390×844, 412×915; FULL/OPEN, FULL/DECAY, REDUCED, OFF
- FULL-motion evidence:
  - `threshold-desktop-full-motion.webm` — ~11.2 s
  - `threshold-390x844-full-motion.webm` — ~12.92 s

## D13 — FULL-motion evidence

**EVIDENCE PASS.**

The dedicated capture envelope exercises:

```text
DORMANT
→ APPROACH
→ stationary dwell
→ OPEN
→ local pointer perturbation
→ exit from influence field
→ decay
```

The state trace confirms:

```text
desktop: AWARE → OPEN → DORMANT
desktop: full-motion-video: PASS

390×844: AWARE → OPEN → DORMANT
390×844: full-motion-video: PASS

412×915: AWARE → OPEN → DORMANT
```

The two videos are now first-class workflow artifacts rather than an informal local recording.

## What the motion evidence proves

The artifact proves that:

- FULL mode runs continuously long enough for motion review;
- a stationary pointer still reaches `OPEN`;
- the visual/state system tolerates local pointer perturbation without losing the explicit-entry contract;
- the system decays after leaving the influence field;
- desktop and primary mobile motion evidence are reproducible in CI.

It does **not** by itself prove that the motion is artistically sufficient. CI can prove state behavior and evidence existence, not organismic quality.

## Sampled-frame visual read

Frames sampled across both FULL-motion recordings show the composition and material hierarchy remain stable through the temporal cycle: the organism does not collapse, copy remains readable, the aperture remains the focal event, and mobile retains the intended vertical hierarchy.

The sampled frames also suggest that the breathing/deformation is intentionally subtle at multi-second intervals. That is not classified as a defect automatically, but it makes the remaining frontier question precise: **does continuous playback feel alive enough, or does the amplitude need a bounded increase around the aperture/outer silhouette?**

## GPU recovery decision

PR #46 remains a selective source, not a replacement renderer.

Current decision:

`Canvas2D foreground organism + optional future subordinate GPU rear/aperture field only if frontier review identifies insufficient temporal depth.`

Do not add the second renderer merely because it exists. A combined A/B proof is justified only by a specific remaining visual deficiency and must be performance-tested.

## Gate status

- `CONTRACT: PASS`
- `BUILD: PASS`
- `DEVICE QA: PASS`
- `D13 FULL-MOTION EVIDENCE: PASS`
- `FRONTIER VISUAL: EVIDENCE COMPLETE / REVIEW REQUIRED`
- `CREATOR VISUAL: PENDING`
- `DEPLOYMENT: BLOCKED`

## Remaining review questions

Frontier/creator review is now limited to judgment rather than missing evidence:

1. Is the outer silhouette unstable/asymmetric enough?
2. Is aperture deformation amplitude sufficient in continuous FULL playback?
3. Does the organism read as living mineral/membrane rather than a designed perforated object?
4. Are mineral highlights strong enough without becoming chrome/UI decoration?
5. Does the mobile composition preserve sufficient negative space and focal hierarchy through motion?

## Next action

Review the two FULL-motion WebM artifacts at normal speed. Return one of:

- `FRONTIER_VISUAL_PASS`, with brief rationale; or
- `REWORK`, naming the smallest bounded visual delta.

If rework is requested, modify the current Canvas2D organism first. Introduce the recovered GPU rear-field only if the requested delta specifically concerns missing temporal depth/persistence that Canvas2D cannot solve cleanly.

No KOD-50 implementation, merge, public route replacement or deployment is authorized by this audit.
