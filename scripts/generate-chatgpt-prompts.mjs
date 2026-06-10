#!/usr/bin/env node
/**
 * generate-chatgpt-prompts.mjs
 *
 * Para un SKU dado, genera 3 prompts copy-paste-listos para usar en ChatGPT
 * (proyecto Wenu Mapu en Chrome) y obtener:
 *
 *   1. PROMPT-CONTEXT — foto de usabilidad (modelo usando la pieza)
 *   2. PROMPT-PNG-CUTOUT — instrucción para que ChatGPT recorte la pieza con fondo transparente
 *   3. PROMPT-COLLECTION-BANNER — banner editorial para colección/categoría
 *
 * Cada prompt:
 *   - Embebe specs canónicos NocoDB
 *   - Incluye paleta + tipografía + estilo Wenu Mapu
 *   - Da instrucciones técnicas de composición (300+ parámetros consolidados)
 *   - Pide aspect ratio + resolución específica
 *
 * El owner adjunta la foto curada al chat de ChatGPT y pega el prompt.
 * ChatGPT devuelve la imagen, owner la baja a visual-studio/output/<SKU>/
 *
 * Usage:
 *   node scripts/generate-chatgpt-prompts.mjs WM-HAN-001
 *   node scripts/generate-chatgpt-prompts.mjs --all-curated
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execSync } from 'node:child_process';

const FINAL_DIR = path.join(os.homedir(), 'Obsidian/WenuAgent/brand/04-photography/product-macro/final');
const OUT_DIR = path.resolve('visual-studio/output');
const PROMPTS_DIR = path.resolve('visual-studio/prompts');
const NOCO = '/tmp/noco.db';

function nocoLookup(sku) {
  const json = execSync(`sqlite3 -json "${NOCO}" "SELECT * FROM nc_9aor___Piezas WHERE SKU='${sku}'"`).toString();
  return JSON.parse(json || '[]')[0] || null;
}

const BRAND_VOICE = `STYLE PROFILE — WENU MAPU
- Tone: ancestral, ritual, sacred-territory, intentional, cosmic, handcrafted
- Aesthetic: dark-first / midnight-and-fire / Atacama desert palette
- Palette tokens (HEX): Obsidian #080706 · Bone #F2EDE4 · Sand #D6C1A3 · Silver #A8A39A · Bronze #8A6A43 · Ember #C4935A
- Typography: DM Serif Display (headers) · Source Serif Pro (body) · Inter Variable (UI/labels)
- Visual references: Mapuche textile geometry, cardinal-cross symbol, kultrun drum, copihue flower, Vacamuerta meteorite from Atacama
- NEVER: tropical, bright, candy colors, generic boho, mainstream fantasy, AI-shiny plastic faces`;

function escapePrompt(s) {
  return (s || '').replace(/`/g, "'");
}

function buildPrompts(sku) {
  const d = nocoLookup(sku);
  if (!d) throw new Error(`SKU ${sku} not found in NocoDB`);
  const title = d.title || sku;
  const material = d.Material || 'mixed media';
  const tipo = d.Tipo_de_pieza || 'ritual piece';
  const medida = d.Medida_mm ? `${Number(d.Medida_mm).toFixed(0)}mm` : 'unspecified';
  const peso = d.Peso_g ? `${Number(d.Peso_g).toFixed(1)}g` : '';
  const desc = (d.Descripcion_interna || '').slice(0, 400);
  const descRitual = (d.Descripcion_ritual || '').slice(0, 400);
  const photoDir = path.join(FINAL_DIR, sku);
  const photoFile = fs.existsSync(photoDir) ? fs.readdirSync(photoDir).find(f => f.includes('-full.webp') || f.includes('-full.avif')) : null;
  const photoPath = photoFile ? path.join(photoDir, photoFile) : '(no curated photo available)';

  const specsBlock = `PIECE SPEC SHEET (canonical, from NocoDB)
- SKU: ${sku}
- Title: ${title}
- Type: ${tipo}
- Material: ${material}
- Size: ${medida}${peso ? ` · Weight: ${peso}` : ''}
- Price: $${d.Precio_venta_USD || '?'} USD
- Internal description: ${escapePrompt(desc)}
${descRitual ? `- Ritual description: ${escapePrompt(descRitual)}` : ''}`;

  // ─── PROMPT 1: USABILITY / CONTEXT PHOTO ───
  const promptContext = `# ChatGPT prompt — USABILITY / CONTEXT photo for ${sku}

## What I attach to this chat
The product photo I attach is the canonical macro reference. Treat this exact piece as the subject — do NOT redesign or invent variations. The piece must remain recognizably the same in proportions, material, finish, color, and any engraved or sculpted detail. Source file: ${photoFile || '(attached separately)'}

## ${specsBlock}

## What I need you to generate
A single photorealistic image showing this exact piece worn on a human body in context. Editorial fashion / lookbook quality.

## Composition & framing
- Aspect ratio: 4:5 (portrait, 1080×1350 web)
- Crop tight to body part where piece is worn (ear, septum, ring finger, neck — pick the anatomically correct one for "${tipo}")
- One subject, gender-neutral, mid-tone skin (avoid extreme pale or extreme dark), no facial close-up that distracts from the piece
- Subject NOT looking at camera — gaze averted, contemplative
- Hair / clothing: minimal, dark tones only (raw linen, charcoal, black wool)
- Background: soft gradient from Obsidian #080706 (top) to deep Bronze #8A6A43 (bottom edge), out of focus

## Lighting (studio editorial)
- Key light: warm 3200K, 45° camera-left, soft (large diffused source), creating gentle Rembrandt triangle on face
- Fill light: subtle, cool 5500K, opposite side, 25% intensity of key
- Rim light: warm amber, behind subject, low intensity to catch piece edges only
- NO harsh shadows. Skin smooth but textured (pores visible).
- Light should highlight the piece's material qualities (bronze patina, silver oxidation, wood grain, stone translucence — whichever applies to ${material})

## Color science
${BRAND_VOICE}
- Color grade: split-tone — warm shadows (#3A2418 ember), cool highlights (#D6C1A3 sand)
- Saturation: 0.92 (slightly desaturated, ritual mood)
- Contrast: medium-high
- Film emulation: Kodak Portra 400 / Cinestill 800T blend

## Lens / camera
- Camera: medium-format aesthetic (Hasselblad H6D / Phase One)
- Lens: 80mm f/2.8, shallow DOF (background fully out of focus, piece tack-sharp)
- Sensor: full-frame, 16-bit color depth
- Shutter: 1/200, ISO 200

## Post-production
- Skin: keep texture, NO over-smoothing, NO plastic look
- Piece: micro-contrast boost +15, clarity +10 on the piece only
- Subtle film grain pass (Cinestill 800T)
- Vignette: 0.3 stops, soft, top-right anchored
- Add 1-2 dust particles in light beams (atmosphere)

## What to AVOID (strict)
- No watermarks, no text, no logos, no UI elements
- No reinvented or reimagined piece — must match the attached photo exactly
- No bright / candy colors, no fantasy / sci-fi cliché
- No piercing-shop sterile clinical look
- No generic stock-photo model staring at lens
- No additional jewelry that wasn't in the original piece
- No tropical / beach / nature-influencer aesthetic
- AI-tells: no overly smooth skin, no extra fingers, no melting hardware

## Output
PNG, 1080×1350, sRGB, no compression artifacts. Provide one image only.
`;

  // ─── PROMPT 2: PNG CUTOUT ───
  const promptCutout = `# ChatGPT prompt — PNG cutout (transparent background) for ${sku}

## What I attach
The canonical macro photo of ${title} (SKU ${sku}). Source: ${photoFile || '(attached)'}

## What I need
Remove the background completely. Output the piece on a fully transparent background, preserving every detail of:
- Material color, patina, oxidation, polish — exactly as in source
- All engraved / carved / sculpted detail at original resolution
- Cast shadow: keep a SOFT realistic ground contact shadow under the piece (not a hard drop shadow). The shadow should be on a separate alpha gradient so the piece can be placed on any background.

## Quality requirements
- Edges: clean, NO halo, NO white fringing, NO chromatic aberration
- Hair / fine detail: preserve at sub-pixel accuracy if applicable
- Anti-aliasing: smooth, professional retouch level
- Color: do not shift hue or saturation from source

## Output
PNG with alpha channel, same pixel dimensions as input, no metadata, sRGB.
`;

  // ─── PROMPT 3: COLLECTION BANNER ───
  const tipoLower = (tipo || '').toLowerCase();
  const collection = tipoLower.includes('hang') ? 'Hangers / Weights'
    : tipoLower.includes('piercing') ? 'Piercing'
    : tipoLower.includes('expansion') ? 'Stretching'
    : tipoLower.includes('ring') ? 'Ritual Rings'
    : 'Wenu Collection';

  const promptBanner = `# ChatGPT prompt — Collection banner with ${sku}

## What I attach
The cutout PNG of ${title} (transparent background, generated in previous prompt).

## ${specsBlock}

## What I need to generate
A horizontal banner for the "${collection}" collection landing page.

## Composition
- Aspect ratio: 21:9 (cinematic, 2400×1029 web)
- The cutout piece occupies the left third, large enough to read material detail
- Right two-thirds: atmospheric background only (no text, no other elements)
- Vertical center alignment of the piece
- Subtle floor reflection of the piece (depth cue)

## Background atmosphere (NOT photographic, NOT a model — pure atmospheric texture)
- Layered gradient: Obsidian #080706 → Bronze #8A6A43 → small ember glow ahead
- Texture layer: very subtle Atacama Desert sand grain at 8% opacity
- Optional cosmic dust particles in mid-ground (very few, ritual-feeling)
- Far background: hints of mapuche textile geometric pattern at 5% opacity (cardinal cross + stepped triangles), barely visible

## Lighting on the piece
- Single warm key light from upper-right (creates dramatic side-light on the cutout piece)
- Rim of ember (#C4935A) on the trailing edge of the piece
- Floor where piece sits is subtly lit, fading to obsidian at edges

## Color & mood
${BRAND_VOICE}
- Mood: ritual, sacred, archaic, cosmic — NOT product-on-white commercial
- This banner should evoke "ancestral altar at dusk"

## Strict prohibitions
- No text overlay (will be added separately by web)
- No model / human / body parts
- No tropical / fantasy / sci-fi / boho elements
- No multiple competing focal points — the piece is the only subject
- No generic e-commerce gradient backgrounds

## Output
PNG, 2400×1029, sRGB, no metadata.
`;

  return { promptContext, promptCutout, promptBanner, photoPath };
}

const skus = process.argv.slice(2);
if (skus.includes('--all-curated')) {
  skus.splice(0, skus.length, ...fs.readdirSync(FINAL_DIR).filter(d => d.startsWith('WM-') && fs.statSync(path.join(FINAL_DIR, d)).isDirectory()));
}
if (!skus.length) {
  console.error('Usage: node generate-chatgpt-prompts.mjs <SKU> [SKU...] | --all-curated');
  process.exit(1);
}

for (const sku of skus) {
  try {
    const { promptContext, promptCutout, promptBanner, photoPath } = buildPrompts(sku);
    const dir = path.join(OUT_DIR, sku);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${sku.toLowerCase()}-prompt-context.md`), promptContext);
    fs.writeFileSync(path.join(dir, `${sku.toLowerCase()}-prompt-cutout.md`), promptCutout);
    fs.writeFileSync(path.join(dir, `${sku.toLowerCase()}-prompt-banner.md`), promptBanner);
    console.log(`✓ ${sku} → 3 prompts in ${dir}`);
    console.log(`  reference photo: ${photoPath}`);
  } catch (e) {
    console.error(`✗ ${sku}: ${e.message}`);
  }
}
