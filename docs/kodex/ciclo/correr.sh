#!/bin/zsh
# KODEX−∞ · CICLO AUTÓNOMO
# Avanza el corredor sin nadie presente. Corre por launchd cada 3 horas.
#
# LÍMITES QUE NO NEGOCIA (van también dentro del prompt, por si el modelo
# improvisa): preview sí, producción NUNCA. La regla del creador es explícita —
# producción sólo después de que él escriba APROBAR DEPLOY sobre un SHA exacto.
# Este ciclo no puede darse esa autorización a sí mismo.

set -u
export PATH="$HOME/.nvm/versions/node/v24.14.1/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
REPO="$HOME/kodex-converge"
REG="$HOME/kodex-autonomo/registro"
HOY="$(date +%Y-%m-%d-%H%M)"
LOG="$REG/$HOY.md"

cd "$REPO" || exit 1

# El llavero: sin esto el CLI no puede autenticar en una sesión no interactiva.
security unlock-keychain -p "${KDX_KEYCHAIN_PW:-}" ~/Library/Keychains/login.keychain-db 2>/dev/null

{
  echo "# CICLO AUTÓNOMO KODEX · $HOY"
  echo
  echo "rama: $(git rev-parse --abbrev-ref HEAD 2>/dev/null)"
  echo "sha:  $(git rev-parse HEAD 2>/dev/null)"
  echo
} > "$LOG"

claude -p --dangerously-skip-permissions "$(cat <<'PROMPT'
Eres el nodo de ejecución nocturna de KODEX−∞ en el Mac mini. Trabajas solo, sin
nadie presente. Este ciclo dura una tanda de trabajo y termina dejando evidencia.

DÓNDE ESTÁS
  repo    ~/kodex-converge   (rama kodex/pass-a-organismos-corredor,
                              base converge/kodex-todo @ 56bc3576)
  preview npx astro preview --port 4500  ·  build: ALLOW_EMPTY_PRODUCTS=true npm run build
  deploy  set -a; source ~/.cf-deploy-env; set +a
          npx wrangler pages deploy /tmp/kodex-preview-snap \
            --project-name=wenu-frontend --branch=kodex-preview --commit-dirty=true

PROHIBIDO, SIN EXCEPCIÓN
  · Desplegar a producción, a redesign-v2, a main o al dominio apex.
    La regla del creador: producción SÓLO tras un "APROBAR DEPLOY" explícito suyo
    sobre un SHA exacto. No puedes dártela a ti mismo ni inferirla.
  · Mergear ramas.
  · Replicar el patrón de PROLOGUE a otra escena mientras el creador no haya
    aceptado PROLOGUE como Golden Scene. Preparar sus contratos sí; tocar su
    código de escena no.
  · Declarar algo PASS sin haberlo medido en navegador. Build verde no es
    aceptación visual.
  · Inventar rutas, assets o cifras. Si un dato no deriva de estado, parámetro o
    fuente real, se elimina; no se maquilla.

CÓMO SE BAJA UNA REFERENCIA DE DRIVE (resuelto, úsalo)
  curl -sL "https://drive.google.com/uc?export=download&id=<fileId>" -o ref.png
  El mount del iMac expira; el fileId funciona directo y sin auth.

QUÉ HACER EN ESTA TANDA
  1. Lee ~/kodex-autonomo/ESTADO.md: dice exactamente dónde quedó el trabajo.
  2. Toma la PRIMERA tarea pendiente de esa lista. Una sola. No abras frentes.
  3. Trabájala hasta cerrarla o hasta chocar con un bloqueo real.
  4. Mide en navegador con Playwright: 1440, 390x844, 412x915 y reduced-motion.
     Desborde 0/0, cero errores de consola, y la consecuencia visible de cada
     cambio en píxeles, no en atributos del DOM.
  5. Si mejoró: commit con mensaje que explique POR QUÉ, push, build, deploy a
     preview. Si empeoró: revierte y anótalo.
  6. Reescribe ~/kodex-autonomo/ESTADO.md con lo que quedó hecho, lo que sigue
     pendiente y los bloqueos, para que la próxima tanda arranque sin releer todo.
  7. Registra en la bitácora compartida:
     bitacora claude-mini "KODEX ciclo autónomo: <qué cerraste> · SHA <sha>"

CÓMO REPORTAR
  Sé honesto sobre lo que NO cerraste. Un ciclo que arregla una cosa y lo dice
  claro vale más que uno que toca seis y no prueba ninguna. Si un gate sigue
  abierto, dilo con el número que lo demuestra.
PROMPT
)" >> "$LOG" 2>&1

echo "" >> "$LOG"
echo "sha final: $(git -C "$REPO" rev-parse HEAD 2>/dev/null)" >> "$LOG"
ls -t "$REG"/*.md 2>/dev/null | tail -n +40 | xargs rm -f 2>/dev/null   # deja las 40 últimas
