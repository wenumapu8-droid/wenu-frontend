import { resolve, sep } from 'node:path';

/**
 * Resolve a file only when its exact basename is explicitly allowlisted.
 * Returns null for traversal, absolute paths, nested paths, or undeclared names.
 */
export function resolveAllowlistedFile(root, name, allowlist) {
  if (typeof name !== 'string' || !Array.isArray(allowlist)) return null;
  if (!allowlist.includes(name)) return null;

  const rootResolved = resolve(root);
  const candidate = resolve(rootResolved, name);

  if (candidate !== rootResolved && !candidate.startsWith(rootResolved + sep)) {
    return null;
  }
  return candidate;
}
