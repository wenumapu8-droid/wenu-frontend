#!/bin/bash
# Deploy dist/ to the kodex-preview branch alias of the wenu-frontend Pages project.
# NEVER touches production (redesign-v2). Mirror of deploy-now.sh's auth/upload flow.
set -euo pipefail
cd "$(dirname "$0")"

# Load Cloudflare credentials from .env (gitignored) so wrangler can authenticate
set -a; source .env >/dev/null 2>&1 || true; set +a
export CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN

# ── EL DEPLOY TAMBIÉN NECESITA EL LOCK · 2026-08-31 ─────────────────────
# El deploy LEE dist. Si otro agente buildea mientras `cp -R` está copiando,
# los archivos desaparecen bajo la copia y el snapshot sale roto.
#
# Pasó de verdad hoy: el primer intento de deploy escupió decenas de
# "cp: dist/xxx: No such file or directory" — no era corrupción del disco ni
# permisos, era un build concurrente borrando dist a mitad del snapshot.
#
# El lock de build ya protegía a quien MIDE sobre dist. Faltaba proteger a
# quien lo COPIA, que es la operación más larga y la más cara si falla.
KDX_AGENTE=${KDX_AGENTE:-deploy}
if ! node scripts/kodex-equipo.mjs build "$KDX_AGENTE" >/dev/null 2>&1; then
  echo "✗ DEPLOY ABORTADO · el build está tomado por otro agente."
  echo "  Un snapshot tomado durante un build ajeno sale incompleto."
  echo "  Mirá quién lo tiene:  node scripts/kodex-equipo.mjs quien"
  exit 1
fi
# El lock se suelta pase lo que pase: si el deploy muere, nadie queda trabado.
trap 'node scripts/kodex-equipo.mjs libre >/dev/null 2>&1' EXIT
echo "=== LOCK tomado por $KDX_AGENTE ==="

SNAP=/tmp/kodex-preview-snap
rm -rf "$SNAP"
cp -R dist "$SNAP"
# ── PODA DEL SNAPSHOT · 2026-08-31 ───────────────────────────────────────
# `dist/.prerender/` son INTERMEDIOS DE BUILD, no sitio: los chunks .mjs que
# Astro usa para renderizar y que ningún visitante puede alcanzar. Se
# estaban subiendo enteros en cada deploy.
#
#   38 MB · 270 archivos · cero de ellos servibles
#
# Los deploys cortan por EPIPE alrededor de 3144/3840 archivos sobre el
# enlace Chile-EEUU. Sacar 270 archivos NO resuelve el problema de fondo
# —eso es el sprint de R2— pero es peso que nunca debió viajar, y cada
# archivo menos es una oportunidad menos de que el enlace se corte.
#
# Se poda el SNAPSHOT, nunca el dist: el build queda intacto para los gates
# que miden sobre él.
antes=$(find "$SNAP" -type f | wc -l | tr -d ' ')
[ -d "$SNAP/.prerender" ] && rm -rf "$SNAP/.prerender"
echo "=== PODA: $antes -> $(find "$SNAP" -type f | wc -l | tr -d ' ') archivos · $(du -sh "$SNAP" | cut -f1) ==="

echo "=== SNAPSHOT taken $(date +%T) ==="
[ -f "$SNAP/kodex/index.html" ] || { echo "FALTA kodex/index.html"; exit 1; }

source "$HOME/.nvm/nvm.sh" >/dev/null 2>&1
nvm use >/dev/null 2>&1

# 2026-08-28 · PATCH 4.7 · retry aumentado a 8 con backoff exponencial +
# NODE_OPTIONS para HTTP más tolerante. Wrangler ya dedupe archivos por
# hash, así que reintentos no re-suben lo que ya subió. Los deploys del
# enlace Chile-EEUU se cortan al 95% por timeout individual de archivo
# grande; con 8 intentos y backoff hasta 60s hay margen sin necesidad de
# offload a R2 (aunque ese sprint sigue disponible: ver parches-listos
# PATCHES 4.1-4.5).
for i in 1 2 3 4 5 6 7 8; do
  echo "=== DEPLOY attempt $i $(date +%T) ==="
  if NODE_OPTIONS="--max-http-header-size=32768" \
     npx --yes wrangler@latest pages deploy "$SNAP" \
     --project-name=wenu-frontend --branch=kodex-preview --commit-dirty=true; then
    echo "=== DEPLOY OK on attempt $i $(date +%T) ==="
    exit 0
  fi
  echo "=== attempt $i failed, retrying ==="
  # Backoff exponencial capado: 5s, 10s, 20s, 40s, 60s, 60s, 60s
  delay=$((5 * (2 ** (i - 1))))
  [ $delay -gt 60 ] && delay=60
  sleep $delay
done
echo "=== DEPLOY FAILED after 8 attempts ==="
exit 1
