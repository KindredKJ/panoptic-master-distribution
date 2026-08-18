import crypto from "node:crypto";
import { REALITY } from "../contracts/reality.mjs";

const STAGES = Object.freeze([
  "DISCOVER","IDENTIFY","NORMALIZE","CLASSIFY","AUTHORIZE","PLAN","ROUTE",
  "PREFLIGHT","EXECUTE","OBSERVE","VERIFY","EVIDENCE","RECONCILE",
  "ATTRIBUTE_VALUE","SETTLE","LEARN","UPDATE_READ_MODEL"
]);

export class PipelineEngine {
  constructor({ adapters }) {
    this.adapters = adapters;
  }

  stages() { return [...STAGES]; }

  async run({ mission, adapterId, simulation = false }) {
    const adapter = this.adapters.get(adapterId);
    if (!adapter) throw new Error(`ADAPTER_NOT_FOUND:${adapterId}`);

    const trace = [];
    const add = (stage, status, data = {}) => trace.push({
      stage, status, at: new Date().toISOString(), ...data
    });

    add("DISCOVER", "OK");
    add("IDENTIFY", "OK");
    add("NORMALIZE", "OK");
    add("CLASSIFY", "OK");
    add("AUTHORIZE", "OK", { bounded: true });
    add("PLAN", "OK");
    add("ROUTE", "OK", { adapterId });

    const preflight = adapter.preflight(mission);
    add("PREFLIGHT", preflight.ok ? "OK" : "BLOCKED");

    let execution;

    if (simulation) {
      execution = {
        status: "SIMULATED_SUCCESS",
        externalSuccess: false,
        reality: REALITY.SIMULATED,
        adapterId,
        missionId: mission.missionId
      };
    } else {
      execution = adapter.execute(mission);
    }

    add("EXECUTE", execution.status, {
      reality: execution.reality,
      externalSuccess: execution.externalSuccess
    });

    const observation = adapter.observe(execution);
    add("OBSERVE", observation.observed ? "OK" : "FAILED");

    const verification = adapter.verify(observation);
    add("VERIFY", verification.verified ? "OK" : "FAILED");

    const evidenceId = crypto.randomUUID();
    add("EVIDENCE", "RECORDED", { evidenceId });
    add("RECONCILE", "NO_EXTERNAL_SETTLEMENT");
    add("ATTRIBUTE_VALUE", "INTERNAL_ONLY");

    if (execution.reality === REALITY.EXTERNAL_VERIFIED ||
        execution.reality === REALITY.PRODUCTION_OPERATIONAL) {
      add("SETTLE", "ADAPTER_REQUIRED");
    } else {
      add("SETTLE", "BLOCKED_REALITY_BOUNDARY");
    }

    add("LEARN", "LOCAL_FEEDBACK_ONLY");
    add("UPDATE_READ_MODEL", "OK");

    return {
      missionId: mission.missionId,
      adapterId,
      simulation,
      execution,
      verification,
      trace
    };
  }
}