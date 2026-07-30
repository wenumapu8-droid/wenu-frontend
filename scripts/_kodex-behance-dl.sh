#!/usr/bin/env bash
# Download Ocin's own KODEX-relevant Behance artworks (tribe space + patrones)
# into the repo. His art, public CDN, requested by him.
set -uo pipefail
DIR=/Users/user1/wenu-frontend/public/img/kodex/behance
mkdir -p "$DIR"
UA='Mozilla/5.0'

tribe=(
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/0b884f115816289.60558ff6e51ec.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/89e190115816289.60558ff6e42e4.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/c62903115816289.60558ff6e58ed.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/3fb9eb115816289.60558ff6e4865.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/8c1f98115816289.60558ff6e2a10.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/5c49d4115816289.60558ff6e3212.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/9e1206115816289.60558ff6e3b6d.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/1400_webp/c9bc3d115816289.60558ff6e202f.jpg"
)
patrones=(
  "https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/3b6e2d114558929.603dc4b2534b4.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/4082f4114558929.603dc4b254f63.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/82c6fb114558929.603dc4b253af3.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/3f5d09114558929.603dc4b25459e.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/hd_webp/f5c124114558929.603dc4b254a92.jpg"
)

i=1; for u in "${tribe[@]}"; do curl -sL -A "$UA" "$u" -o "$DIR/tribe-$(printf '%02d' $i).webp"; echo "tribe-$(printf '%02d' $i) $(wc -c < "$DIR/tribe-$(printf '%02d' $i).webp") bytes"; i=$((i+1)); done
i=1; for u in "${patrones[@]}"; do curl -sL -A "$UA" "$u" -o "$DIR/patrones-$(printf '%02d' $i).webp"; echo "patrones-$(printf '%02d' $i) $(wc -c < "$DIR/patrones-$(printf '%02d' $i).webp") bytes"; i=$((i+1)); done
echo "--- verify (file type) ---"; file "$DIR/tribe-01.webp" "$DIR/patrones-01.webp"
