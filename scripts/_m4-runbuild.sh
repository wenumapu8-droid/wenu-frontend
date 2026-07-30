#!/usr/bin/env bash
# Runs on the M4. Installs deps + builds the ephemeral repo at /tmp/wenu-build.
export NVM_DIR="$HOME/.nvm"
. "$NVM_DIR/nvm.sh"
cd /tmp/wenu-build || { echo NO_REPO; exit 1; }
echo "build start $(date) node=$(node -v)"
npm install --no-audit --no-fund
echo "install exit=$?"
npm run build
echo "M4_BUILD_EXIT=$?"
echo "done $(date)"
