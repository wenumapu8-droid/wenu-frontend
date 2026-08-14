import { resolveHoloCoreRGXProfile } from './rgx-family.js';

const ellipse = (id, cx, cy, rx, ry, role = 'structure', rotation = 0) => ({ type: 'ellipse', id, cx, cy, rx, ry, role, rotation });
const circle = (id, cx, cy, r, role = 'node') => ({ type: 'circle', id, cx, cy, r, role });
const line = (id, x1, y1, x2, y2, role = 'structure') => ({ type: 'line', id, x1, y1, x2, y2, role });
const polyline = (id, points, role = 'structure') => ({ type: 'polyline', id, points, role });

function orbital(profile) {
  const p = profile.params;
  const out = [line('axis', 50, 5, 50, 98, 'axis')];
  p.rings.forEach(([y, rx, ry, nodes], ringIndex) => {
    out.push(ellipse(`ring-${ringIndex}`, 50, y * 100, rx * 100, ry * 100, ringIndex === p.habitatIndex ? 'primary' : 'ring'));
    out.push(ellipse(`ring-inner-${ringIndex}`, 50, y * 100, rx * 91, ry * 91, 'secondary'));
    for (let i = 0; i < nodes; i += 1) {
      const a = (i / nodes) * Math.PI * 2;
      out.push(circle(`ring-${ringIndex}-node-${i}`, 50 + Math.cos(a) * rx * 100, y * 100 + Math.sin(a) * ry * 100, ringIndex === p.habitatIndex ? 0.62 : 0.46, 'node'));
    }
    if (ringIndex === p.habitatIndex) {
      for (let i = 0; i < p.spokes; i += 1) {
        const a = (i / p.spokes) * Math.PI * 2;
        out.push(line(
          `habitat-spoke-${i}`,
          50 + Math.cos(a) * rx * 18,
          y * 100 + Math.sin(a) * ry * 18,
          50 + Math.cos(a) * rx * 92,
          y * 100 + Math.sin(a) * ry * 92,
          'secondary',
        ));
      }
    }
  });
  [
    [50, 14, 31, 7.5], [46, 14.5, 17, 5], [54, 14.4, 18, 5.5], [42, 15.4, 12, 4], [58, 15.2, 12, 4.2],
  ].forEach(([cx, cy, rx, ry], i) => out.push(ellipse(`cloud-${i}`, cx, cy, rx, ry, 'atmosphere')));
  out.push(ellipse('planet', 50, p.planetY * 100, 53, 13, 'planet'));
  return out;
}

function radialCore(profile) {
  const p = profile.params;
  const out = [];
  out.push(circle('core', 50, 50, p.coreR * 100, 'primary'));
  for (let i = 0; i < p.bands; i += 1) {
    const r = (p.coreR * 1.7 + (p.cageR - p.coreR * 1.7) * (i / Math.max(1, p.bands - 1))) * 100;
    out.push(ellipse(`cage-${i}`, 50, 50, r, r * p.cageAspect, i === p.bands - 1 ? 'primary' : 'ring'));
  }
  for (let i = 0; i < p.spokes; i += 1) {
    const a = (i / p.spokes) * Math.PI * 2;
    out.push(line(`rib-${i}`, 50 + Math.cos(a) * p.coreR * 130, 50 + Math.sin(a) * p.coreR * 130, 50 + Math.cos(a) * p.cageR * 92, 50 + Math.sin(a) * p.cageR * 92, 'secondary'));
  }
  for (let i = 0; i < p.nodes; i += 1) {
    const a = (i / p.nodes) * Math.PI * 2;
    out.push(circle(`node-${i}`, 50 + Math.cos(a) * p.cageR * 100, 50 + Math.sin(a) * p.cageR * p.cageAspect * 100, 0.46, 'node'));
  }
  return out;
}

