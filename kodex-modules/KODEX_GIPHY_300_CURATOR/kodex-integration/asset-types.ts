export type KodexGiphyRole =
  | 'hero' | 'transition' | 'micrographic' | 'artifact' | 'specimen'
  | 'signal' | 'telemetry' | 'symbol' | 'portal' | 'texture'
  | 'fallback' | 'observer' | 'seal' | 'scan' | 'anomaly';

export interface KodexGiphyAsset {
  giphy_id: string;
  title: string;
  page_url: string;
  username?: string | null;
  rating: string;
  kodex_category: string;
  kodex_scene: string;
  kodex_roles: KodexGiphyRole[];
  priority: number;
  attribution: {
    creator: string;
    powered_by: 'GIPHY';
  };
}
