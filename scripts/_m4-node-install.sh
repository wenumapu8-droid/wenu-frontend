#!/usr/bin/env bash
# Installs nvm + Node 24.14.1 on the M4 (user-level, no sudo). Run on the M4.
set -uo pipefail
export NVM_DIR="$HOME/.nvm"
echo "node install start $(date)"
curl -fsSL -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
# shellcheck disable=SC1091
. "$NVM_DIR/nvm.sh"
nvm install 24.14.1
nvm alias default 24.14.1
echo "--- versions ---"
node -v
npm -v
echo "NODE_INSTALL_DONE $(date)"
