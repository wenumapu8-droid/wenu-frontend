# KOSMOS 2036 · iDevice implementation handoff

**Status:** EXPERIMENTAL — PR / NOT DEPLOYED (2026-10-12).
**Source research:** wenumapu8-droid/kodex-minus-infinity, docs/research/KOSMOS_2036.md. Linear: KOD-92.
**Product intent:** self-contained research instrument inside the KODEX lab, no eighth canonical scene or forced route through M.

## Files

- public/kodex/kosmos-2036/index.html — standalone HTML/CSS/JS demo; copied from Ocín's KOSMOS_2036_DEVICE_UX_v1.html study with a mobile overflow fix, a back link and noindex meta tag.
- src/pages/kodex/lab.astro — adds one laboratory link, preserving the existing THRESHOLD study.
- docs/kosmos-2036-integration.md — this handoff.

## Routes after building and *authorized* deployment

- /kodex/lab/ → instrument link
- /kodex/kosmos-2036/ → self-contained instrument (noindex)

No server endpoint, authentication, analytics API, LLM, persisted remote profile, predictive calibration or historical data are integrated. Demo line and branched scenarios use synthetic inputs and are labelled as such. Memorization is local opt-in only. The scientific calculator uses a deterministic expression parser without eval.

## Local verification of imported source (before PR)

- Node 22.16: inline JS passed `node --check`.
- Playwright/Chromium `page.set_content`: 2+3=5, horizon selection 30 d, four-mode switching and optional memory controls (smoke-level checks), no page exceptions.
- CSS overflow checked at widths 320, 360, 390, 428 and 1280px; no horizontal document overflow after additional layout rules.
- Browser file:// and loopback network navigation were restricted by the testing environment, so this was not an integration test of the Astro-generated route.
- Original 390px version showed 452px scroll width; corrected.
- Hardware sensor, persistent browser storage across navigation, cross-browser QA, WCAG audit and full Astro build: **NOT VERIFIED**.

## QA and next work

1. Run `npm ci`, then `ALLOW_EMPTY_PRODUCTS=true npm run build` in a trusted local checkout (offline build explicitly documented; never use this flag for production).
2. Check emitted `dist/kodex/kosmos-2036/index.html` and navigation from `/kodex/lab/`.
3. Test real Android/iPhone, HTTPS sensor permission flows, keyboard, screen readers, reduced motion and memory import/export/delete.
4. Audit privacy and introduce a reviewed contract before integrating with KDX.PERCEPTION, MEMBER SESSION or Y. A model inference may not be treated as an observed personal truth.
5. Gate model-based forecasts behind observed datasets, temporal evaluation and evidence provenance.
6. Human review required before merge; **APROBAR DEPLOY** separately required for production deployment.

## Handoff

Status: EXPERIMENTAL. Canon unchanged. No data collection added. No production deployment authorized or performed.
