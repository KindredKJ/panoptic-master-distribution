import { StateStore } from "../core/store.mjs";
import { EvidenceLedger } from "../evidence/index.mjs";
import { VolumeRegistry } from "../registry/volume-registry.mjs";
import { FounderKeyStore } from "../authority/founder-keys.mjs";
import { ApprovalService } from "../authority/approval-service.mjs";
import { AdapterRegistry } from "../adapters/registry.mjs";
import { BrainstemField } from "../brainstem/index.mjs";
import { MetaControlPlane } from "../meta-control/index.mjs";
import { UnifiedQuadRuntime } from "../uqr/index.mjs";
import { EmitCore } from "../emit/index.mjs";
import { RetroBank } from "../retrobank/index.mjs";
import { IntentPipeline } from "./pipeline.mjs";
import { PanopticReadModel } from "../panoptic/read-model.mjs";

export function buildSystem() {
  const store=new StateStore();
  const evidence=new EvidenceLedger();
  const volumes=new VolumeRegistry(store);
  const keys=new FounderKeyStore();
  const approvals=new ApprovalService({keys,evidence});
  const adapters=new AdapterRegistry();
  const brainstem=new BrainstemField();
  const meta=new MetaControlPlane({volumes});
  const uqr=new UnifiedQuadRuntime({adapters});
  const emit=new EmitCore({evidence});
  const retrobank=new RetroBank({store,evidence});
  const pipeline=new IntentPipeline({store,brainstem,meta,uqr,emit,evidence,approvals});
  const panoptic=new PanopticReadModel({volumes,evidence,store,adapters,keys});
  return {store,evidence,volumes,keys,approvals,adapters,brainstem,meta,uqr,emit,retrobank,pipeline,panoptic};
}