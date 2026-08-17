import fs from 'node:fs';

const target = new URL('../src/pages/kodex/folio/[folio].astro', import.meta.url);
let source = fs.readFileSync(target, 'utf8');

function replaceExact(label, before, after) {
  const count = source.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`[KOD-77] ${label}: expected exactly 1 source match, found ${count}. Refuse to patch.`);
  }
  source = source.replace(before, after);
}

const derivative = new URL('../public/img/kodex/proof/prologue-c0-eye-mask.png', import.meta.url);
if (!fs.existsSync(derivative)) {
  throw new Error('[KOD-77] Missing prepared CRT mask derivative. Run prepare-kod77-prologue-c0.mjs with the verified Drive original first.');
}

replaceExact(
  'scene-local C0 CSS import',
  "import '../../../styles/kodex.css';",
  "import '../../../styles/kodex.css';\nimport '../../../styles/kodex-prologue-c0.css';",
);

replaceExact(
  'PROLOGUE source mapping',
  "    image: '/img/kodex/works/bw-02.jpg',",
  "    image: '/img/kodex/proof/prologue-c0-eye-mask.png',",
);

fs.writeFileSync(target, source);
console.log('[KOD-77] Applied guarded PROLOGUE C0 mask mapping + composition import.');
console.log('[KOD-77] Existing observe CRT authority remains unchanged; no CRT mount is hidden or bypassed.');
console.log('[KOD-77] The technical mask is a provenance-recorded adapter, not a new artwork or attribution claim.');
console.log('[KOD-77] Next: inspect git diff, npm run build, then exact-head AUTHORIAL_STATE/browser evidence.');