function portal(profile) {
  const p = profile.params;
  const out = [circle('aperture', 50, 50, p.apertureR * 100, 'primary')];
  for (let i = 1; i <= p.bands; i += 1) {
    const r = p.apertureR + (p.outerR - p.apertureR) * (i / p.bands);
    out.push(circle(`band-${i}`, 50, 50, r * 100, i === p.bands ? 'primary' : 'ring'));
  }
  for (let i = 0; i < p.stabilizers; i += 1) {
    const a = (i / p.stabilizers) * Math.PI * 2;
    const r0 = p.outerR * 0.72 * 100;
    const r1 = p.outerR * 1.05 * 100;
    out.push(line(`stabilizer-${i}`, 50 + Math.cos(a) * r0, 50 + Math.sin(a) * r0, 50 + Math.cos(a) * r1, 50 + Math.sin(a) * r1, 'secondary'));
    out.push(circle(`stabilizer-node-${i}`, 50 + Math.cos(a) * r1, 50 + Math.sin(a) * r1, 0.55, 'node'));
  }
  out.push(line('portal-axis', 50, 12, 50, 88, 'axis'));
  return out;
}

function vortex(profile) {
  const p = profile.params;
  const out = [circle('vortex-core', 50, 50, p.coreR * 100, 'primary')];
  for (let ringIndex = 1; ringIndex <= p.rings; ringIndex += 1) {
    const r = p.coreR + ringIndex * ((p.outerR - p.coreR) / p.rings);
    out.push(circle(`guide-ring-${ringIndex}`, 50, 50, r * 100, 'secondary'));
  }
  for (let arm = 0; arm < p.arms; arm += 1) {
    const pts = [];
    for (let i = 0; i <= 80; i += 1) {
      const t = i / 80;
      const r = p.coreR + (p.outerR - p.coreR) * t;
      const a = arm * (Math.PI * 2 / p.arms) + t * p.turns * Math.PI * 2;
      pts.push([50 + Math.cos(a) * r * 100, 50 + Math.sin(a) * r * 100]);
    }
    out.push(polyline(`spiral-${arm}`, pts, arm === 0 ? 'primary' : 'ring'));
  }
  for (let i = 0; i < p.nodes; i += 1) {
    const t = (i + 1) / (p.nodes + 1);
    const r = p.coreR + (p.outerR - p.coreR) * t;
    const a = t * p.turns * Math.PI * 2 + (i % p.arms) * Math.PI * 2 / p.arms;
    out.push(circle(`packet-${i}`, 50 + Math.cos(a) * r * 100, 50 + Math.sin(a) * r * 100, 0.38, 'node'));
  }
  return out;
}

function helix(profile) {
  const p = profile.params;
  const out = [line('axis', 50, p.y0 * 100, 50, p.y1 * 100, 'axis')];
  const strandA = [];
  const strandB = [];
  for (let i = 0; i <= 120; i += 1) {
    const t = i / 120;
    const y = p.y0 + (p.y1 - p.y0) * t;
    const a = t * p.cycles * Math.PI * 2;
    strandA.push([50 + Math.sin(a) * p.amplitude * 100, y * 100]);
    strandB.push([50 - Math.sin(a) * p.amplitude * 100, y * 100]);
  }
  out.push(polyline('strand-a', strandA, 'primary'), polyline('strand-b', strandB, 'primary'));
  for (let i = 0; i < p.rungCount; i += 1) {
    const t = (i + 0.5) / p.rungCount;
    const y = p.y0 + (p.y1 - p.y0) * t;
    const a = t * p.cycles * Math.PI * 2;
    out.push(line(`rung-${i}`, 50 + Math.sin(a) * p.amplitude * 100, y * 100, 50 - Math.sin(a) * p.amplitude * 100, y * 100, 'secondary'));
  }
  return out;
}

