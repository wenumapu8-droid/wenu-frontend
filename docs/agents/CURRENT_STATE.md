# CURRENT STATE — KODEX−∞ + WËNU MAPU

Last verified: 2026-08-16.  
Purpose: fast operational truth for agents. This file is **not canon**; re-check Drive canon, active PR heads and exact CI/artifacts before time-sensitive work.

---

## 1. Release / source-of-truth boundary

Primary repository: `wenumapu8-droid/wenu-frontend`.

Drive canon + exact active PR heads + CI/artifacts are the operational sources of truth. Git commits/draft PRs do not authorize merge, deployment, permission changes, public asset approval or canon promotion. Protected Ocín originals remain immutable unless explicitly re-authorized.

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
- **PR #78** — externally **MERGED/CLOSED on 2026-08-15** despite its own `HOLD — EXTRACTION-ONLY / NOT ASSEMBLY OS AUTHORITY` warning. Do not reinterpret that merge as Assembly OS canon promotion. Its branch-local HoloCore dialect remains descriptive material only unless records are explicitly normalized through #62's ElementContract/schema/registry validators on a bounded delta. Reconcile ancestry before using `main` as an Assembly OS convergence base.

---

## 4. Product corridor — PR #77

PR #77 / `feat/kodex-threshold-convergence-v1` advances the existing #68 product corridor without owning/replacing Assembly OS or Deep Navigation architecture.

### Verified through MACHINE

Product Corridor run `31919010988` on head `4acc2cd0fc618157620af9ff3f3770833c6f3a45` passed install/build/preview plus THRESHOLD, PROLOGUE, DESCENT, ARCHIVE and ARCHIVE→MACHINE/MACHINE across their required product profiles before COSMOLOGY became the first failure.

Artifact `9255841751`; digest `sha256:9be4fe12bb197e4c0d939e777efb492f4047dd3fde7b0fc3bc7f1c51f985f322`.

MACHINE is **browser-revalidated**. The earlier unsourced `INTEGRITY · 98.7%` defect remains repaired to explicit `NOT MEASURED`. Do not describe billing as a current MACHINE blocker and do not manually loop hosted reruns.

### COSMOLOGY — semantic/input repairs implemented

The current COSMOLOGY component has six canonical concept nodes, five ecosystem portals, semantic keyboard controls and a real six-node compact touch fallback. `SIGNAL → MACHINE` is concept-to-concept; MACHINE is not a fabricated sixth portal.

Product Corridor run `31925233229` on head `7f3eb45c7998c3e199fdc66966e852f46ba6afe2`, artifact `9257704746`, digest `sha256:c9dc4b718cf5be71af33b3dff734ef59f065929b01d239bb2109dd7a6d62fb86`, reduced the remaining COSMOLOGY failure to desktop/reduced-motion pointer activation. Mobile 390×844 and 412×915 passed, including touch SIGNAL→MACHINE.

The bounded repair `5a4ab173cf79cf67f7e4812a24d26251f85a9abe` changes only `src/components/kodex/CosmologyMap.astro`: semantic SVG concept groups use `pointer-events: bounding-box`, making the existing label+dot bounding area one reliable pointer target. Visual geometry, six concepts, five portals, relation semantics, keyboard/touch behavior, routing, memory, reduced-motion and Assembly OS contracts are unchanged.

### Run #44 — PROLOGUE evidence attribution bug, not product regression

