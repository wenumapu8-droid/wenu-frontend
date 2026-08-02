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
| 🔴 crítica | 2 |
| 🟠 alta | 3 · +1 (V-07 subió) · −1 cerrado (V-04) |
| 🟡 media | 0 · +2 cerrados |
| ⚪ nota | 4 |

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
- **Medición real de contraste** (V-07): a ojo no alcanza.
- **Un teléfono de verdad**: todo esto es headless. El comportamiento con la
  barra del navegador, que cambia `100dvh` mientras se hace scroll, sólo se ve
  en un aparato.

## Re-auditoría

Al volver a correr esto después de cada fix, la prueba mínima de V-01 son dos
capturas de la misma página: **390×900** y **390×1800**. Si las dos se ven
iguales, se arregló. Si difieren, sigue.
