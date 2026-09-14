import { KodexWorld } from './kodexWorld.js';

/**
 * Browser-only KodexWorld variant for KDX Engine integration.
 *
 * The base renderer remains unchanged. This subclass suppresses its legacy
 * document-level mouse/touch listeners so input can arrive exclusively through
 * KdxSignalBus -> KodexWorldRendererAdapter. Rendering, shaders, telemetry,
 * plans and performance governor all remain the existing KodexWorld runtime.
 */
export class ExternalSignalKodexWorld extends KodexWorld {
  _bindInput() {
    // Intentionally empty: KDX Engine owns the signal boundary in this mode.
  }
}
