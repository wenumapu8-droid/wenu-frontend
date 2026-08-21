# KDX_PERSPECTIVE_FLIP — Concept 07/08

Séptimo concepto nuevo de la tanda espacial KODEX.

La arquitectura cambia entre dos sistemas de proyección incompatibles sin
rotar físicamente como un objeto convencional. En el punto medio, ambas
lecturas se mezclan y producen una zona espacial imposible.

## Qué hace

- Raymarching WebGL2.
- Dos transformaciones de dominio:
  - Projection A: sesgo horizontal y fuga lateral.
  - Projection B: elevación vertical y torsión.
- Interpolación suave entre ambos sistemas.
- Deformación adicional en el punto medio.
- Cámara y objetivo interpolados.
- Portal frames repetidos.
- Monolito central.
- Torus que cambia de orientación.
- Grid que rota con la proyección.
- Pointer horizontal controla el flip.
- Tap/click fuerza la inversión completa.
- CTA fija Projection B y abre la escena.
- Audio:
  - low = compresión y profundidad;
  - mid = torsión;
  - high = interferencia y grano.
- Reduced motion.
- Calidad adaptativa.
- Fallback sin WebGL2.

## Estados

### DORMANT

Projection A permanece estable.

### AWARE

El pointer interpola entre Projection A y Projection B.

### OPEN

La escena completa el cambio y se convierte en un portal navegable.

## Probar standalone

```bash
cd kodex-perspective-flip-v1
python3 -m http.server 8080
```

Abrir:

```text
http://127.0.0.1:8080/standalone/
```

Controles:

- mover horizontalmente: interpolar proyección;
- tap/click: invertir de A a B o de B a A;
- MIC: audio real;
- FLIP THE FRAME: fijar B y abrir.

## Astro

Copiar shaders:

```text
public/assets/kodex/shaders/fullscreen.vert.glsl
public/assets/kodex/shaders/perspective-flip.frag.glsl
```

Copiar componente y runtime:

```text
src/components/kodex/KodexPerspectiveFlip.astro
src/components/kodex/kodex-flip-client.ts
src/components/kodex/kodex-flip.css
```

Uso:

```astro
---
import KodexPerspectiveFlip
  from "../components/kodex/KodexPerspectiveFlip.astro";
---

<KodexPerspectiveFlip />
```

Evento emitido:

```ts
document.addEventListener("kodex:perspective-open", (event) => {
  const detail = (event as CustomEvent).detail;
  console.log(detail.concept, detail.projection);
});
```

## Uniforms adicionales

```glsl
uniform float u_flipProgress;
uniform float u_flipPulseAge;
```

`u_flipProgress`:

```text
0.0 = Projection A
0.5 = Impossible midpoint
1.0 = Projection B
```

## Archivos

```text
kodex-perspective-flip-v1/
├── shaders/
│   ├── fullscreen.vert.glsl
│   └── perspective-flip.frag.glsl
├── standalone/
│   ├── index.html
│   ├── kodex-flip.js
│   └── kodex-flip.css
├── astro/
│   ├── KodexPerspectiveFlip.astro
│   ├── kodex-flip-client.ts
│   └── kodex-flip.css
├── kodelife/
│   └── KDX_PERSPECTIVE_FLIP_001.frag
├── preset.json
├── validation.json
└── README.md
```

## Validación pendiente

El shader necesita validación visual real en:

- Chrome/Chromium;
- Firefox;
- Safari iPhone;
- Android gama media;
- reduced motion.

Objetivos:

- 60 FPS desktop;
- 45–60 FPS móvil;
- cambio A→B sin freeze;
- touch inmediato;
- cero scroll;
- cero errores de consola.
