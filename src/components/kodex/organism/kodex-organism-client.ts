import { organismRegistry } from "../../../kodex/organism-engine/registry";
import type {
  OrganismInput,
  OrganismMotion,
  OrganismRuntime,
} from "../../../kodex/organism-engine/types";

type AudioBus = {
  activo?: boolean;
  active?: boolean;
  low?: number;
  mid?: number;
  high?: number;
};

type OrganismElement = HTMLElement & {
  __kdxOrganismController?: OrganismController;
};

const controllers = new Set<OrganismController>();
let activeController: OrganismController | null = null;
let globalEventsMounted = false;

class OrganismController {
  readonly root: OrganismElement;

  private runtime: OrganismRuntime | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private observer: IntersectionObserver | null = null;
  private visible = false;
  private destroyed = false;
  private inputRaf = 0;
  private localEventsBound = false;
  private motion: OrganismMotion = matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "REDUCED"
    : "FULL";

  constructor(root: OrganismElement) {
    this.root = root;
    root.__kdxOrganismController = this;
    controllers.add(this);
  }

  async mount(): Promise<void> {
    const canvas = this.root.querySelector<HTMLCanvasElement>("[data-kdx-organism-canvas]");
    const presetId = this.root.dataset.preset;

    if (!canvas || !presetId) {
      throw new Error("KODEX organism requires a canvas and data-preset.");
    }

    this.canvas = canvas;
    const hasWebGL2 = Boolean(document.createElement("canvas").getContext("webgl2"));

    if (!hasWebGL2) {
      this.useFallback("WEBGL2 UNAVAILABLE");
      return;
    }

    this.runtime = organismRegistry.create(canvas, presetId);
    this.runtime.setMotion(this.motion);

    canvas.addEventListener("webglcontextlost", this.onContextLost, false);
    canvas.addEventListener("webglcontextrestored", this.onContextRestored, false);

    await this.runtime.load();
    if (this.destroyed) return;

    this.runtime.mount();
    this.runtime.enter();
    this.root.dataset.kdxOrganismState = "ready";
    this.setStatus(`${presetId} READY`);

    this.observe();
    this.bindLocalEvents();
  }

  activate(): void {
    if (!this.runtime || this.destroyed || !this.visible || document.hidden) return;

    if (activeController && activeController !== this) {
      activeController.deactivate();
    }

    activeController = this;
    this.runtime.setLifecycle("AWARE");
    this.runtime.start();
    this.feedInput();
  }

  deactivate(): void {
    cancelAnimationFrame(this.inputRaf);
    this.inputRaf = 0;
    this.runtime?.stop();
    if (activeController === this) activeController = null;
  }

  resumeIfVisible(): void {
    if (this.visible) this.activate();
  }

  commitPrimaryAction(): void {
    if (!this.runtime) return;
    this.runtime.setLifecycle("ENGAGED");
    this.runtime.setInput({ primaryAction: 1 });
    this.root.dispatchEvent(
      new CustomEvent("kodex:organism-action", {
        bubbles: true,
        detail: {
          presetId: this.runtime.preset.id,
          family: this.runtime.preset.family,
          action: this.runtime.preset.interaction.primaryAction,
          memoryWrites: this.runtime.preset.memory.writes,
        },
      }),
    );

    requestAnimationFrame(() => {
      this.runtime?.setInput({ primaryAction: 0 });
      this.runtime?.setLifecycle("OPEN");
    });
  }

  setMotion(mode: OrganismMotion): void {
    this.motion = mode;
    this.runtime?.setMotion(mode);
    if (mode === "OFF") this.deactivate();
    else this.resumeIfVisible();
  }

  debug(): Record<string, unknown> {
    return {
      preset: this.root.dataset.preset,
      visible: this.visible,
      motion: this.motion,
      state: this.root.dataset.kdxOrganismState,
      metrics: this.runtime?.getMetrics() ?? null,
    };
  }

  async destroy(): Promise<void> {
    if (this.destroyed) return;
    this.destroyed = true;
    this.deactivate();
    this.observer?.disconnect();
    this.observer = null;
    this.unbindLocalEvents();
    if (this.canvas) {
      this.canvas.removeEventListener("webglcontextlost", this.onContextLost, false);
      this.canvas.removeEventListener("webglcontextrestored", this.onContextRestored, false);
    }
    await this.runtime?.destroy();
    this.runtime = null;
    this.canvas = null;
    controllers.delete(this);
    delete this.root.__kdxOrganismController;
  }

  private observe(): void {
    this.observer = new IntersectionObserver(
      (entries) => {
        const nextVisible = entries.some((entry) => entry.isIntersecting);
        if (nextVisible === this.visible) return;
        this.visible = nextVisible;
        if (nextVisible) this.activate();
        else this.deactivate();
      },
      { rootMargin: "120px", threshold: 0.01 },
    );
    this.observer.observe(this.root);
  }

