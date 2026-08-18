import crypto from "node:crypto";

export class EmitCore {
  constructor({evidence}) {
    this.evidence = evidence;
  }

  execute({plan,route,approvalVerification}) {
    if (plan.approvalRequired && !approvalVerification?.ok) {
      throw new Error(`SIGNED_FOUNDER_APPROVAL_REQUIRED:${approvalVerification?.reason||"MISSING"}`);
    }

    if (!route.operational) {
      const evidence = this.evidence.append("execution.external-adapter-required",{
        planId:plan.planId,volumeId:plan.intent.volumeId,domain:plan.intent.domain,
        capability:plan.intent.capability,adapter:route.adapter.id,mode:route.adapter.mode
      });
      return {
        status:"EXTERNAL_ADAPTER_REQUIRED",
        evidenceId:evidence.id,
        adapter:route.adapter.id,
        message:"The geometric/control path is valid, but external execution remains fail-closed until the adapter is verified and explicitly enabled."
      };
    }

    const receipt = {
      executionId:crypto.randomUUID(),
      planId:plan.planId,
      volumeId:plan.intent.volumeId,
      capability:plan.intent.capability,
      domain:plan.intent.domain,
      scope:plan.intent.scope,
      coordinate:plan.coordinate,
      routeId:route.routeId,
      adapter:route.adapter.id,
      result:route.adapter.mode==="local-ledger"?"LOCAL_LEDGER_OPERATION_VERIFIED":"LOCAL_OPERATION_VERIFIED",
      completedAt:new Date().toISOString()
    };
    const evidence = this.evidence.append("execution.completed",receipt);
    return {status:"VERIFIED_LOCAL_EXECUTION",evidenceId:evidence.id,receipt};
  }
}