/**
 * KODEX-∞ · LECTOR DEL REGISTRO DEL ATLAS
 *
 * El registro es INVENTARIO, no contenido publicable. Un registro describe qué existe,
 * con qué procedencia y bajo qué estatus cultural. Un `KodexNode` describe algo que se
 * puede mostrar. Son cosas distintas y este módulo mantiene la distinción.
 *
 * Regla dura: `culturalStatus: 'AUTHORIZATION_REQUIRED'` NO se renderiza. El canon exige
 * autorización previa para material cultural sensible, y esa barrera vive acá — en el
 * lector — para que ninguna escena tenga que acordarse de comprobarlo.
 *
 * El registro se regenera con `scripts/build-kodex-atlas-registry.mjs`. No se edita a mano.
 */

import registry from '../../data/kodex/atlas-registry.json';
import type { KodexClaimClass, KodexCulturalStatus } from './nodes';

export interface AtlasEntry {
  id: string;
  type: string;
  label: string;
  coordinate?: string;
  functionCategory?: string;
  primaryConcept?: string;
  symbols?: string[];
  mapZones?: string[];
  epistemic: {
    domains: string[];
    claimClass: KodexClaimClass;
    culturalStatus: KodexCulturalStatus;
    claims: string[];
    sourceIds?: string[];
  };
  publishable: boolean;
}

const entries = (registry as { entries: AtlasEntry[] }).entries;
const byId = new Map(entries.map((e) => [e.id, e]));

/** Todo el inventario, incluido lo que no puede mostrarse. Para auditoría y debug. */
export function allEntries(): readonly AtlasEntry[] {
  return entries;
}

export function entry(id: string): AtlasEntry | undefined {
  return byId.get(id);
}

/**
 * Lo que puede renderizarse: tiene procedencia y no espera autorización.
 * Es el único acceso que deberían usar las escenas.
 */
export function publishableEntries(): AtlasEntry[] {
  return entries.filter((e) => e.publishable);
}

export function entriesByType(type: string): AtlasEntry[] {
  return publishableEntries().filter((e) => e.type === type);
}

/** Coordenadas asignadas por el canon. Hoy solo A, M e Y tienen una. */
export function entriesByCoordinate(coordinate: string): AtlasEntry[] {
  return publishableEntries().filter((e) => e.coordinate === coordinate);
}

/**
 * Lo bloqueado, con su motivo. Que la ausencia sea visible es parte del estándar
 * epistémico: un hueco no se rellena por equilibrio estético.
 */
export function blockedEntries(): Array<AtlasEntry & { reason: string }> {
  return entries
    .filter((e) => !e.publishable)
    .map((e) => ({
      ...e,
      reason:
        e.epistemic.culturalStatus === 'AUTHORIZATION_REQUIRED'
          ? 'authorization_required'
          : 'missing_provenance',
    }));
}
