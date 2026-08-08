import {
  createKodexInteractionEvent,
} from "../../../lib/kodex/runtime/interaction-events";
import { mountKodexJourneyMemoryBridge } from "../../../lib/kodex/runtime/journey-memory-bridge";

const SELECTOR = "[data-kdx-helix-passage]";
const RUNG_COUNT = 9;

const vertexShader = `#version 300 es
in vec2 p;
void main() {
  gl_Position = vec4(p, 0.0, 1.0);
}`;

const fragmentShader = `#version 300 es
precision highp float;
out vec4 outColor;
uniform vec2 u_res;
uniform float u_time;
uniform float u_orbit;
uniform float u_traverse;
uniform float u_selected;
uniform float u_motion;

float lineGlow(float d, float width) {
  return exp(-max(d - width, 0.0) * 95.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / max(u_res, vec2(1.0));
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_res.x / max(u_res.y, 1.0);

  float time = u_time * u_motion;
  float phase = p.y * 11.2 + u_traverse * 5.5 + u_orbit + time * 0.24;
  float depthA = cos(phase);
  float depthB = cos(phase + 3.14159265);
  float radiusA = 0.31 * (0.83 + (depthA + 1.0) * 0.085);
  float radiusB = 0.31 * (0.83 + (depthB + 1.0) * 0.085);
  float xA = sin(phase) * radiusA;
  float xB = sin(phase + 3.14159265) * radiusB;

  float bio = lineGlow(abs(p.x - xA), 0.006 + 0.006 * max(depthA, 0.0));
  float symbolicRaw = lineGlow(abs(p.x - xB), 0.004 + 0.005 * max(depthB, 0.0));
  float dash = smoothstep(0.12, 0.28, sin((p.y + 1.0) * 72.0 + time * 0.6) * 0.5 + 0.5);
  float symbolic = symbolicRaw * (0.28 + 0.72 * dash);

  float rungIndex = floor((p.y + 1.0) * 4.5);
  float rungCenter = (rungIndex + 0.5) / 4.5 - 1.0;
  float rungY = abs(p.y - rungCenter);
  float left = min(xA, xB);
  float right = max(xA, xB);
  float between = smoothstep(left - 0.02, left + 0.02, p.x) * (1.0 - smoothstep(right - 0.02, right + 0.02, p.x));
  float rung = exp(-rungY * 150.0) * between * 0.42;

  float selectedIndex = clamp(floor(u_selected * 8.0 + 0.5), 0.0, 8.0);
  float selectedY = ((8.0 - selectedIndex) + 0.5) / 4.5 - 1.0;
  float selectedBand = exp(-abs(p.y - selectedY) * 42.0);
  float focusRing = exp(-abs(length(vec2(p.x * 0.82, p.y - selectedY)) - 0.39) * 70.0) * 0.34;

  float gridX = exp(-abs(fract((p.x + 1.4) * 8.0) - 0.5) * 65.0) * 0.025;
  float gridY = exp(-abs(fract((p.y + 1.0) * 12.0) - 0.5) * 65.0) * 0.025;
  float axis = exp(-abs(p.x) * 90.0) * 0.08;
  float vignette = smoothstep(1.25, 0.25, length(vec2(p.x * 0.65, p.y * 0.7)));

  vec3 bioColor = vec3(0.36, 0.82, 1.0);
  vec3 symbolicColor = vec3(0.57, 0.34, 1.0);
  vec3 bone = vec3(0.92, 0.90, 0.95);
  vec3 color = vec3(0.006, 0.006, 0.016);
  color += (gridX + gridY + axis) * vec3(0.22, 0.20, 0.34);
  color += bio * bioColor * (0.55 + 0.55 * max(depthA, 0.0));
  color += symbolic * symbolicColor * (0.52 + 0.6 * max(depthB, 0.0));
  color += rung * bone;
  color += selectedBand * 0.055 * mix(bioColor, symbolicColor, 0.5);
  color += focusRing * bone;
  color *= 0.38 + 0.78 * vignette;

  outColor = vec4(color, 1.0);
}`;

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create DNA Passage shader.");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) || "DNA Passage shader compile failed.";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

