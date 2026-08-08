export const KODEX_SCENES = [
  'THRESHOLD',
  'PROLOGUE',
  'DESCENT',
  'ARCHIVE',
  'MACHINE',
  'COSMOLOGY',
  'RETURN',
] as const;

export type KodexScene = (typeof KODEX_SCENES)[number];
export type EvidenceState = 'PASS' | 'FAIL' | 'BLOCKED' | 'N/A' | null;
export type ConstructionStage =
  | 'UNMEASURED'
  | 'SCAFFOLD'
  | 'MAPPED'
  | 'BLUEPRINTED'
  | 'BUILDING'
  | 'PREVIEW_READY'
  | 'PREVIEW_PUBLISHED'
  | 'AUDITED'
  | 'ACCEPTED';

export interface SceneConstructionProgress {
  scene: KodexScene;
  stage: ConstructionStage;
  owner: string | null;
  branch: string | null;
  route: string | null;
  reference: {
    resolved: EvidenceState;
    sourceId: string | null;
    asset: string | null;
  };
  evidence: {
    structuralMap: EvidenceState;
    blueprint: EvidenceState;
    informationDesign: EvidenceState;
    nodeGraph: EvidenceState;
    nativeBuild: EvidenceState;
    desktopQa: EvidenceState;
    mobile390Qa: EvidenceState;
    mobile412Qa: EvidenceState;
    reducedMotion: EvidenceState;
    fallback: EvidenceState;
  };
  visualTargetMatch: number | null;
  nativeImplementation: number | null;
  blocker: string | null;
  updatedAt: string | null;
}

const unmeasured = (scene: KodexScene): SceneConstructionProgress => ({
  scene,
  stage: 'UNMEASURED',
  owner: null,
  branch: null,
  route: null,
  reference: {
    resolved: null,
    sourceId: null,
    asset: null,
  },
  evidence: {
    structuralMap: null,
    blueprint: null,
    informationDesign: null,
    nodeGraph: null,
    nativeBuild: null,
    desktopQa: null,
    mobile390Qa: null,
    mobile412Qa: null,
    reducedMotion: null,
    fallback: null,
  },
  visualTargetMatch: null,
  nativeImplementation: null,
  blocker: null,
  updatedAt: null,
});

/**
 * Production agents update only fields backed by evidence from their bounded packet.
 * `null` means UNMEASURED, not FAIL and not zero progress.
 */
export const KODEX_CONSTRUCTION_PROGRESS: SceneConstructionProgress[] = KODEX_SCENES.map(unmeasured);

const evidenceValues = (scene: SceneConstructionProgress): EvidenceState[] => [
  scene.reference.resolved,
  scene.evidence.structuralMap,
  scene.evidence.blueprint,
  scene.evidence.informationDesign,
  scene.evidence.nodeGraph,
  scene.evidence.nativeBuild,
  scene.evidence.desktopQa,
  scene.evidence.mobile390Qa,
  scene.evidence.mobile412Qa,
  scene.evidence.reducedMotion,
  scene.evidence.fallback,
];

export const getMeasurementCoverage = (scene: SceneConstructionProgress): number => {
  const values = evidenceValues(scene);
  const evidenceMeasured = values.filter((value) => value !== null).length;
  const metricMeasured = [scene.visualTargetMatch, scene.nativeImplementation].filter(
    (value) => value !== null,
  ).length;
  const measured = evidenceMeasured + metricMeasured;
  const total = values.length + 2;
  return Math.round((measured / total) * 100);
};

export const getNextUnmeasuredGate = (scene: SceneConstructionProgress): string | null => {
  const gates: Array<[string, EvidenceState]> = [
    ['REFERENCE', scene.reference.resolved],
    ['STRUCTURAL MAP', scene.evidence.structuralMap],
    ['BLUEPRINT', scene.evidence.blueprint],
    ['INFORMATION DESIGN', scene.evidence.informationDesign],
    ['NODE GRAPH', scene.evidence.nodeGraph],
    ['NATIVE BUILD', scene.evidence.nativeBuild],
    ['DESKTOP QA', scene.evidence.desktopQa],
    ['MOBILE 390 QA', scene.evidence.mobile390Qa],
    ['MOBILE 412 QA', scene.evidence.mobile412Qa],
    ['REDUCED MOTION', scene.evidence.reducedMotion],
    ['FALLBACK', scene.evidence.fallback],
  ];

  const unresolved = gates.find(([, value]) => value === null);
  if (unresolved) return unresolved[0];
  if (scene.visualTargetMatch === null) return 'VISUAL TARGET MATCH';
  if (scene.nativeImplementation === null) return 'NATIVE IMPLEMENTATION';
  return null;
};

export const getFleetMeasurementCoverage = (): number => {
  const coverages = KODEX_CONSTRUCTION_PROGRESS.map(getMeasurementCoverage);
  return Math.round(coverages.reduce((sum, value) => sum + value, 0) / coverages.length);
};
