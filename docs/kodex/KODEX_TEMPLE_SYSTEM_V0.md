# KODEX−∞ Temple System v0

Status: `IMPLEMENTATION PROTOTYPE / UNTESTED`

Branch: `feature/kodex-temple-system-v0`

Public deployment: `BLOCKED`

## Purpose

The Temple System adds the missing spatial layer between the A–Y experience architecture, a node-level Digital Altar and the Universal Organism Engine.

```text
A–Y SITE ARCHITECTURE
→ NODE / PAGE
→ TEMPLE SYSTEM
→ DIGITAL ALTAR
→ ORGANISM ENGINE
→ MEMORY / CONSEQUENCE
→ RETURN TO GRAPH
```

The temple is not a replacement for A–Y navigation and is not a new organism renderer. It is a stateful spatial composition that can host an altar and one active organism while expressing the visitor's current route-memory state through architecture, light and symbolic topology.

## First implementation: Signal Temple / B

Internal route:

```text
/kodex/lab/signal-temple/
```

The route is `noindex, nofollow` and does not replace any production-facing KODEX route.

The current prototype hosts the existing `signal-vortex` WebGL2 organism inside a reusable temple component.

## Files

```text
src/kodex/temple/
├── types.ts
└── signalTemple.ts

src/components/kodex/temple/
├── KodexTemple.astro
├── kodex-temple-client.ts
└── kodex-temple.css

src/pages/kodex/lab/
└── signal-temple.astro
```

## Visual direction

The visual references supplied by Ocín are treated as compositional and spatial research, not as source material to reproduce literally.

Abstracted principles:

- recursive symmetry;
- radial and nested geometry;
- extreme ornamental density;
- architectural repetition toward a vanishing point;
- vivid spectral color;
- monumental sacred-space scale;
- transformation of ornament into information/state;
- perceptual depth that can feel larger than the physical viewport.

Explicitly excluded without provenance review:

- copied sacred figures;
- copied inscriptions;
- copied culture-specific ritual symbols;
- claims that a visual structure has one universal spiritual meaning;
- claims that psychedelic perception proves an external metaphysical architecture.

All temple geometry in v0 is an original KODEX translation built from CSS/DOM primitives and the existing KODEX organism runtime.

## Spatial composition

The v0 chamber contains six functional layers:

1. **Atmosphere** — low-frequency spectral haze and depth gradient.
2. **Recursive dome** — concentric procedural layers suggesting a continuously subdividing vault.
3. **Architecture field** — repeated arch/column layers converging toward the altar.
4. **Memory lights** — route-derived symbolic points designed to become visible on revisits.
5. **Candle field** — light points that visually bridge ritual light, stars and data nodes.
6. **Digital Altar** — pedestal, axis and the active `signal-vortex` organism.

Only the organism requires WebGL. The surrounding temple uses HTML/CSS so it does not create a second WebGL context.

## Temple states

```text
DORMANT
→ AWARE
→ ACTIVE
→ MUTATED
→ RESONANT
```

### DORMANT

- lowest structural light;
- sparse spectral information;
- memory mostly latent;
- smaller organism presentation.

### AWARE

Triggered by presence/pointer in this laboratory prototype.

- architecture increases visibility;
- candles become clearer;
- spatial depth increases.

### ACTIVE

Triggered by altar interaction or organism activation.

- stronger signal-to-architecture relation;
- broader spectral field;
- full altar scale.

### MUTATED

Designed for revisited node instances such as `B′`.

- memory constellation becomes dominant;
- architecture receives a small asymmetrical phase shift;
- spectral density increases;
- the chamber is materially different from its first visit.

### RESONANT

High-coherence preview state.

- second spectral layer becomes strongly visible;
- architecture and memory lights reach maximum energy;
- intended later for states involving accumulated route-memory or contextual M consequences.

These state names and values remain an implementation proposal until approved as canon.

## Actions

The laboratory exposes:

- `OBSERVE` → AWARE;
- `ISOLATE` → ACTIVE;
- `TRACE` → MUTATED;
- `RESONATE` → RESONANT (QA preview only);
- `RELEASE` → DORMANT.

Each action emits a DOM CustomEvent. In the full M1 integration, these events must be translated into explicit `VerticalSliceRuntime` actions. The Temple System must not write canonical route memory directly.

## Memory bridge

The client accepts:

```text
kodex:temple-memory
```

with a payload such as:

```ts
{
  coordinateInstance: "B′",
  mVisited: false,
  resonant: false
}
```

Current translation:

- coordinate ending in `′` → MUTATED;
- `mVisited: true` → RESONANT;
- explicit `state` → corresponding visual state.

This is a presentation bridge only. The source of truth remains the graph/session runtime.

## Debug API

Internal only:

```js
window.__kdxTemple.list();
window.__kdxTemple.setState("MUTATED");
window.__kdxTemple.emitMemory({ coordinateInstance: "B′" });
window.__kdxTemple.emitMemory({ mVisited: true });
```

The organism runtime remains separately inspectable through:

```js
window.__kdxOrganisms.list();
```

## Performance strategy

v0 intentionally avoids a fully modeled 3D cathedral.

- one WebGL2 organism maximum;
- temple architecture uses composited DOM/CSS layers;
- deterministic candle/memory fields avoid asset downloads;
- mobile hides a subset of repeated geometry and light points;
- `prefers-reduced-motion` disables ambient temple animation;
- WebGL failure continues to expose the existing Signal Vortex SVG fallback.

Future upgrades can move selected architecture layers to instanced WebGL geometry only after profiling demonstrates a clear benefit.

## Required QA before calling this tested

1. `npm ci` succeeds.
2. `npm run build` succeeds.
3. `dist/kodex/lab/signal-temple/index.html` is generated.
4. Signal Vortex mounts inside the altar without a second WebGL context.
5. Pointer parallax remains subtle and does not interfere with organism input.
6. Action buttons change temple state and remain keyboard accessible.
7. `prefers-reduced-motion` disables ambient temple animation.
8. WebGL2 unavailable → static vortex fallback remains visible.
9. Android portrait does not overflow horizontally.
10. Desktop maintains readable HUD/actions at 1280×720 and larger.
11. Navigation away destroys the organism runtime cleanly.
12. A simulated `B′` memory event produces a materially distinct temple state.

## Next implementation step

After QA, bind the Signal Temple to the M1 graph runtime:

```text
B first visit → DORMANT/AWARE/ACTIVE
B / ISOLATE_ECHO → ACTIVE
C / OPEN_SOURCE → delayed memory flag
B′ → MUTATED
contextual M consequence → RESONANT
Y → temple releases and graph resumes
```

Then reuse the same Temple System for:

- Archive Tree / GROWTH;
- Cosmology Core / ORBITAL;
- Specimen chamber / SPECIMEN;
- Machine chamber;
- Return chamber.

## Production boundary

```text
STATUS: PROTOTYPE
BUILD STATUS: NOT YET VERIFIED
VISUAL QA: NOT YET VERIFIED
DEVICE QA: NOT YET VERIFIED
PUBLIC ROUTE REPLACEMENT: NO
DEPLOYMENT: BLOCKED
```
