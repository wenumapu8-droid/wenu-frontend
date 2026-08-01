---
tipo: auditoría visual
proyecto: KODEX −∞
fecha: 2026-08-01
auditor: Mac Mini (read-only — no se tocó `src/`)
método: Chrome headless contra `localhost:4327`, desktop 1440×900 y móvil 390×844
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
| 🟠 alta | 3 |
| 🟡 media | 1 · +1 cerrado |
| ⚪ nota | 3 |

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

---

## 🟠 ALTA

### V-03 · La barra inferior aparece cortada en TODAS las páginas
**Páginas:** todas, desktop y móvil.

Hay un elemento centrado abajo —parece una barra de controles con íconos— que
en 900 px de alto queda **cortado por el borde inferior del viewport**: se ve su
mitad superior. Ocurre igual en 1440×900 y en 390×844, o sea que no es un
problema de responsive sino de posición.

**Capturas:** cualquiera. Se ve claro en `vj-archive-d.png` y `works-m.png`.

### V-04 · La obra no se ve completa en la grilla de specimens
**Página:** `/kodex/viaje#archive`.

Los specimens se muestran con recorte al cuadrado. En el archivo hay piezas
verticales 9:16 y apaisadas, y al forzarlas a una caja casi cuadrada **se les
corta contenido**. La regla del proyecto es que la obra de Ocín se ve completa.

Conviene revisar si el `aspect-ratio` que se le pasa a cada `li` coincide con el
real de la pieza, porque el efecto es exactamente el de un `object-fit: cover`
sobre una caja de proporción equivocada.

**Captura:** `vj-archive-d.png` (miniaturas 6, 7 y 8).

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

No lo marco más alto porque es deliberado —el chrome no compite con la obra— pero
conviene medir el contraste real contra el fondo antes de darlo por bueno.

---

## ⚪ NOTAS (no son defectos)

### V-08 · El fondo casi negro de las escenas es canon, no un bug
Las siete escenas se ven prácticamente negras. **No lo reporto como defecto:** la
regla del sistema es negro dominante y un solo acento por organismo, y ya estaba
verificado que seis de las siete superan el 85 % de píxeles oscuros. Lo dejo
anotado para que nadie lo «arregle» subiendo el brillo.

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
