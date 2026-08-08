# KOD-39 / DNA Ascent — Prototype Review

Date: 2026-08-07
Branch: `feature/kodex-dna-ascent-prototype`
PR: #24
Issue: #23

## Status

- Visual concept translation: `PROTOTYPED`
- Code written: `IMPLEMENTED_IN_ISOLATED_LAB`
- Exact KOD-39 contract comparison: `BLOCKED_ON_LOCAL_PACKET_SYNC`
- Build/static generation: `VERIFIED_BY_GITHUB_ACTIONS`
- Browser functional QA: `VERIFIED_BY_PLAYWRIGHT_CI`
- Screenshot review: `REVIEWED_FOR_LAB`
- Organism Engine regression build: `PASSED`
- Vertical Slice regression build: `PASSED`
- Production scene integration: `NOT_ATTEMPTED`
- Deployment: `BLOCKED`

No stronger status is claimed.

## Implemented surface

- static SVG fallback: `public/img/kodex/organisms/dna-ascent-fallback.svg`
- Astro host: `src/components/kodex/organism/prototypes/DnaAscentPrototype.astro`
- Canvas runtime: `src/components/kodex/organism/prototypes/dna-ascent-client.ts`
- noindex lab: `src/pages/kodex/lab/dna-ascent.astro`
- browser QA runner: `scripts/ci/dna-ascent-visual-qa.mjs`
- build/browser workflow: `.github/workflows/kodex-dna-ascent-ci.yml`

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

GitHub Actions for commit `8c120883879edb38a338b0a6d10b53b7ea340e1c` completed successfully:

- `KODEX DNA Ascent CI` run `31229500323`: `SUCCESS`.
  - checkout: success
  - Node setup: success
  - `npm ci`: success
  - `npm run build`: success
  - generated lab route/content checks: success
  - ephemeral Playwright + Chromium install: success
  - static server boot: success
  - browser/viewport QA: success
  - evidence artifact upload: success
- `KODEX Organism Engine CI` run `31229500303`: `SUCCESS`.
- `KODEX Vertical Slice` run `31229500298`: `SUCCESS`.

QA artifact:

- name: `kodex-dna-ascent-qa`
- artifact id: `9013282168`
- size: `1,079,544 bytes`
- digest: `sha256:dd2b00063d8fc8c1cf862aac99cc4af7d577971907215b56d02d0cf3f9be6c3a`

## Browser QA measurements

The Playwright report contains zero failures, zero collected console errors and zero page errors.

| Viewport | Canvas | Root | Horizontal overflow | Keyboard state after Enter |
|---|---:|---:|---|---|
| 390×844 | 335×574 | 335.22×573.91 | false | ENGAGED |
| 412×915 | 357×622 | 357.22×622.19 | false | ENGAGED |
| 1440×1000 | 990×780 | 990×780 | false | ENGAGED |

Reduced-motion at 390×844:

- canvas ready: true
- mode readout: `REDUCED`
- horizontal overflow: false
- console errors: 0
- page errors: 0

The internal documentation lab itself scrolls vertically on small screens because it contains QA notes around the interactive specimen. This is acceptable for the lab only. It is **not evidence** that a future production KODEX scene satisfies the canonical fullscreen/no-page-scroll constraint.

## Screenshot review

Four workflow screenshots were downloaded and inspected:

- 1440×1000 full-motion / engaged;
- 390×844 full-motion / engaged;
- 412×915 full-motion / engaged;
- 390×844 reduced-motion / dormant.

Observed:

- double helix remains centered and legible on desktop/mobile;
- signal rungs and axial guide survive the mobile layout;
- no artwork or readout is clipped horizontally;
- status/chrome remains readable at the tested sizes;
- reduced-motion frame remains compositionally coherent;
- desktop hierarchy reads as an internal technical dossier rather than a production scene.

Art-direction conclusion: **acceptable as an internal prototype / technical specimen, not approved as final KODEX scene art**. Production promotion still requires the exact KOD-39 contract and Ocín's canonical visual acceptance.

## Remaining evidence / work

1. Synchronize exact non-secret fields from local `~/.gemini/antigravity/KOD-39.yaml` into the repository work-packet mirror.
2. Compare this prototype line-by-line against the real KOD-39 objective, scope and acceptance criteria.
3. Verify actual touch interaction on a touch-capable device or browser emulation with a task-specific assertion; current CI verifies layout/browser/keyboard/reduced-motion gates, not physical-device touch feel.
4. Measure real frame cost on representative hardware before any production promotion; GitHub-hosted CI is not a valid mobile FPS benchmark.
5. Decide whether the final implementation should adapt an existing Organism Engine family, add a justified family, remain standalone, or discard this prototype.
6. Integrate into a production scene only after those gates pass.

## Known uncertainty

GitHub-side coordination cannot access the local Antigravity filesystem, so the exact KOD-39 objective, allowed file surface and acceptance criteria remain unknown. The repository mirror marks these fields `NEEDS_LOCAL_SYNC`; they were not guessed.

## Deployment

`DEPLOYMENT STATUS: BLOCKED`

Production remains gated by exact owner phrase `APROBAR DEPLOY` after task/QA acceptance.
