import fs from 'node:fs';

const target = new URL('../src/pages/kodex/folio/[folio].astro', import.meta.url);
let source = fs.readFileSync(target, 'utf8');

function replaceExact(label, before, after) {
  const count = source.split(before).length - 1;
  if (count !== 1) {
    throw new Error(`[KOD-76] ${label}: expected exactly 1 source match, found ${count}. Refuse to patch.`);
  }
  source = source.replace(before, after);
}

replaceExact(
  'scene-local CSS import',
  "import '../../../styles/kodex.css';",
  "import '../../../styles/kodex.css';\nimport '../../../styles/kodex-machine-assembly.css';",
);

replaceExact(
  'MACHINE scene metadata method',
  "'METHOD · MIRROR/DITHER/FLOW'",
  "'METHOD · ASSEMBLY/TRACE/CELL'",
);

replaceExact(
  'MACHINE readout method',
  '<div><dt>METHOD</dt><dd data-machine-method>MIRROR / DITHER / FLOW</dd></div>',
  '<div><dt>METHOD</dt><dd data-machine-method>ASSEMBLY / TRACE / CELL</dd></div>',
);

replaceExact(
  'MACHINE drawer default output',
  'KDX-GEN-0000 · SEED A90C-73F1 · SOURCE ACHROMA_006 · METHOD MIRROR/DITHER/FLOW · STATUS READY',
  'KDX-GEN-0000 · SEED A90C-73F1 · SOURCE ACHROMA_006 · METHOD ASSEMBLY/TRACE/CELL · STATUS READY',
);

replaceExact(
  'topology import',
  "    import { initKx } from '../../../scripts/kodex-engine.js';\n    initKx();",
  "    import { initKx } from '../../../scripts/kodex-engine.js';\n    import { buildMachineTopology } from '../../../lib/kodex/machine-topology.js';\n    initKx();",
);

const oldMachineRuntime = `    const canvas = document.querySelector('[data-machine-canvas]');
    const ctx = canvas?.getContext?.('2d');
    let gen = 0;
    const drawMachine = (seed = 'A90C-73F1') => {
      if (!ctx || !canvas) return;
      const w = canvas.width, h = canvas.height, cx = w / 2, cy = h / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#080808'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(0,239,255,.55)'; ctx.lineWidth = 1;
      for (let r = 72; r < 310; r += 38) {
        ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.strokeStyle = 'rgba(230,230,230,.72)';
      for (let i = 0; i < 32; i++) {
        const a = i / 32 * Math.PI * 2 + gen * .08;
        const r1 = 68 + (i % 5) * 12;
        const r2 = 292 - (i % 7) * 10;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
        ctx.lineTo(cx + Math.cos(a + Math.sin(i + gen) * .28) * r2, cy + Math.sin(a + Math.cos(i + gen) * .22) * r2);
        ctx.stroke();
      }
      ctx.fillStyle = '#00D8FF'; ctx.fillRect(cx - 5, cy - 5, 10, 10);
      ctx.fillStyle = '#E6E6E6'; ctx.font = '18px monospace'; ctx.fillText(seed, 28, h - 34);
    };
    const nextSeed = () => Array.from({ length: 2 }, () => Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')).join('-');
    document.querySelector('[data-machine-generate]')?.addEventListener('click', () => {
      gen += 1;
      const seed = nextSeed();
      const id = \`KDX-GEN-\${String(1000 + gen).padStart(4, '0')}\`;
      const state = document.querySelector('[data-machine-state]');
      const seedEl = document.querySelector('[data-machine-seed]');
      const output = document.querySelector('[data-machine-output]');
      state?.replaceChildren('GENERATING');
      try { window.kdx && window.kdx('generator_start', { id }); } catch (_) {}
      setTimeout(() => {
        state?.replaceChildren('COMPLETE');
        seedEl?.replaceChildren(seed);
        drawMachine(seed);
        output?.replaceChildren(\`\${id} · SEED \${seed} · SOURCE ACHROMA_006 · METHOD MIRROR/DITHER/FLOW · STATUS COMPLETE\`);
        try { window.kdx && window.kdx('generator_complete', { id, seed }); } catch (_) {}
      }, 620);
    });
    drawMachine();`;

