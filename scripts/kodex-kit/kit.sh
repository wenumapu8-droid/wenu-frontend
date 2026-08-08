#!/usr/bin/env bash
# KODEX kit — the standard blocks for working on this repo.
#
# Every step here encodes something an agent lost hours to. See README.md.
#
#   kit.sh new <branch> [base]     isolated worktree, ready to build
#   kit.sh build                   the only build command that works offline
#   kit.sh serve [port]            serve dist, wait until it actually answers
#   kit.sh look <path> [preset]    build if stale, serve, capture + audit
#   kit.sh sweep <path>            look at desktop, 390 and 412 in one go
#   kit.sh done                    remove the node_modules symlink before commit
#
set -euo pipefail

KIT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$KIT/../.." && pwd)"
MAIN="${KODEX_MAIN_CLONE:-$HOME/kodex-work}"
SHOTS="${KODEX_SHOTS:-$ROOT/.kit-shots}"
NODE_BIN="$HOME/.nvm/versions/node/v24.14.1/bin"
[ -d "$NODE_BIN" ] && export PATH="$NODE_BIN:$PATH"

say() { printf '\033[36m[kit]\033[0m %s\n' "$*"; }
die() { printf '\033[31m[kit] %s\033[0m\n' "$*" >&2; exit 1; }

free_port() {
  node -e 'const s=require("net").createServer();s.listen(0,"127.0.0.1",()=>{console.log(s.address().port);s.close()})'
}

cmd_new() {
  local branch="${1:?usage: kit.sh new <branch> [base]}"
  local base="${2:-feature/kodex-depth-engine}"
  local dest="${KODEX_WT_DIR:-/tmp}/wt-${branch//\//-}"
  [ -e "$dest" ] && die "already exists: $dest"
  say "worktree $branch off $base -> $dest"
  git -C "$MAIN" fetch -q origin || true
  git -C "$MAIN" worktree add -b "$branch" "$dest" "$base"
  git -C "$dest" config user.name "Mac Mini Galvazinc"
  git -C "$dest" config user.email "cobranzas@galvazinc.cl"
  # node_modules is ~1GB; symlink it rather than reinstalling per worktree.
  # `kit.sh done` removes it so it never reaches a commit.
  ln -sfn "$MAIN/node_modules" "$dest/node_modules"
  say "ready: cd $dest"
  echo "$dest"
}

cmd_build() {
  cd "$ROOT"
  # Plain `npm run build` aborts: getProducts() throws when the WooCommerce
  # credentials are absent, which they are offline and in CI. This flag is the
  # documented escape hatch and is what the CI workflow uses.
  say "astro build (ALLOW_EMPTY_PRODUCTS=true)"
  ALLOW_EMPTY_PRODUCTS=true npx astro build
}

cmd_serve() {
  cd "$ROOT"
  local port="${1:-$(free_port)}"
  [ -d dist ] || die "no dist/ — run: kit.sh build"
  npx --yes serve dist -l "$port" >/tmp/kit-serve-$port.log 2>&1 &
  # Screenshotting before the server answers yields a ~34KB error page that
  # looks like a real capture. Always wait for a 200.
  for _ in $(seq 1 40); do
    if [ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$port/" || true)" = "200" ]; then
      say "serving on $port"
      echo "$port"
      return 0
    fi
    sleep 1
  done
  die "server never answered on $port"
}

ensure_server() {
  if [ -n "${KIT_PORT:-}" ] && [ "$(curl -s -o /dev/null -w '%{http_code}' "http://localhost:$KIT_PORT/" || true)" = "200" ]; then
    echo "$KIT_PORT"; return
  fi
  [ -d "$ROOT/dist" ] || cmd_build >&2
  cmd_serve | tail -1
}

cmd_look() {
  local path="${1:?usage: kit.sh look <path> [preset]}"
  local preset="${2:-desktop}"
  local port; port="$(ensure_server)"
  mkdir -p "$SHOTS"
  local name; name="$(echo "${path#/}" | tr '/' '-' | sed 's/-$//')"
  [ -z "$name" ] && name=root
  local out="$SHOTS/${name}-${preset}.png"
  node "$KIT/shoot.mjs" "http://localhost:$port$path" "$out" "$preset" --audit
}

cmd_sweep() {
  local path="${1:?usage: kit.sh sweep <path>}"
  local port; port="$(ensure_server)"
  export KIT_PORT="$port"
  local rc=0
  for p in desktop 390 412; do
    say "--- $path @ $p"
    cmd_look "$path" "$p" || rc=$?
  done
  say "shots in $SHOTS"
  return $rc
}

cmd_done() {
  if [ -L "$ROOT/node_modules" ]; then
    rm "$ROOT/node_modules"
    say "removed node_modules symlink — safe to commit"
  else
    say "no symlink to remove"
  fi
  git -C "$ROOT" status --short | head -20
}

case "${1:-}" in
  new) shift; cmd_new "$@" ;;
  build) shift; cmd_build "$@" ;;
  serve) shift; cmd_serve "$@" ;;
  look) shift; cmd_look "$@" ;;
  sweep) shift; cmd_sweep "$@" ;;
  done) shift; cmd_done "$@" ;;
  *) sed -n '2,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' ;;
esac
