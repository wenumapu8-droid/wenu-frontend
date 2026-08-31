# KODEX INTEGRATION OS

**Autoridad ejecutable de KODEX-∞.** Congelado por Ocín el 2026-08-30 18:45.

## Por qué existe

Antes: cada agente reescribía lo que ya existía porque nada lo obligaba a
verificar. KODEX acumulaba brillantez interna que nunca cruzaba al producto.

Ahora: **ningún agente escribe código KODEX sin leer estos archivos primero.**

## Los 6 archivos de autoridad

| # | Archivo | Contenido |
|---|---------|-----------|
| 01 | `01_CURRENT_STATE.yaml` | Qué está VIVO ahora mismo por ruta, no filosofía |
| 02 | `02_SCENE_REGISTRY.yaml` | Las 7 escenas del corredor + chambers KDX-CH-* |
| 03 | `03_COMPONENT_REGISTRY.yaml` | Todos los componentes clasificados: CANONICAL_MOUNTED / CANONICAL_ORPHANED / PROTOTYPE / DEPRECATED / UNKNOWN |
| 04 | `04_ASSET_ROUTING.yaml` | Cada visual: dónde aparece, cuándo, por qué, qué la activa |
| 05 | `05_DECISION_LEDGER.md` | Decisiones autorales versionadas, no borradas |
| 06 | `06_INTEGRATION_BACKLOG.yaml` | INT-XXX tareas concretas de integración |

## Regla constitucional · SEARCH BEFORE CREATE

Antes de escribir CUALQUIER componente nuevo, el agente debe producir:

```
EXISTING IMPLEMENTATION SEARCH
  canonical found: <lista>
  orphan found: <lista>
  prototype found: <lista>
  deprecated found: <lista>
  related assets: <lista>
  related decisions: <ledger refs>
  REUSE POSSIBLE: YES / NO
  If NO: reason: <texto>
```

Sin esto no se escribe código nuevo.

## Nueva definición de DONE

```
DONE = mounted + reachable + interactive + correct asset + correct copy +
       responsive + tested + screenshot verified + deployed + visually accepted
```

Si falta uno, **NO está terminado**. Reemplaza a "componente existe + build
passes + commit".

## Ciclo de trabajo obligatorio

```
DISCOVER
  ↓
RECOVER EXISTING WORK
  ↓
RECONCILE VERSIONS
  ↓
SELECT CANONICAL
  ↓
DEPRECATE OLD
  ↓
MOUNT
  ↓
CONNECT
  ↓
ADD EXISTING ASSETS
  ↓
INTERACTION
  ↓
MOBILE
  ↓
VISUAL REFERENCE CHECK
  ↓
TEST
  ↓
DEPLOY
  ↓
SCREENSHOT
  ↓
ACCEPT
  ↓
NEXT FEATURE
```

## Estado actual (2026-08-30 excavación)

- **112 componentes KODEX** en el repo
- **65 CANONICAL_MOUNTED** (en producción)
- **33 CANONICAL_ORPHANED** (integración pendiente — ver `06_INTEGRATION_BACKLOG.yaml`)
- **14 PROTOTYPE** (borradores en /lab o versionados)
- **0 DEPRECATED** explícitos
- **0 UNKNOWN**

**Hallazgo crítico**: `KodexObserveScene` existe en 2 ubicaciones, ambas
mounted. Uno debe ganar. Ver INT-005.

## Meta-regla

> No es un proyecto que hay que inventar. Es una obra que ya existe
> parcialmente y debe ser ensamblada.

La pregunta correcta ya no es *"¿qué debería tener KODEX?"* sino
*"¿dónde está lo que ya hicimos y por qué todavía no está ocurriendo en
pantalla?"*.
