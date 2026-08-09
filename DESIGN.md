# KODEX−∞ — DESIGN.md

Status: `PORTABLE DESIGN CONTRACT / V1`
Authority: Visual Atlas + KODEX canon + creator-approved golden references.
Creator visual authority: Ocín.

This file tells coding agents **how KODEX should look and behave**. It does not replace canon, source provenance, scene bibles, or creator judgment.

## Product register

KODEX−∞ is a living archive, visual operating system, computational laboratory and narrative universe. It is not a conventional marketing site, generic sci-fi dashboard, AI-image gallery, or collection of disconnected landing pages.

The experience should feel like an authored instrument: editorial, ritual, computational, precise, material and alive.

## Core visual thesis

KODEX sits between:

- archive and organism;
- black field and luminous signal;
- material object and computational instrument;
- scientific-interface discipline and mythopoetic atmosphere;
- dense technical plate and moments of radical emptiness.

The visual system should make **signal, matter, memory and transformation** legible through composition and behavior.

## Golden-reference rule

When a scene has an approved plate/reference, that image is the visual source of truth.

Required sequence:

`GOLDEN PLATE → EXACT STATIC COMPOSITION → LIVE LAYERS → RESPONSIVE ART DIRECTION → VISUAL DIFF → PROGRESSIVE NATIVE REPLACEMENT`

Do not redraw an approved hero object from prose merely to make the implementation more “native”. A bitmap/plate may remain part of the final scene when it preserves authored quality.

A coded replacement may displace plate content only when side-by-side browser evidence shows equal-or-higher fidelity and the creator approves it.

## Composition

Prefer:

- one dominant focal organism/object per scene;
- deliberate asymmetry or controlled radial systems when the plate calls for it;
- strong negative space around a focal signal;
- peripheral technical/editorial instrumentation;
- clear foreground / object / cavity-or-field / background depth planes;
- fullscreen scene logic rather than stacked marketing sections for primary KODEX journey scenes.

Avoid:

- generic card grids;
- repeated rounded rectangles;
- SaaS dashboard composition;
- centered hero + three feature cards;
- arbitrary glassmorphism;
- decorative gradients that are not tied to the scene ontology;
- “cyberpunk” filler unrelated to KODEX.

## Material language

Primary field:

- obsidian / near-black;
- real darkness, not washed charcoal everywhere.

Signal materials may include:

- mineral violet;
- ember/copper;
- spectral white;
- chrome/metallic highlights;
- restrained cyan or magenta only when scene/canon supports it.

Surfaces should suggest matter: membrane, mineral, metal, bone, paper/archive, fluid, glass, topology or field—not flat CSS color blocks.

## Typography and editorial system

Use the fonts already approved/available in the repository or typography present in the golden plate. Do not introduce a new typeface merely because an external design skill recommends it.

The system may combine:

- expressive display typography;
- technical mono/instrument labels;
- editorial serif/sans when scene-specific.

Preserve hierarchy. Technical microcopy should remain subordinate to the central proposition/object.

Avoid generic AI-interface habits such as excessive uppercase everywhere, random tracking, decorative pseudo-code, or labels that imply measurements the system does not actually possess.

## Telemetry truth

Never fabricate scientific/biometric telemetry as if measured.

Every readout must be classifiable as one of:

- `MEASURED` — actually measured by the runtime;
- `STATE` — true application/system state;
- `ATMOSPHERE` / `SIM` — clearly identified narrative/simulated display.

Do not use fake RF frequencies, fake biometric certainty, fake authentication, fake clearance, or fake observer identification as factual interface signals.

## Motion grammar

Motion is state change, not decoration.

Prefer:

- slow breathing;
- local deformation near the observer/pointer;
- material tension;
- reveal/occlusion;
- focus stabilization;
- orbit where spatial ontology requires it;
- small responsive transitions in system chrome;
- scene transitions that preserve memory/continuity.

Avoid:

- constant motion on every element;
- generic floating cards;
- random particle noise without semantic role;
- excessive springiness;
- movement that compromises reading or visual comparison.

`prefers-reduced-motion` must preserve state legibility without requiring continuous animation.

