# KODEX−∞ — Sentinel / Agentic Visual Runtime Research

**Date:** 2026-08-21  
**Status:** RESEARCH / NON-CANON / NO RUNTIME CHANGES  
**Purpose:** Preserve a high-value authoring-system reference without turning it into a parallel KODEX architecture.

## Source capture

User-supplied screenshots show a Sentinel session with source image, foreground cutout/mask, depth estimate, main rendered canvas, detection ROI, graph/node view, code/log output and parameter panels.

The visible post states that the setup combines **StreamDiffusion, DepthAnything V2, BiRefNet and YOLO-X**, rendered with **ray-marched SDFs** in real time in Sentinel. It also states that the node graph was assembled by **GPT-5.6 via MCP** while the creator steered it, and that the resulting rig remained readable and controllable through interactive parameters/presets, mouse and keyboard.

References:
- Sentinel early access: https://ood-labs.com/sentinel/waitlist/
- Creator/reference account: https://www.instagram.com/cerspense/
- Public cerspense ComfyUI node lineage: https://github.com/cerspense/ComfyUI_cspnodes
- Drive deep dive: https://docs.google.com/document/d/18BzO-g6sbGAYHLig2p2IS5UyI84qn5glK6uJ2e-6Sdk/edit
- Open-source source hunt: https://docs.google.com/document/d/15py1K-6s0PEM_41zBLpSH93YLKKVJDVy7C0KXBo1-yo/edit
- User-supplied visual reference master map: https://docs.google.com/document/d/1MGC_Av6E57hH2sGDEEjspvhs5tp68IGxXSuqma3tQLU/edit

**Provenance boundary:** Sentinel is proprietary/early-access software. Study the authoring paradigm; do not copy, scrape or depend on its code, UI or graph designs.

## What KODEX should extract

This is primarily an **authoring-system reference**, not a visitor-facing visual reference.

```text
HUMAN INTENT
→ AGENT
→ TYPED NODE GRAPH
→ LIVE PREVIEWS
→ GPU / ML OPERATORS
→ REAL-TIME OUTPUT
→ HUMAN STEERING
→ PRESET / MEMORY / PROVENANCE
```

Proposed bounded concept: **KDX.LAB / AGENTIC GRAPH**.

KDX.LAB would be an internal authoring layer for scenes, materials, type, organisms, visual perception and media. It must feed the existing KODEX runtime/product pipeline rather than create a second public shell, renderer, router, memory store or design system.

## Reconstructed proof pipeline

The screenshots/caption support this high-level chain. Exact Sentinel internals are not claimed.

```text
INPUT / CAMERA / IMAGE
→ object detection (YOLO-X)
→ segmentation / alpha cutout (BiRefNet)
→ monocular depth (Depth Anything V2)
→ realtime generative transform (StreamDiffusion)
→ spawn / pattern / collage logic
→ SDF / ray-marched procedural geometry
→ material / shader treatment
→ composited live output
→ keyboard / mouse / preset control
```

## Component candidates and license boundaries

### StreamDiffusion
https://github.com/cumulo-autumn/StreamDiffusion

- Pipeline license: Apache-2.0.
- KODEX role: realtime generative-source research inside KDX.LAB.
- Model/checkpoint licenses are separate and must be tracked individually.

Current evolution to watch: https://github.com/chenfengxu714/StreamDiffusionV2

### Depth Anything V2
https://github.com/DepthAnything/Depth-Anything-V2

- **Small:** Apache-2.0.
- **Base / Large / Giant:** CC-BY-NC-4.0.
- Commercial KODEX experiments should default to Small unless other commercial rights are secured.
- Role: 2D art/image → spatial field, parallax, depth masks, depth-aware particles/type/composition.

### BiRefNet
https://github.com/ZhengPeng7/BiRefNet

- Repository license: MIT.
- Role: foreground extraction/matting for artwork, symbols, photographed objects and responsive composition.
- Weight/dataset provenance still requires per-model review before commercial deployment.

### YOLOX
https://github.com/Megvii-BaseDetection/YOLOX

- License: Apache-2.0.
- Role: semantic spatial triggers, camera interaction and installation research.
- Detection must cause authored KODEX behavior; never add detection merely as novelty.

### Shader Park Core
https://github.com/shader-park/shader-park-core

- License: MIT.
- Role: KDX.OBJECT + KDX.MATERIAL + KDX.PORTAL; browser-native procedural SDF/raymarching experiments.

