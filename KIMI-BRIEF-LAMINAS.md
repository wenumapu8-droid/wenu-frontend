---
tipo: brief de trabajo para agente de láminas
proyecto: KODEX −∞
fecha: 2026-08-13
para: Kimi (K2.7) y cualquier agente que entre a una lámina
base: KODEX-METODO-LAMINAS.md (método v2)
---

# Cómo trabajar una lámina sin quemar dos horas en cero

Esto no reemplaza a `KODEX-METODO-LAMINAS.md`; lo aterriza en un procedimiento
y lo muestra sobre un caso real que acaba de fallar.

## 1 · La regla madre

> **Lo que es arte fija se traza. Lo que es información se compone. El agente
> sólo toca lo que exige criterio.**

Si estás ajustando a ojo algo que se puede medir o trazar, estás perdiendo. No
importa cuánto mejore el número: el techo lo pone el método, no el esfuerzo.

## 2 · El ciclo obligatorio, en ese orden

**No se toca una región hasta haber hecho los pasos 1 y 2.**

### Paso 1 · Medir la referencia (nunca mirarla)

```bash
node scripts/lamina/_medir_region_components.mjs <slug> <region-id>
```

Escribe `scripts/lamina/out/<slug>/<region>-audit.md` + `-components.json`:
componentes conectados, bbox, centro, área, clusters. Eso es la verdad de la
referencia. Ninguna coordenada, ningún tamaño y ninguna opacidad se estima a
ojo — todas salen de acá o de un perfil de tinta hecho a mano con `pngjs`
(20 líneas de node, segundos).

### Paso 2 · Clasificar la región antes de tocarla

Mirá el audit y decidí a qué categoría pertenece lo que está fallando:

| lo que ves en el audit | qué es | qué se hace |
|---|---|---|
| clusters compactos, repetidos, de tamaño parecido, alineados | glifos / sellos / arte fija | **trazar** con `glyphs.mjs`, no dibujar |
| clusters que caen exactamente donde tu componente ya pone texto | tipografía descuadrada | **medir cotas** (versal, tramos de tinta, baseline) y corregir el número |
| barras, ondas, donas, anillos, medidores | información | **componer** desde `src/components/kodex/lamina/kit/` |
| una mancha grande e irregular, muchos miembros | organismo / arte de héroe | criterio — recién acá tiene sentido un agente iterando |

Ajustar opacidad y posición a ojo **no está en la tabla**. Nunca es la
respuesta.

### Paso 3 · Actuar, y puntuar barato

```bash
node scripts/lamina/score-panel.mjs <slug> <Panel> --triptico   # ~2,7 s
```

`astro build` son 19 s y 1.558 páginas para mirar un recuadro. No lo corras
para iterar.

### Paso 4 · Cerrar

```bash
node scripts/lamina/iterate.mjs <slug> --crops
```

## 3 · Frenos (los tres son duros)

1. **Freno de clasificación.** Si el paso 2 dice "trazar" o "medir cotas" y vos
   ibas a ajustar a ojo: parás y hacés lo que dice la tabla.
2. **Freno de 3 ciclos.** Tres ciclos en una región sin que el número baje →
   revertís al commit base y preguntás. No pasás sola a la región siguiente.
3. **Freno de reutilización.** Antes de reconstruir algo, buscá la lámina
   hermana que ya lo resolvió y **copiale las cotas**. Trece agentes ya
   construyeron trece juegos de medidores; no hagas el catorce.

## 4 · Lo que nunca

- Nunca `git merge`, nunca PR mergeado, nunca deploy. La revisión es del
  creador y sólo despliega él, con la frase literal `APROBAR DEPLOY`, y sólo
  `redesign-v2`.
- Nunca escribir fuera de `~/kodex-work` / `~/kodex-minus-infinity` /
  `~/Trabajos-Aparte/KODEX`. Nada bajo `~/.hermes/` ni `~/Sinergia-Industrial/`.
- Nunca inventar canon: ni coordenadas A–Y, ni significados de B–L o N–X, ni
  presentar un valor generado como medición.
- Nunca dejar trabajo sin commitear. Se perdió trabajo así dos veces. Commit
  aunque sea WIP, en la rama `wip/...` propia.
- Nunca tocar el componente compartido (`serie-universe/`) para arreglar **una**
  lámina: lo comparten u01–u10. Las diferencias van como props de la página.

## 5 · Caso trabajado: u10-commons · cabecera

Así se veía el fracaso, y así se veía la respuesta que estaba a un paso.

**Lo que pasó.** 2 h 23, 32 turnos, cuota agotada. Tres ciclos sobre los objetos
de `Heroe.astro` moviendo posiciones, tamaños y opacidad a ojo:

