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

: "${ESPERA_CUOTA:=1800}"   # segundos entre sondeos cuando se agota la cuota
: "${ESPERA_COLA:=1800}"    # segundos a dormir con la cola vacía, en --siempre
: "${MAX_VUELTAS:=0}"       # 0 = sin límite
: "${MAX_ESPERAS:=24}"      # sondeos seguidos sin cuota antes de rendirse

ESPERAS=0
REPO="$(cd "$AQUI/../../.." && pwd)"

# ── publicación continua, sólo a PREVIEW ────────────────────────────────────
# Publica después de cada vuelta que dejó un commit nuevo. Nunca toca
# producción: `deploy-kodex-preview.sh` despliega al alias `kodex-preview` del
# proyecto de Pages y lo dice en su primera línea.
#
# Producción es OTRA COSA y no va acá. La regla del creador es permanente: sin
# deploy a producción sin la frase literal APROBAR DEPLOY, y sólo `redesign-v2`,
# nunca `main`. Un loop que publica solo a producción convierte cada vuelta sin
# revisar en algo que ve el público, y la revisión es justamente la compuerta
# que él se reservó.
publicar_preview() {
  [[ "${PUBLICAR_PREVIEW:-0}" == "1" ]] || return 0

  local sha previo
  sha="$(git -C "$REPO" rev-parse HEAD)"
  previo="$(cat "$AQUI/.ultimo-publicado" 2>/dev/null || true)"
  if [[ "$sha" == "$previo" ]]; then
    echo "[$(date '+%F %T')] preview: nada nuevo que publicar"
    return 0
  fi

  echo "[$(date '+%F %T')] preview: publicando $sha"
  if (cd "$REPO" && eval "${PUBLICAR_CMD:-./deploy-kodex-preview.sh}") >>"$AQUI/registro/preview.log" 2>&1; then
    echo "$sha" >"$AQUI/.ultimo-publicado"
    echo "[$(date '+%F %T')] preview: ok"
    command -v "${BITACORA:-bitacora}" >/dev/null && \
      "${BITACORA:-bitacora}" "${NOMBRE_AGENTE:-loop}" "KODEX loop publico preview del commit $sha" >/dev/null 2>&1
  else
    # Un fallo de publicación no puede matar el loop: el trabajo ya está
    # commiteado y la próxima vuelta reintenta.
    echo "[$(date '+%F %T')] preview: FALLÓ — ver registro/preview.log. El loop sigue."
  fi
}

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
      ESPERAS=0
      publicar_preview
      ;;
    3)
      # La cuota se repone en ventana (~5 h), pero la ventana corre desde el
      # primer uso y no desde una hora fija del reloj. Dormir cinco horas de una
      # sentada llegaría tarde casi siempre: si la reposición cayó a los veinte
      # minutos, se pierden cuatro horas y media de producción. Por eso se
      # SONDEA cada ESPERA_CUOTA en vez de esperar la ventana entera — retoma
      # dentro de la media hora de que vuelva, de día o de noche.
      ESPERAS=$((ESPERAS + 1))
      VUELTAS=$((VUELTAS - 1))   # no cuenta: no se trabajó
      if [[ "$ESPERAS" -ge "$MAX_ESPERAS" ]]; then
        echo "[$(date '+%F %T')] $ESPERAS sondeos seguidos sin cuota — eso ya no es la ventana, es otra cosa. Se detiene."
        exit 3
      fi
      echo "[$(date '+%F %T')] sin cuota (sondeo $ESPERAS/$MAX_ESPERAS) — reintenta el mismo ítem en ${ESPERA_CUOTA}s"
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
