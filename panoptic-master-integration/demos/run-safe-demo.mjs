import { newMission } from "../src/contracts/mission.mjs";
import { buildAdapterRegistry } from "../src/registry/adapters.mjs";
import { PipelineEngine } from "../src/pipeline/engine.mjs";

const adapters = buildAdapterRegistry();
const engine = new PipelineEngine({ adapters });

const preferred = [...adapters.keys()].find(x => x.toLowerCase().includes("brainstem")) || [...adapters.keys()][0];

const mission = newMission({
  objective: "SIMULATION: demonstrate full Panoptic pipeline without external effects.",
  capability: "verify"
});

const result = await engine.run({
  mission,
  adapterId: preferred,
  simulation: true
});

console.log(JSON.stringify(result, null, 2));