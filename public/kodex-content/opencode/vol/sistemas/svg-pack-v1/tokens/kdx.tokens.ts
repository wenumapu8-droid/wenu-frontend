export const kdxTokens = {
  color: {
    background: "#050608",
    surface: "#0A0D10",
    border: "#343B42",
    text: "#E9EDE8",
    textSecondary: "#8B949C",
    red: "#FF1744",
    orange: "#FF7A1A",
    acid: "#B9FF3B",
    green: "#00E879",
    cyan: "#10E9FF",
    blue: "#3A56FF",
    violet: "#8128FF",
    magenta: "#FF0FA8",
    gold: "#D8AE5A",
  },

  grid: {
    desktop: { columns: 12, margin: "clamp(32px, 4vw, 72px)", gutter: "clamp(12px, 1.4vw, 24px)" },
    tablet: { columns: 8, margin: "24px", gutter: "16px" },
    mobile: { columns: 4, margin: "16px", gutter: "10px" },
  },

  motion: {
    instant: 120,
    fast: 240,
    medium: 520,
    slow: 1200,
    scene: 1800,
    ambient: 14000,
    orbit: 32000,
  },

  performance: {
    desktopTargetFps: 60,
    mobileTargetFpsMin: 45,
    maxDprDesktop: 1.75,
    maxDprMobile: 1.25,
    maxActiveCanvases: 1,
  },
} as const;

export type KdxSceneTheme =
  | "threshold"
  | "observe"
  | "descent"
  | "archive"
  | "machine"
  | "cosmology"
  | "ghost"
  | "return";
