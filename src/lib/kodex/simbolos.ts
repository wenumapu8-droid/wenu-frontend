/**
 * KODEX-∞ · SÍMBOLOS
 *
 * El vocabulario de sellos y glifos que compone los márgenes de cada lámina.
 *
 * La regla madre del atlas es dura y es la razón de que este módulo exista:
 * **dos registros marcados distinto y nunca confundidos.** Lo documentado se
 * cita y se respeta; lo simbólico y lo mítico se muestran como tales y jamás
 * como hecho. Un lector que no puede distinguir un teorema de una leyenda no
 * está leyendo un archivo, está leyendo una confusión — y esa confusión sería
 * responsabilidad del sistema, no suya.
 *
 * Por eso el sello y la atribución **viajan pegados al símbolo**, no en una
 * nota al pie que se puede perder al recomponer la página. Si un conjunto se
 * dibuja, se dibuja con su marca.
 *
 * Lo que este módulo NO hace, a propósito:
 *
 *  · No afirma efectos. Ninguna tradición aparece con promesa de salud, de
 *    energía ni de resultado. Se nombra el símbolo y su cultura; ahí termina.
 *  · No inventa grafía para culturas que no la escribieron así. Para el
 *    registro mapuche se usan sus palabras documentadas y su fuente — fabricar
 *    "glifos mapuche" sería decorar con una cultura viva, que es exactamente
 *    lo que el proyecto prohíbe.
 *  · No mezcla. El lore del Artefacto y la cosmovisión documentada nunca
 *    comparten un mismo conjunto.
 */

/**
 * Los dos registros del atlas.
 *
 * `A` — documentado / real: se cita, tiene fuente, es preciso.
 * `B` — no documentado: simbólico (hermético, astrológico) o mito/ficción.
 *
 * Son DOS y no tres a propósito. Lo hermético y lo mítico se diferencian entre
 * sí en la etiqueta `naturaleza`, pero comparten sello porque comparten lo
 * único que importa para el lector: **no son hecho**.
 */
export type Sello = "A" | "B";

export type Conjunto = {
  id: string;
  /** Cómo se llama la tradición, con SU nombre. */
  nombre_es: string;
  nombre_en: string;
  sello: Sello;
  /** Qué es exactamente. Se dibuja junto al sello. */
  naturaleza: string;
  naturaleza_en: string;
  /** De dónde sale. Obligatorio en el sello A. */
  fuente?: string;
  /** Los signos. Vacío cuando la tradición no se escribe con glifos. */
  glifos: string[];
  /** Palabras documentadas, cuando el conjunto se nombra y no se dibuja. */
  terminos?: { voz: string; lee: string }[];
};

/**
 * Los conjuntos disponibles.
 *
 * Cada uno nombra su cultura y su naturaleza. El orden acá no significa nada;
 * la lámina elige por tema.
 */
