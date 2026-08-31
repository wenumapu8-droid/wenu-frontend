# DRIFT REPORT · 2026-08-31

**Autor**: chat-sentinel
**Regla**: cita textual + evidencia por línea.
**Alcance**: verificar decisiones DEC-069/070/072 (nuevas desde Obsidian) contra código real.

---

## DEC-070 · Color tokens · DRIFT SEVERO

DEC-070 declara: *"kdx-acid #B7FF00, kdx-cyan #00F0FF"* (Obsidian `contenido/kodex-design-tokens.md`, 07-28).

### Real en el código

| Token | Valor declarado | Valores en código | Ubicación |
|---|---|---|---|
| `--kdx-cyan` | **#00F0FF** | `#00d8ff` | `src/styles/kodex-micrographics.css:6` |
| `--kdx-cyan` (fallback) | #00F0FF | `#00F0FF` ✅ | `src/styles/kodex.css:418` |
| `--kdx-cyan` (fallback) | #00F0FF | `#00D8FF` | `src/styles/kodex.css:1231,1557` |
| `--kdx-acid` | **#B7FF00** | `#5C7A00` | `src/styles/kodex.css:1265` |
| `--kdx-acid` (fallback) | #B7FF00 | `#B7FF00` ✅ | `src/styles/kodex.css:419` |
| `--kdx-acid` (fallback) | #B7FF00 | `#A7FF00` | `src/styles/kodex.css:1564` |

**Diagnóstico**: 3 valores distintos para `kdx-acid` (5C7A00 · A7FF00 · B7FF00), 2 distintos para `kdx-cyan` (00D8FF · 00F0FF). Solo el fallback de `kodex.css:418-419` coincide con DEC-070; los `--kdx-*` reales del `:root` son otros.

**Impacto visual**: `#5C7A00` es acid MUY oscuro (militar), muy lejos del `#B7FF00` neón declarado. Esto puede explicar por qué el organismo no domina la escena — el "activador acid" en RETURN se rinde en color apagado.

**Acción sugerida a Ocín**: DEC-070 canoniza los valores neón. O bien `:root` en `kodex.css:1265` se corrige a `#B7FF00`, o DEC-070 se marca como aspiracional y se documenta el `#5C7A00` como intencional. **Alimenta C1 y OBS-C1**.

---

## DEC-069 · Tipografía KODEX · DRIFT PARCIAL

DEC-069 declara: *"KODEX SANS (Space Grotesk) + MONO (Departure)"* (Obsidian `contenido/kodex-design-tokens.md`, 07-28).

### Real en el código

**Space Grotesk** ✅ presente y canónica:
- `src/styles/kodex-interaction-v0.css:3`
- `src/components/KodexIndexOverlay.astro:83,91,124,126,128`
- `src/layouts/KodexShell.astro:50` (comentario "KODEX SANS: Space Grotesk (UI)")
- `src/pages/kodex/lamina/akashic-crown.astro:463,700,701,702`
- `src/pages/kodex/lab/command-shell.astro:305,316,324,331`

**Departure Mono** ❌ **NO existe en NINGÚN archivo del proyecto**.

En su lugar se usa:
- `IBM Plex Mono` (`kodex.css:1557`, `AtlasScreenChassis.astro:247`)
- Stack de system mono (`ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas`) en 8+ componentes

**Diagnóstico**: DEC-069 canoniza Departure como MONO, pero el runtime nunca la cargó. La familia real es IBM Plex Mono o system mono según componente.

**Acción sugerida a Ocín**: o cargar Departure Mono como `@fontsource` + reemplazar IBM Plex, o superar DEC-069 con la elección real IBM Plex Mono.

---

## DEC-072 · Rutas canónicas · DRIFT MIXTO

DEC-072 declara: *"Portal /kodex + /kodex/archive/[slug] + /kodex/editions"* (Obsidian `contenido/kodex-build-handoff.md`, 07-23).

