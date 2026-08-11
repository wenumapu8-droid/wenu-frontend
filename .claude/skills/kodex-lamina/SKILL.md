---
name: kodex-lamina
description: Construir páginas del KODEX−∞ — láminas reproducidas desde una referencia visual y escenas vivas. Método medido, no opinado: banco de comparación con control de fase, kit calibrado, héroe procedural y las doce compuertas del blueprint. Úsala para cualquier lámina, folio o escena del códice.
---

# KODEX−∞ · cómo se hace una página

Esta skill existe porque el método salió de equivocarse muchas veces y medir
cada vez. Todo número que aparece acá está medido en este repo, no estimado.

## Regla cero: auditar antes de escribir

**Ocho veces seguidas** lo que hacía falta ya estaba escrito: la `Micrografia`,
los sellos trazados, el túnel móvil, las páginas vivas, el registro de vistas,
la máquina de estados de escena, el índice del códice y el overlay de las siete
escenas. En un caso el índice existía, estaba bien construido y lo rompía **un
solo atributo** (`loading="eager"` en 1.334 portadas: no cargaba en 30 s; con
`lazy`, 588 ms).

Antes de crear cualquier componente, página o utilidad:

```bash
grep -rl "<concepto>" src/ | head          # ¿existe ya?
ls src/components/kodex/ src/lib/kodex/    # ¿está en el kit o en lib?
```

Si el resultado no está vacío, **leelo antes de escribir**. Enchufar cuesta una
línea; reconstruir cuesta una sesión y deja dos verdades en el repo.

## Jerarquía de verdad — no negociable

Las láminas **no son la especificación**. El Truth Ledger las pone en el puesto
8 de 9, debajo del canon, el Decision Log, el código verificado y la Scene
Bible. Literal: *«never overwrite canon based solely on a reference image»*.

Y la escala de producción, que decide cómo se habla de lo hecho:

```
CONCEPT → VISUAL REFERENCE → GENERATED IMAGE → PROTOTYPE
       → IMPLEMENTED FEATURE → TESTED FEATURE → DEPLOYED FEATURE
```

> *Una intención no es un resultado. Un prompt no es una implementación.
> Un prototipo no es un producto desplegado.*

Una lámina reproduce un GENERATED IMAGE: es **prototipo**. No la llames
terminada.

### Lo que nunca se inventa

Taxonomía de escenas, paleta, coordenadas del canon y asignación de nodos son
**decisiones del creador**. Hay cuatro taxonomías de escena y tres máquinas de
estado vigentes a la vez; el conflicto está registrado en `KODEX-PLAN.md` sin
resolver, y así se queda. Si tu trabajo tropieza con una de ellas: conservá el
conflicto, clasificalo y **proponé una acción verificable**. No lo resuelvas en
silencio — eso lo prohíbe el Truth Ledger por escrito.

### Privacidad, textual de la Scene Bible

Sin fingerprinting, sin inferencia emocional, sin puntaje espiritual, sin
inferencia de salud, sin micrófono oculto. En OBSERVER, además: *no inferir
emoción, calidad de atención ni estado psicológico*. La memoria vive en el
navegador del visitante y no sale de ahí.

### Cultura y matemática

Ningún símbolo cultural sin cultura, territorio, fuente, custodio, licencia,
transformación, límites, riesgo de apropiación y estado de consulta. Nada de
«sabiduría ancestral» como categoría homogénea. Y ninguna fórmula como
ornamento: toda matemática mostrada explica una propiedad, controla un
algoritmo, define una transformación o se declara modelo conceptual.

---

# El método, en orden

## 1 · Medir las bandas de la referencia

No estimes las cajas a ojo. Yo lo hice y **quemé dos vueltas completas**: los
agentes comprimieron la tipografía para que entrara en cajas que estaban mal.

```bash
node scripts/lamina/bandas.mjs reference/posters/<lamina>.png
node scripts/lamina/medir-cajas.mjs reference/posters/<lamina>.png
```

`bandas.mjs` es semiautomático y **funciona siempre**. `medir-cajas.mjs` es
automático y funciona en algunas láminas y en otras no — está documentado así a
propósito. Si discrepan, gana el semiautomático.

