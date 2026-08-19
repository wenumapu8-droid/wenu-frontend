#!/bin/zsh
# Una vuelta de SOUL WEAVER con su propio outDir y su propio puerto.
# Tres agentes comparten la rama y `astro build` limpia dist/ entero: sin
# esto el segundo en llegar revienta con ERR_MODULE_NOT_FOUND.
set -e
cd "$(dirname "$0")/../.."
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
ALLOW_EMPTY_PRODUCTS=true npx astro build --config astro.config.sw.mjs > /tmp/sw-build.log 2>&1 || { tail -20 /tmp/sw-build.log; exit 1; }
curl -s -o /dev/null http://localhost:4424/kodex/lamina/soul-weaver/ || {
  nohup npx astro preview --config astro.config.sw.mjs --port 4424 > /tmp/sw-preview.log 2>&1 &
  sleep 6
}
KDX_REFDIR=reference/pendientes KDX_PUERTO=4424 node scripts/lamina/iterate.mjs soul-weaver --no-build
