import { geometry, cubeTopology, strata } from "../core/config.mjs";
import { verifyCubeTopology } from "../geometry/cube-topology.mjs";
import { xIndex, yIndex, zIndex } from "../geometry/axes.mjs";
import { normalizeBounds } from "../geometry/volume-engine.mjs";
import { describePortZero } from "../port-zero/index.mjs";

export class PanopticReadModel {
  constructor({volumes,evidence,store,adapters,keys}) {
    this.volumes=volumes; this.evidence=evidence; this.store=store; this.adapters=adapters; this.keys=keys;
  }

  coverageMatrix() {
    const all=this.volumes.all();
    const caps=geometry.operationalFabric.xCapability;
    const result={};
    for(const s of strata){
      result[s.id]={};
      for(const cap of caps){
        const xi=xIndex(cap), yi=yIndex(s.id);
        result[s.id][cap]=all.filter(v=>{
          const b=normalizeBounds(v.bounds);
          return xi>=b.xMin&&xi<=b.xMax&&yi>=b.yMin&&yi<=b.yMax;
        }).map(v=>v.id);
      }
    }
    return result;
  }

  gaps() {
    const gaps=[...this.adapters.gaps()];
    const vi=this.volumes.verifyIntegrity();
    if(!vi.ok) gaps.push(...vi.errors.map(reason=>({type:"VOLUME_INTEGRITY",reason})));
    const ct=verifyCubeTopology();
    if(!ct.ok) gaps.push(...ct.errors.map(reason=>({type:"CUBE_TOPOLOGY",reason})));
    return gaps;
  }

  state() {
    const intents=this.store.read("intents",[]);
    const values=this.store.read("value-events",[]);
    const evidence=this.evidence.verify();
    return {
      system:"Kindred Panoptic Master",
      version:"2.0.0",
      portZero:describePortZero(),
      metaCube:{
        faces:geometry.metaCube.faces,
        oppositePairs:geometry.metaCube.oppositePairs,
        edges:cubeTopology.edges,
        vertices:cubeTopology.vertices,
        integrity:verifyCubeTopology()
      },
      operationalFabric:geometry.operationalFabric,
      volumeIntegrity:this.volumes.verifyIntegrity(),
      volumeCount:this.volumes.all().length,
      topology:this.volumes.topology(),
      adapters:this.adapters.all(),
      evidence,
      founderKeyFingerprint:this.keys.fingerprint(),
      intentSummary:{
        total:intents.length,
        byStatus:Object.fromEntries([...new Set(intents.map(x=>x.status))].map(s=>[s,intents.filter(x=>x.status===s).length]))
      },
      valueSummary:{
        internalValueEvents:values.length,
        evidencedValueCents:values.reduce((n,v)=>n+Number(v.amountCents||0),0),
        bankSettlementClaimed:values.some(v=>v.bankSettlement===true)
      },
      gaps:this.gaps(),
      coverage:this.coverageMatrix()
    };
  }
}