# KDX_IMPOSSIBLE_STRUCTURE — Concept 02/08

Segundo organismo espacial de la tanda KODEX.

No es una revisión del Spatial Engine anterior. Es un concepto nuevo:
una arquitectura no euclidiana que parece orientarse hacia dos direcciones
incompatibles al mismo tiempo.

## Qué hace

- Raymarching WebGL2 en tiempo real.
- Vigas interconectadas y repetidas en profundidad.
- Dos campos espaciales incompatibles mezclándose.
- Perspectiva controlada por pointer/touch.
- Suelo-membrana reactivo a graves.
- Estados DORMANT / AWARE / OPEN.
- Audio real opcional mediante micrófono.
- Tratamiento CRT, scanline y señal KODEX.
- Quality mode adaptativo para móvil.
- Reduced motion.
- Fallback visual si WebGL2 no está disponible.

## Estructura

```text
kodex-impossible-structure-v1/
├── shaders/
│   ├── fullscreen.vert.glsl
│   └── impossible-structure.frag.glsl
├── standalone/
│   ├── index.html
│   ├── kodex-impossible.js
│   └── kodex-impossible.css
├── astro/
│   ├── KodexImpossibleStructure.astro
│   ├── kodex-impossible-client.ts
│   └── kodex-impossible.css
├── kodelife/
│   └── KDX_IMPOSSIBLE_STRUCTURE_001.frag
└── preset.json
```

## Probar standalone

Desde la raíz del paquete:

```bash
python3 -m http.server 8080
```

Abrir:

```text
http://127.0.0.1:8080/standalone/
```

## Instalar en Astro

Copiar:

```text
shaders/fullscreen.vert.glsl
→ public/assets/kodex/shaders/fullscreen.vert.glsl

shaders/impossible-structure.frag.glsl
→ public/assets/kodex/shaders/impossible-structure.frag.glsl

astro/KodexImpossibleStructure.astro
astro/kodex-impossible-client.ts
astro/kodex-impossible.css
→ src/components/kodex/
```

Uso:

```astro
---
import KodexImpossibleStructure
  from "../components/kodex/KodexImpossibleStructure.astro";
---

<KodexImpossibleStructure />
```

Evento emitido al abrir:

```ts
document.addEventListener("kodex:impossible-open", (event) => {
  const detail = (event as CustomEvent).detail;
  console.log(detail.concept, detail.index);
});
```

## Contrato de uniforms

```glsl
uniform float u_time;
uniform float u_delta;
uniform vec2  u_resolution;
uniform vec2  u_pointer;

uniform float u_audioLow;
uniform float u_audioMid;
uniform float u_audioHigh;

uniform float u_state;
uniform float u_progress;
uniform float u_intensity;
uniform float u_seed;
uniform float u_reducedMotion;
uniform float u_quality;
```

## Estados

### DORMANT
La arquitectura recurre lentamente en profundidad.

### AWARE
Pointer/touch sesga los dos campos de perspectiva.

### OPEN
La estructura se divide en ramas incompatibles y la cámara entra.

## Ajustes visuales principales

Dentro del fragment shader:

- `5.25`: separación entre módulos repetidos.
- `0.22`: fuerza de perspectiva dual.
- `0.78`: separación de ramas en OPEN.
- `1.78`: longitud de vigas.
- `0.38 / 0.82`: calidad móvil/desktop desde runtime.
- `1850 ms`: duración de apertura desde JavaScript.

## KodeLife

`kodelife/KDX_IMPOSSIBLE_STRUCTURE_001.frag` contiene el núcleo del fragment
shader con uniforms equivalentes. Crea o asigna un fullscreen vertex pass y
mapea inputs:

- `u_time`
- `u_resolution`
- `u_pointer`
- `u_audioLow / Mid / High`
- `u_state`
- `u_progress`
- `u_reducedMotion`
- `u_quality`

## Validación pendiente

El JavaScript y TypeScript pueden validarse estáticamente, pero el resultado
visual final debe probarse en GPU real, Safari/iPhone y Android.

Criterios internos:

- 50–60 FPS móvil medio.
- 60 FPS desktop.
- cero scroll.
- cero errores de consola.
- transición OPEN sin congelamiento.
- reduced motion funcional.
