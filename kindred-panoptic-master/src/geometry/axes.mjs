import { geometry } from "../core/config.mjs";

const fabric = geometry.operationalFabric;

export const xLabels = fabric.xCapability;
export const yLabels = fabric.yStrata.map(x => x.id);
export const zLabels = fabric.zScale;

const xMap = new Map(xLabels.map((v, i) => [v, i + 1]));
const yMap = new Map(fabric.yStrata.map(v => [v.id, v.y]));
const zMap = new Map(zLabels.map((v, i) => [v, i + 1]));
const zAliases = new Map(Object.entries(fabric.zAliases || {}));

export function resolveZ(label) {
  return zAliases.get(label) || label;
}

export function xIndex(label) {
  const v = xMap.get(label);
  if (!v) throw new Error(`UNKNOWN_X_CAPABILITY:${label}`);
  return v;
}

export function yIndex(label) {
  const v = yMap.get(label);
  if (!v) throw new Error(`UNKNOWN_Y_STRATUM:${label}`);
  return v;
}

export function zIndex(label) {
  const resolved = resolveZ(label);
  const v = zMap.get(resolved);
  if (!v) throw new Error(`UNKNOWN_Z_SCOPE:${label}`);
  return v;
}

export function labelsForIndices({ x, y, z }) {
  return {
    x: xLabels[x - 1] || null,
    y: yLabels[y - 1] || null,
    z: zLabels[z - 1] || null
  };
}