Natural Product Corridor run `31930350111` (#44) executed on `5a4ab173...`. Build and THRESHOLD passed, then PROLOGUE reported failure before later gates could run.

Artifact `9259110102`; digest `sha256:f26e47aca8ad1cbccbaff3f1b4ff7c554fe7382fc1041ef014ba68b62d8a5528`.

Exact artifact inspection shows:
- PROLOGUE mobile: **PASS**;
- PROLOGUE reduced-motion: **PASS**;
- desktop completed bounded geometry, CRT/fallback, protocol drawer focus restoration, visit memory and `BEGIN OBSERVATION` navigation;
- failure was recorded only after the page had already reached `/kodex/folio/ii/`, when an external `fonts.gstatic.com` Inter Tight `.woff2` request returned HTTP 404.

Exact compare `7f3eb45... → 5a4ab173...` changes only `src/components/kodex/CosmologyMap.astro` (+4/-1), proving no PROLOGUE product code changed. The harness was attributing destination-page console/HTTP errors back to the source room because it asserted its accumulated arrays only after route transition.

### Current head — bounded evidence-ownership repair

Current PR #77 head: `5a60ba7c8b450675907b65b1f36e0d7db29c9643`.

Only `scripts/kodex-prologue-product-evidence.mjs` changed (+16/-5 versus `5a4ab173...`). It now:
- asserts PROLOGUE source-room console/HTTP health before crossing the CTA route boundary;
- preserves exact `BEGIN OBSERVATION → /kodex/folio/ii/` navigation acceptance;
- records post-transition errors as `transitionDiagnostics` rather than retroactively failing PROLOGUE;
- does not ignore/filter source-room errors or weaken geometry/focus/memory/navigation criteria.

Natural Product Corridor run `31932682697` (#48) is **IN PROGRESS** on this exact head at last check. No manual hosted rerun was triggered.

Status: **COSMOLOGY REVALIDATION PENDING BEHIND A REPAIRED PROLOGUE EVIDENCE-ATTRIBUTION BOUNDARY**. RETURN remains blocked until COSMOLOGY itself passes and the exact artifact is inspected.

---

## 5. Execution / preview policy

**KOD-69** is the zero-cost evidence lane. If provider CI is unavailable, run the same repository-native build/browser gates locally or self-hosted on the Mac mini and preserve SHA-bound evidence. Hosted green is not itself the quality requirement. Do not manually loop hosted reruns.

**KOD-48** remains the continuous preview lane. Preparing preview workflow/config/artifacts is allowed; actually publishing a noindex/staging URL is a separately gated publishing/deployment action. Do not claim a preview URL exists unless verified live and do not publish without the existing explicit authorization policy.

---

## 6. Strategic condition

Strategic mode: **convergence + curation + perceptual refinement**.

Primary risks:
- mistaking CI green for creator acceptance;
- adding architecture instead of converging existing systems;
- fabricated telemetry;
- parallel schemas/registries/status vocabularies;
- contaminated historical branches becoming convergence bases;
- cross-route evidence attribution that makes one room fail for another room's resource/runtime errors;
- scientific fact / metaphor / cultural provenance / inference / implementation / deployment state collapsing into one label;
- treating protected-art curation as public-use approval.

`BUILD LESS. CURATE HARDER. LET MEMORY CREATE COMPLEXITY.`

---

## 7. Exact next action

1. Let natural Product Corridor run `31932682697` finish on exact head `5a60ba7...`; do not manually spam hosted reruns.
2. Inspect the exact artifact. Confirm PROLOGUE source-room health remains green and post-transition diagnostics are correctly scoped.
3. Inspect COSMOLOGY desktop/390×844/412×915/reduced-motion. Promote only on actual PASS.
4. If COSMOLOGY still fails, repair only the measured input/layout delta; no new architecture and no weakened gate.
5. After COSMOLOGY closes, move the product frontier to RETURN. Existing finding that RETURN lacks a finished product-facing visual layer remains diagnosis until implementation + browser QA.
6. Separately preserve #62 as sole Assembly OS authority; its next bounded renderer delta remains G01/G02/G07 dispatch + structural fingerprint evidence.
7. Treat merged PR #78 as a reconciliation hazard, not an authority override; normalize any useful HoloCore observations through #62 contracts only.
8. Preserve user agency, keyboard/focus, touch parity, reduced-motion/fallbacks, 100dvh/no-scroll, cultural/source provenance and Ocín artwork integrity.
9. No merge, deploy, permission change, public asset approval or canon promotion is authorized.
