import { verticalSliceRecipes } from "./verticalSliceRecipes";
import type {
  ActionDefinition,
  ExitDefinition,
  GrowthStage,
  MemoryFlag,
  ReturnArtifact,
  RuntimeSnapshot,
  SliceCoordinate,
  VerticalSliceMemory,
} from "./types";

const STORAGE_SCHEMA_VERSION = "0.1.0" as const;
const INTERMEDIATE_COORDINATES = new Set<SliceCoordinate>(["B", "C", "H", "K"]);
const GROWTH_STAGES: GrowthStage[] = ["NONE", "SEED", "ROOT", "TRUNK", "BRANCHING", "CROWN"];

const ACTION_WRITES: Record<string, MemoryFlag[]> = {
  ORIENT_SIGNAL: ["CONSENT_RECORDED", "A_ORIENTATION_SIGNAL"],
  OPEN_TRACE: ["CONSENT_RECORDED", "A_ORIENTATION_TRACE"],
  MAP_RELATION: ["CONSENT_RECORDED", "A_ORIENTATION_RELATION"],
  OBSERVE_ATTRACTOR: ["B_ATTRACTOR_OBSERVED"],
  ISOLATE_ECHO: ["B_ECHO_ISOLATED", "DELAYED_ECHO_PENDING"],
  OPEN_SOURCE: ["C_SOURCE_OPENED"],
  TRACE_ARCHIVE_RELATION: ["C_RELATION_TRACED", "ARCHIVE_SEED_CREATED"],
  SELECT_ORBIT: ["H_ORBIT_SELECTED"],
  DESTABILIZE_CENTER: ["H_CENTER_DISPLACED", "B_MUTATION_ARMED"],
  PLANT_SEED: ["K_SEED_PLANTED"],
  ADVANCE_GROWTH: [],
  SELECT_BRANCH: ["K_BRANCH_SELECTED"],
  ACKNOWLEDGE_RELATION: ["M_RELATION_ACKNOWLEDGED"],
  RETURN_TO_ANCHOR: ["M_RETURN_COMMITTED"],
  GENERATE_RETURN: ["Y_RETURN_GENERATED"],
  BEGIN_NEW_CYCLE: ["Y_REENTRY_SELECTED"],
};

export class VerticalSliceRuntime {
  private memory: VerticalSliceMemory;

  constructor(memory?: VerticalSliceMemory) {
    this.memory = memory ? validateAndNormalizeMemory(memory) : createInitialMemory();
  }

  getSnapshot(): RuntimeSnapshot {
    const recipe = verticalSliceRecipes[this.memory.currentCoordinate];
    return {
      memory: clone(this.memory),
      recipe,
      availableActions: this.getAvailableActions(),
      availableExits: this.getAvailableExits(),
      yEligible: this.isYEligible(),
      mutationActive: this.memory.currentCoordinateInstance.endsWith("′"),
    };
  }

  getMemory(): VerticalSliceMemory {
    return clone(this.memory);
  }

  getAvailableActions(): ActionDefinition[] {
    const recipe = verticalSliceRecipes[this.memory.currentCoordinate];
    return recipe.actions.filter((action) => {
      if (action.repeatable) {
        if (action.id === "ADVANCE_GROWTH") return this.memory.growthStage !== "CROWN";
        return true;
      }

      return !this.memory.committedActions.some(
        (entry) =>
          entry.coordinateInstance === this.memory.currentCoordinateInstance &&
          entry.actionId === action.id,
      );
    });
  }

  getAvailableExits(): ExitDefinition[] {
    return verticalSliceRecipes[this.memory.currentCoordinate].exits.filter((edge) =>
      this.conditionSatisfied(edge.conditionId),
    );
  }

