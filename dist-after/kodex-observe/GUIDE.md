# KODEX−∞ — OBSERVE Shader Prototype

This package develops one complete KODEX poster archetype as a coded, real-time scene:

**04 SURVEILLANCE SIGNAL / OBSERVE**

It is not a flattened poster. The visual is split into:

- WebGL shader artwork;
- stable HTML interface;
- CSS poster grammar;
- pointer/touch interaction;
- scene states;
- optional audio bands;
- reduced-motion and mobile quality rules.

## 1. What the prototype demonstrates

### Real-time visual layers

- orbital architecture rotating at independent speeds;
- procedural eye and pupil;
- pointer-responsive observation;
- simulated or externally supplied audio bands;
- scanner sweep;
- asynchronous signal nodes;
- CRT scanlines and procedural grain;
- DORMANT / AWARE / OPEN state transition.

### Stable system layers

- KODEX header;
- status chip;
- monumental headline;
- CTA;
- archive metadata;
- barcode strip;
- progress deck;
- hidden message band;
- side rail.

The shader moves. The UI does not.

## 2. Run the standalone demo

From the package root:

```bash
python3 -m http.server 8080
```

Open:

```text
http://127.0.0.1:8080/standalone/
```

Debug overlay:

```text
http://127.0.0.1:8080/standalone/?debug=1
```

Do not open `index.html` directly with `file://`; the shader files are fetched at runtime.

## 3. KodeLife setup

Use:

```text
kodelife/KDX_OBSERVE_001.frag
```

Create a fullscreen fragment pass and map these uniforms:

```text
time           FLOAT / elapsed seconds
resolution     VEC2 / render resolution
pointer        VEC2 / normalized 0–1 pointer
state          FLOAT / 0 dormant, 1 aware, 2 open
reducedMotion  FLOAT / 0 or 1
seed           FLOAT / any stable value
audioLow       FLOAT / 0–1
audioMid       FLOAT / 0–1
audioHigh      FLOAT / 0–1
```

The pass expects `v_texcoord`. Use the included fullscreen vertex shader or KodeLife's matching fullscreen template.

## 4. Astro integration

Copy:

```text
astro/KodexObserveScene.astro
astro/kodex-observe-client.ts
astro/kodex-observe.css
shaders/fullscreen.vert.glsl
shaders/observe.frag.glsl
```

Recommended project locations:

```text
src/components/kodex/scenes/KodexObserveScene.astro
src/components/kodex/scenes/kodex-observe-client.ts
src/components/kodex/scenes/kodex-observe.css
src/shaders/kodex/fullscreen.vert.glsl
src/shaders/kodex/observe.frag.glsl
```

Update the shader import paths in `kodex-observe-client.ts` if needed.

Use the component:

```astro
---
import KodexObserveScene from "../../components/kodex/scenes/KodexObserveScene.astro";
---

<KodexObserveScene sceneIndex={1} sceneTotal={7} />
```

Listen for the primary transition:

```ts
document.addEventListener("kodex:observe", () => {
  // Advance the KODEX deck to Descent.
});
```

## 5. Audio integration

The standalone demo exposes:

```js
window.kodexObserve.setAudioBands(low, mid, high);
```

Values are normalized from 0 to 1.

Suggested mapping:

```text
LOW  → breathing, iris radius, portal expansion
MID  → orbital intensity, waveform deformation
HIGH → signal nodes, micro-glitches, highlights
```

For the Astro controller, call:

```ts
controller.setAudioBands({ low, mid, high });
```

Connect this to a Web Audio `AnalyserNode`. Audio must remain opt-in.

## 6. State contract

```text
DORMANT = 0
The archive breathes but does not acknowledge the visitor.

AWARE = 1
Pointer or touch activates the observation response.

OPEN = 2
The CTA creates the transition pulse before the next scene.
```

Never put navigation state inside the shader. The WebGL canvas renders the visual state; the Astro deck owns routing and history.

## 7. How to build the other KODEX poster archetypes

Use the same runtime contract and change the shader recipe.

### ARCHIVE DOSSIER / red

```text
Source: neural head or cyber-organic specimen
Behavior: scan + reveal + containment pulse
Shader: edge detection, contour lines, data slices
UI: threat level, origin, status, barcode, auth seal
```

### SPECIMEN ANALYSIS / acid green

```text
Source: skull, organism, hybrid anatomy
Behavior: rotate model slices + x-ray reveal
Shader: threshold, dither, false-color density map
UI: specimen ID, class, entropy, anomaly, sample log
```

### COSMOS / cyan

```text
Source: planet, orbital object, celestial map
Behavior: orbit + parallax + signal connection
Shader: polar coordinates, star field, atmospheric rim
UI: coordinates, system, status, frequency, provenance
```

### RITUAL DEVICE / violet

```text
Source: tree, vessel, disk, relic
Behavior: charge + resonate + transmit
Shader: field lines, feedback memory, energy accumulation
UI: device ID, catalyst, mode, output, warning
```

### ISOLATION / magenta

```text
Source: head, brain, cocoon, neural field
Behavior: pulse + distortion + recursive echo
Shader: feedback, chromatic split, memory trails
UI: event code, date, venue, access, transmission state
```

## 8. KODEX motion grammar

Every scene should have:

```text
1 protagonist movement
2 structural movements
2–4 micro-signals
```

Examples:

```text
Protagonist: pupil follows visitor
Structural: two orbital systems rotate independently
Micro-signals: scanline, node pulse, message update
```

Do not animate text, CTA, barcode, metadata and navigation continuously.

## 9. Quality modes

### FULL

- DPR up to 2;
- all orbital layers;
- all nodes;
- procedural grain;
- pointer response.

### MOBILE LOW POWER

- DPR capped near 1.35;
- same shader, reduced pixel cost;
- no heavy blur;
- fewer DOM overlays.

### REDUCED MOTION

- time-based motion freezes;
- pointer state can remain functional;
- CTA and information remain available;
- use a still fallback if the device cannot sustain WebGL.

## 10. Testing checklist

### Visual

- eye remains recognizable after 30 seconds;
- no rectangular image container;
- no raster blur at 390×844 or 1920×1080;
- one dominant focal point;
- UI remains legible over the shader.

### Motion

- orbit does not look like a loader;
- pupil response starts in under 100 ms;
- OPEN state is readable but under 1.6 s;
- no visible loop seam;
- reduced motion is calm, not broken.

### Performance

- one `requestAnimationFrame` loop per active scene;
- pause on hidden tab;
- destroy WebGL program when unmounted;
- cap device pixel ratio;
- no GIFs;
- no full-screen PNG pretending to be interactive.

### Responsive

- `scrollHeight === innerHeight`;
- headline not clipped;
- CTA visible;
- footer respects safe area;
- mobile artwork occupies the upper field;
- mobile is a poster composition, not stacked desktop UI.

## 11. Next prototype after OBSERVE

Build:

```text
KDX_THRESHOLD_PORTAL_001
```

Keep the same WebGL runtime, replace the eye SDF with an original Arquitecturas Tecno-Tribales texture, then add:

- texture sampler;
- polar repetition;
- breath deformation;
- previous-frame feedback;
- Threshold red treatment;
- OPEN transition toward Prologue.

That proves the complete production pipeline:

```text
ORIGINAL ARTWORK
→ KODELIFE
→ GLSL
→ WEBGL
→ ASTRO
→ KODEX JOURNEY
```
