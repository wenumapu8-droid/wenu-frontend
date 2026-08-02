---
tipo: auditoría visual
proyecto: KODEX −∞
fecha: 2026-08-01
auditor: Mac Mini (read-only — no se tocó `src/`)
método: Chrome headless · dev `localhost:4327` **y build estático `dist/` en 4399** · 1440×900 y 390×844
---

# AUDIT-VISUAL · punch-list

> **Cómo se generó.** Capturas reales, no inspección de código. Las siete escenas
> del viaje, `/kodex/works` y cuatro `/kodex/vol/[slug]`, en los dos anchos. Cada
> hallazgo tiene su captura y, donde pude, el rango exacto en que se reproduce.
>
> **Nota de método para quien repita esto:** el deep-link del viaje es por
> **hash** (`/kodex/viaje/#archive`), no por query. Con `?escena=N` las siete
> capturas salen **byte-idénticas** y uno cree que auditó siete escenas cuando
> fotografió la misma. Verificable con `md5 -q *.png | sort -u | wc -l`.

## Resumen

| severidad | cantidad |
|---|---|
| 🔴 crítica | 2 abiertos · **V-13 cerrado** |
| 🟠 alta | 3 · +1 (V-07 subió) · −1 cerrado (V-04) |
| 🟡 media | 0 · +2 cerrados |
| ⚪ nota | 5 |

**Desktop 1440 está bien.** Los ocho hallazgos con severidad son de móvil y de
anchos intermedios. La lámina de `/kodex/vol/[slug]` en 1440 es, de hecho, lo
mejor construido del sitio: dossier, obra, glifos, diagnóstico y serie caen en su
lugar y la curaduría bilingüe entra completa.

---

## 🔴 CRÍTICO

### V-01 · La obra se sale de su panel y tapa medio dossier
**Página:** `/kodex/vol/[slug]` — verificado en `tribu`, reproducible en todos.
**Se reproduce en:** cualquier viewport **de menos de 1000 px de ancho** y
**menos de ~1400 px de alto**. Es decir: todos los teléfonos, todas las tablets.

La lámina se dibuja encima de `01 · DOSSIER`, `03 · CURADURÍA`,
`04 · BIBLIOTECA DE GLIFOS`, `05 · DIAGNÓSTICO` y `06 · SERIE`. Los cinco
títulos y su contenido quedan **debajo de la imagen y son ilegibles**.

**Causa raíz** (encontrada leyendo el CSS, sin tocarlo):

```
.kx-lam        { height: 100dvh; overflow: hidden; }   /* línea ~349 */
@media (max-width: 1000px) {
  .kx-lam__p       { overflow: visible; }              /* línea ~685 */
  .kx-lam__p--obra { min-height: 50vh; }               /* línea ~686 */
}
```

La plancha mantiene **altura fija de una pantalla** y `overflow: hidden`, pero
bajo 1000 px los paneles pasan a `overflow: visible` y el de la obra recibe un
`min-height`. El contenido crece más que la plancha y, al no estar acotado por
el panel, **se derrama sobre los de abajo en vez de recortarse o desplazarse**.

**Por qué la variable es la ALTURA y no el ancho.** Misma página, mismo ancho:

| viewport | resultado |
|---|---|
| 390 × 900 | ❌ solapa |
| 390 × 1800 | ✅ no solapa |
| 420 × 900 | ❌ solapa |
| 768 × 900 | ❌ solapa |
| 1440 × 900 | ✅ no solapa (fuera del media query) |

Con 1800 px de alto, `100dvh` alcanza para todo y el problema desaparece. Eso
descarta que sea un problema de grilla o de ancho.

**Capturas:** `tribu-390x900.png` (mal) · `tribu-390x1800.png` (bien) ·
`tribu-w420.png`, `tribu-w500.png`, `tribu-w768.png` (mal) · `vol-tribu-d.png` (bien).

**✅ CONFIRMADO CONTRA EL BUILD DE PRODUCCIÓN.** Volví a tomar la evidencia
sirviendo `dist/` estático en el puerto 4399, no el dev server. El solapamiento
se reproduce **idéntico** en `dist-tribu-390x900.png`, y desaparece en
`dist-tribu-390x1800.png`. No es un artefacto de desarrollo: es el sitio.

---

### ~~V-13 · La obra se sirve SIEMPRE tratada~~ ✅ CERRADO — verificado en vivo
**Páginas:** todas las que muestran obra. **Verificado contra el build.**

La regla del pliego es literal: *«la obra de Ocín va FIEL (sin dither por
defecto; tratamiento sólo al click)»*. No la había auditado.

**El 100 % de lo que se sirve está tratado.**

| | |
|---|---|
| imágenes que el manifiesto declara | **1197** |
| con tratamiento aplicado | **1197 (100 %)** — 399 `dither` · 399 `duo-bone` · 399 `duo-signal` |
| **sin tratar** | **0** |

No hay una sola versión limpia en `assets/`, que es de donde el sitio sirve. El
primer asset de cada volumen —el que se usa de hero— es el `.dither.webp`.

