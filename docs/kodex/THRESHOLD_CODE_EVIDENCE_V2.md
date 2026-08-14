# KOD-49 — THRESHOLD Code Evidence Re-Audit v2

Status: `CODE EVIDENCE UPDATED / VISUAL VERDICT PENDING`

This note re-checks the current KOD-49 branch after the D4/D5/D6/D8 deterministic-delta merge. It is **not** a `FRONTIER_VISUAL_PASS` and it is **not** creator acceptance. Current device captures and FULL-motion behavior still require frontier/creator visual review.

## Evidence inspected

- branch: `feature/kodex-threshold-visual-scaffold-v1`
- head: `9a6a907d1a2398991499b83a010f80aab87f45fc`
- `src/components/kodex/threshold/KodexThresholdMembrane.astro`
- `src/pages/kodex/lab/threshold-fidelity/index.astro`
- latest `KODEX Threshold Fidelity CI`: run `31267026027` — `SUCCESS`
- latest QA artifact: `kodex-threshold-fidelity-qa` id `9024472625`
- artifact digest: `sha256:282284865c9ccbd75dd319f0a7fc62b7fbd9c8d5cc0c95bbe17a08dce80a74c5`

## D1–D8 code-evidence status

| Delta | Code evidence | Status before visual re-audit |
|---|---|---|
| D1 asymmetric living shell | Renderer declares 5 structural lobes and 26 non-uniform cavities; shell radius uses multi-frequency irregularity and pointer-angle deformation. Separate 6–12 bridge/tendril forms are not clearly represented as a distinct construct in the inspected code. | `PARTIAL / STRONGER` |
| D2 chrome/mineral material | Dark shell layers, localized pale mineral rim, brighter partial specular arc and translucent violet cavity fields are implemented. | `SUBSTANTIAL / VISUAL CHECK REQUIRED` |
| D3 internal information texture | Embedded atmosphere uses truthful labels including `THRESHOLD`, `A / −∞`, `IDENTITY CLAIM: NONE`; no fabricated measurements were found in the inspected component. | `STRUCTURAL PASS` |
| D4 Z-depth / overlap | Macro layer, depth veil, organism/copy overlap strategy and revised focal placement exist. Actual 58–68% desktop occupation and mobile crop still need screenshot measurement. | `IMPLEMENTED TARGET / DEVICE CHECK REQUIRED` |
| D5 truthful editorial density | Scene/renderer/pointer/identity/motion/state/memory/entry clusters are explicit and truthful; visual index is labelled `NOT AUTH`. | `STRUCTURAL PASS` |
| D6 macro typography | Low-contrast `THRESHOLD` macro layer exists while canonical headline remains semantic foreground copy. | `STRUCTURAL PASS` |
| D7 local material deformation | Shell radius and cavity positions react to pointer direction; renderer dwell accumulates frame-by-frame; FULL breathing is multi-period; REDUCED/OFF freeze continuous breathing. Two state-sync defects remain below. | `PARTIAL / BLOCKED BY D7a+D7b` |
| D8 mobile hierarchy | Renderer focal center is moved to `y ≈ 0.32h`; mobile composition overlays copy below/through the organism and reduces telemetry. Exact 12–16svh start / 34–42svh occupation still needs current-device evidence. | `IMPLEMENTED TARGET / DEVICE CHECK REQUIRED` |

## New blocking deltas

### D7a — Align the semantic hotspot with the rendered membrane

The renderer and page-level state machine currently use different focal coordinates.

Renderer (`KodexThresholdMembrane.astro`):
- desktop: `x = 0.60w`, `y = 0.46h`
- compact/mobile: `x = 0.50w`, `y = 0.32h`

Page state logic (`threshold-fidelity/index.astro`):
- desktop: `x = 0.64w`, `y = 0.50h`
- compact/mobile: `x = 0.50w`, `y = 0.39h`

Impact: the visible membrane can react at one center while `DORMANT / AWARE / OPEN` telemetry is evaluated against another. The mobile Y mismatch is approximately 7% of viewport height and is large enough to be perceptible.

Smallest deterministic fix:
- define one shared focal-point contract and use it in both renderer and page state logic; or
- expose the membrane focal point/state through a custom event/data attribute and have the page consume that single source.

Acceptance:
- pointer/touch at the visible aperture center must activate the same state in renderer and semantic telemetry on desktop, `390×844`, and `412×915`.

### D7b — Make dwell time-based, not pointer-event-count-based

The renderer accumulates dwell continuously while proximity remains high, but the page-level `OPEN` state only increments its `dwell` inside `pointermove` events.

Impact: a stationary pointer/touch near the aperture can continue opening the visual membrane while page telemetry remains `AWARE`. Current CI can still pass because it accepts either `AWARE` or `OPEN` after a dispatched move.

Smallest deterministic fix:
- derive page state from elapsed near-time in the existing timer/RAF; or
- make the renderer emit canonical visual-state changes and remove duplicate dwell logic from the page.

Acceptance:
- enter the near zone once, stop moving, and confirm progression `DORMANT → AWARE → OPEN` after the intended dwell interval;
- leaving the influence zone must decay back predictably;
- REDUCED/OFF retain discrete semantic states without continuous animation.

## Non-blocking observations

1. The current component now satisfies much more of D1/D2/D3/D7 structurally than the v1 audit candidate.
2. Latest CI is green and captures FULL-proximity mobile states plus OFF mode, which is stronger evidence than v1.
3. Build/CI evidence still does not establish material quality, focal occupation, Z-depth quality, or creator-level finish.
4. Do not open KOD-50/ARCHIVE as a new write lane from this audit. Current factory queue keeps KOD-49 active until handoff/gate completion.

## Next gate

`FIX D7a + D7b → CI + CURRENT DEVICE CAPTURES → FULL-MOTION FRONTIER RE-AUDIT → CREATOR VISUAL REVIEW`

Required visual verdict remains one of:
- `FRONTIER_VISUAL_PASS`; or
- `REWORK` with measurable deltas.

Deployment remains blocked. This note does not authorize public `/kodex/` replacement or production deployment.
