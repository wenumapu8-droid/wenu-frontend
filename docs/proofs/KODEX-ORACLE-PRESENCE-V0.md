# KODEX−∞ — KDX.ORACLE Presence V0

Status: `IMPLEMENTED_CANDIDATE / INTERNAL_NOINDEX / CI_NOT_YET_RUN / CREATOR_REVIEW_NOT_RUN / NOT_CANON / NOT_DEPLOYED`

## Purpose

Build the smallest current-scope proof of causal narrative presence across `THRESHOLD → PROLOGUE` without creating a new router, journey store, memory authority, renderer, ontology, biometric surface, microphone flow, camera flow, or open-ended chatbot.

## Current implementation

Internal route:

`/kodex/lab/oracle-presence-v0/`

The proof demonstrates:

- `DORMANT → AWARE → ADDRESS → REVEAL` as presentational Oracle states only;
- explicit visitor ENTER as the first speech-enabling event;
- the existing public `kdx:scene-dwell` event contract as the PROLOGUE reveal trigger;
- authored, epistemically bounded captions;
- read-only `kx-journey.views` evidence count;
- no Oracle journey-memory writes;
- provider-agnostic same-origin voice adapter;
- Web Audio analyser → one bounded visual energy variable;
- mute and missing-audio fail-soft behavior;
- reduced-motion static meaning preservation;
- no camera, microphone, recording, personal scoring, identity/emotion/destiny/spiritual inference.

The lab emits one `kdx:scene-dwell` event after 4200 ms only to make this isolated proof reproducible. Production integration must subscribe to the real event already emitted by `KodexRecuerda`; it must not copy the lab timer into product scenes.

## Authored V0 cues

`KDX_ORACLE_THRESHOLD_001`

> You crossed the threshold. The archive has registered that decision.

Runtime basis: explicit ENTER action.

`KDX_ORACLE_PROLOGUE_001`

> Do not watch the eye. Watch what changes when you approach it.

Runtime basis: post-entry PROLOGUE dwell event.

These remain implementation-copy candidates, not canon promotion.

## Voice truth

Target identity remains `KDX_F01`: original feminine computational presence, low-to-mid register, intimate, calm, slightly uncanny, high intelligibility.

The current code uses `KDX_F01_DEV_TEMP` so no one can mistake the proof voice for final identity.

During this implementation session, two provisional offline clips were generated locally with the open-source eSpeak engine only to test the technical audio path:

- `threshold-address.ogg` — 5.366848 s — SHA-256 `9363c77ab39a5ff304afa2a6fc2a9a2181c7136aa3b39a2749837199e835ed99`
- `prologue-reveal.ogg` — 5.243175 s — SHA-256 `3aebfc357ac90023182233318c664964a744626555fc877747013bd89c91ed10`

Those files are `DEV_TEMP / NOT_FINAL_KDX_F01 / NOT_REFERENCE_SPEAKER_CLONE / NOT_YET_VENDORED_IN_REPO`.

The intended final authoring path is local/open-source Kokoro-82M → curated original KDX_F01 masters → same-origin compressed assets. The visitor should not need to download the TTS model.

Until audio files are vendored, `voice-adapter.js` intentionally produces `SILENT_FALLBACK`; captions and visual-state semantics continue.

## Files

- `src/lib/kodex/oracle/oracle-script.js`
- `src/lib/kodex/oracle/oracle-runtime.js`
- `src/lib/kodex/oracle/audio-reactor.js`
- `src/lib/kodex/oracle/voice-adapter.js`
- `src/pages/kodex/lab/oracle-presence-v0.astro`
- `scripts/kodex-oracle-presence.test.mjs`

## Acceptance still required

1. Exact-head Core Runtime / test / build pass.
2. Browser evidence: desktop, 390×844, 412×915, reduced-motion and mute/silent fallback.
3. Vendor or replace the provisional audio with an approved original KDX_F01 voice asset.
4. Creator review: `KEEP | REFINE | REJECT` for presence, timing, copy, visual entity and voice.
5. Only after acceptance: port the component/event subscription into the real THRESHOLD and PROLOGUE hosts.
6. No public deploy/canon promotion is implied by this proof.

Truth boundary:

`IMPLEMENTED ≠ CI PASS ≠ BROWSER VERIFIED ≠ CREATOR ACCEPTED ≠ CANON ≠ MERGED ≠ DEPLOYED`.