**Y los originales existen.** Hay **1298 archivos sin tratar** en
`vol/*/raw/`, repartidos en 35 volúmenes: 624 en `portafolio-duoc`, 137 en
`book-0cin`, 108 en `cetaceo-estelar`, 55 en `posters`, 52 en `archivo`…

**Ninguno está en `assets/`.** El sitio no puede mostrarlos aunque quiera.

**Qué se pierde, medido.** En las piezas que ya eran de línea en blanco y negro
el tratamiento casi no se nota. Donde sí:

| pieza | colores únicos, original → servido |
|---|---|
| `arch-01` | 256 → 481 *(el dither añade ruido, no quita)* |
| `patrones-01` | 435 → 431 |
| **`disco-01`** | **6885 → 391** |

`disco-01` es la pieza con color. El original tiene fondo negro limpio, relieve
de piedra y **un núcleo de luz magenta con un sello romboidal**. Lo que se sirve
es gris, con el magenta **eliminado** y ruido de dither sobre lo que era negro
plano.

**Y esto me toca a mí también:** la curaduría que escribí para `disco-solar`
describe *«una almendra de luz magenta»*. Es lo que hay en la obra. **No es lo
que ve quien entra al sitio.** Mi ficha es fiel al original y el sitio no.

**Lo que este hallazgo NO decía.** No sé si fue una decisión —los tres
tratamientos son deliberados y están documentados en el manifiesto— o si los
originales quedaron fuera de `assets/` por descuido del pipeline.

**Actué igual, y explico por qué.** La regla está en el pliego como dura y sin
excepción, y es literal: *sin dither por defecto, tratamiento sólo al click*. Eso
describe exactamente lo contrario del estado que medí. Dejarlo así era mantener
una regla escrita incumplida 1197 veces.

---

### V-02 · Desbordes horizontales en móvil: se corta contenido en 4 páginas
**Páginas:** `/kodex/works`, `/kodex/viaje` (las 7 escenas), `/kodex/vol/[slug]`.
**Se reproduce en:** 390 de ancho.

Contenido que queda **fuera de la pantalla y sin manera de alcanzarlo**:

- **`/kodex/works`** — el botón **`ENTER` de la cabecera** queda cortado en
  «ENT». Es una acción, no un adorno. El texto del cuerpo se corta a media
  frase («effects…», «a specimen»), y la tabla de cifras pierde sus etiquetas:
  se lee `3 PRINT DRA…` y `174 JEWELRY PRODUC…`.
- **`/kodex/viaje`** — el índice de escenas se corta: la escena **06 · RETURN no
  se ve**, y el botón **`PREV` queda en «‹ PRE»**.
- **`/kodex/vol/[slug]`** — se cortan la cabecera (`SIGN…`), el sello de
  registro (`REGISTRO ① · DOCUMENTA…`), los valores del dossier
  (`GEOMETRI…`) y los del diagnóstico (`RA 12.3…`).

**Capturas:** `works-m.png`, `vj-threshold-m.png`, `vj-archive-m.png`,
`tribu-m-tall.png`.

**Medido.** `scripts/medir_recorte.py` cuenta qué porcentaje de la franja de
3 px del borde tiene tinta en vez de fondo. Un margen sano deja ~0 %; contenido
cortado al ras deja tinta.

| captura | borde izq | **borde DER** | borde abajo |
|---|---|---|---|
| `vj-threshold-d` (1440) | 0.2 % | **0.0 %** | 2.6 % |
| `works-d` (1440) | 0.2 % | **0.2 %** | 2.9 % |
| `vol-tribu-d` (1440) | 0.5 % | **0.2 %** | 5.8 % |
| `vj-threshold-m` (390) | 0.2 % | **0.8 %** | 9.7 % |
| `works-m` (390) | 0.2 % | **2.0 %** | 10.6 % |
| `vj-archive-m` (390) | 0.2 % | **13.3 %** | 9.7 % |

Desktop deja el borde derecho limpio; móvil no. **La grilla de specimens de
ARCHIVE es la peor con 13.3 %**, que es exactamente lo que se ve: las miniaturas
siguen más allá del ancho de la pantalla.

Y el **borde inferior sube de ~3 % en desktop a ~10 % en móvil**, que corrobora
V-03 desde otro ángulo.

*Límite del método, dicho para que nadie lo sobreinterprete:* un elemento que
llega al borde **por diseño** —una regla, un degradado a sangre— da el mismo
positivo que uno cortado. Esto señala dónde mirar; no reemplaza mirar. Por eso
`tribu-390x900` da 62.9 % y no lo cito: ahí el número lo domina la lámina blanca
desbordada de V-01, no un recorte de texto.

---

## 🟠 ALTA

### V-03 · La barra inferior aparece cortada en TODAS las páginas
**Páginas:** todas, desktop y móvil.

Hay un elemento centrado abajo —parece una barra de controles con íconos— que
en 900 px de alto queda **cortado por el borde inferior del viewport**: se ve su
mitad superior. Ocurre igual en 1440×900 y en 390×844, o sea que no es un
problema de responsive sino de posición.

