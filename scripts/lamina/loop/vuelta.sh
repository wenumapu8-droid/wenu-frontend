#!/usr/bin/env bash
# KODEX-∞ · UNA VUELTA DEL LOOP DE LÁMINAS
#
# Toma el primer ítem pendiente de cola.json, mide, deja trabajar al agente,
# vuelve a medir y decide: se queda o se revierte. Nunca pregunta.
#
# El loop no existe para que un agente trabaje sin parar. Existe para que un
# agente que trabaja sin parar NO pueda hacer tres cosas: tocar algo que el
# banco no mide, insistir con lo que no baja el número, y tocar main.
#
# Códigos de salida:
#   0  vuelta completa (mejoró o se revirtió, las dos son resultados)
#   3  cuota agotada — el que llama debe esperar y reintentar el mismo ítem
#   4  cola vacía
#   5  compuerta violada — no se trabaja, se avisa
set -uo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$AQUI/../../.." && pwd)"
CONF="$AQUI/loop.conf"
COLA="$AQUI/cola.json"

[[ -f "$CONF" ]] || { echo "falta $CONF — copiá loop.conf.ejemplo y completalo"; exit 5; }
# shellcheck source=/dev/null
source "$CONF"

: "${AGENTE_CMD:?falta AGENTE_CMD en loop.conf}"
: "${PATRON_CUOTA:=403|quota|cuota|rate.?limit|insufficient|out of credit}"
: "${BITACORA:=bitacora}"
: "${NOMBRE_AGENTE:=kimi}"

log() { printf '  %s\n' "$*"; }
jq_node() { node -e "$1" "${@:2}"; }

cd "$REPO" || exit 5

# ── compuertas ──────────────────────────────────────────────────────────────
[[ -f "$AQUI/PARAR" ]] && { log "PARAR presente — no se trabaja"; exit 5; }