  commitAction(actionId: string): RuntimeSnapshot {
    const coordinate = this.memory.currentCoordinate;
    const action = verticalSliceRecipes[coordinate].actions.find((candidate) => candidate.id === actionId);
    if (!action) throw new Error(`Action ${actionId} is not defined for coordinate ${coordinate}.`);

    const available = this.getAvailableActions().some((candidate) => candidate.id === actionId);
    if (!available) throw new Error(`Action ${actionId} is not currently available.`);

    if (actionId === "RETURN_TO_ANCHOR") {
      this.writeAction(actionId, ACTION_WRITES[actionId] ?? []);
      this.returnToAnchor();
      return this.getSnapshot();
    }

    if (actionId === "GENERATE_RETURN") {
      this.writeAction(actionId, ACTION_WRITES[actionId] ?? []);
      this.generateReturnArtifact();
      return this.getSnapshot();
    }

    if (actionId === "BEGIN_NEW_CYCLE") {
      const latestArtifact = this.memory.artifacts.at(-1) ?? null;
      this.memory = createInitialMemory(latestArtifact?.artifactId ?? null, this.memory.artifacts);
      return this.getSnapshot();
    }

    const writes = ACTION_WRITES[actionId] ?? [];
    this.writeAction(actionId, writes);
    this.applyActionEffects(actionId);
    return this.getSnapshot();
  }

  navigate(target: SliceCoordinate): RuntimeSnapshot {
    const edge = this.getAvailableExits().find((candidate) => candidate.target === target);
    if (!edge) {
      throw new Error(
        `No available edge from ${this.memory.currentCoordinateInstance} to ${target}.`,
      );
    }

    if (this.memory.currentCoordinate === "Y" && target === "A") {
      const latestArtifact = this.memory.artifacts.at(-1) ?? null;
      this.memory = createInitialMemory(latestArtifact?.artifactId ?? null, this.memory.artifacts);
      return this.getSnapshot();
    }

    this.recordIgnoredSignalsBeforeExit();

    if (target === "M") {
      this.memory.returnAnchor = this.memory.currentCoordinate;
      this.memory.mVisits.push({
        from: this.memory.currentCoordinate,
        manifestation: manifestationFor(this.memory.currentCoordinate),
        timestamp: Date.now(),
      });
    }

    const eventType = this.memory.currentCoordinate === "Y" ? "REENTRY" : "ENTER";
    this.enterCoordinate(target, `${edge.relationId}: ${edge.consequence}`, eventType);
    return this.getSnapshot();
  }

  serialize(): string {
    return JSON.stringify(this.memory);
  }

  static restore(serialized: string): VerticalSliceRuntime {
    const parsed = JSON.parse(serialized) as VerticalSliceMemory;
    return new VerticalSliceRuntime(parsed);
  }

  private writeAction(actionId: string, writes: MemoryFlag[]): void {
    const sequence = this.nextSequence();
    for (const flag of writes) this.addFlag(flag);

    this.memory.committedActions.push({
      sequence,
      coordinate: this.memory.currentCoordinate,
      coordinateInstance: this.memory.currentCoordinateInstance,
      actionId,
      writes: [...writes],
      timestamp: Date.now(),
    });

    this.memory.events.push({
      sequence,
      type: "ACTION",
      coordinate: this.memory.currentCoordinate,
      coordinateInstance: this.memory.currentCoordinateInstance,
      detail: actionId,
      timestamp: Date.now(),
    });
  }

  private applyActionEffects(actionId: string): void {
    switch (actionId) {
      case "OPEN_SOURCE":
        addUnique(this.memory.sourcesOpened, "KODEX_SOURCE_RECORD_M1");
        break;
      case "TRACE_ARCHIVE_RELATION":
        addUnique(this.memory.relationsTraced, "C_ARCHIVE_RELATION");
        break;
      case "SELECT_ORBIT":
        addUnique(this.memory.relationsTraced, "H_ORBITAL_RELATION");
        break;
      case "SELECT_BRANCH":
        addUnique(this.memory.relationsTraced, "K_BRANCH_RELATION");
        break;
      case "PLANT_SEED":
        if (this.memory.growthStage === "NONE") this.memory.growthStage = "SEED";
        break;
      case "ADVANCE_GROWTH":
        this.advanceGrowth();
        break;
      default:
        break;
    }
  }