const newMachineRuntime = `    const canvas = document.querySelector('[data-machine-canvas]');
    const ctx = canvas?.getContext?.('2d');
    const machineReduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const machineDuration = 620;
    const machineMethod = 'ASSEMBLY/TRACE/CELL';
    let gen = 0;
    let machineBusy = false;
    let machineRaf = 0;

    const clamp01 = (value) => Math.min(1, Math.max(0, value));

    const drawRoutedPath = (path, fraction) => {
      if (!ctx || !Array.isArray(path) || path.length < 2 || fraction <= 0) return;
      const lengths = [];
      let total = 0;
      for (let i = 1; i < path.length; i += 1) {
        const length = Math.hypot(path[i].x - path[i - 1].x, path[i].y - path[i - 1].y);
        lengths.push(length);
        total += length;
      }
      let remaining = total * clamp01(fraction);
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let i = 1; i < path.length && remaining > 0; i += 1) {
        const start = path[i - 1];
        const end = path[i];
        const segment = lengths[i - 1] || 1;
        if (remaining >= segment) {
          ctx.lineTo(end.x, end.y);
          remaining -= segment;
        } else {
          const t = remaining / segment;
          ctx.lineTo(start.x + (end.x - start.x) * t, start.y + (end.y - start.y) * t);
          remaining = 0;
        }
      }
      ctx.stroke();
    };

    const drawTopologyLayer = (topology, progress = 1, alpha = 1) => {
      if (!ctx || !topology) return;
      ctx.save();
      ctx.globalAlpha = alpha;

      for (const cell of topology.cells) {
        const local = clamp01((progress - cell.reveal * .45) / .55);
        if (local <= 0) continue;
        ctx.globalAlpha = alpha * local * .72;
        ctx.fillStyle = cell.kind === 'processor' ? 'rgba(0,216,255,.12)' : 'rgba(230,230,230,.055)';
        ctx.strokeStyle = cell.kind === 'processor' ? 'rgba(0,216,255,.58)' : 'rgba(230,230,230,.32)';
        ctx.lineWidth = 1;
        ctx.fillRect(cell.x, cell.y, cell.width, cell.height);
        ctx.strokeRect(cell.x + .5, cell.y + .5, Math.max(0, cell.width - 1), Math.max(0, cell.height - 1));
      }

      for (const edge of topology.edges) {
        const local = clamp01((progress - edge.reveal * .62) / .38);
        if (local <= 0) continue;
        ctx.globalAlpha = alpha * (.28 + edge.weight * .72);
        ctx.strokeStyle = edge.kind === 'core-bus'
          ? 'rgba(230,230,230,.9)'
          : edge.kind === 'bridge-diagonal'
            ? 'rgba(255,196,107,.48)'
            : 'rgba(0,216,255,.78)';
        ctx.lineWidth = edge.kind === 'core-bus' ? 2 : 1;
        drawRoutedPath(edge.path, local);
      }

      for (const node of topology.nodes) {
        const local = clamp01((progress - node.reveal * .72) / .28);
        if (local <= 0) continue;
        const size = (node.core ? 12 : node.kind === 'port' ? 8 : 5) * (.55 + local * .45);
        ctx.globalAlpha = alpha * (.45 + node.charge * .55) * local;
        ctx.fillStyle = node.core ? '#E6E6E6' : node.kind === 'port' ? '#FFC46B' : '#00D8FF';
        ctx.fillRect(node.x - size / 2, node.y - size / 2, size, size);
        if (node.core) {
          ctx.strokeStyle = 'rgba(0,216,255,.9)';
          ctx.lineWidth = 1;
          ctx.strokeRect(node.x - size, node.y - size, size * 2, size * 2);
        }
      }

      ctx.restore();
    };

    const drawMachineFrame = (topology, progress = 1, previous = null, label = topology?.seed || '') => {
      if (!ctx || !canvas || !topology) return;
      const w = canvas.width, h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#030607';
      ctx.fillRect(0, 0, w, h);
      if (previous && progress < 1) drawTopologyLayer(previous, 1, (1 - progress) * .34);
      drawTopologyLayer(topology, progress, .98);
      ctx.globalAlpha = 1;
      ctx.fillStyle = 'rgba(230,230,230,.86)';
      ctx.font = '18px monospace';
      ctx.fillText(label, 28, h - 34);
    };

    const nextSeed = () => Array.from({ length: 2 }, () => Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0')).join('-');
    let currentMachineSeed = 'A90C-73F1';
    let currentMachineTopology = canvas
      ? buildMachineTopology(currentMachineSeed, { width: canvas.width, height: canvas.height })
      : null;
    if (currentMachineTopology) drawMachineFrame(currentMachineTopology, 1, null, currentMachineSeed);

    document.querySelector('[data-machine-generate]')?.addEventListener('click', (event) => {
      if (!canvas || !ctx || machineBusy) return;
      machineBusy = true;
      gen += 1;
      const button = event.currentTarget;
      if (button instanceof HTMLButtonElement) button.disabled = true;
      const seed = nextSeed();
      const id = \`KDX-GEN-\${String(1000 + gen).padStart(4, '0')}\`;
      const state = document.querySelector('[data-machine-state]');
      const seedEl = document.querySelector('[data-machine-seed]');
      const methodEl = document.querySelector('[data-machine-method]');
      const output = document.querySelector('[data-machine-output]');
      const previous = currentMachineTopology;
      const next = buildMachineTopology(seed, { width: canvas.width, height: canvas.height });

      state?.replaceChildren('GENERATING');
      seedEl?.replaceChildren(seed);
      methodEl?.replaceChildren('ASSEMBLY / TRACE / CELL');
      try { window.kdx && window.kdx('generator_start', { id }); } catch (_) {}

      const finish = () => {
        cancelAnimationFrame(machineRaf);
        currentMachineSeed = seed;
        currentMachineTopology = next;
        drawMachineFrame(currentMachineTopology, 1, null, currentMachineSeed);
        state?.replaceChildren('COMPLETE');
        output?.replaceChildren(\`\${id} · SEED \${seed} · SOURCE ACHROMA_006 · METHOD \${machineMethod} · STATUS COMPLETE\`);
        try { window.kdx && window.kdx('generator_complete', { id, seed }); } catch (_) {}
        if (button instanceof HTMLButtonElement) button.disabled = false;
        machineBusy = false;
      };

      if (machineReduced) {
        drawMachineFrame(next, 1, null, seed);
        setTimeout(finish, machineDuration);
        return;
      }

      const startedAt = performance.now();
      const animate = (now) => {
        const progress = Math.min(.98, (now - startedAt) / machineDuration);
        drawMachineFrame(next, progress, previous, 'ASSEMBLING');
        if (machineBusy) machineRaf = requestAnimationFrame(animate);
      };
      machineRaf = requestAnimationFrame(animate);
      setTimeout(finish, machineDuration);
    });`;

replaceExact('MACHINE canvas runtime', oldMachineRuntime, newMachineRuntime);

fs.writeFileSync(target, source);
console.log('[KOD-76] Applied guarded MACHINE integration patch to src/pages/kodex/folio/[folio].astro');
console.log('[KOD-76] Next: inspect git diff, run node scripts/kodex-machine-topology-contract.mjs, npm run build, then browser evidence.');