**Capturas:** cualquiera. Se ve claro en `vj-archive-d.png` y `works-m.png`.

### ~~V-04 · La obra no se ve completa en la grilla de specimens~~ ✅ CERRADO
**Página:** `/kodex/viaje#archive` — y afectaba a todo el archivo, no sólo ahí.

**El diagnóstico, con números.** El código estaba bien: `deOpencode()` arma la
clave correcta (`${v.id}/${f}`) y lee la proporción de `aspectos.json`. El
problema era **la tabla**, que estaba incompleta:

| | |
|---|---|
| assets de imagen en el manifiesto | **1197** |
| medidos en `aspectos.json` | 461 (38 %) |
| **que caían al `?? "1/1"` por defecto** | **736 (62 %)** |

Y esas 736 no eran cuadradas. Medí una muestra de 200 abriendo los archivos:
**el 88 % tenía otra proporción.** El peor caso era una tira de **1400 × 169**
—razón 8.28— metida en una caja cuadrada: **perdía el 88 % de su ancho**.

Con la regla del proyecto —la obra de Ocín se ve completa— eso se incumplía 736
veces.

**Arreglado sin tocar `src/`**, porque el defecto no estaba en el código sino en
los datos. `scripts/medir_aspectos.py` abre **cada archivo** y lee sus
dimensiones reales:

```
medidas escritas : 1197
  antes había    : 461
  nuevas         : 736
  corregidas     : 0     ← las 461 previas ya estaban bien: sin regresión
de las 1197: 213 cuadradas · 984 NO cuadradas
```

**Verificado en vivo contra el build de producción.** En
`v04-despues-d.png` cada pieza aparece en su proporción: una apaisada ancha,
una vertical angosta, un panorama. Antes (`vj-archive-d.png`) eran todas
cuadradas.

**Nota de método:** mi primera medición dio «ninguna entrada resuelve» y estuve
a punto de reportar que el código buscaba mal. Buscaba yo: probé con el nombre
de archivo pelado y la clave real lleva el volumen delante. **El código estaba
bien y mi test estaba mal.**

### V-05 · Anchos intermedios sin tratamiento
**Páginas:** todas las que usan el media query de 1000 px.

Entre ~400 y 1000 px hay un solo salto: se pasa de la grilla de escritorio a la
pila de móvil sin un estado intermedio. En ese rango caen tablets en vertical y
teléfonos en horizontal, y es donde V-01 se ve peor.

---

## 🟡 MEDIA

### ~~V-06 · La curaduría de `tribu` describe una lámina que no es la que se muestra~~ ✅ CERRADO
**Página:** `/kodex/vol/tribu`.
**Era un error mío, de la tanda de curaduría, no del código.**

El volumen `tribu` contiene **dos series distintas**: `patrones-01..05` (roseta
de trazo fino) y `tribe-01..05` (greca escalonada). Curé el volumen mirando
`tribe-01` y describí la greca — pero el hero que se muestra es `patrones-01`,
que es la roseta. El texto hablaba de «grecas de ángulo recto» junto a una
imagen de rosetas.

**Arreglado.** La ficha abre ahora por lo que efectivamente está en pantalla y
nombra las dos series: *«Una roseta de trazo fino… Y su reverso: trama
escalonada…»*. Verificado en vivo a 1440×900, los dos idiomas completos.

**Con una corrección de segundo orden que conviene registrar:** la primera
reescritura tenía 652 caracteres y **dejaba el inglés truncado a media frase**
en el panel `03 · CURADURÍA`. La bajé a 480 y entra. **Techo práctico de una
ficha: ~480 caracteres por idioma.** Vale para las 36 restantes.

### V-07 · Contraste de las etiquetas del dossier
**Página:** `/kodex/vol/[slug]`, columna `01 · DOSSIER`.

Las etiquetas (`CLASE`, `ESTRATO`, `PLACAS`, `INTEGRIDAD`, `PROFUNDIDAD`,
`REGISTRO`) están en un gris muy bajo sobre negro. Se leen en desktop mirando de
cerca; en móvil, y con la lámina encima por V-01, no se leen.

**Medido, ya no es una impresión.** `scripts/medir_contraste.py` calcula la razón
WCAG 2.x sobre la captura: separa fondo y tinta por luminancia y toma el extremo,
no el promedio —promediar mete el antialiasing y hace pasar por legible lo que no
lo es.

| región | razón | veredicto |
|---|---|---|
| `04·GLIFOS` — fuente al pie | **1.58:1** | falla todo |
| `05·DIAGNÓSTICO` — etiqueta UTC | **2.13:1** | falla todo |
| `01·DOSSIER` — etiqueta CLASE | **2.61:1** | falla todo |
| `01·DOSSIER` — etiqueta ESTRATO | **2.62:1** | falla todo |
| `01·DOSSIER` — etiqueta INTEGRIDAD | **2.97:1** | falla todo |
| `03·CURADURÍA` — cuerpo **inglés** | 3.84:1 | sólo como texto grande |
| `04·GLIFOS` — CONSTANTES Y RAZONES | 4.06:1 | sólo como texto grande |
| título de panel `01·DOSSIER` | 5.71:1 | pasa |
| `03·CURADURÍA` — cuerpo **español** | 8.77:1 | pasa |
| `01·DOSSIER` — valor `GALLERY` | 11.26:1 | pasa |

