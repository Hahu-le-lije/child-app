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
};