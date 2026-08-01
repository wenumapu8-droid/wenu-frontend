/**
 * KODEX-∞ · VOLÚMENES
 *
 * Las siete escenas son el marco. Debajo va la biblioteca: volúmenes que
 * crecen con el tiempo. **Agregar un volumen es agregar una entrada al
 * manifiesto** — no hay que tocar código ni crear una página. Ese es el ∞ del
 * nombre hecho operable: *este archivo se expande, cada acceso una nueva capa*.
 *
 * El manifiesto lo escribe Cowork desde el segundo cerebro; este módulo lo
 * lee. La división es a propósito: **el contenido es de ellos, el renderizador
 * es mío.** Por eso este archivo se adapta al esquema del manifiesto y no al
 * revés — si el esquema cambia, se cambia acá y no en ocho lugares.
 *
 * Dos decisiones que sostienen la biblioteca antes de que exista el arte:
 *
 *  · Un volumen SIN assets es válido. Su héroe pasa a ser el organismo vivo
 *    teñido con el color de su estrato. La biblioteca funciona vacía y se
 *    llena después; lo contrario obligaría a tener toda la obra lista antes
 *    de poder ver una sola página.
 *  · Un volumen incompleto avisa por consola en el build. Desaparecer en
 *    silencio es el fallo que más veces costó horas en este proyecto.
 */

export type TipoVolumen =
  | "gallery" | "artwork" | "finding" | "math" | "repo" | "flyer" | "product" | "nft"
  /** Capítulo del lore del Artefacto: motivo, meditación y mensaje. */
  | "chapter";

/**
 * De qué naturaleza es lo que el volumen afirma. **No es cosmético.**
 *
 * La regla Hidden Sky del proyecto es dura: el universo del Artefacto es
 * FICCIÓN esotérica y jamás se presenta como ciencia ni como salud, y la
 * cosmovisión mapuche documentada va aparte y con fuente. Nunca se funden en
 * un mismo claim.
 *
 * Por eso el marco viaja como dato y se DIBUJA en la página. Un lector que no
 * puede distinguir mito de astrofísica no está leyendo un archivo, está
 * leyendo una confusión — y esa confusión sería responsabilidad del sistema,
 * no suya.
 */
export type Marco = "ficcion" | "ciencia" | "documentado";

/** Escrituras del mundo, una por estrato. Son ACENTO, no traducción. */
export type Escritura =
  | "devanagari" | "arabic" | "kana" | "han" | "hangul" | "cyrillic" | "greek";

export type Estrato = {
  n: string;
  id: string;
  titulo_es: string;
  titulo_en?: string;
  tema?: string;
  theme_en?: string;
  escritura?: Escritura;
  color?: string;
};

export type Asset = {
  src: string;
  /** Proporción REAL, "ancho/alto". Nunca se deforma una pieza. */
  aspecto?: string;
  alt?: string;
};

export type Volumen = {
  id: string;
  tipo: TipoVolumen;
  estrato: string;
  titulo_es: string;
  titulo_en?: string;
  curaduria_es?: string;
  curaduria_en?: string;
  escritura?: Escritura;
  assets?: (Asset | string)[];
  links?: Record<string, string>;
  fecha?: string;
  /** Sólo `math`. */
  formula?: { tex: string; lee_es: string; lee_en?: string };
  /** Sólo `product` / `nft`. */
  oferta?: { precio?: string; edicion?: string; url?: string };
  /** Sólo `chapter`. */
  capitulo?: string;
  meditacion_es?: string;
  meditacion_en?: string;
  mensaje_es?: string;
  mensaje_en?: string;
  /** Naturaleza de lo que se afirma. Se dibuja en la página. */
  marco?: Marco;
  /** Fuente, cuando el marco es ciencia o documentado. */
  fuente?: string;
  /** Descripción libre del contenido, del manifiesto de opencode. */
  tema?: string;
  /** Piezas del volumen que no son imagen (PDF, markdown, kits). */
  documentos?: string[];
};

