import { buildSystem } from "../src/runtime/system.mjs";
import { describePortZero } from "../src/port-zero/index.mjs";

const s=buildSystem();

console.log("\n=== PORT ZERO / MASTER AXES ===");
console.log(JSON.stringify(describePortZero(),null,2));

console.log("\n=== CUBE + VOLUME INTEGRITY ===");
console.log(JSON.stringify({
  cube:s.panoptic.state().metaCube.integrity,
  volumes:s.volumes.verifyIntegrity()
},null,2));

console.log("\n=== WATT GEOMETRIC RELATIONSHIP ===");
console.log(JSON.stringify(s.volumes.relationship("WATT","WATT-BUILDING-A"),null,2));

console.log("\n=== VERIFIED LOCAL INTELLIGENCE ===");
const local=s.pipeline.submit({
  volumeId:"BRAINSTEM",capability:"verify",domain:"intelligence",scope:"site",
  objective:"Verify Panoptic Master geometry and evidence state."
});
console.log(JSON.stringify(s.pipeline.execute(local.id),null,2));

console.log("\n=== SIGNED HIGH-IMPACT EXTERNAL PATH ===");
const watt=s.pipeline.submit({
  volumeId:"WATT-BUILDING-A",capability:"execute",domain:"energy",scope:"site",
  objective:"Request bounded WATT execution."
});
console.log("Before approval:",watt.status);
const approved=s.pipeline.approve(watt.id);
console.log("Approval:",approved.approval.algorithm,approved.approval.payload.keyFingerprint.slice(0,16)+"...");
const result=s.pipeline.execute(watt.id);
console.log(JSON.stringify(result.result,null,2));

console.log("\n=== MASTER STATE SUMMARY ===");
const state=s.panoptic.state();
console.log(JSON.stringify({
  volumeCount:state.volumeCount,
  evidence:state.evidence,
  gaps:state.gaps,
  founderKeyFingerprint:state.founderKeyFingerprint
},null,2));