#!/usr/bin/env bash
# Runs ON the M4. Build + deploy to an ISOLATED preview branch (does NOT touch
# production redesign-v2). Branch name passed as $1 (default: preview).
set -uo pipefail
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
cd /tmp/wenu-build || { echo "NO_REPO"; exit 9; }
BRANCH="${1:-preview}"

set -a; source .env >/dev/null 2>&1; set +a
export CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN

echo "=== M4 NODE $(node -v) $(date +%T) · branch=$BRANCH ==="
npm install --no-audit --no-fund
npm run build
BUILD_EXIT=$?
echo "=== BUILD EXIT $BUILD_EXIT $(date +%T) ==="
[ $BUILD_EXIT -ne 0 ] && { echo "ABORT: build failed"; exit 1; }

SNAP=/tmp/wenu-preview-snap
rm -rf "$SNAP"; cp -R dist "$SNAP"
echo "kodex present: $([ -f "$SNAP/kodex/index.html" ] && echo yes || echo NO)"

echo "=== DEPLOY START $(date +%T) ==="
DEPLOY_EXIT=1
for i in $(seq 1 8); do
  echo "--- attempt $i $(date +%T) ---"
  npx --yes wrangler@latest pages deploy "$SNAP" --project-name=wenu-frontend --branch="$BRANCH" --commit-dirty=true 2>&1
  DEPLOY_EXIT=$?
  [ $DEPLOY_EXIT -eq 0 ] && break
  sleep 4
done
echo "=== DEPLOY EXIT $DEPLOY_EXIT $(date +%T) ==="
echo "M4_PREVIEW_DONE=$DEPLOY_EXIT $(date +%T)"
exit $DEPLOY_EXIT
