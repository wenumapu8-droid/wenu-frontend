# KDX_RIPPLE_FLOOR — Concept 04/08

Cuarto concepto nuevo de la tanda espacial KODEX.

La retícula deja de ser una superficie rígida. Se comporta como una membrana
viva: recibe impactos, responde al audio, conserva ondas y finalmente se rompe
para formar una apertura navegable.

## Qué hace

- Retícula infinita en perspectiva.
- Height field procedural.
- Intersección iterativa ray/surface.
- Normales calculadas desde el campo de altura.
- Pointer mueve el campo visible.
- Touch/click genera un impacto localizado.
- Graves elevan y hunden la membrana.
- Medios cambian velocidad/frecuencia.
- Agudos intensifican grano y señal.
- Estados DORMANT / AWARE / OPEN.
- Apertura central en OPEN.
- CRT, scanlines, niebla y target HUD.
- Reduced motion.
- Calidad adaptativa para móvil.
- Fallback si WebGL2 no está disponible.

## Probar standalone

```bash
cd kodex-ripple-floor-v1
python3 -m http.server 8080
```

Abrir:

```text
http://127.0.0.1:8080/standalone/
```

Toca o haz click directamente sobre la retícula para emitir ondas.

## Integración Astro

Copiar shaders:

```text
public/assets/kodex/shaders/fullscreen.vert.glsl
public/assets/kodex/shaders/ripple-floor.frag.glsl
```

Copiar componente:

```text
src/components/kodex/KodexRippleFloor.astro
src/components/kodex/kodex-ripple-client.ts
src/components/kodex/kodex-ripple.css
```

Uso:

```astro
---
import KodexRippleFloor
  from "../components/kodex/KodexRippleFloor.astro";
---

<KodexRippleFloor />
```

Evento emitido al abrir:

```ts
document.addEventListener("kodex:ripple-open", (event) => {
  console.log((event as CustomEvent).detail);
});
```

## Uniforms adicionales

```glsl
uniform vec2  u_pointerVelocity;
uniform float u_impactAge;
uniform vec2  u_impactOrigin;
```

Esto permite distinguir entre:

- presencia;
- desplazamiento;
- impacto;
- apertura narrativa.

## Archivos

```text
kodex-ripple-floor-v1/
├── shaders/
│   ├── fullscreen.vert.glsl
│   └── ripple-floor.frag.glsl
├── standalone/
│   ├── index.html
│   ├── kodex-ripple.js
│   └── kodex-ripple.css
├── astro/
│   ├── KodexRippleFloor.astro
│   ├── kodex-ripple-client.ts
│   └── kodex-ripple.css
├── kodelife/
│   └── KDX_RIPPLE_FLOOR_001.frag
└── preset.json
```

## Validación pendiente

El render debe probarse en GPU real, particularmente:

- Android de gama media;
- Safari iPhone;
- Chrome desktop;
- Firefox;
- reduced motion.

Objetivos:

- 60 FPS desktop;
- 50–60 FPS móvil;
- touch sin retraso perceptible;
- apertura sin congelamiento;
- cero scroll;
- cero errores de consola.
