import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { verifyCubeTopology } from "../src/geometry/cube-topology.mjs";
import { containsBounds, intersectsBounds, adjacentBounds, coordinateOf } from "../src/geometry/volume-engine.mjs";
import { StateStore } from "../src/core/store.mjs";
import { EvidenceLedger } from "../src/evidence/index.mjs";
import { VolumeRegistry } from "../src/registry/volume-registry.mjs";
import { FounderKeyStore } from "../src/authority/founder-keys.mjs";
import { ApprovalService } from "../src/authority/approval-service.mjs";
import { AdapterRegistry } from "../src/adapters/registry.mjs";
import { BrainstemField } from "../src/brainstem/index.mjs";
import { MetaControlPlane } from "../src/meta-control/index.mjs";
import { UnifiedQuadRuntime } from "../src/uqr/index.mjs";
import { EmitCore } from "../src/emit/index.mjs";
import { IntentPipeline } from "../src/runtime/pipeline.mjs";

function runtime(){
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),"panoptic-master-"));
  process.env.KBOX_DATA_DIR=dir;
  process.env.KBOX_EXTERNAL_EXECUTION="false";
  const store=new StateStore(dir);
  const evidence=new EvidenceLedger(dir);
  const volumes=new VolumeRegistry(store);
  const keys=new FounderKeyStore(dir);
  const approvals=new ApprovalService({keys,evidence});
  const adapters=new AdapterRegistry();
  const brainstem=new BrainstemField();
  const meta=new MetaControlPlane({volumes});
  const uqr=new UnifiedQuadRuntime({adapters});
  const emit=new EmitCore({evidence});
  const pipeline=new IntentPipeline({store,brainstem,meta,uqr,emit,evidence,approvals});
  return {dir,store,evidence,volumes,keys,approvals,adapters,pipeline};
}

test("meta cube is structurally valid: 6 faces, 12 edges, 8 vertices",()=>{
  const r=verifyCubeTopology();
  assert.equal(r.ok,true);
  assert.deepEqual(r.counts,{faces:6,oppositePairs:3,edges:12,vertices:8});
});

test("geometric containment and intersection work",()=>{
  const outer={x:["observe","settle"],y:["fiscal","spatial"],z:["device","ecosystem"]};
  const inner={x:["measure","verify"],y:["energy","energy"],z:["device","site"]};
  assert.equal(containsBounds(outer,inner),true);
  assert.equal(intersectsBounds(outer,inner),true);
});

test("coordinate fabric resolves domain aliases and positions",()=>{
  const p=coordinateOf({capability:"execute",domain:"energy",scope:"building"});
  assert.ok(p.x>0&&p.y>0&&p.z>0);
});

test("canonical volume topology is contained",()=>{
  const r=runtime();
  assert.equal(r.volumes.verifyIntegrity().ok,true);
  assert.equal(r.volumes.relationship("WATT","WATT-BUILDING-A").containsAB,true);
});

test("high-impact action receives Ed25519 founder approval",()=>{
  const r=runtime();
  const intent=r.pipeline.submit({volumeId:"WATT-BUILDING-A",capability:"execute",domain:"energy",scope:"site",objective:"bounded test"});
  assert.equal(intent.status,"AWAITING_APPROVAL");
  const approved=r.pipeline.approve(intent.id);
  assert.equal(approved.approval.algorithm,"Ed25519");
  assert.equal(r.approvals.verify(approved.approval,{intentId:intent.id,plan:approved.plan}).ok,true);
});

test("tampered approved plan is rejected",()=>{
  const r=runtime();
  const intent=r.pipeline.submit({volumeId:"WATT-BUILDING-A",capability:"execute",domain:"energy",scope:"site",objective:"bounded test"});
  const approved=r.pipeline.approve(intent.id);
  const badPlan=structuredClone(approved.plan);
  badPlan.intent.objective="tampered";
  assert.equal(r.approvals.verify(approved.approval,{intentId:intent.id,plan:badPlan}).ok,false);
});

test("external adapter remains fail closed after valid approval",()=>{
  const r=runtime();
  const intent=r.pipeline.submit({volumeId:"WATT-BUILDING-A",capability:"execute",domain:"energy",scope:"site",objective:"utility test"});
  r.pipeline.approve(intent.id);
  const result=r.pipeline.execute(intent.id);
  assert.equal(result.status,"ADAPTER_REQUIRED");
  assert.equal(result.result.status,"EXTERNAL_ADAPTER_REQUIRED");
});

test("local intelligence verifies without founder approval",()=>{
  const r=runtime();
  const intent=r.pipeline.submit({volumeId:"BRAINSTEM",capability:"verify",domain:"intelligence",scope:"site",objective:"verify"});
  const result=r.pipeline.execute(intent.id);
  assert.equal(result.status,"VERIFIED");
});

test("evidence ledger remains hash-linked",()=>{
  const r=runtime();
  r.evidence.append("alpha",{n:1});
  r.evidence.append("beta",{n:2});
  assert.equal(r.evidence.verify().ok,true);
});