# KODEX Effect Foundry — Agent Handoff

Date: 2026-08-07
Branch: `feature/kodex-effect-foundry-sprint0`
Owner: Ocín / KODEX−∞

## Mission

Move KODEX visual production away from paid effect tooling and into a reusable internal factory.

The current Sprint 0 implementation is browser-native and zero-cost. It provides a parameter registry, six Canvas 2D renderers, a reusable Astro component, and an internal lab route.

## Read first

1. `docs/kodex/KODEX_EFFECT_FOUNDRY.md`
2. `src/lib/kodex/effectFoundry.js`
3. `src/lib/kodex/effectFoundryRuntime.js`
4. `src/components/kodex/effects/KodexEffectCanvas.astro`
5. `src/pages/kodex/lab/effect-foundry/index.astro`
6. `src/styles/kodex-effect-foundry.css`

## Current epistemic / production status

- Effect concepts: CANONICAL direction for the Foundry sprint.
- Canvas renderers: TRANSLATED prototypes.
- Lab route: implemented on the feature branch, not yet production-deployed.
- Canonical KODEX scene integration: NOT DONE.
- Mobile/performance QA: NOT YET VERIFIED.
- GPU shader versions: NOT YET IMPLEMENTED.

Do not describe any of those unfinished stages as complete.

## Claude Code task

### TASK

Audit and harden Sprint 0, then prepare the first safe scene integration.

### FILES ALLOWED

- `src/lib/kodex/effectFoundry.js`
- `src/lib/kodex/effectFoundryRuntime.js`
- `src/components/kodex/effects/KodexEffectCanvas.astro`
- `src/pages/kodex/lab/effect-foundry/**`
- `src/styles/kodex-effect-foundry.css`
- `docs/kodex/KODEX_EFFECT_FOUNDRY.md`
- new tests/reports specifically for Effect Foundry

Do not modify canonical scene files until the lab build and QA gates pass.

### FORBIDDEN

- `.env` / secrets
- WooCommerce writes
- DNS / Cloudflare production changes
- deployment / apex cutover
- unrelated Wenu Mapu commerce code
- deleting existing KODEX assets
- claiming visual QA without screenshots or measurements

## Required verification

1. Run `npm run build`.
2. Fix only Foundry-caused build failures.
3. Run the lab locally.
4. Verify all six effects render from the generated seed.
5. Verify local image upload stays client-side.
6. Verify PNG export.
7. Verify 390×844 and 412×915 layouts.
8. Verify `prefers-reduced-motion` stops animation.
9. Record approximate render cost for each effect at 900×900 and a mobile-sized source.
10. Write `reports/kodex-effect-foundry-sprint0-qa.md`.

## Definition of done

Sprint 0 can move from `TRANSLATED` toward `TESTED` only when:

- build is clean;
- no browser console errors are present;
- the six renderers work with seed and uploaded sources;
- mobile layout is usable;
- reduced motion works;
- performance findings are recorded;
- no paid/vendor dependency was introduced.

## After QA

Select **one** canonical scene integration based on visual fit and performance. Do not inject all six effects into the seven-scene experience at once.

Recommended first candidates:

- `KDX-FX-005 Memory Decay Mesh` → ARCHIVE
- `KDX-FX-006 −∞ Dissolution` → RETURN

Use `KodexEffectCanvas.astro`; do not fork rendering logic into scene files.

## Multi-agent production roles

- **Ocín** — visual acceptance / canonical decision.
- **ChatGPT** — system architecture, registry, documentation, cross-agent coordination.
- **Claude Code** — local code audit, build, integration, refactor under the allowed file surface.
- **Codex/OpenCode** — QA reports, safe implementation tasks, performance checks where locally available.
- **Gemini** — optional visual/reference analysis; outputs are reference only unless accepted into canon.

The Foundry is the shared contract. Agents should exchange effect IDs + parameter recipes, not ambiguous descriptions like “make it more glitchy.”
