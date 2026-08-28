#!/bin/bash
# Deploy dist/ to the kodex-preview branch alias of the wenu-frontend Pages project.
# NEVER touches production (redesign-v2). Mirror of deploy-now.sh's auth/upload flow.
set -euo pipefail
cd "$(dirname "$0")"

# Load Cloudflare credentials from .env (gitignored) so wrangler can authenticate
set -a; source .env >/dev/null 2>&1 || true; set +a
export CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN

SNAP=/tmp/kodex-preview-snap
rm -rf "$SNAP"
cp -R dist "$SNAP"
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