  private advanceGrowth(): void {
    if (!this.hasFlag("K_SEED_PLANTED")) {
      throw new Error("The archive seed must be planted before growth can advance.");
    }

    const currentIndex = GROWTH_STAGES.indexOf(this.memory.growthStage);
    const nextStage = GROWTH_STAGES[Math.min(GROWTH_STAGES.length - 1, currentIndex + 1)];
    this.memory.growthStage = nextStage;
  }

  private enterCoordinate(
    coordinate: SliceCoordinate,
    detail: string,
    eventType: "ENTER" | "REENTRY" | "M_RETURN" = "ENTER",
  ): void {
    const priorVisits = this.memory.visitCounts[coordinate] ?? 0;
    const nextVisits = priorVisits + 1;
    this.memory.visitCounts[coordinate] = nextVisits;
    this.memory.currentCoordinate = coordinate;
    this.memory.currentCoordinateInstance = nextVisits > 1 ? `${coordinate}′` : coordinate;
    this.memory.route.push(this.memory.currentCoordinateInstance);

    if (
      coordinate === "B" &&
      priorVisits > 0 &&
      this.hasFlag("B_ECHO_ISOLATED") &&
      this.hasFlag("C_SOURCE_OPENED")
    ) {
      this.addFlag("B_PRIME_ECHO_STABILIZED");
      this.removeFlag("DELAYED_ECHO_PENDING");
    }

    this.memory.events.push({
      sequence: this.nextSequence(),
      type: eventType,
      coordinate,
      coordinateInstance: this.memory.currentCoordinateInstance,
      detail,
      timestamp: Date.now(),
    });
  }

  private returnToAnchor(): void {
    if (this.memory.currentCoordinate !== "M") {
      throw new Error("RETURN_TO_ANCHOR is only valid inside M.");
    }

    const anchor = this.memory.returnAnchor;
    if (!anchor || anchor === "A" || anchor === "M" || anchor === "Y") {
      throw new Error("M has no valid prior route anchor to restore.");
    }

    this.memory.returnAnchor = null;
    this.enterCoordinate(anchor, `M restored exact anchor ${anchor}.`, "M_RETURN");
  }

  private generateReturnArtifact(): ReturnArtifact {
    if (this.memory.currentCoordinate !== "Y") {
      throw new Error("Return artifacts can only be generated at Y.");
    }
    if (!this.isYEligible()) {
      throw new Error("The current trace is not eligible for Return.");
    }

    const visitedCoordinates = uniqueCoordinatesFromRoute(this.memory.route);
    const unresolvedQuestions: string[] = [];

    if (!this.hasFlag("C_SOURCE_OPENED")) {
      unresolvedQuestions.push("Which source record would materially alter this trace?");
    }
    if (this.hasFlag("DELAYED_ECHO_PENDING")) {
      unresolvedQuestions.push("What would the isolated echo reveal on a mutated revisit?");
    }
    if (this.memory.growthStage !== "CROWN" && visitedCoordinates.includes("K")) {
      unresolvedQuestions.push(`What remains unfinished at growth stage ${this.memory.growthStage}?`);
    }

    const reentryOptions = (["C", "H", "K"] as SliceCoordinate[]).filter((coordinate) =>
      visitedCoordinates.includes(coordinate),
    );

    const payload = {
      route: [...this.memory.route],
      actions: this.memory.committedActions.map((entry) => `${entry.coordinateInstance}:${entry.actionId}`),
      flags: [...this.memory.flags].sort(),
      growthStage: this.memory.growthStage,
      mVisited: this.memory.mVisits.length > 0,
    };
    const checksum = checksumFor(payload);
    const artifact: ReturnArtifact = {
      artifactId: `KDX-RETURN-${checksum}`,
      generatedAt: Date.now(),
      route: [...this.memory.route],
      visitedCoordinates,
      visitCounts: { ...this.memory.visitCounts },
      committedActions: this.memory.committedActions.map(
        (entry) => `${entry.coordinateInstance}:${entry.actionId}`,
      ),
      flags: [...this.memory.flags].sort(),
      sourcesOpened: [...this.memory.sourcesOpened],
      relationsTraced: [...this.memory.relationsTraced],
      ignoredSignals: [...this.memory.ignoredSignals],
      mVisited: this.memory.mVisits.length > 0,
      growthStage: this.memory.growthStage,
      unresolvedQuestions,
      reentryOptions,
      checksum,
    };

    const existingIndex = this.memory.artifacts.findIndex(
      (candidate) => candidate.checksum === artifact.checksum,
    );
    if (existingIndex >= 0) this.memory.artifacts[existingIndex] = artifact;
    else this.memory.artifacts.push(artifact);

    this.memory.completed = true;
    this.memory.events.push({
      sequence: this.nextSequence(),
      type: "RETURN_GENERATED",
      coordinate: "Y",
      coordinateInstance: this.memory.currentCoordinateInstance,
      detail: artifact.artifactId,
      timestamp: Date.now(),
    });
    return artifact;
  }

