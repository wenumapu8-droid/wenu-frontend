# CURRENT STATE — KODEX−∞ + WËNU MAPU

Last verified: 2026-08-16.  
Purpose: fast operational truth for agents. This file is **not canon**; re-check Drive canon, active PR heads and exact CI/artifacts before time-sensitive work.

---

## 1. Release / source-of-truth boundary

Primary repository: `wenumapu8-droid/wenu-frontend`.

Drive canon + exact active PR heads + CI/local artifacts are the operational sources of truth. Git commits/draft PRs do not authorize merge, deployment, permission changes, public asset approval or canon promotion. Protected Ocín originals remain immutable unless explicitly re-authorized.

No standalone current Decision Log was found in the active operational branch or accessible Drive/repo search. Do **not** invent one.

---

## 2. Authoritative Deep Navigation + Assembly OS baseline — PR #62

PR #62 / `feat/kodex-observer-scale-route-v1` remains the verified architecture baseline.

Verified head: `1bfc5e4bd0b2fca1d7529dbfffee7b44b6334f20`.  
KODEX Core Runtime run 164: **SUCCESS**.

Already implemented/browser-tested there:
- focus restoration + history/deep links;
- one ElementContract schema + 28 normalized existing elements;
- PlateSpec for KNOWLEDGE_PLATE / JUNCTION_PLATE / ACTIVATOR_PLATE;
- deterministic registered-ID-only assembler;
- 12 Golden Plates across Science / Technology / Art / Consciousness;
- source-linked copy-role compiler;
- protected Ocín activation adapter;
- contract/browser QA separation;
- WorkOrder / StationResult interchange contracts;
- macro chapter factory reusing Deep Route Engine;
- seeded factory benchmark;
- universal PlateSpec renderer + desktop/mobile/reduced-motion Golden evidence.

P0.1–P0.10 and the focus-restoration/browser gap are technically closed. PR remains OPEN/DRAFT as a release/governance state, not because P0 is unfinished.

### Known Golden Knowledge renderer-consumption gap

The assembler already differentiates `GP-SCI-01 → KDX_G07_ARCHIVE_DOSSIER` and `GP-TECH-02 → KDX_G02_SPECIMEN_DOSSIER`, but the universal KNOWLEDGE renderer still flattens those IDs into one generic diagram. Future bounded #62 work remains: consume existing G01/G02/G07 composition semantics and add structural-fingerprint browser evidence. Do not invent IDs or change assembler scoring merely to force visual difference.

---

## 3. Parallel/perceptual lanes

- **PR #70** — volumetric/materiality benchmark; creator acceptance pending.
- **PR #73** — RGX technical-family baseline; not default/final materiality.
- **PR #75** — reference-fidelity creator-review surface; source pixels NONE.
- **PR #76** — verified Manifestation × RGX convergence substrate; reuse, do not fork.
- **PR #78** — externally MERGED/CLOSED despite its own `HOLD — EXTRACTION-ONLY / NOT ASSEMBLY OS AUTHORITY` warning. Do not reinterpret that merge as Assembly OS canon promotion. Normalize useful HoloCore observations through #62 contracts only.

---

## 4. Product corridor — PR #77

PR #77 / `feat/kodex-threshold-convergence-v1` advances the existing #68 product corridor only. It does not own or replace Assembly OS, Deep Navigation, JourneyState or the existing `kx-journey` / `KodexRecuerda` / `src/kodex/return/memory.js` substrate.

### Accepted product evidence before RETURN

