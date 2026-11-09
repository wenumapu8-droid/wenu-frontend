#!/bin/bash
# CENTINELA DE TRABAJO EN CURSO · KODEX−∞
#
# El 26-08 Hermes mató una medición completa "para aliviar el Mini" al verla
# usando CPU. No fue un error suyo: Playwright y Astro consumen mucho por
# diseño durante minutos, y para un vigilante externo son indistinguibles de
# un proceso desbocado.
#
# Este archivo es el canal que faltaba. Cualquier agente que limpie procesos
# debe leerlo ANTES de matar nada.
#
#   . scripts/kodex/centinela.sh
#   centinela_abrir "medicion del gate de experiencia"
#   ... trabajo pesado ...
#   centinela_cerrar        # también corre solo al salir, vía trap
#
# Para el que limpia:
#   cat /tmp/kodex-trabajo-en-curso   → PID, desde cuándo, y qué está haciendo
#   Si el PID vive, ese árbol de procesos es trabajo legítimo. No matarlo.

CENTINELA=/tmp/kodex-trabajo-en-curso

centinela_abrir() {
  cat > "$CENTINELA" <<FIN
PID=$$
DESDE=$(date -u +%Y-%m-%dT%H:%M:%SZ)
QUE=${1:-trabajo de KODEX}
MAQUINA=$(hostname)
NOTA=Proceso legitimo en curso. Usa mucha CPU por diseno (Astro/Playwright).
NOTA=No matar mientras el PID viva. Si el PID ya no existe, este archivo es basura.
FIN
  trap centinela_cerrar EXIT INT TERM
}

centinela_cerrar() {
  [ -f "$CENTINELA" ] && grep -q "PID=$$" "$CENTINELA" 2>/dev/null && rm -f "$CENTINELA"
}

# ¿Hay trabajo ajeno en curso? Devuelve 0 si sí, con el detalle en stdout.
centinela_ocupado() {
  [ -f "$CENTINELA" ] || return 1
  local p; p=$(grep '^PID=' "$CENTINELA" | cut -d= -f2)
  if [ -n "$p" ] && kill -0 "$p" 2>/dev/null; then cat "$CENTINELA"; return 0; fi
  rm -f "$CENTINELA"   # centinela huérfano: el proceso ya no existe
  return 1
}
