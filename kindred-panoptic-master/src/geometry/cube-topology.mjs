import { geometry, cubeTopology } from "../core/config.mjs";

export function verifyCubeTopology() {
  const faces = geometry.metaCube.faces;
  const pairs = geometry.metaCube.oppositePairs;
  const edges = cubeTopology.edges;
  const vertices = cubeTopology.vertices;

  const faceIds = new Set(faces.map(f => f.id));
  const opposite = new Map();
  for (const p of pairs) {
    opposite.set(p.a, p.b);
    opposite.set(p.b, p.a);
  }

  const errors = [];
  if (faces.length !== 6 || faceIds.size !== 6) errors.push("META_CUBE_MUST_HAVE_6_UNIQUE_FACES");
  if (pairs.length !== 3) errors.push("META_CUBE_MUST_HAVE_3_OPPOSITE_PAIRS");
  if (edges.length !== 12) errors.push("META_CUBE_MUST_HAVE_12_EDGES");
  if (vertices.length !== 8) errors.push("META_CUBE_MUST_HAVE_8_VERTICES");

  const edgeKeys = new Set();
  for (const edge of edges) {
    if (edge.faces.length !== 2) errors.push(`EDGE_FACE_COUNT:${edge.moat}`);
    const [a,b] = edge.faces;
    if (!faceIds.has(a) || !faceIds.has(b)) errors.push(`EDGE_UNKNOWN_FACE:${edge.moat}`);
    if (opposite.get(a) === b) errors.push(`EDGE_USES_OPPOSITE_FACES:${a}:${b}`);
    edgeKeys.add([...edge.faces].sort().join("|"));
  }
  if (edgeKeys.size !== 12) errors.push("EDGES_MUST_BE_UNIQUE");

  const vertexKeys = new Set();
  const axes = pairs.map(p => new Set([p.a,p.b]));
  for (const vertex of vertices) {
    if (vertex.faces.length !== 3) errors.push(`VERTEX_FACE_COUNT:${vertex.convergence}`);
    for (const set of axes) {
      const count = vertex.faces.filter(f => set.has(f)).length;
      if (count !== 1) errors.push(`VERTEX_MUST_SELECT_ONE_FROM_EACH_AXIS:${vertex.convergence}`);
    }
    vertexKeys.add([...vertex.faces].sort().join("|"));
  }
  if (vertexKeys.size !== 8) errors.push("VERTICES_MUST_BE_UNIQUE");

  return {
    ok: errors.length === 0,
    errors,
    counts: { faces:faces.length, oppositePairs:pairs.length, edges:edges.length, vertices:vertices.length },
    beams: pairs.map(p => ({axis:p.axis, from:p.a, through:"PORT-ZERO", to:p.b, beam:p.beam}))
  };
}