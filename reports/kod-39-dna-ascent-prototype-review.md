# KOD-39 / DNA Ascent — Prototype Review

Date: 2026-08-07
Branch: `feature/kodex-dna-ascent-prototype`
PR: #24
Issue: #23

## Status

- Visual concept translation: `PROTOTYPED`
- Code written: `IMPLEMENTED_IN_ISOLATED_LAB`
- Exact KOD-39 contract comparison: `BLOCKED_ON_LOCAL_PACKET_SYNC`
- Build: `VERIFIED_BY_GITHUB_ACTIONS`
- Lab output existence/content gate: `VERIFIED_BY_GITHUB_ACTIONS`
- Organism Engine regression build: `PASSED`
- Vertical Slice regression build: `PASSED`
- Browser visual QA: `NOT VERIFIED`
- Device QA: `NOT VERIFIED`
- Deployment: `BLOCKED`

No stronger status is claimed.

## Implemented surface

- static SVG fallback: `public/img/kodex/organisms/dna-ascent-fallback.svg`
- Astro host: `src/components/kodex/organism/prototypes/DnaAscentPrototype.astro`
- Canvas runtime: `src/components/kodex/organism/prototypes/dna-ascent-client.ts`
- noindex lab: `src/pages/kodex/lab/dna-ascent.astro`
- build workflow definition: `.github/workflows/kodex-dna-ascent-ci.yml`

## Design intent translated

The lab translates the currently known visual direction only:

- a vertical double helix around a stable Z axis;
- apparent ascent rather than literal biological simulation;
- restrained signal particles;
- pointer/touch depth response;
- explicit engage action;
- reduced-motion static state;
- mobile DPR cap and visibility suspension.

The implementation intentionally does not make scientific claims about DNA, consciousness, quantum mechanics, ancestry or metaphysics.

## Architectural boundary

This prototype is **not registered as a new Organism Engine family or adapter**. That decision is deferred until the exact KOD-39 packet is synchronized and the intended semantic family is known.

This avoids prematurely changing the shared engine taxonomy (`FIELD`, `VORTEX`, `ORBITAL`, `GROWTH`, `SPECIMEN`, `TERRAIN`).

## Static code review

Reviewed via PR patch for:

- isolated public route behavior;
- no production route modification;
- no new package dependency;
- deterministic particle generation;
- DPR caps;
- pointer/touch via Pointer Events;
- keyboard activation (Enter/Space);
- `prefers-reduced-motion` branch;
- RAF suspension on visibility/intersection;
- event/observer cleanup on Astro navigation;
- Canvas fallback retention.

## CI evidence

GitHub Actions completed successfully for PR #24 head after the prototype/report commits:

- `KODEX DNA Ascent CI` run `31229349181`: success.
  - checkout: success
  - Node setup: success
  - `npm ci`: success
  - `npm run build`: success
  - `dist/kodex/lab/dna-ascent/index.html` existence + content checks: success
- `KODEX Organism Engine CI` run `31229349149`: success, including existing organism lab output verification.
- `KODEX Vertical Slice` run `31229349166`: success.

This verifies compilation/static generation and the route-output gate. It does **not** substitute for browser/device visual QA.

## Required next evidence

1. Synchronize exact non-secret fields from local `~/.gemini/antigravity/KOD-39.yaml` into the repository work-packet mirror.
2. Open `/kodex/lab/dna-ascent/` in a real browser and check console.
3. Capture 390×844, 412×915, 1440 desktop.
4. Test reduced motion in-browser.
5. Test background-tab and offscreen suspension.
6. Record approximate frame cost on mobile and desktop.
7. Compare the prototype against exact KOD-39 requirements.
8. Decide whether this prototype should be adapted into an existing organism family, remain standalone, or be discarded.

## Known uncertainty

GitHub-side coordination currently cannot access the local Antigravity filesystem, so the exact KOD-39 objective, allowed file surface and acceptance criteria remain unknown. The repository mirror marks these fields `NEEDS_LOCAL_SYNC`; they were not guessed.

## Deployment

`DEPLOYMENT STATUS: BLOCKED`

Production remains gated by exact owner phrase `APROBAR DEPLOY` after task/QA acceptance.
