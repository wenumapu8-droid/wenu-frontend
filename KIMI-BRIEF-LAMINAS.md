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

| prop | declarado | corregido | |
|---|---|---|---|
| `titKodex.size` | 50 | **78,4** | mitad de alto |
| `titPalabra.size` | 50 | **78,4** | mitad de alto |
| baseline (`y`) | 155 | **157** | |
| `titGuion` | (365,118) 15×3 | **(354,132) 21×4** | corrido 11 y 14 px |
| `titInf` | a=42 b=30 | **a=37,5 b=32** | ancho y bajo |
| `titBarra` | baja hacia la izq. desde x=494 | **desde x=515** | espejada |
| `titKodex.len` | 270 | **268** | ya estaba bien |
| `titPalabra.x` / `.len` | 540 / 500 | 540 / 500 | ya estaba bien |

**Resultado medido: cabecera 5,711 % → 4,880 %, global 4,311 % → 4,178 %.**
Tres ciclos, y ya no es la peor región de la lámina.

La relación versal/cuerpo **no se estima**: está en la fuente. Cormorant
Garamond declara `OS/2.sCapHeight = 625` sobre `head.unitsPerEm = 1000`, o sea
0,625 exacto — se lee inflando las tablas del `.woff` con `zlib`, quince líneas
de node. 49 / 0,625 = 78,4. Con cuerpo 50 la versal renderizada es 31 px.

**Los dos títulos son del mismo cuerpo.** El 51 que miden KODEX y COMMONS es el
rebase de las redondas (O, C, S); las planas —K, D, E, X, T, H, M, N— miden 49
en las dos palabras. Por eso la versal real es 49 y no 51, y por eso la línea de
base es 157: las planas terminan en 156 y las redondas en 157.

### Dos trampas que costaron un ciclo cada una

**El hueco de 8 px.** El tramo de tinta `80..374` que devuelve un perfil por
columnas **incluye el guion**: la palabra sola es `80..346` y el hueco `346→354`
mide 8 px, así que cualquier agrupador con umbral de 14 los fusiona. Poner
`len: 295` sobre esa medición estira cada letra ~10 % y la cabecera empeora a
6,03 %. Antes de usar un tramo, **verificá que sea una sola cosa**.

**Medir el puntaje no es medir el render.** Con cuerpo 82 la cabecera empeoró y
el número sólo decía "peor". El motivo apareció recién midiendo el render letra
por letra contra la referencia —alturas 52-53 contra 49—, y con él el número
correcto. El puntaje te dice que fallaste; el perfil del render te dice por qué.
`scripts/lamina/out/<slug>/actual.png` está ahí para eso, y se mide con el mismo
script que la referencia.

O sea: los títulos estaban **a la mitad de alto**, con `textLength` forzando el
ancho correcto. Las letras salen anchas y bajas. Es el mismo error que el método
ya tenía anotado como sumidero ③ —"los agentes comprimieron tipografía para que
su contenido entrara"— sólo que en el otro eje: se cuadró el ancho y nunca se
midió el alto. Y ocurre en la banda de mayor contraste de la lámina, que es por
lejos lo que más pesa en el diff.

**Y la comprobación cruzada.** Todas las páginas de la serie comparten
`CabeceraUniverse.astro`:

```
u01 1,52 %   u05 3,60 %   u06 4,53 %   u09 4,67 %   u07 4,97 %   u10 5,71 % → 4,88 %
```

u01 llega a 1,52 % con el mismo componente. El cromo no es el techo: el techo
son las cotas de la página. Y `u10/Cabecera.astro` es la más flaca de todas —
`rielIzq={[]}`, `rielDer={[]}`, sin `nodosIzq/nodosDer`, sin slot `glifos`, sin
slot `sep`, con 15 vars contra las 27 de u01. Hay una lista de trabajo entera
ahí que no requiere una sola decisión estética: sólo medir y transcribir.

**El orden de trabajo, con el paso 1 ya hecho:**

1. ~~Cuerpo y línea de base de los dos títulos, más guion, lemniscata y barra.~~
   Hecho, commit `d4df938`: 5,711 % → 4,880 %.
2. Leer `u01/Cabecera.astro` completo y transcribir a u10 lo que u01 tiene y u10
   no: rieles, nodos, glifos de riel, guías de bajada, vars de opacidad. Cada
   uno **remedido sobre la referencia de u10**, nunca heredado — el propio u01
   advierte que copiar cotas de la lámina hermana corre el marco 2 px y el banco
   lo ve en las cuatro esquinas.
3. Recién después el héroe (`hero-center 5,35 %`, ahora la peor región). Ahí sí
   hay criterio, y ahí sí un agente iterando tiene sentido.

## 6 · Cómo no quemar la cuota

Casi todo el gasto de una sesión trancada no es pensar: es reintentar.

**No edites por `ssh` con heredoc.** El intento de
`ssh mini 'cd ~/kodex-work && python3 <<PYEOF ... '` se rompe solo: las comillas
simples del código cierran el `'...'` del shell y el archivo llega mutilado.
Cada reintento cuesta un turno entero. Editá con la herramienta de edición de
archivos sobre la máquina donde está el repo, o pasá los valores como argumentos
a un script que ya exista — nunca código dentro de comillas dentro de comillas.

**Un ciclo = un cambio medido.** No agrupes seis cotas y un cambio estético en
la misma vuelta: si el número sube no sabés cuál fue. Las seis cotas de acá se
podían agrupar porque las seis eran mediciones, no opiniones.

**Cuando el número empeora, medí el render antes de proponer otra cosa.** Es un
script de veinte líneas y te da la causa. Proponer a ciegas cuesta un build
(19 s y 1.558 páginas) por hipótesis.

**No repitas el trabajo de la lámina hermana.** Diez páginas comparten cromo.
Antes de reconstruir, abrí la que ya puntúa mejor y mirá qué props tiene.

**Y si te quedás sin cuota, que sea con todo commiteado.** Ya se perdió trabajo
dos veces por eso. Commit WIP en tu rama `wip/...`, siempre.
