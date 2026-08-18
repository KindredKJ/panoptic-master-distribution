import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";
import { dataDir } from "./paths.mjs";

export class StateStore {
  constructor(base = dataDir()) {
    fs.mkdirSync(base, { recursive: true });
    this.path = path.join(base, "panoptic-master.db");
    this.db = new DatabaseSync(this.path);
    this.db.exec(`
      PRAGMA journal_mode=WAL;
      PRAGMA synchronous=FULL;
      PRAGMA foreign_keys=ON;
      PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS state (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
    this.getStmt = this.db.prepare("SELECT value FROM state WHERE key = ?");
    this.putStmt = this.db.prepare(`
      INSERT INTO state(key, value, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value = excluded.value,
        updated_at = excluded.updated_at
    `);
  }

  read(key, fallback) {
    const row = this.getStmt.get(key);
    return row ? JSON.parse(row.value) : structuredClone(fallback);
  }

  write(key, value) {
    this.putStmt.run(key, JSON.stringify(value), new Date().toISOString());
    return value;
  }

  mutate(key, fallback, fn) {
    this.db.exec("BEGIN IMMEDIATE");
    try {
      const current = this.read(key, fallback);
      const next = fn(structuredClone(current));
      this.write(key, next);
      this.db.exec("COMMIT");
      return next;
    } catch (error) {
      this.db.exec("ROLLBACK");
      throw error;
    }
  }
}