Dos trampas medidas: el detector se deja engañar por la simetría del arte (pasó
en SIGNAL BLOOM, x=835), y el umbral adaptativo va en **p12, no en p55** — el
cromo vive cerca del piso de luminancia, no en la mediana.

## 2 · Andamiar

```bash
node scripts/lamina/andamiar.mjs <slug> --bandas cajas/<slug>.json
```

Genera la estructura con las cajas medidas. El cromo se llena con el kit; el
centro queda para el héroe.

## 3 · El kit antes que el código nuevo

`src/components/kodex/lamina/kit/` — seis primitivas con las constantes que
salieron de medir, no de imaginar:

| primitiva | constante medida |
|---|---|
| `RingGauge` | razón geométrica ~0,93 entre anillos; brillo irregular por anillo |
| `RadialScanner` | agujas del peine **asimétricas** |
| `BarMeter` | las barras **no son sólidas** |
| `Waveform`, `StepGraph` | — |
| `Micrografia` | marcas, **no texto**: a ese tamaño la tipografía real se ve peor |

`rng.ts` trae `mulberry32`. **Nunca `Math.random()`**: sin semilla, la página no
es reproducible y el banco mide ruido.

## 4 · El héroe es procedural, y ahí va el presupuesto

La economía del proyecto, en palabras del creador: *«esto es como un collage de
muchas partes ya hechas y cada vez se usa más recursos para hacer el elemento
principal que es el animado en loop»*.

**Cromo barato, organismo caro.** El cromo sale del kit en minutos; el héroe
—un cráneo que gira, un túnel, una flor que abre, una raíz que crece— es donde
va el trabajo.

Reglas del organismo, todas aprendidas rompiéndolas:

- **Bucle por fase, no por tiempo.** `t` creciente produce una costura al dar la
  vuelta. Arrancá la fase en `n = −1`, no en `n = 0`. Verificación: pico/media
  del delta entre cuadros ≤ ~1,3× (medido 1,26×).
- **Contrato de congelado.** Exponé `__kdxRegisterFreeze` para que el banco pueda
  congelar el rAF. Playwright con `animations:"disabled"` congela WAAPI pero
  **no** congela un canvas con rAF — está comprobado.
- **DPR, visibilidad y `prefers-reduced-motion`** desde el principio, no al
  final. Fuera de pantalla no se dibuja.

Si una lámina termina con **0 canvas y muchos miles de paths**, es el PNG
vectorizado y no código. El banco lo grita solo. La pregunta central del canon
es *«¿puede un sistema comportarse como una forma viva de memoria?»*, y un SVG
de 85.000 paths no puede.

## 5 · Medir

```bash
node scripts/lamina/compare.mjs <slug>          # lámina completa
node scripts/lamina/score-panel.mjs <slug> izq  # un panel, 2,7 s
```

La métrica es la **media de dos**: diferencia de píxel y diferencia estructural
sobre bloques de 8×8 de luminancia media. Los dos scripts usan la misma métrica
a propósito: si medís con una y optimizás contra otra, los agentes optimizan la
que se les mide.

**Por qué la estructural.** La métrica de sólo píxel **premiaba los paneles
vacíos**: un agente lo demostró — `MotionNotes` vacío daba 10,04 % y el correcto
11,98 %. El banco te pagaba por borrar. Con la estructural, no.

El banco también reporta la **forma** (paths, canvas, nodos, bytes) al lado del
puntaje, para que la diferencia entre trazado y procedural se vea en vez de
esconderse dentro de un número.

## 6 · Terminado no es «se ve bien»

Las doce compuertas del blueprint, y **la fidelidad de píxel no está entre
ellas**: nodos mapeados · procedencia asignada · sistema visual implementado ·
la interacción **significa** algo · transición de estado probada · **evento de
memoria emitido** · móvil verificado · reduced-motion presente · FPS medido ·
sin afirmación científica o cultural no sostenida · documentación al día ·
commit ligado al nodo.

Y la de la Scene Bible, más corta y más dura:

> *«El estado recordado cambia un renderizado futuro.»*