### Real en `src/pages/kodex/`

| Ruta DEC-072 | Estado real | Nota |
|---|---|---|
| `/kodex` | ✅ OK · `index.astro` | Portal principal |
| `/kodex/archive/[slug]` | ❌ **MISSING** | Solo hay `archive/index.astro` y `archive/conjuncion.astro`. La dynamic route `[slug]` NO existe |
| `/kodex/editions` | ✅ OK · `editions.astro` | |

### Rutas actuales NO declaradas en DEC-072 (~20 extra)

Corredor + chambers (canónicos, alineados con DEC-060):
- `/kodex/chamber/{altar,heart,observer,temple}`
- `/kodex/folio/[folio]`
- `/kodex/screen/{alphabet,memory,origin-field,threshold-consent}`

Lámina + trabajos:
- `/kodex/lamina/*` (8 láminas: akashic-crown, anatomical-star, gaia-sentinel, genesis-cradle, heart-chamber, impossible-forms-vol-1, kit, index)
- `/kodex/vol/[slug]`, `/kodex/work/[id]`, `/kodex/interlude/[id]`, `/kodex/movement/[key]`, `/kodex/concepto/[concepto]`

Utilitarios / labs:
- `/kodex/lab/*` (14 páginas de laboratorio)
- `/kodex/m/{descent,ritual}` (rutas cortas)
- `/kodex/atlas`, `/kodex/strata`, `/kodex/inward`, `/kodex/return`
- `/kodex/store`, `/kodex/world`, `/kodex/libro`, `/kodex/verify`

**Diagnóstico**: DEC-072 quedó chica frente a lo que existe. Falta la ruta dinámica `[slug]` bajo `/archive/`, y el mapa canónico de rutas nunca se actualizó al crecer el corredor.

**Acción sugerida a Ocín**:
1. Decidir si `/kodex/archive/[slug]` debe existir (para páginas de piezas del archivo) o si DEC-072 se supersede.
2. Actualizar `02_SCENE_REGISTRY.yaml` con el mapa real de rutas por escena/chamber.

---

---

## C2 (ARCHIVE ↔ MACHINE accents) · verificación

Conflicto C2 del ledger: *"ARCHIVE ↔ MACHINE intercambiaron accents en algún commit"*.

### Real en el código

| Fuente | ARCHIVE accent | MACHINE accent | Consistente? |
|---|---|---|---|
| `src/styles/kodex-universe.css:5-6` | `--kdx-acid` | `--kdx-cyan` | ✅ |
| `src/pages/kodex/folio/[folio].astro:219` | `var(--kdx-acid,#A7FF00)` | — | ✅ |
| `src/pages/kodex/folio/[folio].astro:232` | — | `var(--kdx-cyan,#00D8FF)` | ✅ |

**Diagnóstico**: en el runtime actual **NO hay intercambio activo**. Ambas fuentes coinciden: ARCHIVE=acid, MACHINE=cyan. El conflicto C2, si existió en un commit histórico, hoy está resuelto en el sentido de que las 2 fuentes concuerdan.

**Lo que sí queda como drift**: DEC-054 (Obsidian, 07-28) dice ARCHIVE = **multi grid** (no un color único). El código da `acid` a ARCHIVE. Eso NO es "intercambio con MACHINE" — es que ARCHIVE nunca implementó multi, sigue como color único acid.

**Acción sugerida a Ocín**:
- Cerrar C2 como INACTIVO en el ledger (con la verificación de hoy).
- OBS-C1 sigue abierto y ahora es más preciso: la elección real es acid-único vs multi-grid para ARCHIVE.

---

## Cross-refs

- Alimenta C1 (paleta drift 3 fuentes) del ledger.
- Alimenta OBS-C1 (paleta v2.0 Obsidian vs activadores 08-29).
- Motiva actualización de `02_SCENE_REGISTRY.yaml` con `route_actual` por escena.
- Verifica C2 como INACTIVO en runtime actual.
