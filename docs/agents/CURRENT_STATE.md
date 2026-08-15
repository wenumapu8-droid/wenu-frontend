# CURRENT STATE — KODEX−∞ + WËNU MAPU

Last verified: 2026-08-16.  
Purpose: fast operational truth for agents. This file is **not canon**; re-check Drive canon, active PR heads and exact CI/artifacts before time-sensitive work.

---

## 1. Repository / release boundary

Primary repository: `wenumapu8-droid/wenu-frontend`.

Git commits or draft PRs do not authorize merge, deployment, permission changes, public asset approval or canon promotion. No protected Ocín source original may be modified, cropped, recolored, distorted or treated as publicly approved merely because it appears in a registry or internal lab.

---

## 2. Authoritative technical baseline — PR #62

PR #62 / `feat/kodex-observer-scale-route-v1` remains the verified Deep Navigation + Assembly OS baseline.

Verified head: `1bfc5e4bd0b2fca1d7529dbfffee7b44b6334f20`.  
KODEX Core Runtime run 164: **SUCCESS**.

Already implemented and tested there:

- deliberate browser focus restoration + history/deep-link behavior;
- one ElementContract schema + 28 normalized existing repo-native elements;
- PlateSpec for KNOWLEDGE_PLATE / JUNCTION_PLATE / ACTIVATOR_PLATE;
- deterministic seedable registered-ID-only assembler;
- 12 Golden Plates spanning Science / Technology / Art / Consciousness;
- source-linked copy-role compiler;
- protected Ocín activation adapter with full-view/no-crop/source-integrity gates;
- Assembly QA result contract separating CONTRACT from RENDER_BROWSER truth;
- WorkOrder / StationResult interchange contracts for SCRIPT / AGENT / HUMAN workers;
- macro chapter factory reusing Deep Route Engine;
- seeded factory benchmark;
- universal PlateSpec renderer + desktop/mobile/reduced-motion Golden browser evidence.

`human_curator_acceptance` remains separate from machine validity. Do **not** recreate routing, PlateSpec, assembler, copy, memory, QA, renderer or release architecture unless a demonstrated contract gap exists.

### Golden Knowledge renderer gap

Run-164 artifact review found a bounded renderer-consumption gap, not a contract/assembler failure. The assembler already differentiates benchmark compositions: `GP-SCI-01 → KDX_G07_ARCHIVE_DOSSIER`; `GP-TECH-02 → KDX_G02_SPECIMEN_DOSSIER`. The existing universal renderer currently collapses KNOWLEDGE_PLATE cases into the same hard-coded diagram structure.

Live code reinspection on 2026-08-16 reconfirmed the gap: `KodexPlateSpecRenderer.astro` exposes the selected `element_id` but renders one generic `.kdx-golden__diagram` for every KNOWLEDGE_PLATE. The existing grid registry already defines distinct G01/G02/G07 composition rules; the browser evidence script validates registered IDs, bounds, focus, mobile, reduced-motion and performance but does not yet assert structural identity.

After Actions execution is available, the bounded #62 delta is: consume existing G01/G02/G07 composition semantics in `KodexPlateSpecRenderer.astro` and extend `scripts/kodex-golden-plate-browser-evidence.mjs` with structural identity/fingerprint checks. Do not invent element IDs or change assembler scoring to force difference.

PR #62 remains OPEN / DRAFT / NOT MERGED / NOT DEPLOYED.

---

## 3. Perceptual / HoloCore lanes

- **PR #70** — current browser-validated volumetric/materiality benchmark. Head `0676c9e8a4d39c3b8949548598f9c021c87e3e3c`, run 278 SUCCESS. TOROIDAL FIELD remains `ART / COMP / SPEC`; creator acceptance pending.
- **PR #73** — RGX technical-family baseline. Head `4b209ef711a62442c64f22d898825ca5c5424bd9`, run 266 SUCCESS. RGX remains ADAPT / specialized structural grammar, not default/final materiality.
- **PR #75** — targeted reference-fidelity creator-review surface. Head `8959a0568f54bec465601093f62c96a590b49f2f`, run 270 SUCCESS. Source pixels NONE; creator acceptance pending.
- **PR #76** — verified Manifestation × RGX systems-convergence substrate. Head `d15bad99f52f38f831cd7ec0f2e4bd157e460c26`, run 272 SUCCESS. Reuses existing state/memory/Assembly/HoloCore systems; do not fork them.

