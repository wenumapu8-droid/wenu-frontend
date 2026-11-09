/**
 * Marca como CAPTURA DE PANTALLA las entradas del archivo cuya portada no es
 * obra sino una foto de pantalla — Pinterest, Instagram, búsquedas de Google,
 * el propio sitio, formularios.
 *
 * NO BORRA NADA. Agrega `descartado: "captura-de-pantalla"` a la ficha. El
 * registro queda entero y la decisión es reversible con una línea.
 *
 * Cómo se detecta: una interfaz tiene muchos cortes horizontales duros -- barras
 * de estado, separadores, filas -- y una fotografía no tiene casi ninguno.
 * Medido sobre la portada de cada volumen, en escala de grises, contando
 * saltos de brillo medio entre filas contiguas mayores a 22.
 * Calibrado y verificado a ojo en hoja de contactos: con 4 cortes o más, todas
 * las revisadas eran captura; con 1 o menos, todas eran obra.
 */
import fs from 'node:fs';
const CORTE = 4;
const esc = JSON.parse(fs.readFileSync('escaneo-capturas.json','utf8'));
const porId = new Map(esc.map(e=>[e.id, e]));
const ruta = './public/kodex-content/manifest.json';
const m = JSON.parse(fs.readFileSync(ruta,'utf8'));

let marcadas=0, yaEstaban=0, sinDato=0;
for (const v of m.volumes) {
  const e = porId.get(v.id);
  if (!e) { sinDato++; continue; }
  if (e.saltos >= CORTE) {
    if (v.descartado) { yaEstaban++; continue; }
    v.descartado = 'captura-de-pantalla';
    v.descartado_evidencia = `${e.saltos} cortes horizontales duros en la portada`;
    marcadas++;
  }
}
fs.writeFileSync(ruta, JSON.stringify(m,null,1));
const lista = m.volumes.filter(v=>v.descartado).map(v=>({id:v.id, titulo:v.titulo_es, ev:v.descartado_evidencia}));
fs.writeFileSync('docs/kodex/CAPTURAS-RETIRADAS-2026-08-21.json', JSON.stringify(lista,null,1));
console.log('marcadas:', marcadas, '| ya estaban:', yaEstaban, '| sin dato de escaneo:', sinDato);
console.log('total en el archivo:', m.volumes.length, '| quedan visibles:', m.volumes.filter(v=>!v.descartado).length);
