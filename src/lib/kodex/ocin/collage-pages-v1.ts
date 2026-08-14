export type OcinCollageVariant = 'threshold' | 'archive' | 'museum';

export type OcinCollageAsset = {
  id: string;
  title: string;
  series: string;
  role: string;
  alt: string;
  /**
   * REVIEW ONLY. These URLs are never used by a public route.
   * The source files are creator-owned originals in the Ocín Drive registry.
   */
  reviewSrc: string;
  /**
   * Public same-origin asset path. Keep null until the approved original/derivative
   * has been vendored into public/assets/kodex/ocin/originals/.
   */
  productionSrc: string | null;
  sourceFilename: string;
  sourceSha256: string;
  width: number;
  height: number;
};

export type OcinCollagePage = {
  id: string;
  variant: OcinCollageVariant;
  plate: string;
  title: string;
  kicker: string;
  description: string;
  routeMode: string;
  cta: string;
  heroId: string;
  supportingIds: string[];
};

/**
 * Creator direction recorded 2026-08-13:
 * use Ocín's original artwork as the visual material of the KODEX collage system;
 * the interface may frame, scale and arrange it, but must not redraw, recolor,
 * distort or substitute the work.
 *
 * reviewSrc exists only to make the noindex lab visually reviewable before the
 * originals are vendored. Public routes must call resolveOcinAsset(asset, false).
 */
export const OCIN_COLLAGE_ASSETS_V1: readonly OcinCollageAsset[] = [
  {
    id: 'OCN-TOR-005',
    title: 'Oscillation Tunnel — Open Core',
    series: 'Field Recursions',
    role: 'DESCENT / HERO FIELD',
    alt: 'High-contrast black-and-white optical tunnel of repeated stepped diamonds and concentric bands converging toward a dense center.',
    reviewSrc: 'https://drive.google.com/uc?export=view&id=1csEpt4TfisUuax_OVa5gGEfCMdJIxoIK',
    productionSrc: null,
    sourceFilename: 'image3A30005_mirror.jpg',
    sourceSha256: '79f907e6fe6a64ec1f6f8bff7d7fb7cbf6b2218f74421f97562bc77a47123e3b',
    width: 1066,
    height: 2814,
  },
  {
    id: 'OCN-TOR-001',
    title: 'Seed Aperture — White Field',
    series: 'Field Recursions',
    role: 'THRESHOLD / PORTAL',
    alt: 'Black-and-white recursive geometric field with mirrored angular motifs shrinking repeatedly toward a dense central aperture.',
    reviewSrc: 'https://drive.google.com/uc?export=view&id=1zHWSdJ0UoHtLW_Oyj72XQQtCcX-Qi-UY',
    productionSrc: null,
    sourceFilename: 'image3A30006_mirror3.jpg',
    sourceSha256: 'fb6cbb2f89d4846e1fafe08cea16b33d46480d9fb6ebe13d395d900d678791a4',
    width: 1575,
    height: 2048,
  },
  {
    id: 'OCN-SQR-001',
    title: 'Open Archive Frame',
    series: 'Orbital Architectures',
    role: 'ARCHIVE / FRAME',
    alt: 'Black geometric square border built from mirrored hooked modules surrounding a large empty white center.',
    reviewSrc: 'https://drive.google.com/uc?export=view&id=1fApkVD7HvwuXmpub6EAJChl9AWEusPqs',
    productionSrc: null,
    sourceFilename: 'image3A30110_mirror.jpg',
    sourceSha256: '552a23b946106c54d77353e62280e1234dfdf2297ca098ce11d37c0e77a43149',
    width: 2048,
    height: 2048,
  },
  {
    id: 'OCN-FRC-002',
    title: 'Recursive Wave Basin',
    series: 'Recursive Bodies',
    role: 'ARCHIVE / COSMOLOGY',
    alt: 'Dense black-and-white layered field with repeated geometric bands surrounding a central dark fractal basin filled with curling recursive forms.',
    reviewSrc: 'https://drive.google.com/uc?export=view&id=1zAeyvWCkNleePJPxXfPmqke8iwjTLSMI',
    productionSrc: null,
    sourceFilename: 'image3A30006_mirror2.jpg',
    sourceSha256: 'ac1153bdd24203a569ebd16f72f80d4fa0f43b8db404b5d3b628e2470d8d5689',
    width: 2048,
    height: 2048,
  },
  {
    id: 'OCN-TRI-001',
    title: 'Axial Guardian — Open Lattice',
    series: 'Vector Thresholds',
    role: 'THRESHOLD / NAVIGATION',
    alt: 'Tall black-and-white geometric figure composed of stacked triangles, diamonds and mirrored angular modules on a white field.',
    reviewSrc: 'https://drive.google.com/uc?export=view&id=12j8lSrBZmVMziVVGQoeW6Rhdq9fVBSot',
    productionSrc: null,
    sourceFilename: 'image3A30212_mirror5.jpg',
    sourceSha256: '7df364b4edb7993722b530410723ac3a33d5808cac43bd3295d6788f75e4d087',
    width: 1222,
    height: 2451,
  },
  {
    id: 'OCN-MND-GRY-002',
    title: 'Grey Petal Aperture — Star Core',
    series: 'Pale Lattices',
    role: 'THRESHOLD / FOCUS',
    alt: 'Pale grey radial flower with six layered petals and a small star-like center floating in a large white field.',
    reviewSrc: 'https://drive.google.com/uc?export=view&id=1wG4yYd4dpncRfO25XREUUxuEBtjPPqO8',
    productionSrc: null,
    sourceFilename: 'image3A30213_mirror5.jpg',
    sourceSha256: '53c397f8e9931dc15bf0e6ca1ee6d8c211e775fa84a3f7a3753c8c0477c2b805',
    width: 2048,
    height: 2048,
  },
] as const;