function createProgram(gl: WebGL2RenderingContext): WebGLProgram {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexShader);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
  const program = gl.createProgram();
  if (!program) throw new Error("Unable to create DNA Passage program.");
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.bindAttribLocation(program, 0, "p");
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) || "DNA Passage program link failed.";
    gl.deleteProgram(program);
    throw new Error(message);
  }
  return program;
}

function init(root: HTMLElement): void {
  if (root.dataset.helixMounted === "true") return;
  root.dataset.helixMounted = "true";
  mountKodexJourneyMemoryBridge();

  const canvas = root.querySelector<HTMLCanvasElement>("[data-helix-canvas]");
  const live = root.querySelector<HTMLElement>("[data-helix-live]");
  const selectedLabel = root.querySelector<HTMLElement>("[data-helix-selected]");
  const rendererLabel = root.querySelector<HTMLElement>("[data-helix-renderer]");
  const rungButtons = [...root.querySelectorAll<HTMLButtonElement>("[data-helix-rung]")];
  if (!canvas || !rungButtons.length) return;

  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let selected = 0;
  let locked = -1;
  let orbit = 0;
  let traverse = 0;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let raf = 0;
  let destroyed = false;
  let visible = true;
  let startedAt = performance.now();
  let gl: WebGL2RenderingContext | null = null;
  let program: WebGLProgram | null = null;
  let buffer: WebGLBuffer | null = null;

  const setSelected = (next: number, focus = false) => {
    selected = (next + RUNG_COUNT) % RUNG_COUNT;
    rungButtons.forEach((button, index) => {
      button.setAttribute("aria-pressed", String(index === selected));
      button.dataset.selected = String(index === selected);
    });
    if (selectedLabel) selectedLabel.textContent = `RUNG ${String(selected + 1).padStart(2, "0")}`;
    if (live) {
      live.textContent = `Rung ${selected + 1} selected. Biological reference: generic double-helix geometry. KODEX symbolic: lineage, memory and ascent are symbolic only.`;
    }
    if (focus) rungButtons[selected]?.focus();
    renderOnce();
  };

  const commitSelected = () => {
    locked = selected;
    root.dataset.lockedRung = String(locked + 1);
    if (live) {
      live.textContent = `Rung ${locked + 1} committed. Biological reference is a generic double-helix form, not genetic data. KODEX lineage, memory and ascent are symbolic.`;
    }
    root.dispatchEvent(createKodexInteractionEvent({
      interactionId: `dna-passage-rung-${locked + 1}`,
      nodeId: "KDX-NODE-DNA-ASCENT",
      role: "TRACE",
      semanticTarget: "kodex-dna-passage-traversed",
      stateBefore: `rung:${locked + 1}:selected`,
      stateAfter: `rung:${locked + 1}:locked`,
      writesToMemory: true,
      sourceIds: ["kodex-node-dna-ascent"],
      claimIds: [],
    }));
    renderOnce();
  };

  const useFallback = (reason: string) => {
    root.dataset.mode = "fallback";
    root.dataset.ready = "false";
    if (rendererLabel) rendererLabel.textContent = `FALLBACK / ${reason}`;
  };

  try {
    gl = canvas.getContext("webgl2", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    });
    if (!gl) throw new Error("WEBGL2 UNAVAILABLE");
    program = createProgram(gl);
    buffer = gl.createBuffer();
    if (!buffer) throw new Error("BUFFER UNAVAILABLE");
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    root.dataset.ready = "true";
    root.dataset.mode = "webgl";
    if (rendererLabel) rendererLabel.textContent = "WEBGL / SYMBOLIC_ONLY";
  } catch (error) {
    console.warn("[kdx-helix-passage]", error);
    useFallback(error instanceof Error ? error.message : "UNAVAILABLE");
  }

  const resize = () => {
    if (!gl) return;
    const rect = canvas.getBoundingClientRect();
    const mobile = rect.width < 700;
    const dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1 : 1.5);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    renderOnce();
  };

  function renderOnce(now = performance.now()): void {
    if (!gl || !program || destroyed) return;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    const set1 = (name: string, value: number) => {
      const location = gl?.getUniformLocation(program!, name);
      if (location) gl?.uniform1f(location, value);
    };
    const res = gl.getUniformLocation(program, "u_res");
    if (res) gl.uniform2f(res, canvas.width, canvas.height);
    set1("u_time", (now - startedAt) / 1000);
    set1("u_orbit", orbit);
    set1("u_traverse", traverse);
    set1("u_selected", selected / Math.max(1, RUNG_COUNT - 1));
    set1("u_motion", reducedQuery.matches ? 0 : 1);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  const frame = (now: number) => {
    if (destroyed || !gl || !visible || document.hidden || reducedQuery.matches) {
      raf = 0;
      return;
    }
    renderOnce(now);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (destroyed || !gl || reducedQuery.matches || !visible || document.hidden || raf) {
      renderOnce();
      return;
    }
    startedAt = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const onPointerDown = (event: PointerEvent) => {
    dragging = true;
    lastX = event.clientX;
    lastY = event.clientY;
    root.setPointerCapture?.(event.pointerId);
  };

  const onPointerMove = (event: PointerEvent) => {
    if (!dragging || reducedQuery.matches) return;
    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    orbit += dx * 0.008;
    traverse = clamp(traverse - dy * 0.006, -1.8, 1.8);
    renderOnce();
  };

  const onPointerUp = (event: PointerEvent) => {
    dragging = false;
    root.releasePointerCapture?.(event.pointerId);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      setSelected(selected + 1, true);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      setSelected(selected - 1, true);
      return;
    }
    if ((event.key === "Enter" || event.key === " ") && !(event.target instanceof HTMLButtonElement)) {
      event.preventDefault();
      commitSelected();
    }
  };

  rungButtons.forEach((button, index) => {
    button.addEventListener("focus", () => setSelected(index));
    button.addEventListener("click", () => {
      setSelected(index);
      commitSelected();
    });
  });

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);
  const intersectionObserver = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? true;
    if (visible) start();
    else stop();
  }, { rootMargin: "120px", threshold: 0.01 });
  intersectionObserver.observe(root);

  const onVisibility = () => document.hidden ? stop() : start();
  const onMotion = () => {
    if (reducedQuery.matches) stop();
    else start();
    renderOnce();
  };
  const onContextLost = (event: Event) => {
    event.preventDefault();
    stop();
    gl = null;
    useFallback("CONTEXT LOST");
  };

  root.addEventListener("pointerdown", onPointerDown);
  root.addEventListener("pointermove", onPointerMove, { passive: true });
  root.addEventListener("pointerup", onPointerUp);
  root.addEventListener("pointercancel", onPointerUp);
  root.addEventListener("keydown", onKeyDown);
  canvas.addEventListener("webglcontextlost", onContextLost, false);
  document.addEventListener("visibilitychange", onVisibility);
  reducedQuery.addEventListener("change", onMotion);

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    stop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    root.removeEventListener("pointerdown", onPointerDown);
    root.removeEventListener("pointermove", onPointerMove);
    root.removeEventListener("pointerup", onPointerUp);
    root.removeEventListener("pointercancel", onPointerUp);
    root.removeEventListener("keydown", onKeyDown);
    canvas.removeEventListener("webglcontextlost", onContextLost, false);
    document.removeEventListener("visibilitychange", onVisibility);
    reducedQuery.removeEventListener("change", onMotion);
    if (gl && buffer) gl.deleteBuffer(buffer);
    if (gl && program) gl.deleteProgram(program);
    buffer = null;
    program = null;
    gl = null;
    root.dataset.helixMounted = "false";
    document.removeEventListener("astro:before-swap", destroy);
  };

  document.addEventListener("astro:before-swap", destroy, { once: true });
  setSelected(0);
  resize();
  start();
}

function boot(): void {
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(init);
}

boot();
document.addEventListener("astro:page-load", boot);
