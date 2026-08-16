# KODEX · relevo del Mac mini — 14 de agosto de 2026

Escrito por claude-mini al agotar cuota. **Reemplaza a `ESTADO-2026-08-14.md`**, que
quedó desactualizado en varios puntos (marcaba como pendientes cosas ya hechas).

Todo lo que sigue está **commiteado y pusheado**. Nada vive sólo en disco.

---

## 0 · Dónde está el trabajo

| | |
|---|---|
| Rama | `wip/kimi-u10-commons-cabecera` en `wenu-frontend` |
| PR | **wenu-frontend#68** — DRAFT, base `feature/kodex-depth-engine` |
| Commits | 47 · 91+ archivos · sin merge, sin deploy |
| Preview | `kodex-preview.wenu-frontend.pages.dev/kodex/` |
| Tailnet | `100.76.126.118:4340/kodex/` — launchd, sobrevive reinicios |

Dos vistas de revisión, **fuera de `dist/` a propósito** (cada `npm run build` borra `dist/`):

```
100.76.126.118:4340/vistas/comparacion/   las 18 láminas, referencia | construido
100.76.126.118:4340/vistas/recorrido/     las 7 escenas, escritorio y móvil
```

Viven en `~/Trabajos-Aparte/KODEX/vistas/` y el servidor las expone bajo `/vistas/`.

---

## 1 · Lo que se arregló, por impacto

### El corredor estaba tapiado a la mitad

Las siete escenas existían y **tres eran inalcanzables caminando**. Los interludios
no llamaban a `initKx()`, así que el botón `NEXT` no tenía listener: se veía, se
clickeaba, y no pasaba nada. Sin un solo error de JS.

MACHINE, COSMOLOGY y RETURN quedaban fuera del recorrido **con toda la cadena de
`data-next-url` completa y correcta**. Nadie lo encontró antes porque nadie apretó
"siguiente" hasta el final.

Verificado después de punta a punta, en escritorio y en móvil, sobre el sitio
publicado, con cero desborde horizontal en las nueve pantallas.

### La métrica premiaba las láminas vacías

La referencia de u10 es **93,1 % fondo negro**. Consecuencia medida: **una lámina
completamente vacía difiere apenas 6,9 % de ella**, y la construida puntuaba 4,03 %
teniendo el 34 % de la tinta. Todo el rango de calidad del proyecto vivía en siete
puntos.

Por eso el calco de PNG ganaba: es la forma más eficiente de bajar ese número, y las
dos láminas mejor puntuadas del proyecto son exactamente eso.

`compare.mjs` ahora imprime **cobertura primero**, con veredicto. Estado real de las
18: **17 entre 73 % y 107 %.**

### u10-commons: 34 % → 78 %

Cuatro hallazgos, todos medidos:

1. **El campo estaba una escala entera por debajo** — 220 estrellas, y la trama de
   constelación a opacidad 0,08, bajo el umbral de tinta: no existía.
2. **El radio no se puede modelar.** La referencia tiene 13,3 % en el centro, *sube*
   a 27,5 % en r=40 y recién ahí baja: es una roseta, y cualquier decaimiento
   monótono tiene su máximo en el centro. Se sortea de los 28 anillos medidos.
3. **El núcleo era un borrón por una razón matemática.** La trama une pares vecinos,
   así que su tinta crece con la densidad **al cuadrado** mientras la de la
   referencia crece lineal: 82 % contra 28 %. Se corrige bajando estrellas, no
   enlaces — se probaron dos topes de grado y los dos hundieron la periferia de
   19,1 % a 6,8 %.
4. **La referencia es una roseta con estructura**: 9 anillos concéntricos medidos
   (r=78, 94, 146, 158, 170, 186, 198, 218, 290) y ~45 radios con separación mediana
   de 8°.

Además: la columna izquierda tenía **4 de 6 bloques** — faltaban enteros los dos
párrafos de prosa y los tres paneles estaban 335, 195 y 51 px arriba. Y los paneles
**subrayan, no encierran**: tres reglas de 132 px a opacidad 0,100, sin caja.

### Color

- **u09-source**: 74 px de color contra 3.560 de la referencia. Definía violeta pero
  con saturación 0,287, que nunca cruza el umbral. Al acento medido `#b07ecd`: 5.875.
- **u08-anomaly**: acento marrón `#dc7050` donde la referencia tiene coral `#ef968a`.
- **u06-memory**: la métrica lo marcó con 5× de color — **se miró y está bien**. No
  se tocó.

### El códice publicado

- **250 botones `DESCARGAR` apuntaban a 404.** De 255 referencias rotas quedan 5. Se
  comprueba contra el disco en tiempo de build, en los **dos** lugares que armaban el
  enlace por separado — arreglar sólo el primero no movía el número.
- **Cinco superposiciones de interfaz.** Ninguna página reservaba el lugar del
  disparador fijo del menú (`position:fixed`, siempre en `x 1326..1360`). El héroe
  del umbral perdía su margen (`h1` en `left=0`) y enterraba el botón
  `ENTER THE KODEX` bajo la barra.