---

## 4. Product-facing corridor — PR #77

PR #77 / `feat/kodex-threshold-convergence-v1` advances the existing #68 corridor in place.

Browser-validated rooms on this draft lineage:

- **THRESHOLD** — 100dvh/no-scroll, WebGL portal or source fallback, existing `kx-journey` memory, explicit visitor-controlled ENTER navigation.
- **PROLOGUE** — bounded title/CTA/art geometry, CTA hit-testing, CRT/fallback, protocol focus restoration, memory, explicit BEGIN OBSERVATION navigation.
- **DESCENT** — visitor-controlled local 11-stratum state; only explicit shared NEXT exits.
- **ARCHIVE** — selected specimen + dossier + focus restoration + memory + explicit NEXT; narrow mobile hides only redundant technical rail.

Latest verified four-room head remains `99320ff527a73a0f53e145662ae46141eb5bd8c8`, Product Corridor run 27 SUCCESS.

### MACHINE current truth gate

Current PR #77 head: `1f7bbebcf7573811549b540c573ad4b16919fa46`.

A prior executed MACHINE gate correctly rejected unsourced factual telemetry `INTEGRITY · 98.7%`. The accepted source repair changes only that value and matching readout to `NOT MEASURED`; generator, renderer, routing, memory, artwork and composition are unchanged.

Exact-head revalidation remains blocked outside KODEX. Product Corridor run `31877581094` still reports failure and its latest observed job has no executed steps. The previously inspected GitHub check annotation states that recent account payments failed or the Actions spending limit must be increased in **Billing & plans**.

MACHINE remains **IMPLEMENTED TRUTH REPAIR / BROWSER REVALIDATION PENDING**. Do not advance COSMOLOGY around this gate and do not modify product/QA/workflow code to compensate for the account-level blocker.

---

## 5. Convergence blocker — PR #78 Element Library

PR #78 / `feature/holocore-rgx-element-library` is **HOLD / EXTRACTION-ONLY SOURCE CANDIDATE — NOT ASSEMBLY OS AUTHORITY** until reconciled with #62.

Live code inspection found a parallel ElementContract dialect:

- #62 already owns `src/lib/kodex/grammar/kdx_element_contract.schema.json`, `kdx_element_registry.v0.1.json` and the verified validators.
- #78 `ops/factory/element-library/holocore-rgx-contracts.json` points `$schema` to `kdx_visual_grammar.schema.json`, not the existing ElementContract schema.
- #78 uses branch-local fields (`min_max_size`, top-level `aspect_behavior`, string `accessibility_contract`, merged `provenance_rights`) instead of canonical `geometry`, structured `accessibility`, structured `provenance`, `rights`, `source_ref`.
- #78 uses plate labels `THRESHOLD`, `OBSERVE`, `MUSEO`, `CHRONICLE`; Assembly OS primary plate types remain `KNOWLEDGE_PLATE`, `JUNCTION_PLATE`, `ACTIVATOR_PLATE`. Scene identity belongs in scene-role/source semantics rather than a second plate taxonomy.
- #78 family/status values such as `rgx-*` / `production` do not satisfy the existing ElementContract enums.
- `element-library.test.js` validates only the branch-local 18-field list, so a green result would not prove Assembly OS compatibility.

### Branch contamination finding — 2026-08-16

A fresh direct compare of `main...feature/holocore-rgx-element-library` now shows the branch is **343 commits ahead of main** and carries **6,171 changed files** with a very large unrelated repository/rescue payload, including `_macmini-kodex-rescue/**`, settings, documentation, public/product assets and broad application files. This strengthens the conclusion that PR #78 is not a bounded or reviewable convergence vehicle even if its schema dialect were corrected.

