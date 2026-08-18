const MODEL_CANDIDATES = Object.freeze([
  { id: "IAMI-X", local: true, capabilities: ["chat","classification","local-inference"], evidenceScore: 0.5 },
  { id: "H-CARET", local: true, capabilities: ["research-architecture"], evidenceScore: 0.3 },
  { id: "SWARM", local: true, capabilities: ["optimization"], evidenceScore: 0.5 },
  { id: "OPTIMIZATION-SUITE", local: true, capabilities: ["tuning"], evidenceScore: 0.5 }
]);

export function listModels() {
  return MODEL_CANDIDATES.map(x => ({ ...x }));
}

export function routeModel({ capability, localFirst = true }) {
  let candidates = MODEL_CANDIDATES.filter(m => m.capabilities.includes(capability));

  if (localFirst) {
    candidates = candidates.sort((a,b) => Number(b.local) - Number(a.local));
  }

  candidates = candidates.sort((a,b) => b.evidenceScore - a.evidenceScore);

  return {
    selected: candidates[0] || null,
    candidates,
    note: "Selection is provisional until reproducible model evaluation exists."
  };
}