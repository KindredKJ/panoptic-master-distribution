import { adapterConfig } from "../core/config.mjs";

export class AdapterRegistry {
  constructor() {
    this.adapters = structuredClone(adapterConfig);
  }

  all() { return structuredClone(this.adapters); }

  forDomain(domain) {
    const adapter = this.adapters.find(a => a.domain === domain);
    if (!adapter) throw new Error(`ADAPTER_NOT_FOUND_FOR_DOMAIN:${domain}`);
    return structuredClone(adapter);
  }

  isOperational(adapter) {
    if (adapter.external) return adapter.verified === true && process.env.KBOX_EXTERNAL_EXECUTION === "true";
    return adapter.verified === true && ["local","local-ledger"].includes(adapter.mode);
  }

  gaps() {
    return this.adapters.filter(a => !this.isOperational(a)).map(a => ({
      adapter:a.id, domain:a.domain, mode:a.mode, reason:a.external ? "EXTERNAL_INTEGRATION_NOT_VERIFIED" : "ADAPTER_NOT_OPERATIONAL"
    }));
  }
}