### LYGIA
https://github.com/patriciogonzalezvivo/lygia

- Strong shader study library, but current licensing is not a simple permissive MIT grant.
- Treat as research/reference unless the commercial-license path is explicitly resolved.

## Open-source projects closest to the paradigm

### SubjectiveZero
https://github.com/sxp-studio/subjective-zero

Agentic node editor for creative coding/realtime VFX with inspectable graph outputs, agent orchestration, MCP and hot reload. **Very high architectural study value.** AGPL-3.0 plus project-specific exception language means embedding/hosting obligations require review.

### XenolithGraph
https://github.com/XenolithEngine/xenolith-graph

MIT, beta. Embeddable web node graph with typed pins, macros, widgets and built-in MCP support. **Very high candidate for a lightweight KDX.LAB graph prototype.**

### Blacknode
https://github.com/temiroff/Blacknode

Apache-2.0 typed workflow/runtime with replay, packages, GPU/AI extensions and MCP. Robotics domain, but useful as a data-contract/runtime reference.

### Graphite
https://github.com/GraphiteEditor/Graphite

Open procedural vector/raster graphics environment. Useful for nondestructive composition and visual-programming research.

## KDX.LAB bounded architecture

```text
KDX.LAB
├── GRAPH
│   ├── typed nodes
│   ├── semantic ports
│   ├── live previews
│   ├── recipes / presets / genomes
│   └── provenance
├── AGENT BRIDGE
│   ├── MCP or equivalent typed tools
│   ├── graph read / write
│   ├── node creation
│   ├── parameter search
│   └── bounded autonomous exploration
├── PERCEPTION
│   ├── segmentation
│   ├── depth
│   ├── detection
│   └── audio analysis
├── GENERATION
│   ├── KDX.LIFE / cellular systems
│   ├── diffusion / image transforms
│   ├── procedural geometry
│   ├── KDX.TYPE operators
│   └── KDX.MATERIAL operators
├── RUNTIME PREVIEW
│   ├── desktop
│   ├── mobile
│   ├── motion export
│   └── installation mode
└── MEMORY
    ├── graph versions
    ├── mutations
    ├── creator decisions
    ├── observer-state experiments
    └── output genealogy
```

## Creative authority

**Agent ≠ author.**  
Agent = low-level computational collaborator.  
Creator/KODEX direction = authority.

Desired interaction is semantic, for example:

- “make the organism split here”
- “use depth to reveal the archive behind it”
- “let the signal disturb the SDF field”
- “branch this state and preserve the previous genome”

The agent handles implementation complexity while leaving an inspectable graph and reproducible recipe rather than an opaque one-off prompt result.

## Bounded implementation path

- **P0:** research/architecture only; do not destabilize current KODEX lineage.
- **P1:** prototype exactly one tiny graph: `IMAGE → DEPTH → MASK → SDF/SHADER → KODEX COMPOSITION`.
- **P2:** persist parameters as a reusable recipe/preset/genome with provenance.
- **P3:** expose bounded graph read/write through MCP or equivalent typed protocol.
- **P4:** connect one existing KDX.LIFE or KDX.TYPE operator.
- **P5:** only after browser evidence and creator review, decide whether KDX.LAB deserves a dedicated internal application.

## Acceptance criteria for a first proof

1. No changes to public KODEX navigation, shell, memory authority or canonical scene contracts.
2. One input image/artwork can be segmented and depth-estimated.
3. The depth/mask causally drive one original procedural SDF/shader response.
4. Parameters remain human-readable and adjustable.
5. The entire state can be serialized/reloaded as a recipe.
6. Every model/library/asset records license and provenance.
7. Mobile/desktop output remains subordinate to KDX.COMPOSE rather than becoming a generic realtime-demo layout.
8. Agent changes are inspectable and reversible.

## Truth boundary

```text
SENTINEL OBSERVED / REPORTED ≠ KODEX IMPLEMENTED
OPEN-SOURCE REFERENCE ≠ LICENSED KODEX DEPENDENCY
PROTOTYPE ≠ CANON
AGENT-GENERATED GRAPH ≠ CREATOR-ACCEPTED OUTPUT
IMPLEMENTED ≠ CI PASS ≠ BROWSER VERIFIED ≠ CURATOR REVIEWED ≠ CREATOR ACCEPTED ≠ CANON ≠ MERGED ≠ DEPLOYED
```

No runtime implementation is authorized by this document. It is a research/architecture record and a bounded future experiment specification.
