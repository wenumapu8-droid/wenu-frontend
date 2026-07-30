#!/usr/bin/env bash
# Waits for RAM to free, then builds + deploys the nav change once. Detached.
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 24.14.1 >/dev/null 2>&1 || nvm use node >/dev/null 2>&1
LOG=/tmp/nav-autodeploy.log
THRESH=250000   # ~980 MB free (pages of 4KB)
echo "watcher started $(date)" > "$LOG"
for i in $(seq 1 80); do   # up to ~40 min
  free=$(vm_stat | awk '/Pages free/{gsub(/\./,"",$3); print $3}')
  echo "$(date +%H:%M:%S) free_pages=$free" >> "$LOG"
  if [ "${free:-0}" -gt "$THRESH" ]; then
    echo ">> RAM ok ($free pages) — deploying" >> "$LOG"
    pkill -9 -f 'wenu-frontend/node_modules/.bin/astro' 2>/dev/null
    pkill -9 -f _preview-deploy 2>/dev/null
    sleep 3
    cd /Users/user1/wenu-frontend || exit 1
    rm -rf dist 2>/dev/null
    bash scripts/_preview-deploy.sh redesign-v2 >> "$LOG" 2>&1
    echo ">> DEPLOY ATTEMPT DONE $(date)" >> "$LOG"
    exit 0
  fi
  sleep 30
done
echo "watcher timed out (RAM never freed) $(date)" >> "$LOG"
