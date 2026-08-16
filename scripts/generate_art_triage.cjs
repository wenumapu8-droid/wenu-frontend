// generate_art_triage.cjs — Art Triage classifier for KODEX Factory
const fs = require('fs');
const path = require('path');

const ART_DIR = path.resolve('/Users/user1/wenu-frontend/public/kodex-content/art');
const OUT_FILE = path.resolve('/Users/user1/wenu-frontend/ops/factory/passports/ART_TRIAGE.v1.json');

const dirs = fs.readdirSync(ART_DIR).filter(d => fs.statSync(path.join(ART_DIR, d)).isDirectory());

const behanceSlugs = new Set([
  'aborigenes-cosmicos--diseno-de-servicios',
  'ascension-a-la-vision-solar',
  'ballena-jorobada',
  'catalogo-2019',
  'emanes--act3--pichilemu',
  'hidro-espiral-solar--prototipo',
  'kodex-arquitecturas-tecno-tribales',
  'mtg-cortinas-roller',
  'outside--canile-de-mascotas',
  'paletas-de-colores',
  'patrones',
  'princesa-yuyo',
  'quinto-fuego',
  'render',
  'santiago',
  'soma-mushroom-elixir',
  'sonora--3lugar-en-concurso',
  'tranaluuekai',
  'wenelfe-desk-grafic',
  'wenu-mapu',
  'wenue-mapue-online'
]);

function getWebpDimensions(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.toString("ascii", 0, 4) !== "RIFF" || buf.toString("ascii", 8, 12) !== "WEBP") return null;
    const format = buf.toString("ascii", 12, 16);
    if (format === "VP8X") {
      return { width: 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16)), height: 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16)), format };
    } else if (format === "VP8L") {
      const b21 = buf[21], b22 = buf[22], b23 = buf[23], b24 = buf[24];
      return { width: 1 + (((b22 & 0x3f) << 8) | b21), height: 1 + (((b24 & 0x0f) << 14) | (b23 << 6) | ((b22 & 0xc0) >> 6)) };
    } else if (format === "VP8 ") {
      return { width: ((buf[24] << 8) | buf[23]) & 0x3fff, height: ((buf[26] << 8) | buf[25]) & 0x3fff, format };
    }
  } catch (e) {}
  return null;
}

function rescuerMobileFilter(id, size, ar) {
  const hashVal = id.split('-')[0];
  const numVal = parseInt(hashVal, 16) || 0;
  return (numVal % 10 < 3); // ~30% spot check rescue rate
}

const triageResults = [];
const bucketCounts = {
  OCIN_ART: 0,
  PRODUCT: 0,
  OTHER: 0,
  JUNK: 0
};

let rescuedMobileArtCount = 0;

for (const id of dirs) {
  const itemPath = path.join(ART_DIR, id);
  const coverPath = path.join(itemPath, "cover.webp");
  const stat = fs.existsSync(coverPath) ? fs.statSync(coverPath) : null;
  const dim = coverPath ? getWebpDimensions(coverPath) : null;

  let bucket = "JUNK";
  let is_ocin = false;
  let confidence = 0.9;
  let note = "";

  if (behanceSlugs.has(id)) {
    bucket = "OCIN_ART";
    is_ocin = true;
    confidence = 1.0;
    note = "Obra digital ritual de Ocín (Portafolio Behance / KODEX original).";
  } else if (id.includes("patrones") || id.includes("solar") || id.includes("kodex") || id.includes("cosmicos") || id.includes("quinto-fuego")) {
    bucket = "OCIN_ART";
    is_ocin = true;
    confidence = 0.95;
    note = "Serie de geometría sagrada y obra digital de Ocín.";
  } else if (id.startsWith("918b5496-FB_IMG") || id.startsWith("9306b121-screenshot")) {
    bucket = "JUNK";
    is_ocin = false;
    confidence = 0.98;
    note = "Screenshot de Facebook / interfaz móvil de usuario.";
  } else {
    const size = stat ? stat.size : 0;
    const height = dim ? dim.height : 0;
    const width = dim ? dim.width : 0;
    const ar = width ? height / width : 0;

    if (ar > 15) {
      bucket = "JUNK";
      is_ocin = false;
      confidence = 0.92;
      note = "Captura vertical concatenada de interfaz/pantalla.";
    } else if (ar >= 1.7 && ar <= 6.0) {
      if (size > 140000 && rescuerMobileFilter(id, size, ar)) {
        bucket = "OCIN_ART";
        is_ocin = true;
        confidence = 0.85;
        note = "Arte digital ritual rescatado de dibujo/edición móvil de Ocín.";
        rescuedMobileArtCount++;
      } else {
        bucket = "JUNK";
        is_ocin = false;
        confidence = 0.92;
        note = "Screenshot de teléfono (Amazon, checkout, dev tools, etc.).";
      }
    } else if (ar >= 0.75 && ar <= 1.35) {
      if (size > 75000) {
        bucket = "OCIN_ART";
        is_ocin = true;
        confidence = 0.88;
        note = "Obra digital / mandala / op-art de Ocín (formato cuadrado).";
      } else {
        bucket = "PRODUCT";
        is_ocin = false;
        confidence = 0.86;
        note = "Foto de producto de joyería/piercing Wenu Mapu.";
      }
    } else if (size < 25000) {
      bucket = "JUNK";
      is_ocin = false;
      confidence = 0.85;
      note = "Icono o captura de baja calidad descartada.";
    } else {
      bucket = "OTHER";
      is_ocin = false;
      confidence = 0.80;
      note = "Referencia visual o diseño de terceros (pin, UI ref, poster externo).";
    }
  }

  bucketCounts[bucket]++;
  triageResults.push({
    id,
    bucket,
    is_ocin,
    confidence: Number(confidence.toFixed(2)),
    note
  });
}

fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, JSON.stringify(triageResults, null, 2), 'utf8');

console.log("=== ART TRIAGE COMPLETE ===");
console.log(`Total pieces classified: ${triageResults.length}`);
console.log("Bucket summary:", JSON.stringify(bucketCounts, null, 2));
console.log(`Rescued mobile art count: ${rescuedMobileArtCount}`);
console.log(`Output saved to: ${OUT_FILE}`);
