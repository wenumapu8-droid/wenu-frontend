# OpenCode Integration — 2026-05-15

## Identity

- **Agent:** OpenCode (opencode CLI tool)
- **Interface:** Terminal-based (VS Code integrated terminal)
- **Model:** big-pickle (OpenCode backend)
- **Workspace:** `~/wenu-frontend/`

## Role

Opera como **T1 + T2 dual** según la tarea:

| Mode | Track | When |
|---|---|---|
| **T1 (Claude Code)** | Audit / plan / verify / read-only | Análisis, reports, verificación de builds, seguridad, orquestación multi-agente |
| **T2 (OpenCode)** | Code edit / implement | Editar `src/`, crear páginas, componentes, scripts. Commits con aprobación |

## Capabilities

- Read/write filesystem con herramientas especializadas (Read, Write, Edit, Glob, Grep)
- Bash execution (no `sudo`, no destructive commands sin aprobación)
- Web search + fetch (información externa, APIs, docs)
- Multi-agent orchestration (Task tool para lanzar subagentes)
- Diseño UI/UX (skill `ui-ux-pro-max` — 67 estilos, 96 paletas, responsive)
- Diagnóstico de bugs (skill `diagnose`)
- Modo compacto (skill `caveman` — 75% menos tokens)

## Constraints (binding)

- Mismas reglas que `DO_NOT_TOUCH.md` — no tocar DNS, prod, secrets, tunnel, WC writes
- Edits en `agent-control/` requieren aprobación
- Commits requieren aprobación por accion
- No `sudo`, no `git push`, no `rm -rf`
- Secrets redactados siempre

## How to invoke

| Task type | Command |
|---|---|
| Nueva feature / bugfix en `src/` | `Prompt #2` de `PROMPTS_FOR_AGENTS.md` |
| Audit / plan / research | `Prompt #1` de `PROMPTS_FOR_AGENTS.md` |
| Tarea de `TASK_QUEUE.md` | Asignar entry → OpenCode lee y arranca scope statement |
| Emergencia (build roto, bug critico) | Invocar directo con descripción del problema |

## Current handoff gate

OpenCode está en sesión activa. Para handoff a otro agente:
1. OpenCode produce end-of-task report (formato `AGENT_HANDOFF_PROTOCOL.md`)
2. Actualiza `CURRENT_STATE.md` si cambió estado relevante
3. El siguiente agente lee `TASK_QUEUE.md` + `CURRENT_STATE.md` + este handoff
