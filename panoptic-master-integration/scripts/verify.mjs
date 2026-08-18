import fs from "node:fs";

const required = [
  "state/panoptic-baseline.direct.json",
  "state/component-inventory.json",
  "state/capability-registry.json",
  "state/adapter-registry.json",
  "state/pipeline-registry.json",
  "specs/mission-envelope.schema.json",
  "specs/evidence-envelope.schema.json",
  "src/pipeline/engine.mjs",
  "src/autonomy/supervisor.mjs"
];

const missing = required.filter(f => !fs.existsSync(f));
const baseline = JSON.parse(fs.readFileSync("state/panoptic-baseline.direct.json","utf8"));
const inventory = JSON.parse(fs.readFileSync("state/component-inventory.json","utf8"));
const adapters = JSON.parse(fs.readFileSync("state/adapter-registry.json","utf8"));

const result = {
  ok: missing.length === 0 && baseline.passed === true,
  missing,
  baselinePassed: baseline.passed,
  discoveredComponents: inventory.filter(x => x.discovered).length,
  totalInventory: inventory.length,
  adapterCount: adapters.length,
  externalAdaptersEnabled: adapters.filter(x => x.externalOperational).length
};

console.log(JSON.stringify(result, null, 2));
if (!result.ok) process.exitCode = 1;