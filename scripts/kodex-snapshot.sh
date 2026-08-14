#!/usr/bin/env bash
# KODEX-∞ · paquete de subida, sólo lo que el códice usa
#
# `deploy-kodex-preview.sh` copiaba `dist/` entero: 6.333 archivos y 599 MB, de
# los cuales la mitad son fotos de producto de la tienda Wenu Mapu que ninguna
# página del códice referencia. Ese deploy falló cuatro veces seguidas en el
# archivo 1420, con cinco minutos y cuota de agente por intento.
#
# Esto arma el paquete a partir de lo que las páginas de /kodex realmente piden:
# se leen sus `src=` y `href=` y se copia sólo eso. De 1.154 imágenes en /img,
# el códice usa 47.
#
#   scripts/kodex-snapshot.sh [destino]        (por defecto /tmp/kodex-snap)
set -euo pipefail
cd "$(dirname "$0")/.."

DIST="dist"
DEST="${1:-/tmp/kodex-snap}"
[[ -d "$DIST/kodex" ]] || { echo "falta $DIST/kodex — corré npm run build"; exit 1; }

rm -rf "$DEST"
mkdir -p "$DEST"

# 1 · el códice y el runtime de Astro, enteros
cp -R "$DIST/kodex" "$DEST/kodex"
[[ -d "$DIST/_astro" ]] && cp -R "$DIST/_astro" "$DEST/_astro"

# 2 · los archivos sueltos de la raíz (robots, sitemaps, _headers, _redirects…)
find "$DIST" -maxdepth 1 -type f -exec cp {} "$DEST/" \;

# 3 · sólo los assets que las páginas del códice piden de verdad
FALTAN=0
COPIADOS=0
while IFS= read -r ruta; do
  origen="$DIST$ruta"
  if [[ -f "$origen" ]]; then
    mkdir -p "$DEST$(dirname "$ruta")"
    cp "$origen" "$DEST$ruta"
    COPIADOS=$((COPIADOS + 1))
  else
    FALTAN=$((FALTAN + 1))
    echo "$ruta" >> "$DEST/.referencias-rotas.txt"
  fi
done < <(grep -rhoE '(src|href)="/(kodex-content|img|fonts|assets)/[^"]+"' "$DIST/kodex" 2>/dev/null \
         | sed 's/.*="//;s/"$//' | sort -u)

N="$(find "$DEST" -type f | wc -l | tr -d ' ')"
PESO="$(du -sh "$DEST" | cut -f1)"
ORIG_N="$(find "$DIST" -type f | wc -l | tr -d ' ')"
ORIG_PESO="$(du -sh "$DIST" | cut -f1)"

echo
echo "  paquete   $N archivos · $PESO      (dist entero: $ORIG_N · $ORIG_PESO)"
echo "  assets    $COPIADOS copiados"
if [[ "$FALTAN" -gt 0 ]]; then
  # No es un fallo del empaquetado: son enlaces rotos del sitio, y conviene que
  # se vean acá en vez de descubrirlos como 404 después de publicar.
  echo "  ROTAS     $FALTAN referencias apuntan a archivos que no existen"
  echo "            lista en $DEST/.referencias-rotas.txt"
fi
echo
echo "  para publicar a preview (nunca a producción):"
echo "    npx wrangler pages deploy $DEST --project-name=wenu-frontend --branch=kodex-preview"
