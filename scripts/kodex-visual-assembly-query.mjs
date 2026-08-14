import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../docs/kodex/visual-assembly');
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));

const index = read('scene-packs/INDEX.json');
const recipes = read('layout_recipes.json');
const registry = read('visual_component_registry.json');
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

if (command === 'summary') {
  output({
    schema: index.schema,
    topologyAuthority: index.topology_authority,
    registryStatus: registry.status,
    componentCount: registry.component_count,
    recipes: recipes.map(({ id, name }) => ({ id, name })),
    visualModes: [...packs.keys()],
    note: 'Query output is assembly metadata, not canonical promotion or source-rights resolution.',
  });
} else if (command === 'scene') {
  const key = normalizeScene(rawArg);
  if (!key) fail(`Unknown visual mode: ${rawArg}`);
  output(packs.get(key));
} else if (command === 'component') {
  const query = rawArg.trim();
  const component = registry.components.find((entry) => entry.id === query || entry.slug === query);
  if (!component) fail(`Unknown visual component: ${rawArg}`);
  output({ ...component, shared_policy: registry.shared_policy, registry_status: registry.status });
} else if (command === 'recipe') {
  const query = rawArg.trim().toUpperCase();
  const recipe = recipes.find((entry) => entry.id === query || entry.name.toUpperCase() === query);
  if (!recipe) fail(`Unknown recipe: ${rawArg}`);
  output(recipe);
} else {
  fail(`Unknown command: ${command}. Use summary | scene <MODE> | component <ID|slug> | recipe <ID|name>`);
}
