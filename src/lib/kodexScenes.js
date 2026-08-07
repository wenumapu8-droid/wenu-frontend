// KODEX−∞ · the 7 scenes of the journey (per KODEX-BUILD.md §3 storyboard).
// One acento por escena. One primary CTA per scene. Copy on-screen from brief.
// Scene 00 THRESHOLD = the cover (/kodex/). 01..06 = the six folios I..VI.

export const scenes = [
  {
    i: 0, index: '00', code: 'THRESHOLD',
    subtitle: 'the gate opens',
    accent: 'red', accentVar: '--kdx-red', accentHex: '#FF3B33',
    emblem: '/img/kodex/brand/kodex-00-threshold.png',
    motif: 'crosshair · target',
    lede: 'A living audiovisual system connecting signal, matter, memory and generative code. Access the archive beyond the surface.',
    cta: 'ENTER THE KODEX',
    href: '/kodex/', hash: 'threshold',
  },
  {
    i: 1, index: '01', code: 'PROLOGUE',
    subtitle: 'observe the signal',
    accent: 'violet', accentVar: '--kdx-violet', accentHex: '#B770FF',
    emblem: '/img/kodex/brand/kodex-01-prologue.png',
    motif: 'iris · dithered eye',
    lede: 'This is not a gallery. It is a system, and it descends. Each signal is a work — read it, generate from it, carry it. You choose the depth.',
    cta: 'BEGIN OBSERVATION',
    href: '/kodex/folio/i/', hash: 'prologue',
  },
  {
    i: 2, index: '02', code: 'DESCENT',
    subtitle: 'enter the depths',
    accent: 'orange', accentVar: '--kdx-orange', accentHex: '#FF8A33',
    emblem: '/img/kodex/brand/kodex-02-descent.png',
    motif: 'wireframe tunnel · vortex',
    lede: 'Leave the surface. Follow the signal into the depths.',
    cta: 'START DESCENT',
    href: '/kodex/folio/ii/', hash: 'descent',
  },
  {
    i: 3, index: '03', code: 'ARCHIVE',
    subtitle: 'explore the signals',
    accent: 'multi', accentVar: '--kdx-cyan', accentHex: '#00F0FF',
    emblem: '/img/kodex/brand/kodex-03-archive.png',
    motif: 'ident cards grid',
    lede: 'Every signal has a genealogy: drawing → geometry → transformation → volume → matter → activation.',
    cta: 'SELECT A SIGNAL',
    href: '/kodex/folio/iii/', hash: 'archive',
  },
  {
    i: 4, index: '04', code: 'MACHINE',
    subtitle: 'generate new patterns',
    accent: 'cyan', accentVar: '--kdx-cyan', accentHex: '#00F0FF',
    emblem: '/img/kodex/brand/kodex-04-machine.png',
    motif: 'radial generator',
    lede: 'The system does not show you art. It makes it — from seed, method and source.',
    cta: 'GENERATE SIGNAL',
    href: '/kodex/folio/iv/', hash: 'machine',
  },
  {
    i: 5, index: '05', code: 'COSMOLOGY',
    subtitle: 'connect the map',
    accent: 'magenta', accentVar: '--kdx-magenta', accentHex: '#FF00C8',
    emblem: '/img/kodex/brand/kodex-05-cosmology.png',
    motif: 'orbital map',
    lede: 'Nothing here stands alone. Signal becomes matter, matter becomes body, body becomes memory.',
    cta: 'REVEAL CONNECTION',
    href: '/kodex/folio/v/', hash: 'cosmology',
  },
  {
    i: 6, index: '06', code: 'RETURN',
    subtitle: 'restore the pattern',
    accent: 'acid', accentVar: '--kdx-acid', accentHex: '#B7FF00',
    emblem: '/img/kodex/brand/kodex-06-return.png',
    motif: 'tree · restored pattern',
    lede: 'You did not reach the end. You became the return. The pattern is restored. The cycle continues.',
    cta: 'CHOOSE NEXT ACTION',
    href: '/kodex/folio/vi/', hash: 'return',
  },
];

export const tagline = 'THE ARCHIVE DOES NOT STORE. IT REMEMBERS.';

export function findSceneByPath(pathname) {
  const clean = pathname.replace(/\/+$/, '') + '/';
  return scenes.find((s) => s.href === clean) || scenes[0];
}
