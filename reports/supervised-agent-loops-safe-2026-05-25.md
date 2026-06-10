# Supervised agent loops — safe setup — 2026-05-25

Fecha de corte: 2026-05-25 13:33:07 PDT

## Decisión
No dejar múltiples agentes escribiendo sin frontera sobre el mismo repo.

Sí dejar **loops supervisados por lane**, con alcance acotado, salida en reportes locales y sin publish, sin push y sin tocar WordPress live.

## Estado de runners
- Claude Code: instalado y autenticado
- Codex CLI: instalado
- OpenCode: instalado pero **sin credenciales activas** (`0 credentials`)

## Regla operativa
Cada runner trabaja una sola lane por vez.

- **Claude Code** → dirección visual, auditoría de jerarquía, propuesta de integración de assets
- **Codex** → tareas mecánicas y reportes locales
- **OpenCode** → no usar hasta resolver auth

## Loop 1 — Claude Code — visual audit loop
### Objetivo
Revisar el frontend clave y producir un reporte accionable de polish visual sin tocar producción.

### Workdir
`/Users/user1/wenu-frontend`

### Prompt sugerido
```text
You are Claude Code working in /Users/user1/wenu-frontend on branch redesign-v2.

Read first:
1. CLAUDE.md
2. reports/design-action-plan-2026-05-22.md
3. reports/final-publish-readiness-2026-05-25.md
4. reports/identity-next-brief-2026-05-25.md

TASK:
Audit the visual coherence of the new Wenu Mapu identity across:
- src/pages/index.astro
- src/pages/shop.astro
- src/pages/p/[slug].astro
- src/pages/about.astro
- src/pages/contact.astro
- src/pages/local.astro

DELIVERABLE:
Write only one report:
reports/claude-visual-audit-loop-2026-05-25.md

REPORT MUST INCLUDE:
- what already feels premium
- what still feels inconsistent or provisional
- exact file-by-file fixes to do next
- which assets in public/img/brand, public/img/hero, public/img/categories should be promoted first

FORBIDDEN:
- no deploy
- no push
- no commit
- no WordPress
- no Woo writes
- no Noco writes
- no .env edits
- no image generation for products
- no deleting files
```

### Ejecución segura sugerida
Usar `claude -p` o sesión tmux dedicada, y capturar solo el reporte local.

## Loop 2 — Codex — catalog visual prep loop
### Objetivo
Preparar cola comercial local para productos READY sin hacer writes externos.

### Workdir
`/Users/user1/wenu-frontend`

### Prompt sugerido
```text
You are Codex working in /Users/user1/wenu-frontend on branch redesign-v2.

Read first:
1. reports/visual-queue-next-actions-2026-05-20.md
2. reports/final-publish-readiness-2026-05-25.md
3. reports/identity-next-brief-2026-05-25.md

TASK:
Prepare a local-only next-step report for the READY product visual queue.
Focus on:
- technical sheet candidates
- category banner candidates
- which READY items have enough real references to move first

DELIVERABLE:
Write only:
reports/codex-visual-queue-loop-2026-05-25.md

FORBIDDEN:
- no Woo writes
- no Noco writes
- no git commit/push
- no deploy
- no image generation for product imagery
- no deleting files
```

### Ejecución segura sugerida
Usar `codex exec` con alcance acotado y salida a reporte local.

## OpenCode
No lanzar todavía.

### Bloqueo actual
`opencode auth list` devuelve `0 credentials`.

### Próximo paso cuando toque
- autenticar provider
- hacer smoke test
- recién después asignarle una lane read-only

## Modo watchdog recomendado
Si se desea supervisión continua, usar un cron o watchdog que:
- revise si hay reporte nuevo
- notifique por Telegram
- no modifique repo
- no vuelva a disparar agentes por su cuenta

## Stop rules
- si un runner pide credenciales → stop
- si un runner intenta publicar o empujar cambios → stop
- si un runner entra en tareas de WordPress / Woo / Noco live → stop
- si un runner empieza a inventar imágenes de producto → stop

## Resultado esperado
Queda lista una operación segura de dos lanes:
- Claude define polish visual
- Codex ordena cola visual/comercial
- OpenCode queda en espera hasta autenticación
