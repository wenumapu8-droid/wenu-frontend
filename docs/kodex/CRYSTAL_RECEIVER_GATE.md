# KODEX−∞ // CRYSTAL RECEIVER v0 — REPRODUCIBLE GATE

Status: ACTIVE QA GATE
Route: `/kodex/device/crystal/`
PR: #83

## Purpose

This gate turns the CRYSTAL RECEIVER proof into a deterministic acceptance surface. It tests runtime behavior, persistence, epistemic separation, accessibility, responsive layout and reduced-motion handling without asserting any metaphysical meaning for the captured content.

## Runtime state contract

`DORMANT → AWARE → RECORDING → COHERENT → CRYSTAL`

Derived states are computed from accumulated records:

- DORMANT: no persisted records.
- AWARE: one or more records below recurrence/coherence thresholds.
- COHERENT: `count >= 3`, `recurrences >= 2`, `coherence >= 0.55`.
- CRYSTAL: `count >= 5`, `recurrences >= 4`, `coherence >= 0.72`.

Opening capture temporarily sets RECORDING. Closing capture without committing must return to the derived state from current telemetry.

## Epistemic invariant

The proof must preserve these layers:

1. RECEIVED — raw observation.
2. INTERPRETED — optional observer interpretation stored separately.
3. CORRELATED — future/manual relationship layer; v0 does not auto-create it.
4. VERIFIED — external verification only; v0 never auto-promotes to it.

Hard invariant:

`RECEIVED` MUST NEVER AUTOMATICALLY BECOME `VERIFIED`.

## Test A — cold start

1. Clear site storage for `kodex.crystal.receiver.v0`.
2. Load `/kodex/device/crystal/`.

Expected:

- STATE = DORMANT
- SOURCE = UNKNOWN
- DENSITY = D0
- COHERENCE = 0.00
- RECURRENCE = 00
- MEMORY = 00
- capture is closed

## Test B — activate and capture

1. Press central ◈ once.
2. Expect AWARE.
3. Press again.
4. Expect RECORDING and focus in RAW SIGNAL.
5. Select GLYPH.
6. Enter raw signal: `spiral`.
7. SYMBOL / FORM: `spiral`.
8. COLOR: `blue`.
9. NUMBER: `3`.
10. CLARITY: 80.
11. Commit.

Expected:

- MEMORY = 01
- STATE = AWARE
- record visibly labels raw content as RECEIVED
- SOURCE remains UNKNOWN
- no VERIFIED state is activated

## Test C — interpretation separation

1. Open capture.
2. Enter RAW SIGNAL: `three points around a ring`.
3. Enable ADD INTERPRETATION LAYER.
4. Confirm separate INTERPRETATION field appears.
5. Enter: `may represent a triadic structure`.
6. Commit.

Expected:

- memory entry preserves raw observation under RECEIVED
- interpretation appears separately under INTERPRETED
- raw content is not relabeled as interpretation
- VERIFIED remains inactive

## Test D — deterministic COHERENT state

Starting from cleared storage, create three records with:

- SYMBOL = `spiral`
- different RAW SIGNAL text is allowed
- CLARITY = 80 for all three
- other tags may be empty

The exact SYMBOL match produces three pairwise recurrence hits across three records.

Expected after record 3:

- MEMORY = 03
- RECURRENCE >= 03
- COHERENCE >= 0.55
- STATE = COHERENT

Then:

1. Open capture.
2. Close without committing.

Expected:

- STATE returns to COHERENT, not AWARE.

## Test E — deterministic CRYSTAL state

Starting from cleared storage, create five records with:

- SYMBOL = `spiral`
- COLOR = `blue`
- NUMBER = `3`
- CLARITY = 90 for all five

Expected after record 5:

- MEMORY = 05
- recurrence comfortably exceeds the CRYSTAL threshold
- COHERENCE >= 0.72
- STATE = CRYSTAL

Then:

1. Open capture.
2. Close without committing.

Expected:

- STATE returns to CRYSTAL.

## Test F — persistence

1. Reach any non-empty state.
2. Reload page.

Expected:

- records survive reload via localStorage
- MEMORY is restored
- telemetry is recomputed
- derived state is restored from current records

## Test G — reset

1. Press RESET LOCAL PROOF.

Expected:

- localStorage key `kodex.crystal.receiver.v0` is removed
- memory list becomes empty
- MEMORY = 00
- DENSITY = D0
- COHERENCE = 0.00
- STATE = DORMANT

## Test H — accessibility

Keyboard-only:

- central receiver control is reachable by Tab
- it exposes a meaningful accessible name
- capture controls, modes, textareas, sliders and reset are keyboard reachable
- focus-visible is visible
- interactive controls are not descendants of `aria-hidden=true`

Screen-reader semantic check:

- state changes are announced through the polite/atomic live region
- decorative geometry is hidden from the accessibility tree
- RAW SIGNAL and INTERPRETATION are distinguishable fields

## Test I — viewport evidence

Capture evidence at:

- desktop: 1440×900 or larger
- mobile A: 390×844
- mobile B: 412×915

For each viewport capture:

1. DORMANT
2. RECORDING with interpretation field open
3. memory with at least one RECEIVED + INTERPRETED record
4. COHERENT or CRYSTAL state

Reject if:

- horizontal overflow appears
- core control is clipped
- telemetry becomes unreadable
- fields collide
- reset becomes unreachable

## Test J — reduced motion

Run with `prefers-reduced-motion: reduce`.

Expected:

- no essential state or information depends on animation
- transitions/animations collapse effectively to instant changes
- device remains fully usable
- telemetry and state changes remain visible

## Gate decision

PASS requires:

- A–J pass
- no automatic RECEIVED → VERIFIED transition
- no loss of COHERENT/CRYSTAL after opening and closing capture
- persistence/reset verified
- mobile evidence at both required viewports
- reduced-motion evidence

Until browser evidence exists, status remains:

`CONTRACT: PASS CANDIDATE`
`CODE REVIEW: PASS CANDIDATE`
`BROWSER EVIDENCE: PENDING`
`INTEGRATION INTO THRESHOLD: BLOCKED`
