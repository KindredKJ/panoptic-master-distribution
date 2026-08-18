import crypto from "node:crypto";
import { policies } from "../core/config.mjs";
import { coordinateOf } from "../geometry/volume-engine.mjs";

export class BrainstemField {
  plan(intent) {
    const coordinate = coordinateOf({
      capability:intent.capability,
      domain:intent.domain,
      scope:intent.scope,
      tau:{
        risk:policies.highImpactCapabilities.includes(intent.capability)?"high":"bounded",
        operationalState:"planned"
      }
    });
    const approvalRequired = policies.founderApprovalRequired && policies.highImpactCapabilities.includes(intent.capability);
    return {
      planId:crypto.randomUUID(),
      createdAt:new Date().toISOString(),
      intent,
      coordinate,
      approvalRequired,
      stages:[
        "authenticate","resolve-volume","resolve-coordinate","evaluate-authority","evaluate-policy",
        "resolve-stratum","route-uqr",approvalRequired?"await-signed-founder-approval":"continue",
        "emit","observe","verify","record-evidence","reconcile-value"
      ]
    };
  }
}