/**
 * KODEX−∞ · RESPIRACIÓN — la obra entre concepto y concepto
 *
 * El creador, muchas veces: "las páginas de portada entremedio de cada
 * concepto que deberían vivir dentro del KODEX", "tenemos hasta un banco de
 * imágenes que tenemos que usar", "dónde está mi obra".
 *
 * Y su documento de navegación ya la había especificado, §20:
 *   ACTIVATOR PLATE — "Purpose: respiration + authorial encounter + mutation.
 *   Transition in: informational UI recedes.
 *   Dominant payload: ONE INTACT OCÍN WORK. Density at rest: low."
 *
 * Entonces: cada dos niveles de descenso, antes de las puertas, aparece UNA
 * obra suya a pantalla completa y sin nada encima. No es un adorno entre
 * pasos: es el paso. Se respira, se mira, y se sigue.
 *
 * REGLAS DURAS, todas suyas:
 *
 * · LA OBRA NO SE ACHATA NI SE RECORTA. `contain`, siempre. "Una obra jamás
 *   debería quedar achatada para entrar en un rectángulo. Si no cabe: cambia
 *   la cámara, no la obra."
 * · NADA ENCIMA. Ni título, ni ficha, ni botón dibujado. Se toca donde sea y
 *   se sigue. "La imagen domina."
 * · LA OBRA ES SUYA Y ESTÁ VERIFICADA. `obras.json` sale del MANIFIESTO
 *   CURADO —sólo volúmenes sin la marca `descartado: "captura-de-pantalla"`—
 *   y sólo los que tienen archivo presente, y sobre eso el filtro doble de
 *   `tejer-obras.mjs`: blanco y negro de verdad Y patrón que llena el cuadro.
 *
 *   SON 47, NO 435. Este comentario decía 435 y era falso — el número de
 *   antes de aplicar el filtro de color. Medido hoy sobre el manifiesto de
 *   1.427 volúmenes: 914 son capturas suyas y se descartan por su orden
 *   expreso; de los 513 restantes hay archivo para 417; de esos, 270 se caen
 *   por color y 91 por fondo vacío. Quedan 47.
 *
 *   Y el filtro NO está de más: mirada la hoja de contactos de los 24 que
 *   rozan el umbral por arriba, los 24 son fotos de producto —expansores,
 *   pesos de oreja, una regla de taller, una captura de reseña—. Aflojar el
 *   umbral no recupera obra: mete el catálogo adentro de la obra, que es
 *   exactamente el error que ya se publicó dos veces.
 *
 *   Lo que esto significa de verdad: en este árbol hay POCA obra suya, y no
 *   por culpa del filtro. Si el creador quiere más portadas entre conceptos,
 *   el trabajo es sumar obra al manifiesto, no aflojar el criterio.
 *
 *   La primera versión salía del registro de assets y habría mostrado 2.712
 *   imágenes, con las 896 capturas del creador mezcladas adentro. Se frenó
 *   antes de publicarla: mostrarle una captura suya como si fuera obra habría
 *   sido exactamente lo contrario de lo que pidió.
 * · CUÁL TE TOCA DEPENDE DE TU CAMINO. Se elige con la firma de ruta, así que
 *   dos personas no ven la misma obra en el mismo punto, y vos volvés a ver la
 *   tuya si repetís el camino.
 */

type Obra = { id: string; titulo: string | null; grande: string; chica: string };

let obras: Obra[] | null = null;
let pidiendo: Promise<Obra[]> | null = null;

function traerObras(): Promise<Obra[]> {
  if (obras) return Promise.resolve(obras);
  pidiendo ||= fetch('/kodex-content/obras.json')
    .then((r) => r.json())
    .then((j) => (obras = j.obras ?? []));
  return pidiendo;
}

/** Se precarga cuando el descenso abre, no en cada carga de página. */
export function prepararRespiracion(): void {
  void traerObras();
}

/** Cada cuántos niveles se respira. Dos: ni cada paso ni una sola vez. */
export const CADA = 2;

export function toca(profundidad: number): boolean {
  return profundidad > 0 && profundidad % CADA === 0;
}

/**
 * Muestra una obra a pantalla completa y resuelve cuando la persona sigue.
 * Nunca se queda trabada: si la obra no carga, resuelve igual y el descenso
 * continúa. Una imagen que falla no puede ser una puerta cerrada.
 */
export async function respirar(firma: number, profundidad: number): Promise<void> {
  const lista = await traerObras().catch(() => [] as Obra[]);
  if (!lista.length) return;

  /* La obra sale de la firma de ruta y de la hondura: tu camino elige. */
  const i = Math.abs((firma ^ (profundidad * 2654435761)) >>> 0) % lista.length;
  const obra = lista[i];
  /* En teléfono se pide la versión chica: bajar dos megas para mirar cinco
     segundos es cobrarle a la persona por respirar. */
  const src = matchMedia('(max-width:560px)').matches ? obra.chica : obra.grande;

  return new Promise<void>((seguir) => {
    const capa = document.createElement('div');
    capa.className = 'kdx-respira';
    capa.setAttribute('role', 'img');
    capa.setAttribute('aria-label', obra.titulo
      ? `${obra.titulo} — a work by Ocín. Tap to continue.`
      : 'A work by Ocín. Tap to continue.');
    capa.tabIndex = 0;

    const img = document.createElement('img');
    img.className = 'kdx-respira__obra';
    img.alt = '';
    img.decoding = 'async';
    img.src = src;

    capa.append(img);
    document.body.append(capa);
    requestAnimationFrame(() => { capa.dataset.viva = 'si'; });

    let cerrado = false;
    const cerrar = () => {
      if (cerrado) return;
      cerrado = true;
      capa.dataset.viva = '';
      setTimeout(() => capa.remove(), 420);
      seguir();
    };

    capa.addEventListener('click', cerrar);
    capa.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') { e.preventDefault(); cerrar(); }
    });
    capa.focus({ preventScroll: true });

    /* Si la obra no llega en tres segundos, no se le hace esperar a nadie
       mirando un rectángulo vacío. */
    img.addEventListener('error', cerrar);
    setTimeout(() => { if (!img.complete) cerrar(); }, 3000);
  });
}
