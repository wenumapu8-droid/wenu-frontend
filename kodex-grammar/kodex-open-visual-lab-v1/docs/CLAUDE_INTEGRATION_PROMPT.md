# Prompt maestro — integrate KODEX Open Visual Lab

Use the included code as an isolated visual engine for the existing Astro
KODEX route.

## Non-negotiable architecture

```text
WebGL:
living field, feedback, particles, distortion, audio response

SVG:
frames, barcodes, labels, micrographics, diagrams

DOM:
headline, copy, CTA, navigation, accessibility
```

Do not rasterize the complete poster.

## Steps

1. Copy `src/runtime` and `src/shaders` into the repository.
2. Mount exactly one `KodexPipeline` for the active scene.
3. Use the scene blueprint theme to set `accent`.
4. Keep typography and metadata outside the canvas.
5. Pause the pipeline when its scene is inactive.
6. Dispose framebuffers and programs on route teardown.
7. Cap DPR:
   - mobile: 1
   - desktop: 1.5
8. Default effects:
   - CRT: 0.35–0.72
   - Dither: 0.08–0.22
   - Grain: 0.02–0.05
   - RGB split: 0.6–1.8 px
   - Feedback: 0.06–0.24
9. ASCII is a scene/state, not a permanent global filter.
10. Add reduced-motion mode:
    - speed 0
    - feedback 0
    - RGB split 0
    - CRT scanline reduced
    - keep a readable frozen frame

## Validation

- 390×844
- 430×932
- 768×1024
- 1440×900
- 1920×1080
- no vertical scroll
- no console errors
- no sustained mobile FPS below 45
- one active canvas
- ten scene cycles without memory growth

Do not deploy until the exact phrase:

```text
APROBAR DEPLOY
```
