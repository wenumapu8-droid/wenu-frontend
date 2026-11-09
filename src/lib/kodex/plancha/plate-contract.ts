/**
 * KDX_PLATE_CONTRACT · v1
 *
 * PLANCHA = cualquier superficie del KODEX que ocupe una pantalla entera: los
 * seis folios del corredor y las 39 láminas sueltas. Vive en `plancha/` y no
 * en `folio/` justamente por eso -- el agente que lleva las láminas usa este
 * mismo vocabulario, y dos anatomías distintas para el mismo sistema serían
 * dos KODEX otra vez, esta vez a nivel de diseño.
 *
 * Una plancha deja de resolverse a ojo por escena y pasa a declarar su
 * anatomía. Antes de esto cada escena se defendía sola en
 * teléfono: `--descent`, `--machine` y `--archive` tenían cada una su propio
 * grid móvil con `grid-template-areas`, y `--prologue` tenía UNA regla — la
 * opacidad de su imagen. El resultado medido en 390×844: la obra empezaba en
 * y=764 de una pantalla de 844, tapada por el CTA y por la barra inferior.
 * No era un bug de una escena. Era la ausencia de un contrato.
 *
 * Esto NO reemplaza el escenario que ya existe. `kx-os-stage`, `kx-os-drawer`
 * y el cromo compartido siguen siendo los mismos elementos con los mismos
 * nombres: el contrato sólo declara dónde va cada región y con qué medidas.
 * Es una capa de consolidación, no un sistema paralelo — la hoja legacy queda
 * intacta detrás de la compuerta `[data-kdx-plate-contract]`.
 *
 * Identidad canónica: `kdx:<superficie>/<slug>`, acordado con el agente que
 * lleva las láminas para que folios, láminas y los 1.427 nodos del grafo
 * vivan en un solo espacio de nombres desde el día uno.
 */

export const KDX_PLATE_CONTRACT_VERSION = '1.0.0';

/** El punto de quiebre del contrato de teléfono. Alineado con el lector móvil
 *  de las láminas para no tener dos cortes distintos en el mismo sistema. */
export const KDX_PLATE_BREAKPOINT = 560;

/** `kdx:folio/prologue`. La superficie va en el id porque una lámina y un
 *  folio pueden compartir slug y no son la misma cosa. */
export function plateId(
  slug: string,
  superficie: 'folio' | 'lamina' | 'interlude' = 'folio',
): string {
  return `kdx:${superficie}/${slug}`;
}

/**
 * La anatomía base que toda plancha comparte en teléfono. Las medidas salen
 * de 07D. Son rangos, no valores fijos: la escena elige dentro del rango
 * según su densidad, y el contrato garantiza que nunca se salga.
 */
export const KDX_PLATE_CONTRACT = {
  version: KDX_PLATE_CONTRACT_VERSION,
  breakpoint: KDX_PLATE_BREAKPOINT,
  /** Regiones en orden de lectura de arriba a abajo. */
  regions: ['chrome', 'visual', 'copy', 'nav'] as const,
  phone: {
    /** Barra de estado superior. */
    chrome: { min: 44, max: 52, default: 48 },
    /** Barra de navegación inferior — estable, nunca se mueve entre escenas. */
    nav: { min: 52, max: 64, default: 56 },
    /** Alto de la obra como fracción del alto visible. */
    visualRatio: { min: 0.3, max: 0.46, default: 0.4 },
    /** Área táctil mínima. Ningún control por debajo de esto. */
    tapTarget: 44,
    /** Cuerpo de texto mínimo legible en mano. */
    minType: 11,
    inline: 18,
    gap: 14,
  },
} as const;

export type ChromeDensity = 'compact' | 'regular';
export type MetadataMode = 'sheet' | 'inline';
export type ActionMode = 'bottom' | 'inline';
export type TitleScale = 'large' | 'medium' | 'small';
export type RenderQuality = 'constrained' | 'full';
export interface KdxMobileProfile {
  /** Fracción del alto visible que ocupa la obra. */
  visualRatio: number;
  artFit: 'cover' | 'contain';
  /** `object-position`: dónde mira la pieza cuando se recorta. */
  artPosition: string;
  artScale: number;
  titleScale: TitleScale;
  chromeDensity: ChromeDensity;
  /** `sheet` = la metadata secundaria se va al drawer y no pelea por 390px. */
  metadataMode: MetadataMode;
  actionMode: ActionMode;
  renderQuality: RenderQuality;
}

/**
 * Las seis escenas del corredor, calibradas.
 *
 * Folio I corrió primero como prueba acotada y Ocín la aprobó mirándola; recién
 * entonces se extendió al resto. Las planchas sin perfil siguen sin recibir el
 * contrato: la compuerta no se abre sin perfil, y eso sigue siendo cierto para
 * cualquier superficie que se agregue mañana.
 */
