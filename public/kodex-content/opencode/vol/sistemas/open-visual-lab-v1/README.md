# KODEX Open Visual Lab V1

A dependency-free WebGL2 starter kit for the visual behavior shown in the
references:

- liquid/acid procedural fields;
- CRT curvature and scanlines;
- RGB split;
- ordered dithering;
- GPU ASCII/textmode;
- temporal feedback;
- audio-reactive uniforms;
- KodeLife GLSL presets;
- ASCII banner and image conversion tools.

No commercial visual pack, reference screenshot, third-party shader or font
file is included.

## Start

From this folder:

```bash
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

Windows can run:

```bat
py -m http.server 8080
```

## Main files

```text
src/runtime/KodexPipeline.js
src/runtime/AudioSignal.js
src/shaders/fullscreen.vert
src/shaders/liquid-acid.frag
src/shaders/archive-orbit.frag
src/shaders/threshold-portal.frag
src/shaders/mandelbrot-field.frag
src/shaders/signal-bloom.frag
src/shaders/post-kodex.frag
```

## ASCII

Three distinct implementations are provided:

1. GPU ASCII post-process inside `post-kodex.frag`.
2. Original 5×7 banner generator in `src/ascii/banner.mjs`.
3. Browser image-to-ASCII converter in `tools/image-to-ascii.html`.

CLI example:

```bash
node src/ascii/banner.mjs "KODEX-∞"
```

## Performance modes

- Low power: DPR 0.75
- Mobile: DPR 1
- Standard: DPR 1.5
- High: DPR 2

For the production KODEX route, start at DPR 1 on mobile and pause the canvas
outside the active scene.

## License

Original code in this package is MIT licensed.

External resources are links only. See:

```text
resources/FREE_OPEN_RESOURCES.md
resources/free-open-resources.json
docs/THIRD_PARTY_NOTICES.md
```