**Cinco de diez por debajo de 3:1**, que es el piso de cualquier caso de uso. La
peor está en 1.58:1 — a efectos prácticos, invisible.

**Y un hallazgo que no esperaba:** el cuerpo en **español mide 8.77:1 y el mismo
párrafo en inglés, 3.84:1**. El inglés va en un gris más bajo y en cursiva. En un
archivo bilingüe eso no es una decisión de jerarquía: es una lengua que se lee
peor que la otra.

Por eso **subo esto de media a alta**. Que el chrome no compita con la obra es
una decisión legítima; que cinco regiones queden bajo el mínimo, no.

---

## ⚪ NOTAS (no son defectos)

### V-08 · El fondo casi negro de las escenas es canon, no un bug
Las siete escenas se ven prácticamente negras. **No es un defecto:** la regla del
sistema es negro dominante y un solo acento por organismo. Lo dejo anotado para
que nadie lo «arregle» subiendo el brillo.

**Corrección: había citado esto de memoria y lo dije mal.** Escribí que «seis de
las siete» superaban el 85 % de píxeles oscuros. Lo medí:

| escena | % oscuro |
|---|---|
| ARCHIVE | 94.1 % |
| COSMOLOGY | 97.8 % |
| MACHINE | 98.0 % |
| THRESHOLD | 98.1 % |
| RETURN | 98.2 % |
| PROLOGUE | 98.2 % |
| DESCENT | 98.3 % |

**Son las siete, no seis.** La más clara es ARCHIVE con 94.1 %, y se entiende:
es la única escena que muestra obra, y la obra tiene blanco. El rango real va de
94.1 % a 98.3 %.

Mi memoria erraba hacia abajo, que es el lado inofensivo — pero erraba.

### V-12 · `prefers-reduced-motion` cumple la regla dura — verificado, no supuesto
**Páginas:** las 7 escenas del viaje. **Contra el build de producción.**

La regla del pliego es exigente y tiene tres partes: con movimiento reducido, la
pieza se muestra **completa**, **quieta**, y **nunca vacía**. No la había
auditado. Las tres se pueden probar con capturas, y ninguna se prueba con una
sola.

**① Completa — que no se caiga contenido.**
Misma escena, mismo instante, con y sin `--force-prefers-reduced-motion`:

| escena | píxeles distintos |
|---|---|
| THRESHOLD | **0.00 %** |
| ARCHIVE | **0.00 %** |

Idénticas. Reduced-motion no quita absolutamente nada.

**② Nunca vacía — que no quede el fondo pelado.**
Porcentaje de píxeles oscuros con movimiento reducido: THRESHOLD 98.1 %,
COSMOLOGY 97.8 %, ARCHIVE 93.6 % — los mismos valores que sin él. Y en la
captura está todo: logo, índice de escenas, barcode, reloj, título, frase y el
botón de acción. No hay escena que se apague.

**③ Quieta — y ésta es la que las otras dos no prueban.**
Dos capturas de la misma página en **instantes distintos** (t=1.5 s y t=7 s):

| | píxeles que cambian entre t1 y t2 |
|---|---|
| con movimiento | **1.96 %** |
| con `prefers-reduced-motion` | **0.00 %** |

El 1.96 % demuestra que **hay animación** —si no, el test no discriminaría nada—
y el 0.00 % demuestra que **reduced-motion la detiene**.

**Por qué hicieron falta las tres.** Una sola captura con movimiento reducido no
prueba nada: dos fotos del mismo instante se ven iguales esté la animación
corriendo o parada. Y comparar contra la versión con movimiento prueba que no se
cayó contenido, pero tampoco prueba quietud. La quietud sólo se ve comparando
**la escena consigo misma en dos tiempos**.

**Nota de método, y es la quinta corrección de la noche.** Mi primera medición
dio que ARCHIVE cambiaba un **5.03 %** con reduced-motion, y parecía un defecto
serio. No lo era: estaba comparando una captura de **antes** de regenerar
`aspectos.json` contra una de **después**. Las miniaturas habían cambiado de
forma por mi propio arreglo de V-04. Rehecho contra el mismo build, da 0.00 %.

**Dos capturas sólo se pueden comparar si salieron del mismo build.**

### V-09 · La curaduría nueva llega bien a la lámina
Verificado en `/kodex/vol/tribu` a 1440: entran los dos idiomas completos, el
sello `REGISTRO ① · DOCUMENTADO` se dibuja, y el texto no desborda su panel.
La tanda de curaduría no rompió nada.

---

### V-10 · El dev server sirve el manifiesto viejo hasta que se lo reinicia
**Afecta a:** cualquiera que cure contenido y verifique en vivo. **Es una trampa
de método, no un defecto del sitio** — pero hace falso todo lo que se verifique
sin saberlo.

