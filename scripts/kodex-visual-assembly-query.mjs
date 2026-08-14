import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../docs/kodex/visual-assembly');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const index = read('scene-packs/INDEX.json');
const recipes = read('layout_recipes.json');
const registry = read('visual_component_registry.json');
const sourceSnapshot = read('source-snapshots/ocin-a-candidates-2026-08-14.json');
const specimenExample = read('examples/specimen-viewport.ocn-cir-001.internal.json');
const packs = new Map(index.packs.map((entry) => {
  const pack = read(path.join('scene-packs', entry.file));
  return [pack.visual_mode, pack];
}));

const [command = 'summary', rawArg = ''] = process.argv.slice(2);
const output = (value) => process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
const fail = (message) => { console.error(message); process.exit(1); };

const normalizeScene = (value) => {
  const upper = value.trim().toUpperCase();
  if (packs.has(upper)) return upper;
  for (const key of packs.keys()) {
    if (key.endsWith(`_${upper}`)) return key;
  }
  return null;
};

const findComponent = (idOrSlug) => registry.components.find((entry) => entry.id === idOrSlug || entry.slug === idOrSlug);
const findRecipe = (idOrName) => {
  const query = idOrName.trim().toUpperCase();
  return recipes.find((entry) => entry.id === query || entry.name.toUpperCase() === query);
};
const findSource = (idOrTitle) => {
  const query = idOrTitle.trim().toUpperCase();
  return sourceSnapshot.works.find((entry) => entry.id.toUpperCase() === query || entry.title.toUpperCase() === query);
};

if (command === 'summary') {
  output({
    schema: index.schema,
    topologyAuthority: index.topology_authority,
    registryStatus: registry.status,
    componentCount: registry.component_count,
    sourceSnapshot: {
      date: sourceSnapshot.snapshot_date,
      registry: sourceSnapshot.source_registry.title,
      aCandidateCount: sourceSnapshot.works.length,
      isLiveRegistry: sourceSnapshot.snapshot_policy.is_live_registry,
    },
    specimenViewport: {
      contract: 'kdx.visual-specimen-viewport.v0.1',
      runtimeStatus: 'NOT_IMPLEMENTED_BY_THIS_PR',
      exampleSource: specimenExample.source_resolution.id,
      executionScope: specimenExample.execution_scope,
    },
    recipes: recipes.map(({ id, name }) => ({ id, name })),
    visualModes: [...packs.keys()],
    note: 'Query output is assembly metadata. Source snapshot is dated evidence and cannot grant new rights or replace a fresh authoritative-registry check.',
  });
} else if (command === 'scene') {
  const key = normalizeScene(rawArg);
  if (!key) fail(`Unknown visual mode: ${rawArg}`);
  output(packs.get(key));
} else if (command === 'brief') {
  const key = normalizeScene(rawArg);
  if (!key) fail(`Unknown visual mode: ${rawArg}`);
  const pack = packs.get(key);
  const primary = findRecipe(pack.recipe_primary);
  const secondary = findRecipe(pack.recipe_secondary);
  const components = pack.component_shortlist.map((entry) => {
    const registered = findComponent(entry.stable_id) || findComponent(entry.slug);
    return {
      stable_id: entry.stable_id,
      slug: entry.slug,
      family: registered?.family ?? entry.family ?? 'unknown',
      production_gate: entry.production_gate,
      registry_status: registry.status,
    };
  });
  const sourceEvidence = pack.ocin_candidates.map((candidate) => {
    const snapshot = findSource(candidate.ocin_id);
    return {
      ...candidate,
      snapshot_evidence: snapshot ? {
        snapshot_date: sourceSnapshot.snapshot_date,
        publication_status: snapshot.publication_status,
        rights_status: snapshot.rights_status,
        provenance_status: snapshot.provenance_status,
        public_export_allowed: snapshot.public_export_allowed,
        allowed_transformations: snapshot.allowed_transformations,
      } : null,
    };
  });
  output({
    schema: 'kdx.visual-agent-brief.v0.1',
    visual_mode: pack.visual_mode,
    topology_authority: false,
    purpose: pack.purpose,
    composition: {
      primary_recipe: primary,
      secondary_recipe: secondary,
      color_mode: pack.color_mode,
      density: pack.density,
      hero_share: pack.hero_share,
      motion: pack.motion,
      avoid: pack.avoid,
    },
    hero_candidates: sourceEvidence,
    governed_components: components,
    hard_rules: pack.hard_rules,
    required_agent_sequence: [
      'Resolve hero-media provenance/rights from the canonical source registry; snapshot evidence is advisory and dated.',
      'Choose one primary recipe; do not blend recipes by default.',
      'Use only governed component IDs/slugs returned by this brief.',
      'Keep Ocín master pixels immutable unless the resolved source explicitly grants transformations.',
      'Compose with normalized coordinates and emit Assembly Candidate JSON.',
      'Provide a separately recomposed mobile candidate; do not merely scale desktop coordinates.',
      'Provide reduced-motion behavior before visual promotion.',
      'Submit contract/build/device evidence before Frontier Visual Gate and creator acceptance.',
    ],
    output_contract: 'docs/kodex/visual-assembly/assembly_candidate.schema.json',
    source_resolution_contract: 'docs/kodex/visual-assembly/hero_media_resolution.schema.json',
    specimen_viewport_contract: 'docs/kodex/visual-assembly/visual_specimen_viewport.schema.json',
    warning: 'This brief constrains assembly. It does not grant source rights, canonical status, runtime implementation, merge approval or deployment approval.',
  });
} else if (command === 'source') {
  const source = findSource(rawArg);
  if (!source) fail(`Unknown source in 2026-08-14 A-candidate snapshot: ${rawArg}`);
  output({
    ...source,
    snapshot: {
      schema: sourceSnapshot.schema,
      date: sourceSnapshot.snapshot_date,
      source_registry: sourceSnapshot.source_registry,
      is_live_registry: false,
      must_recheck_before_public_export: true,
    },
    warning: 'This is a dated registry snapshot. It can confirm what the active registry said on the snapshot date but cannot grant later rights or transformations.',
  });
} else if (command === 'specimen') {
  const sourceId = rawArg.trim();
  if (sourceId && sourceId.toUpperCase() !== specimenExample.source_resolution.id.toUpperCase()) {
    fail(`No governed specimen example for source: ${rawArg}`);
  }
  output({
    ...specimenExample,
    contract_path: 'docs/kodex/visual-assembly/visual_specimen_viewport.schema.json',
    architecture_doc: 'docs/kodex/visual-assembly/VISUAL_SPECIMEN_VIEWPORT.md',
    warning: 'This is an internal-only contract example, not a runtime implementation or public-export authorization.',
  });
} else if (command === 'component') {
  const query = rawArg.trim();
  const component = findComponent(query);
  if (!component) fail(`Unknown visual component: ${rawArg}`);
  output({ ...component, shared_policy: registry.shared_policy, registry_status: registry.status });
} else if (command === 'recipe') {
  const recipe = findRecipe(rawArg);
  if (!recipe) fail(`Unknown recipe: ${rawArg}`);
  output(recipe);
} else {
  fail(`Unknown command: ${command}. Use summary | scene <MODE> | brief <MODE> | source <OCN-ID|title> | specimen [OCN-ID] | component <ID|slug> | recipe <ID|name>`);
}
