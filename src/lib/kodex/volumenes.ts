/**
 * KODEX-∞ · VOLÚMENES
 *
 * Las siete escenas son el marco. Debajo va la biblioteca: un sistema de
 * volúmenes que crece con el tiempo. **Agregar un volumen es agregar una
 * entrada al manifiesto** — no hay que tocar código, ni crear una página, ni
 * pedirle nada a nadie. Ese es el ∞ del nombre hecho operable:
 *
 *     "Este archivo se expande. Cada acceso, una nueva capa."
 *
 * Este módulo es el CONTRATO entre quien escribe el manifiesto y quien lo
 * renderiza. Está pensado para que el manifiesto lo pueda llenar otra persona
 * (u otro agente) sin leer una línea del renderizador.
 *
 * Reglas del contrato:
 *
 *  · Lo único obligatorio es `slug`, `tipo`, `titulo` y `hero`. Todo lo demás
 *    es opcional y la página se adapta: un volumen con poca data se ve
 *    sobrio, no roto.
 *  · El `hero.aspecto` es OBLIGATORIO junto a la imagen y va en la forma real
 *    de la obra. Aplastar una pieza para que entre en un cuadrado es
 *    deformarla, y acá la obra manda.
 *  · El copy va bilingüe. `es` es la voz del autor; `en` es la que viaja.
 *    Si falta `en`, se muestra `es` — nunca se inventa una traducción.
 */

export type TipoVolumen =
  | "gallery"   // conjunto de piezas
  | "artwork"   // una obra, en profundidad
  | "finding"   // un hallazgo: nota de investigación
  | "math"      // una fórmula que se vuelve geometría
  | "repo"      // código publicado
  | "flyer"     // pieza gráfica de evento
  | "product"   // edición a la venta
  | "nft";      // pieza en cadena

export type Bilingue = { es: string; en?: string };

export type Hero = {
  /** Ruta pública de la obra. Entra cruda: el tratamiento lo hace el shader. */
  src: string;
  /** Proporción REAL de la pieza, "ancho/alto". Nunca se deforma. */
  aspecto: string;
  alt?: string;
};

export type Volumen = {
  slug: string;
  tipo: TipoVolumen;
  titulo: Bilingue;
  hero: Hero;

  /** Número de volumen. Si falta, se numera por orden en el manifiesto. */
  numero?: string;
  /** Bajada. Dos o tres líneas, no un párrafo. */
  bajada?: Bilingue;
  /** El cuerpo. Acepta varios párrafos. */
  cuerpo?: Bilingue[];

  /** Pares clave/valor del dossier: método, año, materia, edición. */
  ficha?: { k: string; v: string }[];
  /** Acento en #rrggbb. Si falta, hereda el del estrato. */
  acento?: string;
  /** Alfabeto de glifos que acompaña a este volumen. */
  glifos?: "kodex" | "ascii" | "petscii" | "blocks";
  /** Estrato del sistema al que pertenece (01–06). */
  estrato?: string;
  etiquetas?: string[];

  /** Sólo para `math`: la fórmula y qué geometría genera. */
  formula?: { tex: string; lee: Bilingue };
  /** Sólo para `product` y `nft`. */
  oferta?: { precio?: string; edicion?: string; url?: string };
  /** Sólo para `repo`. */
  repo?: { url: string; lenguaje?: string };
};

export type Manifiesto = {
  version: number;
  volumenes: Volumen[];
};

/**
 * Carga el manifiesto en tiempo de build.
 *
 * Se lee del disco y no por fetch: los volúmenes definen rutas estáticas, y
 * para eso el contenido tiene que existir cuando Astro genera las páginas.
 * Un manifiesto que llega por red daría un sitio que no sabe qué páginas
 * tiene.
 */
export async function leerManifiesto(): Promise<Manifiesto> {
  try {
    const fs = await import("node:fs/promises");
    const url = new URL("../../../public/kodex-content/manifest.json", import.meta.url);
    const crudo = await fs.readFile(url, "utf8");
    const m = JSON.parse(crudo) as Manifiesto;
    return { version: m.version ?? 1, volumenes: Array.isArray(m.volumenes) ? m.volumenes : [] };
  } catch {
    // Sin manifiesto la biblioteca está vacía, y eso es un estado válido: el
    // marco de siete escenas funciona igual. Romper el build porque todavía
    // no hay contenido sería castigar al que llega primero.
    return { version: 1, volumenes: [] };
  }
}

/** Valida y completa. Devuelve sólo lo que se puede renderizar sin romper. */
export function normalizar(m: Manifiesto): Volumen[] {
  return m.volumenes
    .filter((v) => {
      const ok = v?.slug && v?.tipo && v?.titulo?.es && v?.hero?.src && v?.hero?.aspecto;
      if (!ok && v?.slug) {
        // Se avisa en consola de build en vez de descartarlo en silencio: un
        // volumen que no aparece y nadie sabe por qué es peor que un error.
        console.warn(`[kodex] volumen "${v.slug}" incompleto — falta tipo, titulo.es, hero.src o hero.aspecto`);
      }
      return ok;
    })
    .map((v, i) => ({ ...v, numero: v.numero ?? String(i + 1).padStart(3, "0") }));
}

/** Texto en el idioma pedido, cayendo al español si no hay traducción. */
export function decir(t: Bilingue | undefined, lang: "es" | "en"): string {
  if (!t) return "";
  return lang === "en" ? (t.en ?? t.es) : t.es;
}

/** Proporción "16/10" → número. Si viene mal, cuadrado. */
export function razon(aspecto: string): number {
  const [a, b] = aspecto.split("/").map(Number);
  return Number.isFinite(a) && Number.isFinite(b) && b > 0 ? a / b : 1;
}