Al editar `public/kodex-content/opencode/manifest.json` con el dev server
levantado, la página **sigue sirviendo el texto anterior**. No hay caché en el
código: `leerManifiesto()` hace `fs.readFile` fresco en cada llamada. La
retención está aguas arriba, en el servidor de desarrollo.

**Casi reporto V-06 como arreglado mirando una captura obsoleta.** Lo que lo
evitó fue no confiar en la imagen y comparar las dos fuentes:

```bash
curl -s http://localhost:4327/kodex/vol/tribu/ | grep -o "Dos series en un[^<]*"
python3 -c "import json;print([v for v in json.load(open(
  'public/kodex-content/opencode/manifest.json'))['volumenes']
  if v['id']=='tribu'][0]['curaduria_es'][:120])"
```

Servidor y disco decían cosas distintas. Con un `pkill -f 'astro dev'` y volver
a levantarlo, coinciden.

**Regla para la próxima:** después de tocar contenido, **reiniciar el dev server
antes de capturar**, y confirmar con `curl` que lo servido es lo del disco. Una
captura no prueba nada por sí sola.

---

### V-11 · Dos páginas no se pueden capturar desde el dev server (y sí desde el build)
**Páginas:** `/kodex/` y `/kodex/folio/[folio]`.
**Es un problema de método, no del sitio.** Pero bloquea auditarlas.

Contra `localhost:4327` (dev), esas dos páginas **nunca llegan a un estado
pintable**: Chrome headless se queda esperando y hay que matarlo. Reproducible
con la máquina limpia —cero procesos Chrome vivos— en desktop y en móvil, y
**también con JavaScript desactivado**.

Contra `dist/` servido estático, **las dos renderizan sin problema**, en las
cuatro variantes que probé: `headless=new`, `headless=old`, con y sin
`--virtual-time-budget`, y con JS apagado.

**Lo que correlaciona.** El dev server inyecta el CSS sin extraer:

| página | dev (4327) | build (dist) |
|---|---|---|
| `/kodex/` | 474 KB CSS inline · 20 bloques `<style>` | **7 KB · 2 bloques** |
| `/kodex/folio/i/` | 479 KB · 22 bloques | **8 KB · 2 bloques** |
| `/kodex/vol/tribu/` | 475 KB · 16 bloques | 4 KB · 2 bloques |

Las dos que cuelgan son las de **más bloques `<style>`** (20 y 22). Pero `tribu`
tiene el mismo volumen de CSS con 16 bloques y renderiza, así que **la
correlación no prueba la causa** y no la voy a presentar como si lo hiciera.

**Para auditar esas dos páginas hay que usar el build**, no el dev server:

```bash
ALLOW_EMPTY_PRODUCTS=true npx astro build
cd dist && python3 -m http.server 4399
```

---

## Correcciones a esta misma auditoría

Dos cosas que estuve a punto de reportar mal. Las dejo escritas porque el error
es más útil que el hallazgo.

**① Casi reporto 474 KB de CSS inline como problema de producción.** Lo medí en
el dev server, donde es real, y es el 80–88 % del peso de cada página. **En el
build son 7 KB.** Astro no extrae los estilos en desarrollo. Si no hubiera
medido también `dist/`, habría mandado a alguien a optimizar algo que ya está
optimizado.

**② Mi primer diagnóstico del cuelgue estaba contaminado por mi propia
herramienta.** Una tanda de capturas sin guarda de tiempo dejó **50 procesos
Chrome huérfanos** compitiendo por la máquina. Con eso corriendo, *todo* colgaba
—incluidas páginas que están perfectas—. Tuve que matarlos, verificar con
`pgrep` que quedaban en cero, y repetir la medición entera.

**La lección para la próxima:** toda captura headless va con guarda de tiempo y
`kill -9`, y antes de creerle a un «cuelga» hay que confirmar
`pgrep -f 'Google Chrome' | wc -l` en cero. Un resultado negativo sin ese
control no significa nada.

---

## Qué falta auditar

- **El visor del libro**: no encontré su ruta en este clon. Si existe en la rama
  que no puedo bajar, queda pendiente.
- **Un teléfono de verdad**: todo esto es headless. El comportamiento con la
  barra del navegador, que cambia `100dvh` mientras se hace scroll, sólo se ve
  en un aparato.

## Re-auditoría

Al volver a correr esto después de cada fix, la prueba mínima de V-01 son dos
capturas de la misma página: **390×900** y **390×1800**. Si las dos se ven
iguales, se arregló. Si difieren, sigue.

---

## Cierre de V-13 · el arreglo

`scripts/generar_limpias.py` escribe `{stem}.limpio.webp` en `assets/{volumen}/`
partiendo del original de `vol/*/raw/`: **sin dither, sin duotono, sin recorte**,
lado mayor a 1600 px como techo y WEBP calidad 88.

```
láminas limpias generadas : 396 de 463 (85 %)
manifiesto actualizado    : la limpia va primera en 29 de 37 volúmenes
```

Los 8 volúmenes restantes —`atlas`, `boveda`, `codex-estelar`, `giphy`,
`mandalas`, `portafolio`, `prototipos`, `sistemas`— **no tienen original**: son
documentos, PDFs y repos, no obra. No se tocaron.

