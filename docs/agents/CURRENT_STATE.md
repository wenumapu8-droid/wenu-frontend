# CURRENT STATE — KODEX−∞ + WËNU MAPU

Last verified: 2026-08-16.  
Purpose: fast operational truth for agents. This file is **not canon**; re-check Drive canon, active PR heads and exact CI/local artifacts before time-sensitive work.

---

## 1. Release / source-of-truth boundary

Primary repository: `wenumapu8-droid/wenu-frontend`.

Drive canon + exact active PR heads + SHA-bound CI/local artifacts are the operational sources of truth. Draft code does not authorize merge, deployment, permission changes, public asset approval or canon promotion. Protected Ocín originals remain immutable unless explicitly re-authorized.

No standalone current Decision Log was found in the active operational branch or accessible Drive/repo search. Do **not** invent one.

---

## 2. Authoritative Deep Navigation + Assembly OS baseline — PR #62

PR #62 / `feat/kodex-observer-scale-route-v1` remains the sole verified architecture baseline.

Verified baseline head: `1bfc5e4bd0b2fca1d7529dbfffee7b44b6334f20`.  
KODEX Core Runtime run 164: **SUCCESS**.

Technically closed there:
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

P0.1–P0.10 and the focus-restoration/browser gap are technically closed. PR #62 remains OPEN/DRAFT as a release/governance state, not because P0 is unfinished. Do not recreate these contracts or introduce a parallel route/state/memory/renderer/factory architecture.

### Golden Knowledge renderer-consumption refinement — exact-head closed

Evidence from the rendered Golden benchmark showed that the assembler differentiated `GP-SCI-01 → KDX_G07_ARCHIVE_DOSSIER` and `GP-TECH-02 → KDX_G02_SPECIMEN_DOSSIER`, while the prior universal KNOWLEDGE renderer flattened those IDs into one generic diagram.

Renderer dispatch head `7c915df4652376847a80af0b102adcfc7cb9c48d` completed KODEX Core Runtime run 280 / `31956937243`: **SUCCESS**. `KodexPlateSpecRenderer.astro` now consumes the already-selected registered GRID element for the bounded existing set G01/G02/G07, with explicit GENERIC fallback for other safe Knowledge compositions.

Structural-fingerprint head `172562fd92dedc6a28e8c235cc0d763239bf2b61` completed KODEX Core Runtime run 281 / `31959985612`: **SUCCESS** across scene/runtime, JourneyState/graph/memory, full Assembly OS contracts, seeded benchmark, integrity audit, Astro build, general browser evidence, Deep Navigation and strengthened Golden browser evidence.

Artifact: `kodex-evidence` id `9267004535`; digest `sha256:79d82a0b9aef87592d59d3467d5437e8b39101dd88e418e67ea8fb63daffc160`.

The strengthened Golden report records `renderer_status=BROWSER_EVIDENCE_PASS`, `knowledge_structure_dispatch=BROWSER_EVIDENCE_PASS`, zero errors, and three unique registered Knowledge IDs producing three unique structural fingerprints:
- `KDX_G07_ARCHIVE_DOSSIER → ARCHIVE_DOSSIER|archive-dossier|hero,record,signal-bridge`;
- `KDX_G01_ORBITAL_RELIC → ORBITAL_RELIC|orbital-relic|chamber,rail`;
- `KDX_G02_SPECIMEN_DOSSIER → SPECIMEN_DOSSIER|specimen-dossier|provenance,specimen`.

Benchmark anchors are preserved exactly: `GP-SCI-01 → G07` and `GP-TECH-02 → G02`. This closes the specific renderer-consumption/structural-diversity blind spot.

### Golden macro-hierarchy refinement — exact-head browser validated

Run-281 artifact review found a narrower perceptual residue: SCI/G07 and TECH/G02 were structurally distinct but still shared too much macro-template hierarchy — oversized title, similar central negative-space mass and similar lower framing. This was localized to presentation hierarchy, not ElementContract, PlateSpec, assembler scoring or registered IDs.

Existing #62 branch was advanced in place to exact head `067ada580d72d7bf4118bfd92f395645168ea77f`. The delta is presentation-only:
- new `src/styles/kodex-golden-curatorial.css`, scoped by existing `data-knowledge-structure` semantics;
- existing Golden case route imports that stylesheet;
- `G07 / ARCHIVE_DOSSIER` becomes a broad full-width unequal archive hero/record field with subordinate horizontal metadata;
- `G02 / SPECIMEN_DOSSIER` becomes a narrower vertical specimen/provenance dossier with a smaller headline and tall metadata column;
- `<=760px` explicitly returns both structures to the prior bounded mobile stack;
- G01 remains unchanged in this cycle.

