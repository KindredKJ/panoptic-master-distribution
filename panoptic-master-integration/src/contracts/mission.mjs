import crypto from "node:crypto";

export function newMission(input = {}) {
  const now = new Date().toISOString();
  const missionId = input.missionId || crypto.randomUUID();

  return {
    schemaVersion: "1.0",
    missionId,
    parentMissionId: input.parentMissionId ?? null,
    correlationId: input.correlationId || missionId,
    lineageId: input.lineageId || missionId,
    actor: input.actor || { type: "founder-local", id: "LOCAL-FOUNDER" },
    tenant: input.tenant || { id: "KINDRED-LABS" },
    founderGate: input.founderGate || { required: false, approved: false },
    sourceVolume: input.sourceVolume || "PANOPTIC-MASTER",
    destinationVolume: input.destinationVolume || "PANOPTIC-MASTER",
    coordinate: input.coordinate || { x: "observe", y: "intelligence", z: "site", tau: { state: "planned" } },
    capability: input.capability || "observe",
    objective: String(input.objective || ""),
    authority: input.authority || { bounded: true },
    policy: input.policy || { decision: "PENDING" },
    budget: input.budget || { maxSteps: 12, maxRetries: 2, maxSeconds: 120 },
    idempotencyKey: input.idempotencyKey || crypto.createHash("sha256").update(missionId + "|" + String(input.objective || "")).digest("hex"),
    deadline: input.deadline || new Date(Date.now() + 120000).toISOString(),
    retry: input.retry || { maxAttempts: 2, backoffMs: 250 },
    evidenceRequirements: input.evidenceRequirements || ["execution-receipt","verification"],
    economicAttribution: input.economicAttribution || { internalValueCents: 0, invoicedCents: 0, collectedCashCents: 0, bankSettlement: false },
    createdAt: now,
    proof: input.proof || { algorithm: null, signature: null }
  };
}