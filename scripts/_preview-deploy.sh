#!/bin/bash
# Build with the pinned Node (nvm) and deploy to a PREVIEW branch (not the apex).
cd /Users/user1/wenu-frontend || exit 1
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use >/dev/null 2>&1
echo "node: $(node -v)"
BRANCH="${1:-constel-f1}"
npm run build || { echo "BUILD FAILED"; exit 1; }
npx wrangler pages deploy dist --project-name=wenu-frontend --branch="$BRANCH" --commit-dirty=true
echo "PREVIEW DEPLOY DONE"
