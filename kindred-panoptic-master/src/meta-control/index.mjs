import { policies } from "../core/config.mjs";

export class MetaControlPlane {
  constructor({volumes}) {
    this.volumes = volumes;
  }

  evaluate(plan) {
    const auth = this.volumes.authorizePoint(plan.intent.volumeId, plan.coordinate);
    if (!auth.allowed) return {allowed:false,reason:auth.reason};
    return {
      allowed:true,
      approvalRequired:plan.approvalRequired,
      authorizedVolume:auth.volume.id,
      rulesApplied:policies.rules.length
    };
  }
}