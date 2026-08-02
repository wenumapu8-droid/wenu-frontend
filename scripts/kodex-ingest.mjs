// KODEX −∞ · Ingestor mecánico de arte de Ocin (CONTENIDO)
// Fuentes: A) uploads de la sesión, B) kodex-art-inbox. Dedup por slug.
// Salida: art/SLUG/cover.webp+avif + 400/800/1400, free/wallpapers/SLUG-{mobile,desktop}.webp
// Resume: estado en .kodex-ingest-state.json (por slug). NO inventa curaduría (review:true).
import sharp from 'sharp';
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const SRC_A = "/Users/user1/Library/Application Support/Claude/local-agent-mode-sessions/4814e213-bbe2-40ae-b139-8ba7b3337c45/0c515280-d897-4086-a1c6-f53a62fb974f/agent/local_ditto_0c515280-d897-4086-a1c6-f53a62fb974f/uploads/";
const SRC_B = "/Users/user1/Downloads/kodex-art-inbox/";
const ART = "public/kodex-content/art";
const WP = "public/kodex-content/free/wallpapers";
const STATE = ".kodex-ingest-state.json";
const CONC = 10;
const LIMIT = Number(process.env.INGEST_LIMIT || 0); // 0 = sin límite

await mkdir(WP, { recursive: true });

async function findSources() {
  const out = new Map();
  for (const dir of [SRC_A, SRC_B]) {
    let entries = [];
    try { entries = await readdir(dir); } catch { continue; }
    for (const e of entries) {
      if (!/\.(jpe?g)$/i.test(e)) continue;
      const slug = e.replace(/\.(jpe?g)$/i, "");
      if (!out.has(slug)) out.set(slug, path.join(dir, e));
    }
  }
  return out;
}

async function alreadyDone(slug) {
  try { await stat(path.join(ART, slug, "cover.webp")); return true; } catch { return false; }
}

async function processOne(slug, src) {
  const dir = path.join(ART, slug);
  await mkdir(dir, { recursive: true });
  const meta = await sharp(src).metadata();
  const coverW = Math.min(meta.width || 1800, 1800);

  // decode once to a pre-sized 1800 base, then derive all variants from the buffer
  const base = await sharp(src).resize({ width: coverW, withoutEnlargement: true }).webp({ quality: 88 }).toBuffer();
  const coverP = path.join(dir, "cover.webp");
  await sharp(base).toFile(coverP);
  await sharp(base).avif({ quality: 70, effort: 3 }).toFile(path.join(dir, "cover.avif"));
  for (const w of [400, 800, 1400]) {
    const wu = Math.min(w, coverW);
    await sharp(base).resize({ width: wu, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(dir, `cover-${w}.webp`));
    await sharp(base).resize({ width: wu, withoutEnlargement: true }).avif({ quality: 68, effort: 3 }).toFile(path.join(dir, `cover-${w}.avif`));
  }

  await sharp(base).resize(1080, 1920, { fit: "cover", position: "attention" }).webp({ quality: 80 }).toFile(path.join(WP, `${slug}-mobile.webp`));
  await sharp(base).resize(1920, 1080, { fit: "cover", position: "attention" }).webp({ quality: 80 }).toFile(path.join(WP, `${slug}-desktop.webp`));
}

// state resume
let state = { done: [], failed: [] };
try { state = JSON.parse(await readFile(STATE, "utf8")); } catch {}
const doneSet = new Set(state.done);

const sources = await findSources();
const all = [...sources.keys()].sort();
const todo = [];
for (const slug of all) {
  if (doneSet.has(slug)) continue;
  if (await alreadyDone(slug)) { doneSet.add(slug); state.done.push(slug); continue; }
  todo.push(slug);
}

let i = 0;
let completedThisRun = 0;
async function worker() {
  while (i < todo.length) {
    if (LIMIT && completedThisRun >= LIMIT) break;
    const slug = todo[i++];
    try {
      await processOne(slug, sources.get(slug));
      doneSet.add(slug); state.done.push(slug); completedThisRun++;
    } catch (e) {
      state.failed.push({ slug, error: String(e).slice(0, 200) });
    }
    if (completedThisRun % 5 === 0 || completedThisRun >= todo.length) {
      await writeFile(STATE, JSON.stringify(state, null, 2));
    }
  }
}
await Promise.all(Array.from({ length: CONC }, worker));
await writeFile(STATE, JSON.stringify(state, null, 2));

const doneCount = state.done.length;
console.log(`procesadas esta tanda: ${todo.length} | total acumulado: ${doneCount}/${all.length} | fallidas: ${state.failed.length}`);
