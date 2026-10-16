#!/usr/bin/env node
/**
 * Une video + audio y normaliza el loudness para redes.
 *
 *   node scripts/motion/mux.mjs dist-motion/X.mp4 dist-motion/X.wav dist-motion/X-final.mp4
 *
 * Instagram y TikTok normalizan alrededor de -14 LUFS. Entregar más fuerte no
 * suena más fuerte: la plataforma lo baja, y de paso aplasta lo que el limiter
 * ya había aplastado. Entregar justo ahí conserva la dinámica que se diseñó.
 *
 * Dos pasadas de loudnorm: la primera MIDE, la segunda corrige con esas
 * medidas en modo lineal. En una sola pasada loudnorm estima sobre la marcha
 * y en piezas cortas con mucha dinámica (silencio → impacto) se equivoca.
 */
import { spawnSync } from 'node:child_process';

const [video, audio, out] = process.argv.slice(2);
if (!video || !audio || !out) {
  console.error('uso: node scripts/motion/mux.mjs <video.mp4> <audio.wav> <salida.mp4>');
  process.exit(1);
}
const TARGET = { I: -14, TP: -1.5, LRA: 9 };

const run = (args) => {
  const r = spawnSync('ffmpeg', args, { encoding: 'utf8' });
  if (r.status !== 0) { console.error(r.stderr.slice(-2000)); process.exit(1); }
  return r.stderr;
};

// 1 · medir
const log = run(['-hide_banner', '-i', audio, '-af',
  `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}:print_format=json`, '-f', 'null', '-']);
const m = JSON.parse(log.slice(log.lastIndexOf('{'), log.lastIndexOf('}') + 1));

// 2 · corregir con lo medido, y unir
run(['-y', '-loglevel', 'error', '-i', video, '-i', audio,
  '-af', `loudnorm=I=${TARGET.I}:TP=${TARGET.TP}:LRA=${TARGET.LRA}` +
         `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
         `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`,
  '-map', '0:v:0', '-map', '1:a:0',
  '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000',
  '-shortest', '-movflags', '+faststart', out]);

// 3 · verificar lo entregado, no lo pedido
const check = run(['-hide_banner', '-i', out, '-af', 'ebur128=peak=true', '-f', 'null', '-']);
const I = check.match(/I:\s+(-?[\d.]+) LUFS/g)?.pop();
const P = check.match(/Peak:\s+(-?[\d.]+) dBFS/g)?.pop();
console.log(`✓ ${out}`);
console.log(`  medido antes: ${m.input_i} LUFS · después: ${I?.replace(/\s+/g, ' ')} · ${P?.replace(/\s+/g, ' ')}`);
