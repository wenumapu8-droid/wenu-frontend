# KODEX HoloCore Prototype v0.1

Date: 2026-08-14  
Status: **IMPLEMENTED LAB PROTOTYPE / NOT PUBLIC / NOT DEPLOYED**  
Route: `/kodex/lab/holocore/`  
Branch: `feat/kodex-holocore-prototype-v1`

## Purpose

Prove one reusable version of the central KODEX visualization chamber discussed as **HoloCore**: a bounded viewport that boots, resolves a concept as machine-readable signal, maintains an ambient seamless loop, responds lightly to pointer input, and freezes to a stable phase under `prefers-reduced-motion`.

The prototype concept is **ORBITAL CITY**. It is not a factual engineering model. It is a KODEX speculative visualization implemented as a procedural ASCII field.

## Thesis / design contract

**CANONICAL DIRECTION:** `KODEX does not merely display an object; the HoloCore materializes a reading of it.`

Operational translation:

`CONCEPT → SIGNAL FIELD → ASCII RESOLUTION → BOUNDED PROJECTION → LOOP → INTERACTION → RETURN TO LOOP`

The ASCII layer is not used as generic retro decoration. It is the representation layer through which the machine resolves the specimen.

## Drive evidence used

Source atlas: `07A_KODEX_VISUAL_ATLAS_MASTER — Inventario, Nodos y Conexiones`  
Spreadsheet ID: `1RLhA2xmApx1YDfHIeWjIqlYz17OHkuxFbfUXejzcS_4`  
ATLAS row: `103`  
IMAGE_ID: `KDX-ROOT-RAW-009`  
PRIMARY_CONCEPT: `ASCII REACTOR / ENERGY CORE`  
SCENE: `MACHINE / LAB`  
MOTION: `core oscillation; code-field streaming; cage microflex; signal bursts`  
INTERACTION: `modulate signal density and observe reactor stability without implying physical energy generation`  
NEXT_ACTION: `Extract ASCII Reactor template and reusable data-dither layer`

Referenced Drive asset: `KODEX∞ — Production Poster — ASCII Reactor.png`  
Drive file ID: `1V4jYmlU4YrL-BhiQNW5otQtTVXn0KZ-d`.

### Provenance boundary

The poster was inspected as a **visual/system reference**. Its pixels are **not embedded in this runtime** and are **not transformed** by the prototype. The implementation extracts only abstract system properties: bounded technical viewport, ASCII/data-dither field, core oscillation, signal streaming, and restrained telemetry. This keeps reference and implementation separate.

## GitHub evidence reused

Existing implementation infrastructure reused rather than replaced:

- `src/kodex/ascii/engine/AsciiRenderer.js`
- `src/kodex/ascii/config/glyph-sets.js`
- existing responsive profile logic and reduced-motion freeze in `AsciiRenderer`
- existing `/kodex/lab/` internal-route convention

No new npm dependency was added.

## Files added

- `src/components/kodex/holocore/KodexHoloCore.astro`
  - bounded emulator shell;
  - boot → resolving → stable-loop states;
  - telemetry / grid / scan / CRT surface layer;
  - reduced-motion CSS;
  - mounts existing `AsciiRenderer`.
- `src/kodex/ascii/scenes/holocore-orbital.js`
  - pure procedural orbital-city field;
  - 24 second mathematically closed phase;
  - axial spine, orbital rings, modules, atmosphere and planetary interface;
  - bounded pointer perturbation.
- `src/pages/kodex/lab/holocore.astro`
  - internal 100dvh/no-page-scroll lab plate;
  - `noindex, nofollow`;
  - one real HoloCore instance.
- `scripts/kodex-holocore.test.mjs`
  - finite/normalized field test;
  - exact loop-seam contract;
  - pointer-bound contract.

## Epistemic / production ledger

| Claim | Status | Evidence |
|---|---|---|
| HoloCore is the chosen name/direction for this prototype | CANONICAL | user direction + this implementation record |
| ASCII Reactor is a Drive reference for reusable data-dither / MACHINE-LAB language | VERIFIED | Asset Atlas row 103 |
| Orbital City is physically plausible as depicted | SPECULATIVE | no engineering validation; not claimed |
| HoloCore code exists on a feature branch | VERIFIED | files above |
| 24 s field closes mathematically | IMPLEMENTED / PREVIOUS CI CORE TESTS PASSED | `kodex-holocore.test.mjs` + KODEX Core Runtime run #108 |
| Desktop 1440×900 bounded/no-scroll proof | PASSED IN FIRST BROWSER RUN | HoloCore evidence artifact from run #108 |
| Mobile 390×844 browser proof | PATCHED / NEEDS FRESH CI | first harness measured entry `transform: scale()` as layout overflow |
| Reduced-motion static browser proof | PATCHED / NEEDS FRESH CI | first harness fingerprinted before font/canvas stabilization |
| Browser/mobile visual quality is accepted | NEEDS_CONFIRMATION | fresh CI + human visual review still required |
| HoloCore is deployed/public | FALSE / NOT CLAIMED | lab-only branch and noindex route |

