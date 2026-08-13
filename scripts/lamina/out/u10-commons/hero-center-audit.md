# KODEX-∞ · u10-commons · hero-center audit

Fecha: 2026-08-13
Rama: wip/kimi-u10-commons-cabecera
Puntaje actual: GLOBAL 4.31% · hero-center 5.36%

## Método

- Región medida: `x 433..689, y 224..1301` (256×1077 px) de `reference/canon/u10-commons.png`.
- Detección de componentes conectados sobre umbral de luminancia > 26.
- Clustering por proximidad de centros (distancia <= 45 px) para recuperar elementos semánticos.
- Archivo de datos: `scripts/lamina/out/u10-commons/hero-center-components.json`.

## Elementos grandes detectados en la referencia (faltantes o incompletos en el render)

| # | bbox (región) | centro | área tinta | descripción aproximada |
|---|---------------|--------|-----------:|------------------------|
| 1 | (28,456) 138×183 | (97,547) | 1371 | Diagrama central-izquierdo (anillos + nodos + trazas) |
| 2 | (163,314) 62×106 | (194,367) | 1173 | Espiral/flor + nodo superior-derecho del campo |
| 3 | (96,467) 62×57 | (127,495) | 771 | Símbolo central (círculo + cruz) |
| 4 | (26,200) 43×47 | (47,223) | 300 | Texto manuscrito "I came broken / I leave whole" |
| 5 | (35,360) 60×40 | (65,380) | 277 | Elemento medio-izquierdo (flor/espiral pequeña) |
| 6 | (116,416) 25×39 | (128,435) | 238 | Nodo conector central |
| 7 | (224,650) 32×47 | (240,673) | 223 | Texto "Remembering / is how we / return light" |
| 8 | (112,274) 33×37 | (128,292) | 215 | Texto central superior / círculo |
| 9 | (165,462) 22×42 | (176,483) | 210 | Nodo conector derecho |
| 10 | (220,249) 24×63 | (232,280) | 210 | Texto manuscrito "let love lead" |

## Observaciones

- El render actual tiene el campo estelar, anillos centrales básicos, el corazón arriba y el ∞ abajo, pero **carece de la mayoría de los textos manuscritos y de la red de nodos/trazas que dan estructura al campo**.
- Los 3-4 elementos que más contribuyen al diff de `hero-center` son: (1) el diagrama central de red/nodos, (2) los textos manuscritos de los costados, (3) el bloque "Remembering...", y (4) el corazón + "YOU ARE NOT ALONE HERE" arriba.
- Añadir estos elementos en `src/components/kodex/lamina/u10/Heroe.astro` requiere tocar `src/` (zona prohibida por el objetivo activo de esta sesión).

## Siguiente paso sugerido

Implementar los elementos faltantes en el canvas del héroe usando coordenadas medidas (no estimadas), preferiblemente con primitivas procedurales ya existentes en `src/components/kodex/lamina/kit/`, y volver a correr `node scripts/lamina/compare.mjs u10-commons`.
