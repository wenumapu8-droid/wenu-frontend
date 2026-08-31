# KODEX-* Sibling Dirs · plan de acción

**Preparado por**: chat-sentinel · 2026-08-30
**Basado en**: `KODEX_DIRS_CLEANUP_AUDIT.yaml` + verificación de disco real
**Autoridad para ejecutar**: OCÍN (nadie más borra nada)

---

## Correcciones que hice al audit del subagent

El audit inicial tenía **3 clasificaciones peligrosas**. Las corregí después de mirar el disco real:

1. **`kodex-relevo` NO es UNKNOWN — es CRÍTICO.**
   68M, 98 archivos de ops diarias de Ocín: ATLAS-07A/07B, PROMPTS,
   BITÁCORAS, capturas de producción, evidencia visual. Reclasificado a
   **REFERENCE_KEEP · nunca tocar**.

2. **`kodex-content` NO es simple STALE_WORKTREE — tiene 9GB únicos.**
   14G total con `vol/` (3.8G) + `assets/` (5.2G) que **NO están mirroreados**
   en `~/kodex-imac-b/public/kodex-content/` (ese es solo 153M).
   Contenido: `achroma/`, `archivo/`, `behance-*/`, etc. — assets autorales
   crudos. Reclasificado a **TIER 4 · requiere verificación de backup**.

3. **`kodex-cierre` no son 22 cambios cualquiera — son ediciones reales.**
   `heart.ts`, `memoria.ts`, `journey-state.ts`, `[folio].astro`,
   `EscenaMachine.astro`, `BarraOS.astro`, `EspecimenRetorno.astro` +
   deleciones de `pages/kodex/m/descent.astro` y `ritual.astro`.
   **Trabajo sin mergear, no basura.** Requiere cherry-pick o descarte
   explícito de Ocín.

---

## Los 5 tiers

### TIER 1 · DELETE SAFE (nada de valor)
Ejecutable sin consultar. Total: **36 KB**.

| Dir | Size | Motivo |
|---|---|---|
| `kodex-latido-backup` | 0 B | Directorio vacío |
| `kodex-cierre-qa` | 36 K | 4 scripts QA (banco/barrido/capturar/servir) redundantes con scripts en imac-b |

### TIER 2 · ARCHIVE + DELETE (rebuildable / snapshots)
Ejecutable sin consultar. Total: **1.5 GB**.

| Dir | Size | Qué es |
|---|---|---|
| `kodex-apartado-2026-08-28` | 652 M | Snapshot dist del 28-ago |
| `kodex-dist-deploy` | 258 M | Build output rebuildable desde source |
| `kodex-pr101-worktree` | 547 M | Snapshot de PR101 sin git dir |
| `kodex-work-backup` | 36 M | Backup genérico sin unique content |

Archivos van a `~/kodex-archives/2026-08-30-cleanup/*.tar.gz` antes del `rm -rf`.

### TIER 3 · INVESTIGAR Y DECIDIR (worktrees con trabajo real)
No ejecutar sin cherry-pick previo. Total: **~5.2 GB**.

| Dir | Size | Uncommitted | Decisión requerida |
|---|---|---|---|
| `kodex-cierre` | 2.1 G | **22 archivos reales** (heart.ts, memoria.ts, EscenaMachine, etc.) | **RESCATAR** cambios a `kodex-imac-b/imac/telar-a06-a09-a10`, o **DESCARTAR** explícito |
| `kodex-pr101-wt` | 1.8 G | 1 archivo (`_cap.mjs` untracked, screenshot script) | Verificar si la branch `feat/kodex-manifestation-recipe-p0-4` mergea o abandonar. 21 ahead / 761 behind |
| `kodex-staging-build` | 1.0 G | 1 archivo | 944 behind main · casi seguro descartable |
| `kodex-minus-infinity` | 84 M | 0 | Branch `feat/bridge-decisions-v1` · check merge status |
| `kodex-minus-infinity-opencode-loop` | 50 M | 0 | Branch `agent/opencode-loop-2026-08-14` · check merge status |

### TIER 4 · CRÍTICO · verificar backup ANTES de tocar
NO ejecutar bajo ninguna circunstancia sin confirmación de Ocín. Total: **14 GB**.

| Dir | Size | Riesgo |
|---|---|---|
| `kodex-content` | 14 G | Contiene 9 GB de assets autorales (achroma, archivo, behance-*, vol/) que **NO están mirroreados en el repo**. Preguntas para Ocín: ¿están en LaCie? ¿en R2? ¿en otro backup?. Si están → archivable. Si no → **fuente única, no tocar jamás** |

### TIER 5 · KEEP (nunca tocar)
Total activo: **6.4 GB**.

| Dir | Size | Rol |
|---|---|---|
| `kodex-imac-b` | 2.6 G | **PRIMARY WORKTREE** · branch `imac/telar-a06-a09-a10` · trabajo hoy |
| `kodex-carril-c` | 2.5 G | Feature activa · `imac/carril-c-laminas` |
| `kodex-relevo` | 68 M | Ops diarias Ocín · ATLAS/PROMPTS/BITÁCORAS · **CRÍTICO** |
| `kodex-library` | 1.1 G | Design system + brand assets |
| `kodex-cvr` | 75 M | Creator Visual Review HTML |
| `kodex-system-audit` | 2.9 M | Registros históricos de auditoría |

---

## Ejecución propuesta

**Paso 1** (Tier 1 + 2, seguro): Ocín corre
```bash
bash ~/kodex-imac-b/scripts/kodex-cleanup-tier1-2.sh
```
Recupera **~1.5 GB**. Archives quedan en `~/kodex-archives/2026-08-30-cleanup/`
por si algo hace falta después.

**Paso 2** (Tier 3, con decisión): Ocín decide caso por caso, empezando por
`kodex-cierre`:
- Si los 22 cambios importan → cherry-pick a `imac/telar-a06-a09-a10`
- Si no → `git worktree remove ~/kodex-cierre --force`

**Paso 3** (Tier 4, con verificación): Ocín confirma dónde están los
9 GB de `~/kodex-content/{vol,assets,achroma,...}`:
- Si están en LaCie/R2 → mismo script pero para ese dir
- Si son única copia → **quedan quietos hasta migrar a storage frío**

---

## Lo que NO se ejecuta

- Nada de este plan corre por sí solo. No hay hooks, no hay cron.
- El script `kodex-cleanup-tier1-2.sh` no borra `kodex-relevo`, ni
  `kodex-content`, ni ninguna cosa del Tier 3, 4 o 5.
- Cuando Ocín diga OK, corre el paso 1. Pasos 2 y 3 los conversamos.
