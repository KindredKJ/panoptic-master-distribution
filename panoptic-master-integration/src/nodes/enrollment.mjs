import crypto from "node:crypto";

export function enrollNode(input = {}) {
  if (input.rootAuthority === true) {
    throw new Error("ORDINARY_NODE_CANNOT_INHERIT_PORT_ZERO_AUTHORITY");
  }

  return {
    nodeId: input.nodeId || crypto.randomUUID(),
    identity: input.identity || { type: "local-test-node" },
    assignedVolume: input.assignedVolume || "SITE-TEST",
    capabilities: input.capabilities || ["observe","verify"],
    resources: input.resources || {},
    heartbeatSeconds: input.heartbeatSeconds || 30,
    missionLeaseSeconds: input.missionLeaseSeconds || 60,
    evidenceSync: "store-forward",
    status: "ENROLLED_LOCAL_TEST",
    rootAuthority: false
  };
}