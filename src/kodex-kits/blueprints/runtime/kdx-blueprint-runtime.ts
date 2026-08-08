export type KdxRenderMode = "dom" | "svg" | "webgl";

export interface KdxZoneBlueprint {
  id: string;
  role: string;
  desktop: [number, number, number, number];
  mobile: [number, number, number, number];
  z: number;
  render: KdxRenderMode;
  motion: string;
}

export interface KdxSceneBlueprint {
  id: string;
  index: number;
  slug: string;
  name: string;
  theme: string;
  purpose: string;
  grid: {
    desktop: number;
    mobile: number;
    ratio: string;
    density: number;
    negativeSpacePct: number;
  };
  headline: string;
  copyLimit: number;
  primaryCTA: string;
  visualAnchor: string;
  zones: KdxZoneBlueprint[];
  event: string;
}

export function zoneStyle(
  zone: KdxZoneBlueprint,
  mobile: boolean,
): Record<string, string> {
  const [x, y, w, h] = mobile
    ? zone.mobile
    : zone.desktop;

  return {
    "--kdx-zone-x": `${x * 100}%`,
    "--kdx-zone-y": `${y * 100}%`,
    "--kdx-zone-w": `${w * 100}%`,
    "--kdx-zone-h": `${h * 100}%`,
    "--kdx-zone-z": String(zone.z),
  };
}

export function emitKdxSceneEvent(
  eventName: string,
  detail: Record<string, unknown>,
): void {
  document.dispatchEvent(
    new CustomEvent(eventName, { detail }),
  );
}
