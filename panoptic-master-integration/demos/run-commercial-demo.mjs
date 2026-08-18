import { provisionService } from "../src/commercial/provision.mjs";

console.log(JSON.stringify(
  provisionService({
    organizationId: "DEMO-CLIENT",
    serviceId: "KBOX-MANAGED-AI",
    module: "AI"
  }),
  null,
  2
));