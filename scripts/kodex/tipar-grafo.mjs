/**
 * KODEX-∞ · TIPAR EL GRAFO QUE YA EXISTE
 *
 * Hallazgo del informe de canon: el manifiesto trae 728 `resonancias` y 117 de
 * sus 133 destinos resuelven a un volumen real. O sea: EL GRAFO YA EXISTE —
 * sólo que sus aristas no tienen tipo, y el Knowledge Field prohíbe por escrito
 * la arista sin tipo: "A line must never mean only 'related to'".
 *
 * Esto no crea motor, ni router, ni renderer, ni ontología. Reusa:
 *   · NodeRelation de src/lib/kodex/contratos.ts — 13 relaciones CERRADAS
 *   · el manifiesto que ya está en public/kodex-content/manifest.json
 *   · el campo `registro` que cada volumen ya trae, para el estatus epistémico
 *
 * El mapeo de estatus es MECÁNICO, no interpretado:
 *   documentado → VERIFIED · estructura → CANONICAL
 *   esoterico   → INFERRED · ficcion    → SPECULATIVE
 * Y lo que no resuelve queda NEEDS_CONFIRMATION. No se inventa nada.
 */
import { readFileSync, writeFileSync } from "node:fs";

const m = JSON.parse(readFileSync("public/kodex-content/manifest.json", "utf8"));
const vols = m.volumes || m.volumenes || [];
const porId = new Map(vols.map((v) => [v.id, v]));

const ESTATUS = { documentado: "VERIFIED", estructura: "CANONICAL", esoterico: "INFERRED", ficcion: "SPECULATIVE" };

/* La relación se deduce de lo que el propio dato dice, y cuando el dato no
   alcanza para distinguir, queda la relación más débil y honesta del
   vocabulario cerrado: SHARES_ORIGIN. Nunca se inventa una relación fuerte. */
function relacionar(a, b) {
  if (!b) return "RESPONDS_TO";
  if (a.estrato && a.estrato === b.estrato) return "SHARES_ORIGIN";
  if (a.marco && b.marco && a.marco === b.marco) return "SHARES_GEOMETRY";
  if (a.registro !== b.registro) return "EXPANDS";
  return "SHARES_ORIGIN";
}

const aristas = [];
let sinResolver = 0;
for (const v of vols) {
  for (const r of v.resonancias ?? []) {
    const destinoId = typeof r === "string" ? r : r.id || r.target || r.destino;
    if (!destinoId) continue;
    const destino = porId.get(destinoId);
    if (!destino) sinResolver++;
    aristas.push({
      source_node: v.id,
      target_node: destinoId,
      relation_type: relacionar(v, destino),
      epistemic_status: destino ? (ESTATUS[v.registro] ?? "NEEDS_CONFIRMATION") : "NEEDS_CONFIRMATION",
      resolves: !!destino,
    });
  }
}

const nodos = vols.map((v) => ({
  node_id: v.id,
  title: v.titulo_en || v.titulo_es || v.id,
  stratum: v.estrato ?? null,
  epistemic_status: ESTATUS[v.registro] ?? "NEEDS_CONFIRMATION",
  registro: v.registro ?? null,
  degree: aristas.filter((a) => a.source_node === v.id || a.target_node === v.id).length,
}));

const porTipo = {}, porEstatus = {};
aristas.forEach((a) => { porTipo[a.relation_type] = (porTipo[a.relation_type] || 0) + 1; porEstatus[a.epistemic_status] = (porEstatus[a.epistemic_status] || 0) + 1; });

writeFileSync("public/kodex-content/graph.json", JSON.stringify({
  version: "kdx-graph-v0.1",
  generado: "2026-08-20",
  fuente: "public/kodex-content/manifest.json · resonancias",
  ontologia: "NodeRelation de src/lib/kodex/contratos.ts (13 relaciones cerradas)",
  nota: "Aristas TIPADAS mecanicamente desde el dato existente. Ninguna relacion inventada; lo que no resuelve queda NEEDS_CONFIRMATION. Los estratos nulos son cola de curaduria del creador, no un defecto del grafo.",
  totales: { nodos: nodos.length, aristas: aristas.length, sin_resolver: sinResolver,
    con_estrato: nodos.filter(n => n.stratum).length, por_tipo: porTipo, por_estatus: porEstatus },
  nodes: nodos, edges: aristas,
}, null, 1));

console.log(`  nodos: ${nodos.length} · aristas: ${aristas.length} · sin resolver: ${sinResolver}`);
console.log(`  con estrato asignado: ${nodos.filter(n=>n.stratum).length} (el resto es cola de curaduria)`);
console.log("  por tipo:", Object.entries(porTipo).map(([k,v])=>`${k}:${v}`).join(" · "));
console.log("  por estatus:", Object.entries(porEstatus).map(([k,v])=>`${k}:${v}`).join(" · "));
const top = nodos.filter(n=>n.degree>0).sort((a,b)=>b.degree-a.degree).slice(0,5);
console.log("  nodos mas conectados:", top.map(n=>`${n.node_id}(${n.degree})`).join(" · "));