export const KDX_MOBILE_PROFILE: Record<string, KdxMobileProfile> = {
  /* `contain` es el DEFECTO de esta casa, y es una decisión, no una omisión.
     `cover` llena la región a costa de recortar, y en el KODEX las obras son
     piezas cerradas -- mandalas, sellos, especímenes -- que se leen enteras o
     no se leen. El primer perfil de PROLOGUE decía `cover` con escala 1,18 y
     dejaba el mandala ovalado; Ocín lo vio de inmediato.
     Cuando una escena tenga una obra que SÍ quiera sangrar -- una textura, un
     campo, una fotografía sin borde -- se le pone `cover` a ella sola con su
     punto focal medido. Eso es lo que este archivo existe para permitir. */

  prologue: {
    visualRatio: 0.42,
    artFit: 'contain',
    artPosition: '50% 50%',
    artScale: 1,
    titleScale: 'large',      // "THE ARCHIVE IS WATCHING." — 24 caracteres
    chromeDensity: 'compact',
    metadataMode: 'sheet',
    actionMode: 'bottom',
    renderQuality: 'constrained',
  },

  descent: {
    /* El panel de estrato trae cuenta, profundidad, título, lectura y botón:
       es la escena con más texto por debajo de la obra, así que la obra cede. */
    visualRatio: 0.34,
    artFit: 'contain',
    artPosition: '50% 50%',
    artScale: 1,
    titleScale: 'small',      // "THE TREE DESCENDS TO HOLD WHAT RISES." — 37
    chromeDensity: 'compact',
    metadataMode: 'sheet',
    actionMode: 'bottom',
    renderQuality: 'constrained',
  },

  archive: {
    /* El dossier del espécimen es una tabla de ocho pares. En teléfono no pelea
       por los 390px: se lee en el cajón, que para eso ya existía. */
    visualRatio: 0.34,
    artFit: 'contain',
    artPosition: '50% 50%',
    artScale: 1,
    titleScale: 'medium',     // "EVERY SIGNAL HAS A GENEALOGY." — 29
    chromeDensity: 'compact',
    metadataMode: 'sheet',
    actionMode: 'bottom',
    renderQuality: 'constrained',
  },

  machine: {
    visualRatio: 0.34,
    artFit: 'contain',
    artPosition: '50% 50%',
    artScale: 1,
    titleScale: 'medium',     // "THE SYSTEM MAKES FROM MEMORY." — 29
    chromeDensity: 'compact',
    metadataMode: 'sheet',
    actionMode: 'bottom',
    renderQuality: 'constrained',
  },

  cosmology: {
    /* La cartografía viva de COSMOLOGY NO es un elemento aparte: es hija de la
       figura de la obra. Se llegó a escribir un campo `visualSource:'scene'`
       para que el mapa "tomara" la región visual, y ocultaba la figura para
       hacerle lugar -- con lo cual ocultaba también el mapa, que iba adentro.
       El mapa quedó en 0x0 y la escena sin nada que mirar.
       No hacía falta ninguna abstracción nueva: hacía falta leer el DOM. */
    visualRatio: 0.36,
    artFit: 'contain',
    artPosition: '50% 50%',
    artScale: 1,
    titleScale: 'medium',     // "NOTHING HERE STANDS ALONE." — 26
    chromeDensity: 'compact',
    metadataMode: 'sheet',
    actionMode: 'bottom',
    renderQuality: 'constrained',
  },

  return: {
    /* RETURN cierra con tres salidas -- tienda, encargo, ecosistema -- y las
       tres tienen que estar a la mano sin scroll. */
    visualRatio: 0.32,
    artFit: 'contain',
    artPosition: '50% 50%',
    artScale: 1,
    titleScale: 'small',      // "THE SIGNAL RETURNS. THE PATTERN REMAINS." — 40
    chromeDensity: 'compact',
    metadataMode: 'sheet',
    actionMode: 'bottom',
    renderQuality: 'constrained',
  },
};

/**
 * NOTA PARA LAS PLANCHAS DE TAMAÑO FÍSICO FIJO (las láminas t01…).
 *
 * Esas planchas declaran un ancho real -- 1254px, 1672px -- y se llevan al
 * viewport con un `transform: scale()`. En ese caso `visualRatio` NO se aplica
 * al viewport sino a la CAJA de la plancha antes de escalar, y `artScale` debe
 * quedar en 1: multiplicar una escala sobre otra escala es cómo se deforma una
 * obra sin darse cuenta. `artFit` sigue valiendo igual, porque describe la
 * relación entre la obra y su región, no entre la región y la pantalla.
 *
 * En resumen: el vocabulario es el mismo, el sistema de referencia no. La
 * plancha fija mide en su propio espacio; el folio mide en el del visitante.
 */
export function perfilMovil(slug: string): KdxMobileProfile | null {
  return KDX_MOBILE_PROFILE[slug] ?? null;
}

/**
 * Traduce el perfil a variables CSS. La hoja no conoce escenas: sólo lee
 * variables, así que agregar una escena al contrato es agregar un perfil acá
 * y no una regla `--nombre-de-escena` más en los 4.877 renglones de kodex.css.
 */
export function plateVars(p: KdxMobileProfile): string {
  const f = KDX_PLATE_CONTRACT.phone;
  const chrome = p.chromeDensity === 'compact' ? f.chrome.min : f.chrome.default;
  const ratio = Math.min(f.visualRatio.max, Math.max(f.visualRatio.min, p.visualRatio));
  const titulo =
    p.titleScale === 'large' ? 'clamp(2.4rem,11.5vw,3.6rem)'
    : p.titleScale === 'medium' ? 'clamp(1.9rem,9vw,2.9rem)'
    : 'clamp(1.5rem,7vw,2.2rem)';
  return [
    `--kdx-plate-chrome:${chrome}px`,
    `--kdx-plate-nav:${f.nav.default}px`,
    `--kdx-plate-visual:${(ratio * 100).toFixed(1)}svh`,
    `--kdx-plate-inline:${f.inline}px`,
    `--kdx-plate-gap:${f.gap}px`,
    `--kdx-plate-tap:${f.tapTarget}px`,
    `--kdx-plate-type-min:${f.minType}px`,
    `--kdx-art-fit:${p.artFit}`,
    `--kdx-art-position:${p.artPosition}`,
    `--kdx-art-scale:${p.artScale}`,
    `--kdx-title-size:${titulo}`,
  ].join(';');
}