  private conditionSatisfied(conditionId: string): boolean {
    switch (conditionId) {
      case "A_ORIENTATION_SIGNAL":
        return this.hasFlag("A_ORIENTATION_SIGNAL");
      case "A_ORIENTATION_TRACE":
        return this.hasFlag("A_ORIENTATION_TRACE");
      case "A_ORIENTATION_RELATION":
        return this.hasFlag("A_ORIENTATION_RELATION");
      case "B_ATTRACTOR_OBSERVED":
        return this.hasFlag("B_ATTRACTOR_OBSERVED");
      case "B_ECHO_ISOLATED":
        return this.hasFlag("B_ECHO_ISOLATED");
      case "B_M_AVAILABLE":
        return this.hasFlag("B_ATTRACTOR_OBSERVED") && this.meaningfulActionCount() >= 2;
      case "C_RELATION_TRACED":
        return this.hasFlag("C_RELATION_TRACED");
      case "C_TO_B_AVAILABLE":
        return this.hasFlag("B_ECHO_ISOLATED") || this.hasFlag("C_RELATION_TRACED");
      case "C_M_AVAILABLE":
        return this.hasFlag("C_SOURCE_OPENED") && this.hasFlag("C_RELATION_TRACED");
      case "H_ORBIT_SELECTED":
        return this.hasFlag("H_ORBIT_SELECTED");
      case "H_CENTER_DISPLACED":
        return this.hasFlag("H_CENTER_DISPLACED");
      case "H_M_AVAILABLE":
        return this.memory.relationsTraced.length >= 2 || this.memory.mVisits.length > 0;
      case "K_TO_C_AVAILABLE":
        return growthRank(this.memory.growthStage) >= growthRank("ROOT");
      case "K_BRANCH_SELECTED":
        return this.hasFlag("K_BRANCH_SELECTED");
      case "K_M_AVAILABLE":
        return growthRank(this.memory.growthStage) >= growthRank("BRANCHING");
      case "K_Y_ELIGIBLE":
        return this.isYEligible() && growthRank(this.memory.growthStage) >= growthRank("TRUNK");
      case "Y_ELIGIBLE":
        return this.isYEligible();
      case "Y_RETURN_GENERATED":
        return this.hasFlag("Y_RETURN_GENERATED") && this.memory.artifacts.length > 0;
      case "Y_REENTER_C_AVAILABLE":
        return this.memory.completed && (this.memory.visitCounts.C ?? 0) > 0;
      case "Y_REENTER_H_AVAILABLE":
        return this.memory.completed && (this.memory.visitCounts.H ?? 0) > 0;
      case "Y_REENTER_K_AVAILABLE":
        return this.memory.completed && (this.memory.visitCounts.K ?? 0) > 0;
      default:
        return false;
    }
  }

