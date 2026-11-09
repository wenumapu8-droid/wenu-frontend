# KDX.ECHO ∞ — global narrative voice
STATUS: REVIEW BRANCH · NOT DEPLOYED · NO LICENSED ELEVENLABS ASSETS GENERATED

## Scope and identity
ECHO is the transversal narrator of KODEX, NOT the preexisting ORACLE app. A single audio presence with three modes:
- PRESENCIA / ambient: sparse interventions tied to actual scenes.
- MONÓLOGO / guide: sequential authored cinematographic narration.
- LECTURA / read: explicit reading of approved authored episode text, never arbitrary page/Drive content.

The original bilingual pilot corpus currently covers seven canonical macro scenes and starter contexts CITY, LAB, RESEARCH and GRAPH. Alphabet A–Y, distinct cities in the Drive atlas, book volumes, future installations, templar/altar modules and historic experiments require individual approved scripts and event wiring. The base system can host their stories; those stories are NOT all implemented.

## Architecture
- Shared Astro layout: src/layouts/Base.astro mounts KdxEcho only when path starts /kodex/.
- Playback and opt-in UI: src/components/kodex/KdxEcho.astro and src/lib/kodex/echo/runtime.mjs
- Editorial source: src/lib/kodex/echo/corpus.mjs, with original ES/EN pilot text.
- Playback director: src/lib/kodex/echo/director.mjs; cooldown, no duplicate scene narration, owner-confirmed events.
- Current audio synth: src/scripts/kodex-audio.js ducks music during ECHO speech via kdx:echo-speaking (this is not yet a unified bus with src/kodex/audio/kodexAudio.js).
- The existing navigation, scene-controller and return/memory.js stay authoritative. ECHO never creates a second router/memory store.
- WebGL downstream may read window.__kdxEchoSignal {active,level,low,mid,high} and CSS --kdx-echo-level; not all shaders are connected yet.

## Explicit verified interaction contract
Owning modules emit only after a successful real action:

    window.kdxEcho?.emit({
      domain:'lab', type:'transform-complete', id:'OBSERVE_V2', observed:true
    });

The event origin is the module performing the action. ECHO validates domain/type/ID, but cannot independently prove an emitter's claim. Supported domains: scene, archive, city, lab, graph, research, system. RETURN's return-recorded event must carry real, non-curated readSpecimen evidence:

    window.kdxEcho?.emit({
      domain:'scene', type:'return-recorded', id:'Y',
      observed:true, evidence: readSpecimen()
    });

Do not invent emotion, identity, destiny or scientific facts. Distinguish original narrative, documented research, conjecture and quoted source. Never automatically feed user-private notes or Drive material to a text-generation service.

## ElevenLabs: build-time recording workflow
The browser never receives the API key. A reviewer selects a commercially permitted licensed voice and approves scripts before generating. Example:

    export ELEVENLABS_API_KEY='<build secret>'
    export ELEVENLABS_VOICE_ID='<licensed voice ID>'
    node scripts/kdx-echo-generate.mjs --dry-run --lang both
    node scripts/kdx-echo-generate.mjs --only prologue_01 --lang es
    # Explicit paid batch operation only:
    node scripts/kdx-echo-generate.mjs --all --confirm-spend --lang both

Pre-rendered files: public/audio/kodex/echo/<lang>/<clip-id>.mp3
Existing clips are not overwritten automatically. Playback of local assets does not consume new ElevenLabs synthesis credits. With no generated assets, text captions work; the optional PREVIEW TTS checkbox allows a clearly labeled browser-synthesized preview with variable quality. It is not ElevenLabs.

## Requirements before a production deploy
1. node --test tests/kdx-echo.test.mjs; npm run build.
2. Preview and visually verify: /kodex/, /kodex/folio/i/, archive, lab/observe-v2, world, return.
3. Confirm ECHO absent in store and checkout. No unexpected sound before click or on navigation.
4. Confirm ES/EN captions, keyboard/focus, 390×844, 412×915 and reduced-motion support.
5. Verify ECHO respects the current sound toggle and active source: prevent duplicate music graphs and excessive volume.
6. Generate licensed assets, check source metadata and copy editing, test real event instrumentation in each module.
7. Document actual provenance, build SHA, browser evidence and separate experiment vs deployed status.
8. Only merge and deploy following explicit approval (APROBAR DEPLOY).

## Next engineering phases
A. Make the first seven-scene audio set audible and fully QA'd.
B. Connect user-confirmed city, lab, record, book and graph events; add curated content by surface, rather than generic voice everywhere.
C. Upgrade from manual clips to a structured narrative knowledge base with citations, route-based composition and an audited server-side generation adapter, if editorial QA and budget support it.
D. Only then consider real-time bidirectional voice or WebRTC agents.

ECHO remains a simulation of a narrative presence. It is not proof of machine consciousness, sensor insight or personal identity.
