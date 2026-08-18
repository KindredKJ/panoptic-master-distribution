import crypto from "node:crypto";
import { stableStringify } from "../core/stable-json.mjs";

export class ApprovalService {
  constructor({keys,evidence}) {
    this.keys = keys;
    this.evidence = evidence;
  }

  hashPlan(plan) {
    return crypto.createHash("sha256").update(stableStringify(plan)).digest("hex");
  }

  issue({intentId,plan,authority="FOUNDER"}) {
    const payload = {
      intentId,
      planHash:this.hashPlan(plan),
      authority,
      keyFingerprint:this.keys.fingerprint(),
      issuedAt:new Date().toISOString(),
      nonce:crypto.randomUUID()
    };
    const bytes = Buffer.from(stableStringify(payload));
    const signature = crypto.sign(null,bytes,this.keys.privateKey()).toString("base64url");
    const approval = {payload,signature,algorithm:"Ed25519"};
    this.evidence.append("approval.signed",{intentId,planHash:payload.planHash,keyFingerprint:payload.keyFingerprint});
    return approval;
  }

  verify(approval,{intentId,plan}) {
    if (!approval?.payload || !approval?.signature) return {ok:false,reason:"APPROVAL_MISSING"};
    if (approval.algorithm !== "Ed25519") return {ok:false,reason:"APPROVAL_ALGORITHM_INVALID"};
    if (approval.payload.intentId !== intentId) return {ok:false,reason:"APPROVAL_INTENT_MISMATCH"};
    const expectedPlanHash = this.hashPlan(plan);
    if (approval.payload.planHash !== expectedPlanHash) return {ok:false,reason:"APPROVAL_PLAN_MISMATCH"};
    if (approval.payload.keyFingerprint !== this.keys.fingerprint()) return {ok:false,reason:"APPROVAL_KEY_MISMATCH"};
    const ok = crypto.verify(
      null,
      Buffer.from(stableStringify(approval.payload)),
      this.keys.publicKey(),
      Buffer.from(approval.signature,"base64url")
    );
    return {ok,reason:ok?null:"APPROVAL_SIGNATURE_INVALID",keyFingerprint:this.keys.fingerprint()};
  }
}