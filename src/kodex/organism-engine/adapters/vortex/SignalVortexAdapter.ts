import type { OrganismAdapterFactory } from "../../types";
import { SignalVortexRuntime } from "./SignalVortexRuntime";

export const signalVortexAdapter: OrganismAdapterFactory = {
  family: "VORTEX",
  supportedModes: ["SHADER"],
  create(canvas, preset) {
    return new SignalVortexRuntime(canvas, preset);
  },
};
