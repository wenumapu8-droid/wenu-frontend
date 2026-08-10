#!/usr/bin/env node
/**
 * Genera el andamiaje de una lámina: página + marcadores + recortes.
 *
 * Las cajas finas ya NO las fijo yo. En las primeras láminas las medía a mano
 * banda por banda, y funcionaba, pero es mi cuello de botella: cada lámina
 * necesitaba veinte minutos míos antes de que nadie pudiera empezar. Y cuando
 * la retícula es abierta —OBSERVATION EYE, ARCHIVE TREE— el método no encuentra
 * las columnas y hay que decidir a ojo igual.
 *
 * Así que el andamiaje da BLOQUES GRUESOS (tercios y bandas) y cada agente mide
 * los suyos adentro. Ya demostraron que lo hacen al píxel: los informes de las
 * tres primeras láminas están llenos de mediciones propias más finas que las
 * mías. Reparto lo que la máquina hace bien —recortar, servir, puntuar— y dejo
 * el ojo donde hace falta.
 *
 * uso: node scripts/lamina/andamiar.mjs <slug> <col1> <col2>
 *      col1/col2 = los dos cortes verticales de la banda central
 */
import sharp from "sharp";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const [slug, c1, c2] = [process.argv[2], +process.argv[3], +process.argv[4]];
if (!slug || !c1) { console.error("uso: andamiar.mjs <slug> <col1> <col2>"); process.exit(2); }

const CORTE_SUP = 88, CORTE_INF = 866;
const bloques = [
  { id: "Cabecera", caja: { x: 0, y: 0, w: 1672, h: CORTE_SUP } },
  { id: "Izquierda", caja: { x: 4, y: CORTE_SUP, w: c1 - 4, h: CORTE_INF - CORTE_SUP } },
  { id: "Centro", caja: { x: c1, y: CORTE_SUP, w: c2 - c1, h: CORTE_INF - CORTE_SUP } },
  { id: "Derecha", caja: { x: c2, y: CORTE_SUP, w: 1668 - c2, h: CORTE_INF - CORTE_SUP } },
  { id: "Pie", caja: { x: 0, y: CORTE_INF, w: 1672, h: 941 - CORTE_INF } },
];

const corto = slug.slice(0, 6);
const compDir = join(ROOT, "src/components/kodex/lamina", corto);
const cropDir = join(ROOT, "scripts/lamina/crops", corto, "iter1");
mkdirSync(compDir, { recursive: true });
mkdirSync(cropDir, { recursive: true });

writeFileSync(join(ROOT, "scripts/lamina/paneles", `${slug}.json`),
  JSON.stringify({ slug, _nota: "Bloques gruesos. Cada agente mide sus paneles finos adentro.", paneles: bloques }, null, 2));

for (const b of bloques) {
  const f = join(compDir, `${b.id}.astro`);
  if (!existsSync(f)) writeFileSync(f,
`---
/* MARCADOR — bloque sin escribir. Sobreescribilo entero. */
interface Props { box: string }
const { box } = Astro.props;
---

<div data-box style={box}></div>
`);
  const { x, y, w, h } = b.caja;
  const sc = Math.max(1, Math.min(3, Math.floor(2400 / w)));
  await sharp(join(ROOT, "reference/canon", `${slug}.png`))
    .extract({ left: x, top: y, width: w, height: h })
    .resize({ width: w * sc, kernel: "nearest" }).png()
    .toFile(join(cropDir, `${b.id}.png`));
}

const imp = bloques.map((b) => `import ${b.id} from "../../../components/kodex/lamina/${corto}/${b.id}.astro";`).join("\n");
const uso = bloques.map((b) => `        <${b.id} box="left:${b.caja.x}px;top:${b.caja.y}px;width:${b.caja.w}px;height:${b.caja.h}px" />`).join("\n");
writeFileSync(join(ROOT, "src/pages/kodex/lamina", `${slug}.astro`),
`---
/**
 * KODEX-∞ · LÁMINA ${slug}
 * Andamiaje generado. Bloques gruesos; cada uno mide sus paneles adentro.
 * Medir: node scripts/lamina/iterate.mjs ${slug}
 */
import "../../../styles/kodex-lamina.css";
${imp}
const W = 1672, H = 941;
---

<html lang="es">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>KODEX−∞ · ${slug}</title>
    <meta name="robots" content="noindex, nofollow" />
    <style is:global>
      html, body { margin: 0; padding: 0; background: #000; overflow: hidden; }
      .kdx-lam-fit { --s: 1; --tx: 0px; --ty: 0px; position: absolute; inset: 0; overflow: hidden; }
      .kdx-lam-fit > .kdx-lam { position: absolute; left: 0; top: 0; transform-origin: 0 0;
        transform: translate(var(--tx), var(--ty)) scale(var(--s)); }
    </style>
  </head>
  <body>
    <div class="kdx-lam-fit">
      <div class="kdx-lam" style={\`width:\${W}px;height:\${H}px\`} data-lamina="${slug}">
${uso}
      </div>
    </div>
    <script>
      const sinks = [];
      window.__kdxRegisterFreeze = (fn) => sinks.push(fn);
      window.__kdxFreeze = (t = 0) => { for (const fn of sinks) fn(t); document.documentElement.dataset.kdxFrozen = "1"; };
      const fit = document.querySelector(".kdx-lam-fit");
      if (fit) {
        const ajustar = () => {
          const vw = innerWidth, vh = innerHeight;
          const s = Math.min(1, vw / 1672, vh / 941);
          fit.style.setProperty("--s", String(s));
          fit.style.setProperty("--tx", ((vw - 1672 * s) / 2).toFixed(2) + "px");
          fit.style.setProperty("--ty", ((vh - 941 * s) / 2).toFixed(2) + "px");
        };
        ajustar(); addEventListener("resize", ajustar, { passive: true });
      }
    </script>
  </body>
</html>
`);
console.log(`  ${slug}: 5 bloques · página + marcadores + recortes`);