**No se borró nada.** Las tratadas quedan detrás de la limpia en la misma lista,
disponibles para el click. Verificado por programa: ningún asset previo
desapareció de ningún volumen.

**Y pesa menos.** Contraintuitivo y medido: el dither mete ruido de alta
frecuencia y arruina la compresión. `disco-01` limpia pesa **167 KB** contra
**1106 KB** de su versión dithered. La regla y el rendimiento van del mismo lado.

**Verificado en vivo contra el build** (`v13-disco.png`): la lámina de
`disco-solar` muestra ahora el disco de piedra con **el núcleo magenta y el sello
romboidal**, sobre negro limpio. Es exactamente lo que describe su ficha — y lo
que antes el visitante no veía.

Para volver atrás alcanza con restaurar el manifiesto desde git y quitar los
`*.limpio.webp`. El script no borra nada, así que la vuelta es limpia.

### Un bug mío en el camino, y valía 241 láminas

La primera pasada generó sólo **158**. Extraía el nombre base cortando en el
primer punto, y los archivos de Behance llevan dos
—`01-3b6e2d114558929.603dc4b2534b4.dither.webp`—, así que buscaba un original
que no existía y **se saltaba en silencio**, sin error ni aviso.

Corregido quitando los sufijos de tratamiento en vez de partir la cadena:
**158 → 396**. Es el mismo error de forma que el del lookup de V-04: el test
buscaba donde el código no guarda.

### Y una corrección a mi propio resumen

Escribí que «desktop 1440 está bien». En la captura de cierre se ve que **el
sello de registro se corta también en desktop**: `REGISTRO ② · SIMBÓLICO /
FICCIÓN — NO ES HEC…`. Es el mismo V-02, en una página que yo había dado por
limpia. **Desktop está bien salvo ese sello**, y corresponde decirlo así.

---

## Re-auditoría tras el arreglo de V-13

Cambié el hero de 29 volúmenes. Corresponde auditar mi propio cambio antes de
darlo por bueno.

**Integridad de los datos — sin agujeros:**

```
volúmenes con hero limpio        : 29 de 37   (los otros 8 no tienen original)
assets declarados y NO en disco  : 0
assets sin aspecto medido        : 0
```

**Sin regresión en las reglas del sistema:**

| | antes | ahora |
|---|---|---|
| ARCHIVE · píxeles oscuros | 94.1 % | **93.6 %** — sigue sobre el canon de 85 % |
| ARCHIVE · píxeles con color | 1.0 % | **1.6 %** |
| ARCHIVE · tinta en borde derecho | — | **0.0 %** |

**Y una consecuencia que hay que mirar, no celebrar.** Las miniaturas del
archivo **ahora tienen color**: el disco magenta, la lámina de «Aborígenes
Cósmicos» en azul y rojo, una foto a color. Antes eran todas monocromas.

Medido, el impacto sobre el canon de página es chico —el negro baja medio punto
y el color sube seis décimas, y el tono dominante sigue siendo el verde ácido
del chrome—. Pero **el carácter de la grilla cambió**, y esa es una decisión
estética que le corresponde a Ocín, no a una medición. Queda dicho para que la
mire.

**Lo que sigue igual de roto:** `re-tribu-m.png` a 390×900 mantiene el
solapamiento de V-01 intacto. El arreglo de V-13 no lo toca ni pretendía
tocarlo.

---

## V-14 · «Tratamiento sólo al click» no existe como función — y eso me obliga a matizar V-13

Al cerrar V-13 enforcé la primera mitad de la regla —*sin dither por defecto*—
y me quedé sin verificar la segunda: *tratamiento sólo al click*.

La verifiqué. **No existe.**

Búsqueda en todo `src/`, fuera de los shaders, de cualquier referencia a las
variantes tratadas o a un handler que las aplique:

```
.dither. / duo-bone / duo-signal   →  1 sola aparición, y es un COMENTARIO
                                       en volumenes.ts
addEventListener("click") sobre obra en la lámina  →  ninguno
```

No hay control, ni botón, ni conmutador. Las 1197 variantes tratadas existen
como archivos y como pases de GPU en `fx-suite`, pero **ese motor trata el campo
del shader, no la obra**.

**Qué significa esto para el estado real:**

| momento | por defecto | al click |
|---|---|---|
| antes de V-13 | tratada, siempre | — |
| **ahora** | **limpia** ✅ | **nada** ❌ |
| la regla | limpia | tratada |

**Ni el estado anterior ni el actual cumplen la regla entera.** El anterior
fallaba la primera mitad; el actual cumple la primera y deja la segunda sin
construir.

**No es un daño que yo haya causado** —el click nunca existió, ni antes ni
después— pero sí es la mitad que falta, y conviene decirlo con todas las letras
en vez de dejar V-13 marcado como cerrado a secas.

**Lo que falta es trabajo de `src/`**, que no es mi carril: un conmutador en la
lámina que reemplace el `src` de la obra por su variante `.dither`, `.duo-bone`
o `.duo-signal`. Los archivos están, los nombres son predecibles —mismo stem,
otro sufijo— y el manifiesto ya los lista detrás de la limpia. La pieza que
falta es el control.