export type Manifiesto = {
  version?: string;
  estratos: Estrato[];
  volumenes: Volumen[];
};

/**
 * Glifos por escritura.
 *
 * Son textura de "proto-código para una cultura futura", NO traducción ni
 * afirmación de significado. La regla Hidden Sky es explícita: estética puede
 * rimar, afirmación no. Por eso son caracteres sueltos y nunca frases: una
 * frase afirmaría algo; un glifo suelto es una marca de archivo.
 */
export const GLIFOS: Record<Escritura, string> = {
  devanagari: "अ ॐ क्ष ऋ",
  arabic: "ن ه ك و",
  kana: "間 記 憶 響",
  han: "日 玄 門 極",
  hangul: "ㅇ ㅎ ㅁ ㅅ",
  cyrillic: "Ж Ф Э Щ",
  greek: "Ω Σ Φ Δ",
};

/**
 * Lee los manifiestos en tiempo de build.
 *
 * Hay DOS y los escriben manos distintas: el de Cowork, con los estratos y la
 * estructura del segundo cerebro, y el de opencode, con la obra ya tratada.
 * No se pide que se pongan de acuerdo en un esquema — se normalizan acá. Esa
 * es la razón de que este módulo exista: **el contenido es de ellos, la forma
 * de leerlo es mía.**
 *
 * Si mañana aparece un tercero con otra forma, se agrega una función de
 * traducción y nada más se entera.
 */
export async function leerManifiesto(): Promise<Manifiesto> {
  const fs = await import("node:fs/promises");
  const leer = async (r: string) => {
    try { return JSON.parse(await fs.readFile(new URL(r, import.meta.url), "utf8")); }
    catch { return null; }
  };

  const base = await leer("../../../public/kodex-content/manifest.json");
  const oc = await leer("../../../public/kodex-content/opencode/manifest.json");
  const medidas = (await leer("../../../public/kodex-content/opencode/aspectos.json")) ?? {};

  const estratos: Estrato[] = Array.isArray(base?.estratos) ? base.estratos : [];
  const volumenes: Volumen[] = [];

  if (base) {
    const v = Array.isArray(base.volumes) ? base.volumes : base.volumenes;
    if (Array.isArray(v)) volumenes.push(...v);
  }

  if (Array.isArray(oc?.volumenes)) {
    for (const v of oc.volumenes) volumenes.push(deOpencode(v, medidas));
  }

  return { version: base?.kodex_manifest_version ?? base?.version, estratos, volumenes };
}

/**
 * Traduce el esquema de opencode al del sistema.
 *
 * Sus diferencias son reales y hay que resolverlas, no ignorarlas: el título
 * viene en un solo campo con las dos lenguas separadas por barra, los assets
 * son nombres de archivo relativos a la carpeta del volumen, `links` es lista
 * y no objeto, y `escritura` es una descripción libre y no un identificador de
 * alfabeto.
 */
/**
 * De qué estrato es un volumen que no lo declara.
 *
 * El manifiesto de opencode no trae `estrato`, pero su `tema` lo dice casi
 * siempre con todas las letras — "disco, órbita, eclipse, **sol negro**". Sin
 * esta lectura los 37 volúmenes caen todos en el mismo cajón y las siete
 * escenas quedan desconectadas de la obra real, que es justo lo que el motor
 * tiene que resolver.
 *
 * Es un RESPALDO, no una autoridad: si el manifiesto declara `estrato`, ese
 * gana. Corregir una asignación cuesta un campo, no un cambio de código —
 * que es la división de siempre: el contenido es de ellos.
 *
 * El orden importa y es la parte delicada. Un mismo tema roza varias reglas
 * — "sigilos generativos, geometría sagrada, joyería tribal" toca sigilo Y
 * tribal — así que gana la que nombra el asunto principal, no la que aparece
 * antes en la lista por casualidad. Ese volumen es de sigilos; lo tribal es
 * un adjetivo del material.
 */
