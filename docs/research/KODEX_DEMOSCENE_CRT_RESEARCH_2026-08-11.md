# KODEX−∞ Research Packet — Demoscene / CRT / ANSI / Procedural Effects

Date: 2026-08-11  
Station: Kimi Intelligence / Improvement  
Status: RESEARCH — implementation requires repo audit + evidence  
Purpose: translate demoscene/CRT techniques into KODEX-native, source-aware Effect Foundry decisions without creating duplicate runtime systems.

---

## Executive finding

The external research is directionally useful, but the active `redesign-v2` repo already contains a substantial KODEX CRT engine at `src/kodex/crt/kodex-crt.esm.js`.

That engine already implements a broad CRT vocabulary including scanlines, phosphor masking, noise, flicker, bloom, persistence, chromatic offset, curvature, vignette, bleed, scene presets, anomaly modes and adaptive quality profiles.

**Therefore: do not implement a second standalone `kodex-crt-mobile.frag` by default.**

External CRT implementations should be treated as benchmarks/reference material. The next engineering action is to compare missing capabilities, tune the existing KODEX CRT and validate mobile/performance behavior before adding another renderer.

---

## Primary research sources

### Godot Shaders — Lightweight CRT Effect

Source: `https://godotshaders.com/shader/lightweight-crt-effect/`

Relevant principles:

- small parameter surface: scanlines, warp, vignette, grille, brightness;
- explicitly designed for mobile/performance-sensitive use;
- useful benchmark for low-power KODEX quality mode;
- source page states code snippets are CC0.

KODEX use: benchmark the existing `CRT_QUALITY.low-power` and `balanced` profiles rather than copying the shader wholesale.

### Ctrl-Alt-Test — Shader Minifier / demoscene size coding

Sources:

- `https://www.ctrl-alt-test.fr/glsl-minifier/`
- `https://www.ctrl-alt-test.fr/`

Relevant principles:

- procedural generation can replace stored media;
- maintain readable source first, optimize/minify at the build boundary;
- repeated shader structure can compress well;
- tiny demos succeed through modular timing, procedural assets and strong constraints rather than giant monolithic shaders.

KODEX use: favor reusable shader recipes/presets and procedural fields in the Effect Foundry. Do not sacrifice maintainability merely to imitate 4K-intro byte budgets.

### cool-retro-term family

Source surfaced during verification: `https://github.com/Swordfish90/cool-retro-term`

Relevant principles:

- cathode-display visual language;
- CRT look implemented through GLSL/QML effects;
- useful visual/technical reference for scanline, curvature, glow and related behavior.

**License gate:** the exact `cool-retro-term-webgl` source named in the original research packet was not independently resolved during this repo integration pass. Do not copy shader/code from a similarly named project until the exact repository and license are verified. Treat the family as reference-only for now.

### ANSI / Escapes.js research

The research packet proposes using a real ANSI parser for `.ans` assets and preserving provenance/rights.

Repo audit result for `src/kodex/ascii/` on `redesign-v2`:

- `config/glyph-sets.js`
- `config/palettes.js`
- `engine/AsciiRenderer.js`
- `engine/math.js`
- scene modules for `cosmology`, `descent`, `observe`, `signal`

No `.ans` asset exists inside that subtree in the audited branch.

KODEX use: if authentic ANSI assets are later introduced, register them as external `REF` until `stable_id`, creator, provenance and rights are verified. Do not treat found ANSI art as owner-authored KODEX material by default.

---

## Demoscene technique → KODEX translation

### 1. Sine scroller

Core principle:

`y = sin(x + time) * amplitude`

Potential KODEX mapping:

- amplitude can respond to a declared non-persistent signal value;
- frequency can be scene/preset controlled;
- content may expose real journey metadata only if the underlying state field is authoritative;
- reduced-motion mode renders a flat/static strip;
- do not serialize pointer-derived amplitude into canonical memory.

