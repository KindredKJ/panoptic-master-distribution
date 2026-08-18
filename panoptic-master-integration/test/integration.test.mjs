import test from "node:test";
import assert from "node:assert/strict";

import { REALITY, canPromote } from "../src/contracts/reality.mjs";
import { newMission } from "../src/contracts/mission.mjs";
import { buildAdapterRegistry } from "../src/registry/adapters.mjs";
import { PipelineEngine } from "../src/pipeline/engine.mjs";
import { AutonomySupervisor } from "../src/autonomy/supervisor.mjs";
import { enrollNode } from "../src/nodes/enrollment.mjs";
import { provisionService } from "../src/commercial/provision.mjs";

test("reality status cannot leapfrog multiple levels", () => {
  assert.equal(canPromote(REALITY.PROPOSED, REALITY.LOCAL_VERIFIED), true);
  assert.equal(canPromote(REALITY.PROPOSED, REALITY.PRODUCTION_OPERATIONAL), false);
});

test("mission envelope has bounded identity and economic separation", () => {
  const m = newMission({ objective: "local test" });
  assert.equal(m.schemaVersion, "1.0");
  assert.equal(m.economicAttribution.collectedCashCents, 0);
  assert.equal(m.economicAttribution.bankSettlement, false);
});

test("unverified adapter fails closed", async () => {
  const adapters = buildAdapterRegistry();
  const engine = new PipelineEngine({ adapters });
  const adapterId = [...adapters.keys()][0];
  const m = newMission({ objective: "fail closed test" });
  const result = await engine.run({ mission: m, adapterId });
  assert.equal(result.execution.externalSuccess, false);
  assert.equal(result.execution.status, "EXTERNAL_ADAPTER_REQUIRED");
});

test("simulation is explicitly not external reality", async () => {
  const adapters = buildAdapterRegistry();
  const engine = new PipelineEngine({ adapters });
  const adapterId = [...adapters.keys()][0];
  const m = newMission({ objective: "simulation test" });
  const result = await engine.run({ mission: m, adapterId, simulation: true });
  assert.equal(result.execution.reality, REALITY.SIMULATED);
  assert.equal(result.execution.externalSuccess, false);
});

test("A4 can automate only reversible preauthorized work", () => {
  const s = new AutonomySupervisor({ level: "A4" });
  const d = s.classify({ preAuthorized: true, reversible: true, impactClass: "reversible-local" });
  assert.equal(d.permittedAutomatically, true);
});

test("A4 escalates external financial movement", () => {
  const s = new AutonomySupervisor({ level: "A4" });
  const d = s.classify({ preAuthorized: true, reversible: false, impactClass: "external-financial-transfer" });
  assert.equal(d.mustEscalate, true);
  assert.equal(d.permittedAutomatically, false);
});

test("ordinary node cannot receive Port Zero authority", () => {
  assert.throws(() => enrollNode({ rootAuthority: true }), /ORDINARY_NODE_CANNOT_INHERIT_PORT_ZERO_AUTHORITY/);
});

test("client service remains tenant scoped", () => {
  const s = provisionService({ organizationId: "CLIENT-A" });
  assert.equal(s.founderRootAccess, false);
  assert.equal(s.accounting.bankSettlement, false);
});