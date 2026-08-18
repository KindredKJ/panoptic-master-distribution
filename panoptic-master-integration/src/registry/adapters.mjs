import fs from "node:fs";
import path from "node:path";
import { PanopticAdapter } from "../adapters/base.mjs";
import { REALITY } from "../contracts/reality.mjs";

function loadJson(relative) {
  return JSON.parse(fs.readFileSync(path.resolve(process.cwd(), relative), "utf8"));
}

export function buildAdapterRegistry() {
  const rows = loadJson("state/adapter-registry.json");
  const registry = new Map();

  for (const row of rows) {
    registry.set(row.adapterId, new PanopticAdapter({
      adapterId: row.adapterId,
      name: row.source,
      domain: row.domain,
      role: row.role,
      externalOperational: false,
      failClosed: true,
      reality: row.status === "DISCOVERED" ? REALITY.PROPOSED : REALITY.PROPOSED,
      dependencies: [],
      credentialsRequired: row.credentialsRequired || [],
      capabilities: []
    }));
  }

  return registry;
}