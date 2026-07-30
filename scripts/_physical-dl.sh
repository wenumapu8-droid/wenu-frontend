#!/usr/bin/env bash
# Download Ocin's physical/stage projects from Behance: Quinto Fuego (RAVE VIRTUAL
# festival/stage design) + Ballena Jorobada (whale sculpture). His art, requested.
set -uo pipefail
D=/Users/user1/wenu-frontend/public/img/physical
mkdir -p "$D"; UA='Mozilla/5.0'; B='https://mir-s3-cdn-cf.behance.net/project_modules'
dl(){ curl -sL -A "$UA" "$1" -o "$2"; echo "$(basename "$2") $(wc -c < "$2")"; }

quinto=(
  max_1200_webp/afafb5114560597.603dce98c8296.jpg
  max_1200_webp/6c69af114560597.603dce98c8bb5.jpg
  max_1200_webp/9efc2c114560597.603dce98c8717.jpg
  max_1200_webp/fbee3d114560597.603dce98c7e3c.jpg
  max_1200_webp/ed095a114560597.603dce98c9758.jpg
  disp_webp/bc6e4e114560597.603dce98c9cc4.jpg
  disp_webp/07edaa114560597.603dce98c7350.jpg
  disp_webp/1b6bde114560597.603dce98c776f.jpg
  disp_webp/350c4d114560597.603dce98c9122.jpg
)
ballena=(
  hd_webp/65c513114560005.603dcb22c5aa6.jpg hd_webp/a2e707114560005.603dcb22c7683.jpg
  hd_webp/9e595e114560005.603dcb22cc6a6.jpg hd_webp/03533d114560005.603dcb22c7be6.jpg
  hd_webp/937d6d114560005.603dcb22c6201.jpg max_1200_webp/9474a8114560005.603dcb22c8834.jpg
  hd_webp/69c7d2114560005.603dcb22cd136.jpg hd_webp/39537f114560005.603dcb22ca362.jpg
  max_1200_webp/526f7e114560005.603dcb22c8de2.png max_1200_webp/3742d3114560005.603dcb22cb298.png
  max_1200_webp/6bead0114560005.603dcb22cac7b.png max_1200_webp/752cf8114560005.603dcb22c955a.png
  max_1200_webp/43aff5114560005.603dcb22c9cb6.png max_1200_webp/7b0456114560005.603dcb22cc065.jpg
  max_1200_webp/38a824114560005.603dcb22c82c4.jpg max_1200_webp/456280114560005.603dcb22c6f34.jpg
  max_1200_webp/87c86a114560005.603dcb22ccbe7.jpg max_1200_webp/4b2543114560005.603dcb22cba85.jpg
  max_632_webp/d4c70f114560005.603dcb22c6799.jpg
)
i=1; for p in "${quinto[@]}";  do dl "$B/$p" "$D/quinto-$(printf '%02d' $i).webp";  i=$((i+1)); done
i=1; for p in "${ballena[@]}"; do dl "$B/$p" "$D/ballena-$(printf '%02d' $i).webp"; i=$((i+1)); done
echo done
