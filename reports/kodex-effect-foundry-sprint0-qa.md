# KODEX Effect Foundry — Sprint 0 QA

Date: 2026-08-07
Branch: `feature/kodex-effect-foundry-sprint0`
PR: #17
Workflow: `KODEX Effect Foundry CI`
Run: `31224214110`

## Result

**PASS — build + static integration + Chromium visual smoke.**

This report promotes only the two effects that are visibly mounted in canonical scenes:

- `KDX-FX-005 Memory Decay Mesh` → `ARCHIVE` (`/kodex/folio/iii/`)
- `KDX-FX-006 −∞ Dissolution` → `RETURN` (`/kodex/folio/vi/`)

The remaining four Sprint 0 effects stay `TRANSLATED` until they receive their own scene integration and browser evidence.

## Verified

GitHub Actions run `31224214110` completed successfully.

Passed steps:

1. checkout;
2. Node 24.14.1 setup;
3. `npm ci`;
4. Astro build with `ALLOW_EMPTY_PRODUCTS=true`;
5. static output assertions;
6. preview server boot;
7. Chromium installation;
8. visual smoke screenshots;
9. QA artifact upload.

Static output assertions confirmed:

- `dist/kodex/lab/effect-foundry/index.html` exists;
- `dist/kodex/folio/iii/index.html` exists;
- `dist/kodex/folio/vi/index.html` exists;
- ARCHIVE output contains `KDX-FX-005` and `data-kdx-foundry-scene`;
- RETURN output contains `KDX-FX-006` and `data-kdx-foundry-scene`.

## Browser evidence

Chromium screenshots were generated at:

- Foundry lab: `390×844`;
- Foundry lab: `412×915`;
- ARCHIVE: `1440×1000`;
- ARCHIVE: `390×844`;
- RETURN: `1440×1000`;
- RETURN: `412×915`.

Artifact: `kodex-effect-foundry-qa` / artifact id `9011537110`.

Manual visual review of the generated screenshots found:

- Foundry lab fits the mobile viewport without horizontal overflow;
- ARCHIVE keeps its principal hierarchy legible while the memory mesh is visible as the transformed specimen field;
- ARCHIVE mobile remains usable and the primary CTA remains visible;
- RETURN retains its white final-state composition while the dissolution field is visible inside the artifact region;
- RETURN mobile keeps title, metadata and primary return CTA readable.

## Accessibility / motion

`KodexEffectCanvas.astro` checks `prefers-reduced-motion: reduce` and does not start the requestAnimationFrame loop when reduced motion is active. It also reacts to changes in the media query and stops/restarts animation accordingly.

The canonical scene integration is `pointer-events: none`, so it does not block scene controls or navigation.

## Privacy / cost

- local source image processing only;
- no upload endpoint;
- no Figma;
- no Weave;
- no paid inference API;
- no credits required at runtime.

## Epistemic status

- Foundry runtime: **IMPLEMENTED** on the feature branch.
- `KDX-FX-005` in ARCHIVE: **IMPLEMENTED + browser-smoke verified**.
- `KDX-FX-006` in RETURN: **IMPLEMENTED + browser-smoke verified**.
- `KDX-FX-001` to `KDX-FX-004`: **TRANSLATED**, not yet canonical-scene implemented.
- Public deployment: not asserted by this report.

## Known non-blocking observations

The existing KODEX scene layouts still contain pre-existing dense metadata/navigation overlaps at some breakpoints. The Foundry integration did not introduce a horizontal overflow in the captured mobile sizes. Layout polish should remain a separate scene-level task rather than be mixed into the effect runtime.

## Next production gate

1. merge PR #17 into `feature/kodex-organism-engine-foundation` after the final CI run is green;
2. use the same `KodexEffectCanvas` integration path for the next selected scenes;
3. promote only effects with browser evidence;
4. move expensive effects from Canvas 2D to WebGL/WebGPU only when profiling justifies it.
