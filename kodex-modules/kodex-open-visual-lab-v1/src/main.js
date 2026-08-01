import { KodexPipeline } from "./runtime/KodexPipeline.js";
import { AudioSignal } from "./runtime/AudioSignal.js";

const canvas = document.querySelector("#kdx-canvas");
const errorPanel = document.querySelector("#error-panel");
const status = document.querySelector("#status");
const sceneSelect = document.querySelector("#scene");
const microphoneButton = document.querySelector("#microphone");

const pipeline = new KodexPipeline(canvas, {
  dprCap: 1.5,
});
const audio = new AudioSignal();

const scenePaths = {
  liquid: "./src/shaders/liquid-acid.frag",
  archive: "./src/shaders/archive-orbit.frag",
  threshold: "./src/shaders/threshold-portal.frag",
  mandelbrot: "./src/shaders/mandelbrot-field.frag",
  bloom: "./src/shaders/signal-bloom.frag",
};

const accentByScene = {
  liquid: "#00EBDD",
  archive: "#FF1744",
  threshold: "#FF1744",
  mandelbrot: "#10E9FF",
  bloom: "#FF0FA8",
};

function showError(error) {
  console.error(error);
  errorPanel.hidden = false;
  errorPanel.textContent = String(error?.stack || error);
  status.textContent = "ERROR";
}

function bindRange(id, parameter, outputId = null) {
  const input = document.querySelector(`#${id}`);
  const output = outputId
    ? document.querySelector(`#${outputId}`)
    : null;

  const update = () => {
    const value = Number(input.value);
    pipeline.setParameter(parameter, value);
    if (output) output.textContent = value.toFixed(2);
  };

  input.addEventListener("input", update);
  update();
}

function bindToggle(id, parameter) {
  const input = document.querySelector(`#${id}`);

  const update = () => {
    pipeline.setParameter(parameter, input.checked ? 1 : 0);
  };

  input.addEventListener("change", update);
  update();
}

async function setScene(name) {
  status.textContent = "COMPILING";
  await pipeline.setScene(scenePaths[name]);
  pipeline.setAccent(accentByScene[name]);
  status.textContent = "SIGNAL LIVE";
  document.documentElement.style.setProperty(
    "--accent",
    accentByScene[name],
  );
}

async function initialize() {
  try {
    await pipeline.initialize(scenePaths.liquid);
    pipeline.setAccent(accentByScene.liquid);

    bindRange("feedback", "feedback", "feedback-value");
    bindRange("intensity", "intensity", "intensity-value");
    bindRange("ascii-cell", "asciiCell", "ascii-cell-value");
    bindRange("grain", "grain", "grain-value");
    bindRange("rgb-split", "rgbSplit", "rgb-split-value");
    bindRange("speed", "speed", "speed-value");

    bindToggle("crt", "crt");
    bindToggle("ascii", "ascii");
    bindToggle("dither", "dither");

    document.querySelector("#quality").addEventListener(
      "change",
      (event) => {
        pipeline.setQuality(event.target.value);
      },
    );

    sceneSelect.addEventListener("change", async () => {
      try {
        await setScene(sceneSelect.value);
      } catch (error) {
        showError(error);
      }
    });

    document.querySelector("#clear").addEventListener(
      "click",
      () => pipeline.clearFeedback(),
    );

    document.querySelector("#screenshot").addEventListener(
      "click",
      () => {
        const link = document.createElement("a");
        link.download = `kodex-${sceneSelect.value}.png`;
        link.href = canvas.toDataURL("image/png");
        link.click();
      },
    );

    microphoneButton.addEventListener("click", async () => {
      try {
        if (audio.enabled) {
          await audio.disable();
          microphoneButton.textContent = "ENABLE MIC";
          microphoneButton.classList.remove("active");
        } else {
          await audio.enableMicrophone();
          microphoneButton.textContent = "DISABLE MIC";
          microphoneButton.classList.add("active");
        }
      } catch (error) {
        showError(error);
      }
    });

    pipeline.start();
    status.textContent = "SIGNAL LIVE";

    const updateAudio = () => {
      const [low, mid, high] = audio.read(
        performance.now() * 0.001,
      );
      pipeline.setAudio(low, mid, high);

      document.querySelector("#audio-low").style.width =
        `${Math.min(100, low * 100)}%`;
      document.querySelector("#audio-mid").style.width =
        `${Math.min(100, mid * 100)}%`;
      document.querySelector("#audio-high").style.width =
        `${Math.min(100, high * 100)}%`;

      requestAnimationFrame(updateAudio);
    };

    updateAudio();
  } catch (error) {
    showError(error);
  }
}

initialize();
