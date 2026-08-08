import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type { OrganismPreset, RenderMode } from "../types";
import { assertOrganismPreset, validateOrganismPreset } from "../validation";
import { makePreset } from "./preset-fixture";

const ASSET_DEPENDENT_MODES: RenderMode[] = [
  "IMAGE_FIELD",
  "DEPTH_STACK",
  "PARTICLES",
  "GLB",
  "LAYERED_PLANES",
];

describe("validateOrganismPreset", () => {
  it("accepts the reference-shaped preset with no errors and no warnings", () => {
    const result = validateOrganismPreset(makePreset());
    assert.deepEqual(result, { valid: true, errors: [], warnings: [] });
  });

  describe("provenance gate — assets.sourceId", () => {
    // This is the rule the KOD-42 audit singled out: an asset-driven preset
    // that claims to be finished must name where its asset came from.
    for (const status of ["IMPLEMENTED", "TESTED"] as const) {
      it(`rejects ${status} asset-driven presets that omit assets.sourceId`, () => {
        const result = validateOrganismPreset(
          makePreset({
            status,
            renderMode: "IMAGE_FIELD",
            assets: { fallback: "/f.webp", source: "/s.webp" },
          }),
        );

        assert.equal(result.valid, false);
        assert.ok(
          result.errors.includes(
            `${status} asset-driven presets require assets.sourceId for provenance`,
          ),
          `expected a provenance error, got: ${JSON.stringify(result.errors)}`,
        );
      });

      it(`accepts ${status} asset-driven presets that declare assets.sourceId`, () => {
        const result = validateOrganismPreset(
          makePreset({
            status,
            renderMode: "IMAGE_FIELD",
            assets: { fallback: "/f.webp", source: "/s.webp", sourceId: "kdx-src-001" },
          }),
        );

        assert.equal(result.valid, true, JSON.stringify(result.errors));
      });
    }

    it("exempts SHADER presets, which generate their own pixels", () => {
      const result = validateOrganismPreset(
        makePreset({ status: "IMPLEMENTED", renderMode: "SHADER" }),
      );

      assert.equal(result.valid, true, JSON.stringify(result.errors));
    });

    it("does not require sourceId for statuses that are not yet shipped", () => {
      for (const status of ["REFERENCE", "EXPERIMENTAL", "PROTOTYPE", "DEPRECATED"] as const) {
        const result = validateOrganismPreset(
          makePreset({
            status,
            renderMode: "IMAGE_FIELD",
            assets: { fallback: "/f.webp", source: "/s.webp" },
          }),
        );

        assert.equal(result.valid, true, `${status}: ${JSON.stringify(result.errors)}`);
      }
    });
  });

  describe("rights status", () => {
    // Documented, deliberately: rights are WARNINGS, not errors. An UNKNOWN
    // rights preset still validates and will therefore still render. If rights
    // are meant to be a hard gate, this is the test that must change first.
    it("warns but does not fail on UNKNOWN rights", () => {
      const result = validateOrganismPreset(
        makePreset({ assets: { fallback: "/f.webp", rightsStatus: "UNKNOWN" } }),
      );

      assert.equal(result.valid, true);
      assert.deepEqual(result.warnings, ["asset rights are unknown; do not publish this preset"]);
    });

    it("warns but does not fail on REVIEW_REQUIRED rights", () => {
      const result = validateOrganismPreset(
        makePreset({ assets: { fallback: "/f.webp", rightsStatus: "REVIEW_REQUIRED" } }),
      );

      assert.equal(result.valid, true);
      assert.deepEqual(result.warnings, [
        "asset rights require creator review before public use",
      ]);
    });

    it("stays silent on CLEARED and INTERNAL_ONLY rights", () => {
      for (const rightsStatus of ["CLEARED", "INTERNAL_ONLY"] as const) {
        const result = validateOrganismPreset(
          makePreset({ assets: { fallback: "/f.webp", rightsStatus } }),
        );

        assert.deepEqual(result.warnings, [], rightsStatus);
      }
    });
  });

  describe("identity", () => {
    it("accepts lower-kebab-case ids", () => {
      for (const id of ["field", "threshold-portal", "kdx-2-alpha", "a1"]) {
        assert.equal(validateOrganismPreset(makePreset({ id })).valid, true, id);
      }
    });

    it("rejects ids that are not lower-kebab-case", () => {
      for (const id of ["Threshold-Portal", "threshold_portal", "-leading", "trailing-", "a--b", ""]) {
        const result = validateOrganismPreset(makePreset({ id }));
        assert.equal(result.valid, false, `expected ${JSON.stringify(id)} to be rejected`);
        assert.ok(result.errors.includes("id must be lower-kebab-case"));
      }
    });
  });

  describe("assets", () => {
    it("requires assets.fallback", () => {
      const result = validateOrganismPreset(
        makePreset({ assets: { fallback: "" } as OrganismPreset["assets"] }),
      );

      assert.equal(result.valid, false);
      assert.ok(result.errors.includes("assets.fallback is required"));
    });

    it("requires a real asset for every asset-dependent render mode", () => {
      for (const renderMode of ASSET_DEPENDENT_MODES) {
        const result = validateOrganismPreset(
          makePreset({ renderMode, assets: { fallback: "/f.webp" } }),
        );

        assert.equal(result.valid, false, renderMode);
        assert.ok(
          result.errors.includes(
            `${renderMode} requires assets.source, assets.model or a sprite sequence`,
          ),
          renderMode,
        );
      }
    });

    it("satisfies asset-dependent modes via source, model or spriteSequence", () => {
      const variants: OrganismPreset["assets"][] = [
        { fallback: "/f.webp", source: "/s.webp" },
        { fallback: "/f.webp", model: "/m.glb" },
        { fallback: "/f.webp", spriteSequence: ["/a.webp", "/b.webp"] },
      ];

      for (const assets of variants) {
        const result = validateOrganismPreset(makePreset({ renderMode: "PARTICLES", assets }));
        assert.equal(result.valid, true, JSON.stringify(assets));
      }
    });

    it("treats an empty spriteSequence as no asset at all", () => {
      const result = validateOrganismPreset(
        makePreset({ renderMode: "PARTICLES", assets: { fallback: "/f.webp", spriteSequence: [] } }),
      );

      assert.equal(result.valid, false);
    });

    it("does not demand assets for SVG, which is not asset-dependent", () => {
      const result = validateOrganismPreset(
        makePreset({ renderMode: "SVG", assets: { fallback: "/f.webp" } }),
      );

      assert.equal(result.valid, true, JSON.stringify(result.errors));
    });
  });

  describe("behaviour and interaction", () => {
    it("requires at least one behavior", () => {
      const result = validateOrganismPreset(makePreset({ behaviors: [] }));
      assert.equal(result.valid, false);
      assert.ok(result.errors.includes("at least one behavior is required"));
    });

    it("requires a keyboard equivalent", () => {
      const preset = makePreset();
      const result = validateOrganismPreset({
        ...preset,
        interaction: { ...preset.interaction, keyboardEquivalent: undefined },
      });

      assert.equal(result.valid, false);
      assert.ok(result.errors.includes("interaction.keyboardEquivalent is required"));
    });

    it("requires a touch equivalent", () => {
      const preset = makePreset();
      const result = validateOrganismPreset({
        ...preset,
        interaction: { ...preset.interaction, touchEquivalent: undefined },
      });

      assert.equal(result.valid, false);
      assert.ok(result.errors.includes("interaction.touchEquivalent is required"));
    });
  });

  describe("performance and controls", () => {
    it("accepts maxDpr on the inclusive 0.5..2 boundary", () => {
      for (const maxDpr of [0.5, 1, 2]) {
        const preset = makePreset();
        const result = validateOrganismPreset({
          ...preset,
          performance: { ...preset.performance, maxDpr },
        });

        assert.equal(result.valid, true, `maxDpr=${maxDpr}`);
      }
    });

    it("rejects maxDpr outside 0.5..2", () => {
      for (const maxDpr of [0.49, 2.01, 0, -1, 4]) {
        const preset = makePreset();
        const result = validateOrganismPreset({
          ...preset,
          performance: { ...preset.performance, maxDpr },
        });

        assert.equal(result.valid, false, `maxDpr=${maxDpr}`);
        assert.ok(result.errors.includes("performance.maxDpr must be between 0.5 and 2"));
      }
    });

    it("rejects control values outside 0..1 and non-finite values", () => {
      for (const value of [-0.01, 1.01, Number.NaN, Number.POSITIVE_INFINITY]) {
        const preset = makePreset();
        const result = validateOrganismPreset({
          ...preset,
          controls: { ...preset.controls, entropy: value },
        });

        assert.equal(result.valid, false, `entropy=${value}`);
        assert.ok(
          result.errors.includes("controls.entropy must be a finite number between 0 and 1"),
          `entropy=${value}`,
        );
      }
    });

    it("accepts control values on the 0 and 1 boundaries", () => {
      const preset = makePreset();
      for (const value of [0, 1]) {
        const result = validateOrganismPreset({
          ...preset,
          controls: { ...preset.controls, entropy: value },
        });

        assert.equal(result.valid, true, `entropy=${value}`);
      }
    });

    it("names every offending control, not just the first", () => {
      const preset = makePreset();
      const result = validateOrganismPreset({
        ...preset,
        controls: { ...preset.controls, entropy: 2, depth: -1 },
      });

      assert.ok(result.errors.includes("controls.entropy must be a finite number between 0 and 1"));
      assert.ok(result.errors.includes("controls.depth must be a finite number between 0 and 1"));
    });
  });

  it("warns when a preset declares no memory write", () => {
    const result = validateOrganismPreset(makePreset({ memory: { writes: [] } }));

    assert.equal(result.valid, true);
    assert.deepEqual(result.warnings, [
      "preset declares no memory write; confirm that it is atmospheric only",
    ]);
  });

  it("reports every independent failure at once", () => {
    const result = validateOrganismPreset(
      makePreset({ id: "BAD_ID", behaviors: [], assets: { fallback: "" } as OrganismPreset["assets"] }),
    );

    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 3);
  });
});