function tree(profile) {
  const p = profile.params;
  const out = [line('trunk', 50, p.trunkBase * 100, 50, p.trunkTop * 100, 'primary')];
  const ys = [0.47, 0.4, 0.33, 0.27];
  const widths = [24, 20, 16, 12];
  ys.slice(0, p.branchLevels).forEach((y, index) => {
    const w = widths[index];
    out.push(line(`branch-l-${index}`, 50, (y + 0.035) * 100, 50 - w, (y - 0.085) * 100, 'ring'));
    out.push(line(`branch-r-${index}`, 50, (y + 0.035) * 100, 50 + w, (y - 0.085) * 100, 'ring'));
    out.push(line(`twig-l-${index}`, 50 - w * 0.55, (y - 0.03) * 100, 50 - w * 1.18, (y - 0.12) * 100, 'secondary'));
    out.push(line(`twig-r-${index}`, 50 + w * 0.55, (y - 0.03) * 100, 50 + w * 1.18, (y - 0.12) * 100, 'secondary'));
  });
  out.push(line('root-l0', 50, p.trunkBase * 100, 24, (p.trunkBase + p.rootDepth) * 100, 'ring'));
  out.push(line('root-r0', 50, p.trunkBase * 100, 76, (p.trunkBase + p.rootDepth) * 100, 'ring'));
  out.push(line('root-l1', 50, (p.trunkBase + 0.04) * 100, 38, (p.trunkBase + p.rootDepth * 0.9) * 100, 'secondary'));
  out.push(line('root-r1', 50, (p.trunkBase + 0.04) * 100, 62, (p.trunkBase + p.rootDepth * 0.9) * 100, 'secondary'));
  for (let i = 1; i <= p.archiveRings; i += 1) out.push(ellipse(`archive-${i}`, 50, 50, 12 + i * 8.5, 4.5 + i * 3, 'secondary'));
  for (let i = 0; i < 13; i += 1) {
    const a = (i / 13) * Math.PI * 2;
    out.push(circle(`memory-node-${i}`, 50 + Math.cos(a) * p.canopyR * 75, 29 + Math.sin(a) * 13, 0.45, 'node'));
  }
  return out;
}

function skull(profile) {
  const p = profile.params;
  const out = [
    ellipse('cranium', p.cx * 100, p.cy * 100, p.skullRx * 100, p.skullRy * 100, 'primary'),
    ellipse('left-eye', (p.cx - p.eyeDx) * 100, p.eyeY * 100, 5.5, 4.3, 'ring'),
    ellipse('right-eye', (p.cx + p.eyeDx) * 100, p.eyeY * 100, 5.5, 4.3, 'ring'),
    line('nose-l', 50, (p.eyeY + 0.035) * 100, 47.5, (p.eyeY + 0.12) * 100, 'secondary'),
    line('nose-r', 50, (p.eyeY + 0.035) * 100, 52.5, (p.eyeY + 0.12) * 100, 'secondary'),
    line('jaw-l', 38, (p.cy + 0.13) * 100, 42.5, p.jawY * 100, 'ring'),
    line('jaw-r', 62, (p.cy + 0.13) * 100, 57.5, p.jawY * 100, 'ring'),
    line('jaw-base', 42.5, p.jawY * 100, 57.5, p.jawY * 100, 'ring'),
  ];
  for (let i = 1; i <= p.scanRings; i += 1) out.push(circle(`scan-ring-${i}`, 50, 48, 24 + i * 4.8, 'secondary'));
  out.push(line('scan-axis-h', 18, 48, 82, 48, 'axis'), line('scan-axis-v', 50, 12, 50, 84, 'axis'));
  return out;
}

function orbitMap(profile) {
  const p = profile.params;
  const out = [circle('source', 50, 50, p.sourceR * 100, 'primary')];
  p.rings.forEach((r, index) => {
    out.push(circle(`orbit-${index}`, 50, 50, r * 100, index === p.rings.length - 1 ? 'primary' : 'ring'));
    const count = p.nodes[index];
    for (let i = 0; i < count; i += 1) {
      const a = (i / count) * Math.PI * 2 + index * 0.37;
      out.push(circle(`orbit-${index}-node-${i}`, 50 + Math.cos(a) * r * 100, 50 + Math.sin(a) * r * 100, 0.42, 'node'));
    }
  });
  if (p.axialCross) out.push(line('axis-v', 50, 7, 50, 93, 'axis'), line('axis-h', 7, 50, 93, 50, 'axis'));
  return out;
}

