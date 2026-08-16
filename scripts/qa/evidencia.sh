#!/bin/bash
# KODEX-∞ · KOD-69 · envoltorio del carril de evidencia local
#
# "exact SHA": el build sale de un worktree del SHA pedido, no del árbol vivo
# — en esta copia trabajan varios agentes a la vez y el árbol vivo nunca es
# de nadie. El server usa un puerto propio para no chocar con el banco.
#
# Uso: scripts/qa/evidencia.sh [sha] [rutas-separadas-por-coma]
set -euo pipefail
cd "$(dirname "$0")/../.."
REPO="$(pwd)"
SHA="${1:-$(git rev-parse HEAD)}"
RUTAS="${2:-}"
PUERTO=4499
W="/tmp/kdx-evidencia-$$"

export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:$PATH"
set -a; source .env >/dev/null 2>&1 || true; set +a

git worktree add -q "$W" "$SHA"
trap 'cd "$REPO"; git worktree remove --force "$W" >/dev/null 2>&1; git worktree prune' EXIT
ln -s "$REPO/node_modules" "$W/node_modules"
cp "$REPO/.env" "$W/.env" 2>/dev/null || true

cd "$W"
npx astro build --outDir "$W/dist-evidencia" >/dev/null 2>&1
npx serve -l "$PUERTO" "$W/dist-evidencia" >/dev/null 2>&1 &
SERVE=$!
trap 'kill $SERVE >/dev/null 2>&1; cd "$REPO"; git worktree remove --force "$W" >/dev/null 2>&1; git worktree prune' EXIT
sleep 3

cd "$REPO"
if [ -n "$RUTAS" ]; then
  node scripts/qa/evidencia.mjs --sha "$SHA" --base "http://127.0.0.1:$PUERTO" --rutas "$RUTAS"
else
  node scripts/qa/evidencia.mjs --sha "$SHA" --base "http://127.0.0.1:$PUERTO"
fi