Product Corridor run `31932682697` (#48) completed **SUCCESS** on exact head `5a60ba7c8b450675907b65b1f36e0d7db29c9643`.
Artifact `9259831730`; digest `sha256:c5b75d94cd07114cad77020368fcab5a294c6f4a847e737aee49ba698aaa87d4`.

That exact run passed build/preview plus THRESHOLD, PROLOGUE, DESCENT, ARCHIVE, MACHINE and COSMOLOGY across required desktop/mobile/reduced-motion surfaces. COSMOLOGY proved six concepts / five portals, canonical SIGNAL→MACHINE input parity, 100dvh/no-scroll, visit memory, explicit cosmology→return route, no unsourced percentage telemetry and zero first-party console/HTTP errors. Creator/perceptual acceptance remains separate.

### RETURN material memory slice

RETURN consumes the existing `kx-journey` / `readSpecimen('RETURN')` path and materializes the deterministic journey specimen inside the existing RETURN scene. It does not add a second state model or infer identity, emotion, health or spiritual score.

Run `31933274977` (#53) isolated one repeated RETURN defect across desktop 1440×900, 390×844, 412×915 and reduced-motion: the journey specimen was clipped outside the first viewport. Commit `bf9f664e0bf6d5186d14de2df68a38cb9c500d10` changed only `KodexRecuerda.astro`, re-anchoring the same specimen to the top of the existing art plate and reducing only its mobile footprint. RETURN exact-head revalidation remains pending because later corridor runs stopped earlier.

### Run #58 — current exact evidence boundary

Product Corridor run `31935072132` (#58) completed on exact head `3d94b8df2fa18444ac047a591f65a309c153b000`.
Artifact `9260491050`; digest `sha256:37dca161dd423700219f6e73126a4524ffbcc865cec0d73472eb775a908fb97b`.

Exact result:
- THRESHOLD: PASS;
- PROLOGUE: PASS;
- DESCENT: PASS;
- ARCHIVE: PASS;
- MACHINE: PASS;
- COSMOLOGY: FAIL on desktop only at final navigation observation;
- RETURN: NOT RUN.

COSMOLOGY evidence on #58:
- mobile 390×844: PASS;
- mobile 412×915: PASS;
- reduced-motion 1440×900: PASS;
- desktop geometry, 6-concept/5-portal structure, pointer + keyboard SIGNAL→MACHINE, memory and source-room resource checks had already completed before the final failure;
- desktop failed only with `page.waitForURL: Timeout 8000ms exceeded`;
- the desktop failure screenshot already shows the destination `TERRAIN MEMORY / BEFORE RETURN` interlude rendered, while the Playwright lifecycle observer still reports the outgoing `/kodex/folio/v/` page URL.

This is evidence of a navigation-lifecycle sampling race, not a demonstrated COSMOLOGY visual/interaction regression.

### Current #77 head — bounded COSMOLOGY harness repair

Current head: `74d6fd653c03196acd5eb249a36de88a7b79d7ca`.

Commit `74d6fd653c...` changes only `scripts/kodex-cosmology-product-evidence.mjs` (+16/-15 vs `3d94b8df...`). It does **not** modify product code.

The gate now:
1. clicks the existing shared NEXT control with `noWaitAfter` so the click itself does not inherit Playwright's navigation lifecycle race;
2. waits for the browser's actual `window.location.pathname`;
3. explicitly asserts that pathname equals `/kodex/interlude/cosmology-return/`.

The destination contract is unchanged. Geometry, six concepts/five portals, SIGNAL→MACHINE semantics, pointer/keyboard/touch parity, visit memory, telemetry checks, product routes and Ocín assets are untouched.

Status: **HARNESS REPAIR IMPLEMENTED / EXACT-HEAD REVALIDATION PENDING**. Do not call COSMOLOGY newly accepted from this commit until SHA-bound evidence executes. RETURN remains **VIEWPORT REPAIR IMPLEMENTED / PRODUCT REVALIDATION PENDING** because #58 never reached it.

---

## 5. Execution / preview policy

**KOD-69** is the zero-cost evidence lane. If provider CI is unavailable, run the same repository-native build/browser gates locally or self-hosted on the Mac mini and preserve SHA-bound evidence. Hosted green is not itself the quality requirement. Do not manually loop hosted reruns.

**KOD-48** remains the continuous preview lane. Preparing preview workflow/config/artifacts is allowed; actually publishing a noindex/staging URL is a separately gated publishing/deployment action. Do not claim a preview URL exists unless verified live and do not publish without the existing explicit authorization policy (`APROBAR DEPLOY`).

---

## 6. Strategic condition

Strategic mode: **convergence + curation + perceptual refinement**.

Primary risks:
- mistaking CI green for creator acceptance;
- adding architecture instead of converging existing systems;
- fabricated telemetry;
- parallel schemas/registries/status vocabularies;
- contaminated historical branches becoming convergence bases;
- browser lifecycle/scheduling races producing false room failures;
- science / metaphor / cultural provenance / inference / implementation / testing / deployment collapsing into one truth label;
- treating protected-art curation as public-use approval.

`BUILD LESS. CURATE HARDER. LET MEMORY CREATE COMPLEXITY.`

---

## 7. Exact next action

1. Revalidate exact head `74d6fd653c...` using the natural Product Corridor execution if it runs, or KOD-69 Mac mini local/self-hosted execution if provider CI is unavailable. Do **not** manually spam hosted reruns.
2. Require COSMOLOGY desktop + 390×844 + 412×915 + reduced-motion PASS with the unchanged exact destination `/kodex/interlude/cosmology-return/`.
3. If COSMOLOGY passes, require the same execution to reach RETURN and inspect RETURN desktop/390/412/reduced-motion artifact after the `bf9f664e...` viewport repair.
4. If RETURN fails, repair only its measured memory/materiality/viewport/input delta inside #77. Do not introduce a new state/memory/renderer architecture.
5. If RETURN passes and artifact inspection confirms the journey specimen is inside the first viewport and deterministic, mark the seven-room corridor technically complete while keeping creator acceptance and preview publication separate.
6. Only after corridor closure return the Assembly OS frontier to #62's bounded G01/G02/G07 renderer dispatch + structural fingerprint gate unless creator review establishes a higher-priority defect.
7. Preserve user agency, keyboard/focus, touch parity, reduced-motion/fallbacks, 100dvh/no-scroll, provenance and Ocín artwork integrity.
8. No merge, deploy, permission change, preview publication, public asset approval or canon promotion is authorized.
