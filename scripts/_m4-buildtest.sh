#!/usr/bin/env bash
# Sends the current working tree to the M4 (ephemeral) and runs a build there,
# to validate the M4 as a build machine (no Cloudflare creds needed for build).
set -uo pipefail
KEY="$HOME/.ssh/galvazinc_macmini"
M4="galvazincia@100.91.188.82"
SSH="ssh -i $KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

echo "=== rsync working tree → M4:/tmp/wenu-build ==="
rsync -az --delete -e "$SSH" \
  --exclude node_modules --exclude dist --exclude .git \
  /Users/user1/wenu-frontend/ "$M4":/tmp/wenu-build/
echo "rsync exit=$?"

echo "=== launch build on M4 (detached) ==="
$SSH "$M4" 'bash -lc "cd /tmp/wenu-build && export NVM_DIR=\$HOME/.nvm && . \$NVM_DIR/nvm.sh && nohup bash -c \"node -v; npm install --no-audit --no-fund && npm run build; echo M4_BUILD_EXIT=\\\$?\" > /tmp/m4-build.log 2>&1 & echo launched-pid-\$!"'
echo "kick exit=$?"
