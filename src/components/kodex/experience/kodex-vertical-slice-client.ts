import { VerticalSliceRuntime } from "../../../kodex/experience/VerticalSliceRuntime";
import type { RuntimeSnapshot, SliceCoordinate } from "../../../kodex/experience/types";

const STORAGE_KEY = "kodex:m1:vertical-slice:memory:v0.1.0";

type LabRoot = HTMLElement & { __kdxM1Mounted?: boolean };

function mount(): void {
  const root = document.querySelector<LabRoot>("[data-kdx-m1-lab]");
  if (!root || root.__kdxM1Mounted) return;
  root.__kdxM1Mounted = true;

  let runtime = restoreRuntime();

  const coordinate = required<HTMLElement>(root, "[data-coordinate]");
  const coordinateInstance = required<HTMLElement>(root, "[data-coordinate-instance]");
  const title = required<HTMLElement>(root, "[data-title]");
  const question = required<HTMLElement>(root, "[data-question]");
  const assignment = required<HTMLElement>(root, "[data-assignment]");
  const organism = required<HTMLElement>(root, "[data-organism]");
  const route = required<HTMLElement>(root, "[data-route]");
  const status = required<HTMLElement>(root, "[data-status]");
  const actions = required<HTMLElement>(root, "[data-actions]");
  const exits = required<HTMLElement>(root, "[data-exits]");
  const memory = required<HTMLElement>(root, "[data-memory]");
  const artifact = required<HTMLElement>(root, "[data-artifact]");
  const events = required<HTMLElement>(root, "[data-events]");
  const reset = required<HTMLButtonElement>(root, "[data-reset]");
  const clearStorage = required<HTMLButtonElement>(root, "[data-clear-storage]");
  const exportButton = required<HTMLButtonElement>(root, "[data-export]");

  function render(): void {
    const snapshot = runtime.getSnapshot();
    coordinate.textContent = snapshot.recipe.coordinate;
    coordinateInstance.textContent = snapshot.memory.currentCoordinateInstance;
    title.textContent = snapshot.recipe.title;
    question.textContent = snapshot.recipe.question;
    assignment.textContent = snapshot.recipe.assignmentStatus;
    organism.textContent = organismLabel(snapshot);
    route.textContent = snapshot.memory.route.join(" → ");
    status.textContent = statusLabel(snapshot);

    renderActions(snapshot);
    renderExits(snapshot);
    renderMemory(snapshot);
    renderArtifact(snapshot);
    renderEvents(snapshot);
    persistRuntime(runtime);
  }

  function renderActions(snapshot: RuntimeSnapshot): void {
    actions.replaceChildren();

    if (snapshot.availableActions.length === 0) {
      actions.append(emptyState("No uncommitted actions at this state."));
      return;
    }

    for (const action of snapshot.availableActions) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lab-action";
      button.innerHTML = `<strong>${escapeHtml(action.label)}</strong><span>${escapeHtml(action.description)}</span>`;
      button.addEventListener("click", () => execute(() => runtime.commitAction(action.id)));
      actions.append(button);
    }
  }

  function renderExits(snapshot: RuntimeSnapshot): void {
    exits.replaceChildren();

    if (snapshot.recipe.coordinate === "M") {
      exits.append(emptyState("M restores the exact prior anchor through its explicit Return action."));
      return;
    }

    if (snapshot.availableExits.length === 0) {
      exits.append(emptyState("Commit an action to change the available field."));
      return;
    }

    for (const edge of snapshot.availableExits) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "lab-exit";
      button.innerHTML = `<strong>${escapeHtml(edge.label)}</strong><span>${escapeHtml(edge.consequence)}</span><small>${escapeHtml(edge.relationId)}</small>`;
      button.addEventListener("click", () => execute(() => runtime.navigate(edge.target)));
      exits.append(button);
    }
  }

  function renderMemory(snapshot: RuntimeSnapshot): void {
    const data = {
      sessionId: snapshot.memory.sessionId,
      visitCounts: snapshot.memory.visitCounts,
      flags: snapshot.memory.flags,
      sourcesOpened: snapshot.memory.sourcesOpened,
      relationsTraced: snapshot.memory.relationsTraced,
      ignoredSignals: snapshot.memory.ignoredSignals,
      mVisits: snapshot.memory.mVisits,
      returnAnchor: snapshot.memory.returnAnchor,
      growthStage: snapshot.memory.growthStage,
      yEligible: snapshot.yEligible,
      completed: snapshot.memory.completed,
      previousSessionArtifactId: snapshot.memory.previousSessionArtifactId,
    };
    memory.textContent = JSON.stringify(data, null, 2);
  }

  function renderArtifact(snapshot: RuntimeSnapshot): void {
    const latest = snapshot.memory.artifacts.at(-1);
    artifact.textContent = latest
      ? JSON.stringify(latest, null, 2)
      : "No Return artifact has been generated in this laboratory session.";
  }

  function renderEvents(snapshot: RuntimeSnapshot): void {
    events.replaceChildren();
    const fragment = document.createDocumentFragment();
    for (const event of [...snapshot.memory.events].reverse().slice(0, 20)) {
      const item = document.createElement("li");
      item.innerHTML = `<strong>${escapeHtml(event.coordinateInstance)}</strong><span>${escapeHtml(event.type)}</span><small>${escapeHtml(event.detail)}</small>`;
      fragment.append(item);
    }
    events.append(fragment);
  }

  function execute(operation: () => unknown): void {
    try {
      operation();
      root.dataset.error = "false";
      render();
    } catch (error) {
      root.dataset.error = "true";
      status.textContent = error instanceof Error ? error.message : "Unknown M1 runtime error.";
      console.warn("[kodex-m1-lab]", error);
    }
  }

  reset.addEventListener("click", () => {
    const latestArtifactId = runtime.getMemory().artifacts.at(-1)?.artifactId ?? null;
    runtime = new VerticalSliceRuntime();
    if (latestArtifactId) root.dataset.previousArtifact = latestArtifactId;
    render();
  });

  clearStorage.addEventListener("click", () => {
    localStorage.removeItem(STORAGE_KEY);
    runtime = new VerticalSliceRuntime();
    render();
  });

  exportButton.addEventListener("click", async () => {
    const serialized = runtime.serialize();
    try {
      await navigator.clipboard.writeText(serialized);
      exportButton.textContent = "COPIED";
    } catch {
      const blob = new Blob([serialized], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `kodex-m1-${runtime.getMemory().sessionId}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      exportButton.textContent = "EXPORTED";
    }
    window.setTimeout(() => {
      exportButton.textContent = "EXPORT TRACE";
    }, 1200);
  });

  (window as typeof window & { __kdxM1?: unknown }).__kdxM1 = {
    snapshot: () => runtime.getSnapshot(),
    serialize: () => runtime.serialize(),
    reset: () => {
      runtime = new VerticalSliceRuntime();
      render();
    },
    go: (coordinate: SliceCoordinate) => execute(() => runtime.navigate(coordinate)),
    act: (actionId: string) => execute(() => runtime.commitAction(actionId)),
  };

  render();
}

function restoreRuntime(): VerticalSliceRuntime {
  const serialized = localStorage.getItem(STORAGE_KEY);
  if (!serialized) return new VerticalSliceRuntime();

  try {
    return VerticalSliceRuntime.restore(serialized);
  } catch (error) {
    console.warn("[kodex-m1-lab] discarded invalid stored memory", error);
    localStorage.removeItem(STORAGE_KEY);
    return new VerticalSliceRuntime();
  }
}

function persistRuntime(runtime: VerticalSliceRuntime): void {
  localStorage.setItem(STORAGE_KEY, runtime.serialize());
}

function organismLabel(snapshot: RuntimeSnapshot): string {
  const organism = snapshot.recipe.organism;
  if (!organism) return `${snapshot.recipe.presentationMode} / NO FORCED ORGANISM FAMILY`;
  return `${organism.family} / ${organism.presetId} / ${organism.implementationStatus}`;
}

function statusLabel(snapshot: RuntimeSnapshot): string {
  const segments = [
    `INSTANCE ${snapshot.memory.currentCoordinateInstance}`,
    snapshot.mutationActive ? "MUTATION ACTIVE" : "BASE STATE",
    snapshot.yEligible ? "Y ELIGIBLE" : "Y LATENT",
    `GROWTH ${snapshot.memory.growthStage}`,
  ];
  return segments.join(" · ");
}

function emptyState(message: string): HTMLElement {
  const element = document.createElement("p");
  element.className = "lab-empty";
  element.textContent = message;
  return element;
}

function required<T extends Element>(root: ParentNode, selector: string): T {
  const element = root.querySelector<T>(selector);
  if (!element) throw new Error(`Missing M1 lab element: ${selector}`);
  return element;
}

function escapeHtml(input: string): string {
  return input.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character,
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", mount, { once: true });
} else {
  mount();
}

document.addEventListener("astro:page-load", mount);
