# KDX_THRESHOLD_PORTAL_001

Primer prototipo shader-native de KODEX.

## Propósito

Demostrar este pipeline:

`ORIGINAL KODEX ARTWORK -> GLSL PASSES -> WEBGL RUNTIME -> ASTRO SCENE -> STILL / VIDEO FALLBACK`

## Artwork fuente

- archivo: `/public/img/kodex/works/bw-06-alpha.png`
- rol: máscara / geometría reconocible del portal
- regla: el shader puede deformar, respirar y expandir la obra, pero no reemplazarla por una estética ajena

## Mecanismos del prototipo

### 1. Source pass
Convierte el artwork en portal vivo.

Responsabilidades:
- samplear textura original
- aplicar coordenadas polares controladas
- breathing lento
- expansión por graves
- sesgo por pointer/touch

### 2. Feedback pass
Memoria temporal corta.

Responsabilidades:
- mezclar frame actual con previous frame
- dejar rastro sutil
- evitar smear excesivo

### 3. Composite pass
Tratamiento Threshold.

Responsabilidades:
- color rojo KODEX
- glow sobrio
- scanline / film / dither muy controlado
- still digno en reduced motion

## Estados

- `DORMANT`: respiración mínima, portal latente
- `AWARE`: responde al visitante
- `OPEN`: expansión y transición de ingreso

## Uniforms que deben sobrevivir al QA Lab

- `seed`
- `elapsedTime`
- `motionMode`
- `qualityLevel`
- `bass`
- `pointer`
- `state`

## Regla editorial

No copiar el look de ejemplos de KodeLife.

Sí reutilizar, con revisión de atribución/licencia, únicamente mecanismos técnicos como:
- polar coordinates
- symmetry
- feedback
- image sampling
- audio reactivity
- post-process chaining

## Estado actual

Scaffold inicial creado.
Todavía no está integrado a `/kodex/` ni a `/kodex/lab/`.
