#!/usr/bin/env node
/**
 * Wenu Mapu — motion renderer
 *
 * Renderiza frames deterministas desde una escena HTML/Canvas y los encodea
 * con ffmpeg. Nada de IA generativa: cada frame es una función pura de `t`.
 *
 *   node scripts/motion/render.mjs tune-in
 *   node scripts/motion/render.mjs tune-in --fps 60 --dur 8 --format square
 *   node scripts/motion/render.mjs tune-in --still 2.4     # un solo PNG en t=2.4s
 *
 * Una escena vive en scripts/motion/scenes/<nombre>.html y expone:
 *   window.SCENE       = { duration, fps, width, height }   (defaults)
 *   window.renderFrame = (t) => void                        (t en segundos)
 */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFile, mkdir, stat } from 'node:fs/promises';
import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const OUT_DIR = path.join(ROOT, 'dist-motion');

// Formatos de salida listos para redes.
const FORMATS = {
  reel:   { width: 1080, height: 1920 },  // IG Reels / TikTok / Shorts
  square: { width: 1080, height: 1080 },  // IG feed
  post:   { width: 1080, height: 1350 },  // IG feed vertical 4:5
  wide:   { width: 1920, height: 1080 },  // YouTube / web hero
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
};

function parseArgs(argv) {
  const [scene, ...rest] = argv;
  const flags = {};
  for (let i = 0; i < rest.length; i++) {
    if (!rest[i].startsWith('--')) continue;
    const key = rest[i].slice(2);
    const next = rest[i + 1];
    if (next === undefined || next.startsWith('--')) flags[key] = true;
    else { flags[key] = next; i++; }
  }
  return { scene, flags };
}

// Servidor estático sobre el repo: las escenas cargan @fontsource y /img
// con rutas absolutas, sin pelearse con CORS de file://.
function serveRepo() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const rel = decodeURIComponent(new URL(req.url, 'http://x').pathname);
      const file = path.join(ROOT, rel);
      if (!file.startsWith(ROOT)) { res.writeHead(403).end(); return; }
      try {
        const body = await readFile(file);
        res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
        res.end(body);
      } catch {
        res.writeHead(404).end('not found');
      }
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, port: server.address().port }));
  });
}

const globSync = (base) => readdirSync(base).filter((d) => d.startsWith('chromium')).sort().reverse();

/** Chromium preinstalado en la imagen, si lo hay. undefined = el que trae playwright. */
function findChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH;
  if (!base) return undefined;
  for (const dir of globSync(base)) {
    for (const exe of ['chrome-linux/chrome', 'chrome-linux/headless_shell']) {
      const p = path.join(base, dir, exe);
      if (existsSync(p)) return p;
    }
  }
  return undefined;
}

async function main() {
  const { scene, flags } = parseArgs(process.argv.slice(2));
  if (!scene || scene.startsWith('--')) {
    console.error('uso: node scripts/motion/render.mjs <escena> [--fps N] [--dur S] [--format reel|square|post|wide] [--still T]');
    process.exit(1);
  }

  const sceneRel = `scripts/motion/scenes/${scene}.html`;
  try { await stat(path.join(ROOT, sceneRel)); }
  catch { console.error(`✗ no existe ${sceneRel}`); process.exit(1); }

  const { chromium } = await import('playwright');
  const { server, port } = await serveRepo();
  const browser = await chromium.launch({
    // El contenedor trae Chromium preinstalado con otro build number que el que
    // espera playwright; apuntamos al binario real en vez de bajar otro.
    executablePath: process.env.CHROMIUM_PATH || findChromium(),
    args: ['--font-render-hinting=none', '--disable-lcd-text'],
  });

  try {
    const page = await browser.newPage();
    page.on('console', (m) => { if (m.type() === 'error') console.error('  [scene]', m.text()); });
    page.on('pageerror', (e) => console.error('  [scene]', e.message));

    await page.goto(`http://127.0.0.1:${port}/${sceneRel}`, { waitUntil: 'load' });
    await page.waitForFunction(() => typeof window.renderFrame === 'function', null, { timeout: 15_000 });
    await page.evaluate(() => document.fonts.ready);

    const defaults = await page.evaluate(() => window.SCENE ?? {});
    const fmt = FORMATS[flags.format ?? 'reel'] ?? FORMATS.reel;
    const width  = Number(flags.w   ?? defaults.width    ?? fmt.width);
    const height = Number(flags.h   ?? defaults.height   ?? fmt.height);
    const fps    = Number(flags.fps ?? defaults.fps      ?? 30);
    const dur    = Number(flags.dur ?? defaults.duration ?? 6);

    await page.setViewportSize({ width, height });
    await page.evaluate(([w, h]) => window.resizeScene?.(w, h), [width, height]);

    await mkdir(OUT_DIR, { recursive: true });

    // Un solo frame: contact sheet rápido para decidir dirección visual.
    if (flags.still !== undefined) {
      const t = Number(flags.still === true ? 0 : flags.still);
      await page.evaluate((tt) => window.renderFrame(tt), t);
      const out = path.join(OUT_DIR, `${scene}-t${String(t).replace('.', '_')}.png`);
      await page.screenshot({ path: out, type: 'png' });
      console.log(`✓ ${path.relative(ROOT, out)}  ${width}×${height}  t=${t}s`);
      return;
    }

    const total = Math.round(dur * fps);
    const out = path.join(OUT_DIR, `${scene}.mp4`);
    console.log(`→ ${scene}  ${width}×${height}  ${fps}fps  ${dur}s  (${total} frames)`);

    // PNGs directo al stdin de ffmpeg: sin frames intermedios en disco.
    const ff = spawn('ffmpeg', [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '18',
      '-profile:v', 'high', '-pix_fmt', 'yuv420p',
      '-movflags', '+faststart',
      out,
    ]);
    const ffErr = [];
    ff.stderr.on('data', (d) => ffErr.push(d));
    const done = new Promise((res, rej) => {
      ff.on('close', (code) => code === 0 ? res() : rej(new Error(`ffmpeg ${code}: ${Buffer.concat(ffErr)}`)));
      ff.on('error', rej);
    });

    const t0 = Date.now();
    for (let i = 0; i < total; i++) {
      await page.evaluate((t) => window.renderFrame(t), i / fps);
      const png = await page.screenshot({ type: 'png' });
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
      if (i % 30 === 0 || i === total - 1) {
        process.stdout.write(`\r  frame ${i + 1}/${total}`);
      }
    }
    ff.stdin.end();
    await done;
    process.stdout.write('\n');

    const { size } = await stat(out);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`✓ ${path.relative(ROOT, out)}  ${(size / 1024 / 1024).toFixed(2)} MB  (${secs}s de render)`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
