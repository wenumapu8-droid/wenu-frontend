# KODEX HoloCore Prototype v0.2

Date: 2026-08-14  
Status: **IMPLEMENTED + BROWSER VERIFIED / CREATOR VISUAL REVIEW PENDING / NOT PUBLIC / NOT DEPLOYED**  
Route: `/kodex/lab/holocore/`  
Branch: `feat/kodex-holocore-prototype-v1`  
PR: `#63`

## Purpose

Prove one reusable central KODEX visualization chamber: a bounded viewport that boots, resolves a concept as machine-readable signal, sustains a seamless ambient loop, reacts lightly to pointer input, and becomes a stable static phase under `prefers-reduced-motion`.

Prototype specimen: **ORBITAL CITY**. It is a KODEX speculative visualization, not a factual engineering model.

## Thesis / design contract

**CANONICAL FOR THIS PROTOTYPE:** `KODEX does not merely display an object; the HoloCore materializes a reading of it.`

Operational translation:

`CONCEPT → SIGNAL FIELD → ASCII RESOLUTION → BOUNDED PROJECTION → LOOP → INTERACTION → RETURN TO LOOP`

The ASCII layer is a representation mechanism, not generic retro decoration.

## Drive reference and provenance boundary

Source atlas: `07A_KODEX_VISUAL_ATLAS_MASTER — Inventario, Nodos y Conexiones`  
Spreadsheet ID: `1RLhA2xmApx1YDfHIeWjIqlYz17OHkuxFbfUXejzcS_4`  
ATLAS row: `103`  
IMAGE_ID: `KDX-ROOT-RAW-009`  
PRIMARY_CONCEPT: `ASCII REACTOR / ENERGY CORE`  
SCENE: `MACHINE / LAB`  
Referenced Drive asset: `KODEX∞ — Production Poster — ASCII Reactor.png` / file ID `1V4jYmlU4YrL-BhiQNW5otQtTVXn0KZ-d`.

The poster was inspected as a **visual/system reference only**. Its pixels, exact cage morphology, labels and composition are not embedded, copied or transformed in the runtime. The implementation extracts abstract system properties: bounded technical viewport, ASCII/data-dither signal language, core/axis behavior, signal streaming, restrained telemetry and looped materialization.

A Drive trace comment is attached to `ATLAS!S103` with the verified GitHub run and artifact identifiers.

## Existing infrastructure reused

- `src/kodex/ascii/engine/AsciiRenderer.js`
- `src/kodex/ascii/config/glyph-sets.js`
- existing responsive ASCII profiles
- existing pointer handling and FPS budget
- existing reduced-motion behavior
- existing `/kodex/lab/` noindex convention

No new npm dependency was added.

## Runtime files

- `src/components/kodex/holocore/KodexHoloCore.astro`
- `src/kodex/ascii/scenes/holocore-orbital.js`
- `src/pages/kodex/lab/holocore.astro`
- `scripts/kodex-holocore.test.mjs`
- `scripts/kodex-holocore-browser-evidence.mjs`

## HoloCore lifecycle

`DORMANT → BOOT → RESOLVING → STABLE LOOP ∞`

Normal motion waits until the visual settle transition has completed before declaring `STABLE LOOP`.

Reduced motion waits for font readiness, renders a stable procedural phase, stops the renderer, disables the scan/boot animations and then declares the stable state.

## ORBITAL CITY v0.2

The v0.2 field increases conceptual legibility at coarse ASCII resolution while preserving the original runtime contract:

- central tether / transmission axis;
- five stacked orbital strata;
- crown, upper, habitat, service and lower rings;
- filled hubs and horizontal decks;
- structural inner/mid rails;
- denser module clusters;
- counter-moving signal traffic;
- atmospheric signal field;
- diagrammatic planetary horizon;
- bidirectional signal packets.

Every animated term derives from integer multiples of one declared 24 second phase. The exact loop seam remains machine-tested.

## Base reconciliation

