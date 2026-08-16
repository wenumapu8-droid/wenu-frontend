# KIT DE LÁMINA

Las primitivas de instrumento que se repiten en las 17 referencias.

**Míralo antes de dibujar algo nuevo:** `/kodex/lamina/kit/` es la hoja de
contacto. La lámina 1 terminó con trece juegos distintos de medidores porque
trece agentes dibujaron cada uno el suyo; eso es lo que este directorio existe
para que no vuelva a pasar.

## Piezas

| componente | para qué | dónde aparece en las referencias |
|---|---|---|
| `Waveform` | señal: peine, línea o barras | SIGNAL FEED, HEARTBEAT, waveform monitor, spectrum |
| `RadialScanner` | disco de anillos y radios | diagramas de estado, miras, mapas polares, túneles, rosas |
| `BarMeter` | barra de progreso segmentada | DESCENT PROGRESS, SIGNAL STRENGTH |
| `RingGauge` | dona / anillo de porcentaje | SIGNAL COMPOSITION, medidores circulares |
| `StepGraph` | serie con área y retícula | DEPTH GRAPH, gráficos de tendencia |
| `Micrografia` | textura de texto ilegible | el relleno de casi todos los paneles |

Los marcos, títulos numerados, tablas clave/valor, chips, códigos de barras y
marcas de esquina ya viven como clases en `src/styles/kodex-lamina.css`.

## Dos reglas que no son opcionales

**Determinismo.** Todo el kit dibuja con `rng(semilla)` y nunca con
`Math.random()`. El banco de fotocopia compara píxel a píxel: con azar real dos
capturas de la misma página dan puntajes distintos y el equipo persigue ruido en
vez de converger.

**Telemetría simbólica.** `BarMeter`, `RingGauge` y `StepGraph` marcan su
contenedor con `data-symbolic="true"` por defecto. Los números de las
referencias son ficción del póster y el canon prohíbe presentarlos como estado
real del sistema. Cuando el valor venga de una medición de verdad del motor,
pasar `simbolico={false}`.

## Lo que se aprendió midiendo, y está de fábrica

- Los anillos de un disco **no se reparten parejo**: van en progresión
  geométrica de razón ~0.93. Repartidos de a uno se ve como diana; con 0.82
  colapsan al centro y se ve como blanco de tiro.
- **No hay dos anillos con el mismo brillo.** El peso irregular es lo que
  distingue un trazado de instrumento de una figura de CAD.
- Las agujas de un peine **no son simétricas** respecto del eje. Simétricas se
  leen como ecualizador.
- Una barra de progreso **no es sólida**: es una tira de marcas de anchos
  irregulares. Sólida se lee como `<progress>` de navegador.
- La micrografía **no es texto** y no debe serlo. A 2-3 px nada es legible, y
  poner texto real sería inventar contenido. Son marcas que imitan la mancha.

## Lo que NO va acá

Nada que dependa de una librería de gráficos, y esto **sí se midió** (2026-08-09,
DEPTH GRAPH de 179×115, mismo diff que el banco):

| | diferencia contra la referencia |
|---|---|
| a mano | **6,83 %** |
| ECharts 6.1 (SSR a SVG) | **9,07 %** |

El motivo no es que ECharts sea malo — es estructural y vale entenderlo. La
referencia rotula su eje Y `10K · 8K · 4K · 2K · 800K`, que **no es una escala
real**: es decorativa. ECharts elige ticks matemáticamente correctos
(`10.000 · 1.000 · 300`) y no hay forma de convencerlo sin pelearle al motor de
ejes. O sea: **corrige el eje hacia lo correcto, y la referencia no es correcta.**

Para un tablero que diseñamos nosotros esa corrección es una virtud. Para
reproducir una lámina, es el problema. La diferencia es modesta (~2 puntos) y
parte de ella es el título, que no es trabajo de ECharts.

Lo que sí conviene traer cuando haga falta: `d3-shape` y `d3-scale`, unos pocos
KB de matemática pura sin opinión sobre el DOM.

Lo que sí conviene traer cuando haga falta: `d3-shape` y `d3-scale`, unos pocos
KB de matemática pura sin opinión sobre el DOM.

## Arte fija: no se dibuja, se traza

Glifos, sellos, emblemas y códigos de barras **no van en el kit**. Son dibujos
fijos y se sacan del original con:

```bash
node scripts/lamina/glyphs.mjs <slug> --band y0,y1 --x x0,x1 --umbral 55
```

Siete glifos en 90 segundos con 6,01 % de diferencia, sin agentes. Un agente
gastó ~100 k tokens en los mismos seis y los dejó, por su propia descripción,
«reconstrucciones a ojo».

## Iterar

```bash
node scripts/lamina/score-panel.mjs <slug> <Panel> --triptico   # 2,7 s
node scripts/lamina/iterate.mjs <slug> --crops                  # vuelta completa
```