## Acceptance target

Before this prototype can be called browser-validated:

1. `npm ci` succeeds.
2. `npm run test:kodex:core` succeeds, including HoloCore tests.
3. `npm run audit:kodex:integrity` succeeds.
4. Astro build succeeds.
5. Chromium evidence at 1440×900 confirms bounded 100dvh and no page-level scroll.
6. Mobile evidence at 390×844 confirms contained viewport and no page-level scroll.
7. Reduced-motion evidence confirms static phase and no animated scan/pulse.
8. No public KODEX route is changed.
9. The feature branch is synchronized or conflict-resolved against its active base before review/merge.

## Validation update — 2026-08-14

First GitHub Actions run: `KODEX Core Runtime` run #108, head `0d8996fca2d1887205e214df936e4e5100656535`.

Confirmed PASS in that run:

- `npm ci`;
- KODEX scene/runtime tests;
- JourneyState + graph + memory bridge + Visible Assembly tests;
- Assembly OS contract tests available on that head;
- KODEX integrity audit;
- Astro build;
- Chromium installation and preview boot;
- general KODEX browser evidence;
- deep-navigation vertical slice;
- HoloCore desktop 1440×900 living-loop evidence.

The HoloCore-specific browser step failed only on mobile containment evidence and reduced-motion fingerprint evidence. The runtime itself was not shown to be the cause of those two failures.

Patch applied to `scripts/kodex-holocore-browser-evidence.mjs`:

- wait for `document.fonts.ready`;
- wait for stable canvas backing/layout dimensions;
- distinguish CSS layout dimensions from temporary transformed visual bounds;
- preserve strict document/root overflow checks;
- re-run reduced-motion fingerprint only after canvas stabilization.

A fresh workflow run has **not** been generated for the patched head through the connector, so these fixes remain `PATCHED / NEEDS FRESH CI`, not green.

## Branch-health update

The base branch `feat/kodex-observer-scale-route-v1` advanced substantially while this prototype was being validated. The HoloCore branch is currently diverged and materially behind the moving base. The shared workflow also gained grammar, factory benchmark and Golden Plate validation on the base.

The HoloCore workflow file was reconciled to a **superset of current base validation + HoloCore validation** so the feature branch does not silently remove newer gates. This does not substitute for an actual branch synchronization/rebase/merge.

Do not mark this PR ready, green or mergeable until:

- branch conflict/synchronization is resolved;
- a workflow run executes on the synchronized/patched head;
- HoloCore desktop/mobile/reduced-motion evidence passes;
- human visual review accepts the plate.

## Visual-fidelity note

The current ORBITAL CITY specimen is an architecture proof, not a high-fidelity reconstruction of `KDX-ROOT-RAW-009 / ASCII REACTOR`.

Observed in the Drive poster:

- black field;
- dominant white macro typography;
- high-luminance acid-green central core;
- reflective/chrome-like cage structure;
- multicolor ASCII/data-dither clouds;
- sparse technical callouts.

The current HoloCore proof intentionally uses a lower-contrast violet orbital signal field. Therefore visual fidelity to ASCII Reactor must not be overstated. The next specimen after browser acceptance should test the reference-to-motion method more directly with a stable luminous core, procedural cage proxy, data-dither field and state-bounded signal bursts without copying poster pixels, exact cage morphology, labels or layout.

## Next iteration after acceptance

Generalize the renderer contract from the current `orbital-city` specimen to a registry:

`concept id → specimen field / asset adapter → behavior profile → palette → surface treatment → fallback`

That turns HoloCore from one prototype into the reusable central visualization runtime for KODEX pages.

## AI production record

Agent/model: OpenAI GPT-5.6 Sol  
Date: 2026-08-14  
Input basis: current user direction, GitHub implementation branch, KODEX source/governance docs, Drive Asset Atlas row 103, the referenced ASCII Reactor poster, and GitHub Actions/browser-evidence artifacts from run #108.  
Output: implementation/test files, evidence-harness patch, workflow-base reconciliation, Drive motion-engine bridge record, and this updated implementation record.  
Human validation: pending.  
Uncertainty: mobile/reduced-motion fixes and current branch integration have not been revalidated by fresh CI.