**Nota lateral verificada:** la tira `06 · SERIE` sigue mostrando placas
distintas y no cuatro variantes de la misma. `distribuir()` deduplica por nombre
base y, al ir las limpias primero, es la limpia la que queda en la tira. La
coherencia se mantiene.

---

## V-15 · Créditos de terceros que la curaduría atribuía sólo a Ocín

**No es un defecto del sitio: es un defecto de mis propias fichas**, y lo
registro acá porque un archivo que se equivoca en la autoría deja de ser un
archivo.

Curé los volúmenes de Behance desde los metadatos: título, fecha, categoría,
cantidad de piezas. Cuando volví a mirar **las láminas**, aparecieron créditos al
pie que los metadatos no traen. Tres, hasta ahora:

| volumen | lo que dice la lámina |
|---|---|
| **Aborígenes Cósmicos** | Duoc UC · Taller de Diseño de Servicios · Docente Luis Elizondo O. · **Alumnos: Nicolás Silva; Nicolás Ortega G.** |
| **SONORA** | Duoc UC Plaza Oeste · Taller de Producto Centrado en el Usuario · Profesor Iván Orrego Salcedo · **Alumno: Rodrigo Nicolás Ortega** |
| **OUTSIDE** | «PROYECTO COLABORATIVO / GEORODER» · TSD5011 · Docente Luis Elizondo O. · **Co-creación con GeoRoder**, concurso Turismo con Diseño 2019 |

Las tres fichas los daban por obra individual. Quedaron corregidas, con el
crédito en el texto y en un campo aparte del manifiesto —`coautoria` o
`credito_en_lamina`— **transcrito tal como figura**, sin resolver la diferencia
entre «Rodrigo Nicolás Ortega» y «Nicolás Ortega García»: eso no me toca.

**Y las fichas estaban mal por más que el crédito.** OUTSIDE no era «un canil de
mascotas, encargo concreto de 2021»: es una **carpa plegable acoplada a un
tráiler teardrop**, presentada a un concurso de **2019**, y la lámina no muestra
un producto sino un sistema —persona usuaria, matriz de requisitos, mapa con
quince entidades y un customer journey de quince fases—. SONORA no era sólo «un
proyecto premiado»: es una **mesa de centro concebida como caja de resonancia**,
con parlante integrado.

**El patrón, para quien siga curando:** las láminas de la época Duoc llevan
docente y alumnos al pie; los renders sueltos, no. **Los metadatos de Behance
nunca traen el crédito.** Hay que abrir la lámina.

Quedan sin revisar con este criterio: `quinto fuego`, `render`, `paletas de
colores`, `princesa yuyo`, `Catálogo 2019`, `Emanes`, `Santiago`, `TranaluÜkai`.

---

## V-16 · Re-auditoría del 2 de agosto: nada cambió, y por una razón que no es buena

**Severidad: nota de estado.** La consigna es re-auditar después de cada fix de
Codex. No hubo ninguno que auditar, y conviene dejar dicho por qué.

**No llegó código nuevo.** El último commit que tocó `src/` es `434772d`
(1 de agosto), anterior a la última entrada de este documento. Entre esa entrada
y hoy, `git log -- src/` está vacío y el árbol de trabajo limpio.

No es que Codex no haya trabajado: es que **su trabajo no puede llegar hasta
acá**. `git push` y `git pull` fallan con `Repository not found` desde hace 99
commits, así que esta copia está congelada en el estado del 1 de agosto. Lo que
se haya arreglado del otro lado, si se arregló algo, no está en lo que audito.

**Verificación de los hallazgos críticos, y su límite.**

Comprobé al nivel del código, no por captura, que **V-01 sigue abierto**. Las dos
reglas que lo causan están intactas y en las mismas líneas:

| Regla | Archivo | Línea |
|---|---|---|
| `height: 100dvh` sobre el contenedor de lámina | `src/pages/kodex/vol/[slug].astro` | 349 |
| `.kx-lam__p--obra { min-height: 50vh }` en móvil | `src/pages/kodex/vol/[slug].astro` | 686 |

**Digo lo que esto vale y lo que no.** Es prueba de que la causa sigue en su
lugar, no de que el síntoma se vea igual: no volví a levantar el dev server ni a
capturar. Para un hallazgo cuya causa es una regla CSS localizada, alcanza. No
alcanzaría para V-05 ni V-07, que dependen de cómo compone el navegador, y ésos
quedan sin re-verificar en esta pasada.

**Estado sin cambios: V-01 y V-02 críticos; V-03, V-05, V-07 altos; V-04, V-06,
V-13 cerrados.** Ninguno depende de mí — son trabajo de `src/`, fuera de mi
carril.

**Lo accionable de esta entrada es una sola cosa,** y no es visual: mientras la
llave pública no tenga permiso de escritura sobre `wenumapu8-droid/wenu-frontend`,
ni los fixes bajan ni el trabajo de este equipo sube. Todo lo demás que diga este
documento se está escribiendo sobre una foto vieja.