function eyes(profile) {
  const p = profile.params;
  const out = [];
  p.rings.forEach((radius, ringIndex) => {
    const count = p.counts[ringIndex];
    if (radius > 0) out.push(circle(`gaze-ring-${ringIndex}`, 50, 50, radius * 100, 'secondary'));
    for (let i = 0; i < count; i += 1) {
      const a = count === 1 ? 0 : (i / count) * Math.PI * 2 + ringIndex * 0.23;
      const cx = 50 + Math.cos(a) * radius * 100;
      const cy = 50 + Math.sin(a) * radius * 100;
      const rotation = a * 180 / Math.PI + 90;
      out.push(ellipse(`eye-${ringIndex}-${i}`, cx, cy, p.eyeRx * 100, p.eyeRy * 100, ringIndex === 0 ? 'primary' : 'ring', rotation));
      out.push(circle(`pupil-${ringIndex}-${i}`, cx, cy, ringIndex === 0 ? 1.2 : 0.46, 'node'));
    }
  });
  return out;
}

function heart(profile) {
  const p = profile.params;
  const out = [];
  const pts = [];
  for (let i = 0; i <= 160; i += 1) {
    const t = (i / 160) * Math.PI * 2;
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    pts.push([p.cx * 100 + x * p.scale * 1.35, p.cy * 100 - y * p.scale * 1.25]);
  }
  out.push(polyline('heart-contour', pts, 'primary'));
  p.rings.forEach((r, index) => out.push(circle(`heart-ring-${index}`, p.cx * 100, p.cy * 100, r * 100, 'secondary')));
  const vessels = [
    [-4.5, -10, -10, -22], [3.5, -10, 11, -21], [0, -12, 2, -25], [-1, -9, -4, -19], [5, -7, 14, -13],
  ];
  vessels.slice(0, p.vesselCount).forEach(([x1, y1, x2, y2], i) => out.push(line(`vessel-${i}`, 50 + x1, 52 + y1, 50 + x2, 52 + y2, 'ring')));
  out.push(circle('heart-node', 50, 52, 1.2, 'node'));
  return out;
}

function source(profile) {
  const p = profile.params;
  const out = [circle('source-sphere', 50, 43, p.sphereR * 100, 'primary')];
  for (let i = 1; i <= p.rings; i += 1) out.push(circle(`source-ring-${i}`, 50, 43, p.sphereR * (0.45 + i * 0.11) * 100, 'secondary'));
  for (let i = 0; i < p.petals; i += 1) {
    const a = (i / p.petals) * 360;
    out.push(ellipse(`petal-${i}`, 50, 43 - p.sphereR * 47, p.sphereR * 17, p.sphereR * 50, 'ring', a));
  }
  out.push(line('horizon', 10, p.horizonY * 100, 90, p.horizonY * 100, 'axis'));
  out.push(line('reflection', 50, (0.43 + p.sphereR) * 100, 50, p.horizonY * 100, 'secondary'));
  return out;
}

function returnGate(profile) {
  const p = profile.params;
  const out = [];
  for (let i = 0; i < p.nested; i += 1) {
    const scale = 1 - i * 0.12;
    out.push(ellipse(`gate-${i}`, p.gateCx * 100, p.gateCy * 100, p.gateRx * scale * 100, p.gateRy * scale * 100, i === 0 ? 'primary' : 'ring'));
  }
  out.push(line('horizon', 10, p.horizonY * 100, 90, p.horizonY * 100, 'axis'));
  out.push(line('path-l', 50 - p.pathWidth * 18, p.gateCy * 100, 50 - p.pathWidth * 100, 97, 'ring'));
  out.push(line('path-r', 50 + p.pathWidth * 18, p.gateCy * 100, 50 + p.pathWidth * 100, 97, 'ring'));
  for (let i = 0; i < p.fragments; i += 1) {
    const a = (i / p.fragments) * Math.PI * 2;
    const r = 13 + (i % 4) * 5;
    out.push(circle(`fragment-${i}`, 50 + Math.cos(a) * r, 45 + Math.sin(a) * r * 1.2, 0.34, 'node'));
  }
  return out;
}