export const OCIN_COLLAGE_PAGES_V1: readonly OcinCollagePage[] = [
  {
    id: 'OCIN-COLLAGE-THRESHOLD-001',
    variant: 'threshold',
    plate: '00.01',
    title: 'THRESHOLD',
    kicker: 'ENTER THE LIVING ARCHIVE',
    description: 'A navigable collection of original systems. The work remains the work; KODEX changes the context around it.',
    routeMode: 'OBSERVER / DORMANT → AWARE',
    cta: 'BEGIN TRANSMISSION',
    heroId: 'OCN-TOR-001',
    supportingIds: ['OCN-SQR-001', 'OCN-TRI-001', 'OCN-MND-GRY-002', 'OCN-TOR-005'],
  },
  {
    id: 'OCIN-COLLAGE-ARCHIVE-001',
    variant: 'archive',
    plate: '00.02',
    title: 'ARCHIVE ATLAS',
    kicker: 'A LIVING ARCHIVE',
    description: 'A curated wall of original systems for navigation, comparison and provenance. No generated substitute; no redraw.',
    routeMode: 'ARCHIVE / OBSERVER',
    cta: 'ENTER ARCHIVE ATLAS',
    heroId: 'OCN-FRC-002',
    supportingIds: ['OCN-TOR-001', 'OCN-SQR-001', 'OCN-TRI-001', 'OCN-MND-GRY-002', 'OCN-TOR-005'],
  },
  {
    id: 'OCIN-COLLAGE-MUSEUM-001',
    variant: 'museum',
    plate: '00.03',
    title: 'MUSEUM OF SPACE',
    kicker: 'OCÍN / LIVING ARCHIVE',
    description: 'An exhibition surface for original systems: preserved as artwork, connected as memory, presented as interface.',
    routeMode: 'MEMORY / OBSERVER',
    cta: 'VIEW COLLECTION',
    heroId: 'OCN-TOR-005',
    supportingIds: ['OCN-SQR-001', 'OCN-TRI-001', 'OCN-MND-GRY-002', 'OCN-FRC-002'],
  },
] as const;

export function getOcinCollageAsset(id: string): OcinCollageAsset {
  const asset = OCIN_COLLAGE_ASSETS_V1.find((candidate) => candidate.id === id);
  if (!asset) throw new Error(`Unknown Ocín collage asset: ${id}`);
  return asset;
}

export function getOcinCollagePage(variant: OcinCollageVariant): OcinCollagePage {
  const page = OCIN_COLLAGE_PAGES_V1.find((candidate) => candidate.variant === variant);
  if (!page) throw new Error(`Unknown Ocín collage page: ${variant}`);
  return page;
}

export function resolveOcinAsset(asset: OcinCollageAsset, reviewMode = false): string | null {
  return reviewMode ? asset.reviewSrc : asset.productionSrc;
}
