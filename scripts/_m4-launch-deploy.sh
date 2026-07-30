#!/usr/bin/env bash
# Runs on the WORK Mac. Syncs repo → M4, launches the M4 deploy detached.
set -uo pipefail
KEY="$HOME/.ssh/galvazinc_macmini"
M4="galvazincia@100.91.188.82"
SSH="ssh -i $KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"

echo "=== rsync working tree → M4:/tmp/wenu-build ==="
rsync -az --delete -e "$SSH" \
  --exclude node_modules --exclude dist --exclude .git \
  /Users/user1/wenu-frontend/ "$M4":/tmp/wenu-build/
echo "rsync exit=$?"

echo "=== launch M4 deploy (detached) ==="
$SSH "$M4" 'nohup bash /tmp/wenu-build/scripts/_m4-deploy.sh > /tmp/m4-deploy.log 2>&1 & echo launched-pid-$!'
echo "kick exit=$?"
