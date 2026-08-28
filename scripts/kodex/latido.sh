#!/bin/bash
# EL LATIDO · KODEX−∞
#
# Corre solo, cada tanto, para que el trabajo no se detenga esperando a nadie.
# No decide nada: mide, deja el estado escrito y publica la preview cuando el
# repositorio está limpio y el build pasa. Lo que necesita juicio —si la escena
# ES KODEX, si va a producción— sigue siendo del creador, a propósito.
#
#   crontab:  */30 * * * * /Users/galvazincia/kodex-work/scripts/kodex/latido.sh
#
# Escribe en estado/ y en bitacora/latido.log. Nunca hace merge, nunca toca
# producción, nunca commitea trabajo ajeno.
set -uo pipefail

REPO="${KODEX_REPO:-$HOME/kodex-work}"
cd "$REPO" || exit 1

LOG="$REPO/bitacora/latido.log"
mkdir -p "$(dirname "$LOG")"
ts() { date -u +%Y-%m-%dT%H:%M:%SZ; }
log() { echo "$(ts) · $*" >> "$LOG"; }

# Un latido a la vez. Dos builds concurrentes saturan el disco.
LOCK=/tmp/kodex-latido.lock
if ! mkdir "$LOCK" 2>/dev/null; then
  log "otro latido en curso, salgo"
  exit 0
fi
source ~/.nvm/nvm.sh >/dev/null 2>&1 && nvm use >/dev/null 2>&1

# Declarar que hay trabajo pesado en curso. El 26-08 otro agente mató una
# medición completa al verla usando CPU: build y gate consumen mucho por
# diseño y desde afuera parecen procesos desbocados.
[ -f scripts/kodex/centinela.sh ] && . scripts/kodex/centinela.sh
type centinela_abrir >/dev/null 2>&1 && centinela_abrir "latido: build + gates + deploy"

# UNA sola trampa que hace las dos cosas. `centinela_abrir` instala la suya
# sobre EXIT, así que si se dejara la del candado por separado, la segunda
# pisaría a la primera y el candado no se liberaría nunca: el latido quedaría
# bloqueado para siempre a partir del primer ciclo.
limpiar() {
  rmdir "$LOCK" 2>/dev/null
  type centinela_cerrar >/dev/null 2>&1 && centinela_cerrar
}
trap limpiar EXIT INT TERM

RAMA=$(git rev-parse --abbrev-ref HEAD)
SHA=$(git rev-parse --short HEAD)
log "── latido · $RAMA @ $SHA"

# Lo que el propio latido regenera no cuenta como "trabajo sin commitear":
# estado/ lo escribe estado-circuito y kodex-conteos lo escribe el build. Si
# se contaran, el latido se ensuciaría a sí mismo y no publicaría nunca.
GENERADOS=':(exclude)estado/ :(exclude)src/data/kodex-conteos.json'
sucio_real() { [ -n "$(git status --porcelain -uno -- . $GENERADOS)" ]; }

# 1 · Traer lo que hicieron los demás, sin pisar trabajo local.
git fetch origin --quiet 2>/dev/null
if ! sucio_real; then
  git checkout -- estado src/data/kodex-conteos.json 2>/dev/null
  git pull --ff-only --quiet 2>/dev/null && log "sincronizado con origin"
else
  log "hay trabajo local sin commitear · no toco nada"
fi

# 2 · Recalcular el estado desde datos reales.
node scripts/kodex/estado-circuito.mjs >/dev/null 2>&1 && log "estado regenerado"

# 3 · Medir. Los números van a la bitácora aunque nadie los pida.
#
# SOBRE SU PROPIO SERVIDOR, no sobre el puerto por defecto. El 27-08 se
# descubrió que `qa-banco` venía midiendo el build de OTRO agente: su
# KDX_BASE por defecto es 127.0.0.1:4342, y ese puerto lo tenía tomado
# `../qa/servir.mjs dist-after`. Ese build no contiene `.kx-veil__silencio`,
# así que qa-banco se estrellaba con "Cannot read properties of null" — y como
# es portón de producción, el latido dejaba de publicar por una medición que
# no era ni de nuestro trabajo. Una medición contra el build equivocado es
# peor que no medir: parece un resultado.
PUERTO_QA=""
for pt in 4961 4962 4963 4964; do
  lsof -nP -iTCP:$pt -sTCP:LISTEN >/dev/null 2>&1 || { PUERTO_QA=$pt; break; }
