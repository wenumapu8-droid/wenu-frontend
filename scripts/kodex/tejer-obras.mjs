/**
 * TEJER OBRAS — el banco de obra digital del creador
 *
 * Él: "son las imágenes digitales de mi obra, digitales en blanco y negro y
 * mirrolab e instashot y cosas así".
 *
 * DOS CONDICIONES, y las dos hicieron falta. Cada una sola dejaba pasar cosas
 * que él no quiere ver presentadas como su obra:
 *
 *   1. SATURACIÓN < 0.05 — blanco y negro de verdad.
 *      Sin esto entraba una foto de una caja de madera con musgo verde.
 *
 *   2. LLENA EL CUADRO — densidad de bordes > 0.08 y menos de la mitad del
 *      cuadro en blanco casi puro.
 *      Sin esto entraba una foto de producto: joyería de metal gris sobre
 *      fondo blanco, que es gris y por lo tanto pasaba el filtro anterior.
 *      Su obra es patrón de borde a borde; una foto de producto es fondo
 *      vacío con un objeto chico en el medio.
 *
 * Y sobre las dos, la marca de captura del manifiesto.
 *
 * VERIFICADO MIRANDO, no sólo midiendo: se armó hoja de contactos de las 24
 * primeras y las 24 son geometría suya —grecas, mandalas, caleidoscopios,
 * fractales— sin una sola excepción. Es la tercera vuelta de este filtro;
 * las dos anteriores se publicaron mal y por eso ahora se mira antes.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const SAT_MAX = 0.05;
const BORDE_MIN = 0.08;
const BLANCO_MAX = 0.5;

const man = JSON.parse(readFileSync('public/kodex-content/manifest.json', 'utf8'));
const obras = [];
let porCaptura = 0, porColor = 0, porFondo = 0, sinArchivo = 0;

for (const v of man.volumes ?? []) {
  if (v.descartado) { porCaptura++; continue; }
  const h = String(v.id).replace(/^spec-/, '');
  const g = `/kodex-content/free/wallpapers/${h}-desktop.webp`;
  const c = `/kodex-content/free/wallpapers/${h}-mobile.webp`;
  const hayG = existsSync('public' + g), hayC = existsSync('public' + c);
  if (!hayG && !hayC) { sinArchivo++; continue; }

  try {
    const p = 'public' + (hayC ? c : g);
    const { data, info } = await sharp(p).resize(48, 48, { fit: 'fill' })
      .removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const N = info.width * info.height;
    let sat = 0, blanco = 0, borde = 0, prevL = -1;
    for (let i = 0, k = 0; i < data.length; i += 3, k++) {
      const r = data[i] / 255, gg = data[i + 1] / 255, b = data[i + 2] / 255;
      const mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), l = (mx + mn) / 2;
      sat += mx === mn ? 0 : (l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn));
      const lum = l * 255;
      if (lum > 235) blanco++;
      if (k % info.width !== 0 && prevL >= 0 && Math.abs(lum - prevL) > 50) borde++;
      prevL = lum;
    }
    const S = sat / N, B = blanco / N, E = borde / N;
    if (S >= SAT_MAX) { porColor++; continue; }
    if (E <= BORDE_MIN || B >= BLANCO_MAX) { porFondo++; continue; }
    obras.push({ id: v.id, titulo: v.titulo_es || v.titulo_en || null,
      grande: hayG ? g : c, chica: hayC ? c : g });
  } catch { sinArchivo++; }
}

writeFileSync('public/kodex-content/obras.json', JSON.stringify({
  version: 4,
  nota: 'Obra digital en blanco y negro del creador. Filtro doble verificado a ojo en hoja de contactos: saturación < 0.05 Y llena el cuadro (bordes > 0.08, blanco < 0.5). Descarta capturas, documentos, fotografía a color y fotografía de producto sobre fondo blanco.',
  total: obras.length, obras,
}));

console.log(`obras.json v4 · ${obras.length} obras`);
console.log(`descartadas: ${porCaptura} por captura · ${porColor} por color · ${porFondo} por fondo vacío · ${sinArchivo} sin archivo`);
