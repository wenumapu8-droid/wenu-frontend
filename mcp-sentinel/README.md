# KODEX Sentinel · MCP Server

> **La puerta única al Integration OS.**
> Cualquier agente MCP-compatible que se conecte a este server puede
> consultar TODO el conocimiento consolidado de KODEX sin reconstruirlo.

Congelado el 2026-08-30 por Ocín después del ciclo del agotamiento.

## Qué expone (20 tools)

### Autoridad viva

| Tool | Devuelve |
|------|----------|
| `sentinel_greeting` | Saludo del guardián + reglas constitucionales |
| `get_authority_files` | Lista de los 8 archivos del Integration OS |
| `read_authority` | Contenido de un archivo específico (README, SENTINEL, 00-06) |

### Regla constitucional

| Tool | Devuelve |
|------|----------|
| `search_before_create` | El bloque EXISTING IMPLEMENTATION SEARCH auto-poblado con evidencia grep + registry lookup. Devuelve REUSE POSSIBLE YES/NO |

### Decisiones y conflictos

| Tool | Devuelve |
|------|----------|
| `get_decision` | Busca DEC-NNN por ID o keyword |
| `get_open_conflicts` | Los 7 conflictos abiertos que solo Ocín destraba |

### Estado del proyecto

| Tool | Devuelve |
|------|----------|
| `get_current_state` | Qué está VIVO por ruta (`/kodex/`, `/kodex/folio/i/`, etc.) |
| `get_scene` | Corredor scene o chamber con contract + palette drift |
| `get_component` | Entrada del registry (status, mounted_in, coupled_via) |
| `list_orphans` | Los CANONICAL_ORPHANED reales pendientes de integración |
| `get_backlog` | Tareas INT-XXX filtrable por status |
| `get_visual_gate` | Corre el gate de fidelidad 7/7 |

### Vault y memoria

| Tool | Devuelve |
|------|----------|
| `vault_search` | Grep across kodex-relevo, docs, Obsidian, memory |
| `list_atlas_nodes` | 40 nodos KDX-IMG del atlas (filtrable por escena) |
| `search_drive_urls` | URLs de Google Drive extraídas del ATLAS |
| `read_memory` | Lee una entrada del sistema de memoria persistente |
| `list_memories` | Lista memorias KODEX con resumen de 1 línea |
| `kodex_directories` | Los 18 dirs ~/kodex-* con tipo, tamaño |

### Infraestructura

| Tool | Devuelve |
|------|----------|
| `mini_status` | SSH al Mac Mini + git status/log/branch |

## Instalación

```bash
cd ~/kodex-imac-b/mcp-sentinel
npm install
```

## Configuración

### Claude Code

En `~/.claude/settings.json`:

```json
{
  "mcpServers": {
    "kodex-sentinel": {
      "command": "node",
      "args": ["/Users/user1/kodex-imac-b/mcp-sentinel/server.mjs"]
    }
  }
}
```

Reiniciar Claude Code y las 20 tools aparecen como `mcp__kodex-sentinel__*`.

### Cursor / Windsurf / otros MCP-compatibles

Config equivalente en cada uno. El binario es `node <path>/server.mjs` y usa stdio.

## Uso típico de un agente nuevo

```
1. Invocar sentinel_greeting
2. Invocar get_authority_files
3. Antes de escribir código: search_before_create(component_name)
4. Si REUSE POSSIBLE=YES: usar el componente existente
5. Si REUSE POSSIBLE=NO: crear con justificación explícita
6. Verificar get_open_conflicts antes de resolver ambigüedades
7. Marcar DONE contra la definición nueva (10 puntos)
```

## Extensiones planeadas (Phase 2)

- OAuth Drive → tool `read_drive_file(url)` para leer los 60 URLs directamente
- Chat history → hookup de ChatGPT/Claude/Telegram exports
- Real-time file watchers → notificación de cambios en `kodex-system/`
- Deploy verification → integrar con Cloudflare Pages API

## Fuente y actualización

- Repo: `~/kodex-imac-b/mcp-sentinel/`
- Rama: `imac/telar-a06-a09-a10`
- Al pushear cambios a `kodex-system/`, el server los lee al vuelo (no necesita reload — lee fresh en cada tool call).

## Regla

Si el sistema evoluciona, agregar tools acá. Si una tool ya no aplica, marcarla DEPRECATED en el docstring pero **no borrarla** (regla `NADA SE BORRA` del Integration OS).
