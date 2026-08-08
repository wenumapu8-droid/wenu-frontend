import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { OrganismRegistry, organismRegistry } from "../registry";
import type {
  OrganismAdapterFactory,
  OrganismFamily,
  OrganismRuntime,
  RenderMode,
} from "../types";
import { makePreset } from "./preset-fixture";

/** A canvas stand-in: the registry only forwards it, it never touches it. */
const canvas = {} as HTMLCanvasElement;

interface StubAdapter extends OrganismAdapterFactory {
  calls: Array<{ canvas: HTMLCanvasElement; presetId: string }>;
}

function makeAdapter(
  family: OrganismFamily,
  supportedModes: RenderMode[] = ["SHADER"],
): StubAdapter {
  const calls: StubAdapter["calls"] = [];

  return {
    family,
    supportedModes,
    calls,
    create(targetCanvas, preset) {
      calls.push({ canvas: targetCanvas, presetId: preset.id });
      return { preset } as unknown as OrganismRuntime;
    },
  };
}

describe("OrganismRegistry — presets", () => {
  it("validates on registration and refuses an invalid preset", () => {
    const registry = new OrganismRegistry();

    assert.throws(
      () => registry.registerPreset(makePreset({ id: "NOT-KEBAB" })),
      /Invalid organism preset NOT-KEBAB: id must be lower-kebab-case/,
    );
  });

  it("refuses an unprovenanced IMPLEMENTED preset, so the gate holds at the registry", () => {
    const registry = new OrganismRegistry();

    assert.throws(
      () =>
        registry.registerPreset(
          makePreset({
            id: "no-provenance",
            status: "IMPLEMENTED",
            renderMode: "IMAGE_FIELD",
            assets: { fallback: "/f.webp", source: "/s.webp" },
          }),
        ),
      /require assets\.sourceId for provenance/,
    );

    assert.throws(() => registry.getPreset("no-provenance"), /Unknown KODEX organism preset/);
  });

  it("does not retain a preset that failed validation", () => {
    const registry = new OrganismRegistry();

    assert.throws(() => registry.registerPreset(makePreset({ id: "bad", behaviors: [] })));
    assert.deepEqual(registry.list(), []);
  });

  it("rejects a duplicate preset id", () => {
    const registry = new OrganismRegistry().registerPreset(makePreset({ id: "twice" }));

    assert.throws(
      () => registry.registerPreset(makePreset({ id: "twice" })),
      /KODEX organism preset already registered: twice/,
    );
    assert.equal(registry.list().length, 1);
  });

  it("returns the registered preset by id", () => {
    const preset = makePreset({ id: "findable" });
    const registry = new OrganismRegistry().registerPreset(preset);

    assert.equal(registry.getPreset("findable"), preset);
  });

  it("throws for an unknown preset id", () => {
    assert.throws(
      () => new OrganismRegistry().getPreset("missing"),
      /Unknown KODEX organism preset: missing/,
    );
  });

  it("lists presets in registration order", () => {
    const registry = new OrganismRegistry()
      .registerPreset(makePreset({ id: "first" }))
      .registerPreset(makePreset({ id: "second" }));

    assert.deepEqual(
      registry.list().map((preset) => preset.id),
      ["first", "second"],
    );
  });

  it("returns a fresh array from list(), so callers cannot mutate the registry", () => {
    const registry = new OrganismRegistry().registerPreset(makePreset({ id: "only" }));

    registry.list().length = 0;
    assert.equal(registry.list().length, 1);
  });
});

describe("OrganismRegistry — adapters", () => {
  it("rejects a duplicate adapter family", () => {
    const registry = new OrganismRegistry().registerAdapter(makeAdapter("FIELD"));

    assert.throws(
      () => registry.registerAdapter(makeAdapter("FIELD")),
      /KODEX organism adapter already registered: FIELD/,
    );
  });

  it("accepts different families side by side", () => {
    assert.doesNotThrow(() =>
      new OrganismRegistry().registerAdapter(makeAdapter("FIELD")).registerAdapter(makeAdapter("VORTEX")),
    );
  });

  it("returns this from both register methods so construction can chain", () => {
    const registry = new OrganismRegistry();

    assert.equal(registry.registerAdapter(makeAdapter("FIELD")), registry);
    assert.equal(registry.registerPreset(makePreset({ id: "chained" })), registry);
  });
});

