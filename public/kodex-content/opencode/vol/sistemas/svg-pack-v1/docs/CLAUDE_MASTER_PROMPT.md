# KODEX — Prompt maestro de implementación

Trabaja únicamente sobre la ruta KODEX y crea una rama de trabajo antes de
modificar archivos.

## Objetivo

Integrar un sistema fullscreen, no-scroll y config-driven usando:

```text
tokens/kdx.tokens.css
tokens/kdx.typography.css
tokens/kdx.motion.css
blueprints/kdx.scene-blueprints.json
blueprints/astro/KdxSceneShell.astro
blueprints/astro/kdx-scene-shell.css
```

## Arquitectura

```text
DOM
- copy
- navegación
- CTA
- labels
- metadata
- accesibilidad

SVG
- rails
- frames
- sellos
- barcodes originales
- telemetría
- diagramas

WebGL
- visual anchor
- partículas
- deformación
- audio
- feedback
- transiciones
```

## Reglas no negociables

1. Una escena ocupa exactamente `100svh`.
2. No existe scroll vertical entre escenas.
3. Solo una escena y un canvas permanecen activos.
4. El fondo oscuro ocupa entre 70% y 85%.
5. Máximo dos colores de señal activos.
6. El title no usa serif protagonista.
7. Datos y labels usan mono o UI sans.
8. Un CTA principal por escena.
9. Glitch solo por eventos breves.
10. Reduced motion y fallback estático son obligatorios.
11. No usar imágenes de referencia como fondos.
12. No copiar slogans, símbolos, ilustraciones ni tipografías de terceros.

## Orden de implementación

```text
00 Threshold
01 Observe
02 Descent
03 Archive
04 Machine
05 Cosmology
06 Ghost
07 Return
```

No pasar a la siguiente escena hasta que la anterior cumpla:

- desktop 1440×900;
- mobile 390×844;
- cero scroll;
- cero errores;
- jerarquía visible en captura congelada;
- reduced motion;
- contraste AA en textos funcionales.

## Estado global

Cada escena debe exponer:

```ts
type KdxSceneState =
  | "DORMANT"
  | "AWARE"
  | "OPEN";
```

Y emitir el evento definido en el blueprint.

## Handoff

Antes de cualquier deploy:

- ejecutar build;
- capturar desktop/mobile;
- registrar errores;
- entregar diff;
- esperar la frase exacta `APROBAR DEPLOY`.