describe("assertOrganismPreset", () => {
  it("returns silently for a valid preset", () => {
    assert.doesNotThrow(() => assertOrganismPreset(makePreset()));
  });

  it("does not throw on warnings alone", () => {
    assert.doesNotThrow(() =>
      assertOrganismPreset(makePreset({ assets: { fallback: "/f.webp", rightsStatus: "UNKNOWN" } })),
    );
  });

  it("throws naming the preset id and every error", () => {
    assert.throws(
      () => assertOrganismPreset(makePreset({ id: "bad-one", behaviors: [] })),
      (error: unknown) => {
        assert.ok(error instanceof Error);
        assert.match(error.message, /^Invalid organism preset bad-one: /);
        assert.match(error.message, /at least one behavior is required/);
        return true;
      },
    );
  });

  it("joins multiple errors with a semicolon", () => {
    assert.throws(
      () => assertOrganismPreset(makePreset({ id: "BAD", behaviors: [] })),
      /id must be lower-kebab-case; at least one behavior is required/,
    );
  });

  it("blocks an unprovenanced IMPLEMENTED preset from being accepted", () => {
    assert.throws(
      () =>
        assertOrganismPreset(
          makePreset({
            id: "unprovenanced",
            status: "IMPLEMENTED",
            renderMode: "IMAGE_FIELD",
            assets: { fallback: "/f.webp", source: "/s.webp" },
          }),
        ),
      /require assets\.sourceId for provenance/,
    );
  });
});
