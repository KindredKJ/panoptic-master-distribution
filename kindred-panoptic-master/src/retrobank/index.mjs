import crypto from "node:crypto";

export class RetroBank {
  constructor({store,evidence}) {
    this.store = store;
    this.evidence = evidence;
  }

  allValueEvents() { return this.store.read("value-events",[]); }

  recordVerifiedValue({volumeId,evidenceId,amountCents,currency="USD",description=""}) {
    const source = this.evidence.get(evidenceId);
    if (!source) throw new Error("EVIDENCE_NOT_FOUND");
    if (source.type !== "execution.completed") throw new Error("VALUE_REQUIRES_VERIFIED_EXECUTION_EVIDENCE");
    if (!Number.isInteger(amountCents) || amountCents < 0) throw new Error("INVALID_AMOUNT_CENTS");
    const event = {
      id:crypto.randomUUID(),volumeId,evidenceId,amountCents,currency,description,
      recognizedAt:new Date().toISOString(),bankSettlement:false,externalRevenueCollected:false
    };
    this.store.mutate("value-events",[],events => {events.push(event); return events;});
    this.evidence.append("value.recorded",event);
    return event;
  }
}