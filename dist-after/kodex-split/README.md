# KDX_SPLIT_CORRIDOR — Concept 05/08

Quinto concepto nuevo de la tanda espacial KODEX.

Un corredor único se bifurca en dos rutas incompatibles. El visitante puede
sesgar la señal hacia izquierda o derecha, activar un pulso por una rama y,
finalmente, abrir ambos recorridos simultáneamente.

## Qué hace

- Raymarching WebGL2 en tiempo real.
- Corredor único en DORMANT.
- Bifurcación gradual en AWARE.
- Dos ramas con direcciones incompatibles.
- Pointer controla el sesgo de ruta.
- Touch/click selecciona y transmite por una rama.
- CTA abre ambas rutas.
- Vigas, conductos, costillares y señal central.
- Cámara absorbida durante OPEN.
- Audio:
  - low: amplitud y separación;
  - mid: curvatura de cada rama;
  - high: señal, grano y brillo.
- Reduced motion.
- Quality adaptativa móvil/desktop.
- Fallback sin WebGL2.

## Estados

### DORMANT

Existe un corredor único. Las dos rutas todavía están superpuestas.

### AWARE

El espacio empieza a dividirse. El pointer decide qué rama recibe más energía.

### OPEN

Ambas rutas se separan por completo y permanecen activas al mismo tiempo.

## Probar standalone

```bash
cd kodex-split-corridor-v1
python3 -m http.server 8080
```

Abrir:

```text
http://127.0.0.1:8080/standalone/
```

Controles:

- mover cursor/touch: sesgar la bifurcación;
- click/tap a izquierda o derecha: emitir un pulso por esa rama;
- MIC: respuesta al audio;
- OPEN BOTH PATHS: abrir ambas rutas.

## Astro

Copiar shaders:

```text
public/assets/kodex/shaders/fullscreen.vert.glsl
public/assets/kodex/shaders/split-corridor.frag.glsl
```

Copiar componente y runtime:

```text
src/components/kodex/KodexSplitCorridor.astro
src/components/kodex/kodex-split-client.ts
src/components/kodex/kodex-split.css
```

Uso:

```astro
---
import KodexSplitCorridor
  from "../components/kodex/KodexSplitCorridor.astro";
---

<KodexSplitCorridor />
```

Evento emitido:

```ts
document.addEventListener("kodex:split-open", (event) => {
  const detail = (event as CustomEvent).detail;
  console.log(detail.concept, detail.branch);
});
```

## Uniforms adicionales

```glsl
uniform float u_branchBias;
uniform float u_branchPulseAge;
uniform vec2  u_pointerVelocity;
```

`u_branchBias` usa este rango:

```text
-1 = izquierda
 0 = ambas
+1 = derecha
```

## Archivos

```text
kodex-split-corridor-v1/
├── shaders/
│   ├── fullscreen.vert.glsl
│   └── split-corridor.frag.glsl
├── standalone/
│   ├── index.html
│   ├── kodex-split.js
│   └── kodex-split.css
├── astro/
│   ├── KodexSplitCorridor.astro
│   ├── kodex-split-client.ts
│   └── kodex-split.css
├── kodelife/
│   └── KDX_SPLIT_CORRIDOR_001.frag
├── preset.json
└── README.md
```

## Validación pendiente

El resultado visual final requiere GPU/WebGL2 real. Probar en:

- Chrome/Chromium desktop;
- Safari iPhone;
- Android gama media;
- Firefox;
- reduced motion.

Objetivos internos:

- 60 FPS desktop;
- 50–60 FPS móvil medio;
- touch sin retraso perceptible;
- cero scroll;
- cero errores de consola;
- apertura sin congelamiento.
