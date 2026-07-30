#!/usr/bin/env bash
# Inyecta el plan canónico + la prioridad táctica del día al agente (autocycle).
# Su stdout se antepone al prompt del job en cada corrida (Hermes cron --script en modo agente).
set -uo pipefail
VAULT="/Users/user1/Obsidian/WenuAgent"
echo "===== PLAN ACTIVO WENU (fuente única — leé esto primero) ====="
cat "$VAULT/00-Index/PLAN-ACTIVO-WENU.md" 2>/dev/null || echo "(PLAN-ACTIVO no encontrado)"
echo
echo "===== PRIORIDAD TÁCTICA DEL DÍA (night-priority-plan, auto) ====="
cat "$VAULT/20-Operaciones/night-priority-plan.md" 2>/dev/null || echo "(night-priority-plan no encontrado)"
echo
echo "===== INSTRUCCIÓN ====="
echo "Elegí UNA sola acción, la más prioritaria y accionable del night-priority-plan, respetando las reglas duras del PLAN ACTIVO. No abras frentes nuevos."
