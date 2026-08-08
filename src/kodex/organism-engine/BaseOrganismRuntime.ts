import type {
  OrganismFrame,
  OrganismInput,
  OrganismLifecycle,
  OrganismMetrics,
  OrganismMotion,
  OrganismPreset,
  OrganismQuality,
  OrganismRuntime,
} from "./types";
import { QualityGovernor, guessTierFromPreset } from "../../lib/kodex/quality";

const createEmptyInput = (): OrganismInput => ({
  pointer: { x: 0, y: 0, active: false },
  primaryAction: 0,
  secondaryAction: 0,
  navigationAxis: { x: 0, y: 0 },
  audio: { low: 0, mid: 0, high: 0, active: false },
});

export abstract class BaseOrganismRuntime implements OrganismRuntime {
  readonly preset: OrganismPreset;

  protected readonly canvas: HTMLCanvasElement;
  protected input: OrganismInput = createEmptyInput();
  protected lifecycle: OrganismLifecycle = "DORMANT";
  protected quality: OrganismQuality;
  protected motion: OrganismMotion = "FULL";

  private raf = 0;
  private running = false;
  private startedAt = 0;
  private previousRenderedAt = 0;
  private frameCount = 0;
  private accumulatedFrameMs = 0;
  private droppedFrameEstimate = 0;

  /**
   * MP-11. Hasta acá esta clase juntaba `averageFrameMs` y
   * `droppedFrameEstimate`, los exponía en `getMetrics()` y no hacía nada con
   * ellos: la calidad la fijaba una sola vez el ancho del viewport, en el
   * constructor, y no se movía nunca más. Se medía de verdad y se decidía por
   * adivinanza.
   *
   * Ahora el preset sigue dando la adivinanza de arranque -- eso está bien,
   * hay que empezar en algo -- pero el gobernador compartido toma el control
   * apenas hay muestras suficientes.
   */
  protected readonly qualityGovernor: QualityGovernor;

  protected constructor(canvas: HTMLCanvasElement, preset: OrganismPreset) {
    this.canvas = canvas;
    this.preset = preset;
    this.quality = guessTierFromPreset(preset.performance, matchMedia("(max-width: 767px)").matches);
    this.qualityGovernor = new QualityGovernor({
      initialTier: this.quality,
      // El bucle se estrangula al `targetFps` del preset: un organismo a 30 fps
      // gasta ~33 ms por cuadro por diseño, no por lentitud. Los umbrales se
      // comparan contra SU presupuesto, no contra 60 fps.
      targetFrameMs: 1000 / preset.performance.targetFps,
      reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
    });
  }

  abstract load(): Promise<void>;
  abstract mount(): void;
  abstract render(frame: OrganismFrame): void;
  abstract destroyResources(): Promise<void> | void;

  enter(): Promise<void> | void {
    this.setLifecycle("AWARE");
  }

  exit(): Promise<void> | void {
    this.setLifecycle("RETURNING");
    this.stop();
  }