describe("OrganismRegistry — create", () => {
  it("delegates to the adapter for the preset family with the same canvas and preset", () => {
    const adapter = makeAdapter("FIELD");
    const preset = makePreset({ id: "wired", family: "FIELD", renderMode: "SHADER" });
    const registry = new OrganismRegistry().registerAdapter(adapter).registerPreset(preset);

    const runtime = registry.create(canvas, "wired");

    assert.deepEqual(adapter.calls, [{ canvas, presetId: "wired" }]);
    assert.equal(runtime.preset, preset);
  });

  it("selects the adapter by family, not by registration order", () => {
    const field = makeAdapter("FIELD");
    const vortex = makeAdapter("VORTEX");
    const registry = new OrganismRegistry()
      .registerAdapter(field)
      .registerAdapter(vortex)
      .registerPreset(makePreset({ id: "to-vortex", family: "VORTEX" }));

    registry.create(canvas, "to-vortex");

    assert.equal(field.calls.length, 0);
    assert.equal(vortex.calls.length, 1);
  });

  it("reports a preset whose family has no adapter as specification-only", () => {
    const registry = new OrganismRegistry().registerPreset(
      makePreset({ id: "spec-only", family: "TERRAIN" }),
    );

    assert.throws(
      () => registry.create(canvas, "spec-only"),
      /No adapter registered for TERRAIN\. Preset spec-only remains specification-only\./,
    );
  });

  it("refuses a render mode the adapter does not support", () => {
    const adapter = makeAdapter("FIELD", ["SHADER"]);
    const registry = new OrganismRegistry().registerAdapter(adapter).registerPreset(
      makePreset({
        id: "wrong-mode",
        family: "FIELD",
        renderMode: "IMAGE_FIELD",
        assets: { fallback: "/f.webp", source: "/s.webp" },
      }),
    );

    assert.throws(
      () => registry.create(canvas, "wrong-mode"),
      /Adapter FIELD does not support IMAGE_FIELD for preset wrong-mode\./,
    );
    assert.equal(adapter.calls.length, 0);
  });

  it("throws for an unknown preset before touching any adapter", () => {
    const adapter = makeAdapter("FIELD");
    const registry = new OrganismRegistry().registerAdapter(adapter);

    assert.throws(() => registry.create(canvas, "nope"), /Unknown KODEX organism preset: nope/);
    assert.equal(adapter.calls.length, 0);
  });
});

describe("organismRegistry — the shipped singleton", () => {
  it("registers exactly the canonical presets", () => {
    assert.deepEqual(
      organismRegistry.list().map((preset) => preset.id).sort(),
      ["signal-vortex", "threshold-portal"],
    );
  });

  it("keeps every shipped preset valid — module load would have thrown otherwise", () => {
    for (const preset of organismRegistry.list()) {
      assert.equal(organismRegistry.getPreset(preset.id), preset);
    }
  });

  it("has an adapter for every shipped preset that supports its render mode", () => {
    for (const preset of organismRegistry.list()) {
      // create() throws if the family has no adapter or the mode is unsupported.
      // Any other throw comes from the adapter itself and is out of scope here.
      try {
        organismRegistry.create(canvas, preset.id);
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        assert.doesNotMatch(message, /No adapter registered for/, preset.id);
        assert.doesNotMatch(message, /does not support/, preset.id);
      }
    }
  });

  it("wires threshold-portal to the FIELD family in IMAGE_FIELD mode", () => {
    const preset = organismRegistry.getPreset("threshold-portal");

    assert.equal(preset.family, "FIELD");
    assert.equal(preset.renderMode, "IMAGE_FIELD");
  });

  it("wires signal-vortex to the VORTEX family in SHADER mode", () => {
    const preset = organismRegistry.getPreset("signal-vortex");

    assert.equal(preset.family, "VORTEX");
    assert.equal(preset.renderMode, "SHADER");
  });

  it("refuses to re-register a canonical preset id", () => {
    assert.throws(
      () => organismRegistry.registerPreset(makePreset({ id: "threshold-portal" })),
      /already registered: threshold-portal/,
    );
  });
});
