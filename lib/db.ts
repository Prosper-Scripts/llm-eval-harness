import { DatabaseSync } from "node:sqlite";
import path from "path";

const DB_PATH = path.join(process.cwd(), "eval.db");

let db: DatabaseSync | undefined;

function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
    db.exec(`
      CREATE TABLE IF NOT EXISTS prompts (
        id         TEXT PRIMARY KEY,
        title      TEXT NOT NULL,
        content    TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS experiments (
        id         TEXT PRIMARY KEY,
        name       TEXT NOT NULL,
        model      TEXT NOT NULL,
        status     TEXT NOT NULL DEFAULT 'pending',
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS results (
        id            TEXT PRIMARY KEY,
        experiment_id TEXT NOT NULL REFERENCES experiments(id) ON DELETE CASCADE,
        prompt_id     TEXT NOT NULL REFERENCES prompts(id) ON DELETE CASCADE,
        response      TEXT NOT NULL,
        score         REAL,
        latency_ms    INTEGER,
        created_at    TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `);
  }
  return db!;
}

export default getDb;
