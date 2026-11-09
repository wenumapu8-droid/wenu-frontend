import { observeScene } from "./observe.js";
import { descentScene } from "./descent.js";
import { cosmologyScene } from "./cosmology.js";
import { signalScene } from "./signal.js";

export const SCENES = Object.freeze({
  observe: observeScene,
  descent: descentScene,
  cosmology: cosmologyScene,
  signal: signalScene,
});

export const SCENE_ORDER = ["observe", "descent", "cosmology", "signal"];