KODEX Core Runtime run 283 / `31965803870`: **SUCCESS** on exact head `067ada580...`. All stages passed: runtime/JourneyState, full Assembly OS contracts, seeded benchmark, integrity audit, Astro build, general browser evidence, Deep Navigation and rendered Golden Plate evidence.

Artifact: `kodex-evidence` id `9268478660`; digest `sha256:1d247892007253474aa9d6e150721c145ee5174340d37d975105d1f8d5fbd92a`.

Golden report retains `knowledge_structure_dispatch.pass=true`, zero errors, and three unique registered Knowledge IDs → three unique structural fingerprints. Actual run-283 desktop captures were inspected: `GP-SCI-01 / G07` now reads as a large archive field with dominant hero/record mass, while `GP-TECH-02 / G02` reads as a smaller centered specimen/provenance dossier with a separate tall metadata column. The prior macro-template similarity is materially reduced at agent-audit level.

Unchanged across this refinement: ElementContract, registry, PlateSpec, deterministic assembler/scoring, copy compiler, Deep Route, JourneyState/memory, provenance/rights and protected Ocín contracts.

Status: **G07-vs-G02 MACRO-HIERARCHY REFINEMENT = EXACT-HEAD BROWSER-VALIDATED IMPLEMENTATION EVIDENCE / ARTIFACT INSPECTED**. `human_curator_acceptance = NOT_RUN`; this is not creator approval.

### Living-field activation compatibility repair — exact-head CI pending

A correctness gap was found while auditing `GP-CON-03 / CON-RITUAL`. The Golden living-field fixture used `activation_id=KDX-FX-006` with `scene_state=COSMOLOGY`. `KDX-FX-006` is registered and ACTIVATOR-compatible, but its ElementContract permits scene roles `DESCENT / RETURN` only. Prior QA checked registry existence but did not validate the living-field `activation_profile.activation_id` against current plate + scene compatibility.

PR #62 was advanced **in place** to current exact head `4a3ba88babfcb8729c75ef55a8f3b64b9ff17b8c` with a bounded contract repair:
- Golden benchmark v0.1.3 now uses existing registered `MOTION_03_FIELD_MARBLE` for `CON-RITUAL`; that element allows `ACTIVATOR_PLATE + COSMOLOGY`, has VERIFIED project provenance/rights, reduced-motion fallback and meaning preserved without motion;
- Assembly QA v0.1.1 adds FIELD-only `ACTIVATION_COMPATIBILITY` as a hard contract check: activation ID must resolve to the normalized registry and satisfy eligible status, VERIFIED provenance, PROJECT_SOURCE rights, current plate compatibility, current scene compatibility and motion-independent fallback/accessibility;
- deterministic assembler tests now prove the living-field fixture is registered + plate/scene-compatible;
- Assembly QA includes a negative regression that substitutes `KDX-FX-006` and requires `ACTIVATION_COMPATIBILITY=FAIL`.

This changes no PlateSpec schema, deterministic selection/scoring, Deep Route, JourneyState, protected-art adapter, Ocín source originals or human-curator state. It is a validator/fixture correction against already-registered ElementContract truth, not a new activation architecture or canon decision.

Status: **IMPLEMENTED CANDIDATE / EXACT-HEAD KODEX CORE RUNTIME EVIDENCE PENDING**. Do not call this delta TESTED until a containing run on `4a3ba88...` completes SUCCESS.

`GP-CON-03` remains a separate perceptual/materiality concern after correctness is revalidated. Do not solve its scaffold-like appearance by weakening activation compatibility or inventing a parallel activation registry.

`GP-ART-03` remains source-byte WITHHELD; no protected-art materiality or no-crop visual acceptance may be inferred from that placeholder.

---

## 3. Other lanes / authority boundaries

- **PR #70** — current volumetric/materiality benchmark; creator acceptance pending.
- **PR #73** — RGX technical-family baseline; not default/final materiality.
- **PR #75** — reference-fidelity creator-review surface; source pixels NONE.
- **PR #76** — verified Manifestation × RGX convergence substrate; reuse, do not fork.
- **PR #79** — composition-only mobile PROLOGUE proof from an older #77 head; not an architecture authority or safe replacement for current #77 without explicit reconciliation.
- **PR #80** — composition-only mobile ARCHIVE proof stacked on #79; same boundary.
- **PR #78** — externally MERGED/CLOSED despite its prior `HOLD — EXTRACTION-ONLY / NOT ASSEMBLY OS AUTHORITY` warning. Do not reinterpret that merge as Assembly OS canon promotion. Normalize useful HoloCore observations through #62 contracts only.

