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

for i in 1 2 3; do
  echo "=== DEPLOY attempt $i $(date +%T) ==="
  if npx --yes wrangler@latest pages deploy "$SNAP" --project-name=wenu-frontend --branch=kodex-preview --commit-dirty=true; then
    echo "=== DEPLOY OK $(date +%T) ==="
    exit 0
  fi
  echo "=== attempt $i failed, retrying ==="
  sleep 5
done
echo "=== DEPLOY FAILED after 3 attempts ==="
exit 1
