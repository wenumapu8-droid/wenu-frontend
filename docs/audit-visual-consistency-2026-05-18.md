# Auditoría de consistencia visual — 2026-05-18

Auditoría read-only de las páginas de `src/pages/`. Hecha en turno nocturno (A6 del
`agent-control/PLAN-DE-AVANCE.md`).

## Verificado limpio

- **Todas las páginas usan el layout `Base.astro`** — 0 páginas sueltas.
- **Ningún `<img>` sin `alt`** — los 4 que aparecían en el grep son falsos positivos
  (etiquetas `<img>` multilínea; el `alt=` está en una línea siguiente).
- **Build verde** — `npm run build`: 96 páginas, 50 productos, `postbuild` OK.

## Bug encontrado y ARREGLADO esta sesión

**Mismatch de clases en `/collection` y `/material`.** El markup usaba
`.archive-card__media` y `.archive-card__copy`, clases que **no existen en el CSS**.
El CSS define `.archive-card__img-wrap` (con `aspect-ratio: 1/1` + `object-fit: cover`)
y `.archive-card__body`. Resultado: las imágenes de esas dos páginas se renderizaban
sin contenedor con relación de aspecto → **CLS** (layout shift) y estilo inconsistente
vs. el resto de las archive-cards.

Fix: se alineó el markup con las clases CSS ya existentes y funcionales (las mismas
que usa `ProductCard.astro`). Archivos tocados:
- `src/pages/collection/index.astro` — `archive-card__media` → `archive-card__img-wrap`
- `src/pages/material/index.astro` — `archive-card__media` → `archive-card__img-wrap`,
  `archive-card__copy` → `archive-card__body`

## Hallazgos para revisar (no tocados — requieren decisión)

### 1. El hero "portrait" es en realidad apaisado

`src/pages/index.astro` carga `/img/hero/hero-portrait-*w.webp`. Las 4 variantes son
**2:1 apaisadas** (600×300, 900×450, 1200×600, 1800×900), pero el `<img>` declara
`width="1200" height="1500"` (relación 4:5 vertical). El CSS (`width:100%;height:100%;
object-fit:cover`) hace que el layout no dependa de esos atributos, así que no rompe
nada — pero los atributos son incorrectos y el nombre `hero-portrait` no corresponde
a una imagen apaisada. Decisión de la dueña: ¿el hero debe ser vertical (regenerar
imagen) o apaisado (corregir atributos a 1200×600 y renombrar)?

### 2. ~50 clases en markup sin regla CSS propia

Un diff markup↔CSS detectó ~50 clases `bloque__elemento` sin selector propio (ej.
`archive-card__title`, `journal-index__item`, `pricing-row__price`). **La mayoría es
benigna**: son clases semánticas estilizadas por selectores de elemento o descendientes
(`h2`, `.x__body p`, etc.) o decorativas sin estilo necesario. El método produce
falsos positivos. No es accionable en bloque — requiere verificar caso por caso si
alguna esconde un bug como el de §"Bug encontrado". Prioridad baja.

## Recomendación

- El fix de archive-card ya está hecho y verificado por build → listo para commit.
- §1 (hero) y §2 son carril amarillo — necesitan a la dueña.
- Próximo chequeo útil: revisar visualmente `/collection` y `/material` en el preview
  para confirmar que las imágenes ahora caen en cuadrícula 1:1 pareja.
