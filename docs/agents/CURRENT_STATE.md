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
- **PR #78** — externally MERGED/CLOSED despite its own `HOLD — EXTRACTION-ONLY / NOT ASSEMBLY OS AUTHORITY` warning. Do not reinterpret that merge as Assembly OS canon promotion. Normalize any useful HoloCore observations through #62 contracts only.

---

## 4. Product corridor — PR #77

PR #77 / `feat/kodex-threshold-convergence-v1` advances the existing #68 product corridor without owning/replacing Assembly OS or Deep Navigation architecture.

### Exact corridor acceptance through COSMOLOGY

Product Corridor run `31932682697` (#48) completed **SUCCESS** on exact head `5a60ba7c8b450675907b65b1f36e0d7db29c9643`.

Artifact `9259831730`; digest `sha256:c5b75d94cd07114cad77020368fcab5a294c6f4a847e737aee49ba698aaa87d4`.

One executed run passed:
- build + preview;
- THRESHOLD desktop/mobile/reduced-motion;
- PROLOGUE desktop/mobile/reduced-motion;
- DESCENT desktop/mobile/reduced-motion;
- ARCHIVE desktop/mobile/reduced-motion;
- ARCHIVE→MACHINE interlude + MACHINE desktop/mobile/reduced-motion;
- COSMOLOGY desktop, 390×844, 412×915, keyboard/pointer/touch and reduced-motion.

COSMOLOGY artifact inspection confirms exactly six concept nodes and five ecosystem portals, 100dvh/no page scroll, canonical SIGNAL→MACHINE on pointer+keyboard desktop/reduced-motion and touch mobile, visit memory, explicit navigation to `/kodex/interlude/cosmology-return/`, no unsourced percentage telemetry and zero first-party HTTP/console errors. Desktop/reduced-motion are legible; mobile remains dense but technically bounded and usable. Creator/perceptual acceptance remains separate.

The same run also closes the PROLOGUE route-boundary evidence bug: source-room resource/console health is now asserted before CTA transition, so destination resource failures no longer retroactively fail PROLOGUE.

### RETURN — memory-derived product slice / viewport repair

RETURN consumes the **existing** `kx-journey` / `src/kodex/return/memory.js` substrate instead of creating another state model. On `/kodex/folio/vi/`, after the real visit is recorded, `readSpecimen('RETURN')` materializes a compact deterministic journey-specimen seal inside the existing RETURN artifact. It exposes specimen code + trace/memory/cycle counts and a seeded visual mark. It does not infer identity, emotion, health or spiritual score, does not display fabricated percentage telemetry, and leaves the existing static RETURN CRT as honest fallback if storage is unavailable.

Product Corridor run `31933274977` (#53) executed on exact head `6d6b10863da511a7c5f42fb8bb64017c12a9da39`. Build plus THRESHOLD, PROLOGUE, DESCENT, ARCHIVE, MACHINE and COSMOLOGY passed; RETURN alone failed.

Artifact `9260008716` isolates one repeated defect across desktop 1440×900, mobile 390×844, mobile 412×915 and reduced-motion: **journey specimen clipped outside the first viewport**. There were no first-party console or HTTP errors in the RETURN evidence. The gate failure occurs at specimen visibility before the later deterministic-replay/actions/drawer assertions, so those later requirements remain pending on the repaired head.

Root cause is geometric, not architectural: `KodexRecuerda` appended the correct memory-derived specimen inside `[data-kdx-art]`, but `.kdx-return-memory` was anchored to the bottom of the RETURN art plate. That plate begins low in the product frame, placing the bottom-anchored specimen below 100dvh.

Current PR #77 head: `bf9f664e0bf6d5186d14de2df68a38cb9c500d10`.

Bounded repair on that head changes only `src/components/kodex/KodexRecuerda.astro`: the specimen overlay is re-anchored to the top of the existing art plate; its mobile mark/padding footprint is reduced enough to remain inside the first viewport. The same `readSpecimen('RETURN')`, specimen code, trace/memory/cycle semantics, CRT, routes, artwork and acceptance gate remain unchanged.

Natural Product Corridor run `31934081886` (#56) is **IN PROGRESS** on exact head `bf9f664e...`. No manual hosted rerun was triggered. Status: **RETURN VIEWPORT REPAIR / EXACT-HEAD PRODUCT REVALIDATION IN PROGRESS**. RETURN is not accepted until exact-head browser PASS plus artifact inspection.

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

1. Let natural Product Corridor run `31934081886` execute on exact head `bf9f664e...`; do not manually spam hosted reruns.
2. Inspect RETURN artifact desktop/390×844/412×915/reduced-motion after machine PASS; do not promote from CI status alone.
3. If RETURN still fails, repair only the measured viewport/memory/materiality/input delta inside #77; do not create a new memory/runtime/renderer architecture.
4. If RETURN passes, mark the seven-room product corridor technically complete through RETURN while keeping creator visual acceptance and preview publication separate.
5. Then return the Assembly OS frontier to #62's bounded G01/G02/G07 renderer dispatch + structural fingerprint gate, unless creator review of the completed corridor establishes a higher-priority defect.
6. Treat merged PR #78 as a reconciliation hazard, not an authority override.
7. Preserve user agency, keyboard/focus, touch parity, reduced-motion/fallbacks, 100dvh/no-scroll, cultural/source provenance and Ocín artwork integrity.
8. No merge, deploy, permission change, public asset approval or canon promotion is authorized.
