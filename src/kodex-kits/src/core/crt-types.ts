export type KodexCrtPreset = 'neutral' | 'threshold' | 'observe' | 'descent' | 'archive' | 'machine' | 'cosmology' | 'return';
export type KodexCrtQuality = 'full' | 'balanced' | 'low-power';
export type KodexCrtAnomaly = 'none' | 'tear' | 'roll' | 'slice' | 'burst';
export interface KodexCrtMetrics { fps:number; averageFrameTime:number; droppedFrames:number; profile:KodexCrtQuality; webglActive:boolean; fallbackActive:boolean; passCount:number; reason?:string; }
export interface KodexCrtMountOptions { source:Element|string; container?:HTMLElement|string; canvas?:HTMLCanvasElement; preset?:KodexCrtPreset; quality?:KodexCrtQuality; signal?:number; focus?:number; autoStart?:boolean; className?:string; metricsKey?:string; }
