# KODEX−∞ Reference Ingestion

Status: CURRENT / additive / non-canonical
Updated: 2026-08-19

## Purpose

Every external link supplied for KODEX must become a traceable design, research or technical input rather than disappearing into chat history or being copied as surface style.

Pipeline:

`LINK → SOURCE CHECK → RIGHTS CHECK → MECHANISM EXTRACTION → KODEX TRANSLATION → TARGET COMPONENT → BOUNDED PROOF → QA → CREATOR GATE → CANON/REJECT`

A reference is never automatically canon, code authority, reuse permission or proof of implementation.

Machine-readable registry:

`data/kodex/reference-registry.v0.1.json`

Per-reference records may also live under:

`data/kodex/references/`

Those records are additive source/provenance entries and must eventually reconcile back into the consolidated registry rather than becoming a second authority.

## Ingestion contract

For each link record:

- stable reference ID;
- title / author / institution when known;
- URL;
- reference type;
- source status;
- rights / license status;
- mechanism or design principle to extract;
- what must not be copied;
- exact KODEX scene/component/system it may inform;
- implementation status;
- creator decision when a visual proof exists.

## Current high-priority visual references

### REF-VIS-001 — Space Type Generator / Morisawa

Use as a reference for **parameterized kinetic typography**, not as a font source or identity kit.

Extract:

- title as generative geometry;
- reusable behavior modes instead of one-off animation;
- deformation parameters exposed as a system;
- motion that communicates state.

KODEX translation already initiated in the Command Shell P0.1:

- THRESHOLD → `APERTURE`
- PROLOGUE → `SCAN`
- DESCENT → `VORTEX`
- ARCHIVE → `STRATA`
- MACHINE → `ASSEMBLY`
- COSMOLOGY → `ORBIT`
- RETURN → `RECALL`

Do not directly reuse third-party fonts, branding, presets or source code until their exact license is confirmed.

### REF-UX-001 — Cyberspace.online

Use as a reference for **software-like navigation density and command interaction**, not as a cyberpunk skin.

Extract:

- command palette;
- keyboard navigation;
- mode switching;
- text-first panels;
- compact persistent system controls;
- information architecture that feels like software rather than a landing page.

Current bounded KODEX proof:

- `⌘/Ctrl+K` command palette;
- `↑/↓` scene preview;
- `0–6` direct scene selection;
- `T` display-mode cycle;
- `O` canonical scene open;
- visible touch controls;
- reduced-motion equivalents.

Do not copy Cyberspace branding, copy, social product model, theme names or implementation.

### REF-UX-002 — Reddit shortlink supplied by creator

Current source state: `NEEDS_CONFIRMATION`.

The shortlink did not resolve reliably during the current ingestion pass. Do not infer the post's content from unrelated Reddit results. The associated creator-supplied screenshot can remain a separate visual reference, but the URL itself is not yet a verified textual source.

### REF-UX-003 — Feelings Wheel / Atherio

Source:

`https://feelings-wheel.atherio.dev/`

Use as a reference for **nested radial information architecture + direct manipulation + fracture/repair state grammar**, not as an emotion taxonomy or mental-health product pattern.

The public page currently supports these observations:

- a three-ring wheel;
- drag/flick manipulation;
- high-energy spin can break/shatter the wheel;
- a Repair action reassembles it;
- the surrounding product is intentionally framed as a quiet check-in rather than a feed or streak scoreboard.

KODEX translation implemented as a bounded lab proof:

`/kodex/lab/semantic-wheel/`

Translation:

- ring 1 = DOMAIN (`SIGNAL / MATTER / MEMORY / OBSERVER`);
- ring 2 = PROCESS (`POTENTIAL / FORM / INTERACTION / MUTATION / DISSOLUTION / RETURN`);
- ring 3 = existing canonical KODEX scenes;
- drag/flick = semantic traversal through alignments;
- high input energy = `ANOMALY` presentation state;
- repair = `RETURN / REASSEMBLE`;
- quiet product pacing = low-density contemplation state between dense system screens.

Reference record:

`data/kodex/references/REF-UX-003-feelings-wheel.json`

Proof contract:

`docs/proofs/KODEX-SEMANTIC-RELATION-WHEEL-P0.1.md`

Do not copy the source emotion vocabulary, Atherio identity, product copy, exact wheel design, assets, code or psychological framing.

