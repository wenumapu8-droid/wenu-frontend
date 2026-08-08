/**
 * Minimal module hooks so the Organism Engine's TypeScript sources can be
 * imported by Node's native test runner (`node --test`) without a bundler.
 *
 * Node 24 strips types on its own, but two Vite-only conventions still need a
 * shim:
 *
 *   1. Extensionless relative specifiers (`./validation`, `../types`) — Node's
 *      ESM resolver requires a real file extension.
 *   2. Shader/asset imports (`.vert`, `.frag`) — Vite turns these into string
 *      modules; Node refuses the unknown extension.
 *
 * Usage:
 *   node --import ./src/kodex/organism-engine/__tests__/node-test-hooks.mjs \
 *        --test src/kodex/organism-engine/__tests__/*.test.ts
 *
 * This is deliberately small and scoped to the engine's tests. When the shared
 * KODEX test runner lands it should replace this file, not extend it.
 */
import { registerHooks } from "node:module";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const ASSET_EXTENSIONS = /\.(vert|frag|glsl|wgsl|css|svg|png|jpe?g|webp|avif)$/i;
const CANDIDATE_EXTENSIONS = [".ts", ".js", ".mjs", "/index.ts", "/index.js"];

registerHooks({
  resolve(specifier, context, nextResolve) {
    const isRelative = specifier.startsWith("./") || specifier.startsWith("../");
    const hasExtension = /\.[a-z0-9]+$/i.test(specifier);

    if (isRelative && !hasExtension) {
      for (const extension of CANDIDATE_EXTENSIONS) {
        try {
          const resolved = nextResolve(specifier + extension, context);
          if (existsSync(fileURLToPath(resolved.url))) return resolved;
        } catch {
          // Try the next candidate extension.
        }
      }
    }

    return nextResolve(specifier, context);
  },

  load(url, context, nextLoad) {
    if (ASSET_EXTENSIONS.test(new URL(url).pathname)) {
      // Shader sources are irrelevant to registry/validation behaviour; the
      // adapters only need the import to succeed so the module graph loads.
      return { format: "module", shortCircuit: true, source: 'export default "";' };
    }

    return nextLoad(url, context);
  },
});