Si volver a la página no la cambia, **no está terminada**.

---

# Enchufarla al códice

Tres cosas que ya existen. No las reescribas: usalas.

**Memoria** — `src/kodex/return/memory.js`. `record({type:'view'|'effect'|'signal'|'cycle'})`
y `readSpecimen()`. `KodexShell` ya graba la vista; si tu página usa `Base` en
vez del shell, poné `<KodexRecuerda registraVista />` — así fue como se
descubrió que las 1.427 páginas de `vol/` eran invisibles para la memoria.
`cycle` es de RETURN: no lo toques desde otra escena.

**Estado de escena** — `src/lib/kodex/estado.ts`. Una máquina por escena, no una
por capa: `idle → aware → locked → active → transitionOut`, sólo hacia adelante.
`montarEstadoEscena()` busca `[data-kx]`, `.kx-threshold` o `.kx-os-stage`: si tu
raíz no tiene ninguna, la máquina no arranca y te quedás en `idle` sin aviso.

**Alcanzable** — una página que nadie enlaza no existe. Once rutas construidas
tenían cero enlaces entrantes, incluido el índice de láminas. Comprobalo:

```bash
grep -rl 'href="/kodex/<tu-ruta>' dist/ | head
```

Y ojo con dos falsos negativos reales: hay enlaces que van con query
(`/kodex/verify/?code=…`) y navegación que no usa `href` sino `data-next-url`,
que `src/scripts/kodex-engine.js:170` lee para navegar.

---

# Trampas que ya costaron caro

| síntoma | causa |
|---|---|
| el `<script>` no corre | TypeScript en `<script>` de Astro: se compila como JS. Sin anotaciones. |
| el build rompe con GLSL | `{` en el marcado se parsea como expresión Astro. Escapá `&#123;` / `&#125;`. |
| `scale()` no hace nada | `100vw / 1672` da una **longitud**; `scale()` quiere un **número**. Calculalo en JS. |
| no centra | `place-items: center` sobre una caja más grande que el contenedor desborda de un lado. `transform-origin: 0 0` + `translate` calculado. |
| el puntaje no cambia | estás midiendo contra un `dist/` viejo. **Reconstruí antes de medir.** |
| build falla por WooCommerce | `ALLOW_EMPTY_PRODUCTS=true npm run build` — está documentado en `CLAUDE.md`. |

## La trampa de medición más peligrosa

**Una animación confunde cualquier comparación de píxeles.** Comparar dos
capturas de una página animada da una diferencia grande que **no prueba nada**:
midiendo el efecto de la memoria sobre el portal saqué 28,77 % y el control de
dos visitantes idénticos daba 25,29 % de puro ruido de fase.

El control correcto: barrer ~10 cuadros por condición y tomar el **mínimo entre
pares**. Así el piso quedó en 7,05 % y el efecto real en 21–24 %.

**Siempre corré el control.** Si no tenés un piso, no tenés un resultado.

## Y la regla que ordena todo lo demás

> **Un proceso en segundo plano que muere no es un resultado.**

Una vez escribí una conclusión sobre ECharts citando un número que venía de otra
ronda, porque el proceso había muerto y no lo noté. Hubo que corregir cuatro
documentos. Si el proceso no terminó, no hay dato: volvé a correrlo.

---

# Costo real, para planificar

| | tokens | agentes |
|---|---|---|
| lámina 1 (con ella se construyó el método) | 3,4 M | 26 |
| lámina 2 (método v2) | 1,10 M | 4 |

15 láminas ≈ 16 M: viable. ~199 ≈ 220 M: **no viable sin generador**. Si el
pedido es escalar a cientos, la respuesta es una receta que genere, no más
agentes reproduciendo a mano.

# Un cierre honesto

El proyecto no busca una fotocopia. El creador lo dijo mejor que ningún
documento: *«no se siente viva»*. Una lámina que puntúa 6 % y no respira vale
menos que una que puntúa 9 % y **cambia cuando volvés**.

Los números que se mueven, los gráficos que se mueven y el audio reactivo no son
adorno: son la diferencia entre un sitio con efectos y un instrumento.