---

## 4. Product corridor — PR #77

PR #77 / `feat/kodex-threshold-convergence-v1` advances the existing #68 product corridor only. It does not own or replace Assembly OS, Deep Navigation, JourneyState or the existing `kx-journey` / `KodexRecuerda` / `src/kodex/return/memory.js` substrate.

### Seven-room technical composition close — run #73

Current exact corridor head: `6387ae29cd4827ec73a96caa23863941b3891674`.

Product Corridor run #73 / `31954166230`: **SUCCESS**.

Build + THRESHOLD + PROLOGUE + DESCENT + ARCHIVE + MACHINE + COSMOLOGY + RETURN all pass the strengthened current browser gates on the same exact head.

Artifact: `kodex-product-corridor-evidence` id `9265613767`; digest `sha256:7209b5c10fc566bcc74ce90a563f74eaebd201051fa80302a81045060d7e1b45`.

RETURN passes desktop 1440×900, mobile 390×844, mobile 412×915 and reduced-motion for the existing 100dvh/no-scroll, deterministic non-curated journey specimen, `kx-journey` memory, CRT/fallback, route/action, resource-health and overlap checks, including the strengthened `actionsArtOverlap=false` assertion.

Artifact inspection closes the prior mobile blind spot rather than relying on machine PASS alone. In the 390×844 evidence, outbound actions end at x≈187.19 while the CRT/specimen artifact begins at x≈198.61; the 412×915 capture also shows the action lane materially separated from the right-side artifact field. Headline/action and other previously measured overlaps remain clean.

Status: **SEVEN-ROOM CORRIDOR = MECHANICALLY/BROWSER-COMPOSITION COMPLETE AT CURRENT ACCEPTANCE LEVEL**.

This does **not** mean creator aesthetic acceptance, canon promotion, merge, deployment, public preview publication or production readiness. PR #77 remains OPEN/DRAFT. Do not modify the seven rooms without new measured regression evidence or creator-requested bounded refinement.

---

## 5. Execution / preview policy

**KOD-69** is the zero-cost evidence lane. If provider CI is unavailable, run the same repository-native build/browser gates locally or self-hosted on the Mac mini and preserve SHA-bound evidence. Hosted green is not itself the quality requirement. Do not manually loop hosted reruns.

**KOD-48** remains the continuous preview lane. Preparing preview workflow/config/artifacts is allowed; actually publishing a noindex/staging URL is a separately gated publishing/deployment action. Do not claim a preview URL exists unless verified live and do not publish without the existing explicit authorization policy (`APROBAR DEPLOY`).

Audit findings are not scene completion. A room changes technical state only through implementation plus required evidence.

---

## 6. Strategic condition

Strategic mode: **convergence + curation + perceptual refinement**.

Primary risks:
- mistaking CI green for creator acceptance or perceptually valid composition when the gate misses overlap/readability;
- adding architecture instead of converging existing systems;
- fabricated telemetry;
- parallel schemas/registries/status vocabularies;
- registered IDs being treated as compatible without plate/scene/fallback validation;
- contaminated historical branches becoming convergence bases;
- browser lifecycle/scheduling races producing false room failures;
- science / metaphor / cultural provenance / inference / implementation / testing / deployment collapsing into one truth label;
- treating protected-art curation as public-use approval.

`BUILD LESS. CURATE HARDER. LET MEMORY CREATE COMPLEXITY.`

---

## 7. Exact next action

1. Keep #77 draft and mechanically closed unless new measured evidence appears; do not reopen corridor architecture.
2. Keep #62 as sole Assembly OS authority; P0.1–P0.10, registered-composition dispatch, structural fingerprint and run-283 G07/G02 macro-hierarchy refinement remain verified evidence.
3. Let exact-head KODEX Core Runtime execute on `4a3ba88...`; verify the new living-field activation compatibility contract plus the full Golden/browser chain before calling the repair TESTED.
4. If green, return to `GP-CON-03` as a separate perceptual/materiality problem. Do not weaken `ACTIVATION_COMPATIBILITY`, alter assembler scoring or invent a parallel activation registry to improve appearance.
5. Keep `human_curator_acceptance=NOT_RUN` until actual creator/readability review occurs.
6. Keep protected-art visual/no-crop review blocked while source bytes are WITHHELD; do not infer visual approval from contract integrity.
7. Preserve user agency, keyboard/focus, touch parity, reduced-motion/fallbacks, 100dvh/no-scroll, provenance and Ocín artwork integrity.
8. No merge, deploy, permission change, preview publication, public asset approval or canon promotion is authorized.
