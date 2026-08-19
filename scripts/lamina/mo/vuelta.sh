#!/bin/zsh
# Una vuelta de fotocopia para mycelial-oracle.
# No usa iterate.mjs porque otro agente tiene un `astro preview` atado a
# [::1]:4423 y `localhost` resuelve ahí primero: este banco mide contra
# 127.0.0.1, su propio dist-mo y su propio servidor.
set -e
cd "$(dirname "$0")/../../.."
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
export KDX_REFDIR=reference/pendientes
if [[ "$1" != "--no-build" ]]; then
  ALLOW_EMPTY_PRODUCTS=true npx astro build --outDir dist-mo >/dev/null 2>&1 || { echo "BUILD FALLÓ"; ALLOW_EMPTY_PRODUCTS=true npx astro build --outDir dist-mo 2>&1 | grep -iE "error|expected|location" | head -8; exit 1; }
fi
curl -s -o /dev/null http://127.0.0.1:4423/ || (node scripts/lamina/mo/servir.mjs "$PWD/dist-mo" 4423 >/tmp/mo-servidor.log 2>&1 &) && sleep 1
node scripts/lamina/compare.mjs mycelial-oracle --url http://127.0.0.1:4423/kodex/lamina/mycelial-oracle/
node scripts/lamina/mo/historial.mjs
