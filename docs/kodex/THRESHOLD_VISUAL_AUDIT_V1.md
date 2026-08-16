# KOD-49 — THRESHOLD Visual Audit v1

Status: `REWORK / STRONG BASE`

This audit compares the native KOD-49 QA captures against two creator/Drive reference targets while preserving KODEX canon rather than copying either source literally.

## Evidence inspected

Native QA head: `b7bb278c89632310fe1c8a5ab43300736d3d6452`

Workflow: `KODEX Threshold Fidelity CI` run `31238073991` — GREEN.

Artifact: `kodex-threshold-fidelity-qa` id `9016126284`, digest `sha256:bbb9c5c0ba4a461c6349238a1d2638e4d58ffadd36edbd052330283464470b54`.

Captures:
- `threshold-desktop.png`
- `threshold-390x844.png`
- `threshold-412x915.png`

Reference A — Portal Organism:
https://drive.google.com/file/d/18gn1Sm0oRDxXWA6_K6ff8lrYU7b58-NK

Reference B — KODEX−∞ Threshold Portal board:
https://drive.google.com/file/d/15sl4wf9FdMwoZllPpO6n-efe9tqW3oZG

Canonical constraints:
- P0 Scene Bible THRESHOLD remains authority for semantics;
- visual references are translated through abstract composition/material/system properties;
- no fabricated coordinates, energy percentages, biometrics, frequencies, authentication state or scientific claims from the reference boards may be copied into the product.

## Provisional score

`VISUAL_IMPACT: 58 / 100`

`NATIVE_IMPLEMENTATION: 48 / 100`

Interpretation: the current native lab has a coherent hierarchy and already reads as a designed KODEX screen, but the focal organism is still a smooth concentric aperture rather than the materially complex living interface implied by the strongest references. It is a useful scaffold/native bridge, not creator-ready visual acceptance.

### Score breakdown

| Dimension | Score | Evidence |
|---|---:|---|
| composition / focal hierarchy | 7/10 | clear left-copy / right-object split; aperture dominates |
| typography / editorial rhythm | 7/10 | strong headline; microtype system is coherent but still sparse |
| object material complexity | 3/10 | current rings are soft/flat; reference target has cavities, occlusion, chrome, tendrils and internal matter |
| depth / Z separation | 4/10 | field, portal and UI separate, but the object itself lacks foreground/midground/internal depth |
| KODEX-specific system density | 4/10 | truthful telemetry exists but does not yet reach the archival/technical density of the visual system |
| palette / light | 6/10 | obsidian + violet is canonical; specular/mineral material response is still weak |
| mobile composition | 7/10 | readable/no-overflow, but portal is too small and upper negative space too large |
| finish / reference-level presence | 5/10 | solid candidate; not yet a reference-grade artifact |

Motion is deliberately **not scored from the CI still captures** because the screenshots were taken after the QA motion toggle entered REDUCED. Full-motion behavior needs a separate frontier browser pass.

## What is working — preserve

1. The screen has one obvious focal organism and one obvious voluntary action.
2. Canonical copy `THE GATE IS A LIVING AGREEMENT.` is visually strong.
3. Pointer is atmospheric only; semantic entry remains explicit.
4. No fake telemetry is displayed.
5. Desktop/mobile hierarchy survives without horizontal overflow.
6. Obsidian + mineral violet keeps KODEX distinct from literal reference copying.
7. Canvas2D gives a real native/fallback path instead of a static image dependency.

## Delta packet v1

### D1 — Replace concentric flower with asymmetric living shell

Current problem: the membrane reads as four smooth nested rings.

Target behavior: an irregular shell with cavities, protrusions, local thickness changes and partial occlusion.

Implementation target:
- 3–5 large structural lobes instead of visually even rings;
- 18–30 subordinate cavities distributed non-uniformly;
- 6–12 tendril/bridge forms connecting lobes;
- no rotationally obvious repeating pattern;
- preserve a readable central aperture.

Do not copy the Portal Organism mesh. Reproduce the **system property**: high-curvature biomorphic shell surrounding translucent internal matter.

### D2 — Introduce chrome/mineral material response

Current problem: color bands carry most of the form; surface has little material distinction.

Target:
- obsidian/black body;
- chrome/mineral rim highlights;
- translucent violet internal cavities;
- localized signal accents only.

Implementation target:
- at least 3 distinguishable material bands: dark shell / specular rim / translucent signal cavity;
- highlights follow local form rather than global glow;
- reduce broad violet haze by ~30–40%;
- increase narrow specular contrast around cavity edges.