## KODEX OS / console logic

Console inspiration is architectural, not a Sony skin.

Use a cross-axis navigation model when appropriate:

- horizontal axis = worlds / scene families;
- vertical axis = actions / nodes / contextual operations;
- contextual system panel = options/state;
- keyboard, touch and optional gamepad should map to the same semantic actions.

Possible display modes are system-level render interpretations, not separate redesigns:

- `REALITY` — authored visual surface;
- `ASCII FIELD` — high-resolution luminance/edge interpretation;
- `PIXEL RELIC` — deliberate low-resolution/palette interpretation;
- `WIREFRAME` only where a real geometry layer exists.

## Scene implementation layers

Prefer this decomposition:

1. `AUTHORED PLATE / ASSET`
2. `LIVE EFFECTS` — Canvas/WebGL/Pixi/GLSL only where valuable
3. `SEMANTIC DOM/SVG CHROME`
4. `INTERACTION + JOURNEYSTATE`
5. `RESPONSIVE ART DIRECTION`
6. `QA / VISUAL REGRESSION`

Do not choose Three.js, React, PixiJS or another library simply because it is available. Choose the least expensive renderer that preserves the scene’s ontology and visual standard.

## 3D

3D is justified when spatial inspection, parallax, lighting, material, orbit, transformation or depth is intrinsic to the scene.

For image-led reconstruction, a procedural reconstruction may be developed in parallel with the plate. It must not replace the plate until comparison evidence supports the replacement.

Preferred web asset format for authored meshes: glTF/GLB with explicit provenance/license record and web optimization.

## ASCII / pixel modes

ASCII and pixel modes must look intentional at close range.

ASCII:

- derive from luminance/edges or real source texture;
- use consistent glyph density and aspect correction;
- SVG/canvas/text rendering must remain crisp;
- avoid novelty “ASCII filter” aesthetics detached from the source.

Pixel:

- deliberate resolution and palette;
- nearest-neighbor / pixelated rendering where appropriate;
- preserve the original silhouette/composition;
- optional CRT/ghosting must be restrained and scene-aware.

## Responsive design

Mobile is art direction, not compressed desktop.

Required review sizes for active scene work:

- desktop reference viewport;
- 390×844;
- 412×915.

For dense plates, choose among:

- proportional whole-plate scaling;
- controlled crop/focus window;
- separate approved portrait plate;
- selective semantic overlays.

Do not automatically reflow a dense authored plate into a generic single-column mobile page.

## Accessibility

Interactive semantics must exist independently of the visual effect.

Required:

- keyboard-accessible primary actions;
- touch parity;
- visible/meaningful focus treatment;
- alt/semantic descriptions for authored imagery;
- reduced motion;
- no critical information encoded only by color or hover.

## Agent workflow

Before changing a visible KODEX scene:

1. read this file;
2. identify the golden visual target and provenance;
3. state which parts are plate, DOM/SVG, Canvas/WebGL/3D;
4. inspect existing KODEX engines/assets before creating a new one;
5. make one bounded visual change;
6. open the page in a real browser;
7. capture desktop + required mobile evidence;
8. compare against the golden target;
9. report `BUILD_PASS`, `FRONTIER_VISUAL_PASS`, and `CREATOR_VISUAL_PASS` separately.

## External design skills

External design/audit skills may help identify problems, but they are subordinate to this contract and the golden reference.

Recommended roles:

- Impeccable: primary anti-pattern/critique/polish assistant;
- Taste Skill: independent second-pass audit or image-to-code experiment;
- img2threejs: bounded reference-to-procedural-Three reconstruction;
- Playwright CLI: required browser evidence for visible work.

See `docs/kodex/AGENT_VISUAL_TOOLCHAIN.md`.

## Definition of visual acceptance

A page is not done because it builds.

For creator-facing scene closure, require:

- reference-level composition and atmosphere;
- no obvious generic AI-design artifacts;
- responsive mobile art direction;
- motion and interaction consistent with the scene;
- truthful telemetry;
- performance/fallback/reduced-motion checks;
- browser screenshots suitable for comparison;
- creator approval.

Production deployment remains a separate gate and is never implied by visual approval.
