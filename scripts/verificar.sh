#!/usr/bin/env bash
#
# KODEX-∞ · verificación contra lo COMPILADO
#
# Nació de un error caro: durante tres vueltas ajusté una escena y el número no
# se movía. La causa no era el shader ni el motor — mis reemplazos automáticos
# fallaban en silencio, así que el archivo fuente nunca cambiaba. Y aun cuando
# cambia, que la fuente diga lo correcto NO prueba que lo compilado lo diga.
#
# Por eso este script mira `dist/`, no `src/`.
#
#   ./scripts/verificar.sh        (requiere un build previo)
#
set -uo pipefail
cd "$(dirname "$0")/.."
fallos=0
ok(){ printf "  \033[32m✓\033[0m %s\n" "$1"; }
mal(){ printf "  \033[31m✗\033[0m %s\n" "$1"; fallos=$((fallos+1)); }

[ -d dist ] || { echo "No hay dist/. Corré el build primero."; exit 1; }

echo "── Shaders: u_intensity conectado ──────────────────────────"
for f in split-corridor ripple-floor impossible-structure wrinkled-reality; do
  if grep -q "color \*= clamp(u_intensity" "src/kodex/shaders/lab/$f.frag" 2>/dev/null
  then ok "$f"; else mal "$f · u_intensity declarado y sin usar"; fi
done

echo "── Escenas: intensidad presente en el BUNDLE ───────────────"
n=$(grep -rho "u_intensity:[0-9.]*" dist/_astro/viaje*.js 2>/dev/null | wc -l | tr -d ' ')
[ "$n" -ge 4 ] && ok "$n intensidades compiladas" || mal "sólo $n intensidades en el bundle (esperadas ≥4)"

echo "── Obra de Ocín: LIMPIA, sin filtro ────────────────────────"
if grep -q "vj__specimens[^{]*img[^{]*{[^}]*filter" dist/_astro/viaje*.css 2>/dev/null
then mal "hay un filter sobre los specimens — la obra debe ir fiel"
else ok "sin filtro sobre los specimens"; fi

echo "── prefers-reduced-motion presente ─────────────────────────"
grep -q "prefers-reduced-motion" dist/_astro/viaje*.css 2>/dev/null \
  && ok "regla presente" || mal "falta la rama de movimiento reducido"

echo "── Barcode: decodifica de verdad ───────────────────────────"
msg=$(python3 - <<'PY' 2>/dev/null
import re,glob
h=open(glob.glob('dist/kodex/viaje/index.html')[0]).read()
m=re.search(r'class="vj__barcode"[^>]*>(.*?)</g>', h, re.S)
w=[float(x) for x in re.findall(r'width="([0-9.]+)"', m.group(1))]
b=''.join('1' if x>2 else '0' for x in w)
print(''.join(chr(int(b[i:i+7],2)) for i in range(0,len(b)-6,7)))
PY
)
[ -n "$msg" ] && ok "decodifica a '$msg'" || mal "el barcode no decodifica"

echo
[ "$fallos" -eq 0 ] && echo "TODO VERIFICADO." || echo "$fallos comprobación(es) fallaron."
exit $fallos
