/**
 * KODEX−∞ · EL RECORRIDO — el viaje pasa POR los conceptos, no al lado.
 *
 * POR QUE EXISTE (2026-08-28):
 * Los 36 mundos ya tenian direccion propia, pero el corredor seguia yendo
 * escena -> escena y saltandoselos. El creador lo dijo exacto: "no estan las
 * escenas de concepto entremedio de las escenas". Tenia razon -- estaban al
 * costado, alcanzables desde el atlas, pero fuera del camino.
 *
 * Si las siete escenas son los UMBRALES entre los conceptos, entonces cruzar
 * un umbral tiene que dejarte DENTRO de sus conceptos, y salir de ellos tiene
 * que llevarte al umbral siguiente. Eso es lo que arma este modulo.
 *
 * EL ORDEN:
 *   THRESHOLD -> sus conceptos -> PROLOGUE -> sus conceptos -> DESCENT -> ...
 *   ... -> RETURN -> sus conceptos -> fin
 *
 * Un concepto que pertenece a DOS escenas aparece en la primera que lo
 * reclama. No se duplica: repetirlo haria que el visitante pase dos veces por
 * el mismo mundo y el recorrido dejaria de tener largo conocido.
 */
import { nodosDeEscena, type NodoAtlas } from './atlas';

export const ESCENAS = [
  'THRESHOLD', 'PROLOGUE', 'DESCENT', 'ARCHIVE', 'MACHINE', 'COSMOLOGY', 'RETURN',
] as const;
export type Escena = (typeof ESCENAS)[number];

export const RUTA_ESCENA: Record<Escena, string> = {
  THRESHOLD: '/kodex/',
  PROLOGUE: '/kodex/folio/i/',
  DESCENT: '/kodex/folio/ii/',
  ARCHIVE: '/kodex/folio/iii/',
  MACHINE: '/kodex/folio/iv/',
  COSMOLOGY: '/kodex/folio/v/',
  RETURN: '/kodex/folio/vi/',
};

export interface Parada {
  tipo: 'umbral' | 'mundo';
  url: string;
  titulo: string;
  /** El umbral al que pertenece esta parada. */
  escena: Escena;
  id?: string;
}

/** El camino completo, en orden, de punta a punta. */
export function recorridoCompleto(): Parada[] {
  const paradas: Parada[] = [];
  const yaPuesto = new Set<string>();

  for (const escena of ESCENAS) {
    paradas.push({
      tipo: 'umbral',
      url: RUTA_ESCENA[escena],
      titulo: escena,
      escena,
    });
    for (const n of nodosDeEscena(escena)) {
      if (yaPuesto.has(n.id)) continue;   // un mundo se visita una sola vez
      yaPuesto.add(n.id);
      paradas.push({
        tipo: 'mundo',
        url: `/kodex/concepto/${n.id.toLowerCase()}/`,
        titulo: n.titulo,
        escena,
        id: n.id,
      });
    }
  }
  return paradas;
}

/** Donde esta una parada y que hay antes y despues. */
export function ubicar(url: string) {
  const camino = recorridoCompleto();
  const limpia = url.endsWith('/') ? url : `${url}/`;
  const i = camino.findIndex((p) => p.url === limpia);
  if (i === -1) return null;
  return {
    indice: i,
    total: camino.length,
    aqui: camino[i],
    antes: i > 0 ? camino[i - 1] : null,
    despues: i < camino.length - 1 ? camino[i + 1] : null,
  };
}

/** Los mundos de un umbral, en el orden en que se recorren. */
export function mundosDe(escena: Escena): NodoAtlas[] {
  const camino = recorridoCompleto();
  return camino
    .filter((p) => p.tipo === 'mundo' && p.escena === escena)
    .map((p) => nodosDeEscena(escena).find((n) => n.id === p.id)!)
    .filter(Boolean);
}

/** Cuantas paradas tiene el viaje entero. Para decirlo con fuente en pantalla. */
export function largoDelViaje() {
  const c = recorridoCompleto();
  return {
    total: c.length,
    umbrales: c.filter((p) => p.tipo === 'umbral').length,
    mundos: c.filter((p) => p.tipo === 'mundo').length,
  };
}
