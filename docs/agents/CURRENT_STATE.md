# CURRENT STATE — KODEX−∞ + WËNU MAPU

Last verified: 2026-08-14.  
Purpose: fast operational truth for agents. Update when implementation, blockers, production state or ownership materially changes.

> This file is not canon. It is a verified snapshot. Re-check Drive canon, GitHub PRs/CI and Linear before acting on anything time-sensitive.

---

## 1. Repository / deployment topology

Primary active repository: `wenumapu8-droid/wenu-frontend`.

Current WËNU MAPU frontend stack on `redesign-v2`:

- Astro 6.2.1 SSG;
- Node pinned to 24.14.1 via `.nvmrc`;
- WooCommerce REST is the product-data source at build time;
- public site: `wenumapuonline.com`;
- Cloudflare Pages deployment is Direct Upload (`deploy-now.sh` / Wrangler), not automatic on `git push`;
- production workflow currently uses `redesign-v2`; do not assume `main` is the deployed version;
- product fetch/build safety exists to prevent silent zero-product output;
- mobile, structured data, image optimization and reduced-motion behavior are already part of the frontend contract.

No KODEX draft PR listed below authorizes merge or deployment.

---

## 2. WËNU MAPU implementation state

Verified from current repository documentation:

- canonical dark-first token system exists in `src/styles/tokens.css`;
- current type system uses Instrument Serif, Cormorant Garamond, Instrument Sans and JetBrains Mono;
- WooCommerce access is centralized in `src/lib/woo.ts` and should not be changed casually;
- product pages, shop, contact, local/pickup, search index, sitemap and structured-data work exist;
- current architecture includes image cleanup/AVIF generation and explicit performance work;
- `src/i18n/en.json` + `src/i18n/mapudungun.json` exist;
- frontend work is further advanced than the default-branch README suggests; prefer active branch/docs over stale starter text.

Operational WËNU MAPU principle: keep commerce truthful and usable while evolving the visual system.

---

## 3. KODEX authoritative convergence state

KODEX is no longer blocked on basic contract architecture.

### PR #62 — Deep Navigation + Assembly OS baseline

Current verified baseline head: `1bfc5e4bd0b2fca1d7529dbfffee7b44b6334f20`.

KODEX Core Runtime run 164: **SUCCESS**.

Verified on this lane:

- deliberate focus restoration and browser history/deep-link acceptance;
- ElementContract + 28 normalized repo-native elements;
- PlateSpec for KNOWLEDGE / JUNCTION / ACTIVATOR;
- deterministic seedable assembler using registered IDs only;
- 12 Golden Plate benchmark across Science / Technology / Art / Consciousness;
- source-linked copy-role compiler;
- protected Ocín activation adapter with full-view/no-crop/source-integrity gates;
- Assembly QA result contract;
- WorkOrder / StationResult interchange contract;
- macro chapter factory reusing the existing Deep Route Engine;
- seeded factory benchmark;
- universal PlateSpec renderer + desktop/mobile/reduced-motion Golden browser evidence.

Truth boundary: `human_curator_acceptance` remains separate from machine validity. Protected Ocín source bytes are not implicitly approved by registry presence. PR #62 remains draft/open/not deployed.

### Consequence

Do **not** create another routing engine, assembly engine, PlateSpec family, copy compiler or QA truth model merely because a new visual experiment needs one. Reuse this lineage unless a documented contract gap is demonstrated.

---

## 4. Current perceptual / HoloCore lane

The highest-leverage unresolved gap is now visual/perceptual quality rather than mechanical validity.

### PR #67 — HoloCore registry + toroidal benchmark

Branch: `feat/kodex-holocore-registry-v1`.

The registry contains 15 query-addressable HoloCore specimens and keeps scientific/symbolic status explicit. `KDX-HOLO-BENCH-001 / TOROIDAL FIELD` is an internal ART / COMP / SPEC benchmark and is deliberately not mapped to a canonical semantic node.

Run 192 at `e42615e833ebffe5f09a18c14fb08fe322a0517a`: **SUCCESS** for the first toroidal browser-validated implementation.

A later branch head `f18f7420632f3b36eda4c0ca77a932e7ee1033f6` also completed run 194 SUCCESS; the prior PR body was stale about this head.

Visual evidence from the actual CI artifact showed the toroidal v0.1 object was technically valid but perceptually too sparse, flat and small to serve as a finished-piece benchmark. A reversible v0.2 field refinement was therefore committed on the same branch at `e2f204f19c0cc14bfe315cef8f0d5a10fc3225f7`: continuous surface mass, stronger front/back luminance separation, less-compressed projection and denser flow, while retaining the existing renderer/runtime and epistemic boundary. KODEX Core Runtime run 200 is the validation gate for that exact head at this snapshot.

