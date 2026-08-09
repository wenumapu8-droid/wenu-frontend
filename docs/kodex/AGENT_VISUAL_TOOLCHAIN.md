# KODEX−∞ Agent Visual Toolchain

Status: `PROPOSED / NO PRODUCTION EFFECT`

This document maps specialist tools to KODEX scene production. External tools assist the workflow; they never become visual authority.

## Required reading order for visible scene work

1. `DESIGN.md`
2. repo-native KODEX canon/scene docs relevant to the target
3. golden plate/reference and provenance
4. this toolchain document
5. existing implementation/engine inventory

## Core production loop

`GOLDEN TARGET → STANDALONE/BOUNDED IMPLEMENTATION → BROWSER REVIEW → SCREENSHOT/DIFF → POLISH → FRONTIER REVIEW → CREATOR REVIEW → PORT/INTEGRATE`

A green build is not a visual pass.

## Tool roles

### Playwright CLI — REQUIRED browser operator

Source: https://playwright.dev/docs/getting-started-cli

Use for coding-agent browser inspection and evidence. It complements repository Playwright tests and CI.

Minimum handoff evidence for a visible page:

- desktop screenshot;
- 390×844 screenshot;
- 412×915 screenshot;
- keyboard path where applicable;
- touch-equivalent semantics;
- reduced-motion state;
- no unexpected console/runtime errors.

Recommended local agent setup:

```bash
npm install -g @playwright/cli@latest
playwright-cli install --skills
```

Do not commit browser profiles, cookies, auth storage or user data.

### Impeccable — PRIMARY design audit assistant

Source: https://github.com/pbakaus/impeccable
License: Apache-2.0

Use for:

- critique;
- audit;
- polish;
- typography/layout/motion/interaction anti-pattern review.

Constraint: KODEX `DESIGN.md` and golden reference override generic design recommendations. Impeccable must never “clean up” intentional KODEX density into generic SaaS minimalism.

### Taste Skill — SECOND-PASS / EXPERIMENTAL

Source: https://github.com/Leonxlnx/taste-skill
License: MIT

Useful skills include:

- `design-taste-frontend` (v2 experimental);
- `gpt-taste` for Codex/GPT-oriented enforcement;
- `image-to-code`;
- `redesign-existing-projects`.

Use after the primary visual direction is locked. Do not run Taste and Impeccable as simultaneous competing art directors.

### img2threejs — PROCEDURAL 3D RECONSTRUCTION

Source: https://github.com/img2threejs/img2threejs
License: Apache-2.0

Use when a reference object genuinely benefits from being a procedural, inspectable, animation-ready Three.js model.

Required KODEX pattern:

`REFERENCE IMAGE → ASSESSMENT/SPEC → DETAIL INVENTORY → THREE.GROUP → SIDE-BY-SIDE → QA → OPTIONAL ADOPTION`

The original plate remains visible/golden until creator-reviewed browser evidence proves that the procedural model may replace it.

Strong targets:

- machines;
- artifacts;
- crystals/mineral objects;
- portal structures;
- ritual instruments;
- hard-surface symbolic objects.

HEART anatomy should be treated conservatively: single-image reconstruction is approximate and must not silently replace authored anatomical artwork.

### screenshot-to-code — STRUCTURAL DRAFT ONLY

Source: https://github.com/abi/screenshot-to-code
License: MIT

Use to accelerate image/mockup → initial structure. Then refactor into KODEX components and compare against the source image.

Never accept generated screenshot-to-code output as final on generation alone.

### GetLayers — METHOD REFERENCE

Reference: https://www.getlayers.ai/docs

Adopt the workflow, not proprietary visual content:

`LIVE SELF-CONTAINED LAYER → VERIFY → PORT INTO REAL APP`

This is especially useful for WebGL/Three/animated sections that should reach visual quality before framework integration.

### PixiJS — OPTIONAL 2D GPU ENGINE

Source: https://github.com/pixijs/pixijs

Potential KODEX uses:

- console/OS visual field;
- high-density 2D overlays;
- ASCII FIELD;
- PIXEL RELIC;
- custom displacement/noise/CRT filters;
- sprite/mask-heavy scenes.

Do not introduce Pixi when DOM/SVG/Canvas2D is sufficient.

### gltfjsx — OPTIONAL GLTF WEB PIPELINE

Source: https://github.com/pmndrs/gltfjsx

Use when real GLTF/GLB assets are integrated into React Three Fiber. Optimize/prune/compress assets and retain source/license metadata.

### Hunyuan3D — RESEARCH / OPTIONAL ASSET GENERATION

Source: https://github.com/Tencent-Hunyuan/Hunyuan3D-2

Use only after reviewing the exact model/release license and hardware requirements. Generated mesh provenance must be recorded and assets must be optimized before web use.

### LaplASCIIan — ASCII METHOD REFERENCE

Source: https://github.com/zalo/LaplASCIIan

Use as research for animated ASCII/SVG techniques. KODEX should own its source-to-glyph mapping and visual grammar rather than depend on an external service at runtime.

## KODEX scene decision matrix

### Plate-led authored scene

Use:

- Astro/CSS;
- authored plate;
- Canvas/SVG/DOM live overlays;
- Playwright evidence;
- Impeccable audit.

Only add 3D if it demonstrably improves the plate.

### Procedural spatial scene

Use:

- existing KODEX WebGL/Three engine first;
- img2threejs if reconstructing a reference object;
- GLTF/gltfjsx when authored meshes exist;
- Playwright/device QA.

### Console / pixel / ASCII scene

Start with:

- DOM/SVG/Canvas2D;
- upgrade to PixiJS if GPU 2D composition becomes a material advantage;
- preserve semantic DOM controls for accessibility.

## Installation policy

Do not automatically add every external resource to application dependencies.

Skills/tools should be installed at the **agent/development layer** unless runtime code truly depends on them.

Before adoption:

- verify source repository;
- verify license;
- inspect install scripts/permissions;
- pin version/tag/commit where reproducibility matters;
- never expose secrets;
- test in a branch/worktree;
- record browser evidence.

## Agent routing

### Claude Max
Frontier visual judgment, difficult img2threejs review, Impeccable critique.

### Claude Pro
Scarce second-pass architecture and visual disagreement resolution. No mechanical volume work.

### Codex
Implementation, procedural 3D, browser verification, bounded visual fixes.

### OpenCode/OpenClaude
Responsive deltas, repetitive QA, deterministic refactors/evidence.

### ChatGPT Orchestrator
Source verification, tool selection, canon compliance, routing and acceptance accounting.

## Handoff contract

A visible-scene handoff must include:

```text
TARGET:
GOLDEN_REFERENCE:
FILES_CHANGED:
TOOLS_USED:
TOOL_VERSIONS_OR_REFS:
BUILD_PASS:
BROWSER_PASS:
DESKTOP_CAPTURE:
MOBILE_390_CAPTURE:
MOBILE_412_CAPTURE:
REDUCED_MOTION:
VISUAL_DELTA_REMAINING:
FRONTIER_VISUAL_PASS:
CREATOR_VISUAL_PASS:
DEPLOYMENT: BLOCKED
```

Do not collapse those gates into one `DONE` status.
