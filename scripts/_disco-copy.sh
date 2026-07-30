#!/usr/bin/env bash
# Bring Ocin's real Disco Solar works (pink-neon fractal spheres) into the repo.
set -uo pipefail
UP="/Users/user1/Library/Application Support/Claude/local-agent-mode-sessions/4814e213-bbe2-40ae-b139-8ba7b3337c45/0c515280-d897-4086-a1c6-f53a62fb974f/agent/local_ditto_0c515280-d897-4086-a1c6-f53a62fb974f/uploads"
D="/Users/user1/wenu-frontend/public/img/kodex/disco"
SRC="/Volumes/LaCie/Wenu mapu/kodex-disco-solar-originales"
mkdir -p "$D"
mkdir -p "$SRC" 2>/dev/null || true
files=(85c1758f-54238 72ae3218-54237 4563a65b-54236 d45ca932-54235 44e3dd2c-54234 a3ffcf16-54233 d398a448-54232 7077c714-54231 c923234f-54230 a09abcd9-54229 cfba2419-54228)
i=1
for f in "${files[@]}"; do
  n=$(printf 'disco-%02d' "$i")
  cp "$UP/$f.jpg" "$D/$n.jpg" && echo "$n.jpg $(wc -c < "$D/$n.jpg")"
  cp "$UP/$f.jpg" "$SRC/$n.jpg" 2>/dev/null || true   # persist originals on LaCie
  i=$((i+1))
done
echo "done -> $D"
