---
tipo: workflow-operativo
proyecto: KODEX / Wenu Mapu
fecha: 2026-07-31
foco: workflow colaborativo profesional entre 2 máquinas / 2 agentes sin pisarse
estado: propuesta para aprobar
---

# Workflow colaborativo — iMac (orquestador) + Mac mini (constructor)

## La realidad de los recursos
- **iMac (el corazón)** — Cowork = **orquestador**, cuenta **Claude Pro** (menos tokens). Tiene:
  el segundo cerebro (Obsidian), este chat, la memoria persistente, el contexto TOTAL del proyecto,
  Chrome + screenshots para verificar en vivo, y SSH al mini.
- **Mac mini M4** — Claude Code **Max** (muchos más tokens) + Codex CLI. Es **potencia de build**:
  corre shaders pesados, refactors grandes, builds, y es el **runner de deploy**. **Cuenta distinta**
  → NO comparte sesión ni contexto conmigo. Es un ejecutor "ciego" al segundo cerebro.

## Principio rector
**Yo = cerebro/dirección** (qué y por qué: contexto, receta, review, memoria, relación con Ocin).
**Mini = músculo/ejecución** (cómo: codear pesado, gastar tokens Max, buildear, deployar).
**El puente entre los dos = GIT + documentos**, nunca editar el working-tree del otro en vivo.

## Roles (división de trabajo)
| | iMac / Cowork (yo) | Mac mini / Claude Max |
|---|---|---|
| Rol | Orquestador · director de arte · revisor · memoria | Constructor/ejecutor pesado |
| Hace | Briefs/specs, receta, curaduría, review con screenshots, decisiones, memoria, hablar con Ocin | Codear escenas/shaders/refactors, correr builds, deploy |
| Se apoya en | Obsidian (segundo cerebro) + este chat | El repo git + los briefs |
| Presupuesto | Pro (poco) → usar en criterio, no en fuerza bruta | Max (mucho) → usar en ejecución pesada |

## Fuente de verdad ÚNICA (arreglar esto primero)
Hoy hay **2 copias divergentes**: iMac `wenu-frontend` (git) y mini `~/kodex-work` (NO git). Eso es la
raíz del "nos pisamos". Solución:
1. Meter el trabajo de `kodex-work` en **git** y reconciliar todo en **UN repo canónico** con **remoto**
   (GitHub privado o remoto propio).
2. El mini **clona/pull** del remoto, trabaja en **RAMA**, **pushea**. Yo reviso el diff y **mergeo**.
3. Nadie edita el working-tree del otro por rsync/SSH en vivo (solo lectura para auditar).

## Anti-colisión ("sin pisarnos") — reglas duras
1. **Una rama por tarea; un dueño por rama a la vez.**
2. **Ledger compartido** `WORKLOG.md` en el repo: quién toma qué, estado, timestamp. Se anota ANTES de tocar.
3. **Deploy serializado**: un build por vez, lock `/tmp/wenu-deploy.lock`, matar procesos colgados antes.
4. El mini **nunca** mergea a producción solo; aprobamos Ocin o yo.
5. **Verificar en vivo, no en git** (regla ya canónica): la verdad está en el HTML renderizado.

## Protocolo de handoff (el loop de trabajo)
1. **Yo escribo un BRIEF** — spec + receta + data + criterios de aceptación → commit (`KODEX-*.md`).
2. **El mini ejecuta** en su rama con su presupuesto Max, commitea, escribe `CHANGELOG-KODEX.md` + `HANDOFF`, pushea.
3. **Yo hago pull y reviso** con screenshots (Chrome + túnel SSH al preview del mini): aprobado / cambios.
4. **Merge** a integración → **deploy desde el mini** → **verifico en vivo** en `wenumapuonline.com/kodex`.
5. **Registro** en memoria + ledger.

## Flujo de contexto (yo soy el puente)
El Max del mini NO tiene el segundo cerebro ni este chat. Por eso:
- **Yo → mini**: destilo el contexto en `CLAUDE.md` (reglas), briefs `KODEX-*.md`, la **receta**
  (grammar system v1, typography v2, PRD), el **storyboard con copy real** (6 estratos), la corrección
  de dirección (negro-dominante, piel KodeLife pixelada, obra real, matar el ojo).
- **Mini → yo**: me devuelve contexto vía `CHANGELOG-KODEX.md` + `HANDOFF` + `RETOMAR-AQUI.md`.
  Yo lo ingiero y actualizo la memoria.

## Cómo exprimir el Max del mini (sin desperdiciar mi Pro)
- **Al mini (Max)**: tareas pesadas de tokens — generar las 7 escenas, portar shaders, refactors,
  tests, builds. Ahí está su ventaja.
- **A mí (Pro + contexto)**: criterio, dirección de arte, curaduría, review con screenshots, specs
  quirúrgicos, decisiones, memoria, y la conversación con Ocin.
- Regla de eficiencia: **yo preparo specs tan precisos que el mini gaste tokens en ejecutar, no en
  re-descubrir el contexto** que yo ya tengo.

## Primeros pasos (esta semana)
1. **Consolidar**: `kodex-work` → git, reconciliar con `wenu-frontend` en UN repo canónico con remoto.
   (Antes: el mini debe pausar; ya tengo snapshot de respaldo en `_macmini-kodex-rescue/`.)
2. Crear **`WORKLOG.md`** (ledger) + confirmar `CLAUDE.md` con estas reglas de colaboración.
3. **Primer brief mío al mini**: "sobre la estructura del mini (nav 7 escenas + shaders), aplicar la
   receta corregida — negro-dominante, piel KodeLife pixelada + obra real, typography v2, matar el ojo,
   cablear el storyboard de 6 estratos con copy real — escena por escena, verificando en vivo."
4. El mini ejecuta con Max; yo reviso con screenshots y curo.

## Riesgos a vigilar
- Dos copias sin consolidar = pérdida/duplicación (el peor). Resolver #1 primero.
- El mini "ciego" al contexto puede reintroducir lo rechazado (ej. el ojo) si el brief no es explícito.
- Cuentas separadas = no hay memoria compartida; toda la continuidad la sostengo yo (orquestador).