export const CONJUNTOS: Record<string, Conjunto> = {
  alquimia: {
    id: "alquimia",
    nombre_es: "Alquimia · los cinco principios",
    nombre_en: "Alchemy · the five principles",
    sello: "B",
    naturaleza: "SIMBÓLICO · HERMÉTICO — NO ES CIENCIA",
    naturaleza_en: "SYMBOLIC · HERMETIC — NOT SCIENCE",
    fuente: "tradición hermética europea",
    // Tierra, agua, aire, fuego y quintaesencia. Los cuatro primeros son los
    // signos alquímicos históricos; el quinto es el éter, que en este sistema
    // es el campo del shader.
    glifos: ["🜃", "🜄", "🜁", "🜂", "🜀"],
  },

  magnumOpus: {
    id: "magnumOpus",
    nombre_es: "Magnum Opus · las cuatro fases",
    nombre_en: "Magnum Opus · the four stages",
    sello: "B",
    naturaleza: "SIMBÓLICO · HERMÉTICO — NO ES CIENCIA",
    naturaleza_en: "SYMBOLIC · HERMETIC — NOT SCIENCE",
    fuente: "tradición hermética europea",
    glifos: ["🜔", "🜍", "☿", "🜚"],
    terminos: [
      { voz: "NIGREDO", lee: "el negro · sol negro" },
      { voz: "ALBEDO", lee: "el blanco" },
      { voz: "CITRINITAS", lee: "el amarillo" },
      { voz: "RUBEDO", lee: "el rojo" },
    ],
  },

  zodiaco: {
    id: "zodiaco",
    nombre_es: "Zodíaco · doce signos",
    nombre_en: "Zodiac · twelve signs",
    sello: "B",
    // La distinción exacta del atlas: la astronomía es real, la lectura
    // astrológica es simbólica. Se dice acá para que no haya que suponerlo.
    naturaleza: "SIMBÓLICO — LAS POSICIONES SON ASTRONOMÍA; LA LECTURA NO",
    naturaleza_en: "SYMBOLIC — POSITIONS ARE ASTRONOMY; THE READING IS NOT",
    glifos: ["♈", "♉", "♊", "♋", "♌", "♍", "♎", "♏", "♐", "♑", "♒", "♓"],
  },

  planetas: {
    id: "planetas",
    nombre_es: "Cuerpos del sistema solar",
    nombre_en: "Solar system bodies",
    sello: "A",
    naturaleza: "ASTRONOMÍA DOCUMENTADA",
    naturaleza_en: "DOCUMENTED ASTRONOMY",
    fuente: "notación astronómica estándar (UAI)",
    glifos: ["☉", "☽", "☿", "♀", "♁", "♂", "♃", "♄", "♅", "♆"],
  },

  hexagramas: {
    id: "hexagramas",
    nombre_es: "I Ching · hexagramas",
    nombre_en: "I Ching · hexagrams",
    sello: "A",
    naturaleza: "TEXTO CLÁSICO CHINO · DOCUMENTADO",
    naturaleza_en: "CLASSICAL CHINESE TEXT · DOCUMENTED",
    fuente: "Yijing (易經), tradición china",
    glifos: ["䷀", "䷁", "䷂", "䷃", "䷄", "䷅", "䷆", "䷇"],
  },

  sanscrito: {
    id: "sanscrito",
    nombre_es: "Sánscrito · sílabas semilla",
    nombre_en: "Sanskrit · seed syllables",
    sello: "A",
    naturaleza: "TRADICIÓN HINDÚ · DOCUMENTADA",
    naturaleza_en: "HINDU TRADITION · DOCUMENTED",
    fuente: "escritura devanágari",
    // Se muestran como escritura y como símbolo de su tradición. NO se les
    // atribuye efecto de ningún tipo: eso sería un claim, y está prohibido.
    glifos: ["ॐ", "लं", "वं", "रं", "यं", "हं"],
  },

  sefirot: {
    id: "sefirot",
    nombre_es: "Kabbalah · las diez sefirot",
    nombre_en: "Kabbalah · the ten sefirot",
    sello: "A",
    naturaleza: "TRADICIÓN JUDÍA · DOCUMENTADA",
    naturaleza_en: "JEWISH TRADITION · DOCUMENTED",
    fuente: "Árbol de la Vida sefirótico",
    glifos: [],
    terminos: [
      { voz: "כתר", lee: "KETER · corona" },
      { voz: "חכמה", lee: "JOJMÁ · sabiduría" },
      { voz: "בינה", lee: "BINÁ · entendimiento" },
      { voz: "תפארת", lee: "TIFÉRET · belleza" },
      { voz: "מלכות", lee: "MALJUT · reino" },
    ],
  },

  geometria: {
    id: "geometria",
    nombre_es: "Constantes y razones",
    nombre_en: "Constants and ratios",
    sello: "A",
    naturaleza: "MATEMÁTICA DOCUMENTADA",
    naturaleza_en: "DOCUMENTED MATHEMATICS",
    fuente: "Euclides · Fibonacci · Euler",
    glifos: ["φ", "π", "√2", "∑", "∞", "Δ", "θ", "e"],
    terminos: [
      { voz: "φ = 1,6180339…", lee: "razón áurea" },
      { voz: "e^{iπ} + 1 = 0", lee: "identidad de Euler" },
      { voz: "a² + b² = c²", lee: "Pitágoras" },
    ],
  },

  mapuche: {
    id: "mapuche",
    nombre_es: "Wenu Mapu · cielo mapuche",
    nombre_en: "Wenu Mapu · Mapuche sky",
    sello: "A",
    naturaleza: "COSMOVISIÓN MAPUCHE · DOCUMENTADA — APARTE DE TODA FICCIÓN",
    naturaleza_en: "MAPUCHE COSMOVISION · DOCUMENTED — SEPARATE FROM ALL FICTION",
    fuente: "mapudungun; astronomía documentada",
    // Sin glifos A PROPÓSITO. El mapudungun no se escribió con un silabario
    // propio, y fabricar signos "de aspecto mapuche" sería usar una cultura
    // viva de decoración. Se nombran sus palabras, que es lo que existe.
    glifos: [],
    terminos: [
      { voz: "WENU MAPU", lee: "la tierra de arriba" },
      { voz: "WENU LEUFÜ", lee: "el río del cielo · Vía Láctea" },
      { voz: "GAU", lee: "las Pléyades" },
      { voz: "WÜNELFE", lee: "el lucero del alba" },
    ],
  },

  artefacto: {
    id: "artefacto",
    nombre_es: "Codex Estelar · lore del Artefacto",
    nombre_en: "Stellar Codex · Artifact lore",
    sello: "B",
    // La marca más explícita del sistema. Este conjunto es invención y tiene
    // que leerse como invención incluso de reojo.
    naturaleza: "FICCIÓN · NARRATIVA DE KODEX — NO ES HISTORIA NI CIENCIA",
    naturaleza_en: "FICTION · KODEX NARRATIVE — NOT HISTORY OR SCIENCE",
    glifos: ["◈", "⟁", "◉", "⌬", "⟠", "⧉"],
  },
};