const POR_TEMA: [RegExp, string][] = [
  [/yayentru/i, "yayentru"],
  [/sol negro|eclipse|órbita|orbita|disco/i, "sol-negro"],

  [/portal|umbral|transmitid|l[aá]mina/i, "portales"],
  [/shader|prototipo|sistema|herramienta|ascii|petscii|tipograf|svg|grammar/i, "laboratorio"],
  [/cosmogon|cosmolog|c[oó]smic|estelar|nibiru|cet[aá]ceo/i, "cosmos"],
  [/lore|esot[eé]rico|artefacto|g[eé]nesis|pacto|templo|adn/i, "artefacto"],
  [/sigilo|geometr[ií]a sagrada|mandala|macro/i, "macro-geometrias"],
  [/tribal|patr[oó]n|textura|repetici[oó]n|respirante/i, "geometrias-respirantes"],
];

function estratoDe(v: any): string {
  if (v.estrato) return v.estrato;
  const texto = `${v.tema ?? ""} ${v.titulo ?? ""}`;
  for (const [re, id] of POR_TEMA) if (re.test(texto)) return id;
  // Sin señal: al archivo vivo, que es donde vive lo que todavía no se
  // clasificó. Aparece igual en ARCHIVE; sólo no se ancla a una escena.
  return "archivo-vivo";
}

function deOpencode(v: any, medidas: Record<string, { aspecto: string }>): Volumen {
  // "EL ARCHIVO / The Archive" → dos títulos. Si no hay barra, el mismo para
  // los dos: inventar una traducción sería peor que repetir.
  const [es, en] = String(v.titulo ?? "").split(/\s*\/\s*/);

  const archivos: string[] = Array.isArray(v.assets) ? v.assets : [];

  // No todo lo que el manifiesto llama "asset" es una lamina. Hay PDFs,
  // markdown, carpetas y `PENDIENTE.md`. Intentar dibujarlos daba el icono de
  // imagen rota en el indice — que se lee como "el archivo esta fallado"
  // cuando en realidad ese volumen es un documento y no una obra.
  //
  // Se separan: las imagenes son laminas, el resto son documentos del volumen.
  // Un volumen sin laminas no esta roto; cae a su organismo, que es el estado
  // valido que la biblioteca ya sabe dibujar.
  const esImagen = (f: string) => /\.(webp|png|jpe?g|gif|avif|svg)$/i.test(f);
  const documentos = archivos.filter((f) => !esImagen(f));

  const assets: Asset[] = archivos.filter(esImagen).map((f) => {
    const rel = `${v.id}/${f}`;
    return {
      src: `/kodex-content/opencode/assets/${rel}`,
      // La proporcion sale de MEDIR el archivo, no de suponerla. Acá hay
      // verticales 9:16 y apaisadas √2: dar por hecho que son cuadradas las
      // aplastaria a todas.
      aspecto: medidas[rel]?.aspecto ?? "1/1",
      alt: `${es ?? v.id} · ${f.replace(/\.[^.]+$/, "")}`,
    };
  });

  const links: Record<string, string> = {};
  if (Array.isArray(v.links)) {
    v.links.forEach((u: string, i: number) => {
      try { links[new URL(u).hostname.replace(/^www\./, "")] = u; }
      catch { links[`enlace ${i + 1}`] = u; }
    });
  }

  return {
    id: v.id,
    tipo: (v.tipo === "book" ? "finding" : v.tipo) ?? "gallery",
    estrato: estratoDe(v),
    titulo_es: (es ?? v.id).trim(),
    titulo_en: (en ?? es ?? v.id).trim(),
    curaduria_es: v.curaduria_es,
    curaduria_en: v.curaduria_en,
    tema: v.tema,
    assets,
    documentos,
    links,
    fecha: v.fecha,
  } as Volumen;
}

