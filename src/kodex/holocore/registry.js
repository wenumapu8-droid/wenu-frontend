import { holocoreOrbitalScene } from "../ascii/scenes/holocore-orbital.js";
import { holocoreSignalCoreScene } from "../ascii/scenes/holocore-signal-core.js";
import { holocoreInterferencePortalScene } from "../ascii/scenes/holocore-interference-portal.js";

const SPECIMENS = Object.freeze({
  "orbital-city": Object.freeze({
    id: "orbital-city",
    title: "ORBITAL CITY",
    render: "PROCEDURAL ASCII",
    scene: holocoreOrbitalScene,
    accent: "#a06cff",
    palette: ["#030208", "#151024", "#33204e", "#613b89", "#a06cff", "#eee7ff"],
    label: "Procedural ASCII holographic visualization of an exploded orbital city resolving inside a bounded KODEX viewport",
    provenance: "KODEX_SYNTHETIC_SPECULATIVE",
  }),
  "signal-core": Object.freeze({
    id: "signal-core",
    title: "SIGNAL CORE",
    render: "ASCII COHERENCE FIELD",
    scene: holocoreSignalCoreScene,
    accent: "#b7ff4a",
    palette: ["#020503", "#0b1c0b", "#17431d", "#3d7d31", "#9bd94c", "#f3ffe7"],
    label: "Synthetic KODEX signal core with luminous center, radial cage, data dither and bounded circulating signal packets",
    provenance: "KODEX_SYNTHETIC_REFERENCE_ABSTRACTION",
  }),
  "interference-portal": Object.freeze({
    id: "interference-portal",
    title: "INTERFERENCE PORTAL",
    render: "ASCII PHASE FIELD",
    scene: holocoreInterferencePortalScene,
    accent: "#64d7ff",
    palette: ["#020408", "#081a26", "#123b50", "#286b83", "#68cce5", "#effcff"],
    label: "Synthetic KODEX optical phase field with slow interference, sixfold symmetry and a bounded central aperture",
    provenance: "KODEX_SYNTHETIC_REFERENCE_ABSTRACTION",
  }),
});

export const HOLOCORE_DEFAULT_SPECIMEN_ID = "orbital-city";
export const HOLOCORE_SPECIMEN_IDS = Object.freeze(Object.keys(SPECIMENS));

export function resolveHoloCoreSpecimen(id) {
  return SPECIMENS[id] ?? SPECIMENS[HOLOCORE_DEFAULT_SPECIMEN_ID];
}

export function getHoloCoreSpecimens() {
  return HOLOCORE_SPECIMEN_IDS.map(id => SPECIMENS[id]);
}
