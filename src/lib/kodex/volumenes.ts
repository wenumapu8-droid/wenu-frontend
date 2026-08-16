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
  | "chapter"
  | "specimen" | "lore" | "habitat" | "libro";

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
export type Marco = "ficcion" | "ciencia" | "documentado" | "estructura" | "esoterico";

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
  /** Manifiesto L8 Assembly OS */
  assembly_os?: Record<string, any>;
};

export type Manifiesto = {
  version?: string;
  estratos: Estrato[];
  volumenes: Volumen[];
};

const DEFAULT_KODEX_ART_CDN_BASE = "https://pub-2b4562c758ed440ab047fe9523a2d99c.r2.dev";
const KODEX_ART_CDN_BASE = (import.meta.env.PUBLIC_KODEX_ART_CDN_BASE ?? DEFAULT_KODEX_ART_CDN_BASE).replace(/\/+$/, "");
const KODEX_ART_THUMB_1400 = new Set(["46f2d4dc-51265"]);

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

/** Lee el manifiesto en tiempo de build. */
export async function leerManifiesto(): Promise<Manifiesto> {
  try {
    const fs = await import("node:fs/promises");
    const url = new URL("../../../public/kodex-content/manifest.json", import.meta.url);
    const m = JSON.parse(await fs.readFile(url, "utf8"));
    return {
      version: m.kodex_manifest_version ?? m.version,
      estratos: Array.isArray(m.estratos) ? m.estratos : [],
      volumenes: Array.isArray(m.volumes) ? m.volumes : Array.isArray(m.volumenes) ? m.volumenes : [],
    };
  } catch {
    return { estratos: [], volumenes: [] };
  }
}

export type VolumenResuelto = Volumen & {
  slug: string;
  numero: string;
  tomo: string;
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
        tomo: resolverTomo(v),
        color: e?.color ?? "#FF3833",
        estratoTitulo: e?.titulo_es ?? v.estrato,
        estratoNumero: e?.n ?? "—",
        hero,
        glifos: GLIFOS[escritura] ?? GLIFOS.greek,
      };
    });
}

function resolverTomo(v: Volumen): string {
  const lore = v.id.match(/^lore-(\d+)/);
  if (lore) return `LIBRO ${lore[1]}`;
  const libro = v.id.match(/^libro-([^-]+)/);
  if (libro) return libro[1].toUpperCase();
  if (v.capitulo && /^[IVX]+$/i.test(v.capitulo)) return `TOMO ${v.capitulo}`;
  if (v.estrato) return v.estrato;
  return "ARCHIVO";
}

export type ArtVariant = "source" | "thumb" | "hero";

/** Convierte paths relativos del manifest a rutas servibles desde public/. */
export function assetUrl(src: string | undefined, variant: ArtVariant = "hero"): string {
  if (!src) return "";
  if (/^(https?:|mailto:|\/)/.test(src)) return src;
  let clean = src.replace(/^\.?\//, "");
  if (clean.startsWith("art/") && clean.endsWith("/cover.webp") && variant !== "source") {
    const slug = clean.match(/^art\/([^/]+)\//)?.[1] ?? "";
    const thumbFile = KODEX_ART_THUMB_1400.has(slug) ? "/cover-1400.webp" : "/cover-400.webp";
    clean = clean.replace(/\/cover\.webp$/, variant === "thumb" ? thumbFile : "/cover-1400.webp");
  }
  if (clean.startsWith("art/")) return `${KODEX_ART_CDN_BASE}/kodex-content/${clean}`;
  return `/kodex-content/${clean}`;
}

/** Texto en el idioma pedido, cayendo al español si no hay traducción. */
export function decir(es: string | undefined, en: string | undefined, lang: "es" | "en"): string {
  if (lang === "en") return en ?? es ?? "";
  return es ?? "";
}

/** "16/10" → número. Si viene mal, cuadrado. */
export function razon(aspecto = "1/1"): number {
  const [a, b] = aspecto.split("/").map(Number);
  return Number.isFinite(a) && Number.isFinite(b) && b > 0 ? a / b : 1;
}
