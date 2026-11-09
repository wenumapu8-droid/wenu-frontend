/**
 * MEDIR SATURACIÓN — separar la obra digital del creador de las fotos
 *
 * El creador, textual: "son las imágenes digitales de mi obra, digitales en
 * blanco y negro y mirrolab e instashot y cosas así".
 *
 * El filtro anterior sacó las capturas de INTERFAZ contando cortes
 * horizontales duros, y eso funcionó. Pero dejó pasar las FOTOGRAFÍAS: la
 * primera lámina de respiración que se probó mostró una foto de una caja de
 * madera con musgo verde. No es su obra y mostrarla como tal es peor que no
 * mostrar nada.
 *
 * Su obra es blanco y negro o casi. Una foto de musgo no lo es. Eso se mide:
 * saturación media en HSL. Se muestrea la imagen reducida a 32×32 —suficiente
 * para el promedio de color y barato para 435 imágenes— y se guarda el número.
 * Acá NO se decide el umbral: se mide y se reporta la distribución, para que
 * el corte se elija mirando datos y no a ojo.
 */
import sharp from 'sharp';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const j = JSON.parse(readFileSync('public/kodex-content/obras.json', 'utf8'));
const out = [];

for (const o of j.obras) {
  const p = 'public' + (o.chica || o.grande);
  if (!existsSync(p)) continue;
  try {
    const { data, info } = await sharp(p).resize(32, 32, { fit: 'fill' })
      .removeAlpha().raw().toBuffer({ resolveWithObject: true });
    let satTot = 0, lumTot = 0;
    const n = info.width * info.height;
    for (let i = 0; i < data.length; i += 3) {
      const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const l = (mx + mn) / 2;
      /* Saturación HSL: cuánto se aparta del gris. 0 = gris puro. */
      const s = mx === mn ? 0 : (l > 0.5 ? (mx - mn) / (2 - mx - mn) : (mx - mn) / (mx + mn));
      satTot += s; lumTot += l;
    }
    out.push({ id: o.id, sat: +(satTot / n).toFixed(3), lum: +(lumTot / n).toFixed(3) });
  } catch { /* ilegible: se omite y se cuenta abajo */ }
}

out.sort((a, b) => a.sat - b.sat);
writeFileSync('/tmp/saturacion.json', JSON.stringify(out));

const cortes = [0.05, 0.10, 0.15, 0.20, 0.30, 0.50];
console.log(`medidas ${out.length} de ${j.obras.length}`);
console.log('\ndistribución de saturación (0 = gris puro):');
for (const c of cortes) console.log(`  bajo ${c.toFixed(2)}: ${out.filter(x => x.sat < c).length} obras`);
console.log('\nlas 6 más grises:', out.slice(0, 6).map(x => `${x.id.slice(0, 18)}(${x.sat})`).join(' '));
console.log('las 6 más saturadas:', out.slice(-6).map(x => `${x.id.slice(0, 18)}(${x.sat})`).join(' '));