The PR body itself now begins with **HOLD — EXTRACTION-ONLY / NOT ASSEMBLY OS AUTHORITY**, so the branch-local 18-field tests can no longer be mistaken for canonical Assembly OS validation.

The only currently actionable source observations are the 14 records in `ops/factory/element-library/holocore-rgx-contracts.json`; `element-library.test.js` is useful only to document the branch-local assumptions, not as a canonical validator.

Do **not** normalize in place on #78 and do not merge its branch into the Assembly OS lineage. Extract useful HoloCore observations and re-express them on a bounded #62-derived delta using the existing ElementContract vocabulary, registry and validators. If a HoloCore exposes a capability the existing schema genuinely cannot express, surface that exact incompatibility before any schema change.

---

## 6. Fragmentation / source-of-truth warning

Open PR status alone does not make a branch authoritative.

- #62 = verified Deep Navigation + Assembly OS baseline.
- #70 = current browser-validated volumetric/materiality benchmark.
- #73 = RGX technical-family baseline.
- #75 = targeted reference-fidelity creator-review surface.
- #76 = verified systems-convergence substrate.
- #68 = product corridor lineage.
- #77 = bounded product-corridor acceptance lane.
- #78 = extraction-only HoloCore source candidate; contaminated branch, not a convergence target.

No standalone current Decision Log was found in the active operational branch or accessible Drive/repo search. Do **not** invent one. Operational truth comes from Drive canon + this Current State + exact active PR heads/CI/artifacts.

---

## 7. Strategic condition

Strategic mode: **convergence + curation + perceptual refinement**.

Primary risks:

- mistaking CI/browser green for creator acceptance;
- adding architecture instead of converging existing systems;
- fabricating telemetry or letting decorative numbers read as facts;
- creating parallel registries/schemas/status vocabularies;
- using contaminated historical/rescue branches as convergence bases;
- scaling renderer families before their perceptual role is accepted;
- confusing scientific fact, authored metaphor, cultural provenance, inference, implementation and deployment state;
- treating protected artwork curation as public-use approval.

`BUILD LESS. CURATE HARDER. LET MEMORY CREATE COMPLEXITY.`

---

## 8. Exact next action

1. Preserve #62 as the sole verified Assembly/Deep Navigation contract baseline; do not reopen P0.1–P0.10.
2. Treat #78 as extraction-only: do not normalize in place or merge the contaminated branch; carry useful HoloCore observations into a bounded #62-derived delta only.
3. Keep #77 on exact head `1f7bbeb...`; do not advance COSMOLOGY yet.
4. Resolve GitHub `Billing & plans` / Actions spending authorization outside the codebase.
5. After Actions is restored, rerun the unchanged #77 MACHINE head; inspect exact desktop/mobile/reduced-motion artifact before changing status.
6. Then advance #62 in place with only the bounded G01/G02/G07 Knowledge renderer dispatch + structural evidence delta already defined.
7. Only after that bounded renderer delta is browser-green should HoloCore extraction candidates be normalized into #62, one small representative batch at a time, using the canonical schema/validators.
8. Preserve user agency, keyboard/focus, reduced-motion/fallbacks, 100dvh/no-scroll, cultural/source provenance and Ocín artwork integrity.
9. No merge, deploy, permission change, public asset approval or canon promotion is authorized.

---

## 9. Session-start checks

Before editing KODEX, verify:

1. Which Drive canon applies?
2. Which PR is the newest verified owner of the capability?
3. Is the requested delta architectural, semantic, visual, authorial or deployment-related?
4. Does a reusable implementation already exist?
5. What exact CI/browser/visual artifact evidence exists for the current head?
6. Is creator/cultural/public-release approval required?
7. Does the change preserve user agency, reduced-motion/fallbacks and truth-state separation?
8. Is the output implementation, test evidence, hypothesis, reference or deployment?

If these cannot be answered from connected sources, do not guess.
