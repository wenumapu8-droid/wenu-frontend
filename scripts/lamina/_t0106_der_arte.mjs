#!/usr/bin/env node
/**
 * KODEX-∞ · t01-06 RITUAL DEVICE · DERECHA — empaqueta el CHROME trazado.
 *
 * Sólo entra acá lo que en la lámina es una MARCA FIJA: los siete glifos de
 * SYSTEM STATUS, los cuatro emblemas del troquel de los chips y el globo polar
 * del OUTPUT FEED. Todo lo demás del bloque —los dos diagramas del panel 03,
 * los cinco medidores, las dos señales, el cuerpo de los chips— se dibuja por
 * código, que es lo que el contrato pide y lo único que puede tener estados.
 *
 * Uso: node scripts/lamina/_t0106_der_arte.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");
const G = join(HERE, "glyphs", "t01-06-ritual-device");
const OX = 1014, OY = 88; // origen del bloque Derecha

/** id destino ← [subcarpeta, archivo] */
const PIEZAS = {
  st1: ["der-glifos", "g01"],
  st2: ["der-glifos", "g02"],
  st3: ["der-glifos", "g03"],
  st4: ["der-glifos", "g04"],
  st5: ["der-glifos", "g05"],
  st6: ["der-glifos", "g07"],
  st7: ["der-glifos", "g08"],
  chip1: ["der-chip1", "g01"],
  chip2: ["der-chip2", "g01"],
  chip3: ["der-chip3", "g01"],
  chip4: ["der-chip4", "g02"],
  globo: ["der-globo", "g01"],
};

const out = {};
for (const [id, [sub, file]] of Object.entries(PIEZAS)) {
  const svg = readFileSync(join(G, sub, `${file}.svg`), "utf8");
  const man = JSON.parse(readFileSync(join(G, sub, "manifiesto.json"), "utf8"));
  const g = man.glifos.find((x) => x.id === file);
  const vb = svg.match(/viewBox="0 0 (\d+) (\d+)"/);
  /* El trazador emite un <path> por contorno y a casi todos les cuelga un
     transform="translate(...)". Perderlo desarma el dibujo: la primera pasada
     de este bloque salió con los siete glifos hechos jirones justamente por
     eso. Se conserva tal cual. */
  const ds = [...svg.matchAll(/<path\b([^>]*)>/g)].map((m) => {
    const d = m[1].match(/\sd="([^"]+)"/);
    const tr = m[1].match(/\stransform="([^"]+)"/);
    return [d ? d[1] : "", tr ? tr[1] : ""];
  }).filter(([d]) => d);
  out[id] = {
    x: g.caja.x - OX,
    y: g.caja.y - OY,
    w: g.caja.w,
    h: g.caja.h,
    vw: +vb[1],
    vh: +vb[2],
    d: ds,
  };
}

mkdirSync(join(ROOT, "src/components/kodex/lamina/t01-06/trazos"), { recursive: true });
const cab = `/**
 * GENERADO — no editar a mano. Regenerar con:
 *   node scripts/lamina/_t0106_der_arte.mjs
 *
 * Chrome trazado del bloque Derecha de t01-06. Coordenadas ya relativas al
 * origen del bloque (1014, 88).
 */
export interface Trazo { x: number; y: number; w: number; h: number; vw: number; vh: number; d: Array<[string, string]> }
export const ARTE: Record<string, Trazo> = ${JSON.stringify(out)};
`;
writeFileSync(join(ROOT, "src/components/kodex/lamina/t01-06/trazos/der.ts"), cab);
const paths = Object.values(out).reduce((a, p) => a + p.d.length, 0);
console.log(`  ${Object.keys(out).length} piezas · ${paths} paths · ${(cab.length / 1024).toFixed(1)} KB`);
