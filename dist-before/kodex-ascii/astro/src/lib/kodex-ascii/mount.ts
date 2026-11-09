import { AsciiRenderer } from "../../../../src/engine/AsciiRenderer.js";
import { SCENES } from "../../../../src/scenes/index.js";

export type KodexAsciiSceneName = keyof typeof SCENES;

export function mountKodexAsciiScene(root: HTMLElement) {
  const canvas = root.querySelector<HTMLCanvasElement>("canvas[data-kdx-canvas]");
  if (!canvas) throw new Error("KODEX ASCII: falta canvas[data-kdx-canvas]");

  const initialScene = (root.dataset.scene || "observe") as KodexAsciiSceneName;
  const renderer = new AsciiRenderer(canvas, {
    scene: SCENES[initialScene],
    glyphSet: root.dataset.glyphs || "kodex",
    profile: matchMedia("(max-width: 700px)").matches ? "balanced" : "full",
  });

  root.querySelectorAll<HTMLElement>("[data-kdx-set-scene]").forEach(button => {
    button.addEventListener("click", () => {
      const name = button.dataset.kdxSetScene as KodexAsciiSceneName;
      if (!SCENES[name]) return;
      renderer.setScene(SCENES[name]);
      renderer.randomize();
      root.dataset.scene = name;
    });
  });

  root.querySelector<HTMLElement>("[data-kdx-randomize]")?.addEventListener("click", () => renderer.randomize());
  renderer.start();

  return () => renderer.destroy();
}
