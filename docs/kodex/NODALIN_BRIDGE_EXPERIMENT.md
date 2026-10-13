# KODEX LAB — Nodalin Bridge / KDX.SIGNAL.01.B

Status: EXPERIMENTAL / BRANCH ONLY / NOT CREATOR-ACCEPTED / NOT MERGED / NOT DEPLOYED
Date: 2026-10-12
Owner: Ocín / KODEX−∞
Base: KODEX Signal Convergence lab PR #185, SHA 9c51309ef76fce59bc1655c6d2e9c5e64fdbab61

## Purpose
Extend the already-existing /kodex/lab/signal-convergence/ route with an opt-in external visual instrument. This does NOT create a canonical node, replace KODEX's engine, or write to JourneyState.

## Files
- src/components/kodex/labs/NodalinBridge.astro — external embed input + guarded iframe + explicit disconnect.
- public/kodex/shaders/kdx-signal-convergence.fs — original ISF 2.0 synthetic field generator; no third-party shader copied.
- src/pages/kodex/lab/signal-convergence.astro — imports bridge after source panel, preserving original SVG/source behavior.

## Integration contract
1. A Nodalin account/project is NOT connected. The visitor/publisher must supply a public Share → Embed iframe src URL.
2. The input accepts HTTPS only, under nodalin.app and subdomains; rejects editor entry/start/login and URLs with credentials. It stays in memory only; no localStorage or remote project fetch before explicit submit.
3. The iframe is isolated with sandbox, referrerpolicy=no-referrer and a disconnect action; cross-origin data and parameters CANNOT be read or synchronized from this page.
4. The original SVG, source ID SRC-151, bibliographic URL, and deliberate-commit/reset interaction remain authoritative locally.
5. The ISF shader may be tested with an ISF-compatible renderer. Confirm Nodalin's supported shader-import workflow before claiming this file runs there.
6. The Free Nodalin tier is for noncommercial/personal projects according to the provider pricing page (checked 2026-10-12): https://nodalin.app/pricing. Public KODEX/commercial use requires an appropriate license review.
7. Existing noindex/nofollow remains; no global navigation changes. Production deploy is blocked until exact "APROBAR DEPLOY".

## QA gate (not fulfilled by this code change alone)
- npm ci && npm run build with valid WC credentials or authorized offline build mode.
- Desktop 1440x900, mobile 390x844 and 412x915.
- Keyboard tab/enter/space, touch, screen reader, reduced motion, no JS, no external project, invalid URL, disconnect.
- Verify CSP and Nodalin iframe policy on a real published Nodalin project, which is NOT yet available.
- Test shader in ISF editor and Nodalin if supported; inspect mobile GPU performance.
- Review screenshots with Ocín. No source scan/image copied. Do not deploy.

## Decision / authority
Follow canon ADR-0010: A origin, M optional, Y route-derived. This bridge has no B–X letter assignment, no visitor identity inference, and no authority over personal or semantic memory.
