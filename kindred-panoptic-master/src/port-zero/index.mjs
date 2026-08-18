import { geometry } from "../core/config.mjs";

export const portZero = Object.freeze({
  id: geometry.origin.id,
  name: geometry.origin.name,
  coordinate: Object.freeze({ x:0, y:0, z:0 }),
  role: Object.freeze([
    "geometric-origin",
    "authority-anchor",
    "routing-origin",
    "evidence-anchor",
    "policy-boundary",
    "master-axis-intersection"
  ])
});

export function describePortZero() {
  return {
    ...portZero,
    masterAxisIntersection: geometry.metaCube.oppositePairs.map(p => ({
      axis:p.axis, beam:p.beam, negative:p.b, positive:p.a
    }))
  };
}