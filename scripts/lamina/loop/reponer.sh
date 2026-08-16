#!/usr/bin/env bash
# KODEX-∞ · REPONER LA COLA
#
# Cuando se acaban los ítems, propone los siguientes solo: mira el puntaje de
# cada región de cada lámina medida y encola las peores que todavía estén por
# encima de la meta. Primero termina la lámina en curso; recién después cruza a
# la siguiente.
#
# Es lo que hace que el loop avance sin que nadie escriba la cola a mano — y
# sigue respetando la regla dura, porque sólo puede proponer regiones que
# existen en regions/<slug>.json. Lo que el banco no mide, no entra: ni a mano
# ni automáticamente.
#
#   scripts/lamina/loop/reponer.sh [--meta 3.0] [--max 3]
#
# Sale 0 si agregó algo, 4 si no había nada que agregar.
set -uo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$AQUI/../../.." && pwd)"
COLA="$AQUI/cola.json"
[[ -f "$AQUI/loop.conf" ]] && { . "$AQUI/loop.conf"; }

arg() { local i; for i in "${!ARGS[@]}"; do [[ "${ARGS[$i]}" == "$1" ]] && { echo "${ARGS[$((i+1))]}"; return; }; done; echo "$2"; }
ARGS=("$@")
META="$(arg --meta "${META_PCT:-3.0}")"
MAX="$(arg --max "${MAX_NUEVOS:-3}")"

cd "$REPO" || exit 1

node -e '
const fs = require("fs"), path = require("path");
const [cola, repo, meta, max] = [process.argv[1], process.argv[2], Number(process.argv[3]), Number(process.argv[4])];
const c = JSON.parse(fs.readFileSync(cola, "utf8"));
// Se descarta por lámina+región, no por id: un ítem escrito a mano
// ("u10-hero-center-organismo") cubre la misma región que el que propondría
// esto ("u10-commons-hero-center-auto"), y encolar los dos manda al agente dos
// veces al mismo lugar. La región es la unidad de trabajo, no el nombre.
const yaEsta = new Set(c.items.map(i => `${i.slug || c.slug}·${i.region}`));

const dirReg = path.join(repo, "scripts/lamina/regions");
const slugs = fs.readdirSync(dirReg).filter(f => f.endsWith(".json")).map(f => f.replace(/\.json$/, ""));

// La lámina en curso primero: terminar una vale más que empezar tres.
const enCurso = c.slug;
slugs.sort((a, b) => (a === enCurso ? -1 : b === enCurso ? 1 : a.localeCompare(b)));

const candidatos = [];
for (const slug of slugs) {
  const score = path.join(repo, "scripts/lamina/out", slug, "score.json");
  if (!fs.existsSync(score)) continue;               // sin medir no se propone nada
  const s = JSON.parse(fs.readFileSync(score, "utf8"));
  const regiones = JSON.parse(fs.readFileSync(path.join(dirReg, slug + ".json"), "utf8")).regions.map(r => r.id);
  for (const r of s.regiones ?? []) {
    if (!regiones.includes(r.id)) continue;          // la regla dura, otra vez
    /* COBERTURA, no pct. Elegir por diferencia repitió acá el bug que ya se
       enterró en la compuerta: pct premia el vacío y además encola regiones
       SATURADAS — la noche del 15 gastó 6 de 12 vueltas en regiones al
       103-136% de cobertura, donde no hay nada que ganar. Se propone sólo lo
       que está por debajo del 95%, y lo más bajo primero. */
    const cob = r.cobertura;
    if (cob == null || cob >= 95) continue;          // saturada o sin medir: no se propone
    const id = `${slug}-${r.id}-auto`;
    if (yaEsta.has(`${slug}·${r.id}`)) continue;      // ya hay un ítem para esa región
    candidatos.push({ slug, region: r.id, cob, id, prioridad: slug === enCurso ? 0 : 1 });
  }
}

// La más VACÍA primero, dentro de la lámina en curso antes que en las demás.
candidatos.sort((a, b) => a.prioridad - b.prioridad || a.cob - b.cob);
const nuevos = candidatos.slice(0, max);

if (!nuevos.length) {
  console.log(`  nada que reponer: ninguna región medida supera ${meta}% fuera de lo ya juzgado`);
  process.exit(4);
}

for (const n of nuevos) {
  c.items.push({
    id: n.id,
    slug: n.slug,
    region: n.region,
    umbral: 0.05,
    estado: "pendiente",
    origen: "reponer.sh",
    objetivo: `Región ${n.region} de ${n.slug}, hoy en ${n.cob} % de COBERTURA — falta dibujo. La receta medida del campo está en scripts/lamina/campo/${n.slug}.json (si falta, extraerla: node scripts/lamina/extraer-campo.mjs ${n.slug}); pintarCampo de kit/campo.ts acepta CAPAS para sumar sin reemplazar. Corré _medir_region_components.mjs y CLASIFICÁ los clusters con la tabla de KIMI-BRIEF-LAMINAS.md antes de tocar nada: arte fija se traza, información se compone desde el kit, y sólo lo que exige criterio se itera. Si el número empeora, medí el render con perfil.mjs --comparar antes de proponer otro valor.`,
  });
  console.log(`  + ${n.id}  (cobertura ${n.cob} %)`);
}
fs.writeFileSync(cola, JSON.stringify(c, null, 2) + "\n");
' "$COLA" "$REPO" "$META" "$MAX"
CODIGO=$?

if [[ $CODIGO -eq 0 ]]; then
  RAMA="$(git rev-parse --abbrev-ref HEAD)"
  git add "$COLA" >/dev/null
  git diff --cached --quiet -- "$COLA" || git commit -q -m "loop: repone la cola desde los puntajes medidos"
  git push --quiet origin "$RAMA" 2>/dev/null || true
fi
exit $CODIGO
