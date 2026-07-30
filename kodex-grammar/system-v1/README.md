# KODEX Visual Grammar System V1

Este paquete convierte diez referencias suministradas por el usuario en una gramática abstracta y reutilizable. Conserva composición, proporciones, densidad, jerarquía y comportamiento temporal; no conserva objetos, símbolos, lettering ni slogans.

## Entregables

- `schema/kdx_visual_grammar.schema.json`: estructura de base de datos.
- `data/kdx_reference_analysis.json`: análisis de las diez referencias.
- `data/kdx_visual_grammar_records.json`: registros normalizados.
- `data/kdx_reference_matrix.csv`: matriz plana.
- `data/kdx_zone_blocks.csv`: todos los cuadrantes y bloques `x/y/w/h`.
- `data/kdx_grid_system.json`: diez grillas operativas.
- `data/kdx_motion_presets.json`: doce perfiles de movimiento.
- `data/kdx_scene_recipes.json`: recetas KODEX sin activos literales.
- `lab/index.html`: laboratorio interactivo autónomo.
- `atlas/kdx_reference_decomposition_atlas.png`: atlas visual abstracto.
- `runtime/`: tipos y compilador TypeScript.

## Regla central

```text
REFERENCIA → ADN FORMAL → GRILLA → RECETA → ARTE ORIGINAL KODEX
```

## ¿Grilla o proporción áurea?

El núcleo es una grilla modular de 12 columnas (8 en el layout cronológico). La proporción áurea aparece como un token opcional `8:5`; no es una ley. El sistema también usa `1:1`, `3:2`, `5:3`, `2:1` y `3:1` según la función semántica.

## Motion

La jerarquía temporal recomendada es:

```text
SLOW FIELD + MEDIUM SIGNAL + FAST EVENT + REACTIVE INPUT
```

No usar más de dos movimientos de alta prioridad al mismo tiempo.

## Color coverage

Los porcentajes son aproximaciones calculadas desde el área gráfica de las capturas, excluyendo la interfaz de Pinterest cuando fue posible. Sirven como parámetros generativos, no como especificación colorimétrica forense.

## Integración KODEX

- DOM/SVG: headline, rails, microtexto, sellos, controles y jerarquía.
- WebGL: organismo, perspectiva, campos fluidos, audio, feedback y transiciones.
- JSON: decide qué se coloca, cuánto ocupa y cómo se comporta.
- Similarity ceiling: `0.35`; el sistema debe rechazar siluetas, símbolos o copy demasiado próximos a la referencia.
