# KODEX−∞ Visual Activators Collage V0 — proof contract

Status: SOURCE / PROOF — NOT PRODUCTION AUTHORITY
Date: 2026-08-29
Base lineage: `kodex/pass-a-organismos-corredor`
Proof branch: `codex-kodex-visual-activators-collage-v0`

## Purpose

Translate the creator-approved Visual Activators collage direction into an isolated, falsifiable frontend proof without changing the public KODEX router, memory runtime, ontology, production authority, or security PRs.

This proof exists to validate one principle: Ocín original artwork is the visual surface; KODEX adds response, state, depth, navigation and memory cues around it.

## Creator-approved sources

- Approved collage direction: https://drive.google.com/file/d/1kB3e2zjhPDB0dFvgOLPNXPna3g82vox0/view
- Visual Activators manifest: https://drive.google.com/file/d/132GYwoTazWFg_ilf5c2tIybSCGGUDZe5/view
- Ocín original digital portfolio root: https://drive.google.com/drive/folders/1v2ujUFmOjhVrGkC7ylsj-SDEAsz2fS1x
- Historical verified donor implementation: PR #61 (`feature/ocin-kodex-collage-pages-v1`).

## Route

`/kodex/lab/visual-activators-collage-v0`

The route is `noindex, nofollow` and intentionally isolated.

## Scene contract represented in V0

| Scene | Accent | Activator mode |
|---|---|---|
| THRESHOLD | red | PULSE |
| PROLOGUE | violet | EMERGE |
| DESCENT | deep violet | DEPTH |
| ARCHIVE | cyan | INDEX |
| MACHINE | orange | ENGINE |
| COSMOLOGY | acid green | FIELD |
| RETURN | white | INVERT |

RETURN is a true light-field inversion, not a dark scene with a white accent.

## Interaction contract

Lifecycle:

`DORMANT → AWARE → FOCUS → OPEN → CROSSED → REMEMBERED`

- pointer proximity wakes the field;
- pointer movement establishes focus;
- explicit activation advances the state;
- once remembered, the next activator becomes available;
- keyboard left/right navigates scenes;
- Enter/Space advances activation;
- mobile remains a fixed `100dvh` temporal composition;
- reduced-motion collapses transition durations.

## Artwork integrity in this proof

The principal artwork element is constrained to:

- `object-fit: contain`;
- `filter: none`;
- `transform: none`;
- `mix-blend-mode: normal`;
- `clip-path: none`;
- opacity 1.

The two smaller collage fragments are presentation crops around the principal work, not replacements for the original. Before production promotion, fragment/derivative use should be explicitly recorded at asset level.

## Source-mode caveat

V0 uses Google Drive thumbnail URLs as temporary review sources because the current production lineage does not contain the checksum-vendored Ocín originals from PR #61.

Do **not** treat Drive thumbnails as the permanent public runtime source. Promotion should reuse PR #61's checksum-vendoring pattern so production uses controlled same-origin files while Drive remains provenance storage.

## Automated falsifiable gates

`scripts/kodex-visual-activators-collage.test.mjs` is automatically included by the existing `npm run test:kodex:core` glob and verifies:

1. route is noindex and isolated;
2. original artwork surface remains contained/unfiltered;
3. all six activator states exist;
4. seven core scenes exist;
5. RETURN is white;
6. mobile is fixed-height and reduced motion is implemented.

## Non-goals

This proof does not:

- declare the public runtime updated;
- change production routing;
- merge PR #61 wholesale;
- modify global memory/ontology;
- touch security PR #57;
- claim Drive thumbnail sources are production-safe;
- claim generated visual explorations are Ocín originals.

## Promotion path

1. CI passes on this proof branch.
2. Creator/browser visual review on desktop + mobile.
3. Vendor the selected originals with hashes using the proven PR #61 pattern.
4. Replace temporary Drive thumbnails with same-origin `productionSrc` records.
5. Integrate the activator between-core choreography with the current production-authority worktree only after authority reconciliation in #117.
6. Public deploy + URL smoke test before marking DEPLOYED.