## Existing KODEX technical/reference pool now connected to this pipeline

The registry also records the prior KODEX resource matrix so future agents can distinguish **study/reference** from **directly reusable** resources:

- KodeLife;
- The Book of Shaders;
- glslCanvas;
- Hydra;
- textmode.js;
- Three.js AsciiEffect;
- Moebius;
- FIGlet;
- Keijiro ShaderSketches;
- WebGL Fluid Simulation;
- TWGL.js;
- regl;
- p5.js;
- Tone.js;
- CRT-Lottes;
- windows-terminal-shaders;
- Shadertoy;
- CodePen;
- ambientCG;
- Poly Haven;
- Openverse.

Primary/official technical references are separated from visual inspiration:

- Khronos GLSL registry;
- MDN WebGL;
- Three.js ShaderMaterial docs;
- MDN Web Audio visualizations;
- MDN WebGPU.

Research links with direct KODEX visual/system relevance are also registered separately:

- Turing morphogenesis;
- Lenia;
- Growing Neural Cellular Automata;
- OAIS preservation guidance.

## Translation rule

Do **not** implement a reference because it looks interesting. A reference enters runtime only when it can be translated into an existing KODEX contract.

Examples:

| Reference mechanism | KODEX translation | Existing authority |
|---|---|---|
| kinetic type modes | title operator ID | Manifestation Recipe / scene registry |
| command palette | input/presentation layer | existing routes + `KodexChrome` |
| nested radial wheel | DOMAIN / PROCESS / SCENE relation instrument | existing scene registry; lab vocabulary only |
| fracture / repair | ANOMALY / RETURN presentation state | existing KODEX state language; no data destruction |
| CRT/terminal shaders | bounded surface treatment | existing renderer / post chain |
| shader parameters | modulation inputs | existing Manifestation/Signal contracts |
| reaction-diffusion | visual MODEL for living field | scene grammar, not biological claim |
| OAIS fixity/provenance | archive metadata + integrity UI | Truth/Provenance layer |

If a reference would require a second router, second memory store, second canon registry or hidden parallel renderer, stop and reconcile it with existing architecture first.

## Visual convergence priority

References should now be applied in this order:

1. **THRESHOLD definitive vertical slice** — remove redundant visual layers, establish negative space, macro-title behavior and one dominant manifestation.
2. **Shared Command Shell** — command palette / index / display modes without changing canonical routes.
3. **Title Engine** — map the seven operator IDs into the existing Manifestation Recipe.
4. **Mobile Instrument Dock** — touch equivalent of shell actions.
5. **ARCHIVE quiet-reading state + relation instrument** — alternate dense system space with low-density artifact contemplation and bounded radial relationship discovery.
6. **COSMOLOGY relational field** — evaluate whether the relation wheel becomes an entry instrument for the graph/spatial view after creator review.

## Rights gate

Use three reuse states:

- `REFERENCE_ONLY` — study composition/mechanism; no direct asset/code reuse.
- `REUSABLE_AFTER_LICENSE_CHECK` — candidate code/asset with a likely compatible license; verify exact version/file before distribution.
- `PRIMARY_REFERENCE` — official/academic/standards source used to constrain implementation or claims; citation/provenance still required.

A public repository or public website is not automatic reuse permission.

## Creator gate

No visual reference becomes KODEX canon because an agent implemented it.

Required state progression:

`REFERENCE → TRANSLATION → LAB PROOF → BROWSER QA → CREATOR KEEP/REFINE/REJECT → SHARED SYSTEM → PRODUCTION → DEPLOY`

Current Command Shell + Title Engine and Semantic Relation Wheel remain before creator acceptance and production integration.

## Future link handling

Every new KODEX link supplied by Ocín should be added to the registry and classified into one or more of:

- `VISUAL_SYSTEM`
- `TYPOGRAPHY`
- `MOTION`
- `INTERACTION`
- `INFORMATION_ARCHITECTURE`
- `SHADER / RENDERING`
- `GENERATIVE_SYSTEM`
- `ARCHIVE / MEMORY`
- `SCIENCE / MATHEMATICS`
- `CULTURE / PROVENANCE`
- `PRODUCT / BUSINESS`
- `ACCESSIBILITY / PERFORMANCE`

Then attach a concrete KODEX target. Links that are only "cool inspiration" remain reference-atlas material and do not drive production by themselves.
