# KODEX−∞ Visual Assembly v0.2

Status: **ARCHITECTURE PREP / NOT RUNTIME**  
Epistemic status: **INFERRED + CANON-CONSTRAINED**

This subtree prepares the KODEX Visual Assembly Library for repo-native integration without opening a second component/runtime system.

## Purpose

Convert visual direction into a governed assembly grammar that other agents can reconstruct from data instead of inventing ad-hoc screens.

The intended chain is:

```text
OCN-* authored work/source
+ RCP-* composition recipe
+ bounded KDX-VIS-* editorial/interface primitives
+ optional approved KDX-FX-* live layer
→ Hero Media Resolution
→ Assembly Candidate JSON
→ Visual Specimen Viewport contract
→ hard-gate validator
→ renderer
→ device QA
→ Frontier Visual Gate
→ creator acceptance
```

## Hard boundary

This subtree does **not**:

- replace the canonical A–Y journey topology;
- redefine Scene Bible semantics;
- authorize KOD-50/ARCHIVE implementation;
- alter public `/kodex/`;
- authorize deployment;
- grant public/export rights for any Ocín work;
- convert external visual references into canonical assets.

The active factory queue and canonical repo remain authoritative.

## Files

- `KIT_REGISTRY_BRIDGE.md` — proposed integration with the existing repo-native Kit Protocol.
- `COLOR_GRAMMAR.md` — canonical high-level monochrome/color rule plus non-canonical quantitative hypotheses.
- `AGENT_ASSEMBLY_CONTRACT.md` — bounded input/output and rejection rules for assembly agents.
- `VISUAL_QA_GATE.md` — HARD governance gates + SOFT visual score; complements Frontier Visual Gate.
- `VISUAL_SPECIMEN_VIEWPORT.md` — architecture proposal for the central KODEX specimen/emulator surface.
- `visual_specimen_viewport.schema.json` — strict machine-readable viewport contract including execution scope, source resolution, renderer mode, loop/fallback and applied-transform boundaries.
- `assembly_candidate.schema.json` — machine-readable composition output contract.
- `hero_media_resolution.schema.json` — source/provenance/rights resolution contract before a work can enter an assembly.
- `visual_component_registry.json` — all 77 proposed `KDX-VIS-*` components with shared transformation and epistemic policy.
- `layout_recipes.json` — seven composition grammars.
- `scene-packs/` — seven experimental visual/editorial mode packs; render taxonomy only, not topology authority.
- `source-snapshots/ocin-a-candidates-2026-08-14.json` — dated, non-live planning snapshot of the 15 `A_CANDIDATE` works in `OCÍN_MASTER_ART_REGISTRY — v0.3 ACTIVE`.
- `examples/threshold-monolith.desktop.json` — deterministic desktop assembly example.
- `examples/threshold-monolith.mobile.json` — independently recomposed mobile example using the same source + recipe.
- `examples/hero-media.ocn-tor-001.unresolved.json` — pre-lookup failure-safe example: public export remains blocked until authoritative registry lookup.
- `examples/hero-media.ocn-tor-001.registry-blocked.json` — source-registry-grounded example after lookup in `OCÍN_MASTER_ART_REGISTRY — v0.3 ACTIVE`; provenance is linked, but public export and transformations remain blocked by the registry's current publication/curatorial state.
- `examples/specimen-viewport.ocn-cir-001.internal.json` — source-safe internal specimen viewport using `OCN-CIR-001`; it demonstrates that a resolved source can still remain public-export blocked while bounded internal composition rules are enforced.

## Agent query interface

Agents should query this subtree instead of manually improvising component selections:

```bash
node scripts/kodex-visual-assembly-query.mjs summary
node scripts/kodex-visual-assembly-query.mjs scene ARCHIVE
node scripts/kodex-visual-assembly-query.mjs brief THRESHOLD
node scripts/kodex-visual-assembly-query.mjs source OCN-TOR-001
node scripts/kodex-visual-assembly-query.mjs specimen OCN-CIR-001
node scripts/kodex-visual-assembly-query.mjs component KDX-VIS-0041
node scripts/kodex-visual-assembly-query.mjs recipe RCP-MONOLITH
```

`brief <MODE>` returns an agent-ready bounded packet containing purpose, primary/secondary recipe, color/density/motion envelope, candidate Ocín sources, governed components, hard rules and the required execution sequence. It still grants no source rights and no canonical/runtime status.

`source <OCN-ID|title>` returns dated registry evidence only. It does not replace a fresh authoritative lookup before public export.

`specimen [OCN-ID]` returns a governed Visual Specimen Viewport example plus its schema/document paths. The current example is explicitly `INTERNAL_ONLY` and cannot be treated as runtime or public-export approval.

## Machine gates

- `scripts/verify-kodex-visual-assembly.mjs` checks recipes, 77-component identity, scene-pack references, Ocín export deferral, normalized geometry and desktop/mobile recomposition.
- `scripts/verify-kodex-hero-media.mjs` checks both pre-lookup `UNRESOLVED` and post-lookup `BLOCKED` source states, including current registry rights/provenance evidence for `OCN-TOR-001`.
- `scripts/verify-kodex-assembly-candidate.mjs` enforces strict candidate shape and rejects uncontrolled fields/geometry.
- `scripts/verify-kodex-source-snapshot.mjs` checks integrity and policy of the dated 15-work A-candidate snapshot.
- `scripts/verify-kodex-specimen-viewport.mjs` proves the specimen viewport cannot override export rights, transformations, governed components, recipe/scene validity, fallback requirements or motion semantics.
- `.github/workflows/kodex-visual-assembly-contract.yml` runs all contract gates plus agent-query smoke tests on relevant pull-request changes.

These gates establish `CONTRACT_PASS` only. They do not imply implementation or visual acceptance.

## Current source-resolution evidence

The active Ocín registry currently records `OCN-TOR-001 / Seed Aperture — White Field` as:

- `SOURCE CLASS: OCÍN ORIGINAL / AUTHORIAL SOURCE`;
- `PUBLICATION STATUS: NOT_APPROVED_FOR_PUBLIC_EXPORT`;
- `RIGHTS STATUS: CREATOR-OWNED / PUBLIC USE REQUIRES EXPLICIT APPROVAL`;
- `PROVENANCE STATUS: SOURCE LINKED`;
- `ALLOWED TRANSFORMATIONS: NEEDS_CURATORIAL_PASS`;
- `KODEX ACTIVATION STATUS: MAPPED / NOT_IMPLEMENTED`;
- `CURATION TIER: A_CANDIDATE / NOT_PUBLIC_APPROVED`.

Therefore the resolver may confirm provenance but must still return `public_export_allowed: false` and an empty transformation grant until the authoritative registry changes.

The dated snapshot also contains works whose specific transformations are already enumerated while public export remains blocked. `OCN-CIR-001` is used to verify that the viewport may apply only a subset of those listed transformations for internal planning and still cannot self-promote to public eligibility.

## Governance

`KDX-VIS-*` IDs in this proposal are **RESERVED_PENDING_CANONICAL_MERGE** until the canonical registry accepts them.

Ocín master artwork is immutable by default. A candidate composition cannot override provenance, rights, cultural restrictions or allowed transformations from the canonical source registry.

`CONTRACT_PASS != BUILD_PASS != DEVICE_QA_PASS != FRONTIER_VISUAL_PASS != CREATOR_VISUAL_PASS`.

Deployment remains locked behind the exact existing creator authorization phrase.
