#!/usr/bin/env bash
echo "=== carpetas wenu en Downloads ==="
find /Users/user1/Downloads -maxdepth 2 -type d -iname '*wenu*' 2>/dev/null | head -20
echo
echo "=== LaCie /Volumes/LaCie/Wenu mapu (nivel 1) ==="
ls -1 "/Volumes/LaCie/Wenu mapu" 2>/dev/null | head -40
echo
echo "=== LaCie WENU MAPU subcarpeta ==="
ls -1 "/Volumes/LaCie/Wenu mapu/WENU MAPU" 2>/dev/null | head -40
echo
echo "=== conteos ==="
echo -n "Downloads imgs: "; find /Users/user1/Downloads -maxdepth 4 -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) 2>/dev/null | wc -l | tr -d ' '
echo -n "LaCie Wenu mapu imgs: "; find "/Volumes/LaCie/Wenu mapu" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) 2>/dev/null | wc -l | tr -d ' '
echo
echo "=== candidatos para POST OREJA (ear/piercing/oreja/portrait/lobe/helix) ==="
find /Users/user1/Downloads "/Volumes/LaCie/Wenu mapu" -type f \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' \) 2>/dev/null | grep -iE 'ear|oreja|piercing|helix|lobe|conch|portrait|retrato|curat' | head -30
