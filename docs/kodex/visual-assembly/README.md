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
- `examples/hero-media.ocn-tor-001.unresolved.json` — explicit source-resolution failure-safe example: public export remains blocked until authoritative registry lookup.

## Machine gates

- `scripts/verify-kodex-visual-assembly.mjs` checks recipes, 77-component identity, scene-pack references, Ocín export deferral, normalized geometry and desktop/mobile recomposition.
- `scripts/verify-kodex-hero-media.mjs` checks that unresolved/blocked sources cannot grant public export or transformations.
- `.github/workflows/kodex-visual-assembly-contract.yml` runs both contracts on relevant pull-request changes.

These gates establish `CONTRACT_PASS` only. They do not imply implementation or visual acceptance.

## Governance

`KDX-VIS-*` IDs in this proposal are **RESERVED_PENDING_CANONICAL_MERGE** until the canonical registry accepts them.

Ocín master artwork is immutable by default. A candidate composition cannot override provenance, rights, cultural restrictions or allowed transformations from the canonical source registry.

`CONTRACT_PASS != BUILD_PASS != DEVICE_QA_PASS != FRONTIER_VISUAL_PASS != CREATOR_VISUAL_PASS`.

Deployment remains locked behind the exact existing creator authorization phrase.