#!/usr/bin/env bash
# KODEX-∞ · LOOP DE LÁMINAS
#
# Corre vueltas hasta que la cola se vacíe o alguien escriba PARAR. Cuando se
# acaba la cuota, duerme y retoma el mismo ítem donde estaba.
#
# Uso:
#   scripts/lamina/loop/loop.sh              # hasta vaciar la cola
#   scripts/lamina/loop/loop.sh --siempre    # y después queda esperando ítems
#
# Para pararlo:  touch scripts/lamina/loop/PARAR
set -uo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONF="$AQUI/loop.conf"
# shellcheck source=/dev/null
[[ -f "$CONF" ]] && source "$CONF"

: "${ESPERA_CUOTA:=3600}"   # segundos a dormir cuando se agota la cuota
: "${ESPERA_COLA:=1800}"    # segundos a dormir con la cola vacía, en --siempre
: "${MAX_VUELTAS:=0}"       # 0 = sin límite

SIEMPRE=0
[[ "${1:-}" == "--siempre" ]] && SIEMPRE=1

VUELTAS=0
mkdir -p "$AQUI/registro"

while :; do
  if [[ -f "$AQUI/PARAR" ]]; then
    echo "[$(date '+%F %T')] PARAR presente — el loop termina"
    exit 0
  fi

  if [[ "$MAX_VUELTAS" -gt 0 && "$VUELTAS" -ge "$MAX_VUELTAS" ]]; then
    echo "[$(date '+%F %T')] límite de $MAX_VUELTAS vueltas alcanzado"
    exit 0
  fi

  VUELTAS=$((VUELTAS + 1))
  MARCA="$(date '+%Y%m%d-%H%M%S')"
  echo "[$(date '+%F %T')] vuelta $VUELTAS"

  "$AQUI/vuelta.sh" 2>&1 | tee "$AQUI/registro/$MARCA.log"
  CODIGO="${PIPESTATUS[0]}"

  case "$CODIGO" in
    0)
      # Una vuelta que revierte también es una vuelta completa. No se reintenta.
      ;;
    3)
      echo "[$(date '+%F %T')] cuota agotada — durmiendo ${ESPERA_CUOTA}s"
      VUELTAS=$((VUELTAS - 1))   # no cuenta: no se trabajó
      sleep "$ESPERA_CUOTA"
      ;;
    4)
      if [[ "$SIEMPRE" -eq 1 ]]; then
        echo "[$(date '+%F %T')] cola vacía — durmiendo ${ESPERA_COLA}s"
        sleep "$ESPERA_COLA"
      else
        echo "[$(date '+%F %T')] cola vacía — el loop termina"
        exit 0
      fi
      ;;
    5)
      # Compuerta violada: rama equivocada, árbol sucio, ítem sin región. Eso no
      # se resuelve reintentando, y reintentar en bucle es justamente el modo de
      # fallo que este loop existe para evitar.
      echo "[$(date '+%F %T')] COMPUERTA — el loop se detiene y espera a una persona"
      exit 5
      ;;
    *)
      echo "[$(date '+%F %T')] código inesperado $CODIGO — el loop se detiene"
      exit "$CODIGO"
      ;;
  esac
done
