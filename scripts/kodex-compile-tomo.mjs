// KODEX −∞ · Compila un tomo de KODEX ESTELAR en un archivo único (libro-N-completo.md)
// Mecánico, sale 100% de fuentes existentes: apertura (00-apertura-y-sellos.md) +
// capítulos verbatim (libro-N/NN-slug.md, en orden) + colofón (mismo patrón de
// libro-I-completo.md). NO escribe prosa: solo concatenación/estructura.
// Uso: node scripts/kodex-compile-tomo.mjs II|III
import { readFile, writeFile } from 'node:fs/promises';

const ROMAN = { I: 1, II: 2, III: 3, IV: 4 };
const target = process.argv[2]; // II | III
if (!["II", "III"].includes(target)) { console.error("uso: node scripts/kodex-compile-tomo.mjs II|III"); process.exit(1); }

const BASE = "public/kodex-content/books/kodex-estelar";
const man = JSON.parse(await readFile("public/kodex-content/manifest.json", "utf8"));
const libro = man.saga_kodex_estelar.libros.find((l) => l.numero === target);
if (!libro) { console.error("tomo " + target + " no encontrado en manifest"); process.exit(1); }

const caps = [...(libro.capitulos || [])].sort((a, b) => a.n - b.n);
if (caps.length !== 12) {
  console.error(`tomo ${target} tiene ${caps.length} capítulos (se esperan 12); no compilo.`);
  process.exit(1);
}

// apertura verbatim (entre "## APERTURA DE LA SAGA" y "## SELLOS")
const aperturaSrc = await readFile(BASE+"/00-apertura-y-sellos.md", "utf8");
const aBody = aperturaSrc.split("\n");
const start = aBody.findIndex((l) => l.includes("## APERTURA DE LA SAGA"));
const end = aBody.findIndex((l, i) => i > start && l.includes("## SELLOS"));
let body = aBody.slice(start + 1, end).join("\n").replace(/\n-{3,}\s*$/, "").trim();

const titulo = libro.titulo || libro.titulo_es;
const titleUp = titulo.toUpperCase().replace("—", "-");
let out = `# KODEX ESTELAR · LIBRO ${target} — ${titleUp}\n\n`;
out += `## APERTURA DE LA SAGA\n\n${body}\n\n---\n\n`;

for (const c of caps) {
  const f = await readFile(BASE + "/" + c.path, "utf8");
  out += f.trim() + "\n\n---\n\n";
}

out += `## COLOPHON\n\n`;
out += `KODEX ESTELAR · LIBRO ${target} — ${titulo}\n\n`;
out += `Texto desarrollado de los apuntes originales de OCÍN (Serpiente Espectral Roja),\n`;
out += `según la voz y arquitectura de BIBLIA-Y-VOZ.md.\n\n`;
out += `*Menos infinito · cero · más infinito.*\n`;
out += `*Una forma, muchas manifestaciones.*\n\n`;
out += `— Serpiente Espectral Roja\n`;

const dest = `${BASE}/libro-${target.toLowerCase()}-completo.md`;
await writeFile(dest, out);
console.log(`compilado ${target}: ${caps.length} capítulos → ${dest} (${out.length} bytes)`);