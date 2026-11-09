// build_art.mjs — Pipeline de obra de Ocin → public/kodex-content/art/
// Copia LIMPIA (sin dither, sin efectos): webp + avif companions, color fiel.
// Fuente: ~/kodex-content/vol/behance-*/raw (22 proyectos Behance = obra de Ocin).
// Idempotente: no re-encodea si el destino es más nuevo que el origen.
import sharp from 'sharp';
import { mkdir, readdir, stat, copyFile, unlink } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const SRC = path.resolve(process.env.HOME, 'kodex-content/vol');
const OUT = path.resolve(process.env.HOME, 'wenu-frontend/public/kodex-content/art');
const EXT = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_EDGE = 2048;

async function* walkImages(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walkImages(p);
    else if (EXT.has(path.extname(e.name).toLowerCase())) yield p;
  }
}

async function newest(...paths) {
  let max = 0;
  for (const p of paths) {
    try { max = Math.max(max, (await stat(p)).mtimeMs); } catch { return null; }
  }
  return max;
}

async function makeCover(imgs, out) {
  const src = imgs[0];
  const dst = path.join(out, 'cover.webp');
  const t = await newest(src, dst);
  if (t === null) {
    await sharp(src).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, withoutEnlargement: true })
      .webp({ quality: 82 }).toFile(dst);
  }
}

async function makeDerived(src, dst) {
  if (await newest(src, dst) !== null) return;
  let pipe = sharp(src).rotate().resize({ width: MAX_EDGE, height: MAX_EDGE, withoutEnlargement: true });
  if (dst.endsWith('.avif')) pipe = pipe.avif({ quality: 62 });
  else pipe = pipe.webp({ quality: 82 });
  await pipe.toFile(dst);
}

async function pool(items, worker, conc) {
  const q = [...items]; let i = 0;
  const runners = Array.from({ length: conc }, async () => {
    while (i < q.length) {
      const idx = i++;
      await worker(q[idx], idx);
    }
  });
  await Promise.all(runners);
}

async function main() {
  const { readdir: rd } = await import('node:fs/promises');
  const vols = (await rd(SRC)).filter((n) => n.startsWith('behance-'));
  const jobs = [];
  for (const vol of vols.sort()) {
    const srcDir = path.join(SRC, vol, 'raw');
    const imgs = [];
    for await (const p of walkImages(srcDir)) imgs.push(p);
    if (!imgs.length) continue;
    const projPath = path.join(SRC, vol, 'project.json');
    let slug = vol;
    try {
      const proj = JSON.parse(await (await import('node:fs/promises')).readFile(projPath, 'utf8'));
      if (proj.slug) slug = String(proj.slug).toLowerCase().replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');
    } catch {}
    const out = path.join(OUT, slug);
    jobs.push({ vol, slug, out, imgs });
  }
  let total = 0;
  await pool(jobs, async ({ vol, slug, out, imgs }) => {
    await mkdir(out, { recursive: true });
    await makeCover(imgs, out);
    let i = 0;
    await pool(imgs, async (src) => {
      i += 1;
      const base = path.join(out, String(i).padStart(2, '0'));
      await makeDerived(src, `${base}.webp`);
      await makeDerived(src, `${base}.avif`);
      total += 1;
    }, 4);
    console.log(`${vol} → art/${slug} (${imgs.length} imgs)`);
  }, 4);
  console.log(`\nOK: ${jobs.length} proyectos, ${total} archivos derivados en ${OUT}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