export type VolumenResuelto = Volumen & {
  slug: string;
  numero: string;
  color: string;
  estratoTitulo: string;
  estratoNumero: string;
  hero: Asset | null;
  glifos: string;
};

/** Valida, completa y resuelve el estrato de cada volumen. */
export function resolver(m: Manifiesto): VolumenResuelto[] {
  const porId = new Map(m.estratos.map((e) => [e.id, e]));

  return m.volumenes
    .filter((v) => {
      const ok = v?.id && v?.tipo && v?.titulo_es;
      if (!ok) console.warn(`[kodex] volumen descartado — falta id, tipo o titulo_es:`, v?.id ?? "(sin id)");
      return ok;
    })
    // Los volumenes CON obra van primero. El indice abria con dos docenas de
    // organismos generados y la obra real quedaba abajo, fuera de pantalla:
    // el visitante se llevaba la impresion de que el archivo esta vacio. El
    // orden relativo dentro de cada grupo se respeta — es el del manifiesto.
    .sort((a, b) => (b.assets?.length ? 1 : 0) - (a.assets?.length ? 1 : 0))
    .map((v, i) => {
      const e = porId.get(v.estrato);
      const a = v.assets?.[0];
      const hero: Asset | null = !a
        ? null
        : typeof a === "string"
          ? { src: a, aspecto: "1/1" }
          : { aspecto: "1/1", ...a };

      const escritura = (v.escritura ?? e?.escritura ?? "greek") as Escritura;

      return {
        ...v,
        slug: v.id,
        numero: String(i + 1).padStart(3, "0"),
        color: e?.color ?? "#FF3833",
        estratoTitulo: e?.titulo_es ?? v.estrato,
        estratoNumero: e?.n ?? "—",
        hero,
        glifos: GLIFOS[escritura] ?? GLIFOS.greek,
      };
    });
}

/** Texto en el idioma pedido, cayendo al español si no hay traducción. */
export function decir(es: string | undefined, en: string | undefined, lang: "es" | "en"): string {
  if (lang === "en") return en ?? es ?? "";
  return es ?? "";
}

/**
 * Selección DISTRIBUIDA de una serie.
 *
 * Una galería de 52 placas no se vuelca entera: sería amontonar, y la ley del
 * sistema pide dosificar. Pero tampoco se toman las primeras N — las primeras
 * de una serie suelen ser variaciones entre sí, y el visitante se llevaría la
 * impresión de que toda la serie es igual.
 *
 * Se recorre el conjunto a paso fijo, así que la muestra atraviesa la serie de
 * punta a punta y cuenta lo que la serie hace, no cómo empieza.
 *
 * Además se descartan las variantes del mismo original -- `arch-01.dither`,
 * `arch-01.duo-bone`, `arch-01.duo-signal` son la misma placa tratada de tres
 * maneras. Mostrar las tres seguidas se lee como repetición, no como archivo.
 */
export function distribuir(assets: Asset[], cuantos: number): Asset[] {
  if (assets.length <= cuantos) return assets;

  // Una por original: se agrupa por el nombre antes del primer punto.
  const vistos = new Set<string>();
  const unicos = assets.filter((a) => {
    const base = a.src.split("/").pop()?.split(".")[0] ?? a.src;
    if (vistos.has(base)) return false;
    vistos.add(base);
    return true;
  });

  const fuente = unicos.length >= cuantos ? unicos : assets;
  if (fuente.length <= cuantos) return fuente;

  const paso = fuente.length / cuantos;
  return Array.from({ length: cuantos }, (_, i) => fuente[Math.floor(i * paso)]);
}

/** "16/10" → número. Si viene mal, cuadrado. */
export function razon(aspecto = "1/1"): number {
  const [a, b] = aspecto.split("/").map(Number);
  return Number.isFinite(a) && Number.isFinite(b) && b > 0 ? a / b : 1;
}
