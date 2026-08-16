#!/usr/bin/env node
/* Escala el relleno de una pieza de la cabecera/pie y devuelve el hex.
   uso: node _t0106_hp_fill.mjs <archivo> <clave> <factor>  */
import { readFileSync, writeFileSync } from "node:fs";
const [f, clave, factor] = [process.argv[2], process.argv[3], Number(process.argv[4])];
const src = readFileSync(f, "utf8");
const re = new RegExp(`(${clave}: ")#([0-9a-fA-F]{6})(")`);
const m = src.match(re);
if (!m) { console.error("no encontrado", clave); process.exit(1); }
const c = [0, 2, 4].map((i) => parseInt(m[2].slice(i, i + 2), 16));
const n = c.map((v) => Math.max(0, Math.min(255, Math.round(v * factor))));
const hex = n.map((v) => v.toString(16).padStart(2, "0")).join("");
writeFileSync(f, src.replace(re, `$1#${hex}$3`));
console.log(clave, "#" + m[2], "->", "#" + hex);
