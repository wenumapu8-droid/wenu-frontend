#!/usr/bin/env node
/**
 * KODEX-∞ · CICLO DE FOTOCOPIA DE GENESIS CRADLE
 *
 * Igual que scripts/lamina/iterate.mjs, pero construyendo con
 * astro.config.gc.mjs (outDir dist-gc) para no chocar con los otros
 * agentes que comparten la rama. Guarda el mismo historial.
 */
import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const slug = "genesis-cradle";
const REFDIR = process.env.KDX_REFDIR || "reference/pendientes";
const PORT = Number(process.env.KDX_PUERTO || 4426);
const noBuild = process.argv.includes("--no-build");

const run = (cmd, args, opts = {}) =>
  new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: "pipe", ...opts });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (c) => (c === 0 ? res(out) : rej(new Error(out.slice(-2500)))));
  });

const alive = async () => {
  try {
    const r = await fetch(`http://127.0.0.1:${PORT}/kodex/lamina/${slug}/`);
    return r.ok;
  } catch { return false; }
};

if (!noBuild) {
  process.stdout.write("  build… ");
  try {
    await run("npx", ["astro", "build", "--config", "astro.config.gc.mjs"], {
      env: { ...process.env, ALLOW_EMPTY_PRODUCTS: "true" },
    });
    console.log("ok");
  } catch (e) {
    console.log("FALLÓ\n");
    console.error(String(e.message).split("\n").filter((l) => /error|Expected|Location/i.test(l)).slice(0, 8).join("\n"));
    process.exit(1);
  }
}

if (!(await alive())) {
  process.stdout.write("  preview… ");
  const s = spawn("npx", ["astro", "preview", "--config", "astro.config.gc.mjs", "--host", "127.0.0.1", "--port", String(PORT)], {
    cwd: ROOT, stdio: "ignore", detached: true,
  });
  s.unref();
  for (let i = 0; i < 40 && !(await alive()); i++) await new Promise((r) => setTimeout(r, 500));
  console.log((await alive()) ? "ok" : "no levantó");
}
if (!(await alive())) {
  console.error(`  no responde en http://127.0.0.1:${PORT}/kodex/lamina/${slug}/`);
  process.exit(1);
}

console.log(await run("node", [join(HERE, "..", "compare.mjs"), slug, "--url", `http://127.0.0.1:${PORT}/kodex/lamina/${slug}/`], { env: { ...process.env, KDX_REFDIR: REFDIR } }));

const outDir = join(HERE, "..", "out", slug);
const score = JSON.parse(readFileSync(join(outDir, "score.json"), "utf8"));
const histPath = join(outDir, "historial.json");
const hist = existsSync(histPath) ? JSON.parse(readFileSync(histPath, "utf8")) : [];
const previa = hist[hist.length - 1];
hist.push({
  vuelta: hist.length + 1, fecha: score.generado,
  global: score.global.pct, cobertura: score.global.cobertura,
  regiones: Object.fromEntries(score.regiones.map((r) => [r.id, r.pct])),
  cob: Object.fromEntries(score.regiones.map((r) => [r.id, r.cobertura])),
});
writeFileSync(histPath, JSON.stringify(hist, null, 2));

if (previa) {
  const d = score.global.pct - previa.global;
  console.log(`  vuelta ${hist.length}: ${previa.global}% → ${score.global.pct}%   ${d < 0 ? "↓ MEJORA" : d > 0 ? "↑ EMPEORÓ" : "= igual"} ${Math.abs(d).toFixed(2)}   ·  cobertura ${previa.cobertura ?? "?"} → ${score.global.cobertura}\n`);
  const peor = score.regiones
    .map((r) => ({ id: r.id, ahora: r.pct, antes: previa.regiones[r.id] ?? null }))
    .filter((r) => r.antes !== null && r.ahora - r.antes > 0.4)
    .sort((a, b) => b.ahora - b.antes - (a.ahora - a.antes));
  if (peor.length) {
    console.log("  REGRESIONES:");
    for (const r of peor) console.log(`    ${r.id.padEnd(12)} ${r.antes.toFixed(2)}% → ${r.ahora.toFixed(2)}%`);
    console.log();
  }
} else console.log(`  vuelta 1: ${score.global.pct}% (línea base)\n`);

for (const r of score.regiones) console.log(`  ${r.id.padEnd(12)} pct ${String(r.pct).padStart(7)}  cob ${String(r.cobertura).padStart(6)}`);
