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

## Nueva definición de DONE (revisada 2026-08-30)

```
DONE = mounted + reachable + interactive + correct asset + correct copy +
       responsive + tested + SCREENSHOT SIDE-BY-SIDE WITH HI-FI TARGET +
       organismo domina el viewport (no el HUD) + deployed + visually accepted
```

Si falta uno, **NO está terminado**. Reemplaza a "componente existe + build
passes + commit".

### Regla crítica (DEC-051, 2026-08-30)

**`grep` no verifica apariencia.** Medido en el sitio publicado: gate visual
reportó 7/7 con el organismo al 11% del viewport. Presencia en DOM ≠
dominancia visual ≠ fidelidad a la referencia.

Antes de declarar una escena/lámina/chamber lista:

1. Abrir la lámina Hi-Fi de Drive al lado del sitio publicado
2. Comparar MIRANDO (no con grep, no con test):
   - ¿El organismo domina el viewport? (target: ~100%, real medido: 11%)
   - ¿El HUD acompaña o se comió a la obra?
   - ¿Título y system log están solapados?
   - ¿Hay franjas responsive rotas (ej. 701-900px)?
3. Si algo no coincide con la referencia visual, **NO ES DONE**.

Esto aplica también a las tools de este Integration OS: `search_before_create`,
`list_orphans`, `get_current_state` devuelven MOUNTED sin garantía visual.
Complementá siempre con inspección ocular.

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
