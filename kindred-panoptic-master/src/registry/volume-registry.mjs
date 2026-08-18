import crypto from "node:crypto";
import { canonicalVolumes } from "../core/config.mjs";
import { StateStore } from "../core/store.mjs";
import { normalizeBounds, containsBounds, containsPoint, describeRelationship, dimensionality } from "../geometry/volume-engine.mjs";

export class VolumeRegistry {
  constructor(store = new StateStore()) {
    this.store = store;
    if (this.all().length === 0) {
      this.store.write("volumes", canonicalVolumes);
    }
  }

  all() { return this.store.read("volumes", []); }
  get(id) { return this.all().find(v => v.id === id); }

  register(input) {
    const volumes = this.all();
    if (volumes.some(v => v.id === input.id)) return this.get(input.id);
    normalizeBounds(input.bounds);

    if (input.parentId) {
      const parent = volumes.find(v => v.id === input.parentId);
      if (!parent) throw new Error(`PARENT_VOLUME_NOT_FOUND:${input.parentId}`);
      if (!containsBounds(parent.bounds, input.bounds)) {
        throw new Error(`CHILD_VOLUME_EXCEEDS_PARENT:${input.id}:${input.parentId}`);
      }
    }

    const volume = {
      id: input.id || crypto.randomUUID(),
      name: input.name || input.id,
      type: input.type || "volume",
      parentId: input.parentId || null,
      bounds: input.bounds,
      crossStrata: Boolean(input.crossStrata),
      createdAt: new Date().toISOString()
    };
    this.store.write("volumes", [...volumes, volume]);
    return volume;
  }

  relationship(aId,bId) {
    const a = this.get(aId), b = this.get(bId);
    if (!a || !b) throw new Error("VOLUME_NOT_FOUND");
    return describeRelationship(a,b);
  }

  authorizePoint(volumeId, point) {
    const volume = this.get(volumeId);
    if (!volume) return {allowed:false, reason:"VOLUME_NOT_FOUND"};
    return containsPoint(volume.bounds, point)
      ? {allowed:true, volume}
      : {allowed:false, reason:"POINT_OUTSIDE_VOLUME", volume};
  }

  topology() {
    const all = this.all();
    const children = new Map();
    for (const v of all) {
      const key = v.parentId || "__ROOT__";
      if (!children.has(key)) children.set(key, []);
      children.get(key).push(v);
    }
    const build = v => ({...v, dimensionality:dimensionality(v.bounds), children:(children.get(v.id)||[]).map(build)});
    return (children.get("__ROOT__")||[]).map(build);
  }

  verifyIntegrity() {
    const errors = [];
    const all = this.all();
    const ids = new Set();
    for (const v of all) {
      if (ids.has(v.id)) errors.push(`DUPLICATE_VOLUME:${v.id}`);
      ids.add(v.id);
      try { normalizeBounds(v.bounds); } catch (e) { errors.push(`${v.id}:${e.message}`); }
    }
    for (const v of all) {
      if (!v.parentId) continue;
      const p = all.find(x => x.id === v.parentId);
      if (!p) errors.push(`MISSING_PARENT:${v.id}:${v.parentId}`);
      else if (!containsBounds(p.bounds, v.bounds)) errors.push(`OUTSIDE_PARENT:${v.id}:${v.parentId}`);
    }
    return {ok:errors.length===0, errors, count:all.length};
  }
}