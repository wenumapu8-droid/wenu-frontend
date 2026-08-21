/**
 * COSECHAR MARCAS — la librería de signos sale de las propias láminas
 *
 * El creador: "hiciste láminas hermosas, usalas como arquitecturas y librería
 * de cositas para concepto".
 *
 * Y `10-ESCONDER-EL-SISTEMA` pide que los botones sean "hotspots, anomalías,
 * símbolos, objetos, grietas, nodos o zonas vivas". El primer intento usó
 * puntos de color genéricos — funcionaban, pero eran de nadie. Los signos que
 * SON de KODEX ya estaban dibujados en las 39 planchas: corchetes de esquina,
 * cruces de registro, rombos, columnas de puntos, hojas.
 *
 * Esto no inventa ninguno: los extrae, los normaliza a una caja común y anota
 * DE QUÉ LÁMINA salió cada uno. Nada se genera; todo tiene procedencia.
 */
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

const DIR = 'src/pages/kodex/lamina';
/* Las dos planchas trazadas del creador no se cosechan: son obra suya y no se
   reutilizan sin él. */
const EXCLUIDAS = new Set(['t01-05-specimen-skull', 't01-07-cosmology-core']);

const marcas = [];
const vistos = new Set();

for (const f of readdirSync(DIR).filter((x) => x.endsWith('.astro'))) {
  const lam = f.replace('.astro', '');
  if (EXCLUIDAS.has(lam)) continue;
  const s = readFileSync(`${DIR}/${f}`, 'utf8');
  for (const m of s.matchAll(/<path[^>]*\bd="([^"]{8,150})"/g)) {
    const d = m[1];
    if (/[{}$]/.test(d)) continue;                       // plantilla, no trazo fijo
    const cmds = (d.match(/[MLHVCSQTAZmlhvcsqtaz]/g) || []).length;
    if (cmds < 2 || cmds > 14) continue;                  // marca, no ilustración

    const nums = (d.match(/-?\d+(?:\.\d+)?/g) || []).map(Number);
    if (!nums.length) continue;
    const min = Math.min(...nums), max = Math.max(...nums);
    const lado = max - min;
    /* Se descartan las que son coordenadas de una plancha entera: una marca
       reutilizable tiene que caber en su propia caja, no depender del lienzo
       de 1254px del que salió. */
    if (lado <= 0 || lado > 140 || Math.abs(min) > 400) continue;

    const forma = d.replace(/-?\d+(?:\.\d+)?/g, '#');
    if (vistos.has(forma)) continue;
    vistos.add(forma);
    marcas.push({ d, lamina: lam, min, lado });
  }
}

const salida = {
  version: 1,
  nota: 'Signos extraídos de las láminas. Ninguno inventado; cada uno declara de qué plancha salió. Las dos planchas trazadas del creador quedan excluidas.',
  total: marcas.length,
  marcas,
};
writeFileSync('public/kodex-content/marcas.json', JSON.stringify(salida));
const porLam = {};
for (const m of marcas) porLam[m.lamina] = (porLam[m.lamina] || 0) + 1;
console.log(`marcas.json · ${marcas.length} signos de ${Object.keys(porLam).length} láminas · ${(JSON.stringify(salida).length / 1024).toFixed(0)}KB`);
console.log('más aportan:', Object.entries(porLam).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => `${k}:${v}`).join(' · '));
