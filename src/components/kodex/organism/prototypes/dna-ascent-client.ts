type Particle = {
  seed: number;
  radius: number;
  phase: number;
  speed: number;
  size: number;
  alpha: number;
};

type HelixPoint = {
  x: number;
  y: number;
  z: number;
};

const SELECTOR = "[data-dna-ascent]";

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function makeParticles(count: number): Particle[] {
  let state = 0x39d4a7;
  const random = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 0xffffffff;
  };

  return Array.from({ length: count }, () => ({
    seed: random(),
    radius: lerp(0.12, 0.48, random()),
    phase: random() * Math.PI * 2,
    speed: lerp(0.025, 0.09, random()),
    size: lerp(0.5, 1.8, random()),
    alpha: lerp(0.12, 0.7, random()),
  }));
}

function init(root: HTMLElement): void {
  if (root.dataset.dnaMounted === "true") return;
  root.dataset.dnaMounted = "true";

  const canvas = root.querySelector<HTMLCanvasElement>(".kdx-dna__canvas");
  if (!canvas) return;

  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) return;

  const stateReadout = root.querySelector<HTMLElement>("[data-dna-state]");
  const signalReadout = root.querySelector<HTMLElement>("[data-dna-signal]");
  const motionReadout = root.querySelector<HTMLElement>("[data-dna-motion]");
  const reducedQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  const pointer = { x: 0, y: 0, active: false };
  const particles = makeParticles(window.innerWidth < 700 ? 42 : 76);

  let cssWidth = 1;
  let cssHeight = 1;
  let dpr = 1;
  let raf = 0;
  let startedAt = performance.now();
  let visible = true;
  let engaged = false;
  let destroyed = false;
  let reducedMotion = reducedQuery.matches;

  const updateReadouts = () => {
    const signal = engaged ? 0.88 : 0.42;
    if (stateReadout) stateReadout.textContent = engaged ? "ENGAGED" : "DORMANT";
    if (signalReadout) signalReadout.textContent = signal.toFixed(2);
    if (motionReadout) motionReadout.textContent = reducedMotion ? "REDUCED" : "FULL";
    root.setAttribute("aria-pressed", engaged ? "true" : "false");
  };

  const resize = () => {
    const rect = root.getBoundingClientRect();
    cssWidth = Math.max(1, Math.round(rect.width));
    cssHeight = Math.max(1, Math.round(rect.height));
    const mobile = cssWidth < 700;
    dpr = Math.min(mobile ? 1 : 1.5, window.devicePixelRatio || 1);
    const width = Math.max(1, Math.round(cssWidth * dpr));
    const height = Math.max(1, Math.round(cssHeight * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${cssWidth}px`;
      canvas.style.height = `${cssHeight}px`;
    }

    render(reducedMotion ? 0.7 : (performance.now() - startedAt) / 1000);
  };

  const helixPoint = (
    progress: number,
    phaseOffset: number,
    time: number,
    radius: number,
    centerX: number,
    top: number,
    helixHeight: number,
  ): HelixPoint => {
    const turns = 5.25;
    const phase = progress * Math.PI * 2 * turns + phaseOffset + time;
    const z = Math.cos(phase);
    const perspective = 0.78 + (z + 1) * 0.11;
    const axialBreathe = 1 + Math.sin(progress * Math.PI * 4 + time * 0.32) * 0.035;
    return {
      x: centerX + Math.sin(phase) * radius * perspective * axialBreathe,
      y: top + (1 - progress) * helixHeight,
      z,
    };
  };

  const drawBackground = (time: number, signal: number) => {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#020203";
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    const cx = cssWidth * 0.5 + pointer.x * cssWidth * 0.028;
    const cy = cssHeight * 0.5 + pointer.y * cssHeight * 0.018;
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(cssWidth, cssHeight) * 0.62);
    glow.addColorStop(0, `rgba(72, 48, 126, ${0.2 + signal * 0.08})`);
    glow.addColorStop(0.38, "rgba(20, 14, 34, 0.16)");
    glow.addColorStop(1, "rgba(2, 2, 3, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    ctx.save();
    ctx.globalAlpha = 0.08 + signal * 0.025;
    ctx.strokeStyle = "#9e88ff";
    ctx.lineWidth = 0.7;
    ctx.beginPath();
    ctx.moveTo(cx, cssHeight * 0.05);
    ctx.lineTo(cx, cssHeight * 0.95);
    ctx.stroke();

    const ringPulse = reducedMotion ? 0 : Math.sin(time * 0.55) * 4;
    for (let index = 0; index < 4; index += 1) {
      ctx.beginPath();
      ctx.ellipse(
        cx,
        cy,
        cssWidth * (0.16 + index * 0.07) + ringPulse,
        cssHeight * (0.08 + index * 0.035),
        0,
        0,
        Math.PI * 2,
      );
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawParticles = (time: number, centerX: number, centerY: number, signal: number) => {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const particle of particles) {
      const travel = reducedMotion ? particle.seed : (particle.seed + time * particle.speed) % 1;
      const y = cssHeight * (1.08 - travel * 1.16);
      const angle = particle.phase + time * (reducedMotion ? 0 : 0.08) + travel * Math.PI * 3;
      const radius = Math.min(cssWidth, cssHeight) * particle.radius;
      const x = centerX + Math.sin(angle) * radius * (0.42 + travel * 0.58);
      const distanceFromCenter = Math.abs(y - centerY) / Math.max(1, cssHeight * 0.5);
      const alpha = particle.alpha * (0.18 + signal * 0.42) * (1 - clamp(distanceFromCenter, 0, 0.75));

      ctx.fillStyle = `rgba(184, 205, 255, ${Math.max(0.04, alpha)})`;
      ctx.beginPath();
      ctx.arc(x, y, particle.size * (0.7 + travel * 0.8), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  };

  const drawHelix = (time: number, signal: number) => {
    const centerX = cssWidth * 0.5 + pointer.x * cssWidth * 0.06;
    const centerY = cssHeight * 0.5;
    const helixHeight = cssHeight * 0.84;
    const top = cssHeight * 0.08;
    const radius = Math.min(cssWidth * 0.23, cssHeight * 0.155, 190);
    const samples = cssWidth < 700 ? 74 : 104;
    const phaseSpeed = reducedMotion ? 0 : time * (engaged ? 0.68 : 0.34);
    const pointerPhase = pointer.x * 0.45;

    drawParticles(time, centerX, centerY, signal);

    const strandA: HelixPoint[] = [];
    const strandB: HelixPoint[] = [];
    for (let index = 0; index < samples; index += 1) {
      const progress = index / (samples - 1);
      strandA.push(helixPoint(progress, pointerPhase, phaseSpeed, radius, centerX, top, helixHeight));
      strandB.push(helixPoint(progress, Math.PI + pointerPhase, phaseSpeed, radius, centerX, top, helixHeight));
    }

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (let index = 0; index < samples; index += 6) {
      const a = strandA[index];
      const b = strandB[index];
      if (!a || !b) continue;
      const depth = (a.z + 1) * 0.5;
      ctx.strokeStyle = `rgba(210, 219, 255, ${0.08 + depth * 0.25 + signal * 0.06})`;
      ctx.lineWidth = 0.7 + depth * 0.8;
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }

    const drawStrand = (points: HelixPoint[], colorA: string, colorB: string) => {
      for (let index = 1; index < points.length; index += 1) {
        const previous = points[index - 1];
        const point = points[index];
        const depth = (point.z + 1) * 0.5;
        const alpha = 0.18 + depth * 0.68;
        const lineWidth = 0.8 + depth * (engaged ? 4.4 : 3.2);

        ctx.strokeStyle = depth > 0.5 ? colorA.replace("ALPHA", alpha.toFixed(3)) : colorB.replace("ALPHA", alpha.toFixed(3));
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(previous.x, previous.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    };

    drawStrand(strandA, "rgba(226, 219, 255, ALPHA)", "rgba(94, 104, 255, ALPHA)");
    drawStrand(strandB, "rgba(139, 224, 255, ALPHA)", "rgba(255, 79, 216, ALPHA)");

    const corePulse = reducedMotion ? 1 : 0.82 + Math.sin(time * (engaged ? 2.4 : 1.1)) * 0.18;
    const core = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 1.45);
    core.addColorStop(0, `rgba(244, 240, 255, ${0.07 * corePulse + signal * 0.025})`);
    core.addColorStop(0.5, `rgba(120, 86, 255, ${0.025 + signal * 0.02})`);
    core.addColorStop(1, "rgba(0, 0, 0, 0)");
    ctx.fillStyle = core;
    ctx.fillRect(centerX - radius * 1.5, centerY - radius * 1.5, radius * 3, radius * 3);

    ctx.restore();
  };

  const render = (time: number) => {
    if (destroyed) return;
    const targetSignal = engaged ? 0.88 : 0.42;
    drawBackground(time, targetSignal);
    drawHelix(time, targetSignal);
    root.dataset.ready = "true";
  };

  const frame = (now: number) => {
    if (destroyed || !visible || document.hidden || reducedMotion) {
      raf = 0;
      return;
    }

    render((now - startedAt) / 1000);
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    if (destroyed) return;
    updateReadouts();
    if (reducedMotion) {
      render(0.7);
      return;
    }
    if (!visible || document.hidden || raf) return;
    startedAt = performance.now();
    raf = requestAnimationFrame(frame);
  };

  const stop = () => {
    if (!raf) return;
    cancelAnimationFrame(raf);
    raf = 0;
  };

  const setPointer = (event: PointerEvent) => {
    const rect = root.getBoundingClientRect();
    pointer.x = clamp(((event.clientX - rect.left) / Math.max(1, rect.width)) * 2 - 1, -1, 1);
    pointer.y = clamp(((event.clientY - rect.top) / Math.max(1, rect.height)) * 2 - 1, -1, 1);
    pointer.active = true;
    if (reducedMotion) render(0.7);
  };

  const clearPointer = () => {
    pointer.x = 0;
    pointer.y = 0;
    pointer.active = false;
    if (reducedMotion) render(0.7);
  };

  const toggleEngaged = () => {
    engaged = !engaged;
    updateReadouts();
    if (reducedMotion) render(0.7);
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    toggleEngaged();
  };

  const onVisibilityChange = () => {
    if (document.hidden) stop();
    else start();
  };

  const onReducedMotionChange = (event: MediaQueryListEvent) => {
    reducedMotion = event.matches;
    if (reducedMotion) stop();
    start();
  };

  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(root);

  const intersectionObserver = new IntersectionObserver(
    ([entry]) => {
      visible = entry?.isIntersecting ?? true;
      if (visible) start();
      else stop();
    },
    { rootMargin: "120px", threshold: 0.01 },
  );
  intersectionObserver.observe(root);

  root.addEventListener("pointermove", setPointer, { passive: true });
  root.addEventListener("pointerleave", clearPointer, { passive: true });
  root.addEventListener("click", toggleEngaged);
  root.addEventListener("keydown", onKeyDown);
  document.addEventListener("visibilitychange", onVisibilityChange);
  reducedQuery.addEventListener("change", onReducedMotionChange);

  const destroy = () => {
    if (destroyed) return;
    destroyed = true;
    stop();
    resizeObserver.disconnect();
    intersectionObserver.disconnect();
    root.removeEventListener("pointermove", setPointer);
    root.removeEventListener("pointerleave", clearPointer);
    root.removeEventListener("click", toggleEngaged);
    root.removeEventListener("keydown", onKeyDown);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    reducedQuery.removeEventListener("change", onReducedMotionChange);
    document.removeEventListener("astro:before-swap", destroy);
  };

  document.addEventListener("astro:before-swap", destroy, { once: true });
  updateReadouts();
  resize();
  start();
}

function boot(): void {
  document.querySelectorAll<HTMLElement>(SELECTOR).forEach(init);
}

boot();
document.addEventListener("astro:page-load", boot);
