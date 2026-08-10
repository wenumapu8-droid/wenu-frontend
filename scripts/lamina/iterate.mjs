#!/usr/bin/env node
/**
 * KODEX-∞ · CICLO DE FOTOCOPIA
 *
 * Un comando = una vuelta completa:
 *
 *   build → servir → capturar → medir por región → recortar comparaciones
 *         → guardar la vuelta en el historial
 *
 * Existe para que iterar cueste un comando y no media hora de pasos manuales.
 * La vuelta 1 de esta lámina llevó ~40 minutos de andamiaje; con esto la
 * siguiente son dos minutos, y el equipo puede dar muchas vueltas por sesión.
 *
 * Y guarda HISTORIAL. Es lo que evita el fallo clásico de estos bucles: un
 * cambio "mejora" un panel y empeora tres, y sin serie histórica nadie se
 * entera hasta que la lámina entera está peor que hace cinco vueltas.
 *
 * Uso:
 *   node scripts/lamina/iterate.mjs <slug> [--no-build] [--crops]
 */

import { spawn } from "node:child_process";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const slug = process.argv[2];
if (!slug) {
  console.error("uso: node scripts/lamina/iterate.mjs <slug> [--no-build] [--crops]");
  process.exit(2);
}
const noBuild = process.argv.includes("--no-build");
const wantCrops = process.argv.includes("--crops");
const PORT = 4399;

const run = (cmd, args, opts = {}) =>
  new Promise((res, rej) => {
    const p = spawn(cmd, args, { cwd: ROOT, stdio: "pipe", ...opts });
    let out = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (out += d));
    p.on("close", (code) => (code === 0 ? res(out) : rej(new Error(out.slice(-2500)))));
  });

const alive = async () => {
  try {
    const r = await fetch(`http://localhost:${PORT}/kodex/lamina/${slug}/`);
    return r.ok;
  } catch {
    return false;
  }
};

// ── 1 · build ────────────────────────────────────────────────────────────
if (!noBuild) {
  process.stdout.write("  build… ");
  try {
    // ALLOW_EMPTY_PRODUCTS porque este repo aborta el build sin credenciales de
    // WooCommerce, y la lámina no depende de productos. Es el escape que el
    // propio CLAUDE.md documenta para builds offline.
    await run("npx", ["astro", "build"], { env: { ...process.env, ALLOW_EMPTY_PRODUCTS: "true" } });
    console.log("ok");
  } catch (e) {
    console.log("FALLÓ\n");
    console.error(String(e.message).split("\n").filter((l) => /error|Expected|Location/i.test(l)).slice(0, 8).join("\n"));
    process.exit(1);
  }
}

// ── 2 · servir ───────────────────────────────────────────────────────────
let server = null;
if (!(await alive())) {
  process.stdout.write("  preview… ");
  server = spawn("npx", ["astro", "preview", "--port", String(PORT)], {
    cwd: ROOT, stdio: "ignore", detached: true,
  });
  server.unref();
  for (let i = 0; i < 30 && !(await alive()); i++) await new Promise((r) => setTimeout(r, 500));
  console.log((await alive()) ? "ok" : "no levantó");
}
if (!(await alive())) {
  console.error(`  la lámina no responde en http://localhost:${PORT}/kodex/lamina/${slug}/`);
  process.exit(1);
}

// ── 3 · medir ────────────────────────────────────────────────────────────
const salida = await run("node", [
  join(HERE, "compare.mjs"), slug,
  "--url", `http://localhost:${PORT}/kodex/lamina/${slug}/`,
]);
console.log(salida);

// ── 4 · historial ────────────────────────────────────────────────────────
const outDir = join(HERE, "out", slug);
const score = JSON.parse(readFileSync(join(outDir, "score.json"), "utf8"));
const histPath = join(outDir, "historial.json");
const hist = existsSync(histPath) ? JSON.parse(readFileSync(histPath, "utf8")) : [];
const previa = hist[hist.length - 1];
hist.push({
  vuelta: hist.length + 1,
  fecha: score.generado,
  global: score.global.pct,
  regiones: Object.fromEntries(score.regiones.map((r) => [r.id, r.pct])),
});
writeFileSync(histPath, JSON.stringify(hist, null, 2));

if (previa) {
  const d = score.global.pct - previa.global;
  const signo = d < 0 ? "↓ MEJORA" : d > 0 ? "↑ EMPEORÓ" : "= igual";
  console.log(`  vuelta ${hist.length}: ${previa.global}% → ${score.global.pct}%   ${signo} ${Math.abs(d).toFixed(2)}\n`);

  // Regresiones por región: lo que este historial existe para atrapar.
  const peor = score.regiones
    .map((r) => ({ id: r.id, ahora: r.pct, antes: previa.regiones[r.id] ?? null }))
    .filter((r) => r.antes !== null && r.ahora - r.antes > 1.5)
    .sort((a, b) => b.ahora - b.antes - (a.ahora - a.antes));
  if (peor.length) {
    console.log("  REGRESIONES (empeoraron más de 1,5 puntos):");
    for (const r of peor.slice(0, 10)) {
      console.log(`    ${r.id.padEnd(10)} ${r.antes.toFixed(2)}% → ${r.ahora.toFixed(2)}%`);
    }
    console.log();
  }
} else {
  console.log(`  vuelta 1: ${score.global.pct}% (línea base)\n`);
}

// ── 5 · recortes para la próxima vuelta ──────────────────────────────────
if (wantCrops) {
  const sharp = (await import("sharp")).default;
  const panelesPath = join(HERE, "paneles", `${slug}.json`);
  if (!existsSync(panelesPath)) {
    console.log(`  (sin ${panelesPath}: no se generan recortes)`);
  } else {
    const paneles = JSON.parse(readFileSync(panelesPath, "utf8")).paneles;
    const dir = join(HERE, "crops", slug, `iter${hist.length + 1}`);
    mkdirSync(dir, { recursive: true });
    const ref = join(ROOT, "reference", "canon", `${slug}.png`);
    const act = join(outDir, "actual.png");
    for (const p of paneles) {
      const { x, y, w, h } = p.caja;
      const gap = 12;
      const esc = Math.max(1, Math.min(3, Math.floor(2200 / (w * 2 + gap))));
      const [a, b] = await Promise.all([
        sharp(ref).extract({ left: x, top: y, width: w, height: h }).toBuffer(),
        sharp(act).extract({ left: x, top: y, width: w, height: h }).toBuffer(),
      ]);
      await sharp({ create: { width: w * 2 + gap, height: h, channels: 3, background: "#202020" } })
        .composite([{ input: a, left: 0, top: 0 }, { input: b, left: w + gap, top: 0 }])
        .resize({ width: (w * 2 + gap) * esc, kernel: "nearest" })
        .png()
        .toFile(join(dir, `${p.id}.png`));
    }
    console.log(`  recortes ref|actual → scripts/lamina/crops/${slug}/iter${hist.length + 1}/\n`);
  }
}
