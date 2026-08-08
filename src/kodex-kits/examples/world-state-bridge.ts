import type { KodexWorldState } from './world-state';
export function bindCrtToWorld(crt:any, world:KodexWorldState){const presets=['threshold','observe','descent','archive','machine','cosmology','return'] as const;crt.setPreset(presets[world.scene]??'neutral');crt.setSignalState({signal:world.signal,focus:world.focus});if(world.anomaly>.72)crt.triggerAnomaly('slice',world.anomaly,320);}