  private isYEligible(): boolean {
    const distinctIntermediate = [...INTERMEDIATE_COORDINATES].filter(
      (coordinate) => (this.memory.visitCounts[coordinate] ?? 0) > 0,
    ).length;
    const consequentialActions = this.memory.committedActions.filter(
      (entry) => INTERMEDIATE_COORDINATES.has(entry.coordinate),
    ).length;
    const relationalEvidence =
      this.memory.relationsTraced.length > 0 ||
      this.memory.sourcesOpened.length > 0 ||
      this.hasFlag("B_ECHO_ISOLATED") ||
      growthRank(this.memory.growthStage) >= growthRank("ROOT");

    return distinctIntermediate >= 3 && consequentialActions >= 3 && relationalEvidence;
  }

  private recordIgnoredSignalsBeforeExit(): void {
    if (
      this.memory.currentCoordinate === "B" &&
      !this.hasFlag("B_ECHO_ISOLATED") &&
      !this.memory.ignoredSignals.includes("B_ECHO_NOT_ISOLATED")
    ) {
      this.memory.ignoredSignals.push("B_ECHO_NOT_ISOLATED");
    }
  }

  private meaningfulActionCount(): number {
    return this.memory.committedActions.filter((entry) => entry.coordinate !== "A").length;
  }

  private hasFlag(flag: MemoryFlag): boolean {
    return this.memory.flags.includes(flag);
  }

  private addFlag(flag: MemoryFlag): void {
    addUnique(this.memory.flags, flag);
  }

  private removeFlag(flag: MemoryFlag): void {
    this.memory.flags = this.memory.flags.filter((candidate) => candidate !== flag);
  }

  private nextSequence(): number {
    return this.memory.events.length + this.memory.committedActions.length + 1;
  }
}

export function createInitialMemory(
  previousSessionArtifactId: string | null = null,
  preservedArtifacts: ReturnArtifact[] = [],
): VerticalSliceMemory {
  const now = Date.now();
  const sessionId = createId("KDX-M1");
  return {
    schemaVersion: STORAGE_SCHEMA_VERSION,
    sessionId,
    currentCoordinate: "A",
    currentCoordinateInstance: "A",
    route: ["A"],
    visitCounts: { A: 1 },
    committedActions: [],
    events: [
      {
        sequence: 1,
        type: "ENTER",
        coordinate: "A",
        coordinateInstance: "A",
        detail: "Canonical M1 session origin.",
        timestamp: now,
      },
    ],
    flags: [],
    sourcesOpened: [],
    relationsTraced: [],
    ignoredSignals: [],
    mVisits: [],
    returnAnchor: null,
    growthStage: "NONE",
    artifacts: [...preservedArtifacts],
    completed: false,
    previousSessionArtifactId,
  };
}

function validateAndNormalizeMemory(memory: VerticalSliceMemory): VerticalSliceMemory {
  if (memory.schemaVersion !== STORAGE_SCHEMA_VERSION) {
    throw new Error(`Unsupported KODEX M1 memory schema: ${memory.schemaVersion}`);
  }
  if (!verticalSliceRecipes[memory.currentCoordinate]) {
    throw new Error(`Unknown KODEX M1 coordinate: ${memory.currentCoordinate}`);
  }
  return clone(memory);
}

function manifestationFor(coordinate: SliceCoordinate): string {
  switch (coordinate) {
    case "B":
      return "M@SIGNAL";
    case "C":
      return "M@MEMORY";
    case "H":
      return "M@COSMOLOGY";
    case "K":
      return "M@ARTIFACT";
    default:
      return "M@ORIENTATION";
  }
}

function growthRank(stage: GrowthStage): number {
  return GROWTH_STAGES.indexOf(stage);
}

function uniqueCoordinatesFromRoute(route: string[]): SliceCoordinate[] {
  const coordinates = route
    .map((instance) => instance.replace("′", "") as SliceCoordinate)
    .filter((coordinate) => Boolean(verticalSliceRecipes[coordinate]));
  return [...new Set(coordinates)];
}

function createId(prefix: string): string {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  return `${prefix}-${Date.now().toString(36)}-${random}`.toUpperCase();
}

function checksumFor(payload: unknown): string {
  const input = JSON.stringify(payload);
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0").toUpperCase();
}

function addUnique<T>(target: T[], value: T): void {
  if (!target.includes(value)) target.push(value);
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}
