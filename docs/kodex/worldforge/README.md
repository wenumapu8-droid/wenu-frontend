# KODEX−∞ / WORLDFORGE 00

**Status: prototype / experimental — not a deployed feature.**

Worldforge is an independent procedural world prototype, no API keys or inference costs. It is a **ray-marched WebGL1** visual scene with freeform Spanish/English keyword interpretation. It does **not** generate arbitrary photorealistic video worlds or use Google Genie.

## Try locally

From the included directory:

```sh
python3 -m http.server 8080 --directory public
# Visit http://localhost:8080/kodex/lab/worldforge/
```

Alternatively, open `public/kodex/lab/worldforge/index.html` in a modern browser (some clipboard features need localhost/HTTPS).

## Integrate into `wenu-frontend` Astro

Copy the contained `public/kodex/lab/worldforge/index.html` to the **same path** under the Astro repository. Astro will copy the page as a static asset and serve it at `/kodex/lab/worldforge/`. **Do not simultaneously create an Astro page at that route.** This implementation doesn't import Three.js and adds no dependencies.

Suggested workflow: feature branch → local build with `ALLOW_EMPTY_PRODUCTS=true` only for offline smoke-test → QA desktop and mobile → reviewed merge into active deployment branch → explicit Direct Upload according to the deployment runbook. Do not assume `git push` deploys.

## Controls

- Text: materialize a procedural world; preset buttons for Coast, Forest, Cosmos and Impossible.
- Keywords: `noche`, `violeta`, `dorado`, `gravedad alterada`; combine categories to create hybrid skies.
- Navigation: WASD, Q/E to fly vertically, Shift to accelerate, click-and-drag to look.
- Mobile: swipe the rendered sky to look, and use on-screen directional buttons.
- Mutation: regenerate with a new deterministic seed.
- Share: link encoding world description and seed (no login).
- Memory: browser `localStorage` + download of world history JSON, per device.
- Reduced motion: animated shader time is frozen when `prefers-reduced-motion` is enabled.
- Rendering: WebGL1 raymarch; 2D fallback when WebGL is unavailable.

## Constraints / known limitations

- This is a **visual procedural simulation**, not physically accurate gravity or persistent networked world state.
- The interpreter is a deterministic keyword parser, not an LLM; unsupported phrases retain the selected world type.
- No shared cloud database or cross-device history; sharing recreates world parameters via URL.
- Mobile performance depends on GPU; the renderer caps resolution, but shader cost should be measured on target phones.
- The first five visual families (coast, forest, cosmos, impossible, hybrid) are **artistic samples**, not canonical scenes.
- WebGL fallback is a 2D scenic illustration, not equivalent navigation; accessibility improvements and explicit pause controls are required before calling the feature production-ready.

## Build-safe, canon-safe

Keep Worldforge as a laboratory. Never replace the canonical seven scenes or A–Y narrative topology with this demo. Record implementation, QA evidence and status separately from speculative vision. Do not integrate third-party cultural symbols or unlicensed assets.