#!/usr/bin/env bash
# KODEX-∞ · dónde quedó el trabajo
#
# Lo primero que corre un agente que toma el relevo. Contesta las cuatro
# preguntas del que llega nuevo: qué lámina, cómo va, qué está tomado por
# quién, y qué sigue.
#
#   scripts/lamina/loop/estado.sh
set -uo pipefail

AQUI="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO="$(cd "$AQUI/../../.." && pwd)"
COLA="$AQUI/cola.json"
cd "$REPO" || exit 1

SLUG="$(node -e 'console.log(require(process.argv[1]).slug)' "$COLA")"

echo
echo "  KODEX-∞ · $SLUG"
echo "  rama $(git rev-parse --abbrev-ref HEAD) · $(git log --oneline -1)"
if git rev-parse --abbrev-ref '@{upstream}' >/dev/null 2>&1; then
  ADELANTE="$(git rev-list --count '@{upstream}..HEAD' 2>/dev/null || echo '?')"
  ATRAS="$(git rev-list --count 'HEAD..@{upstream}' 2>/dev/null || echo '?')"
  echo "  contra origin: $ADELANTE sin pushear, $ATRAS sin traer"
else
  echo "  sin upstream — esta rama no está en origin y NADIE puede tomar el relevo"
fi

SCORE="$REPO/scripts/lamina/out/$SLUG/score.json"
if [[ -f "$SCORE" ]]; then
  echo
  node -e '
    const s = require(process.argv[1]);
    console.log(`  puntaje ${s.global.pct}% global · medido ${s.generado}`);
    [...s.regiones].sort((a, b) => b.pct - a.pct).forEach((r, i) =>
      console.log(`    ${i === 0 ? "→" : " "} ${r.id.padEnd(14)} ${String(r.pct).padStart(6)}%`));
    console.log("\n  la marcada con → es la peor región: ahí está el rendimiento.");
  ' "$SCORE"
else
  echo "  sin medición previa — corré: node scripts/lamina/iterate.mjs $SLUG"
fi

echo
node -e '
  const c = require(process.argv[1]);
  const ahora = Date.now() / 1000, ttl = Number(process.argv[2]);
  const orden = { en_curso: 0, pendiente: 1, sin_mejora: 2, hecho: 3, descartado: 4 };
  console.log("  cola:");
  for (const i of [...c.items].sort((a, b) => (orden[a.estado] ?? 9) - (orden[b.estado] ?? 9))) {
    let nota = "";
    if (i.estado === "en_curso" && i.tomado) {
      const min = Math.round((ahora - Number(i.tomado.desde)) / 60);
      const vencido = ahora - Number(i.tomado.desde) > ttl;
      nota = vencido
        ? `  ABANDONADO por ${i.tomado.agente} hace ${min} min — libre para retomar`
        : `  tomado por ${i.tomado.agente} en ${i.tomado.maquina} hace ${min} min`;
    }
    if (i.ultimo) nota = `  ${i.ultimo.antes}% → ${i.ultimo.despues}% (Δ ${i.ultimo.delta}) por ${i.ultimo.agente ?? "?"}`;
    if (i.estado === "descartado" && i.motivo) nota = `  ${i.motivo.slice(0, 90)}…`;
    console.log(`    ${i.estado.padEnd(11)} ${(i.region ?? "—").padEnd(13)} ${i.id}${nota}`);
  }
  const libre = c.items.find(i => i.estado === "pendiente" ||
    (i.estado === "en_curso" && ahora - Number(i.tomado?.desde ?? 0) > ttl));
  console.log(libre
    ? `\n  siguiente: ${libre.id}`
    : "\n  no hay ítems libres. Agregá uno a cola.json — con su región medida, o no entra.");
' "$COLA" "${LOCK_TTL:-7200}"

echo
echo "  para seguir:  scripts/lamina/loop/loop.sh"
echo "  para leer:    AGENTS.md · KIMI-BRIEF-LAMINAS.md"
echo