The feature branch was reconciled with the current `feat/kodex-observer-scale-route-v1` base through merge commit:

`564eda01cdc0fc23355cbc1f4f1d0fff7be3c3dd`

The current upstream Assembly OS, seeded factory benchmark and Golden Plate gates were preserved. HoloCore validation is additive; the prototype does not remove or bypass newer shared gates.

Current validated head:

`6b23956d4b65c1bc560c10303a822f8ecfff2a1a`

PR #63 is currently **mergeable** but intentionally remains **draft** pending creator visual acceptance.

## Verified CI / browser evidence

KODEX Core Runtime run `31832185056` / run #166: **SUCCESS**.

Passed on the synchronized HoloCore head:

1. `npm ci`.
2. KODEX core tests.
3. HoloCore field finite/normalized test.
4. exact 24 s HoloCore loop-seam test.
5. bounded pointer perturbation test.
6. JourneyState / graph / memory / Visible Assembly tests.
7. Assembly OS contract tests.
8. seeded factory benchmark.
9. KODEX integrity audit.
10. Astro build.
11. Chromium installation and preview boot.
12. generic KODEX browser evidence.
13. deep-navigation browser evidence.
14. HoloCore desktop 1440×900 browser evidence.
15. HoloCore mobile 390×844 browser evidence.
16. HoloCore reduced-motion browser evidence.
17. rendered Golden Plate benchmark.

Evidence artifact: `kodex-evidence`  
Artifact ID: `9231178596`  
Digest: `sha256:2d1a66a046b9296a083c3ea992e20528589390c48dd6dd15cf42fb7ce9835368`

## Epistemic / production ledger

| Claim | Status | Evidence |
|---|---|---|
| HoloCore name/direction for this prototype | CANONICAL FOR PROTOTYPE | creator direction + implementation record |
| ASCII Reactor is a source reference | VERIFIED | Drive atlas row 103 |
| Source pixels are used by runtime | FALSE / NOT CLAIMED | procedural implementation |
| Orbital City is physically plausible as depicted | SPECULATIVE / NOT CLAIMED | no engineering validation |
| 24 s loop closes exactly | VERIFIED | core test + run #166 |
| Desktop browser containment/living loop | VERIFIED | run #166 |
| Mobile 390×844 containment | VERIFIED | run #166 |
| Reduced-motion static phase | VERIFIED | run #166 |
| Current shared factory / Golden Plate gates still pass | VERIFIED | run #166 |
| Final visual quality is creator-approved | NEEDS_CONFIRMATION | explicit visual review still required |
| HoloCore is public/deployed | FALSE / NOT CLAIMED | lab-only, noindex, feature branch |

## Current visual assessment boundary

The present v0.2 render is a **working architecture and art-direction proof**. It is more legible than v0.1, with a stronger stacked axial structure, but it is not being declared the final KODEX visual master.

The remaining decision is qualitative rather than technical: creator review of the actual desktop/mobile render, especially specimen recognizability, scan-field intensity, ASCII density, hierarchy and whether the projection feels sufficiently holographic without becoming generic sci-fi UI.

## Next implementation after creator acceptance

Generalize the hard-coded first specimen into a registry:

`concept id → specimen field / asset adapter → behavior profile → glyph profile → palette → surface treatment → fallback`

This is the step that turns one proven HoloCore into the reusable central visualization runtime for many KODEX concepts.

## AI production record

Agent/model: OpenAI GPT-5.6 Sol  
Date: 2026-08-14  
Inputs: creator direction, KODEX governance/source architecture, Drive Visual Atlas row 103 and referenced poster, existing repo-native ASCII runtime, current observer-scale/Assembly OS branch, GitHub Actions evidence.  
Output: HoloCore component, ORBITAL CITY v0.2 procedural specimen, lab route, tests, browser harness, current workflow integration, branch reconciliation, Drive trace record and this status document.  
Human validation: **final visual acceptance pending**.