  start(): void {
    if (this.running || this.motion === "OFF" || this.quality === "FALLBACK") return;

    this.running = true;
    this.startedAt ||= performance.now();
    this.previousRenderedAt = performance.now();
    this.raf = requestAnimationFrame(this.tick);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.raf);
    this.raf = 0;
  }

  setInput(next: Partial<OrganismInput>): void {
    this.input = {
      ...this.input,
      ...next,
      pointer: next.pointer ? { ...this.input.pointer, ...next.pointer } : this.input.pointer,
      navigationAxis: next.navigationAxis
        ? { ...this.input.navigationAxis, ...next.navigationAxis }
        : this.input.navigationAxis,
      audio: next.audio ? { ...this.input.audio, ...next.audio } : this.input.audio,
    };
  }

  setLifecycle(state: OrganismLifecycle): void {
    this.lifecycle = state;
  }

  setQuality(level: OrganismQuality): void {
    this.quality = level;
    // El gobernador adopta el nivel venga de donde venga (preset, control de
    // depuración, o él mismo) y reinicia su ventana: los cuadros justo después
    // de un cambio miden la transición, no el nivel nuevo.
    this.qualityGovernor.adopt(level);
    this.onQualityChange(level);

    if (level === "FALLBACK") this.stop();
  }

  setMotion(mode: OrganismMotion): void {
    this.motion = mode;
    // `REDUCED` es una declaración, no una medición: fija el techo de calidad y
    // ninguna lectura buena de tiempo de cuadro lo levanta.
    this.qualityGovernor.setReducedMotion(mode !== "FULL");
    this.onMotionChange(mode);

    // Se aplica en el acto, sin esperar un cuadro: bajo `REDUCED` el bucle se
    // estrangula a 12 fps y podría pasar más de un segundo antes del próximo
    // `tick`. Una declaración de accesibilidad no espera en una cola.
    this.syncQualityFromGovernor();

    if (mode === "OFF") this.stop();
  }

  /** Alinea `quality` con el gobernador si éste cambió de opinión. */
  private syncQualityFromGovernor(): void {
    if (this.qualityGovernor.tier !== this.quality) this.setQuality(this.qualityGovernor.tier);
  }

  getMetrics(): OrganismMetrics {
    return {
      running: this.running,
      family: this.preset.family,
      renderMode: this.preset.renderMode,
      quality: this.quality,
      motion: this.motion,
      lifecycle: this.lifecycle,
      frames: this.frameCount,
      averageFrameMs: this.frameCount ? this.accumulatedFrameMs / this.frameCount : 0,
      droppedFrameEstimate: this.droppedFrameEstimate,
      qualitySource: this.qualityGovernor.read().source,
    };
  }

  async destroy(): Promise<void> {
    this.stop();
    await this.destroyResources();
  }

  protected onQualityChange(_level: OrganismQuality): void {}
  protected onMotionChange(_mode: OrganismMotion): void {}

  private tick = (now: number): void => {
    if (!this.running) return;

    const targetFps = this.motion === "REDUCED"
      ? Math.min(12, this.preset.performance.targetFps)
      : this.preset.performance.targetFps;
    const targetFrameMs = 1000 / targetFps;
    const sinceLastRender = now - this.previousRenderedAt;

    if (sinceLastRender < targetFrameMs * 0.92) {
      this.raf = requestAnimationFrame(this.tick);
      return;
    }

    const frameMs = Math.min(100, sinceLastRender);
    this.previousRenderedAt = now;

    if (frameMs >= targetFrameMs * 1.8) {
      this.droppedFrameEstimate += Math.max(1, Math.round(frameMs / targetFrameMs) - 1);
    }

    this.frameCount += 1;
    this.accumulatedFrameMs += frameMs;

    const renderStartedAt = performance.now();
    this.render({
      now,
      delta: frameMs / 1000,
      elapsed: (now - this.startedAt) / 1000,
      input: this.input,
    });
    const renderMs = performance.now() - renderStartedAt;

    /*
     * Qué se mide, exactamente.
     *
     * `sinceLastRender` solo no sirve: el bucle se estrangula al `targetFps`
     * del preset, así que en un equipo holgado el delta se queda pegado al
     * presupuesto y nunca muestra el margen que sobra -- con eso jamás se
     * podría subir de nivel. Y `renderMs` solo tampoco: no ve el cuadro que
     * llegó tarde por culpa de otra cosa en la página.
     *
     * Entonces: lo que costó dibujar, más lo que el cuadro llegó tarde por
     * encima de su presupuesto. El estrangulador sólo ATRASA hasta el
     * presupuesto, nunca más allá, así que todo exceso sobre `targetFrameMs`
     * es atraso real y no una espera elegida.
     *
     * Es una medición del lado de la CPU: no incluye lo que la GPU siga
     * haciendo después de que `render()` retorne. Es la señal disponible sin
     * extensiones, y se declara como lo que es.
     */
    const overrunMs = Math.max(0, sinceLastRender - targetFrameMs);
    this.qualityGovernor.sample(renderMs + overrunMs);
    this.syncQualityFromGovernor();

    this.raf = requestAnimationFrame(this.tick);
  };
}
