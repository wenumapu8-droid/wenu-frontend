# SENTINEL · el guardián del Integration OS

Soy el guardián. No construyo. No decido. **Cuido que el trabajo que ya se
hizo no se pierda otra vez.**

Congelado el 2026-08-30 por Ocín después del ciclo del agotamiento — cuando
15 agentes producían en paralelo y ninguno encontraba el trabajo del otro,
y Ocín era el único puente. Ese ciclo no vuelve.

---

## Si estás por escribir código KODEX, leeme completo antes de tocar nada

Soy tres frases:

**Uno.** Todo lo que estás por construir probablemente ya existe. Puede que
esté orphan, coupled, prototype o superseded. Buscalo antes.

**Dos.** Nada se borra. Si dos versiones divergen, la salida no es elegir
un ganador — es la síntesis que conserva ambos. Ese principio rescató 914
veredictos de triaje el día del G0.

**Tres.** Un componente montado en cero páginas tiene 0% de valor
perceptible. La integración es la unidad de progreso, no el commit.

---

## Antes de escribir código nuevo, producí este bloque

```
EXISTING IMPLEMENTATION SEARCH
  canonical found:      <lista completa, grep -rIl "MiComponente" src/>
  orphan found:         <lista, mismo grep>
  prototype found:      <lista de lab/v0/v1/draft/test)
  deprecated found:     <lista con docstring "DEPRECATED"/"REJECTED">
  related assets:       <atlas KDX-IMG-* / láminas / obras relacionadas>
  related decisions:    <DEC-NNN de 05_DECISION_LEDGER.md>
  REUSE POSSIBLE:       YES / NO
  If NO: reason:        <texto obligatorio>
```

Si no podés producirlo, **no escribas código nuevo**. Volvé al registry.

---

## Los 6 archivos que tenés que abrir antes

```
kodex-system/README.md                    la regla constitucional
kodex-system/00_VAULT_INVENTORY.yaml      dónde vive qué
kodex-system/01_CURRENT_STATE.yaml        qué renderiza cada ruta AHORA
kodex-system/02_SCENE_REGISTRY.yaml       7 escenas + chambers + hueco SILENCE
kodex-system/03_COMPONENT_REGISTRY.yaml   112 componentes, cuál está dónde
kodex-system/05_DECISION_LEDGER.md        47 decisiones + 7 conflictos abiertos
kodex-system/06_INTEGRATION_BACKLOG.yaml  qué INT-XXX está OPEN, BLOCKED, DONE
```

Falta `04_ASSET_ROUTING.yaml` — requiere autoría por asset y no se puede
generar sin decisión de Ocín.

---

## Qué NO puedo dejar pasar

Si escribís código que:

- crea un componente nuevo sin producir el bloque SEARCH — te freno.
- resuelve en silencio un conflicto del `05_DECISION_LEDGER.md` §
  Conflictos abiertos — te freno.
- borra trabajo del otro carril para "consolidar" — te freno.
- toca un archivo con `git status --short` marcándolo modificado por otro
  agente — te freno.
- deploya sin la frase exacta `APROBAR DEPLOY` de Ocín — te freno.
- inventa un dato o telemetría en vez de declarar HUECO — te freno.
- publica una obra de Ocín antes de aprobación del registry (0/25) — te freno.

---

## Los 7 conflictos que solo Ocín destraba

Están en `kodex-system/05_DECISION_LEDGER.md § Conflictos abiertos`.
No los resuelvas por cuenta propia. Si tu trabajo cae en uno, marcá
BLOCKED con referencia al conflicto y seguí con otra unidad.

Resumen:

- **C1** Paleta drift 3 fuentes (yaml vs render vs navmap)
- **C2** ARCHIVE ↔ MACHINE intercambiaron accents en algún commit
- **C3** RETURN blanco canonical vs acid en render
- **C4** Paleta activadores contradice congelado en 4 escenas
- **C5** FOCUS/DORMANT/IDLE naming en carril
- **C6** Mapeo lugar ↔ estado (dos boards contradicen)
- **C7** Activadores = 7 escenas o familia paralela

---

## Definición de DONE nueva

Reemplaza a "componente existe + build passes + commit":

```
DONE = mounted + reachable + interactive + correct asset + correct copy +
       responsive + tested + screenshot verified + deployed + visually accepted
```

**Si falta uno, no está DONE.** No cierres una vuelta del TELAR sin verificar
los 10 puntos.

---

## Coordinación con otros agentes

En KODEX operan simultáneamente:

- **claude-imac-chat** (esta sesión) — vive en `~/kodex-imac-b/`, contexto largo.
- **codex-terminal** (Codex CLI en iMac) — ejecuta el prompt de
  `~/kodex-relevo/PROMPT-CLAUDE-CODE-AHORA.md`.
- **peer** — sesiones del creador Ocín cuando toma el teclado directo.
- **mini** (Mac Mini) — infra + Assembly OS pipeline L6-L10 + parallels.

Regla de reparto:

- Por ARCHIVO, no por tarea. Terminal en `index.astro` → yo no lo toco.
- `git status --short` antes de tocar `.astro` o `.css` grande.
- Si dos agentes convergen en la misma tarea (como pasó con el registry
  el 2026-08-30), no colisión: el último push gana y ambos comparten
  crédito porque el trabajo es idéntico.

---

## Ciclo de trabajo obligatorio

```
DISCOVER (leer los 6 files) →
  RECOVER EXISTING WORK →
    RECONCILE VERSIONS →
      SELECT CANONICAL (o marcar CONFLICTO) →
        DEPRECATE OLD (nunca borrar) →
          MOUNT →
            CONNECT →
              ADD EXISTING ASSETS →
                INTERACTION →
                  MOBILE (composición TEMPORAL, no desktop encogido) →
                    VISUAL REFERENCE CHECK →
                      TEST →
                        DEPLOY (requiere APROBAR DEPLOY de Ocín) →
                          SCREENSHOT →
                            ACCEPT →
                              NEXT
```

---

## Meta

Yo no soy Claude ni Codex ni Gemini. Soy la regla, que existe porque
las reglas orales no sobreviven a los cambios de sesión.

Si me editás, dejá un `## Historia de cambios` al final con la fecha, la
razón y quién autorizó.

**Última congelación**: 2026-08-30 por Ocín.

## Historia de cambios

- 2026-08-30 · congelación inicial post ciclo agotamiento (creador: Ocín).
