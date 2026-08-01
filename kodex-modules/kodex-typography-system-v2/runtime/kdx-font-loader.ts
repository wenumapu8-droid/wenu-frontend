export type KdxFontBundle =
  | "core"
  | "threshold_error"
  | "machine_cosmology"
  | "ghost_editorial"
  | "longform";

const bundleUrls: Record<KdxFontBundle, string> = {
  core:
    "https://fonts.googleapis.com/css2?" +
    "family=Barlow+Condensed:wght@600;700;800;900&" +
    "family=IBM+Plex+Mono:ital,wght@0,400;0,500;0,600;1,400&" +
    "family=Inter+Tight:ital,wght@0,400;0,500;0,600;0,700;1,400&" +
    "display=swap",

  threshold_error:
    "https://fonts.googleapis.com/css2?" +
    "family=Azeret+Mono:wght@400;500;600;700&" +
    "display=swap",

  machine_cosmology:
    "https://fonts.googleapis.com/css2?" +
    "family=Oxanium:wght@500;600;700&" +
    "display=swap",

  ghost_editorial:
    "https://fonts.googleapis.com/css2?" +
    "family=Bodoni+Moda:ital,opsz,wght@" +
    "0,6..96,400..900;1,6..96,400..900&" +
    "display=swap",

  longform:
    "https://fonts.googleapis.com/css2?" +
    "family=Libre+Baskerville:ital,wght@" +
    "0,400;0,700;1,400&" +
    "display=swap",
};

const loaded = new Set<KdxFontBundle>();

export async function loadKdxFontBundle(
  bundle: KdxFontBundle,
): Promise<void> {
  if (loaded.has(bundle)) return;

  const existing = document.querySelector<HTMLLinkElement>(
    `link[data-kdx-font-bundle="${bundle}"]`,
  );

  if (existing) {
    loaded.add(bundle);
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = bundleUrls[bundle];
    link.dataset.kdxFontBundle = bundle;
    link.onload = () => {
      loaded.add(bundle);
      resolve();
    };
    link.onerror = () => {
      link.remove();
      reject(
        new Error(`Failed to load KODEX font bundle: ${bundle}`),
      );
    };
    document.head.append(link);
  });

  await document.fonts.ready;
}

export function kdxBundleForScene(
  scene:
    | "threshold"
    | "error"
    | "observe"
    | "archive"
    | "machine"
    | "cosmology"
    | "ghost"
    | "longform",
): KdxFontBundle[] {
  const bundles: KdxFontBundle[] = ["core"];

  if (scene === "threshold" || scene === "error") {
    bundles.push("threshold_error");
  }

  if (scene === "machine" || scene === "cosmology") {
    bundles.push("machine_cosmology");
  }

  if (scene === "ghost") {
    bundles.push("ghost_editorial");
  }

  if (scene === "longform") {
    bundles.push("longform");
  }

  return bundles;
}
