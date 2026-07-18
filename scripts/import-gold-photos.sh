#!/usr/bin/env bash
# import-gold-photos.sh — copia las 6 fotos de los ends de oro (fondo negro, las
# que mandó Ocin el 2026-07-13) a public/img/initial/ con los nombres que
# src/pages/initial-jewelry.astro está buscando.
#
# Por qué existe este script: sin shell no puedo mover archivos binarios. Esto
# lo puede correr Ocin o Hermes en un segundo.
#
#   bash ~/wenu-frontend/scripts/import-gold-photos.sh
#
set -euo pipefail

SRC="/Users/user1/Library/Application Support/Claude/local-agent-mode-sessions/4814e213-bbe2-40ae-b139-8ba7b3337c45/0c515280-d897-4086-a1c6-f53a62fb974f/agent/local_ditto_0c515280-d897-4086-a1c6-f53a62fb974f/uploads"
DEST="/Users/user1/wenu-frontend/public/img/initial"
LACIE="/Volumes/LaCie/Wenu mapu/WENU MAPU/initial-jewelry-gold"

mkdir -p "$DEST"

# uploaded file  ->  nombre final en el sitio
copy() {
  local from="$SRC/$1"
  local to="$DEST/$2"
  if [[ -f "$from" ]]; then
    cp "$from" "$to"
    echo "  ✓ $2"
  else
    echo "  ✗ FALTA: $1  (esperado -> $2)"
  fi
}

echo "→ Copiando ends de oro a $DEST"
copy "32801760-52333.png" "gold-cz-prong.png"        # CZ transparente en garras
copy "4cec29e1-52329.png" "gold-opal-cabochon.png"   # ópalo tornasolado en bisel
copy "14f24248-52331.png" "gold-disk.png"            # disco liso pulido
copy "7727b45a-52332.png" "gold-hammered-disk.png"   # disco martillado
copy "b5b74b19-52330.png" "gold-ceres-top.png"       # amatista pera + round
copy "84bf0512-52334.png" "gold-trinity-top.png"     # tres piedras en trébol

# Regla de los 3 lugares: NocoDB + LaCie (original) + sitio (optimizada).
# Guardamos el original en el disco antes de que el sitio los toque.
if [[ -d "/Volumes/LaCie" ]]; then
  mkdir -p "$LACIE"
  cp "$DEST"/gold-*.png "$LACIE"/ 2>/dev/null || true
  echo "→ Originales respaldados en LaCie"
else
  echo "→ LaCie no montado — falta el respaldo del original (memoria: persistir en 3 lugares)"
fi

echo
echo "Listo. Ahora:  cd ~/wenu-frontend && ./deploy-now.sh"
