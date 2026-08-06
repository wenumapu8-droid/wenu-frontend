import { VerticalSliceRuntime } from "./VerticalSliceRuntime";
import type { ReturnArtifact, SliceCoordinate } from "./types";

export type ScenarioResult = {
  id: string;
  passed: boolean;
  route: string[];
  artifactId: string | null;
  details: string[];
  error: string | null;
};

type ScenarioContext = {
  runtime: VerticalSliceRuntime;
  act: (actionId: string) => void;
  go: (coordinate: SliceCoordinate) => void;
  latestArtifact: () => ReturnArtifact | null;
  assert: (condition: unknown, message: string) => void;
};

type ScenarioDefinition = {
  id: string;
  run: (context: ScenarioContext) => void;
};

const scenarios: ScenarioDefinition[] = [
  {
    id: "M1-T01-SIGNAL-ORBIT-GROWTH-NO-M",
    run: ({ act, go, latestArtifact, assert }) => {
      act("ORIENT_SIGNAL");
      go("B");
      act("OBSERVE_ATTRACTOR");
      go("H");
      act("SELECT_ORBIT");
      go("K");
      act("PLANT_SEED");
      act("ADVANCE_GROWTH");
      act("ADVANCE_GROWTH");
      go("Y");
      act("GENERATE_RETURN");
      const artifact = latestArtifact();
      assert(artifact?.mVisited === false, "Route must complete without M.");
      assert(artifact?.growthStage === "TRUNK", "Return must preserve the actual TRUNK stage.");
    },
  },
  {
    id: "M1-T02-ARCHIVE-GROWTH-HEART-RETURN",
    run: ({ act, go, latestArtifact, assert }) => {
      act("OPEN_TRACE");
      go("C");
      act("OPEN_SOURCE");
      act("TRACE_ARCHIVE_RELATION");
      go("K");
      act("PLANT_SEED");
      act("ADVANCE_GROWTH");
      act("ADVANCE_GROWTH");
      act("ADVANCE_GROWTH");
      go("M");
      act("ACKNOWLEDGE_RELATION");
      act("RETURN_TO_ANCHOR");
      act("SELECT_BRANCH");
      go("H");
      act("SELECT_ORBIT");
      go("Y");
      act("GENERATE_RETURN");
      const artifact = latestArtifact();
      assert(artifact?.mVisited === true, "Route must record voluntary M access.");
      assert(artifact?.route.includes("K′"), "M must restore K as a mutated revisit.");
    },
  },
  {
    id: "M1-T03-DELAYED-ECHO-LOOP",
    run: ({ runtime, act, go, latestArtifact, assert }) => {
      act("ORIENT_SIGNAL");
      go("B");
      act("ISOLATE_ECHO");
      go("C");
      act("OPEN_SOURCE");
      act("TRACE_ARCHIVE_RELATION");
      go("B");
      assert(
        runtime.getMemory().flags.includes("B_PRIME_ECHO_STABILIZED"),
        "B′ must stabilize the isolated echo after source inspection.",
      );
      act("OBSERVE_ATTRACTOR");
      go("H");
      act("SELECT_ORBIT");
      go("K");
      act("PLANT_SEED");
      act("ADVANCE_GROWTH");
      act("ADVANCE_GROWTH");
      go("Y");
      act("GENERATE_RETURN");
      const artifact = latestArtifact();
      assert(artifact?.route.includes("B′"), "Return must contain the mutated B revisit.");
      assert(
        !artifact?.flags.includes("DELAYED_ECHO_PENDING"),
        "Resolved echo may not remain pending in Return.",
      );
    },
  },
  {
    id: "M1-T04-COSMOLOGY-HEART-FROM-SECOND-REGION",
    run: ({ act, go, latestArtifact, assert }) => {
      act("MAP_RELATION");
      go("H");
      act("SELECT_ORBIT");
      act("DESTABILIZE_CENTER");
      go("B");
      act("ISOLATE_ECHO");
      go("C");
      act("TRACE_ARCHIVE_RELATION");
      go("B");
      act("OBSERVE_ATTRACTOR");
      go("H");
      go("M");
      act("ACKNOWLEDGE_RELATION");
      act("RETURN_TO_ANCHOR");
      go("K");
      act("PLANT_SEED");
      act("ADVANCE_GROWTH");
      act("ADVANCE_GROWTH");
      go("Y");
      act("GENERATE_RETURN");
      const artifact = latestArtifact();
      assert(artifact?.mVisited === true, "M must be reachable from the cosmology region.");
      assert(
        artifact?.route.some((entry) => entry === "H′"),
        "Cosmology route must contain a mutated H revisit.",
      );
    },
  },
  {
    id: "M1-T05-ARCHIVE-SIGNAL-ORBIT",
    run: ({ act, go, latestArtifact, assert }) => {
      act("OPEN_TRACE");
      go("C");
      act("OPEN_SOURCE");
      act("TRACE_ARCHIVE_RELATION");
      go("B");
      act("OBSERVE_ATTRACTOR");
      go("H");
      act("SELECT_ORBIT");
      go("Y");
      act("GENERATE_RETURN");
      const artifact = latestArtifact();
      assert(
        artifact?.visitedCoordinates.includes("C") &&
          artifact.visitedCoordinates.includes("B") &&
          artifact.visitedCoordinates.includes("H"),
        "Return must preserve archive → signal → orbit movement.",
      );
    },
  },
  {
    id: "M1-T06-GROWTH-PROVENANCE-REPAIR",
    run: ({ act, go, latestArtifact, assert }) => {
      act("MAP_RELATION");
      go("H");
      act("SELECT_ORBIT");
      go("K");
      act("PLANT_SEED");
      act("ADVANCE_GROWTH");
      go("C");
      act("OPEN_SOURCE");
      act("TRACE_ARCHIVE_RELATION");
      go("K");
      act("ADVANCE_GROWTH");
      go("Y");
      act("GENERATE_RETURN");
      const artifact = latestArtifact();
      assert(artifact?.route.includes("K′"), "Growth repair must restore K as K′.");
      assert(artifact?.sourcesOpened.length === 1, "Repair route must preserve source access.");
      assert(artifact?.growthStage === "TRUNK", "Repaired growth must resume to TRUNK.");
    },
  },
  {
    id: "M1-T07-MULTI-HEART-CONTEXT",
    run: ({ runtime, act, go, latestArtifact, assert }) => {
      act("ORIENT_SIGNAL");
      go("B");
      act("OBSERVE_ATTRACTOR");
      act("ISOLATE_ECHO");
      go("M");
      act("ACKNOWLEDGE_RELATION");
      act("RETURN_TO_ANCHOR");
      go("C");
      act("OPEN_SOURCE");
      act("TRACE_ARCHIVE_RELATION");
      go("M");
      act("ACKNOWLEDGE_RELATION");
      act("RETURN_TO_ANCHOR");
      go("K");
      act("PLANT_SEED");
      act("ADVANCE_GROWTH");
      act("ADVANCE_GROWTH");
      go("Y");
      act("GENERATE_RETURN");
      const manifestations = runtime.getMemory().mVisits.map((visit) => visit.manifestation);
      assert(manifestations.includes("M@SIGNAL"), "First M visit must manifest from signal.");
      assert(manifestations.includes("M@MEMORY"), "Second M visit must manifest from memory.");
      assert(latestArtifact()?.mVisited === true, "Return must record M without scoring it.");
    },
  },
  {
    id: "M1-T08-RETURN-REENTRY",
    run: ({ runtime, act, go, latestArtifact, assert }) => {
      act("ORIENT_SIGNAL");
      go("B");
      act("ISOLATE_ECHO");
      go("C");
      act("OPEN_SOURCE");
      act("TRACE_ARCHIVE_RELATION");
      go("B");
      act("OBSERVE_ATTRACTOR");
      go("H");
      act("SELECT_ORBIT");
      go("Y");
      act("GENERATE_RETURN");
      const first = latestArtifact();
      go("C");
      go("Y");
      act("GENERATE_RETURN");
      const second = latestArtifact();
      assert(Boolean(first && second), "Both Return artifacts must exist.");
      assert(first?.artifactId !== second?.artifactId, "Re-entry must generate a changed artifact.");
      assert(runtime.getMemory().artifacts.length >= 2, "Prior artifact must remain preserved.");
    },
  },
];