RAMA="$(git rev-parse --abbrev-ref HEAD)"
case "$RAMA" in
  wip/*) ;;
  *) log "COMPUERTA: la rama es '$RAMA' y el loop sólo trabaja en wip/*. No se toca."; exit 5 ;;
esac

# Sólo lo trackeado: los sin-seguimiento (.opencode/, graphify-out/, artefactos
# de otros agentes) no son trabajo a medias y no tienen por qué frenar el loop.
if ! git diff --quiet HEAD -- . ':!scripts/lamina/out'; then
  log "COMPUERTA: hay cambios sin commitear. El loop no arranca sobre un árbol sucio."
  exit 5
fi

SLUG="$(jq_node 'console.log(require(process.argv[1]).slug)' "$COLA")"
[[ -n "$SLUG" ]] || { log "cola.json sin slug"; exit 5; }

# ── ítem ────────────────────────────────────────────────────────────────────
ITEM="$(jq_node '
  const c = require(process.argv[1]);
  const i = c.items.find(x => x.estado === "pendiente");
  if (!i) process.exit(4);
  if (!i.region) { console.error("SIN_REGION " + i.id); process.exit(5); }
  console.log(JSON.stringify(i));
' "$COLA")" || { c=$?; [[ $c -eq 4 ]] && { log "cola vacía"; exit 4; }; log "ítem sin región medible — rechazado"; exit 5; }

ID="$(jq_node 'console.log(JSON.parse(process.argv[1]).id)' "$ITEM")"
REGION="$(jq_node 'console.log(JSON.parse(process.argv[1]).region)' "$ITEM")"
UMBRAL="$(jq_node 'const i=JSON.parse(process.argv[1]);console.log(i.umbral ?? 0.03)' "$ITEM")"

# La región tiene que existir de verdad en el archivo de regiones del slug.
if ! jq_node '
  const r = require(process.argv[1]);
  process.exit(r.regions.some(x => x.id === process.argv[2]) ? 0 : 1);
' "$REPO/scripts/lamina/regions/$SLUG.json" "$REGION"; then
  log "COMPUERTA: la región '$REGION' no existe en regions/$SLUG.json"
  exit 5
fi

BASE_COMMIT="$(git rev-parse HEAD)"
log "vuelta · $ID · región $REGION · umbral $UMBRAL · base $BASE_COMMIT"

# ── medición previa ─────────────────────────────────────────────────────────
medir() {
  node "$REPO/scripts/lamina/iterate.mjs" "$SLUG" >/dev/null 2>&1 || return 1
  jq_node '
    const s = require(process.argv[1]);
    const r = s.regiones.find(x => x.id === process.argv[2]);
    console.log(`${s.global.pct} ${r ? r.pct : "NaN"}`);
  ' "$REPO/scripts/lamina/out/$SLUG/score.json" "$REGION"
}

MEDIDA="$(medir)" || { log "no se pudo medir la línea base"; exit 5; }
read -r G0 R0 <<<"$MEDIDA"
[[ -n "${R0:-}" && "$R0" != "NaN" ]] || { log "la región $REGION no aparece en score.json"; exit 5; }
log "base: global $G0 · $REGION $R0"

# ── el agente ───────────────────────────────────────────────────────────────
PROMPT="$(jq_node '
  const i = JSON.parse(process.argv[1]);
  console.log([
    `Lámina ${process.argv[2]}, región ${i.region}. Puntaje actual de la región: ${process.argv[3]} %.`,
    ``,
    `Leé KIMI-BRIEF-LAMINAS.md antes de tocar nada. El ciclo obligatorio es:`,
    `medir con _medir_region_components.mjs y perfil.mjs, CLASIFICAR la región`,
    `con la tabla del brief, recién después actuar. Ajustar a ojo no está en la tabla.`,
    ``,
    `Objetivo: ${i.objetivo}`,
    i.aviso ? `\nAviso: ${i.aviso}` : ``,
    ``,
    `Commiteá en la rama actual cuando termines. No mergees, no despliegues, no`,
    `toques main, no pushees. Si el número no baja, decilo y no insistas: el loop`,
    `revierte solo y pasa al ítem siguiente.`,
  ].join("\n"));
' "$ITEM" "$SLUG" "$R0")"

SALIDA="$(mktemp)"
set +e
eval "$AGENTE_CMD" <<<"$PROMPT" >"$SALIDA" 2>&1
CODIGO=$?
set -e
tail -n 40 "$SALIDA" | sed 's/^/  | /'

if grep -qiE "$PATRON_CUOTA" "$SALIDA"; then
  log "CUOTA agotada — se revierte lo que haya quedado a medias y se reintenta después"
  git reset --hard "$BASE_COMMIT" >/dev/null 2>&1
  rm -f "$SALIDA"
  exit 3
fi
rm -f "$SALIDA"
[[ $CODIGO -ne 0 ]] && log "el agente salió con código $CODIGO — se mide igual, el número manda"

# ── medición posterior y veredicto ──────────────────────────────────────────
MEDIDA="$(medir)" || { log "no se pudo medir después; se revierte"; git reset --hard "$BASE_COMMIT" >/dev/null; exit 0; }
read -r G1 R1 <<<"$MEDIDA"

DELTA="$(jq_node 'console.log((Number(process.argv[1]) - Number(process.argv[2])).toFixed(3))' "$R1" "$R0")"
MEJORA="$(jq_node 'console.log(Number(process.argv[2]) - Number(process.argv[1]) >= Number(process.argv[3]) ? 1 : 0)' "$R1" "$R0" "$UMBRAL")"
log "después: global $G1 · $REGION $R1  (Δ $DELTA)"

if [[ "$MEJORA" == "1" ]]; then
  VEREDICTO="mejora"
  [[ -n "$(git status --porcelain -- ':!scripts/lamina/out')" ]] && \
    git commit -qam "[$SLUG] $ID: $REGION $R0% -> $R1%" || true
  NUEVO_ESTADO="hecho"
else
  VEREDICTO="sin mejora, revertido"
  git reset --hard "$BASE_COMMIT" >/dev/null
  NUEVO_ESTADO="sin_mejora"
fi
log "veredicto: $VEREDICTO"

# ── estado y bitácora ───────────────────────────────────────────────────────
node -e '
  const fs = require("fs"), p = process.argv[1];
  const c = JSON.parse(fs.readFileSync(p, "utf8"));
  const i = c.items.find(x => x.id === process.argv[2]);
  i.estado = process.argv[3];
  i.ultimo = { antes: process.argv[4], despues: process.argv[5], delta: process.argv[6] };
  fs.writeFileSync(p, JSON.stringify(c, null, 2) + "\n");
' "$COLA" "$ID" "$NUEVO_ESTADO" "$R0" "$R1" "$DELTA"

command -v "$BITACORA" >/dev/null && \
  "$BITACORA" "$NOMBRE_AGENTE" "KODEX loop $SLUG · $ID · region $REGION $R0 -> $R1 (delta $DELTA), global $G0 -> $G1. Veredicto: $VEREDICTO. Rama $RAMA, base $BASE_COMMIT." >/dev/null 2>&1

exit 0
