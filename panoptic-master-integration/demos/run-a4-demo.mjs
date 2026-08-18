import { newMission } from "../src/contracts/mission.mjs";
import { AutonomySupervisor } from "../src/autonomy/supervisor.mjs";

const mission = newMission({
  objective: "SIMULATION: bounded multi-component A4 mission."
});

const supervisor = new AutonomySupervisor({ level: "A4" });

const plan = supervisor.decompose(mission, [
  { name: "read local state", preAuthorized: true, reversible: true, impactClass: "reversible-local" },
  { name: "generate local report", preAuthorized: true, reversible: true, impactClass: "reversible-local" },
  { name: "external payment", preAuthorized: false, reversible: false, impactClass: "external-financial-transfer" }
]);

console.log(JSON.stringify({
  simulation: true,
  missionId: mission.missionId,
  autonomy: "A4",
  plan
}, null, 2));