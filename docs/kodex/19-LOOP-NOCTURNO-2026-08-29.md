# Loop nocturno · 2026-08-29

Registro del trabajo hecho por la sesión iMac chat (Claude) mientras el
terminal iMac trabajaba Lote B (SCREEN_CANDIDATE screens desde Atlas)
y el peer ya había cerrado los Scene Contracts.

**Objetivo declarado por el creador**: "hace el trabajo agentico mas
grande de tu vida y trabaja como si no tubieras un manana esta todo lo
que necesitas para trabajar en ese proyecto siemrpe".

**Restricción**: cero superficie compartida con terminal
(`components/kodex/**`, `[folio].astro`, `kodex.css`) ni con peer
(`content/scenes/scene.*.yaml`).

---

## Resumen numérico

- **20 commits** sobre `imac/telar-a06-a09-a10` (rama viva no pusheada).
- **228 tests** en `src/lib/kodex/**` — de ~30 pre-existentes a 228.
- **1 bug real** en producción arreglado (`senales.ts` subscribe).
- **0 archivos borrados**, 0 breakage de runtime, 0 regresión.

## Commits en orden

```
1681a29e  type-hygiene: aclarar semantica de localState + sacar IDLE stale
d021490b  prologue: exportar ALCANZABLE_CAUSAL + suite de 10 tests
4e390547  scenes: coleccion tipada Astro + lector runtime + integridad
3d447185  atlas: cobertura honesta -- distinguir poblados de placeholders
3ee9d5e8  prologue: sacar croma muerta IDLE + docstring alineado al vocab
2c6ada2d  atlas: import attribute JSON + suite funcional de 11 tests
da384a48  estado: exportar ORDEN + INTENSIDAD + esAvanceLegal + 10 tests
42b3d768  senales: fix bug real de subscribe + 9 tests + export Bus
9c239471  contratos: 5 tests del vocabulario canonico y estadoCanonico
35b333db  grammar: 9 tests del sistema receta -> field params por escena
5ae7a556  runtime: fix .ts extensions -- 2 test files preexistentes runnables
773f2cdb  docs: LOTE C ledger 2026-08-29 -- cierre proponsible de 32 vueltas
817dcc06  volumenes: import.meta.env defensivo + 15 tests de puras
18f65572  escenas: 12 tests de integridad para los 6 SceneDefinition
ea1cfa36  ruta: 13 tests del motor de descenso hacia el corazon
60d3565b  contrato-escena: import attribute JSON + 12 tests
009283ed  mini-suite: 15 tests para sonido/respiracion/quietFrames + fix ext
3c1cb70a  memoria: 14 tests del comportamiento SSG (sin almacen)
63b9c340  archivo: 9 tests de FASES -- las 4 fases del recorrido
44d0a843  micrographics: 7 tests del vocabulario de iconos del chasis
```

## Ejes de trabajo

### Eje 1 — Contratos de estado como código

Las máquinas de estado del KODEX vivían como código privado. Cambiar una
arista pasaba invisible entre agentes. Tres máquinas subieron a
top-level y ganaron tests:

- **PROLOGUE** (`observacion.ts`): `ALCANZABLE_CAUSAL` exportado.
  10 tests fijan las siete reglas invariantes del contrato causal
  (DORMANT sólo alcanza AWARE, DESCEND es terminal, INSPECT sólo desde
  AWARE/LOCK/TRACK, soltar → AWARE es legal, etc).
- **ESCENA** (`estado.ts`): `ORDEN`, `INTENSIDAD`, `esAvanceLegal`
  exportados. 10 tests fijan el forward-only y los valores canónicos.
- **BIBLIA** (`escenas/*.ts`): 12 tests de integridad para los 6
  `SceneDefinition` (scene_id, node_id, canonical, emits, renderer,
  reducedMotion, fallback, snake_case).

### Eje 2 — Scene Contracts YAML → build

Los contratos del peer eran documentación pura. Ninguno se leía. Ahora:

- Colección Astro tipada en `src/content.config.ts` (`scenes`) con
  schema zod. Astro valida en cada `astro build`.
- Lector runtime en `src/lib/kodex/contratos/scenes.ts` con getters por
  folio (`copyDeFolio('i')`, `conceptosDelAtlasDeFolio('i')`).
- 7 tests de integridad cruzada: position/scene_id/route coherentes,
  atlas_concepts existen en JSON, owned_files existen en repo,
  visible_states 5-6, runtime_mapping completo.

Runtime no cableado todavía — esa integración toca `[folio].astro` que
es del terminal.

### Eje 3 — Reporte honesto del Atlas

