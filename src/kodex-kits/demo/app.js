const DATA = window.KDX_DATA;
const select = document.querySelector("#sceneSelect");
const stage = document.querySelector("#stage");
const sceneMeta = document.querySelector("#sceneMeta");
const colorCoverage = document.querySelector("#colorCoverage");
const motionStack = document.querySelector("#motionStack");
const qa = document.querySelector("#qa");
const gridToggle = document.querySelector("#gridToggle");
const motionToggle = document.querySelector("#motionToggle");
const mobileToggle = document.querySelector("#mobileToggle");

let motionEnabled = true;

DATA.blueprints.forEach((scene) => {
  const option = document.createElement("option");
  option.value = scene.id;
  option.textContent = `${String(scene.index).padStart(2, "0")} · ${scene.name}`;
  select.append(option);
});

function setTheme(theme) {
  const value = DATA.tokens.color.sceneThemes[theme];
  document.documentElement.style.setProperty("--accent", value.accent);
  document.documentElement.style.setProperty("--accent2", value.accentSecondary);
}

function zoneStyle(zone) {
  return [
    `--x:${zone.desktop[0] * 100}%`,
    `--y:${zone.desktop[1] * 100}%`,
    `--w:${zone.desktop[2] * 100}%`,
    `--h:${zone.desktop[3] * 100}%`,
    `--mx:${zone.mobile[0] * 100}%`,
    `--my:${zone.mobile[1] * 100}%`,
    `--mw:${zone.mobile[2] * 100}%`,
    `--mh:${zone.mobile[3] * 100}%`,
    `--z:${zone.z}`,
  ].join(";");
}

function render(scene) {
  setTheme(scene.theme);
  stage.innerHTML = "";

  scene.zones.forEach((zone) => {
    const element = document.createElement("div");
    element.className = [
      "zone",
      zone.render,
      motionEnabled ? `motion-${zone.motion}` : "",
    ].filter(Boolean).join(" ");
    element.style.cssText = zoneStyle(zone);

    if (zone.role === "display" || zone.id === "headline") {
      element.innerHTML = `
        <div class="zone-inner">
          <span class="zone-id">${zone.id}</span>
          <h2 class="hero-title">${scene.headline}</h2>
        </div>
      `;
    } else if (zone.role === "action") {
      element.innerHTML = `<button class="cta">${scene.primaryCTA}</button>`;
    } else {
      element.innerHTML = `
        <div class="zone-inner">
          <span class="zone-id">${zone.id}</span>
          <span class="zone-role">${zone.role} · ${zone.render}</span>
        </div>
      `;
    }

    stage.append(element);
  });

  sceneMeta.innerHTML = `
    <h2 class="scene-name">${String(scene.index).padStart(2, "0")} · ${scene.name}</h2>
    <div class="meta">
      ${scene.purpose}<br>
      theme: ${scene.theme}<br>
      density: ${scene.grid.density}<br>
      negative space: ${scene.grid.negativeSpacePct}%<br>
      ratio: ${scene.grid.ratio}<br>
      event: ${scene.event}
    </div>
  `;

  const theme = DATA.tokens.color.sceneThemes[scene.theme];
  const coverage = DATA.tokens.color.coverage;
  colorCoverage.innerHTML = [
    ["BACKGROUND", coverage.backgroundMinPct, coverage.backgroundMaxPct, theme.background],
    ["STRUCTURAL NEUTRAL", coverage.structuralNeutralMinPct, coverage.structuralNeutralMaxPct, "#E9EDE8"],
    ["PRIMARY ACCENT", coverage.primaryAccentMinPct, coverage.primaryAccentMaxPct, theme.accent],
    ["SECONDARY ACCENT", coverage.secondaryAccentMinPct, coverage.secondaryAccentMaxPct, theme.accentSecondary],
  ].map(([label, min, max, color]) => `
    <div class="coverage-row">
      <div>
        ${label}
        <div class="coverage-bar">
          <span style="width:${max}%;background:${color}"></span>
        </div>
      </div>
      <strong>${min}–${max}%</strong>
    </div>
  `).join("");

  motionStack.innerHTML = scene.motionStack.map((motion) => `
    <div class="motion-item">
      <strong>${motion.preset}</strong><br>
      target: ${motion.target}<br>
      priority: ${motion.priority}
      ${motion.trigger ? `<br>trigger: ${motion.trigger}` : ""}
    </div>
  `).join("");

  qa.innerHTML = scene.qa.map((item) => `
    <div class="qa-item">□ ${item}</div>
  `).join("");
}

select.addEventListener("change", () => {
  render(DATA.blueprints.find((scene) => scene.id === select.value));
});

gridToggle.addEventListener("click", () => {
  stage.classList.toggle("show-grid");
  gridToggle.classList.toggle("active");
});

motionToggle.addEventListener("click", () => {
  motionEnabled = !motionEnabled;
  stage.classList.toggle("motion-off", !motionEnabled);
  motionToggle.classList.toggle("active");
  render(DATA.blueprints.find((scene) => scene.id === select.value));
});

mobileToggle.addEventListener("click", () => {
  stage.classList.toggle("mobile");
  mobileToggle.classList.toggle("active");
});

select.value = DATA.blueprints[0].id;
render(DATA.blueprints[0]);
