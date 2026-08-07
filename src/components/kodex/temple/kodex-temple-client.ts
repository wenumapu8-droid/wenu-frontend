import type {
  KodexTempleRecipe,
  KodexTempleState,
  KodexTempleStateProfile,
} from "../../../kodex/temple/types";

type TempleElement = HTMLElement & {
  __kdxTempleController?: TempleController;
};

type TempleMemoryDetail = {
  coordinateInstance?: string;
  mVisited?: boolean;
  resonant?: boolean;
  state?: KodexTempleState;
};

const controllers = new Set<TempleController>();
let globalEventsMounted = false;

class TempleController {
  readonly root: TempleElement;
  readonly recipe: KodexTempleRecipe;

  private state: KodexTempleState = "DORMANT";
  private motionOff = false;
  private pointerRaf = 0;
  private targetPointer = { x: 0, y: 0 };
  private pointer = { x: 0, y: 0 };
  private cleanup: Array<() => void> = [];

  constructor(root: TempleElement, recipe: KodexTempleRecipe) {
    this.root = root;
    this.recipe = recipe;
    root.__kdxTempleController = this;
    controllers.add(this);
  }

  mount(): void {
    this.setState("DORMANT", false);
    this.bindActions();
    this.bindPointer();
    this.bindOrganismEvents();
    this.bindMemoryEvents();
    this.bindDebugControls();
    this.startPointerLoop();
  }

  setState(next: KodexTempleState, emit = true): void {
    const profile = this.recipe.stateProfiles[next];
    if (!profile) throw new Error(`Unknown KODEX temple state: ${next}`);

    const previous = this.state;
    this.state = next;
    this.root.dataset.templeState = next;
    this.applyProfile(profile);
    this.syncLabels(profile);

    if (emit && previous !== next) {
      this.root.dispatchEvent(
        new CustomEvent("kodex:temple-state-change", {
          bubbles: true,
          detail: {
            templeId: this.recipe.id,
            nodeCoordinate: this.recipe.nodeCoordinate,
            previous,
            state: next,
          },
        }),
      );
    }
  }

  getState(): KodexTempleState {
    return this.state;
  }

  debug(): Record<string, unknown> {
    return {
      templeId: this.recipe.id,
      coordinate: this.recipe.nodeCoordinate,
      state: this.state,
      motionOff: this.motionOff,
      organismPreset: this.recipe.organismPreset,
      provenance: this.recipe.provenance,
    };
  }

  destroy(): void {
    cancelAnimationFrame(this.pointerRaf);
    this.pointerRaf = 0;
    for (const fn of this.cleanup.splice(0)) fn();
    controllers.delete(this);
    delete this.root.__kdxTempleController;
  }

  private applyProfile(profile: KodexTempleStateProfile): void {
    this.root.style.setProperty("--kdx-architecture-energy", String(profile.architectureEnergy));
    this.root.style.setProperty("--kdx-candle-energy", String(profile.candleEnergy));
    this.root.style.setProperty("--kdx-spectral-energy", String(profile.spectralEnergy));
    this.root.style.setProperty("--kdx-depth", String(profile.depth));
    this.root.style.setProperty("--kdx-organism-scale", String(profile.organismScale));
    this.root.style.setProperty("--kdx-memory-visibility", String(profile.memoryVisibility));
  }

  private syncLabels(profile: KodexTempleStateProfile): void {
    for (const label of this.root.querySelectorAll<HTMLElement>("[data-kdx-temple-state-label]")) {
      label.textContent = profile.state;
    }

    const description = this.root.querySelector<HTMLElement>("[data-kdx-temple-description]");
    if (description) description.textContent = profile.description;

    const memory = this.root.querySelector<HTMLElement>("[data-kdx-temple-memory-label]");
    if (memory) {
      memory.textContent =
        profile.memoryVisibility >= 0.8
          ? "INSCRIBED"
          : profile.memoryVisibility >= 0.3
            ? "VISIBLE"
            : "LATENT";
    }
  }

  private bindActions(): void {
    for (const button of this.root.querySelectorAll<HTMLButtonElement>("[data-kdx-temple-action]")) {
      const onClick = () => {
        const id = button.dataset.kdxTempleAction;
        const nextState = button.dataset.nextState as KodexTempleState | undefined;
        const eventName = button.dataset.emits;
        const definition = this.recipe.actions.find((action) => action.id === id);

        if (nextState) this.setState(nextState);

        this.root.dispatchEvent(
          new CustomEvent(eventName || "kodex:temple-action", {
            bubbles: true,
            detail: {
              templeId: this.recipe.id,
              nodeCoordinate: this.recipe.nodeCoordinate,
              action: id,
              state: this.state,
              description: definition?.description ?? "",
            },
          }),
        );
      };
      button.addEventListener("click", onClick);
      this.cleanup.push(() => button.removeEventListener("click", onClick));
    }
  }

