// KODEX −∞ · Registra capítulos de tomo en manifest + index.json (mecánico, idempotente).
// Lee libros reales en books/kodex-estelar/libro-N/NN-slug.md y rellena capitulos[] del tomo.
// NO escribe prosa: solo estructura/registro. Uso: node scripts/kodex-register-tomo-capitulos.mjs [numero_tomo]
import { readFile, writeFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const TOMO_DIR = "public/kodex-content/books/kodex-estelar";
const MANIFEST = "public/kodex-content/manifest.json";
const INDEX = path.join(TOMO_DIR, "index.json");

const romans = { I: 1, II: 2, III: 3, IV: 4 };
const targetNum = process.argv[2]; // "II" o vacío = todos

function slugTitle(n) {
  const roman = n === 1 ? "I" : n === 2 ? "II" : n === 3 ? "III" : "IV";
  return `libro-${roman}`;
}

const manifest = JSON.parse(await readFile(MANIFEST, "utf8"));
const index = JSON.parse(await readFile(INDEX, "utf8"));
const libros = manifest.saga_kodex_estelar.libros;

function parseChapterFile(name, dir) {
  const m = name.match(/^(\d+)-(.+)\.md$/);
  if (!m) return null;
  const n = Number(m[1]);
  const slug = name.replace(/\.md$/, "");
  const titulo = m[2].split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  return { n, slug, titulo, path: `${dir}/${name}` };
}

let registered = 0;
for (const libro of libros) {
  const numero = libro.numero;
  if (targetNum && targetNum !== numero) continue;
  const dir = slugTitle(romans[numero]);
  const fullDir = path.join(TOMO_DIR, dir);
  let files = [];
  try { files = await readdir(fullDir); } catch { continue; } // tomo aún sin escritura
  const seen = new Map((libro.capitulos || []).map((c) => [c.slug, c]));
  const caps = files
    .filter((f) => /^\d+-.+\.md$/.test(f))
    .map((f) => parseChapterFile(f, dir))
    .sort((a, b) => a.n - b.n)
    .map((c) => seen.get(c.slug) ?? c); // conserva titulo/path existentes
  if (!caps.length) continue;
  const had = seen.size;
  libro.capitulos = caps;
  libro.total_capitulos = caps.length;
  if (caps.length === 12) {
    libro.release_state = "published";
    libro.release_date = libro.release_date && libro.release_date !== "TBD (sellado)" ? libro.release_date : new Date().toISOString().slice(0, 10);
    delete libro.sello_estado;
  }
  registered += caps.length - had;
  console.log(`tomo ${numero}: ${had} -> ${caps.length} capítulos`);
}

const indexLibros = index.libros || [];
for (const libro of libros) {
  const idx = indexLibros.find((l) => l.numero === libro.numero);
  if (idx) {
    idx.capitulos = libro.capitulos;
    idx.total_capitulos = libro.total_capitulos;
    idx.release_state = libro.release_state;
    idx.release_date = libro.release_date;
  }
}

await writeFile(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
await writeFile(INDEX, JSON.stringify(index, null, 2) + "\n");
console.log(`registrados: +${registered}`);
