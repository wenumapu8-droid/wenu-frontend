# LOTE C · Ledger de archivo — 2026-08-29

Este documento cierra el LOTE C del TELAR marcando explícitamente cada
lámina y lab como **VIVO**, **HUECO** o **ARCHIVO** (los tres únicos
estados de cierre que la tarea suprema permite).

Fuente del triaje: `~/kodex-relevo/LOTE-C-TRIAGE-2026-08-29.md` (62
items · 38 láminas + 24 labs). Cross-referencias verificadas contra el
atlas (`src/data/kodex-atlas.json`) y contra las escenas del corredor
(`src/pages/kodex/folio/[folio].astro` vía `LaminaOrganismo.astro`).

Los estados **AMBIGUA** del triaje **no cierran vuelta** — quedan
bloqueados hasta que el atlas los declare o el creador los archive. Se
listan al final para tenerlos a la vista.

---

## VIVO · 5 láminas ya montadas en el corredor

Están conectadas desde `LaminaOrganismo.astro` y aparecen dentro de su
escena del corredor.

| Ruta | Escena |
|------|--------|
| `src/pages/kodex/lamina/t01-02-observation-eye.astro`   | PROLOGUE |
| `src/pages/kodex/lamina/t01-03-descent-tunnel.astro`    | DESCENT |
| `src/pages/kodex/lamina/t01-04-archive-tree.astro`      | ARCHIVE |
| `src/pages/kodex/lamina/t01-06-ritual-device.astro`     | MACHINE |
| `src/pages/kodex/lamina/t01-07-cosmology-core.astro`    | COSMOLOGY |

---

## ARCHIVO · 24 labs — biblioteca, no corredor

Regla canónica del proyecto: `src/pages/kodex/lab/**` es **biblioteca de
laboratorio**, no escenas del corredor. Ningún lab entra al viaje. Se
mantienen como página noindex para inspección técnica y como memoria
de exploraciones. La memoria `project-kodex-ya-existe-2026-08-15`
declara literalmente: *"labs = biblioteca"*.

Batch de 24 archivos con la misma justificación:

- `src/pages/kodex/lab/altar.astro`
- `src/pages/kodex/lab/archive-evidence.astro`
- `src/pages/kodex/lab/archivo-cromo.astro`
- `src/pages/kodex/lab/command-shell.astro`
- `src/pages/kodex/lab/crystal-receiver.astro`
- `src/pages/kodex/lab/deep-navigation.astro`
- `src/pages/kodex/lab/effect-foundry/`
- `src/pages/kodex/lab/geometric-memory.astro`
- `src/pages/kodex/lab/golden-plates/`
- `src/pages/kodex/lab/heart-chamber/`
- `src/pages/kodex/lab/heart.astro`
- `src/pages/kodex/lab/interaction-v0/`
- `src/pages/kodex/lab/manifestation-recipe.astro`
- `src/pages/kodex/lab/observe-v2.astro`
- `src/pages/kodex/lab/ocin-authorial/`
- `src/pages/kodex/lab/organism-engine.astro`
- `src/pages/kodex/lab/scene-registry.astro`
- `src/pages/kodex/lab/semantic-ir/`
- `src/pages/kodex/lab/semantic-wheel.astro`
- `src/pages/kodex/lab/signal-vortex.astro`
- `src/pages/kodex/lab/temple.astro`
- `src/pages/kodex/lab/threshold-fidelity/`
- `src/pages/kodex/lab/v0-readiness.astro`
- `src/pages/kodex/lab/visible-assembly/`

---

## ARCHIVO candidato · 8 láminas experimentales

Estas 8 láminas no aparecen en `LaminaOrganismo` ni tienen entrada en el
atlas, y sus nombres o comentarios las marcan como estudios previos
(`pend-*`), variantes (`t01-06-izq-solo`, `t01-05-specimen-skull`), o
piezas de una serie que no entró al corredor (`u05..u10`, `teorema-del-retorno`).

**Requieren aprobación explícita del creador antes de contarlas como
vueltas cerradas** — a diferencia del batch de labs, aquí la regla no
es canónica sino inferida del contexto.

