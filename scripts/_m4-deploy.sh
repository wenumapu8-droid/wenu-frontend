#!/usr/bin/env bash
# Runs ON the M4. Build + verify snapshot + wrangler deploy (with retry).
# Creds (CLOUDFLARE_*, WC_*) come from /tmp/wenu-build/.env synced with the repo.
set -uo pipefail
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
cd /tmp/wenu-build || { echo "NO_REPO"; exit 9; }

set -a; source .env >/dev/null 2>&1; set +a
export CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_API_TOKEN

echo "=== M4 NODE $(node -v) $(date +%T) ==="
echo "=== BUILD START $(date +%T) ==="
npm install --no-audit --no-fund
npm run build
BUILD_EXIT=$?
echo "=== BUILD EXIT $BUILD_EXIT $(date +%T) ==="
if [ $BUILD_EXIT -ne 0 ]; then echo "ABORT: build failed"; exit 1; fi

SNAP=/tmp/wenu-deploy-snap
rm -rf "$SNAP"; cp -R dist "$SNAP"
HOME_OK=$([ -f "$SNAP/index.html" ] && echo yes || echo no)
PCOUNT=$(ls "$SNAP/p/" 2>/dev/null | wc -l | tr -d ' ')
SHOP_OK=$([ -f "$SNAP/shop/index.html" ] && echo yes || echo no)
GAL=$(grep -l "pdp-stage-img" "$SNAP"/p/*/index.html 2>/dev/null | head -1)
GAL_OK=$([ -n "$GAL" ] && echo yes || echo no)
echo "VERIFY home=$HOME_OK shop=$SHOP_OK products=$PCOUNT gallery=$GAL_OK"
if [ "$HOME_OK" != yes ] || [ "$SHOP_OK" != yes ] || [ "$PCOUNT" -lt 50 ] || [ "$GAL_OK" != yes ]; then
  echo "ABORT: snapshot incomplete"; exit 2
fi

echo "=== DEPLOY START $(date +%T) ==="
DEPLOY_EXIT=1
for i in $(seq 1 8); do
  echo "--- deploy attempt $i $(date +%T) ---"
  npx --yes wrangler@latest pages deploy "$SNAP" --project-name=wenu-frontend --branch=redesign-v2 --commit-dirty=true 2>&1
  DEPLOY_EXIT=$?
  [ $DEPLOY_EXIT -eq 0 ] && break
  sleep 4
done
echo "=== DEPLOY EXIT $DEPLOY_EXIT $(date +%T) ==="
echo "M4_DEPLOY_DONE=$DEPLOY_EXIT $(date +%T)"
exit $DEPLOY_EXIT
