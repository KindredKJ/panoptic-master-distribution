import crypto from "node:crypto";

export function provisionService(input = {}) {
  const service = {
    provisioningId: crypto.randomUUID(),
    organizationId: input.organizationId || "DEMO-ORG",
    serviceId: input.serviceId || "PANOPTIC-MANAGED-SERVICE",
    module: input.module || "AI",
    entitlement: input.entitlement || "TENANT_SCOPED",
    founderRootAccess: false,
    status: "SIMULATED_PROVISIONING",
    accounting: {
      internalValueCents: 0,
      invoicedCents: 0,
      collectedCashCents: 0,
      bankSettlement: false
    },
    createdAt: new Date().toISOString()
  };

  return service;
}