function organism(profile, isSeed = false) {
  const p = profile.params;
  const out = [
    ellipse(isSeed ? 'seed-shell' : 'membrane', p.cx * 100, p.cy * 100, p.rx * 100, p.ry * 100, 'primary'),
    ellipse('inner-membrane', p.cx * 100, p.cy * 100, p.rx * 82, p.ry * 83, 'secondary'),
    line('axis', p.cx * 100, (p.cy - p.ry * 0.9) * 100, p.cx * 100, (p.cy + p.ry * 0.9) * 100, 'axis'),
  ];
  for (let i = 0; i < p.chambers; i += 1) {
    const t = p.chambers <= 1 ? 0.5 : i / (p.chambers - 1);
    const cy = p.cy - p.ry * 0.58 + t * p.ry * 1.16;
    const width = p.rx * (0.42 + Math.sin(t * Math.PI) * 0.24);
    out.push(ellipse(`chamber-${i}`, p.cx * 100 + Math.sin(i * 2.1) * p.rx * 8, cy * 100, width * 100, p.ry * 7.5, 'ring'));
  }
  const nodeCount = p.nodes ?? p.growthNodes ?? 12;
  for (let i = 0; i < nodeCount; i += 1) {
    const t = (i + 0.5) / nodeCount;
    const a = i * 2.399963;
    const radial = Math.sqrt(t);
    out.push(circle(`bio-node-${i}`, p.cx * 100 + Math.cos(a) * p.rx * 72 * radial, p.cy * 100 + Math.sin(a) * p.ry * 72 * radial, 0.42, 'node'));
  }
  const filamentCount = p.filaments ?? p.lattice ?? 12;
  for (let i = 0; i < filamentCount; i += 1) {
    const t = i / Math.max(1, filamentCount - 1);
    const x = p.cx * 100 + (t - 0.5) * p.rx * 150;
    out.push(line(`filament-${i}`, x, (p.cy + p.ry * 0.35) * 100, 50 + (t - 0.5) * p.rx * 210, (p.cy + p.ry * 1.05) * 100, 'secondary'));
  }
  return out;
}

export function buildHoloCoreRGXScaffold(id) {
  const profile = resolveHoloCoreRGXProfile(id);
  let primitives;
  switch (profile.motif) {
    case 'orbital-stack': primitives = orbital(profile); break;
    case 'radial-core': primitives = radialCore(profile); break;
    case 'portal': primitives = portal(profile); break;
    case 'vortex': primitives = vortex(profile); break;
    case 'helix': primitives = helix(profile); break;
    case 'tree': primitives = tree(profile); break;
    case 'skull': primitives = skull(profile); break;
    case 'orbit-map': primitives = orbitMap(profile); break;
    case 'eyes': primitives = eyes(profile); break;
    case 'heart': primitives = heart(profile); break;
    case 'source': primitives = source(profile); break;
    case 'return': primitives = returnGate(profile); break;
    case 'organism': primitives = organism(profile, false); break;
    case 'seed': primitives = organism(profile, true); break;
    default: primitives = [circle('fallback', 50, 50, 28, 'primary')];
  }
  return Object.freeze(primitives.map(Object.freeze));
}

export function scaffoldStats(primitives) {
  return Object.freeze({
    total: primitives.length,
    ellipses: primitives.filter(item => item.type === 'ellipse').length,
    circles: primitives.filter(item => item.type === 'circle').length,
    lines: primitives.filter(item => item.type === 'line').length,
    polylines: primitives.filter(item => item.type === 'polyline').length,
    nodes: primitives.filter(item => item.role === 'node').length,
    primary: primitives.filter(item => item.role === 'primary').length,
  });
}
