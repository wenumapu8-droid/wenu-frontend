const UINT32_MAX = 0x100000000;

/**
 * Stable 32-bit FNV-1a hash for visitor-visible MACHINE seed strings.
 * This is a deterministic rendering input only; it is not a cryptographic id.
 */
export function seedToUint32(seed = '') {
  const text = String(seed);
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  hash >>>= 0;
  return hash === 0 ? 0x9e3779b9 : hash;
}

/**
 * Small deterministic local PRNG. The caller owns the seed; no global state,
 * DOM, JourneyState or persistence is introduced here.
 */
export function createSeededRandom(seed) {
  let state = seedToUint32(seed);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / UINT32_MAX;
  };
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

/**
 * Build plain deterministic geometry for the existing MACHINE canvas.
 *
 * The model deliberately avoids radial polar coordinates: KOD-76 exists to
 * replace the repeated concentric-ring/spoke grammar with an assembly field.
 * Rendering, color, animation and interaction remain responsibilities of the
 * existing folio canvas/runtime.
 */
export function buildMachineTopology(seed, options = {}) {
  const width = Math.max(160, Number(options.width) || 720);
  const height = Math.max(160, Number(options.height) || 720);
  const columns = Math.max(4, Math.min(10, Math.round(Number(options.columns) || 7)));
  const rows = Math.max(4, Math.min(10, Math.round(Number(options.rows) || 7)));
  const random = createSeededRandom(`${seed}|${width}x${height}|${columns}x${rows}`);
  const marginX = clamp(width * 0.11, 24, width * 0.22);
  const marginY = clamp(height * 0.11, 24, height * 0.22);
  const cellW = (width - marginX * 2) / (columns - 1);
  const cellH = (height - marginY * 2) / (rows - 1);
  const jitterX = Math.min(cellW * 0.26, width * 0.025);
  const jitterY = Math.min(cellH * 0.26, height * 0.025);

  const nodes = [];
  const byGrid = new Map();

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const edgeDistance = Math.min(column, row, columns - 1 - column, rows - 1 - row);
      const keepProbability = edgeDistance === 0 ? 0.52 : edgeDistance === 1 ? 0.76 : 0.9;
      const isCenter = column === Math.floor(columns / 2) && row === Math.floor(rows / 2);
      if (!isCenter && random() > keepProbability) continue;

      const x = clamp(
        marginX + column * cellW + (random() - 0.5) * jitterX * 2,
        marginX * 0.72,
        width - marginX * 0.72,
      );
      const y = clamp(
        marginY + row * cellH + (random() - 0.5) * jitterY * 2,
        marginY * 0.72,
        height - marginY * 0.72,
      );
      const node = {
        id: `n${row}-${column}`,
        column,
        row,
        x: Number(x.toFixed(3)),
        y: Number(y.toFixed(3)),
        size: Number((2.5 + random() * 5.5).toFixed(3)),
        charge: Number((0.25 + random() * 0.75).toFixed(4)),
        reveal: Number(random().toFixed(4)),
        core: isCenter,
      };
      nodes.push(node);
      byGrid.set(`${row}:${column}`, node);
    }
  }

  const edgeMap = new Set();
  const edges = [];
  const addEdge = (a, b, kind) => {
    if (!a || !b || a.id === b.id) return;
    const key = a.id < b.id ? `${a.id}|${b.id}` : `${b.id}|${a.id}`;
    if (edgeMap.has(key)) return;
    edgeMap.add(key);
    edges.push({
      id: `e${edges.length}`,
      from: a.id,
      to: b.id,
      kind,
      weight: Number((0.35 + random() * 0.65).toFixed(4)),
      reveal: Number(random().toFixed(4)),
    });
  };

  for (const node of nodes) {
    const { row, column } = node;
    addEdge(node, byGrid.get(`${row}:${column + 1}`), 'trace-x');
    addEdge(node, byGrid.get(`${row + 1}:${column}`), 'trace-y');
    if (random() > 0.58) addEdge(node, byGrid.get(`${row + 1}:${column + 1}`), 'bridge-diagonal');
    if (random() > 0.82) addEdge(node, byGrid.get(`${row + 1}:${column - 1}`), 'bridge-diagonal');
  }

  const core = nodes.find((node) => node.core) || nodes[Math.floor(nodes.length / 2)];
  if (core) {
    const candidates = nodes
      .filter((node) => node.id !== core.id)
      .map((node) => ({ node, d: Math.hypot(node.x - core.x, node.y - core.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, Math.min(6, Math.max(3, Math.floor(nodes.length / 8))));
    for (const candidate of candidates) addEdge(core, candidate.node, 'core-bus');
  }

  const cells = [];
  for (let i = 0; i < Math.max(4, Math.floor(nodes.length / 7)); i += 1) {
    const column = Math.floor(random() * Math.max(1, columns - 1));
    const row = Math.floor(random() * Math.max(1, rows - 1));
    const x = marginX + column * cellW + cellW * (0.08 + random() * 0.18);
    const y = marginY + row * cellH + cellH * (0.08 + random() * 0.18);
    cells.push({
      id: `c${i}`,
      x: Number(x.toFixed(3)),
      y: Number(y.toFixed(3)),
      width: Number((cellW * (0.34 + random() * 0.38)).toFixed(3)),
      height: Number((cellH * (0.22 + random() * 0.38)).toFixed(3)),
      reveal: Number(random().toFixed(4)),
    });
  }

  return {
    version: 'machine-topology-v0.1.0',
    seed: String(seed),
    width,
    height,
    columns,
    rows,
    nodes,
    edges,
    cells,
  };
}