- **El deploy que falló cuatro veces**: no era red ni carga. **No había credenciales
  de Cloudflare en el mini** y `deploy-kodex-preview.sh` hace `source .env || true`,
  así que seguía sin ellas y reventaba más tarde sin decir por qué.

---

## 2 · Lo que falta, en orden

### Se puede hacer sin vos

1. **u10 de 78 % a ~90 %**: los diagramas chicos sueltos del campo — la espiral de
   galaxia, los conjuntos de anillos, la forma de hongo.
2. **u02-threshold y u04-alphabet**: marcadas con más color del que corresponde
   (46 %→58 % y 16 %→29 % de píxeles vivos). Necesitan medir *dónde* sobra, como se
   hizo con u06 antes de decidir no tocarlo.
3. **u08**: el tono ya está, pero la cantidad de área coloreada sigue en la mitad
   (5.739 contra 13.850). Eso no es un valor, es qué elementos van coloreados.
4. **Regenerar las dos vistas** después de cada cambio. Es lo único que te permite
   ver cómo va.

### Necesita una decisión tuya o de Ocín

5. **Las anotaciones manuscritas de u10** — *"still becoming"*, *"Remembering is how
   we return light"*, *"TRUTH SOFTENS BETWEEN US"*, *"I came broken I leave whole"*.
   Están en tu letra. **No las inventé ni las aproximé.**
6. **Los dos calcos de PNG** (`t01-05`, `t01-07`): puntúan mejor que todas y pesan 13
   y 10 MB de SVG. La skill lo prohíbe por escrito. **No tocados.**
7. **La cita de Canio y Pozo 2015 renderizada como URL cruda.** Toca el registro
   documentado mapuche: esa regla dice que no se resuelve en silencio.
8. **Cuatro packs `.zip`** que nunca se subieron.
9. **`kodex-content/free/`** — 2.660 archivos, 213 MB — sin migrar a R2. El código es
   la misma línea que ya mueve `art/`. La subida es segura; el reenganche no.
10. **La serie `t02` entera (8 láminas) y el pliego `t00`** no están construidos. Es
    el trabajo caro de verdad.

---

## 3 · Métricas probadas y descartadas — no repetirlas

| | por qué falló |
|---|---|
| Diferencia promedio (`pct`) | no distingue una lámina terminada de una vacía |
| Conteo de glifos medianos | se contamina con la trama; y u06 tiene la mitad y se lee completa |
| Densidad por caja de panel | el campo mete tinta en la misma columna |
| Filas de texto con el campo encendido | ídem — hay que ocultar el canvas por CSS |
| Mi propio criterio visual | **corregido por medición seis veces en una noche** |

**La cobertura es la única que aguantó todas las verificaciones.**

### Técnicas que sí sirvieron

- **Ocultar el canvas por CSS** con Playwright (`canvas{display:none}`) para medir el
  SVG sin que el campo contamine.
- **Muestrear del perfil medido** en vez de modelar con una fórmula, cuando la forma
  real no es monótona.
- **Mirar la captura siempre.** Un 200 no dice que esté bien; tres veces esta noche
  un 200 mintió, incluido un listado de directorio de mi propio servidor de revisión.
- **Comprobar que la imagen cargó** antes de declararla rota (`loading="lazy"`).
- **Commitear el avance ANTES del siguiente experimento.** Perdí el salto a 72 % por
  hacer `git checkout --` sobre trabajo sin guardar.

---

## 4 · Trampas operativas encontradas

- **`npm run build` borra `dist/` entero.** Cualquier cosa que se genere ahí
  desaparece en el build siguiente. Por eso las vistas viven fuera.
- **Los números de PR colisionan entre los dos repos.** `wenu-frontend#58` no tiene
  nada que ver con `kodex-minus-infinity#58`. Escribir siempre el repo delante.
- **El alias `imac` del ssh config apunta a un nodo muerto.** De los cinco iMac del
  tailnet sólo `user1s-imac-4` (100.104.215.64) está vivo.
- **Drive no está montado en el mini.** Por eso este documento se copia a mano.
- **Varios agentes comparten la copia de trabajo del mini** y se cambian la rama
  entre ellos. Verificar `git rev-parse --abbrev-ref HEAD` antes de editar y antes de
  commitear.
- **El trabajo del iMac no queda en la bitácora de KODEX.** Desde el mini es
  invisible.

---

## 5 · El loop, construido y apagado

`scripts/lamina/loop/` está probado de punta a punta y **apagado a propósito**. Le
falta una línea (`AGENTE_CMD` en `loop.conf`) y la invocación de Kimi ya está anotada
ahí: `kimi -p` con el prompt por stdin.

**Antes de prenderlo, leer esto:** automatiza *producción*, y el cuello de botella
diagnosticado es *cierre*. Con ocho drafts abiertos, prenderlo toda la noche da doce.
Lo que serviría es apuntar la misma máquina al cierre — la cola acepta cualquier tipo
de ítem.
