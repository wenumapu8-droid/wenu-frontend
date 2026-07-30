#!/usr/bin/env bash
# Runs on the WORK Mac. Sync repo → M4, launch isolated preview deploy detached.
set -uo pipefail
KEY="$HOME/.ssh/galvazinc_macmini"
M4="galvazincia@100.91.188.82"
SSH="ssh -i $KEY -o BatchMode=yes -o StrictHostKeyChecking=accept-new"
BRANCH="${1:-kodex-preview}"

echo "=== rsync → M4 ==="
rsync -az --delete -e "$SSH" \
  --exclude node_modules --exclude dist --exclude .git \
  /Users/user1/wenu-frontend/ "$M4":/tmp/wenu-build/
echo "rsync exit=$?"

echo "=== launch preview deploy (branch=$BRANCH) ==="
$SSH "$M4" "nohup bash /tmp/wenu-build/scripts/_m4-deploy-preview.sh $BRANCH > /tmp/m4-preview.log 2>&1 & echo launched-pid-\$!"
