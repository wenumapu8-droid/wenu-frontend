---
tipo: método de producción de láminas
proyecto: KODEX −∞
fecha: 2026-08-09
estado: v2 — reformulado después de medir el costo real de la lámina 1
---

# Cómo fabricar una lámina sin que cueste un día

## El problema, con números

La lámina `t01-03-descent-tunnel` se llevó esto:

| vuelta | agentes | tokens | tiempo | resultado |
|---|---|---|---|---|
| 1 | 13 | 1.842.383 | 2 h 21 | 11,29 % |
| 2 | 7 | 955.872 | 47 min | 10,16 % |
| 3 | 6 | 578.343 | 14 min | 9,74 % |
| **total** | **26** | **~3,4 M** | **~3,5 h** | **meseta** |

A 17 láminas: ~57 M de tokens. **No es rentable y además no converge** — la vuelta 4
no movió la aguja.

## Los cuatro sumideros, medidos

**① Redibujar a ojo lo que se puede trazar.** El sumidero más grande. Los propios
agentes lo declararon: *"son reconstrucciones, conservan el peso visual y la
silueta"*, *"no es un calco"*, *"el dibujo de cada letra no es el de la
referencia"*. Un agente gastó del orden de 100 k tokens en seis glifos y los dejó
aproximados.

Contraste medido el mismo día: `vtracer` trazó los siete glifos en **90 segundos,
sin agentes, con 6,01 % de diferencia** — y el umbral óptimo se eligió barriendo
34/45/55/65/80 y midiendo cada uno, no a criterio.

**② Verificar con el build entero.** Los agentes corrían `astro build` — 19 s y
1.558 páginas — para mirar un recuadro de 547×110. Cientos de veces.

**③ Cajas mal medidas.** Las estimé a ojo y quemaron dos vueltas: los agentes
comprimieron tipografía para que su contenido entrara y eso puso un techo a toda
la lámina. La lámina no tiene tres columnas parejas; la banda inferior se parte
distinto (13/415, 429/1039, 1173/1644). Se ve midiendo, no mirando.

**④ Cero reutilización.** Trece agentes construyeron trece juegos de medidores,
ondas y donas. La lámina 2 costaría lo mismo que la 1.

## El método v2

La regla que lo ordena todo:

> **Lo que es arte fija se traza. Lo que es información se compone. Los agentes
> sólo tocan lo que exige criterio.**

### Paso 0 · Medir la lámina (automático, segundos)

```bash
node scripts/lamina/detect-regions.mjs <slug>     # retícula de medición
```
Más la medición de cajas por banda. **Ningún agente estima una coordenada.**

### Paso 1 · Trazar el arte fija (automático, minutos)

```bash
node scripts/lamina/glyphs.mjs <slug> --band y0,y1 --x x0,x1 --umbral 55
```
Glifos, sellos, emblemas, códigos de barras, micrografía: todo lo que es un
dibujo fijo sale trazado del original con vtracer, con el umbral elegido por
barrido medido. Salida: SVG optimizado (38 KB → 5,2 KB en el primer lote).

Esto **no es hacer trampa con la imagen**: es la distinción correcta entre
decoración y datos. Un glifo no es información, es una marca; reproducirlo exacto
es lo que se quiere. Un medidor sí es información y se construye.

### Paso 2 · Componer desde el kit (1 agente, no 13)

Las 17 láminas repiten el mismo vocabulario de instrumento. Se construye **una
vez** y después una lámina es composición y datos:

```
marco de panel · título numerado · tabla clave/valor · fila punteada
medidor de barras · onda · scanner radial · dona · sparkline · anillo de estado
chip · sello · código de barras · marcas de esquina · matriz de glifos
```

Cada pieza como receta, no como dibujo:

```json
{ "tipo": "signal-gauge", "valor": 92, "etiqueta": "COHERENCE",
  "paleta": "descent", "estado": "activo" }
```

### Paso 3 · Iterar con puntaje propio (barato)

```bash
node scripts/lamina/score-panel.mjs <slug> <Panel> --triptico
```
**2,7 segundos** contra 19+ del build. Con historial por panel, así el agente
sabe si su último cambio mejoró o empeoró y **itera solo** hasta que el número
baje, en vez de entregar a ciegas y esperar una vuelta completa del equipo.

### Paso 4 · Cerrar la vuelta

```bash
node scripts/lamina/iterate.mjs <slug> --crops
```
Build → medir por región → recortes ref|actual → historial con detección de
regresiones.

## Sobre traer motores libres

El instinto es correcto —no fabricar por cuadragésima vez una barra que sube a
92 %— pero la elección de motor depende de para qué:

**Sí, y ya:** `d3-shape` y `d3-scale` (unos pocos KB, matemática pura de arcos,
curvas y escalas, sin opinión sobre el DOM). `vtracer`, que ya está y es el mayor
ahorro medido. `Cytoscape.js` para el Atlas navegable — pero eso es otro
producto, no las láminas.

**Con cuidado: ECharts.** Esto se midió el 2026-08-09 sobre el DEPTH GRAPH de
179×115, con el mismo diff que usa el banco:

| | diferencia contra la referencia |
|---|---|
| a mano | **6,83 %** |
| ECharts 6.1 (SSR a SVG) | **9,07 %** |

El motivo es estructural y conviene entenderlo antes de generalizarlo. La
referencia rotula su eje Y `10K · 8K · 4K · 2K · 800K` — **no es una escala
real, es decorativa**. ECharts elige ticks matemáticamente correctos
(`10.000 · 1.000 · 300`) y no hay forma de convencerlo sin pelearle al motor de
ejes. Corrige el eje hacia lo correcto, y la referencia no es correcta.

Para un tablero que diseñamos nosotros, esa corrección es exactamente lo que uno
quiere. Para reproducir una lámina, es el problema. La diferencia es modesta
(~2 puntos) y parte de ella es el título, que no es trabajo de ECharts.

*Nota de método: una versión anterior de este documento afirmaba esta conclusión
citando 8,04 %, un número de otra vuelta y sin haber corrido la comparación. La
prueba se completó después y el número correcto es el de arriba.*

**No para esto:** Tailwind (el repo es CSS puro por decisión de dueño), React
Three Fiber y Framer Motion (no hay React; y animar telemetría inventada choca de
frente con la regla de canon que prohíbe presentar valores generados como estado
real del sistema).

## Qué debería costar la lámina 2

| paso | quién | costo |
|---|---|---|
| medir cajas y retícula | script | segundos |
| trazar arte fija | script | minutos |
| componer desde el kit | 1 agente | ~150 k tokens |
| héroe / organismo | 1 agente | ~200 k tokens |
| iterar con puntaje propio | esos 2 agentes | incluido |

**~350 k tokens contra 3,4 M.** Un orden de magnitud, y la caída viene de sacarle
a los agentes el trabajo que una máquina hace mejor: medir y trazar.

## Lo que queda por construir

1. **El kit de primitivas** (`src/components/kodex/lamina/kit/`) — es la pieza
   grande que falta y la que hace que la lámina 17 cueste una tarde.
2. **Generalizar el trazador** a cualquier región de arte fija, no sólo la banda
   de glifos.
3. **La capa de micrografía** — el texto ilegible de 2-3 px que da densidad de
   instrumento. Es textura, así que va por trazado o por patrón generado, nunca
   por agente.
