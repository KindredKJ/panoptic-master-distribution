import { xIndex, yIndex, zIndex, labelsForIndices } from "./axes.mjs";

export function normalizeBounds(bounds) {
  if (!bounds?.x || !bounds?.y || !bounds?.z) {
    throw new Error("BOUNDS_REQUIRE_X_Y_Z");
  }

  const n = {
    xMin: xIndex(bounds.x[0]),
    xMax: xIndex(bounds.x[1]),
    yMin: yIndex(bounds.y[0]),
    yMax: yIndex(bounds.y[1]),
    zMin: zIndex(bounds.z[0]),
    zMax: zIndex(bounds.z[1])
  };

  if (n.xMin > n.xMax || n.yMin > n.yMax || n.zMin > n.zMax) {
    throw new Error("INVALID_VOLUME_BOUNDS");
  }

  return n;
}

export function coordinateOf({ capability, domain, scope, tau = {} }) {
  return {
    x: xIndex(capability),
    y: yIndex(domain),
    z: zIndex(scope),
    tau: {
      time: tau.time || new Date().toISOString(),
      evidence: tau.evidence || "unverified",
      valueCents: Number(tau.valueCents || 0),
      risk: tau.risk || "unknown",
      costCents: Number(tau.costCents || 0),
      demand: tau.demand || "unknown",
      confidence: Number(tau.confidence || 0),
      operationalState: tau.operationalState || "unknown"
    },
    labels: { capability, domain, scope }
  };
}

export function containsBounds(parent, child) {
  const a = normalizeBounds(parent);
  const b = normalizeBounds(child);
  return (
    a.xMin <= b.xMin && a.xMax >= b.xMax &&
    a.yMin <= b.yMin && a.yMax >= b.yMax &&
    a.zMin <= b.zMin && a.zMax >= b.zMax
  );
}

export function containsPoint(bounds, point) {
  const b = normalizeBounds(bounds);
  return (
    point.x >= b.xMin && point.x <= b.xMax &&
    point.y >= b.yMin && point.y <= b.yMax &&
    point.z >= b.zMin && point.z <= b.zMax
  );
}

export function intersectsBounds(aBounds, bBounds) {
  const a = normalizeBounds(aBounds);
  const b = normalizeBounds(bBounds);
  return !(
    a.xMax < b.xMin || b.xMax < a.xMin ||
    a.yMax < b.yMin || b.yMax < a.yMin ||
    a.zMax < b.zMin || b.zMax < a.zMin
  );
}

export function intersectionBounds(aBounds, bBounds) {
  if (!intersectsBounds(aBounds, bBounds)) return null;
  const a = normalizeBounds(aBounds);
  const b = normalizeBounds(bBounds);
  const n = {
    xMin: Math.max(a.xMin, b.xMin),
    xMax: Math.min(a.xMax, b.xMax),
    yMin: Math.max(a.yMin, b.yMin),
    yMax: Math.min(a.yMax, b.yMax),
    zMin: Math.max(a.zMin, b.zMin),
    zMax: Math.min(a.zMax, b.zMax)
  };
  return {
    numeric: n,
    labels: {
      x: [labelsForIndices({x:n.xMin,y:1,z:1}).x, labelsForIndices({x:n.xMax,y:1,z:1}).x],
      y: [labelsForIndices({x:1,y:n.yMin,z:1}).y, labelsForIndices({x:1,y:n.yMax,z:1}).y],
      z: [labelsForIndices({x:1,y:1,z:n.zMin}).z, labelsForIndices({x:1,y:1,z:n.zMax}).z]
    }
  };
}

function overlaps(aMin, aMax, bMin, bMax) {
  return Math.max(aMin, bMin) <= Math.min(aMax, bMax);
}

export function adjacentBounds(aBounds, bBounds) {
  const a = normalizeBounds(aBounds);
  const b = normalizeBounds(bBounds);
  const xTouch = a.xMax + 1 === b.xMin || b.xMax + 1 === a.xMin;
  const yTouch = a.yMax + 1 === b.yMin || b.yMax + 1 === a.yMin;
  const zTouch = a.zMax + 1 === b.zMin || b.zMax + 1 === a.zMin;

  return (
    (xTouch && overlaps(a.yMin,a.yMax,b.yMin,b.yMax) && overlaps(a.zMin,a.zMax,b.zMin,b.zMax)) ||
    (yTouch && overlaps(a.xMin,a.xMax,b.xMin,b.xMax) && overlaps(a.zMin,a.zMax,b.zMin,b.zMax)) ||
    (zTouch && overlaps(a.xMin,a.xMax,b.xMin,b.xMax) && overlaps(a.yMin,a.yMax,b.yMin,b.yMax))
  );
}

export function dimensionality(bounds) {
  const b = normalizeBounds(bounds);
  return [b.xMin !== b.xMax, b.yMin !== b.yMax, b.zMin !== b.zMax].filter(Boolean).length;
}

export function describeRelationship(a, b) {
  const containsAB = containsBounds(a.bounds, b.bounds);
  const containsBA = containsBounds(b.bounds, a.bounds);
  const intersects = intersectsBounds(a.bounds, b.bounds);
  return {
    a: a.id,
    b: b.id,
    containsAB,
    containsBA,
    intersects,
    adjacent: adjacentBounds(a.bounds, b.bounds),
    intersection: intersectionBounds(a.bounds, b.bounds)
  };
}