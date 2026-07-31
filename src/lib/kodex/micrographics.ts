export const KODEX_MICROGRAPHICS = {
  dial8: { id: 'kdx-dial-8', viewBox: '0 0 64 64', category: 'control', motion: 'tick' },
  compass: { id: 'kdx-compass', viewBox: '0 0 64 64', category: 'navigation', motion: 'spin-slow' },
  crosshair: { id: 'kdx-crosshair', viewBox: '0 0 64 64', category: 'targeting', motion: 'lock' },
  sunburst: { id: 'kdx-sunburst', viewBox: '0 0 64 64', category: 'signal', motion: 'pulse' },
  orbit: { id: 'kdx-orbit', viewBox: '0 0 64 64', category: 'cosmos', motion: 'spin-slow' },
  radar: { id: 'kdx-radar', viewBox: '0 0 64 64', category: 'scan', motion: 'scan' },
  nodeRing: { id: 'kdx-node-ring', viewBox: '0 0 64 64', category: 'network', motion: 'spin-reverse' },
  radialFan: { id: 'kdx-radial-fan', viewBox: '0 0 64 64', category: 'analysis', motion: 'reveal' },
  waveform: { id: 'kdx-waveform', viewBox: '0 0 96 40', category: 'signal', motion: 'flow' },
  equalizer: { id: 'kdx-equalizer', viewBox: '0 0 96 40', category: 'audio', motion: 'pulse' },
  dotMatrix: { id: 'kdx-dot-matrix', viewBox: '0 0 64 64', category: 'data', motion: 'blink' },
  dataStack: { id: 'kdx-data-stack', viewBox: '0 0 96 48', category: 'data', motion: 'flow' },
  bracketFrame: { id: 'kdx-bracket-frame', viewBox: '0 0 64 64', category: 'frame', motion: 'lock' },
  hexCluster: { id: 'kdx-hex-cluster', viewBox: '0 0 80 64', category: 'system', motion: 'drift' },
  flowerCell: { id: 'kdx-flower-cell', viewBox: '0 0 80 40', category: 'bio', motion: 'breathe' },
  infinityNode: { id: 'kdx-infinity-node', viewBox: '0 0 80 40', category: 'identity', motion: 'pulse' },
  scanBar: { id: 'kdx-scan-bar', viewBox: '0 0 96 36', category: 'status', motion: 'scan' },
  signalGate: { id: 'kdx-signal-gate', viewBox: '0 0 80 64', category: 'protocol', motion: 'open' },
  checksumGrid: { id: 'kdx-checksum-grid', viewBox: '0 0 64 64', category: 'verification', motion: 'blink' },
  ringPulse: { id: 'kdx-ring-pulse', viewBox: '0 0 64 64', category: 'signal', motion: 'pulse' },
  endpointGraph: { id: 'kdx-endpoint-graph', viewBox: '0 0 96 56', category: 'network', motion: 'flow' },
  chevron4: { id: 'kdx-chevron-4', viewBox: '0 0 64 64', category: 'navigation', motion: 'lock' },
  portal: { id: 'kdx-portal', viewBox: '0 0 64 64', category: 'threshold', motion: 'breathe' },
} as const;

export type KodexMicrographicName = keyof typeof KODEX_MICROGRAPHICS;
export type KodexMotion =
  | 'none'
  | 'tick'
  | 'spin-slow'
  | 'spin-reverse'
  | 'pulse'
  | 'scan'
  | 'lock'
  | 'reveal'
  | 'flow'
  | 'blink'
  | 'drift'
  | 'breathe'
  | 'open';