Creator visual acceptance remains PENDING. Browser acceptance must not be promoted to aesthetic approval.

### PR #72 — HoloCore RGX reference-fidelity prototype

Branch: `feat/kodex-holocore-rgx-orbital-v1`, stacked on the HoloCore registry lane.

Head `2c73c5824461135b9f47e8ee7fd38fb9ddc2b40b` completed KODEX Core Runtime run 198 **SUCCESS**.

RGX rebuilds ORBITAL CITY from code using normalized reference topology, dense microglyph raster and procedural SVG/vector scaffold. It embeds no reference pixels. CI evidence verifies desktop/mobile/reduced-motion, 100dvh/no-overflow and reference-structure contracts.

Actual artifact review: RGX materially improves density and structural legibility versus early HoloCore, but still reads primarily as a technical diagram/scaffold rather than a volumetric finished digital object. Creator visual acceptance remains PENDING.

### Renderer-adapter proofs

PR #69: low-resolution raster renderer adapter — browser green, creator visual approval separate.  
PR #70: WebGL source-shader adapter — browser green, explicitly `AMBIENT_UNCLOSED`, no false seamless-loop claim.

These are renderer capability proofs. Do not turn them into competing HoloCore architectures.

---

## 5. Authorial / artwork integrity lane

PR #61 is the strongest current Ocín-original publishing proof:

- six checksum-verified same-origin originals;
- immutable artwork treatment (`contain`, no crop/filter/blend/distort);
- THRESHOLD / ARCHIVE ATLAS / MUSEUM OF SPACE internal compositions;
- desktop/mobile/reduced-motion browser QA green;
- Drive remains provenance/source storage rather than runtime image origin;
- final creator visual acceptance + route promotion + integration/deploy remain separate gates.

PR #58 is an earlier authorial registry/case-study bridge and remains useful for content-contract provenance, but its body/state must not override later verified code/evidence.

---

## 6. Other active lanes / fragmentation warning

Many older KODEX PRs remain open (#3, #35, #52–#60, #63–#64, #68, #71, etc.). Open status does **not** make all of them equally authoritative.

Examples:

- #68 is a separate authored/static-reference corridor and measurement lane with useful traversal/coverage findings; do not silently substitute it for the Assembly OS/HoloCore lineage.
- #71 adds a deterministic manifestation/causal-state model over existing HoloCore concepts; it must remain software state semantics, not a claim that thought changes matter.
- #63 is the earlier single HoloCore prototype; #67/#72 are later descendants for reusable registry/fidelity work.
- #64 is a governed visual-assembly proposal lane; it must not supersede the already-implemented Assembly OS contracts without explicit reconciliation.

Default rule: use the newest verified descendant that already owns the capability, and document any lineage fork before writing across it.

---

## 7. Current systemic condition

KODEX has real engines, routes, graph data, visual fields, artwork publishing proofs, QA artifacts and deterministic production contracts.

The primary risks are now:

- **visual quality lagging behind system sophistication**;
- multiple open branches creating false architectural plurality;
- browser/test success being mistaken for creator acceptance;
- visual-reference fidelity work drifting into pixel copying or false provenance;
- scientific/symbolic language being collapsed;
- protected artwork curation being mistaken for public-use approval.

Strategic mode remains: **convergence + curation + perceptual refinement**.

`BUILD LESS. CURATE HARDER. LET MEMORY CREATE COMPLEXITY.`

---

## 8. Current next-action hierarchy

1. Close the toroidal v0.2 CI gate on PR #67 and inspect the new artifact, not just the check result.
2. Compare v0.2 against v0.1 on perceptual mass, aperture legibility, front/back separation, object dominance and mobile readability.
3. Keep creator visual acceptance explicit; do not infer it from metrics.
4. Use RGX / raster / WebGL adapter lessons as materiality options inside the existing HoloCore chamber, not as new parallel systems.
5. Do not add Assembly OS schemas/contracts unless a concrete verified contract gap appears.
6. Preserve Ocín originals and rights/provenance boundaries.
7. Update this file and Drive operational docs when verified state materially changes.

---

## 9. Session-start checks

Before modifying KODEX, verify:

1. Which Drive canon applies?
2. Which PR is the newest verified owner of the capability?
3. Is the requested change architectural, semantic, visual, authorial or deployment-related?
4. Is there already a reusable implementation?
5. What exact CI/browser/visual evidence exists?
6. Is creator/cultural/public-release approval required?
7. Does the change preserve user agency, reduced-motion/fallbacks and truth-state separation?
8. Is the proposed output implementation, test evidence, hypothesis, reference or deployment?

If these cannot be answered from connected sources, do not guess.
