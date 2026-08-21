# KODEX Spatial Engine v1

A real-time, full-viewport WebGL2 prototype that translates the supplied impossible-perspective references into a coded KODEX scene.

## What is included

- `DUAL VANISH`: two vanishing points coexist.
- `RIPPLE FLOOR`: the projected grid behaves like a membrane.
- `SPLIT CORRIDOR`: one corridor becomes two without a scene cut.
- `WRINKLED REALITY`: the entire projection deforms procedurally.
- Pointer/touch response.
- Optional microphone input with procedural fallback.
- Responsive no-scroll interface.
- Astro integration scaffold.
- Reduced-motion support.

## Run the standalone demo

From this folder:

```bash
python3 -m http.server 8080
```

Open:

```text
http://127.0.0.1:8080/standalone/
```

Do not open the HTML via `file://`; the browser must fetch the GLSL file through HTTP.

## Astro integration

1. Copy `shaders/spatial.frag.glsl` to:

```text
public/assets/kodex/shaders/spatial.frag.glsl
```

2. Copy the Astro files into your project:

```text
src/components/kodex/KodexSpatialScene.astro
src/components/kodex/kodex-spatial-client.ts
```

3. Render the component inside the existing KODEX deck:

```astro
---
import KodexSpatialScene from '../../components/kodex/KodexSpatialScene.astro';
---

<KodexSpatialScene initialMode={2} />
```

4. Connect scene activation to the current navigation engine:

```ts
document.addEventListener('kodex:spatial-activate', (event) => {
  const detail = (event as CustomEvent<{mode:number}>).detail;
  console.log('Spatial mode activated', detail.mode);
  // deck.goTo('archive') or your existing scene transition.
});
```

## Why this works on the website

The scene is split into two layers:

- **WebGL shader:** perspective, grid, depth, ripple, split, wrinkle, glow and motion.
- **DOM/CSS:** logo, headline, metadata, mode controls, CTA, progress and accessibility.

The page does not render a static reference image. It reconstructs the spatial behavior every frame on the GPU.

## Production checkpoints

- Keep DPR capped on mobile.
- Avoid more than one heavy WebGL canvas active in the DOM at once.
- Pause the render loop when the KODEX scene is hidden.
- Use a PNG/WebM fallback for unsupported GPUs.
- Profile at 390×844 and a mid-range Android device before adding feedback passes.
- Add the Tanda 2 post-processing effects only after this base holds 45–60 FPS.