done

if [ -n "$PUERTO_QA" ] && [ -f dist/index.html ]; then
  node scripts/kodex/servir-dist.mjs dist "$PUERTO_QA" >/dev/null 2>&1 &
  SRV_QA=$!
  sleep 3
  if [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PUERTO_QA/kodex/")" = "200" ]; then
    for m in qa-barrido qa-banco solapes; do
      [ -f "scripts/kodex/$m.mjs" ] || continue
      R=$(KDX_BASE="http://127.0.0.1:$PUERTO_QA" node "scripts/kodex/$m.mjs" 2>&1 | tail -3 | tr '\n' ' ')
      log "$m: $R"
    done
  else
    log "medición: nuestro servidor no respondió en $PUERTO_QA · no mido"
  fi
  kill "$SRV_QA" 2>/dev/null
else
  log "medición: sin puerto libre o sin dist · no mido"
fi

# 4 · ¿Qué sigue? Queda escrito para el próximo agente que entre.
if [ -f scripts/kodex/siguiente.mjs ]; then
  node scripts/kodex/siguiente.mjs > "$REPO/estado/SIGUIENTE.txt" 2>&1
  log "siguiente: $(grep -A1 'SIGUIENTE' "$REPO/estado/SIGUIENTE.txt" | tail -1 | xargs)"
fi

# 5 · Publicar preview — sólo si el árbol está limpio y el build pasa.
#     Preview es reversible y no la ve nadie más que nosotros; producción NO.
if sucio_real; then
  log "árbol sucio · no publico"
  exit 0
fi

if ! ALLOW_EMPTY_PRODUCTS=true npm run build >/tmp/kodex-latido-build.log 2>&1; then
  log "BUILD FALLÓ · no publico · ver /tmp/kodex-latido-build.log"
  exit 0
fi

PAGINAS=$(ls dist/p 2>/dev/null | wc -l | tr -d ' ')
if [ "$PAGINAS" -lt 50 ]; then
  log "portón: dist/p=$PAGINAS (<50) · build incompleto · no publico"
  exit 0
fi
log "build ok · dist/p=$PAGINAS"

set -a; source .env >/dev/null 2>&1; set +a

# Subir casi 4.000 archivos por un enlace largo falla a veces a mitad de camino:
# el 27-08 se cortó en 3760/3953 con "Failed to upload files. Please try again."
# Es transitorio y el propio wrangler lo dice. Sin reintentos, el latido se
# rendía hasta el ciclo siguiente y el trabajo se quedaba sin publicar.
publicar() {
  local rama="$1" destino="$2" intento
  for intento in 1 2 3; do
    if npx --yes wrangler@latest pages deploy dist \
         --project-name=wenu-frontend \
         --branch="$rama" \
         --commit-dirty=true >"$destino" 2>&1; then
      [ "$intento" -gt 1 ] && log "  (publicó en el intento $intento)"
      return 0
    fi
    log "  intento $intento de subida falló · reintento"
    sleep $((intento * 20))
  done
  return 1
}
if publicar kodex-preview /tmp/kodex-latido-deploy.log; then
  URL=$(grep -o 'https://[a-z0-9-]*\.wenu-frontend\.pages\.dev' /tmp/kodex-latido-deploy.log | tail -1)
  log "PREVIEW publicada · $SHA · $URL"
else
  log "deploy de preview falló · ver /tmp/kodex-latido-deploy.log"
  exit 0
fi

