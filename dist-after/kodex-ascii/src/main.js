import { AsciiRenderer } from "./engine/AsciiRenderer.js";
import { SCENES, SCENE_ORDER } from "./scenes/index.js";

const canvas = document.querySelector("#kodex-ascii");
const shell = document.querySelector("[data-kdx-shell]");
const status = document.querySelector("[data-kdx-status]");
const title = document.querySelector("[data-kdx-title]");
const kicker = document.querySelector("[data-kdx-kicker]");
const body = document.querySelector("[data-kdx-body]");
const primary = document.querySelector("[data-kdx-primary]");
const message = document.querySelector("[data-kdx-message]");
const progress = document.querySelector("[data-kdx-progress]");
const checksum = document.querySelector("[data-kdx-checksum]");
const subject = document.querySelector("[data-kdx-subject]");
const coord = document.querySelector("[data-kdx-coord]");
const dialog = document.querySelector("[data-kdx-dialog]");

let currentSceneName = "observe";
let state = "idle";

const renderer = new AsciiRenderer(canvas, {
  scene: SCENES[currentSceneName],
  glyphSet: "kodex",
  profile: matchMedia("(max-width: 700px)").matches ? "balanced" : "full",
});

function makeChecksum() {
  const alphabet = "0123456789ABCDEF";
  let output = "";
  for (let i = 0; i < 8; i += 1) output += alphabet[Math.floor(Math.random() * alphabet.length)];
  return `${output.slice(0, 4)}−${output.slice(4)}`;
}

function updateScene(name) {
  const scene = SCENES[name];
  if (!scene) return;

  currentSceneName = name;
  state = "idle";
  renderer.setScene(scene);
  renderer.randomize();
  shell.dataset.scene = name;
  title.innerHTML = scene.title;
  kicker.textContent = scene.kicker;
  body.textContent = scene.body;
  primary.querySelector("strong").textContent = scene.command;
  message.textContent = scene.message;
  progress.textContent = `${String(scene.index).padStart(2, "0")} / ${String(SCENE_ORDER.length).padStart(2, "0")}`;
  status.textContent = "IDLE";
  checksum.textContent = makeChecksum();
  subject.textContent = `KX−${name.slice(0, 3).toUpperCase()}−00${scene.index}`;
  coord.textContent = `${(18 + Math.random() * 60).toFixed(2)} / −${(60 + Math.random() * 100).toFixed(2)}`;

  document.querySelectorAll("[data-scene]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.scene === name);
  });
}

function activateSignal() {
  state = state === "observing" ? "idle" : "observing";
  shell.dataset.state = state;
  status.textContent = state === "observing" ? "OBSERVING" : "IDLE";
  primary.querySelector("strong").textContent = state === "observing" ? "SIGNAL LOCKED" : SCENES[currentSceneName].command;
  renderer.randomize();
}

primary.addEventListener("click", activateSignal);
document.querySelector("[data-kdx-randomize]").addEventListener("click", () => renderer.randomize());
document.querySelector("[data-kdx-index]").addEventListener("click", () => dialog.showModal());

document.querySelectorAll("[data-scene]").forEach(button => {
  button.addEventListener("click", () => updateScene(button.dataset.scene));
});

document.querySelectorAll("[data-dialog-scene]").forEach(button => {
  button.addEventListener("click", () => updateScene(button.dataset.dialogScene));
});

document.querySelectorAll("[data-glyphs]").forEach(button => {
  button.addEventListener("click", () => {
    renderer.setGlyphSet(button.dataset.glyphs);
    document.querySelectorAll("[data-glyphs]").forEach(item => item.classList.toggle("is-active", item === button));
  });
});

window.addEventListener("keydown", event => {
  if (["1", "2", "3", "4"].includes(event.key)) {
    updateScene(SCENE_ORDER[Number(event.key) - 1]);
  }
  if (event.key.toLowerCase() === "r") renderer.randomize();
  if (event.key === " ") {
    event.preventDefault();
    activateSignal();
  }
});

window.KODEX_ASCII = {
  renderer,
  scenes: SCENES,
  setScene: updateScene,
  setGlyphSet: name => renderer.setGlyphSet(name),
  getMetrics: () => ({ fps: renderer.fps, profile: renderer.profile, scene: currentSceneName, state }),
};

updateScene(currentSceneName);
renderer.start();
