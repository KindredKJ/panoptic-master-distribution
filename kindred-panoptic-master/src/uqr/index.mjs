import { strata } from "../core/config.mjs";

export class UnifiedQuadRuntime {
  constructor({adapters}) {
    this.adapters = adapters;
  }

  route({domain,volumeId,capability,coordinate}) {
    const stratum = strata.find(s => s.id === domain);
    if (!stratum) throw new Error(`STRATUM_NOT_FOUND:${domain}`);
    const adapter = this.adapters.forDomain(domain);
    return {
      routeId:`${domain}:${volumeId}:${capability}:${coordinate.x}.${coordinate.y}.${coordinate.z}`,
      domain,volumeId,capability,coordinate,stratum,adapter,
      operational:this.adapters.isOperational(adapter)
    };
  }
}