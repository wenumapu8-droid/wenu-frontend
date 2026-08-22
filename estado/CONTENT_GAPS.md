# CONTENT_GAPS · lo que sólo puede decidir un humano

**Mantenido a mano.** Los otros tres archivos de `estado/` se generan con
`node scripts/kodex/estado-circuito.mjs`; éste no, porque lo que lista no se
puede medir: son decisiones.

Regla: si algo acá se puede contestar leyendo el repositorio, no va acá — va al
generador. Y **nada de esto se inventa para que la demo funcione.** Un hueco
marcado es mejor que un relleno plausible.

---

## 1 · DECISIONES ESPERANDO A OCÍN

### 1.1 · Obra por escena — BLOQUEA que las siete se distingan
`imac-kimi` propuso una asignación con evidencia; está en
`~/wenu-frontend/kodex-propuesta-imagenes-2026-08-22.md` (iMac).

| escena | propuesta | por qué |
|---|---|---|
| THRESHOLD | `arch-04` | dos simetrías que no se funden |
| PROLOGUE | `arch-21` | la escena dice «el archivo te observa», literal |
| DESCENT | `bw-06` | **ya se llama «DESCENT» en `kodexBook.js`** — el sistema ya lo sabía |
| ARCHIVE | `arch-01` | se mantiene, ya estaba bien |
| MACHINE | `conjuncion.jpg` | maquinaria ilustrada, no se parece a ninguna otra |
| COSMOLOGY | `disco-05` | disco con red de nodos real, en color |
| RETURN | `mandala-0cin-negativo` | hoy mal puesta en THRESHOLD por `presets.ts` |

**Obstáculo técnico que aparece si se aprueba:** `asset-registry.json` declara
`allowedScenes:['archive']` para `arch-04` y `arch-21`. Hay que ampliar esa
restricción, no saltársela.

### 1.2 · Paleta y sonido por escena
La matriz E del plan propone color y sonido para los siete. Salen del genoma
visual y de las recetas existentes, pero **son propuesta, no canon.** No se
canonizan sin tu palabra.

### 1.3 · Las tres ramas de HoloCore
`registry-v1`, `renderer-adapters-v0`, `prototype-v1`, de hace 8 días, con PR #67
cerrada sin fusionar. Catorce núcleos visuales escritos y con evidencia.
**Portar, archivar o cerrar** — con motivo, no en silencio. Es material tuyo.

---

## 2 · HUECOS DE CONTENIDO, no de código

- **Los 18 solapamientos de composición en las láminas** (`akashic-crown`,
  `gaia-sentinel`, `star-lattice`, `anatomical-star`, `void-orchard`) son
  decisiones de composición del creador, no defectos técnicos. Se reportan, no
  se tocan.
- **Nodos sin fuente declarada.** Del grafo de 513, hay que saber cuáles tienen
  `SOURCE_ID` real y cuáles no. Un nodo sin procedencia no puede ser afirmación:
  como mucho, pregunta.
- **Los cuatro últimos umbrales no tienen texto propio** más allá del titular y
  el pie. ARCHIVE, MACHINE, COSMOLOGY y RETURN necesitan su voz.
- **Tres portadas nunca descargables.** Medido y sin resolver.

---

## 3 · CONTRADICCIONES RESUELTAS — se dejan escritas para no repetirlas

### 3.1 · 08D / 08E / 08F — CERRADA
`imac-orquesta` los leyó completos hoy por la MCP de Drive, con `fileId`.
**Existen.** Lo que está desactualizado es el espejo local
`~/Trabajos-Aparte/KODEX/drive-docs/`, que sólo tiene A, B y C — y es lo que
miramos `mini-1-deploy` y `mini-2-shaders` antes de afirmar que no existían.

**Los dos nos equivocamos por mirar una copia vieja y darla por la realidad.**
Regla que queda: el espejo local no es la fuente. Si una decisión depende de un
documento de Drive, se lee de Drive o se pide el extracto.

### 3.2 · HoloCore — CERRADA
No es «especificado y no implementado». Es **implementación abandonada**:
PR #67 CLOSED DRAFT, 12 archivos, tres ramas vivas, `registry.js` de 11 KB y
scripts de evidencia en navegador. Va a la decisión 1.3.

---

## 3.3 · El índice del corredor es una lista de tarjetas — ABIERTA

Encontrado por `chatgpt-contenido` auditando el sitio en vivo, y verificado
abriéndolo: al pulsar INDEX aparece una fila por escena con número, miniatura,
título, subtítulo y «ENTER →». Es literalmente «cards + menu», lo que el canon
rechaza por nombre.

**Matiz que importa para futuras auditorías:** los strings `SYSTEM INDEX` y
`command shell` están en el HTML de todas las páginas, pero medido en navegador
el panel es `display:none`, `hidden`, 0×0. No es cromo en pantalla: es un panel
bajo demanda. **Grepear el HTML no es auditar la experiencia** — el HTML tiene
todo lo que PUEDE mostrarse, no lo que se muestra. El hallazgo era correcto; el
camino para llegar, no.

Pendiente: convertirlo en constelación en vez de lista. Es trabajo de estructura
y necesita dirección del creador sobre qué debe SER el índice, no sólo cómo se
ve. Lo toma `mini-1-deploy`.

## 3.4 · 39 láminas existen, 36 se enlazan — ABIERTA

El índice afirmaba «27 láminas». Medido: 39 archivos en
`src/pages/kodex/lamina/` y 36 enlaces en la página publicada. El número estaba
escrito a mano, llegaron láminas nuevas y quedó mintiendo en producción.

Corregido: ahora lo cuenta `scripts/kodex/estado-circuito.mjs` y lo escribe en
`src/data/kodex-conteos.json`, que el índice importa. No puede volver a
desfasarse.

**Lo que queda abierto es la diferencia:** 3 láminas existen y no aparecen en el
listado. O están excluidas a propósito y hay que decir por qué, o se perdieron
del índice como pasó antes con el lote de Drive. Es material para
`chatgpt-contenido`.

## 4 · CÓMO SE USA ESTE ARCHIVO

- **Ocín / chatgpt-contenido** — contestan lo de la sección 1 y llenan la 2.
- **mini-1-deploy / mini-2-shaders** — no tocan la sección 1. Cuando una
  decisión se aprueba, la escriben en `decisiones_humanas` de
  `EXPERIENCE_REGISTRY.json`, que el generador conserva entre corridas.
- **imac-orquesta** — mantiene la sección 3 al día.

Lo que se aprueba deja de ser hueco y pasa a ser dato generado. Este archivo
tiene que encogerse con el tiempo; si crece, algo se está trabando.