| ciclo | global | hero-center |
|---|---|---|
| base | 4,31 % | 5,36 % |
| 1 · posiciones | 4,31 % | 5,35 % |
| 2 · tamaños | 4,31 % | 5,34 % |
| 3 · opacidad | 4,33 % | 5,45 % ← peor |
| revert | 4,31 % | 5,35 % |

Eso es el sumidero ① del método —redibujar a ojo lo que se mide o se traza— y
el resultado plano era predecible antes del primer ciclo.

**Lo que el audit ya decía y nadie leyó.** `cabecera-audit.md` lista 13 clusters
de ~49×51 px alineados en `y≈107..157`, de `x=79` a `x=1001`. Eso no es
decoración suelta: son **las letras de los dos títulos**. El cluster #10 cae en
`(79,108)` y `titKodex.x = 79`. El cluster #1 cae en `(540,108)` y
`titPalabra.x = 540`. El audit te estaba apuntando al componente con el dedo.

**La medición que cierra el caso.** Perfil de tinta de la banda del título sobre
`reference/canon/u10-commons.png`, umbral 40:

```
banda de tinta:  y 104..157
tramos de tinta: x  80..374  versal 51   (KODEX)
                 x 388..466  versal 36   (guion + ∞)
                 x 494..515  versal 54   (barra)
                 x 540..664  versal 49   (THE)
                 x 689..1039 versal 51   (COMMONS)
```

Contra lo que declara `src/components/kodex/lamina/u10/Cabecera.astro`:

| prop | declarado | medido | veredicto |
|---|---|---|---|
| `titKodex.x` | 79 | 80 | ok |
| `titKodex.len` | 270 | **295** | 25 px corto |
| `titKodex.size` | 50 | versal 51 → **≈82** | **muy corto** |
| `titPalabra.x` / `.len` | 540 / 500 | 540 / 500 | ok |
| `titPalabra.size` | 50 | versal 49 → **≈78** | **muy corto** |
| baseline (`y`) | 155 | 157 / 156 | 2 px |

La relación versal/cuerpo de esta fuente es **0,625**, y no es una suposición:
`u01/Cabecera.astro` la documenta dos veces con medición propia —cuerpo 88 →
versal 55, cuerpo 80 → versal 50—. Con cuerpo 50, la versal renderizada es
~31 px contra 49–51 de la referencia.

O sea: los títulos están **a la mitad de alto**, con `textLength` forzando el
ancho correcto. Las letras salen anchas y bajas. Es el mismo error que el método
ya tenía anotado como sumidero ③ —"los agentes comprimieron tipografía para que
su contenido entrara"— sólo que en el otro eje: se cuadró el ancho y nunca se
midió el alto. Y ocurre en la banda de mayor contraste de la lámina, que es por
lejos lo que más pesa en el diff.

**Y la comprobación cruzada.** Todas las páginas de la serie comparten
`CabeceraUniverse.astro`:

```
u01 1,52 %   u05 3,60 %   u06 4,53 %   u09 4,67 %   u07 4,97 %   u10 5,71 %
```

u01 llega a 1,52 % con el mismo componente. El cromo no es el techo: el techo
son las cotas de la página. Y `u10/Cabecera.astro` es la más flaca de todas —
`rielIzq={[]}`, `rielDer={[]}`, sin `nodosIzq/nodosDer`, sin slot `glifos`, sin
slot `sep`, con 15 vars contra las 27 de u01. Hay una lista de trabajo entera
ahí que no requiere una sola decisión estética: sólo medir y transcribir.

**Lo que valía la pena hacer, en orden:**

1. Corregir el cuerpo de los dos títulos y el baseline. Un ciclo. Es la única
   hipótesis medida sobre la mesa.
2. Leer `u01/Cabecera.astro` completo y transcribir a u10 lo que u01 tiene y u10
   no: rieles, nodos, glifos de riel, guías de bajada, vars de opacidad. Cada
   uno **remedido sobre la referencia de u10**, nunca heredado — el propio u01
   advierte que copiar cotas de la lámina hermana corre el marco 2 px y el banco
   lo ve en las cuatro esquinas.
3. Recién después, el héroe. Ahí sí hay criterio.

## 6 · Sobre el número que estabas por atacar

`cabecera 5,711 %` es del run vigente: `score.json` generado 2026-08-13 19:43,
sobre las cajas re-diagnosticadas de `scripts/lamina/regions/u10-commons.json`.
Es el **mismo** run que dio `global 4,311 %` y `hero-center 5,346 %`. No es el
número viejo y no hay que volver a medir.
