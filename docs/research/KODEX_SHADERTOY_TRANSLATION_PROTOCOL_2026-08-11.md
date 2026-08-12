# KODEX Shader Intake Protocol — Shadertoy → Effect Foundry

Date: 2026-08-11  
Status: research/translation contract; docs-only; no runtime change.

## Purpose

Use Shadertoy and similar shader archives as a source of mathematical techniques, not as a default source of copy-paste implementation. Translate useful visual primitives into the existing KODEX WebGL2/GLSL architecture only when they add a genuine capability delta.

## Repo reality

`wenu-frontend` already uses Astro and has an existing KODEX WebGL/GLSL stack. The active `redesign-v2` package manifest includes `three` but does not include React. Therefore a React wrapper is not the default KODEX integration path for a fullscreen shader.

Astro can host React components with `client:only="react"`, but that requires the React integration/runtime and should only be introduced if React itself solves a broader product need. A shader alone does not justify it.

## Important correction to the sample plasma shader

The pedagogical sample supplied in chat constructs `vec3 color = vec3(...)` using three expressions that each already return `vec3`. That produces an invalid constructor shape and should not be treated as executable reference code.

For a valid cosine palette, prefer a single vec3 expression such as:

```glsl
vec3 color = 0.5 + 0.5 * cos(
  u_time * 0.5
  + vec3(0.0, 2.0, 4.0)
  + vec3(uv.x, uv.y, uv.x) * 6.28318
);
```

The exact palette should later be remapped to a scene recipe rather than hard-coded as generic rainbow output.

## WebGL1 vs KODEX WebGL2

Do not blindly translate Shadertoy to `gl_FragColor`.

KODEX already uses WebGL2 / GLSL ES 3.00 patterns. Preferred fragment structure:

```glsl
#version 300 es
precision highp float;

out vec4 fragColor;
uniform float u_time;
uniform vec2 u_resolution;

void mainImage(out vec4 color, in vec2 fragCoord) {
  vec2 uv = fragCoord / u_resolution;
  color = vec4(uv, 0.0, 1.0);
}

void main() {
  mainImage(fragColor, gl_FragCoord.xy);
}
```

Keeping `mainImage` as a local function can make mathematical comparison against the source easier while still using the KODEX WebGL2 output contract.

## Uniform translation map

Translate Shadertoy inputs into explicit KODEX semantics:

| Shadertoy | KODEX target | Rule |
|---|---|---|
| `iTime` | `u_time` | animation only; must not own journey progression |
| `iResolution.xy` | `u_resolution` | physical render resolution, DPR-aware |
| `iMouse` | `u_pointer` or declared pointer state | ephemeral interaction; never persistent memory by default |
| `iChannel0..3` | explicit sampler uniforms | every external texture/audio/data asset requires provenance and a declared role |
| frame feedback | `u_previousFrame` where the renderer supports it | use only in recipes designed for feedback/persistence |
| audio channel | existing `u_audio`-style contract when available | measured/simulated source must be explicit |

Do not invent new uniform names for concepts already represented in Effect Foundry.

## Intake workflow

1. **Source identification** — record URL, author, title, date/version if available.
2. **Rights/license check** — literal source reuse is blocked until permission/license is clear.
3. **Math extraction** — identify reusable primitives: SDF, FBM, Voronoi, polar mapping, folding, repetition, ray marching, feedback, palette, interference, etc.
4. **Repo overlap audit** — search current shaders, CRT, ASCII, Effect Foundry, approved plates and active PRs.
5. **Capability delta** — state what the reference can do that KODEX cannot already do cleanly.
6. **Clean implementation or extension** — prefer adapting an existing renderer/recipe over creating another runtime.
7. **Semantic mapping** — declare scene/node purpose and which state variables may influence visual parameters.
8. **Fallback/reduced motion** — define static or lower-motion equivalent before integration.
9. **Mobile/performance QA** — verify at 390×844 and 412×915, with actual viewport dimensions and measured FPS/frame cost where relevant.
10. **Provenance + learning** — update research record and `LEARNINGS.md` if the result changes future decisions.

## Runtime requirements for any imported mathematical recipe

A production candidate must account for:

- DPR caps / render scale;
- `ResizeObserver` or equivalent size synchronization;
- compile and link failures;
- `webglcontextlost` fallback;
- hidden-tab / out-of-view pausing;
- `prefers-reduced-motion`;
- cleanup of rAF, GL resources and listeners;
- deterministic seeds when variation must be reproducible;
- explicit simulation labels when visual telemetry is not measured data.

A minimal tutorial loop that only calls `requestAnimationFrame` is not sufficient as a KODEX production runtime.

## Texture/channel rule

If a reference depends on `iChannel0..3`, the texture is part of the work's provenance and performance contract. Do not silently hotlink or substitute arbitrary imagery. Register the asset and its rights/status before publishing.

## Three.js / React rule

Use the smallest layer that solves the problem:

- pure fragment/fullscreen field → existing KODEX WebGL2 runtime first;
- geometry/camera/mesh/scene graph → existing `three` dependency may be appropriate;
- React/R3F → only when a React component model provides a broader architectural advantage, not merely to obtain a canvas lifecycle.

## Acceptance question

Before implementing a Shadertoy-derived idea, answer:

> What mathematical or interaction capability does this add that the current KODEX shader/Effect Foundry corpus does not already provide?

If the answer is unclear, keep it as `REF`/research rather than implementation work.
