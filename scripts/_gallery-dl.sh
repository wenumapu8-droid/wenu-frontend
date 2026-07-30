#!/usr/bin/env bash
# Download Ocin's own photography from Behance (Santiago, Emanes, Princesa Yuyo)
# for the separate photo-gallery page. His art, public CDN, requested by him.
set -uo pipefail
D=/Users/user1/wenu-frontend/public/img/gallery
mkdir -p "$D"; UA='Mozilla/5.0'
dl(){ curl -sL -A "$UA" "$1" -o "$2"; echo "$(basename "$2") $(wc -c < "$2") bytes"; }

santiago=(
  "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/5fc4b1116149759.605c1adfe4be4.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/e98d42116149759.605c1adfe54ab.jpg"
)
emanes=(
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/ec7b91116133407.605bb387e2b77.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/ef191e116133407.605c14e070f7a.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/a8f5f4116133407.605bb387e32e0.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/d808b4116133407.605c10882e56f.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/875875116133407.605bb387e5549.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/23b2ed116133407.605bb387e5c5d.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/20fabb116133407.605bb387e40f6.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/1b27f7116133407.605bb387e4e0d.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/max_3840_webp/ea566a116133407.605bb387e483b.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/cbeca4116133407.605c14e0708a0.jpg"
)
yuyo=(
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/64ec44114559111.603dc59c7766e.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/209c19114559111.603dc59c7676b.jpg"
  "https://mir-s3-cdn-cf.behance.net/project_modules/fs_webp/efa30d114559111.603dc59c76f6a.jpg"
)
i=1; for u in "${santiago[@]}"; do dl "$u" "$D/santiago-$(printf '%02d' $i).webp"; i=$((i+1)); done
i=1; for u in "${emanes[@]}";   do dl "$u" "$D/emanes-$(printf '%02d' $i).webp";   i=$((i+1)); done
i=1; for u in "${yuyo[@]}";     do dl "$u" "$D/yuyo-$(printf '%02d' $i).webp";     i=$((i+1)); done
echo "--- type ---"; file "$D/santiago-01.webp"