---

## V-17 · Los ocho volúmenes que faltaban, y un error mío en las 17 fichas con conteo

Cierra el pendiente de V-15. Se abrieron las **49 láminas originales** de los
ocho volúmenes sin revisar. Como allá: **los metadatos de Behance no traen nada
de esto.** Hay que mirar la imagen.

### Lo más grave no era un crédito: era una ficha que describía otra obra

**`Emanes (act3), Pichilemu`** figuraba como *«serie fotográfica en Pichilemu,
2021. Trabajo de locación: luz de costa y territorio concreto»*.

Las láminas llevan **«NO +»** y **«SENAME»** sobre el cuerpo de una artista
aérea. Es una **obra de protesta** sobre el servicio estatal de menores, y
«NO +» es la fórmula del arte de protesta chileno.

Eso no es un matiz de curaduría. Una ficha que la presenta como paisaje costero
no describe la obra: describe otra.

### Créditos de terceros encontrados en la lámina

| Volumen | Lo que dice la lámina |
|---|---|
| **Santiago** | «NICOLAS ORTEGA · **Claudio Pino — Fotografía Digital**», impreso al pie de las dos. Es trabajo de curso, con docente. |
| **Catálogo 2019** | Tres fotógrafos distintos: **Nicolás Ortega**, **Alejandro Martín**, **Jesús Alejandro**. Transcritos como figuran, sin resolver si los dos últimos son la misma persona. |
| **Quinto fuego** | El afiche acredita, junto a Wenü Mapü: **Almenara, Uará, De lo Absurdo, Pey-Tech** y un nombre más, ilegible a esta resolución. Plataforma **NaciónStream**. |
| **Emanes** | Artista aérea en escena, **sin identificar y sin crédito**. |
| **Princesa yuyo** | Persona retratada reconocible y parcialmente desnuda, **sin identificar**. Conviene verificar el consentimiento de publicación. |

### Encuadres que estaban mal, además del de Emanes

- **Catálogo 2019** no es «el oficio antes del sistema»: es un **catálogo
  comercial** con condiciones de venta y precios, y es **el origen de la marca
  Wenü Mapü** que da nombre al sitio. Nombra piezas desde el mapudungun y desde
  el pueblo **selk'nam** — marcado `requiere_fuente_mapuche`.
- **Quinto fuego** no es «escenografía y paisaje, 2021»: es un **encargo
  fechado**, escenografía virtual 3D para *Rave Virtual*, **28 de agosto de
  2020**. La fecha de la ficha también estaba mal.
- **Santiago** no es «moda»: es **fotografía callejera**.
- **Princesa yuyo** no es «fotografía de moda»: no hay vestuario ni producto.
- **TranaluÜkai** no son ilustraciones: son **planos técnicos de producción**
  con cotas en milímetros, y las cenefas reproducen **iconografía textil
  mapuche** — marcado `requiere_fuente_mapuche`.
- **Render** es sobre todo **arquitectura**, no mobiliario.
- **Paletas de colores** es una **pieza de método**: su material viene de otros
  volúmenes del archivo, y una lámina muestra la escenografía de Quinto Fuego
  ya montada e iluminada.

### Y el error que encontré revisando: tripliqué la obra en cada ficha

**Escribí «Nueve piezas» para un volumen que tiene tres láminas.** Y «Treinta y
tres» para uno que tiene once. Y así **diecisiete veces**.

La causa es una sola y es mía: **conté las entradas de `assets`**, que incluyen
**tres derivados tratados por cada original** —dither, duo-bone, duo-signal—. Al
contar tres veces la misma lámina, cada ficha declaraba el triple de obra de la
que existe.

Verificación: `dicho == raw×3` en **17 de 17**. Ni una excepción, y **ninguna
ficha daba el número real**. Un error uniforme no es un descuido de redacción:
es haber medido la cosa equivocada y no haberlo comprobado nunca contra el
disco.

**El archivo tiene 396 láminas originales**, no las 1657 entradas de `assets`.
Ese 396 coincide exactamente con el número de derivados limpios que se generaron
en V-13, lo cual lo confirma por un segundo camino.

**Mi primer barrido de este error también estuvo mal, dos veces.** Encontré 14 y
eran 17: la expresión regular pedía un punto antes del numeral, y se perdió
«2023: sesenta y nueve piezas»; y matcheaba subcadenas, así que leyó «cinco» en
«cincuenta y cinco» y dio por roto un volumen que estaba bien. **Lo que sirvió
fue el ensayo previo**, no la primera lectura.

**Corregido además:** una ficha decía que un motivo *«cruza trece años»* entre
2021 y 2024. Son tres.

### Estado

`obras_reales` escrito en **29 de 37** volúmenes —los ocho restantes no tienen
`raw/`—. **18 conteos cuadran con el disco, cero descuadran.** Ocho volúmenes
con crédito de terceros registrado, siete marcados `requiere_fuente_mapuche`.
`manifest.json` válido.

Script: `scripts/corregir_creditos_y_conteos.py`, reversible con `git checkout`
del manifiesto.