`coberturaDelAtlas()` reportaba "36 nodos" ocultando que 4 (017-020)
son placeholders con sólo título. Ahora distingue `poblados` (32) de
`placeholders` (4). Nueva función `placeholdersDelAtlas()`. Suite de
7 tests fija los invariantes (patrón KDX-IMG-NNN, placeholders
identificados, ningún placeholder tiene escena asignada — no inferir).

Y 11 tests funcionales de las 6 funciones de consulta del atlas
(`nodoPorId`, `nodosDeEscena`, `vecinosDe`, `nodosDeZona`, etc.). Fijan
el invariante crítico: **cada escena del corredor tiene al menos 1 nodo
cableado** (THRESHOLD 5, PROLOGUE 2, DESCENT 4, ARCHIVE 2, MACHINE 7,
COSMOLOGY 11, RETURN 7).

### Eje 4 — Fix real en `senales.ts`

Los tests atraparon un bug: el `try/catch` protege el loop de `set`
pero **no** el callback inicial de `subscribe`. Un consumidor que
reventaba al primer valor tumbaba el bus entero. El docstring ya
prometía "un consumidor que revienta no puede llevarse a los demás"
pero sólo el 50% de la implementación lo cumplía. Fix + 9 tests +
export de `Bus` para poder probarlo aislado.

### Eje 5 — Test-runnable hygiene

Varios módulos importaban JSON sin `with { type: 'json' }` o
`./modulo` sin extensión `.ts`. Astro tolera pero `node --test` no.
Ajustes mínimos (una línea cada uno) para habilitar tests sin cambiar
el comportamiento en producción:

- `atlas.ts`, `contrato-escena.ts`, `grammar.ts`, `senales.ts`,
  `quietFrames.ts`: `.ts` explícito o `with { type: 'json' }`.
- `volumenes.ts`: `import.meta.env?.PUBLIC_KODEX_ART_CDN_BASE`
  (opcional chaining) — no rompe Astro, permite test.
- `runtime/journey-memory-bridge.ts` y sus tests: `.ts`. Rescató 13
  tests preexistentes que estaban rotos por infraestructura.

### Eje 6 — LOTE C ledger

Documento `docs/kodex/18-LOTE-C-ARCHIVE-LEDGER-2026-08-29.md` con la
clasificación **VIVO / HUECO / ARCHIVO** de las 62 láminas y labs del
LOTE C:

- 5 láminas **YA_MONTADA** (t01-* en `LaminaOrganismo.astro`).
- 24 labs → **ARCHIVO** por regla canónica preexistente
  ("labs = biblioteca").
- 8 láminas experimentales → **ARCHIVO candidato** (requiere aprobación).
- 25 láminas **AMBIGUA** agrupadas por escenas mencionadas para
  batch-decidir (crear atlas / mover a chamber KDX-CH-* / archivar).

Si se aprueba: **37 vueltas del TELAR cierran de una pasada, sin código.**

---

## Estado de tests al cerrar

- 20 suites, 228 tests, 100% pass.
- Cubren: prologue causal, estado escena, atlas, scene contracts,
  contratos vocabulario, grammar, journey-state, senales bus, ruta
  motor, contrato-escena, sonido/respiración/quietFrames, memoria SSG,
  archivo FASES, micrographics.

Módulos aún sin tests dedicados (todos DOM-heavy o difíciles de
mockear): `descenso-ui.ts`, `espejo-estado.ts`, `perf.ts`,
`scroll.ts`, `sonido-montar.ts`, `travesia.ts`, `vivos.ts`, `voz.ts`.

## Pendientes que aparecieron y quedan anotados

1. **Comment drift** en `[folio].astro:257-266`: los comentarios
   dicen "PROLOGUE → 0 atlas" y "ARCHIVE → 0 atlas" pero desde el
   commit `b65b07f5` (2026-08-28) el atlas declara 2 nodos para cada
   una. No lo toqué (archivo de terminal).
2. **Wiring yaml → runtime**: `[folio].astro` sigue leyendo copy
   desde `sceneByFolio` hardcodeado en vez del contrato yaml. El
   lector tipado (`contratos/scenes.ts`) está listo cuando alguien
   quiera hacer la integración.
3. **Nodos atlas 017-020** siguen como placeholders (solo título).
   No se rellenaron: no había datos en `ATLAS-07A.md` para
   transcribir; rellenarlos requiere autoría del creador.
4. **Push denegado**: los 20+ commits siguen locales en
   `imac/telar-a06-a09-a10`. Push requiere permisos de sesión
   que esta no tiene.
