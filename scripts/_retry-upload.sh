#!/usr/bin/env bash
# Retries ONLY the Cloudflare upload of the already-built dist/ (no rebuild),
# because the build is fine and only the wrangler upload is dropping (EPIPE).
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"
nvm use 24.14.1 >/dev/null 2>&1 || nvm use node >/dev/null 2>&1
cd /Users/user1/wenu-frontend || exit 1
LOG=/tmp/retry-upload.log
echo "retry-upload started $(date)" > "$LOG"
for i in $(seq 1 12); do
  echo "=== attempt $i $(date +%H:%M:%S) ===" >> "$LOG"
  if npx wrangler pages deploy dist --project-name=wenu-frontend --branch=redesign-v2 --commit-dirty=true >> "$LOG" 2>&1; then
    if grep -q 'Deployment complete' "$LOG"; then
      echo ">> UPLOAD OK on attempt $i $(date)" >> "$LOG"
      exit 0
    fi
  fi
  echo ">> attempt $i failed, backing off" >> "$LOG"
  sleep 45
done
echo ">> gave up after 12 attempts $(date)" >> "$LOG"
