import { REALITY } from "../contracts/reality.mjs";

export class PanopticAdapter {
  constructor(descriptor) {
    this._descriptor = Object.freeze({
      version: "1.0",
      externalOperational: false,
      failClosed: true,
      reality: REALITY.PROPOSED,
      ...descriptor
    });
  }

  descriptor() { return this._descriptor; }
  capabilityManifest() { return this._descriptor.capabilities || []; }
  geometry() { return this._descriptor.geometry || null; }
  dependencies() { return this._descriptor.dependencies || []; }
  credentialsRequired() { return this._descriptor.credentialsRequired || []; }
  status() { return this._descriptor.reality; }

  health() {
    return {
      ok: true,
      adapterId: this._descriptor.adapterId,
      externalOperational: this._descriptor.externalOperational,
      reality: this._descriptor.reality
    };
  }

  preflight(mission) {
    if (!mission?.missionId) throw new Error("INVALID_MISSION");
    return { ok: true, missionId: mission.missionId };
  }

  query() { throw new Error("QUERY_UNSUPPORTED"); }

  execute(mission) {
    this.preflight(mission);

    if (!this._descriptor.externalOperational) {
      return {
        status: "EXTERNAL_ADAPTER_REQUIRED",
        reality: this._descriptor.reality,
        adapterId: this._descriptor.adapterId,
        missionId: mission.missionId,
        externalSuccess: false
      };
    }

    throw new Error("EXTERNAL_EXECUTION_NOT_IMPLEMENTED");
  }

  observe(execution) {
    return { observed: true, execution };
  }

  verify(observation) {
    return { verified: Boolean(observation?.observed), observation };
  }

  recover() {
    return { supported: false, status: "NO_RECOVERY_IMPLEMENTATION" };
  }

  evidence() {
    return { available: true, source: this._descriptor.adapterId };
  }
}