/**
 * Qué conjunto le toca a un volumen.
 *
 * Se lee del tema, igual que el estrato. Es una asignación de curaduría y por
 * eso conservadora: ante la duda cae a las constantes matemáticas, que son el
 * conjunto más neutro del atlas. Adjudicar una tradición viva por una palabra
 * suelta sería peor que no adjudicar ninguna.
 */
const POR_TEMA: [RegExp, string][] = [
  [/mapuche|wenu|yayentru|mapudungun/i, "mapuche"],
  [/lore|artefacto|esot[eé]rico|nibiru|atlantis|lemuria|estelar|g[eé]nesis/i, "artefacto"],
  [/sol negro|nigredo|eclipse|alquim|magnum/i, "magnumOpus"],
  [/elemento|[eé]ter|herm[eé]tic|esmeralda/i, "alquimia"],
  [/zodiac|astrolog|carta natal|signo/i, "zodiaco"],
  [/constelaci|pl[eé]yade|ori[oó]n|astronom|c[oó]smic|planeta|[oó]rbita/i, "planetas"],
  [/i ching|yijing|hexagrama|tao/i, "hexagramas"],
  [/chakra|kundalini|s[aá]nscrito|mantra|hind[uú]|budis|zen/i, "sanscrito"],
  [/kabbal|c[aá]bala|sefirot|[aá]rbol de la vida/i, "sefirot"],
];

export function conjuntoDe(tema: string | undefined, estrato: string | undefined): Conjunto {
  const texto = `${tema ?? ""} ${estrato ?? ""}`;
  for (const [re, id] of POR_TEMA) if (re.test(texto)) return CONJUNTOS[id];
  return CONJUNTOS.geometria;
}

/**
 * Las horas espejo del reloj real.
 *
 * El atlas las pide en vivo: 11:11, 4:44, 3:33, 22:22. Son una convención de
 * la cultura contemporánea — el sistema las **celebra**, no las explica ni les
 * atribuye poder. Por eso lo que se dibuja es "hora espejo", un hecho sobre el
 * reloj, y nada más.
 */
export function horaEspejo(h: number, m: number): string | null {
  const hh = String(h).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  // Espejo: los dos dígitos de la hora repetidos en los minutos (11:11).
  if (hh === mm) return `${hh}:${mm}`;
  // Triple: minutos de dígito repetido sobre hora de un dígito (3:33, 4:44).
  if (mm[0] === mm[1] && String(h) === mm[0]) return `${h}:${mm}`;
  return null;
}
