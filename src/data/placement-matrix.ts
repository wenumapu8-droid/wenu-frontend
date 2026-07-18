import type { Form } from '../lib/piercingForm';

/**
 * Layer 2: the MANY-TO-MANY matrix (encodes §7 of conocimiento-joyeria-piercing.md).
 * Form → placements, and for rings/clickers, diameter-band → placements.
 * A single piece serves several piercings, so a product lands under many chips.
 * This file is pure data — edit it to retune the matrix without touching logic.
 */

export type Placement =
  | 'lobe' | 'helix' | 'conch' | 'tragus' | 'daith' | 'septum'
  | 'nostril' | 'labret' | 'navel' | 'nipple' | 'tongue' | 'industrial'
  | 'eyebrow' | 'stretched';

export const PLACEMENTS: { key: Placement; label: string }[] = [
  { key: 'lobe',       label: 'Lobe' },
  { key: 'helix',      label: 'Helix' },
  { key: 'conch',      label: 'Conch' },
  { key: 'tragus',     label: 'Tragus / Rook' },
  { key: 'daith',      label: 'Daith' },
  { key: 'septum',     label: 'Septum' },
  { key: 'nostril',    label: 'Nostril' },
  { key: 'labret',     label: 'Labret / Lip' },
  { key: 'navel',      label: 'Navel' },
  { key: 'nipple',     label: 'Nipple' },
  { key: 'tongue',     label: 'Tongue' },
  { key: 'industrial', label: 'Industrial' },
  { key: 'eyebrow',    label: 'Eyebrow' },
  { key: 'stretched',  label: 'Stretched lobe' },
];

/** Form → the placements that form serves (independent of diameter). */
export const FORM_PLACEMENTS: Partial<Record<Form, Placement[]>> = {
  'stud':             ['lobe', 'helix', 'conch', 'tragus', 'nostril', 'labret'],
  'curved-barbell':   ['navel', 'eyebrow', 'daith', 'tragus'],
  'straight-barbell': ['tongue', 'industrial', 'nipple'],
  'circular-barbell': ['septum', 'nipple', 'lobe'],
  'nostril-screw':    ['nostril'],
  'plug':             ['stretched'],
  'tunnel':           ['stretched'],
  'hanger':           ['stretched'],
  'weight':           ['stretched'],
  'saddle':           ['stretched'],
  'taper':            ['stretched'],
};

/** Rings & clickers map by inner DIAMETER (mm) — the universal-ring principle (§7). */
export function ringDiameterPlacements(d: number | null): Placement[] {
  if (d == null)  return ['septum', 'daith', 'helix', 'lobe', 'nostril']; // common spread when unknown
  if (d <= 6.5)   return ['tragus', 'helix', 'septum', 'daith', 'lobe', 'nostril'];
  if (d <= 8)     return ['lobe', 'helix', 'daith', 'septum', 'nostril', 'conch'];
  if (d <= 10)    return ['septum', 'nostril', 'lobe', 'daith'];
  return ['daith', 'conch', 'lobe', 'septum']; // 11mm+ statement
}