# ── 6 · PRODUCCIÓN ──────────────────────────────────────────────────────
# Autorizado por Ocin el 2026-08-26: publicar sin esperarlo, "sin destruir
# todo". Los portones de abajo SON esa condición, no un adorno: el 26-08 un
# build salió con 0 productos y publicarlo habría borrado la tienda entera.
#
# Lo que un script NO puede decidir —si una escena ES KODEX— sigue siendo
# del creador. Esto publica lo que ya está verificado, no lo que parece bien.

FRENO=""

# a) La tienda tiene que sobrevivir. Es el portón que salvó el 26-08.
PROD=$(ls dist/p 2>/dev/null | wc -l | tr -d ' ')
[ "$PROD" -lt 150 ] && FRENO="$FRENO tienda:$PROD(<150)"

# b) El corredor tiene que existir.
KDX=$(ls dist/kodex 2>/dev/null | wc -l | tr -d ' ')
[ "$KDX" -lt 10 ] && FRENO="$FRENO corredor:$KDX(<10)"

# c) El banco de comparación no puede haber retrocedido.
#    Se mide más abajo, DENTRO del bloque que levanta nuestro propio servidor.
#    Acá arriba apuntaba al puerto por defecto (4342) —el de otro agente— y por
#    eso frenaba producción con el resultado de un build ajeno.

# d) TRINQUETE DE EXPERIENCIA — por IDENTIDAD DE ESCENA, no por conteo.
#
#    El 27-08 el conteo total escondió una regresión real: DESCENT y ARCHIVE
#    retrocedieron de PASS a FAIL el mismo día que PROLOGUE avanzó de FAIL a
#    PASS. Un trinquete que sólo mira "cuántas fallan" no lo habría frenado
#    aunque el total hubiera empeorado — y ni siquiera hacía falta que el total
#    cambiara para que el problema pasara inadvertido: una escena buena puede
#    reemplazar a una mala en el conteo sin que el número se mueva un bit.
#
#    Ahora se guarda un VECTOR: `ESCENA=PASS` o `ESCENA=FAIL`, una línea por
#    escena. Se frena si CUALQUIER escena que pasaba ayer falla hoy — sin
#    importar qué le pase al total. Mejorar una escena nunca cuesta otra.
#
#    El puerto NO es 4342: el 26-08 otro agente ya tenía ahí un servidor con
#    otro build (`../qa/servir.mjs dist-after 4342`). El gate se conectó, midió
#    ese build ajeno y devolvió resultados creíbles pero de otra cosa. Puerto
#    propio y verificación de que el servidor que responde es el nuestro.
#    El Mini tiene varios agentes con servidores propios: 4342 y 4399 ya
#    estaban tomados. Se busca un puerto libre en vez de asumir uno.
BASELINE="$REPO/estado/gate-experiencia.txt"
VECTOR_BASELINE="$REPO/estado/gate-vector.txt"
PUERTO_GATE=""
for pt in 4877 4878 4879 4880; do
  lsof -nP -iTCP:$pt -sTCP:LISTEN >/dev/null 2>&1 || { PUERTO_GATE=$pt; break; }
done

