import fs from "node:fs";
import path from "node:path";

const ROOT = "public/kodex-content";
const MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, "manifest.json"), "utf8"));

const REGISTRY_PATH = path.join(ROOT, "asset-registry.json");
const LICENSE = "PROPRIETARY-BRAND-ASSET";

const entries = [];
const reviewFlags = {};

for (const v of MANIFEST.volumes) {
  if (v.id && v.review !== undefined) reviewFlags[v.id] = v.review;
}

const brandDir = "public/img/kodex/brand";
for (const f of fs.readdirSync(brandDir)) {
  const ext = path.extname(f).toLowerCase();
  let type = null;
  if (ext === ".svg") type = "svg";
  else if (ext === ".png") type = "png";
  else if (ext === ".webp") type = "webp";
  if (!type) continue;
  const sceneMatch = f.match(/kodex-(\d+)-([a-z]+)/);
  const scene = sceneMatch ? sceneMatch[2] : null;
  entries.push({
    id: "brand-" + f.replace(/\.[^.]+$/, ""),
    type,
    path: "/img/kodex/brand/" + f,
    license: LICENSE,
    origin: "KODEX-ORIGINAL",
    creator: "Ocin / Wenu Mapu",
    sourceUrl: null,
    allowedScenes: scene ? [scene] : ["threshold", "return"],
    commercialUse: true,
    redistributable: false,
    attribution: null,
    notes: f.includes("Master_Seal") ? "Canonical master seal. Do not alter geometry." : "Brand scene asset.",
  });
}

const uiDir = "public/img/kodex/ui";
for (const f of fs.readdirSync(uiDir)) {
  const ext = path.extname(f).toLowerCase();
  let type = null;
  if (ext === ".png") type = "png";
  else if (ext === ".webp") type = "webp";
  if (!type) continue;
  entries.push({
    id: "ui-" + f.replace(/\.[^.]+$/, ""),
    type,
    path: "/img/kodex/ui/" + f,
    license: LICENSE,
    origin: "KODEX-ORIGINAL",
    creator: "Ocin / Wenu Mapu",
    sourceUrl: null,
    allowedScenes: ["threshold", "observe"],
    commercialUse: true,
    redistributable: false,
    attribution: null,
    notes: "UI system asset.",
  });
}

const artDir = path.join(ROOT, "art");
for (const slug of fs.readdirSync(artDir)) {
  const dir = path.join(artDir, slug);
  if (!fs.statSync(dir).isDirectory()) continue;
  const cover = "art/" + slug + "/cover.webp";
  const vol = MANIFEST.volumes.find((v) => v.asset_files?.includes(cover));
  const id = "spec-" + slug;
  const review = reviewFlags[id] === true;
  entries.push({
    id,
    type: "webp",
    path: "/kodex-content/" + cover,
    license: LICENSE,
    origin: "KODEX-ORIGINAL",
    creator: "Ocin / Wenu Mapu",
    sourceUrl: null,
    allowedScenes: ["observe", "return"],
    commercialUse: true,
    redistributable: false,
    attribution: null,
    notes: review ? "Provenance pending review." : "Photographic specimen captured by Ocin.",
    review: review || undefined,
  });
}

const wpDir = path.join(ROOT, "free", "wallpapers");
for (const f of fs.readdirSync(wpDir)) {
  if (!f.endsWith(".webp")) continue;
  const base = f.replace(/-(mobile|desktop)\.webp$/, "");
  const review = reviewFlags["spec-" + base] === true;
  entries.push({
    id: "wallpaper-" + base + "-" + f.match(/-(mobile|desktop)\.webp$/)[1],
    type: "webp",
    path: "/kodex-content/free/wallpapers/" + f,
    license: LICENSE,
    origin: "KODEX-ORIGINAL",
    creator: "Ocin / Wenu Mapu",
    sourceUrl: null,
    allowedScenes: ["return"],
    commercialUse: true,
    redistributable: false,
    attribution: null,
    notes: "Derived wallpaper from specimen " + base + ".",
    review: review || undefined,
  });
}

const editionsDir = path.join(ROOT, "editions");
for (const f of fs.readdirSync(editionsDir)) {
  entries.push({
    id: "edition-" + f.replace(/\.[^.]+$/, ""),
    type: "code",
    path: "/kodex-content/editions/" + f,
    license: LICENSE,
    origin: "KODEX-ORIGINAL",
    creator: "KODEX",
    sourceUrl: null,
    allowedScenes: ["archive", "machine"],
    commercialUse: true,
    redistributable: false,
    attribution: null,
    notes: "Edition data manifest.",
  });
}

const ocinCover = path.join(ROOT, "books", "ocin-cover.webp");
if (fs.existsSync(ocinCover)) {
  entries.push({
    id: "book-ocin-cover",
    type: "webp",
    path: "/kodex-content/books/ocin-cover.webp",
    license: LICENSE,
    origin: "KODEX-ORIGINAL",
    creator: "Ocin / Wenu Mapu",
    sourceUrl: null,
    allowedScenes: ["archive"],
    commercialUse: true,
    redistributable: false,
    attribution: null,
    notes: "OCÍN arte digital ritual book cover.",
  });
}

const archiveDir = "public/img/kodex/archive";
for (const f of fs.readdirSync(archiveDir)) {
  if (!/\.(jpg|png)$/i.test(f)) continue;
  entries.push({
    id: "arch-" + f.replace(/\.[^.]+$/, ""),
    type: f.endsWith(".png") ? "png" : "texture",
    path: "/img/kodex/archive/" + f,
    license: LICENSE,
    origin: "KODEX-ORIGINAL",
    creator: "Ocin / Wenu Mapu",
    sourceUrl: null,
    allowedScenes: ["archive"],
    commercialUse: true,
    redistributable: false,
    attribution: null,
    notes: "Archive image. Provenance pending review.",
    review: true,
  });
}

entries.sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(REGISTRY_PATH, JSON.stringify(entries, null, 2) + "\n");
console.log("asset-registry.json generado:", entries.length, "entradas");
