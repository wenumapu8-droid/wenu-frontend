export type SliceCoordinate = "A" | "B" | "C" | "H" | "K" | "M" | "Y";

export type NodeAssignmentStatus = "CANONICAL" | "NEEDS_CREATOR_APPROVAL";

export type OrganismBinding = {
  family: "FIELD" | "VORTEX" | "ORBITAL" | "GROWTH";
  presetId: string;
  implementationStatus: "PLANNED" | "PROTOTYPE" | "IMPLEMENTED" | "TESTED";
  fallback: string;
};

export type ActionDefinition = {
  id: string;
  label: string;
  description: string;
  repeatable?: boolean;
};

export type ExitDefinition = {
  target: SliceCoordinate;
  label: string;
  relationId: string;
  conditionId: string;
  consequence: string;
};

export type NodeRecipe = {
  coordinate: SliceCoordinate;
  assignmentStatus: NodeAssignmentStatus;
  title: string;
  question: string;
  worldIds: string[];
  actions: ActionDefinition[];
  exits: ExitDefinition[];
  organism: OrganismBinding | null;
  presentationMode: "ORGANISM" | "CONTEXTUAL_HEART" | "TRACE_COMPOSITE";
};

export type GrowthStage = "NONE" | "SEED" | "ROOT" | "TRUNK" | "BRANCHING" | "CROWN";

export type MemoryFlag =
  | "CONSENT_RECORDED"
  | "A_ORIENTATION_SIGNAL"
  | "A_ORIENTATION_TRACE"
  | "A_ORIENTATION_RELATION"
  | "B_ATTRACTOR_OBSERVED"
  | "B_ECHO_ISOLATED"
  | "DELAYED_ECHO_PENDING"
  | "B_PRIME_ECHO_STABILIZED"
  | "C_SOURCE_OPENED"
  | "C_RELATION_TRACED"
  | "ARCHIVE_SEED_CREATED"
  | "H_ORBIT_SELECTED"
  | "H_CENTER_DISPLACED"
  | "B_MUTATION_ARMED"
  | "K_SEED_PLANTED"
  | "K_BRANCH_SELECTED"
  | "M_RELATION_ACKNOWLEDGED"
  | "M_RETURN_COMMITTED"
  | "Y_RETURN_GENERATED"
  | "Y_REENTRY_SELECTED";

export type CommittedAction = {
  sequence: number;
  coordinate: SliceCoordinate;
  coordinateInstance: string;
  actionId: string;
  writes: MemoryFlag[];
  timestamp: number;
};

export type RouteEvent = {
  sequence: number;
  type: "ENTER" | "ACTION" | "M_RETURN" | "RETURN_GENERATED" | "REENTRY";
  coordinate: SliceCoordinate;
  coordinateInstance: string;
  detail: string;
  timestamp: number;
};

export type ReturnArtifact = {
  artifactId: string;
  generatedAt: number;
  route: string[];
  visitedCoordinates: SliceCoordinate[];
  visitCounts: Partial<Record<SliceCoordinate, number>>;
  committedActions: string[];
  flags: MemoryFlag[];
  sourcesOpened: string[];
  relationsTraced: string[];
  ignoredSignals: string[];
  mVisited: boolean;
  growthStage: GrowthStage;
  unresolvedQuestions: string[];
  reentryOptions: SliceCoordinate[];
  checksum: string;
};

export type VerticalSliceMemory = {
  schemaVersion: "0.1.0";
  sessionId: string;
  currentCoordinate: SliceCoordinate;
  currentCoordinateInstance: string;
  route: string[];
  visitCounts: Partial<Record<SliceCoordinate, number>>;
  committedActions: CommittedAction[];
  events: RouteEvent[];
  flags: MemoryFlag[];
  sourcesOpened: string[];
  relationsTraced: string[];
  ignoredSignals: string[];
  mVisits: Array<{ from: SliceCoordinate; manifestation: string; timestamp: number }>;
  returnAnchor: SliceCoordinate | null;
  growthStage: GrowthStage;
  artifacts: ReturnArtifact[];
  completed: boolean;
  previousSessionArtifactId: string | null;
};

export type RuntimeSnapshot = {
  memory: VerticalSliceMemory;
  recipe: NodeRecipe;
  availableActions: ActionDefinition[];
  availableExits: ExitDefinition[];
  yEligible: boolean;
  mutationActive: boolean;
};