if [ -f scripts/kodex/gate-experiencia.mjs ] && [ -n "$PUERTO_GATE" ]; then
  node scripts/kodex/servir-dist.mjs dist "$PUERTO_GATE" >/dev/null 2>&1 &
  SERVIDOR=$!
  sleep 3

  # Confirmar que quien responde es NUESTRO servidor y no un vecino: si el
  # build propio no está ahí, medir sería peor que no medir.
  if [ "$(curl -s -o /dev/null -w '%{http_code}' "http://127.0.0.1:$PUERTO_GATE/kodex/folio/i/")" = "200" ]; then
    # Portón (c): el banco, contra NUESTRO servidor.
    if [ -f scripts/kodex/qa-banco.mjs ]; then
      BANCO=$(KDX_BASE="http://127.0.0.1:$PUERTO_GATE" node scripts/kodex/qa-banco.mjs 2>&1 \
              | grep -oE '[0-9]+ fallan' | grep -oE '^[0-9]+')
      [ -n "$BANCO" ] && [ "$BANCO" -gt 0 ] && FRENO="$FRENO banco:$BANCO-fallan"
    fi
    node scripts/kodex/gate-experiencia.mjs --base=http://127.0.0.1:$PUERTO_GATE >/tmp/kodex-gate.log 2>&1
    AHORA=$(grep -oE '[0-9]+ fallan' /tmp/kodex-gate.log | grep -oE '^[0-9]+')
    VECTOR_AHORA=$(grep '^VECTOR:' /tmp/kodex-gate.log | sed 's/^VECTOR://')
  else
    log "gate-experiencia: nuestro servidor no respondió en $PUERTO_GATE · no mido"
    AHORA=""
    VECTOR_AHORA=""
  fi
  kill "$SERVIDOR" 2>/dev/null

  ANTES=$(cat "$BASELINE" 2>/dev/null || echo "")
  if [ -n "$AHORA" ]; then
    log "gate-experiencia: $AHORA fallan (antes: ${ANTES:-sin medir})"
  fi

  # El vector manda. El conteo ($AHORA/$BASELINE) queda sólo como bitácora.
  if [ -n "$VECTOR_AHORA" ]; then
    VECTOR_ANTES=$(cat "$VECTOR_BASELINE" 2>/dev/null || echo "")
    if [ -n "$VECTOR_ANTES" ]; then
      REGRESIONES=""
      IFS=',' read -ra PARES_ANTES <<< "$VECTOR_ANTES"
      for par in "${PARES_ANTES[@]}"; do
        esc="${par%%=*}"; estado_antes="${par##*=}"
        [ "$estado_antes" != "PASS" ] && continue
        estado_ahora=$(echo "$VECTOR_AHORA" | tr ',' '\n' | grep "^$esc=" | cut -d= -f2)
        [ "$estado_ahora" = "FAIL" ] && REGRESIONES="$REGRESIONES $esc"
      done
      if [ -n "$REGRESIONES" ]; then
        FRENO="$FRENO regresion:$REGRESIONES"
        log "gate-experiencia: REGRESIÓN por escena ·$REGRESIONES"
      fi
    fi
    if [ -z "$FRENO" ]; then
      echo "$VECTOR_AHORA" > "$VECTOR_BASELINE"
      [ -n "$AHORA" ] && echo "$AHORA" > "$BASELINE"
    fi
  fi
else
  log "gate-experiencia: sin puerto libre o sin script · no mido"
fi

if [ -n "$FRENO" ]; then
  log "PRODUCCIÓN FRENADA ·$FRENO · preview sí publicada"
  exit 0
fi

# Antes de pisar producción, guardar a qué volver.
ANTERIOR=$(npx --yes wrangler@latest pages deployment list --project-name=wenu-frontend 2>/dev/null \
           | grep -oE 'https://[a-z0-9]+\.wenu-frontend\.pages\.dev' | head -2 | tail -1)
[ -n "$ANTERIOR" ] && log "punto de retorno: $ANTERIOR"

# `--branch=redesign-v2` NO es decorativo: Cloudflare Pages sólo trata como
# Production la rama configurada en el proyecto. Cualquier otro nombre entra
# como Preview y el dominio nunca cambia. El 26-08 se perdieron varias horas
# publicando a `converge/kodex-todo` y viendo el sitio viejo: los deploys
# decían "Success" y eran Preview. El nombre de la rama de git no importa acá;
# importa el nombre que Cloudflare tiene marcado como producción.
if publicar redesign-v2 /tmp/kodex-latido-prod.log; then
  log "PRODUCCIÓN publicada · $SHA · tienda:$PROD corredor:$KDX"
  # Verificar en vivo. Publicar no es lo mismo que funcionar.
  sleep 20
  for r in "kodex/" "shop"; do
    C=$(curl -s -o /dev/null -w '%{http_code}' "https://wenumapuonline.com/$r")
    log "  vivo /$r → $C"
    case "$C" in 2*|3*) ;; *) log "  ⚠ REVISAR · volver a $ANTERIOR" ;; esac
  done
else
  log "deploy de producción falló · ver /tmp/kodex-latido-prod.log"
fi
