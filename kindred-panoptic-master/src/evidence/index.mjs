import crypto from "node:crypto";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { dataDir } from "../core/paths.mjs";
import { stableStringify } from "../core/stable-json.mjs";

export class EvidenceLedger {
  constructor(base = dataDir()) {
    fs.mkdirSync(base,{recursive:true});
    this.db = new DatabaseSync(path.join(base,"panoptic-master.db"));
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA synchronous=FULL;
      CREATE TABLE IF NOT EXISTS evidence (
        seq INTEGER PRIMARY KEY AUTOINCREMENT,
        id TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        at TEXT NOT NULL,
        prev_hash TEXT NOT NULL,
        payload TEXT NOT NULL,
        hash TEXT NOT NULL UNIQUE
      );
    `);
    this.lastStmt = this.db.prepare("SELECT * FROM evidence ORDER BY seq DESC LIMIT 1");
    this.allStmt = this.db.prepare("SELECT * FROM evidence ORDER BY seq ASC");
    this.getStmt = this.db.prepare("SELECT * FROM evidence WHERE id = ?");
    this.insertStmt = this.db.prepare("INSERT INTO evidence(id,type,at,prev_hash,payload,hash) VALUES(?,?,?,?,?,?)");
  }

  rowToRecord(r) {
    if (!r) return undefined;
    return {seq:r.seq,id:r.id,type:r.type,at:r.at,prevHash:r.prev_hash,payload:JSON.parse(r.payload),hash:r.hash};
  }

  all() { return this.allStmt.all().map(r => this.rowToRecord(r)); }
  get(id) { return this.rowToRecord(this.getStmt.get(id)); }

  append(type,payload) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const previous = this.rowToRecord(this.lastStmt.get());
      const prevHash = previous?.hash || "GENESIS";
      const record = {id:crypto.randomUUID(),type,at:new Date().toISOString(),prevHash,payload};
      record.hash = crypto.createHash("sha256").update(prevHash+"|"+stableStringify({
        id:record.id,type:record.type,at:record.at,payload:record.payload
      })).digest("hex");
      this.insertStmt.run(record.id,record.type,record.at,record.prevHash,JSON.stringify(record.payload),record.hash);
      this.db.exec("COMMIT");
      return this.get(record.id);
    } catch (e) {
      this.db.exec("ROLLBACK");
      throw e;
    }
  }

  verify() {
    const ledger = this.all();
    let prevHash = "GENESIS";
    for (const record of ledger) {
      if (record.prevHash !== prevHash) return {ok:false,reason:"PREVIOUS_HASH_MISMATCH",evidenceId:record.id};
      const expected = crypto.createHash("sha256").update(prevHash+"|"+stableStringify({
        id:record.id,type:record.type,at:record.at,payload:record.payload
      })).digest("hex");
      if (expected !== record.hash) return {ok:false,reason:"HASH_MISMATCH",evidenceId:record.id};
      prevHash = record.hash;
    }
    return {ok:true,records:ledger.length,head:ledger.at(-1)?.hash||"GENESIS"};
  }
}