# WORLDFORGE v0 — QA protocol

1. `GET /kodex/lab/worldforge/` returns 200 when hosted under Astro's `public/` directory.
2. WebGL shader compile/link succeeds, no uncaught exceptions, terrain visible.
3. Presets result in distinct scenery: COAST / FOREST / COSMOS / IMPOSSIBLE.
4. `Playa cósmica` produces a coast with a starfield, `Bosque de noche` dims sky.
5. WASD, pointer drag, Q/E, touch buttons move camera on supported browsers.
6. Enter freeform text and Materializar; telemetry reflects scene type and seed.
7. Mutate changes seed and saves another world in memory.
8. Reload: local history persists; click past snapshot to restore.
9. Share: query parameters reproduce world type and seed in a fresh session.
10. Export: valid JSON containing schema, current world, history and export date.
11. `prefers-reduced-motion`: time stays frozen; navigation remains possible.
12. WebGL failure: render in 2D fallback without a blank/white screen.
13. Device QA at 390×844, 412×915, 1440×900; inspect overlap.
14. Frame budget and temperature: measure for 2min on a lower-end Android.
15. Verify no changes to store product data, checkout, SEO or 7 canonical scenes.

**Implementation status ≠ production validation.** Local smoke tests do not replace mobile browser QA or real Cloudflare deployment verification.