| Ruta | Contexto |
|------|----------|
| `src/pages/kodex/lamina/pend-20.astro`                | prefijo `pend-*` = pendiente/experimental |
| `src/pages/kodex/lamina/pend-01.astro`                | ídem — aparece en la memoria de overflow mobile como referencia técnica |
| `src/pages/kodex/lamina/t01-05-specimen-skull.astro`  | variante que no entró al corredor |
| `src/pages/kodex/lamina/t01-06-izq-solo.astro`        | descomposición del t01-06 principal (ritual-device) |
| `src/pages/kodex/lamina/teorema-del-retorno.astro`    | estudio autoral sin cableado al atlas |
| `src/pages/kodex/lamina/u05-genesis.astro`            | serie UNIVERSE GATE, no catalogada en el atlas |
| `src/pages/kodex/lamina/u06-memory.astro`             | ídem |
| `src/pages/kodex/lamina/u08-anomaly.astro`            | ídem |
| `src/pages/kodex/lamina/u10-commons.astro`            | ídem |

---

## AMBIGUA · 25 láminas — bloqueadas en curación del atlas

Existen como piezas visuales pero **no tienen entrada en el atlas
(`kodex-atlas.json`)**. Mencionan escenas del corredor en su copy o
código pero el atlas no las declara como nodos, y por regla dura del
proyecto **no se les asigna escena por parecido** (`escenas: [] = curaduría
pendiente, NO inferir`).

Estas 25 no cierran vuelta y quedan pendientes de decisión del creador.
Cada una tiene una salida posible entre las siguientes:

- **A)** Crear un nodo `KDX-IMG-XXX` en el atlas con `escenas` explícitas.
- **B)** Reclasificar como *chamber* especial (`KDX-CH-*`) — aplicable
  a piezas que no encajan en el corredor pero en cámaras (HEART,
  OBSERVER, SILENCE).
- **C)** Declarar explícitamente ARCHIVO (por ejemplo si es estudio
  previo o pieza retirada).

**Agrupadas por escenas que mencionan** (para batch-decidir):

### Mencionan ARCHIVE + RETURN (13)
`akashic-crown`, `anatomical-star`, `gaia-sentinel`, `genesis-cradle`,
`mycelial-oracle`, `origin-forge`, `pend-01`*, `silence-engine`,
`soul-weaver`, `star-lattice`, `void-orchard`, `heart-chamber`
(menciona todas 7 — candidata a chamber HEART).

*`pend-01` aparece también en la lista de ARCHIVO experimentales; el
prefijo `pend-` sugiere ARCHIVO, pero menciona escenas, así que queda
en ambas listas hasta decisión.*

### Mencionan RETURN solo (5)
`impossible-forms-vol-1`, `kx05-procession-field`, `kx06-diagonal-code-band`,
`null-knot`, `u03-return`.

### Mencionan RETURN + THRESHOLD (3)
`star-compass-seal`, `u02-threshold`, `u04-alphabet`.

### Mencionan DESCENT + THRESHOLD (1)
`t01-01-threshold-portal`.

### Mencionan DESCENT + RETURN (1)
`t01-08-signal-bloom`.

### Mencionan THRESHOLD solo (2)
`u01-origin-field`, `u07-observer` (candidata a chamber OBSERVER).

### Mencionan ARCHIVE + THRESHOLD (1)
`u09-source`.

---

## Cierre del LOTE C

Si el creador aprueba los batches:

- **Batch ARCHIVO — labs (24)** cierra 24 vueltas del TELAR de forma
  automática. Regla canónica pre-existente.
- **Batch ARCHIVO — experimentales (8)** cierra 8 vueltas más si se
  aprueba (requiere confirmación).
- **VIVO — ya montadas (5)** ya están cerradas de facto.

Con las dos aprobaciones: **37 vueltas** cierran de una pasada, sin
código.

Las 25 AMBIGUA siguen bloqueadas y no cuentan. Su desbloqueo requiere
decisiones autorales sobre el atlas — no se cierran por triaje ni por
código.

---

## Verificación

- El triaje base se generó con Explore muy exhaustivo cruzando `atlas.ts`
  contra el filesystem.
- Las 5 YA_MONTADA se verificaron con `grep -rn "<nombre-de-ruta>"
  src/pages/kodex/folio/` — todas aparecen en `LaminaOrganismo.astro`.
- El heurístico "menciona X" de las AMBIGUA es débil: 13 láminas
  aparecen "mencionando" ARCHIVE+RETURN porque el chasis/breadcrumb las
  nombra en varias escenas. La decisión final debe leer el contenido
  visual, no el grep. Este documento no la toma.
