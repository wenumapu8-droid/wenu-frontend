import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  ARCHIVE_EVIDENCE,
  canEnterReturn,
  commitAssemblyChoice,
  completeReturn,
  createReturnSignature,
  createVisibleAssemblyState,
  enterHeart,
  leaveHeart,
  openArchiveEvidence,
  reenterArchive,
  restoreVisibleAssembly,
  serializeVisibleAssembly,
  verifyArchiveProjectionBoundary,
} from "./visible-assembly.ts";

describe("Visible Assembly 01 (KOD-47)", () => {
  it("creates a single A-origin JourneyState without assigning B–X meanings", () => {
    const state = createVisibleAssemblyState();
    assert.equal(state.stage, "THRESHOLD");
    assert.deepEqual(state.journey.letterTrace, ["A"]);
    assert.deepEqual(Object.keys(state.journey.visitCounts), ["A"]);
  });

  it("OBSERVE and REMEMBER create distinct semantic memory", () => {
    const observe = commitAssemblyChoice(createVisibleAssemblyState(), "OBSERVE");
    const remember = commitAssemblyChoice(createVisibleAssemblyState(), "REMEMBER");
    assert.ok(observe.journey.committedActions.includes("OBSERVE_RELATIONS"));
    assert.ok(remember.journey.committedActions.includes("REMEMBER_TRACE"));
    assert.notDeepEqual(observe.journey.committedActions, remember.journey.committedActions);
    assert.equal(observe.stage, "ARCHIVE");
    assert.equal(remember.stage, "ARCHIVE");
  });

  it("opens one verified/reference-only Archive provenance relation", () => {
    assert.equal(verifyArchiveProjectionBoundary(), true);
    const state = openArchiveEvidence(
      commitAssemblyChoice(createVisibleAssemblyState(), "OBSERVE"),
    );
    assert.equal(state.archiveOpened, true);
    assert.ok(
      state.journey.committedActions.includes(`OPEN_SOURCE:${ARCHIVE_EVIDENCE.sourceId}`),
    );
    assert.equal(state.journey.heart.portalState, "AVAILABLE");
  });

  it("completes a route without Heart and derives Return from the actual trace", () => {
    let state = createVisibleAssemblyState();
    state = commitAssemblyChoice(state, "REMEMBER");
    state = openArchiveEvidence(state);
    assert.equal(canEnterReturn(state), true);
    const before = createReturnSignature(state.journey);
    state = completeReturn(state);
    assert.equal(state.stage, "RETURN");
    assert.equal(state.journey.current, "Y");
    assert.equal(state.journey.heart.visitCount, 0);
    assert.equal(state.returnSignature, before);
  });

  it("keeps Heart optional and restores the exact prior Archive anchor", () => {
    let state = createVisibleAssemblyState();
    state = commitAssemblyChoice(state, "OBSERVE");
    state = openArchiveEvidence(state);
    state = enterHeart(state);

    assert.equal(state.stage, "HEART");
    assert.equal(state.journey.current, "M");
    assert.equal(state.journey.heart.visitCount, 1);
    assert.equal(state.journey.returnAnchor?.letter, "A");
    assert.equal(state.journey.returnAnchor?.world, "ARCHIVE");
    assert.equal(state.journey.returnAnchor?.focus, ARCHIVE_EVIDENCE.sourceId);
    assert.equal(state.journey.returnAnchor?.localState, "OBSERVE");

    state = leaveHeart(state);
    assert.equal(state.stage, "ARCHIVE");
    assert.equal(state.journey.current, "A");
    assert.equal(state.journey.currentWorld, "ARCHIVE");
    assert.equal(state.heartReturned, true);

    state = completeReturn(state);
    assert.equal(state.stage, "RETURN");
    assert.equal(state.journey.current, "Y");
  });

  it("duplicate semantic actions are idempotent instead of double-writing", () => {
    let state = createVisibleAssemblyState();
    state = commitAssemblyChoice(state, "OBSERVE");
    const afterChoice = state.journey.trace.length;
    state = commitAssemblyChoice(state, "OBSERVE");
    assert.equal(state.journey.trace.length, afterChoice);

    state = openArchiveEvidence(state);
    const afterArchive = state.journey.trace.length;
    state = openArchiveEvidence(state);
    assert.equal(state.journey.trace.length, afterArchive);
  });

  it("serialized Browser History state restores without adding events", () => {
    let state = createVisibleAssemblyState();
    state = commitAssemblyChoice(state, "REMEMBER");
    state = openArchiveEvidence(state);
    const serialized = serializeVisibleAssembly(state);
    const restored = restoreVisibleAssembly(serialized);
    assert.equal(restored.journey.trace.length, state.journey.trace.length);
    assert.deepEqual(restored.journey.trace, state.journey.trace);
    assert.equal(restored.choice, "REMEMBER");
    assert.equal(restored.archiveOpened, true);
  });

  it("the same semantic event trace always produces the same Return signature", () => {
    const make = () => {
      let state = createVisibleAssemblyState();
      state = commitAssemblyChoice(state, "OBSERVE");
      state = openArchiveEvidence(state);
      return state;
    };
    assert.equal(createReturnSignature(make().journey), createReturnSignature(make().journey));
  });

  it("different OBSERVE/REMEMBER traces produce different Return signatures", () => {
    let observe = createVisibleAssemblyState();
    observe = commitAssemblyChoice(observe, "OBSERVE");
    observe = openArchiveEvidence(observe);

    let remember = createVisibleAssemblyState();
    remember = commitAssemblyChoice(remember, "REMEMBER");
    remember = openArchiveEvidence(remember);

    assert.notEqual(createReturnSignature(observe.journey), createReturnSignature(remember.journey));
  });

  it("re-entry preserves the prior Return artifact and trace", () => {
    let state = createVisibleAssemblyState();
    state = commitAssemblyChoice(state, "OBSERVE");
    state = openArchiveEvidence(state);
    state = completeReturn(state);
    const artifact = state.returnSignature;
    const traceBefore = state.journey.trace.length;

    state = reenterArchive(state);
    assert.equal(state.stage, "ARCHIVE");
    assert.equal(state.returnSignature, artifact);
    assert.equal(state.reentryCount, 1);
    assert.equal(state.journey.trace.length, traceBefore + 1);
  });
});
