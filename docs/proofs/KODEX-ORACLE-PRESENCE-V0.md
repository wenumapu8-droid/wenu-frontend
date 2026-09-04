# KODEX−∞ — KDX.ORACLE Presence V0

Status: `IMPLEMENTED_CANDIDATE / INTERNAL_NOINDEX / CI_PENDING / CREATOR_REVIEW_NOT_RUN / NOT_CANON / NOT_DEPLOYED`

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
- mute and audio fail-soft behavior;
- reduced-motion static meaning preservation;
- no camera, microphone, recording, personal scoring, identity/emotion/destiny/spiritual inference.

The lab emits one `kdx:scene-dwell` event after 7000 ms only to make this isolated proof reproducible and to leave a controlled pause after the first ADDRESS intervention. Production integration must subscribe to the real event already emitted by `KodexRecuerda`; it must not copy the lab timer into product scenes.

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

The current proof intentionally uses `KDX_F01_DEV_TEMP` so no one can mistake the test voice for final identity.

Two provisional offline clips are vendored only to exercise the complete technical voice path. They were synthesized locally with the open-source eSpeak engine, lightly filtered, then recompressed as mono Opus-in-Ogg at ~12 kbps:

- `public/audio/kodex/oracle/threshold-address.ogg` — 5.373375 s — 7,812 B — SHA-256 `9aeb12e57f1f199088b12efb813f2c5138b1431dd5d7be80f60fbe4c534a71bd`
- `public/audio/kodex/oracle/prologue-reveal.ogg` — 5.249708 s — 7,735 B — SHA-256 `b5a38112de37a72c426f06e631c8cd2f1f02a29f3078d4f9993f024950b2df67`

Those files are `DEV_TEMP / NOT_FINAL_KDX_F01 / NOT_REFERENCE_SPEAKER_CLONE`.

The intended final authoring path remains local/open-source Kokoro-82M → curated original KDX_F01 masters → same-origin compressed assets. The visitor should not need to download the TTS model.

If audio fails or the visitor mutes it, captions and visual-state semantics continue.

## Files

- `src/lib/kodex/oracle/oracle-script.js`
- `src/lib/kodex/oracle/oracle-runtime.js`
- `src/lib/kodex/oracle/audio-reactor.js`
- `src/lib/kodex/oracle/voice-adapter.js`
- `src/pages/kodex/lab/oracle-presence-v0.astro`
- `public/audio/kodex/oracle/threshold-address.ogg`
- `public/audio/kodex/oracle/prologue-reveal.ogg`
- `scripts/kodex-oracle-presence.test.mjs`

## Acceptance still required

1. Exact-head Core Runtime / test / build pass.
2. Browser evidence: desktop, 390×844, 412×915, reduced-motion and mute/audio behavior.
3. Replace the provisional eSpeak voice with an approved original KDX_F01 master before any production/canon promotion.
4. Creator review: `KEEP | REFINE | REJECT` for presence, timing, copy, visual entity and voice.
5. Only after acceptance: port the component/event subscription into the real THRESHOLD and PROLOGUE hosts.
6. No public deploy/canon promotion is implied by this proof.

Truth boundary:

`IMPLEMENTED ≠ CI PASS ≠ BROWSER VERIFIED ≠ CREATOR ACCEPTED ≠ CANON ≠ MERGED ≠ DEPLOYED`.
