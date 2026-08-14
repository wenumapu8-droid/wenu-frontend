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
- `assembly_candidate.schema.json` — machine-readable composition output contract.
- `hero_media_resolution.schema.json` — source/provenance/rights resolution contract before a work can enter an assembly.
- `visual_component_registry.json` — all 77 proposed `KDX-VIS-*` components with shared transformation and epistemic policy.
- `layout_recipes.json` — seven composition grammars.
- `scene-packs/` — seven experimental visual/editorial mode packs; render taxonomy only, not topology authority.
- `examples/threshold-monolith.desktop.json` — deterministic desktop assembly example.
- `examples/threshold-monolith.mobile.json` — independently recomposed mobile example using the same source + recipe.
- `examples/hero-media.ocn-tor-001.unresolved.json` — pre-lookup failure-safe example: public export remains blocked until authoritative registry lookup.
- `examples/hero-media.ocn-tor-001.registry-blocked.json` — source-registry-grounded example after lookup in `OCÍN_MASTER_ART_REGISTRY — v0.3 ACTIVE`; provenance is linked, but public export and transformations remain blocked by the registry's current publication/curatorial state.

## Agent query interface

Agents should query this subtree instead of manually improvising component selections:

```bash
node scripts/kodex-visual-assembly-query.mjs summary
node scripts/kodex-visual-assembly-query.mjs scene ARCHIVE
node scripts/kodex-visual-assembly-query.mjs brief THRESHOLD
node scripts/kodex-visual-assembly-query.mjs component KDX-VIS-0041
node scripts/kodex-visual-assembly-query.mjs recipe RCP-MONOLITH
```

`brief <MODE>` returns an agent-ready bounded packet containing purpose, primary/secondary recipe, color/density/motion envelope, candidate Ocín sources, governed components, hard rules and the required execution sequence. It still grants no source rights and no canonical/runtime status.

## Machine gates

- `scripts/verify-kodex-visual-assembly.mjs` checks recipes, 77-component identity, scene-pack references, Ocín export deferral, normalized geometry and desktop/mobile recomposition.
- `scripts/verify-kodex-hero-media.mjs` checks both pre-lookup `UNRESOLVED` and post-lookup `BLOCKED` source states, including current registry rights/provenance evidence for `OCN-TOR-001`.
- `.github/workflows/kodex-visual-assembly-contract.yml` runs governance, source-resolution and agent-query smoke tests on relevant pull-request changes.

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

## Governance

`KDX-VIS-*` IDs in this proposal are **RESERVED_PENDING_CANONICAL_MERGE** until the canonical registry accepts them.

Ocín master artwork is immutable by default. A candidate composition cannot override provenance, rights, cultural restrictions or allowed transformations from the canonical source registry.

`CONTRACT_PASS != BUILD_PASS != DEVICE_QA_PASS != FRONTIER_VISUAL_PASS != CREATOR_VISUAL_PASS`.

Deployment remains locked behind the exact existing creator authorization phrase.
