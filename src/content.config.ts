import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const journal = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/journal' }),
  schema: z.object({
    title: z.string(),
    eyebrow: z.string(),
    date: z.coerce.date(),
    ogImage: z.string(),
    excerpt: z.string(),
    related: z.array(z.string()).default([]),
    length_words: z.number().optional(),
    // Series support — e.g. "The Apprentice's Path" diary. Optional, additive.
    series: z.string().optional(),
    page: z.number().optional(),
    draft: z.boolean().optional(),
  }),
});

/**
 * SCENE CONTRACTS · KODEX-∞
 *
 * Congelados 2026-08-29 tras la pasada Hi-Fi. Los siete `.yaml` de
 * `src/content/scenes/` son la ESPECIFICACION AUTORAL de las 7 escenas
 * del corredor (00-06). Antes de esto los contratos vivian solo en
 * `scripts/kodex/contratos-escena.json` con verbo/dialecto/acento; los
 * yaml son mucho mas ricos (Hi-Fi ref, canonical_copy, palette rule,
 * estados visibles, owned/forbidden files, atlas concepts, activator,
 * rights gate, acceptance tests).
 *
 * El schema aca es PERMISIVO a proposito: valida las claves que el
 * runtime necesita para no divergir de la especificacion. Los campos
 * autorales extra (activator, rights_gate, notes) pasan sin validacion
 * porque son documentacion, no runtime.
 *
 * Fuente unica de verdad para `canonical_copy`, `cta`, `visible_states`
 * y `atlas_concepts`. El resto queda como referencia hasta que se cablee.
 */
const scenes = defineCollection({
  loader: glob({ pattern: 'scene.*.yaml', base: './src/content/scenes' }),
  schema: z.object({
    scene_id: z.string().regex(
      /^KDX-0[0-6]-[A-Z]{3}-\d{4}$/,
      'scene_id debe seguir KDX-NN-XXX-YYYY (posicion, tres-letras, ano)',
    ),
    route: z.string().startsWith('/kodex/'),
    position: z.string().regex(/^0[0-6] \/ 06$/, 'position debe ser "NN / 06"'),

    visual_target: z.object({
      file: z.string(),
      folder: z.string(),
      classification: z.string(),
    }).passthrough(),

    canonical_copy: z.object({
      source: z.string(),
      title: z.string(),
      subtitle: z.string().optional(),
    }).passthrough(),

    cta: z.object({
      source: z.string(),
      label: z.string(),
    }).passthrough().optional(),

    palette: z.record(z.string(), z.any()).optional(),
    composition_mode: z.record(z.string(), z.any()).optional(),
    central_organism: z.string().optional(),

    visible_states: z.array(z.string()).min(1),
    runtime_mapping: z.record(z.string(), z.any()).optional(),

    // Cada contrato lista sus reglas como strings ("sostener -> LOCK") o
    // como dicts ("entrada voluntaria: click o toque deliberado"). YAML parsea
    // los que traen `:` como objetos, no strings. Se aceptan ambos.
    interaction: z.array(z.union([
      z.string(),
      z.record(z.string(), z.any()),
    ])).optional(),
    responsive: z.record(z.string(), z.any()).optional(),
    fallback: z.record(z.string(), z.any()).optional(),

    // owned/forbidden pueden ser strings o { shared: string } — passthrough.
    owned_files: z.array(z.any()).optional(),
    forbidden_files: z.array(z.string()).optional(),

    atlas_concepts: z.array(z.string().regex(/^KDX-IMG-\d{3}$/)).optional(),

    // Todo lo autoral pasa sin validar: activator, rights_gate,
    // candidate_artworks, acceptance_tests, notes, allowed_mockTelemetry.
  }).passthrough(),
});

export const collections = { journal, scenes };
