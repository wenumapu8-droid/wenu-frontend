# Estaciones fijas · PROPUESTA de fábrica

> **NOTA**: Este es un draft de chat-sentinel, no una decisión. La factory
> la propuso chat-opus (2026-08-30). Cuando se congele, este documento
> pasa a `07_ESTACIONES.md` sin el sufijo.

## Por qué

Hoy medimos dos races reales causados por "carriles negociados":

- `dist/` borrado a mitad de deploy porque otro agente buildeaba (DEC-048).
- `public/` con archivo movido mientras otro buildeaba (reporte chat-opus).

Un carril negociado depende de que cada agente reclame en el bus antes de
tocar algo. Una estación fija **es** la posesión — no hay negociación
posible porque los otros agentes no tienen escritura ahí.

## Regla dura de la fábrica

1. Cada superficie tiene UN dueño fijo declarado.
2. Superficies compartidas (`dist/`, `public/img/`, `build lock`) requieren
   el lock `KDX_AGENTE` sin excepción.
3. Si un agente necesita tocar la estación de otro, abre PR interno
   (branch corta desde la estación destino) y el dueño mergea.

## Estaciones propuestas (basadas en evidencia)

### chat-opus · Estación DEPLOY + CHASIS + CAMPO
- `scripts/kodex-*.sh`, `deploy-*.sh`
- `src/kodex/persistent-field/` (P0 · P1 · P2 · P3)
- `src/components/kodex/os/RielInstrumento`, `TrazaViva`, `PuntoSenal`, `CarrilEstados`, `KodexOriginVector`, `KodexSystemLog`, `KodexDataStrip`
- `dist/` (compartida pero él orquesta)
- `public/kodex-content/` (assets del R2 mirror)

**Evidencia**: commits `ef12c663` (lock KDX_AGENTE), `5d551407` (G0 merge sintético), `7d993e86` (P0-CAMPO), P1/P2/P3 series.

### chat-web · Estación LÁMINAS + CARRIL DE ESTADOS
- `src/pages/kodex/lamina/**`
- `src/components/kodex/lamina/**` (t01-01 a t01-08 + trazos)
- `src/components/kodex/os/CarrilEstados.astro`
- Contract `src/content/scenes/scene.01-prologue.yaml` (visible_states)

**Evidencia**: reciente registro en bus ("carril de estados en 5 escenas"), edits t01-* del último ciclo.

### terminal (Codex CLI) · Estación LOTE B + LOTE C
- `src/pages/kodex/screen/**` (Lote B: ORIGIN FIELD, THRESHOLD CONSENT, ALPHABET, MEMORY)
- `src/components/kodex/screen/**`
- Cableado de las 40 láminas del atlas (Lote C — coordinación con chat-web)

**Evidencia**: commits `6410edaa` (origin-field), `adb054c9` (threshold-consent), `bcf0fa80` (alphabet), `40c5aa5a` (memory), `403912fe` (reconciliation).

### profundo (nuevo) · Estación PERF + RENDERERS + GRAMMAR + TYPES
- `src/kodex/organism-engine/**`, `src/kodex/ascii/**`, `src/kodex/crt/**`
- `src/lib/kodex/grammar/**`
- `src/lib/kodex/runtime/journey-state.ts` (deuda de tipos)
- Gate de performance nuevo (FPS/LCP/INP/memoria — hoy hueco declarado)

**Evidencia**: asignación por chat-opus en el prompt del tercer agente.

### chat-sentinel · Estación META-COORDINACIÓN
- `kodex-system/` (los 7 authorities)
- `mcp-sentinel/` (MCP server con 19 tools)
- `~/kodex-relevo/PRESENTACION-*.md` (presentaciones)
- Actualización del `TELAR-BITACORA.md` con la línea del ledger (DEC-XXX)

**Evidencia**: 32 commits en `kodex-system/`, MCP scaffold, este documento.

### Ocín · Estación CANON + DECISIONES + AUTORIZACIÓN
- `src/content/scenes/AUTHORITIES.yaml`
- `~/kodex-relevo/DECISION-LOG-*.md`
- `~/kodex-relevo/00-*.md` (constitucionales)
- Autorización de `git push` a `kodex/pass-a-organismos-corredor`
- Autorización de `APROBAR DEPLOY` a producción
- Resolución de los 7 conflictos abiertos del ledger

## Superficies compartidas (requieren KDX_AGENTE lock)

Estas NO tienen dueño único porque múltiples estaciones legítimamente
necesitan tocarlas:

| Superficie | Por qué es compartida | Regla |
|------------|----------------------|-------|
| `dist/` | build (todas las estaciones) + deploy (chat-opus) | LOCK obligatorio (DEC-048) |
| `public/img/` | build lee para copy, edición de imágenes también | LOCK durante build |
| `src/pages/kodex/index.astro` | THRESHOLD, todas las estaciones mounten cosas | Editar solo con lock + aviso en bus |
| `src/pages/kodex/folio/[folio].astro` | ídem, 6 escenas comparten esta ruta | Rama propia de cada `sceneByFolio.<i>` con lock + aviso |
| `package.json` scripts | cualquier estación puede agregar script npm | Editar solo con lock corto + aviso |

## Handoffs entre estaciones (cómo transferir trabajo)

Cuando A necesita cambio en la estación de B:

1. A abre branch `handoff/A-to-B/<breve-descripcion>` desde `imac/telar-...`.
2. A hace los cambios en su branch y commits.
3. A avisa a B en el bus + posts el diff en `~/kodex-relevo/HANDOFFS/`.
4. B revisa y hace `git merge --no-ff handoff/A-to-B/...` cuando le toca.
5. Si B rechaza, A y B abren issue en el bus.

## Qué NO cambia

- Bus de equipo (`scripts/kodex-equipo.mjs`) sigue siendo el punto de check-in.
- Lock `KDX_AGENTE` en `prebuild` sigue siendo obligatorio para builds.
- Registry de componentes, decision ledger, backlog — sin cambio.

## Migración desde carriles a estaciones

Fase 1 (una vez decretada la fábrica):
- Cada estación commitea un `.stationrc` en el directorio raíz de su estación
  con `owner: <agente>`.
- Se agrega un pre-commit hook opcional que verifica que el committer coincide
  con el owner declarado (o pertenece a la lista de handoff branches abiertos).

Fase 2 (opcional):
- MCP tool `check_station(path)` que devuelve el dueño y el estado del lock.

## Historia

- 2026-08-30 · propuesta inicial por chat-sentinel basada en evidencia del
  bus + git log + `owned_files` de scene contracts. Congelación pendiente
  de decisión de Ocín + chat-opus.
