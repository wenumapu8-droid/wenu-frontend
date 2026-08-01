# KODEX Design System Pack V1

Incluye dos entregables coordinados.

## A — Design Tokens Pack

Ubicación:

```text
tokens/
├── kdx.tokens.json
├── kdx.tokens.css
├── kdx.tokens.ts
├── kdx.themes.json
├── kdx.typography.css
└── kdx.motion.css
```

Contiene:

- paleta neutral y signal;
- proporciones de cobertura de color;
- ocho temas de escena;
- roles tipográficos;
- escalas desktop/mobile;
- spacing;
- grid;
- bordes;
- texturas;
- motion;
- reduced motion;
- z-index;
- presupuestos de rendimiento.

## B — Scene Blueprint Pack

Ubicación:

```text
blueprints/
├── kdx.scene-blueprints.json
├── specs/
├── astro/
│   ├── KdxSceneShell.astro
│   └── kdx-scene-shell.css
└── runtime/
    └── kdx-blueprint-runtime.ts
```

Las ocho escenas:

```text
00 Threshold Portal
01 Observation Eye
02 Descent Tunnel
03 Archive Dossier
04 Ritual Machine
05 Cosmology Core
06 Ghost Hardware
07 Return Signal
```

Cada blueprint incluye:

- propósito;
- grid;
- densidad;
- espacio negativo;
- visual anchor;
- reparto DOM/SVG/WebGL;
- zonas desktop/mobile;
- motion stack;
- interacción;
- evento;
- fallback;
- QA.

## Laboratorio

Abrir:

```text
demo/index.html
```

El laboratorio permite:

- cambiar entre ocho blueprints;
- activar/desactivar grilla;
- activar/desactivar motion;
- alternar desktop/mobile;
- revisar jerarquía tipográfica;
- revisar cobertura de color;
- revisar QA.

## Integración Astro

Importar el JSON:

```ts
import blueprints
  from "../../blueprints/kdx.scene-blueprints.json";
```

Renderizar:

```astro
---
import KdxSceneShell
  from "./KdxSceneShell.astro";

const blueprint =
  blueprints.find(
    (scene) =>
      scene.id === "KDX_SCENE_03_ARCHIVE"
  );
---

<KdxSceneShell
  blueprint={blueprint}
/>
```

## Regla de implementación

```text
DOM  = significado y accesibilidad
SVG  = sistema gráfico y anotación
WEBGL = organismo, profundidad y feedback
```

No rasterizar la escena completa como un poster.

## Regla de contraste

```text
70–85%  fondo oscuro
10–20%  estructura neutral
5–12%   color principal
0–4%    acento secundario
```

## Regla temporal

```text
70% lento
20% medio
10% rápido
```

Máximo dos motion de prioridad alta simultáneamente.
