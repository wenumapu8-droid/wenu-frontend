/**
 * TEJER OBRAS — el banco limpio para las portadas entre concepto y concepto
 *
 * El creador: "las páginas de portada entremedio de cada concepto que deberían
 * vivir dentro del KODEX", y después: "no necesito que pongas screenshot, son
 * las imágenes digitales de mi obra".
 *
 * Por eso este índice NO sale del registro de assets, que mezclaba todo, sino
 * del MANIFIESTO ya curado: sólo volúmenes SIN la marca
 * `descartado: "captura-de-pantalla"`. Es la clasificación que ya se hizo y se
 * verificó contando cortes horizontales duros en cada portada; rehacerla a ojo
 * habría sido peor y más lento.
 *
 * Y sólo entran las que tienen ARCHIVO PRESENTE: un índice que promete una
 * imagen que no está es una pantalla negra en mitad del descenso.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const man = JSON.parse(readFileSync('public/kodex-content/manifest.json', 'utf8'));
const vols = man.volumes ?? [];

const obras = [];
let sinArchivo = 0;

for (const v of vols) {
  if (v.descartado) continue;                    // captura: no es obra
  const hash = String(v.id).replace(/^spec-/, '');
  /* La versión de escritorio es la de mayor resolución; la de móvil se deja
     como respaldo para no bajar 2MB en un teléfono. */
  const grande = `/kodex-content/free/wallpapers/${hash}-desktop.webp`;
  const chica = `/kodex-content/free/wallpapers/${hash}-mobile.webp`;
  const hayG = existsSync('public' + grande);
  const hayC = existsSync('public' + chica);
  if (!hayG && !hayC) { sinArchivo++; continue; }
  obras.push({
    id: v.id,
    titulo: v.titulo_es || v.titulo_en || null,
    grande: hayG ? grande : chica,
    chica: hayC ? chica : grande,
  });
}

writeFileSync('public/kodex-content/obras.json', JSON.stringify({
  version: 2,
  nota: 'Obra del creador para las láminas de respiración. Sale del manifiesto CURADO: sólo volúmenes sin la marca de captura de pantalla, y sólo los que tienen archivo presente. Ninguna generada, ninguna capturada.',
  total: obras.length,
  obras,
}));

console.log(`obras.json · ${obras.length} obras limpias · ${sinArchivo} descartadas por falta de archivo · ${(JSON.stringify(obras).length / 1024).toFixed(0)}KB`);