Reference acid green is a material/light lesson, **not a required KODEX palette copy**. Violet remains the canonical signal color unless creator direction changes it.

### D3 — Add real internal information texture

Current problem: the center is a clean black hole with sparse points.

Target:
- glyph/data texture appears embedded behind or inside selected cavities;
- never fabricate semantic telemetry.

Allowed real labels/data sources:
- `THRESHOLD`
- `A / −∞`
- current renderer mode
- current motion mode
- scene visual state: DORMANT / AWARE / OPEN
- `IDENTITY CLAIM: NONE`
- `MEMORY WRITE: NONE` before explicit entry
- `ENTRY: VOLUNTARY`

A glyph field may be decorative if clearly atmosphere; do not label random values as measurements.

### D4 — Increase Z-depth and overlap

Current problem: title and organism sit politely beside each other.

Target: one layer should visually intrude into another without harming accessibility.

Desktop:
- organism target occupation: ~58–68% viewport height;
- let 5–10vw of shell/cavity field approach or pass behind the copy column;
- keep the aperture clear of the headline's critical legibility zone;
- establish at least four visual planes: distant field → organism shell → internal signal matter → semantic UI.

Mobile:
- increase organism diameter roughly 20–30% from current capture;
- move focal center upward so top dead space decreases;
- permit controlled side crop rather than shrinking the organism to fit cleanly.

### D5 — Increase truthful editorial density

Current problem: the page is elegant but sparse compared with KODEX's strongest techno-editorial references.

Target:
- 4–6 small information clusters around the focal system;
- use real state/implementation facts only;
- add one barcode/code-strip-like graphic only as a visual index, not an invented identity/authentication token;
- use hairlines, callout connectors and crop marks to build technical rhythm.

Do not copy the reference board's invented `energy`, `auth`, `clearance`, `harmonic`, coordinates or similar claims.

### D6 — Typography hierarchy: preserve headline, add macro system layer

Current headline is strong and should remain.

Add one low-contrast macro layer behind/around it, for example:
- cropped `THRESHOLD`
- `A / −∞`
- or a route/system wordmark.

Target: macro typography creates spatial scale but remains subordinate enough that `THE GATE IS A LIVING AGREEMENT.` stays the semantic statement.

### D7 — Interaction must deform material locally

Current proximity mainly changes aperture/opening.

Full-motion target:
- proximity bends the nearest shell/cavity region, not the whole object uniformly;
- dwell progressively stabilizes local geometry and reveals the aperture;
- visual latency target: feels immediate (<~120 ms perception), while shape easing remains organic;
- breath cycle should be slow (~6–10 s) and non-loop-obvious.

Reduced motion:
- no continuous breathing;
- pointer/keyboard actions may move between discrete DORMANT / AWARE / OPEN compositions using opacity/contrast/shape-state changes.

OFF:
- one static, high-quality composition; semantic entry still works.

### D8 — Mobile hierarchy correction

390×844 and 412×915 currently pass usability but have excessive negative space above the organism and the object reads smaller than desktop.

Target:
- portal begins around 12–16svh rather than feeling centered in the upper half;
- organism occupies ~34–42svh vertically;
- headline begins while the lower organism is still visually present, creating overlap/continuity;
- CTA remains above bottom safe area;
- preserve no horizontal overflow.

## Routing

### Claude Max Mac mini
Frontier task: inspect FULL motion in browser and either refine or reject D1–D8. Return measurable additions only.

### Claude Pro iMac
Remain READY/IDLE. Use only if:
- material strategy creates an architectural ambiguity;
- independent second-pass visual judgment is needed;
- integration/MCP/context reconciliation blocks the lane.

Do not spend Claude Pro quota implementing repetitive Canvas/CSS edits.

### Codex
Own difficult implementation after frontier confirmation:
- material/cavity renderer;
- local deformation model;
- integration of the accepted Threshold renderer into canonical Visible Assembly.

### OpenCode/OpenClaude
Own deterministic deltas:
- responsive layout;
- truthful HUD clusters;
- typography/micrographics;
- tests/CI;
- reduced/off motion states;
- repetitive styling corrections.

## Next gate

`REWORK → CI GREEN → FULL-MOTION FRONTIER RE-AUDIT → CREATOR VISUAL REVIEW`

Do not integrate to production. Do not count this scene as creator-accepted until the creator explicitly approves its visual result.