  private bindPointer(): void {
    const onPointerMove = (event: PointerEvent) => {
      if (this.motionOff) return;
      const rect = this.root.getBoundingClientRect();
      this.targetPointer.x = clamp(((event.clientX - rect.left) / rect.width) * 2 - 1, -1, 1);
      this.targetPointer.y = clamp(((event.clientY - rect.top) / rect.height) * 2 - 1, -1, 1);
      if (this.state === "DORMANT") this.setState("AWARE");
    };

    const onPointerLeave = () => {
      this.targetPointer.x = 0;
      this.targetPointer.y = 0;
    };

    this.root.addEventListener("pointermove", onPointerMove, { passive: true });
    this.root.addEventListener("pointerleave", onPointerLeave, { passive: true });
    this.cleanup.push(() => this.root.removeEventListener("pointermove", onPointerMove));
    this.cleanup.push(() => this.root.removeEventListener("pointerleave", onPointerLeave));
  }

  private bindOrganismEvents(): void {
    const onOrganismAction = (event: Event) => {
      const custom = event as CustomEvent<{ presetId?: string }>;
      if (custom.detail?.presetId !== this.recipe.organismPreset) return;
      if (this.state === "DORMANT" || this.state === "AWARE") this.setState("ACTIVE");
    };

    this.root.addEventListener("kodex:organism-action", onOrganismAction);
    this.cleanup.push(() => this.root.removeEventListener("kodex:organism-action", onOrganismAction));
  }

  private bindMemoryEvents(): void {
    const onMemory = (event: Event) => {
      const detail = (event as CustomEvent<TempleMemoryDetail>).detail ?? {};

      if (detail.state) {
        this.setState(detail.state);
        return;
      }

      if (detail.resonant || detail.mVisited) {
        this.setState("RESONANT");
        return;
      }

      if (detail.coordinateInstance?.endsWith("′")) {
        this.setState("MUTATED");
      }
    };

    this.root.addEventListener("kodex:temple-memory", onMemory);
    this.cleanup.push(() => this.root.removeEventListener("kodex:temple-memory", onMemory));
  }

  private bindDebugControls(): void {
    const motion = this.root.querySelector<HTMLButtonElement>("[data-kdx-temple-toggle-motion]");
    const reset = this.root.querySelector<HTMLButtonElement>("[data-kdx-temple-reset]");

    if (motion) {
      const onMotion = () => {
        this.motionOff = !this.motionOff;
        this.root.dataset.motion = this.motionOff ? "OFF" : "FULL";
        if (this.motionOff) {
          this.targetPointer = { x: 0, y: 0 };
          this.pointer = { x: 0, y: 0 };
          this.syncPointerVariables();
        }
      };
      motion.addEventListener("click", onMotion);
      this.cleanup.push(() => motion.removeEventListener("click", onMotion));
    }

    if (reset) {
      const onReset = () => this.setState("DORMANT");
      reset.addEventListener("click", onReset);
      this.cleanup.push(() => reset.removeEventListener("click", onReset));
    }
  }

  private startPointerLoop(): void {
    cancelAnimationFrame(this.pointerRaf);

    const step = () => {
      this.pointer.x += (this.targetPointer.x - this.pointer.x) * 0.055;
      this.pointer.y += (this.targetPointer.y - this.pointer.y) * 0.055;
      this.syncPointerVariables();
      this.pointerRaf = requestAnimationFrame(step);
    };

    this.pointerRaf = requestAnimationFrame(step);
  }

  private syncPointerVariables(): void {
    this.root.style.setProperty("--parallax-x", this.pointer.x.toFixed(4));
    this.root.style.setProperty("--parallax-y", this.pointer.y.toFixed(4));
  }
}

function parseRecipe(root: TempleElement): KodexTempleRecipe {
  const script = root.querySelector<HTMLScriptElement>("[data-kdx-temple-recipe]");
  if (!script?.textContent) throw new Error("KODEX temple requires an embedded recipe.");
  return JSON.parse(script.textContent) as KodexTempleRecipe;
}

function mountAll(): void {
  mountGlobalEvents();
  for (const root of document.querySelectorAll<TempleElement>("[data-kdx-temple]")) {
    if (root.__kdxTempleController) continue;
    try {
      const controller = new TempleController(root, parseRecipe(root));
      controller.mount();
    } catch (error) {
      root.dataset.templeState = "DORMANT";
      console.warn("[kodex-temple]", error);
    }
  }
}

function mountGlobalEvents(): void {
  if (globalEventsMounted) return;
  globalEventsMounted = true;

  const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
  const syncReducedMotion = () => {
    for (const controller of controllers) {
      controller.root.dataset.motion = motionQuery.matches ? "OFF" : "FULL";
    }
  };
  motionQuery.addEventListener?.("change", syncReducedMotion);

  (window as typeof window & { __kdxTemple?: unknown }).__kdxTemple = {
    list: () => [...controllers].map((controller) => controller.debug()),
    setState: (state: KodexTempleState) =>
      controllers.forEach((controller) => controller.setState(state)),
    emitMemory: (detail: TempleMemoryDetail) =>
      controllers.forEach((controller) =>
        controller.root.dispatchEvent(
          new CustomEvent("kodex:temple-memory", { bubbles: true, detail }),
        ),
      ),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mountAll, { once: true });
} else {
  mountAll();
}

document.addEventListener("astro:page-load", mountAll);
document.addEventListener("astro:before-swap", () => {
  for (const controller of [...controllers]) controller.destroy();
});
