# Shaders

El runtime compilado está en `dist/kodex-crt.esm.js`. La versión editable usa un fullscreen vertex shader y un fragment shader CRT con scanlines, máscaras de fósforo, persistence, aberración, bloom, curvatura y anomalías por evento.

Para modificar el fragment shader, edita el template `crt-composite-reference.frag.glsl` y replica el cambio en el string `FRAG` del runtime.
