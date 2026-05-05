import {db} from './db';

export const initChildDataDB = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS game_sessions(
      id TEXT PRIMARY KEY,
      child_id TEXT,
      game_type TEXT,
      content_id TEXT,
      score REAL,
      time_spent INTEGER,
      metrics TEXT,
      synced INTEGER DEFAULT 0,
      created_at TEXT,
      updated_at TEXT
    );
  `);

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_meta(
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Lightweight migration for older installs that already had game_sessions
  // but were missing newer columns.
  const columns = db.getAllSync(`PRAGMA table_info(game_sessions)`) as Array<{ name: string }>;
  const names = new Set(columns.map((c) => String(c.name)));

  if (!names.has("time_spent")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN time_spent INTEGER DEFAULT 0;`);
  }
  if (!names.has("metrics")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN metrics TEXT;`);
  }
  if (!names.has("synced")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN synced INTEGER DEFAULT 0;`);
  }
  if (!names.has("updated_at")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN updated_at TEXT;`);
  }
};