import fs from "node:fs";
import path from "node:path";

function load(relative) {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), relative), "utf8"));
}

export const geometry = load("config/geometry.json");
export const cubeTopology = load("config/cube-topology.json");
export const strata = load("config/strata.json");
export const policies = load("config/policies.json");
export const adapterConfig = load("config/adapters.json");
export const canonicalVolumes = load("config/volumes.json");