# KDX AUTOPILOT — Architecture v0.1

Status: **PROPOSED IMPLEMENTATION / NOT DEPLOYED**

## Pipeline

```text
TOPIC
  ↓
RESEARCH PACKAGE
  ↓
SCRIPT
  ↓
FACT / CANON QA
  ↓
BEAT GRAPH
  ↓
SCENE MANIFEST
  ↓
PROGRAMMATIC ROUGH
  ↓
FRAME / MOTION QA
  ↓
REVISION LOOP
  ↓
VOICE + SFX + MUSIC
  ↓
FFMPEG COMPOSITION
  ↓
SUBTITLES
  ↓
MASTER_CANDIDATE
  ↓
HUMAN APPROVAL
  ↓
RELEASE
```

## Roles

### Planner / editor
ChatGPT or another approved model.

Responsibilities:
- research brief;
- outline;
- script;
- title / description candidates;
- chapter structure;
- source and uncertainty annotations.

### Animator / technical director
Claude Code or another coding agent.

Responsibilities:
- translate beats into scene contracts;
- write deterministic animation code;
- choose SVG / Canvas / DOM / WebGL renderer;
- render previews;
- revise only reported problems;
- preserve provenance and source files.

### QA
Gemini and/or ChatGPT vision.

Responsibilities:
- inspect selected frames / previews;
- score hierarchy, continuity, typography, KODEX identity and artifacts;
- return structured findings;
- never silently alter canon.

### Audio
ElevenLabs is an optional adapter.

Possible outputs:
- narration;
- sound effects;
- atmospheres;
- music where rights / plan permit.

The system must be able to accept manually supplied audio instead.

### Render / composition
Local-first:
- Astro / browser runtime;
- SVG;
- Canvas 2D;
- GSAP;
- Three.js / WebGL;
- GLSL;
- FFmpeg.

Future optional adapters may include scripted Blender or a dedicated browser-video renderer. They are not P0 requirements.

## Renderer contract

A scene declares one primary renderer:

- `dom`
- `svg`
- `canvas2d`
- `three`
- `glsl`
- `hybrid`

The meaning of a beat is stable; the renderer is implementation.

## State contract

Each scene should declare:

- `state_in`
- `state_out`
- `beat_type`
- `duration_sec`
- `source_assets`
- `renderer`
- `motion_law`
- `sound_event`
- `provenance`
- `qa_status`

Recommended semantic beats:

`VOID → SIGNAL → FOCUS → LOCK → FIELD → ASSEMBLY → MUTATION → MEMORY_WRITE → DISSOLUTION → RETURN`

## File contract per run

```text
.runtime/kdx-autopilot/<episode-id>/
├── research/
├── script/
├── beats/
├── assets/
├── animation/
├── render/
├── audio/
├── subtitles/
├── qa/
├── master/
├── run-manifest.json
└── RUN_STATUS.md
```

## Hard gates

A run cannot become RELEASED unless:

1. source / rights provenance is complete;
2. critical text is exact;
3. scientific claims are source-backed and correctly classified;
4. cultural material has documented provenance;
5. no external reference is copied as final art;
6. render passes technical QA;
7. creator acceptance is explicit.

## Launch principle

Automation ends at **MASTER_CANDIDATE**.

Publishing is a separate release action.
