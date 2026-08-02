// KODEX −∞ · Registra specimens (review:true) por slug ya ingerido en art/.
// Titulo/categoria tentativos del filename. Curaduría VACÍA. NO inventa.
// Idempotente: por id. Escribe manifest.json con indent 2.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ART = "public/kodex-content/art";
const MANIFEST = "public/kodex-content/manifest.json";

const m = JSON.parse(await readFile(MANIFEST, "utf8"));
const existing = new Set(m.volumes.map((v) => v.id));
const dirs = (await readdir(ART, { withFileTypes: true })).filter((d) => d.isDirectory() && existsSync(path.join(ART, d.name, "cover.webp")));

let added = 0;
const fns = {};

function categoriaTentativa(slug) {
  // última secuencia numérica = pista; si no hay señal, "(review)"
  const m2 = slug.match(/-(\d+)$/);
  const n = m2 ? Number(m2[1]) : 0;
  if (n >= 9800 && n <= 9899) return "sesion-digital";
  if (n >= 49000 && n <= 54999) return "laminas";
  return "(review)";
}

for (const d of dirs) {
  const slug = d.name;
  const id = `spec-${slug}`;
  if (existing.has(id)) continue;
  const f = fns[slug] ?? (fns[slug] = id);
  m.volumes.push({
    id,
    tipo: "specimen",
    titulo_es: slug,
    titulo_en: slug,
    curaduria_es: "",
    curaduria_en: "",
    registro: "documentado",
    paleta: "marca",
    categoria: categoriaTentativa(slug),
    resumen_poetico: "",
    assets: [`art/${slug}/cover.webp`],
    asset_files: [`art/${slug}/cover.webp`],
    cover: `art/${slug}/cover.webp`,
    hero: null,
    asset_type: "edition",
    price_tier: "edicion-digital",
    price: "USD 12",
    fecha: "2026-08-01",
    release_state: "published",
    marco: "documentado",
    review: true,
    review_nota: "Ingesta mecánica. Titulo/categoria/curaduría pendientes de COWORK.",
    resonancias: [],
    links: {},
  });
  existing.add(id);
  added++;
}

await writeFile(MANIFEST, JSON.stringify(m, null, 2) + "\n");
console.log("specimens registrados:", added, "| total volumenes:", m.volumes.length);