Candidate role: Effect Foundry recipe for ARCHIVE/MACHINE telemetry, not generic decoration.

### 2. Procedural plasma

Core principle: combine spatial sine/cosine fields and time to generate color/energy without texture assets.

Potential KODEX mapping:

- COSMOLOGY field;
- VORTEX / source-field treatment;
- procedural background under a stronger semantic anchor;
- palette comes from scene tokens/preset, not hard-coded one-off colors;
- mobile quality profile should reduce resolution/DPR rather than change meaning.

Candidate role: new Effect Foundry recipe if repo audit confirms there is no equivalent field shader already available.

### 3. CRT post-processing

Original research proposed a new mobile CRT shader.

**Corrected KODEX action:** reuse/tune `src/kodex/crt/kodex-crt.esm.js` first.

Existing engine capabilities observed in repo include:

- per-scene CRT presets (`neutral`, `threshold`, `observe`, `descent`, `archive`, `machine`, `cosmology`, `return`);
- `full`, `balanced`, `low-power` quality modes;
- mobile/hardware/reduced-motion-aware quality selection;
- WebGL2 + fallback path;
- signal/focus-driven state;
- anomaly modes;
- visibility stop/start;
- persistence and scene-specific tint/masks.

A new CRT implementation is justified only by a measured missing capability that cannot be cleanly added to the existing engine.

### 4. ANSI / real archive artifacts

Use authentic `.ans` only with traceable provenance. A parser can be useful, but the archive must distinguish:

- OCIN-authored material;
- canonical KODEX material;
- external reference/archive material;
- rights-cleared publication assets.

### 5. Timeline of small shaders

Demoscene timing is useful as an implementation concept, but KODEX is not a fixed 30-second movie.

Prefer:

`journey state + explicit user action + scene transition → selected effect/preset`

over

`elapsed seconds alone → auto-advance canon`

Time may modulate local effect behavior, but voluntary navigation and authoritative JourneyState own narrative progression.

---

## Decisions

| Decision | KODEX status |
|---|---|
| Add an external CRT package by default | NO — existing internal CRT subsystem already covers the core effect family. |
| Create a second `kodex-crt-mobile.frag` now | NO — audit/tune existing engine first. |
| Use external CRT projects as references | YES — source-aware benchmark; verify exact license before code reuse. |
| Implement procedural plasma recipe | CANDIDATE — only after searching existing Effect Foundry/shaders for equivalent implementation. |
| Implement sine-scroller recipe | CANDIDATE — only with semantic data mapping + reduced-motion fallback. |
| Import external ANSI art | CONDITIONAL — provenance/creator/rights required; default external type = REF. |
| Use fixed elapsed-time shader timeline to control narrative | NO — KODEX JourneyState/navigation remains authoritative. |
| Use time internally to animate selected effects | YES. |

---

## Corrected next actions

1. **CRT audit, not replacement** — compare Kimi research parameters against `src/kodex/crt/kodex-crt.esm.js`; identify only genuinely missing behavior.
2. **Effect Foundry search** — verify whether plasma/sine-field equivalents already exist before opening a new implementation lane.
3. **If missing, create the smallest reversible recipes** — plasma + semantic sine scroller, with no new framework dependency.
4. **ASCII result recorded** — no `.ans` files were found inside `src/kodex/ascii/` on the audited `redesign-v2` subtree; do not invent an ANSI migration task until assets exist.
5. **Mobile QA** — any new procedural recipe must be measured at 390×844 and 412×915, including reduced motion, console errors, overflow and frame behavior.
6. **License gate** — resolve exact repository/license before copying any external CRT/ANSI implementation code. Reference/behavioral reimplementation remains preferred when the same result can be achieved cleanly in the existing KODEX engine.

---

## Control question

Does this make KODEX clearer, coherent, verifiable, reusable and alive?

Only if research **reduces duplication** and produces a tested improvement to an existing system. External inspiration is not itself a reason to create another renderer.