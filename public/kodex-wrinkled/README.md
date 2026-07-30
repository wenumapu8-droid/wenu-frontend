# KDX_WRINKLED_REALITY — Concept 06/08

Sexto concepto nuevo de la tanda espacial KODEX.

El recinto completo deja de comportarse como arquitectura rígida. Paredes,
suelo, techo, costillas estructurales y horizonte se deforman como una única
membrana topológica. Cada touch crea una nueva arruga; el estado OPEN colapsa
la primera geometría y revela una segunda estructura interna.

## Qué hace

- Raymarching WebGL2 en tiempo real.
- Domain warping 3D.
- FBM procedural para arrugas orgánicas.
- Recinto completo deformable.
- Costillas y membranas flotantes.
- Pointer como atractor topológico.
- Velocidad del pointer como torsión.
- Touch/click genera una arruga localizada.
- OPEN colapsa la geometría exterior.
- Segunda topología tubular en el interior.
- Audio:
  - low = amplitud y presión;
  - mid = densidad y velocidad del pliegue;
  - high = grano, señal y microcontraste.
- Reduced motion.
- Calidad adaptativa móvil/desktop.
- Fallback sin WebGL2.

## Estados

### DORMANT

La arquitectura se mantiene casi estable, con una respiración mínima.

### AWARE

La presencia del visitante deforma la habitación y crea torsión localizada.

### OPEN

El recinto se pliega hacia el centro y aparece una segunda geometría interna.

## Probar standalone

```bash
cd kodex-wrinkled-reality-v1
python3 -m http.server 8080
```

Abrir:

```text
http://127.0.0.1:8080/standalone/
```

Controles:

- mover cursor/touch: atraer y torcer la superficie;
- tap/click: emitir una arruga;
- MIC: activar audio real;
- FOLD THE FIELD: colapsar la primera realidad.

## Astro

Copiar shaders:

```text
public/assets/kodex/shaders/fullscreen.vert.glsl
public/assets/kodex/shaders/wrinkled-reality.frag.glsl
```

Copiar componente y runtime:

```text
src/components/kodex/KodexWrinkledReality.astro
src/components/kodex/kodex-wrinkle-client.ts
src/components/kodex/kodex-wrinkle.css
```

Uso:

```astro
---
import KodexWrinkledReality
  from "../components/kodex/KodexWrinkledReality.astro";
---

<KodexWrinkledReality />
```

Evento emitido:

```ts
document.addEventListener("kodex:wrinkle-open", (event) => {
  const detail = (event as CustomEvent).detail;
  console.log(detail.concept, detail.topology);
});
```

## Uniforms adicionales

```glsl
uniform vec2  u_pointerVelocity;
uniform vec2  u_creaseOrigin;
uniform float u_creaseAge;
```

## Archivos

```text
kodex-wrinkled-reality-v1/
├── shaders/
│   ├── fullscreen.vert.glsl
│   └── wrinkled-reality.frag.glsl
├── standalone/
│   ├── index.html
│   ├── kodex-wrinkle.js
│   └── kodex-wrinkle.css
├── astro/
│   ├── KodexWrinkledReality.astro
│   ├── kodex-wrinkle-client.ts
│   └── kodex-wrinkle.css
├── kodelife/
│   └── KDX_WRINKLED_REALITY_001.frag
├── preset.json
├── validation.json
└── README.md
```

## Validación pendiente

El shader necesita validación visual en GPU/WebGL2 real. Probar en:

- Chrome/Chromium desktop;
- Safari iPhone;
- Android gama media;
- Firefox;
- reduced motion.

Objetivos internos:

- 60 FPS desktop;
- 45–60 FPS móvil;
- touch sin retraso perceptible;
- cero scroll;
- cero errores de consola;
- OPEN sin congelamiento.