  private bindLocalEvents(): void {
    if (this.localEventsBound) return;
    this.localEventsBound = true;
    this.root.addEventListener("pointerenter", this.onPointerEnter);
    this.root.addEventListener("click", this.onClick);
    this.root.addEventListener("keydown", this.onKeyDown);
  }

  private unbindLocalEvents(): void {
    if (!this.localEventsBound) return;
    this.localEventsBound = false;
    this.root.removeEventListener("pointerenter", this.onPointerEnter);
    this.root.removeEventListener("click", this.onClick);
    this.root.removeEventListener("keydown", this.onKeyDown);
  }

  private onPointerEnter = (): void => {
    this.runtime?.setLifecycle("AWARE");
    this.resumeIfVisible();
  };

  private onClick = (): void => {
    this.commitPrimaryAction();
  };

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    this.commitPrimaryAction();
  };

  private feedInput(): void {
    cancelAnimationFrame(this.inputRaf);

    const step = () => {
      if (!this.runtime || activeController !== this || this.destroyed) return;
      this.runtime.setInput(readGlobalInput());
      this.inputRaf = requestAnimationFrame(step);
    };

    this.inputRaf = requestAnimationFrame(step);
  }

  private useFallback(reason: string): void {
    this.root.dataset.kdxOrganismState = "fallback";
    this.setStatus(reason);
  }

  private fail(error: unknown): void {
    this.root.dataset.kdxOrganismState = "error";
    this.setStatus(error instanceof Error ? error.message : "ORGANISM ERROR");
    console.warn("[kodex-organism]", error);
  }

  private setStatus(message: string): void {
    const status = this.root.querySelector<HTMLElement>("[data-kdx-organism-status]");
    if (status) status.textContent = message;
  }

  private onContextLost = (event: Event): void => {
    event.preventDefault();
    this.deactivate();
    this.useFallback("WEBGL CONTEXT LOST");
  };

  private onContextRestored = (): void => {
    this.destroy().finally(() => mountAll());
  };

  static async create(root: OrganismElement): Promise<OrganismController> {
    const controller = new OrganismController(root);
    try {
      await controller.mount();
    } catch (error) {
      controller.fail(error);
    }
    return controller;
  }
}

const globalPointer = { x: 0, y: 0, active: false };
const globalNavigation = { x: 0, y: 0 };

function readGlobalInput(): Partial<OrganismInput> {
  const audio = (window as typeof window & { __kxAudio?: AudioBus }).__kxAudio;
  return {
    pointer: { ...globalPointer },
    navigationAxis: { ...globalNavigation },
    audio: {
      active: Boolean(audio?.activo ?? audio?.active),
      low: clamp01(audio?.low ?? 0),
      mid: clamp01(audio?.mid ?? 0),
      high: clamp01(audio?.high ?? 0),
    },
  };
}

function mountGlobalEvents(): void {
  if (globalEventsMounted) return;
  globalEventsMounted = true;

  addEventListener(
    "pointermove",
    (event) => {
      globalPointer.x = (event.clientX / innerWidth) * 2 - 1;
      globalPointer.y = -((event.clientY / innerHeight) * 2 - 1);
      globalPointer.active = true;
    },
    { passive: true },
  );

  addEventListener("pointerleave", () => {
    globalPointer.active = false;
  });

  addEventListener("keydown", (event) => {
    globalNavigation.x = Number(event.key === "ArrowRight") - Number(event.key === "ArrowLeft");
    globalNavigation.y = Number(event.key === "ArrowDown") - Number(event.key === "ArrowUp");
  });

  addEventListener("keyup", () => {
    globalNavigation.x = 0;
    globalNavigation.y = 0;
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      controllers.forEach((controller) => controller.deactivate());
      return;
    }
    controllers.forEach((controller) => controller.resumeIfVisible());
  });

  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const syncMotion = () => {
    const mode: OrganismMotion = motionQuery.matches ? "REDUCED" : "FULL";
    controllers.forEach((controller) => controller.setMotion(mode));
  };
  motionQuery.addEventListener?.("change", syncMotion);

  (window as typeof window & { __kdxOrganisms?: unknown }).__kdxOrganisms = {
    list: () => [...controllers].map((controller) => controller.debug()),
    setMotion: (mode: OrganismMotion) => controllers.forEach((controller) => controller.setMotion(mode)),
    stop: () => controllers.forEach((controller) => controller.deactivate()),
  };
}

function mountAll(): void {
  mountGlobalEvents();
  for (const root of document.querySelectorAll<OrganismElement>("[data-kdx-organism]")) {
    if (root.__kdxOrganismController) continue;
    void OrganismController.create(root);
  }
}

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAll, { once: true });
} else {
  mountAll();
}

document.addEventListener("astro:page-load", mountAll);
document.addEventListener("astro:before-swap", () => {
  for (const controller of [...controllers]) void controller.destroy();
});
