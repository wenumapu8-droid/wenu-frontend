#!/usr/bin/env node
/** Imprime un trozo del HTML construido alrededor de una marca. Uso: <marca> [n] */
import { readFileSync } from "node:fs";
const h = readFileSync("dist/kodex/lamina/u10-commons/index.html", "utf8");
const i = h.indexOf(process.argv[2] ?? "u10p-mano-a");
console.log(i < 0 ? "no está en el HTML" : h.slice(i, i + Number(process.argv[3] ?? 400)));