export function runVerticalSliceScenarioSuite(): ScenarioResult[] {
  return scenarios.map(runScenario);
}

function runScenario(definition: ScenarioDefinition): ScenarioResult {
  const runtime = new VerticalSliceRuntime();
  const details: string[] = [];

  const context: ScenarioContext = {
    runtime,
    act(actionId) {
      runtime.commitAction(actionId);
      details.push(`ACTION ${actionId}`);
    },
    go(coordinate) {
      runtime.navigate(coordinate);
      details.push(`ENTER ${runtime.getMemory().currentCoordinateInstance}`);
    },
    latestArtifact() {
      return runtime.getMemory().artifacts.at(-1) ?? null;
    },
    assert(condition, message) {
      if (!condition) throw new Error(message);
      details.push(`ASSERT ${message}`);
    },
  };

  try {
    definition.run(context);
    const memory = runtime.getMemory();
    return {
      id: definition.id,
      passed: true,
      route: memory.route,
      artifactId: memory.artifacts.at(-1)?.artifactId ?? null,
      details,
      error: null,
    };
  } catch (error) {
    const memory = runtime.getMemory();
    return {
      id: definition.id,
      passed: false,
      route: memory.route,
      artifactId: memory.artifacts.at(-1)?.artifactId ?? null,
      details,
      error: error instanceof Error ? error.message : "Unknown scenario failure.",
    };
  }
}
