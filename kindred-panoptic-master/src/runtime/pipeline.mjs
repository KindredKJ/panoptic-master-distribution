import crypto from "node:crypto";

export class IntentPipeline {
  constructor({store,brainstem,meta,uqr,emit,evidence,approvals}) {
    this.store=store; this.brainstem=brainstem; this.meta=meta; this.uqr=uqr;
    this.emit=emit; this.evidence=evidence; this.approvals=approvals;
  }

  all(){ return this.store.read("intents",[]); }
  get(id){ return this.all().find(x=>x.id===id); }

  update(id,fn){
    let result;
    this.store.mutate("intents",[],items=>{
      const i=items.findIndex(x=>x.id===id);
      if(i<0) throw new Error("INTENT_NOT_FOUND");
      items[i]=fn(structuredClone(items[i]));
      result=items[i];
      return items;
    });
    return result;
  }

  submit(input){
    const intent={
      id:crypto.randomUUID(),
      volumeId:input.volumeId,
      capability:input.capability,
      domain:input.domain,
      scope:input.scope,
      objective:String(input.objective||""),
      createdAt:new Date().toISOString()
    };
    const plan=this.brainstem.plan(intent);
    const decision=this.meta.evaluate(plan);
    let status="PLANNED";
    if(!decision.allowed) status="BLOCKED";
    else if(decision.approvalRequired) status="AWAITING_APPROVAL";
    const record={...intent,plan,policyDecision:decision,status,approval:null,approvedAt:null,executedAt:null,result:null};
    this.store.mutate("intents",[],items=>{items.push(record);return items;});
    this.evidence.append("intent.submitted",{intentId:intent.id,volumeId:intent.volumeId,coordinate:plan.coordinate,status});
    return record;
  }

  approve(id){
    const current=this.get(id);
    if(!current) throw new Error("INTENT_NOT_FOUND");
    if(current.status!=="AWAITING_APPROVAL") throw new Error(`INTENT_NOT_AWAITING_APPROVAL:${current.status}`);
    const approval=this.approvals.issue({intentId:id,plan:current.plan});
    return this.update(id,x=>({...x,status:"APPROVED",approval,approvedAt:new Date().toISOString()}));
  }

  execute(id){
    const current=this.get(id);
    if(!current) throw new Error("INTENT_NOT_FOUND");
    if(current.status==="BLOCKED") throw new Error(`INTENT_BLOCKED:${current.policyDecision.reason}`);
    if(!["PLANNED","APPROVED"].includes(current.status)) throw new Error(`INTENT_NOT_EXECUTABLE:${current.status}`);
    let approvalVerification={ok:true,reason:null};
    if(current.plan.approvalRequired){
      approvalVerification=this.approvals.verify(current.approval,{intentId:id,plan:current.plan});
      if(!approvalVerification.ok) throw new Error(`SIGNED_FOUNDER_APPROVAL_REQUIRED:${approvalVerification.reason}`);
    }
    const route=this.uqr.route({
      domain:current.domain,volumeId:current.volumeId,capability:current.capability,coordinate:current.plan.coordinate
    });
    const result=this.emit.execute({plan:current.plan,route,approvalVerification});
    return this.update(id,x=>({...x,status:result.status==="VERIFIED_LOCAL_EXECUTION"?"VERIFIED":"ADAPTER_REQUIRED",executedAt:new Date().toISOString(),result}));
  }
}