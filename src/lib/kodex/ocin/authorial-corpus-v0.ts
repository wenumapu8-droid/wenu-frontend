export type OcinSceneRole = 'THRESHOLD' | 'ARCHIVE' | 'HEART' | 'RETURN';

export type OcinActivation =
  | 'PORTAL'
  | 'FRAME'
  | 'SPECIMEN'
  | 'NAVIGATION'
  | 'MEMORY'
  | 'FOCUS'
  | 'OBSERVE';

export type OcinWorkRecord = {
  id: string;
  title: string;
  series: string;
  sceneRoles: OcinSceneRole[];
  activation: OcinActivation;
  alt: string;
  curatorialNote: string;
  visualSignature: {
    symmetry: string;
    density: 'low' | 'medium' | 'high' | 'very-high';
    negativeSpace: 'low' | 'medium' | 'high' | 'very-high';
    palette: string;
    motionPotential: string;
  };
  /**
   * Public runtime bytes are deliberately absent until creator/public-use review.
   * Never replace this with a private Drive URL.
   */
  artworkSrc: string | null;
  publicApproval: boolean;
  status: 'CREATOR_REVIEW_PENDING' | 'DERIVATIVE_READY' | 'PUBLIC_APPROVED';
};

export const OCIN_GENESIS_REVIEW_V0: readonly OcinWorkRecord[] = [
  {
    id: 'OCN-TOR-001',
    title: 'Seed Aperture — White Field',
    series: 'Field Recursions',
    sceneRoles: ['THRESHOLD', 'RETURN'],
    activation: 'PORTAL',
    alt: 'Black-and-white recursive geometric field with mirrored angular motifs shrinking repeatedly toward a dense central aperture.',
    curatorialNote: 'A scale transition already lives inside the artwork: large perimeter motifs collapse toward a nearly granular center. KODEX should enter through scale, not added spectacle.',
    visualSignature: {
      symmetry: 'bilateral + recursive radial',
      density: 'medium',
      negativeSpace: 'high',
      palette: 'black / white',
      motionPotential: 'inward recursion; restrained scale pulse',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-MND-GRY-002',
    title: 'Grey Petal Aperture — Star Core',
    series: 'Pale Lattices',
    sceneRoles: ['HEART', 'THRESHOLD'],
    activation: 'FOCUS',
    alt: 'Pale grey radial flower with six layered petals and a small star-like center floating in a large white field.',
    curatorialNote: 'A breathing station. Silence and white field are structural material; telemetry should recede almost completely.',
    visualSignature: {
      symmetry: 'radial six-fold',
      density: 'low',
      negativeSpace: 'very-high',
      palette: 'pale grey / white / soft charcoal',
      motionPotential: 'gentle aperture opening; opacity breathing',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-SQR-001',
    title: 'Open Archive Frame',
    series: 'Orbital Architectures',
    sceneRoles: ['ARCHIVE'],
    activation: 'FRAME',
    alt: 'Black geometric square border built from mirrored hooked modules surrounding a large empty white center.',
    curatorialNote: 'The artwork behaves as an authored container. Its central void can hold verified evidence without turning the original geometry into decoration.',
    visualSignature: {
      symmetry: 'bilateral modular border',
      density: 'low',
      negativeSpace: 'very-high',
      palette: 'black / white',
      motionPotential: 'perimeter trace; modular reveal',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-TRI-001',
    title: 'Axial Guardian — Open Lattice',
    series: 'Vector Thresholds',
    sceneRoles: ['THRESHOLD'],
    activation: 'NAVIGATION',
    alt: 'Tall black-and-white geometric figure composed of stacked triangles, diamonds and mirrored angular modules on a white field.',
    curatorialNote: 'The bilateral axis behaves as a gate-body before a route or deeper chamber. KODEX should reinforce direction rather than add another emblem.',
    visualSignature: {
      symmetry: 'vertical bilateral / axial',
      density: 'medium',
      negativeSpace: 'high',
      palette: 'black / white',
      motionPotential: 'vertical alignment; segmented reveal',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-FRC-001',
    title: 'Fractal Vessel — Crowned Basin',
    series: 'Recursive Bodies',
    sceneRoles: ['ARCHIVE'],
    activation: 'SPECIMEN',
    alt: 'Black circular field containing an irregular white fractal basin, surrounded by a sharp radial crown and thick concentric rings.',
    curatorialNote: 'A recursive body held inside an explicit boundary. ARCHIVE can inspect it as an authored specimen without turning it into a factual scientific diagram.',
    visualSignature: {
      symmetry: 'radial frame / asymmetric fractal interior',
      density: 'high',
      negativeSpace: 'low',
      palette: 'black / white',
      motionPotential: 'slow specimen zoom; contour trace',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-CIR-001',
    title: 'Orbital Aperture — Twin Current',
    series: 'Orbital Apertures',
    sceneRoles: ['THRESHOLD'],
    activation: 'FOCUS',
    alt: 'Black-and-white circular composition of nested oval currents compressing toward a small mirrored seed at the center.',
    curatorialNote: 'A restrained focusing field. Its pressure moves inward, making it useful before denser KODEX states.',
    visualSignature: {
      symmetry: 'bilateral + concentric',
      density: 'medium',
      negativeSpace: 'high',
      palette: 'black / white',
      motionPotential: 'slow orbital compression; inward focus',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-MND-GRY-003',
    title: 'Quadrant Bloom — Open Eye',
    series: 'Pale Lattices',
    sceneRoles: ['HEART'],
    activation: 'OBSERVE',
    alt: 'Large pale grey four-lobed radial composition with elongated white petal-shaped openings and a small patterned center.',
    curatorialNote: 'Four open lobes create an observational field without requiring a literal eye. Focus can activate one quadrant while the rest remains quiet.',
    visualSignature: {
      symmetry: 'four-direction radial',
      density: 'low',
      negativeSpace: 'high',
      palette: 'grey / white',
      motionPotential: 'subtle quadrant response; center pulse',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-SQR-005',
    title: 'Concentric Memory Carpet — Light Field',
    series: 'Orbital Architectures',
    sceneRoles: ['RETURN', 'ARCHIVE'],
    activation: 'MEMORY',
    alt: 'Light-field square composition with repeated black geometric bands, nested frames and a central maze-like diamond cell.',
    curatorialNote: 'A light-state counterpart for the moment archived structure returns to legibility. Reconstruction should reveal nested bands rather than add noise.',
    visualSignature: {
      symmetry: 'nested square symmetry',
      density: 'high',
      negativeSpace: 'medium',
      palette: 'black / white',
      motionPotential: 'nested-band reveal; outward reconstruction',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-TOR-007',
    title: 'Seed Aperture — Negative Field',
    series: 'Field Recursions',
    sceneRoles: ['RETURN', 'THRESHOLD'],
    activation: 'MEMORY',
    alt: 'Black-and-white inverse companion to Seed Aperture — White Field, preserving its recursive threshold grammar in reversed polarity.',
    curatorialNote: 'RETURN should remember the entrance rather than invent a new symbol. This inverse pair gives the route an authored visual memory.',
    visualSignature: {
      symmetry: 'inverse pair / bilateral + recursive radial',
      density: 'medium',
      negativeSpace: 'medium',
      palette: 'black / white polarity inverse',
      motionPotential: 'outward reconstruction; polarity fade',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
  {
    id: 'OCN-TOR-004',
    title: 'Diamond Axis Bloom',
    series: 'Field Recursions',
    sceneRoles: ['THRESHOLD'],
    activation: 'NAVIGATION',
    alt: 'Black-and-white radial composition of elongated diamond forms and angular petals expanding from a finely detailed central point.',
    curatorialNote: 'Four dominant axes provide orientation while the recursive center retains depth. Useful when the system needs direction rather than density.',
    visualSignature: {
      symmetry: 'axial + radial cross symmetry',
      density: 'medium',
      negativeSpace: 'high',
      palette: 'black / white',
      motionPotential: 'axis alignment; restrained radial bloom',
    },
    artworkSrc: null,
    publicApproval: false,
    status: 'CREATOR_REVIEW_PENDING',
  },
] as const;

export function getOcinWork(id: string): OcinWorkRecord | undefined {
  return OCIN_GENESIS_REVIEW_V0.find((work) => work.id === id);
}
