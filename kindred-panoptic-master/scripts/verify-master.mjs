import { buildSystem } from "../src/runtime/system.mjs";
import { verifyCubeTopology } from "../src/geometry/cube-topology.mjs";

const s=buildSystem();
const results={
  cube:verifyCubeTopology(),
  volumes:s.volumes.verifyIntegrity(),
  evidence:s.evidence.verify()
};
console.log(JSON.stringify(results,null,2));
if(!results.cube.ok||!results.volumes.ok||!results.evidence.ok) process.exitCode=1;