# KODEX Effect Foundry — Sprint 0 QA

Date: 2026-08-07
Branch: `feature/kodex-effect-foundry-sprint0`
PR: #17
Workflow: `KODEX Effect Foundry CI`
Final run: `31224663285`

## Result

**PASS — build + six-renderer browser smoke + canonical ARCHIVE/RETURN integration.**

Canonical scene integrations verified:

- `KDX-FX-005 Memory Decay Mesh` → `ARCHIVE` (`/kodex/folio/iii/`)
- `KDX-FX-006 −∞ Dissolution` → `RETURN` (`/kodex/folio/vi/`)

The remaining four Sprint 0 effects are browser-rendering successfully but stay `TRANSLATED` until they are assigned to and integrated into a canonical scene.

## Verified

GitHub Actions run `31224663285` completed successfully.

Passed steps:

1. checkout;
2. Node 24.14.1 setup;
3. `npm ci`;
4. Astro build with `ALLOW_EMPTY_PRODUCTS=true`;
5. static output assertions;
6. preview server boot;
7. Chromium installation;
8. browser visual smoke captures;
9. QA artifact upload.

Static output assertions confirmed:

- `dist/kodex/lab/effect-foundry/index.html` exists;
- `dist/kodex/lab/effect-foundry/smoke/index.html` exists;
- `dist/kodex/folio/iii/index.html` exists;
- `dist/kodex/folio/vi/index.html` exists;
- ARCHIVE output contains `KDX-FX-005` and `data-kdx-foundry-scene`;
- RETURN output contains `KDX-FX-006` and `data-kdx-foundry-scene`.

## Six-effect browser matrix

The internal route `/kodex/lab/effect-foundry/smoke/` mounts all six `KodexEffectCanvas` renderers simultaneously and samples their Canvas output client-side.

Final Chromium evidence reports:

**6 / 6 PASS**

- `KDX-FX-001 ASCII Signal Bloom` — PASS
- `KDX-FX-002 Cross-Stitch Field` — PASS
- `KDX-FX-003 Halftone Mutation` — PASS
- `KDX-FX-004 Liquid Mercury Skin` — PASS
- `KDX-FX-005 Memory Decay Mesh` — PASS
- `KDX-FX-006 −∞ Dissolution` — PASS

The matrix was captured in desktop and mobile layouts.

## Browser evidence

Artifact: `kodex-effect-foundry-qa` / artifact id `9011695099`.

Captured evidence:

- Foundry lab: `390×844`;
- Foundry lab: `412×915`;
- six-effect matrix: desktop;
- six-effect matrix: mobile;
- ARCHIVE: `1440×1000`;
- ARCHIVE: `390×844`;
- RETURN: `1440×1000`;
- RETURN: `412×915`.

Manual visual review found:

- Foundry lab fits the mobile viewport without horizontal overflow;
- all six effects produce visible non-empty output in Chromium;
- ARCHIVE keeps its principal hierarchy legible while Memory Decay Mesh is visible as the transformed specimen field;
- ARCHIVE mobile remains usable and the primary CTA remains visible;
- RETURN retains its white final-state composition while −∞ Dissolution is visible inside the artifact region;
- RETURN mobile keeps title, metadata and the primary return CTA readable.

## Accessibility / motion

`KodexEffectCanvas.astro` checks `prefers-reduced-motion: reduce` and does not start the requestAnimationFrame loop when reduced motion is active. It also reacts to media-query changes and stops/restarts animation accordingly.

Canonical scene integrations are `pointer-events: none`, so the Foundry layer does not block scene controls or navigation.

## Privacy / cost

- local source image processing only;
- no upload endpoint;
- no Figma;
- no Weave;
- no paid inference API;
- no credits required at runtime.

## Epistemic status

- Foundry runtime: **IMPLEMENTED + browser-smoke verified** on the feature branch.
- all six Sprint 0 renderers: **browser-smoke verified**.
- `KDX-FX-005` in ARCHIVE: **IMPLEMENTED + browser-smoke verified**.
- `KDX-FX-006` in RETURN: **IMPLEMENTED + browser-smoke verified**.
- `KDX-FX-001` to `KDX-FX-004`: **TRANSLATED + browser-smoke verified**, not yet canonical-scene implemented.
- Public Cloudflare deployment: not asserted by this report.

## Known non-blocking observations

The existing KODEX scene layouts still contain pre-existing dense metadata/navigation overlaps at some breakpoints. The Foundry integration did not introduce horizontal overflow in the captured mobile sizes. Layout polish remains a separate scene-level task rather than being mixed into the effect runtime.

## Production gate

Sprint 0 is approved to merge into `feature/kodex-organism-engine-foundation`.

Next:

1. merge PR #17;
2. select scene assignments for FX-001 through FX-004;
3. integrate through `KodexEffectCanvas` without duplicating renderer logic;
4. promote effects only after scene-specific browser evidence;
5. move expensive effects from Canvas 2D to WebGL/WebGPU only when profiling justifies it.
