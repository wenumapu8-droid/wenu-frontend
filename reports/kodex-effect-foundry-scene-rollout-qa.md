# KODEX Effect Foundry — canonical scene rollout QA

Date: 2026-08-07
Branch: `feature/kodex-effect-foundry-scene-rollout`
PR: #19
Final Effect Foundry CI run: `31225343733`
Artifact: `kodex-effect-foundry-qa` / `9011956390`

## Result

**PASS — all six Sprint 0 effects are mounted in canonical KODEX folios and browser-verified.**

## Canonical assignment

| Folio | Scene | Effect | Status |
|---|---|---|---|
| i | PROLOGUE | KDX-FX-002 Cross-Stitch Field | IMPLEMENTED |
| ii | DESCENT | KDX-FX-003 Halftone Mutation | IMPLEMENTED |
| iii | ARCHIVE | KDX-FX-005 Memory Decay Mesh | IMPLEMENTED |
| iv | MACHINE | KDX-FX-004 Liquid Mercury Skin | IMPLEMENTED |
| v | COSMOLOGY | KDX-FX-001 ASCII Signal Bloom | IMPLEMENTED |
| vi | RETURN | KDX-FX-006 −∞ Dissolution | IMPLEMENTED |

THRESHOLD intentionally retains its dedicated portal engine and is not replaced by Effect Foundry.

## Verified by CI

Run `31225343733` completed successfully:

1. checkout;
2. Node 24.14.1 setup;
3. dependency install;
4. Astro build;
5. all six static folio/effect binding assertions;
6. preview server boot;
7. Chromium installation;
8. desktop and 390×844 mobile capture for all six folios;
9. six-effect renderer smoke matrix;
10. QA artifact upload.

The route assertions verified exactly:

- `/kodex/folio/i/` contains KDX-FX-002;
- `/kodex/folio/ii/` contains KDX-FX-003;
- `/kodex/folio/iii/` contains KDX-FX-005;
- `/kodex/folio/iv/` contains KDX-FX-004;
- `/kodex/folio/v/` contains KDX-FX-001;
- `/kodex/folio/vi/` contains KDX-FX-006.

## Visual review

The browser artifact was reviewed as a six-scene contact sheet in desktop and mobile form.

Observed:

- all six scenes retain their canonical typography, controls and navigation;
- every Foundry layer produces visible output;
- no horizontal overflow was introduced in the captured 390×844 mobile views;
- PROLOGUE keeps its observation hierarchy while Cross-Stitch appears as a coded textile signal;
- DESCENT preserves the orange depth/strata composition with Halftone Mutation embedded in the descent field;
- ARCHIVE keeps the specimen dossier legible while Memory Decay Mesh becomes the dominant transformed specimen;
- MACHINE keeps the cyan machine hierarchy with Liquid Mercury Skin in the artifact region;
- COSMOLOGY keeps the magenta orbital field with ASCII Signal Bloom as a secondary signal layer;
- RETURN keeps the white final-state composition while −∞ Dissolution occupies the return artifact region.

## Runtime policy

All scenes use the same reusable `KodexEffectCanvas` implementation. Recipe/source/opacity/animation policy vary by scene; renderer logic is not duplicated.

Static effects in MACHINE and COSMOLOGY have animation disabled to avoid unnecessary render loops. Animated effects continue to honor `prefers-reduced-motion` through `KodexEffectCanvas`.

## Cost / privacy

- no Figma;
- no Weave;
- no paid inference API;
- no credits;
- browser-local source processing;
- no upload endpoint required.

## Epistemic status

- six renderers: **IMPLEMENTED + browser-smoke verified**;
- six canonical folio bindings: **IMPLEMENTED + browser-visual verified**;
- public Cloudflare deployment: **NOT asserted / separate gate**;
- future WebGL/WebGPU upgrades: **SPECULATIVE / optimization candidates**, not required for this rollout.

## Next

The Effect Foundry can now be treated as part of the KODEX production-development base. New effects should enter through the registry/lab/QA path and be promoted to `IMPLEMENTED` only after canonical scene evidence.