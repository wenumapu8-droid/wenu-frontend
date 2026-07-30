export const KODEX_MICROGRAPHICS = {
  crosshair: { id: 'kdx-crosshair', viewBox: '0 0 64 64', category: 'targeting', motion: 'lock' },
  orbit: { id: 'kdx-orbit', viewBox: '0 0 64 64', category: 'cosmos', motion: 'spin-slow' },
  radar: { id: 'kdx-radar', viewBox: '0 0 64 64', category: 'scan', motion: 'scan' },
  nodeRing: { id: 'kdx-node-ring', viewBox: '0 0 64 64', category: 'network', motion: 'spin-reverse' },
  waveform: { id: 'kdx-waveform', viewBox: '0 0 96 40', category: 'signal', motion: 'flow' },
  scanBar: { id: 'kdx-scan-bar', viewBox: '0 0 96 36', category: 'status', motion: 'scan' },
  signalGate: { id: 'kdx-signal-gate', viewBox: '0 0 80 64', category: 'protocol', motion: 'open' },
  checksumGrid: { id: 'kdx-checksum-grid', viewBox: '0 0 64 64', category: 'verification', motion: 'blink' },
} as const;

export type KodexMicrographicName = keyof typeof KODEX_MICROGRAPHICS;
export type KodexMotion = 'none' | 'spin-slow' | 'spin-reverse' | 'scan' | 'lock' | 'flow' | 'blink' | 'open';
