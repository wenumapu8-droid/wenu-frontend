import { readFileSync, writeFileSync, existsSync } from "node:fs";
const dir = "scripts/lamina/out/mycelial-oracle";
const score = JSON.parse(readFileSync(`${dir}/score.json`, "utf8"));
const p = `${dir}/historial.json`;
const h = existsSync(p) ? JSON.parse(readFileSync(p, "utf8")) : [];
const previa = h[h.length - 1];
h.push({ vuelta: h.length + 1, fecha: score.generado, global: score.global.pct, cobertura: score.global.cobertura,
  regiones: Object.fromEntries(score.regiones.map((r) => [r.id, [r.pct, r.cobertura]])) });
writeFileSync(p, JSON.stringify(h, null, 2));
console.log(`  vuelta ${h.length}` + (previa ? `: global ${previa.global}% → ${score.global.pct}%  ·  cobertura ${previa.cobertura}% → ${score.global.cobertura}%` : " (línea base)"));
if (previa) {
  const peor = score.regiones.map((r) => ({ id: r.id, a: r.pct, b: previa.regiones[r.id]?.[0] }))
    .filter((r) => r.b != null && r.a - r.b > 1).sort((x, y) => (y.a - y.b) - (x.a - x.b));
  if (peor.length) { console.log("  REGRESIONES:"); for (const r of peor) console.log(`    ${r.id.padEnd(12)} ${r.b.toFixed(2)}% → ${r.a.toFixed(2)}%`); }
}
console.log("  cobertura por región:");
for (const r of score.regiones) console.log(`    ${r.id.padEnd(12)} pct ${String(r.pct).padStart(6)}%   cobertura ${String(r.cobertura).padStart(6)}%`);
