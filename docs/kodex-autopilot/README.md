# KDX AUTOPILOT v0.1

Status: **SCAFFOLD / NOT DEPLOYED / NOT PUBLISHING**

KDX AUTOPILOT is the future production layer for code-first KODEX audiovisual work. It is deliberately separated from the public site and from automatic publishing.

## Core decision

The core workflow must not depend on Higgsfield or any generative-video provider.

Primary stack:

- ChatGPT / OpenAI: planning, research synthesis, scripting, metadata, optional visual QA.
- Claude Code: animation engineering, scene implementation, iteration, local production orchestration.
- Gemini: secondary visual / research QA and structured review.
- ElevenLabs: optional voice / SFX / music adapter.
- KODEX runtime: Astro, DOM/CSS, SVG, Canvas 2D, GSAP, Three.js, WebGL, GLSL.
- FFmpeg: deterministic encoding, muxing, audio composition and derivative exports.

Provider APIs are adapters, not canon. Their availability, pricing and limits must be verified before a production run.

## Safety / authorial boundary

KDX AUTOPILOT may prepare, render, review and revise a **MASTER_CANDIDATE**.

It must not:

- publish automatically;
- change KODEX canon;
- delete source assets;
- overwrite approved masters;
- copy external references literally;
- represent speculation as science;
- use cultural material without provenance;
- spend on APIs without an explicit configured budget.

Human approval remains mandatory before release.

## Current scaffold

This branch includes:

- an episode manifest schema;
- an example KODEX episode;
- a local preparation script;
- architecture and launch checklist;
- Claude director brief;
- environment placeholders;
- npm commands for validation / preparation.

No provider API call is enabled by this scaffold.

## Commands

```bash
npm run kdx:autopilot:check
npm run kdx:autopilot:prepare
```

Both commands use:

`config/kodex-autopilot/episode.example.json`

You can pass another episode config directly:

```bash
node scripts/kodex-autopilot/prepare.mjs --check path/to/episode.json
node scripts/kodex-autopilot/prepare.mjs --prepare path/to/episode.json
```

Prepared run material is written to `.runtime/kdx-autopilot/`, which is already ignored by git.

## First target

**KDX-FILM-001 — THE ARCHIVE REMEMBERS**

Goal: prove a 60–90 second film can be produced from KODEX source assets, SVG, Canvas, Three/WebGL/GLSL, typography, voice and sound without generative video.

See `ARCHITECTURE.md` and `LAUNCH_CHECKLIST.md`.
