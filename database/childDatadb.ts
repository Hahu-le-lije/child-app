import {db} from './db';

const createGameSessionsTable = () => {
  db.execSync(`
    CREATE TABLE IF NOT EXISTS game_sessions(
      event_id TEXT PRIMARY KEY,
      child_id TEXT NOT NULL,
      game_type TEXT NOT NULL,
      content_id TEXT NOT NULL,
      score REAL DEFAULT 0,
      time_spent INTEGER DEFAULT 0,
      metrics TEXT,
      skill_breakdown TEXT,
      synced INTEGER DEFAULT 0,
      event_created_at TEXT,
      last_updated TEXT
    );
  `);
};

const migrateLegacyGameSessionsTable = (columnNames: Set<string>) => {
  if (!columnNames.has("id")) return;

  if (!columnNames.has("time_spent")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN time_spent INTEGER DEFAULT 0;`);
  }
  if (!columnNames.has("metrics")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN metrics TEXT;`);
  }
  if (!columnNames.has("synced")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN synced INTEGER DEFAULT 0;`);
  }
  if (!columnNames.has("created_at")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN created_at TEXT;`);
  }
  if (!columnNames.has("updated_at")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN updated_at TEXT;`);
  }

  db.execSync(`ALTER TABLE game_sessions RENAME TO game_sessions_legacy;`);
  createGameSessionsTable();
  db.execSync(`
    INSERT OR REPLACE INTO game_sessions (
      event_id,
      child_id,
      game_type,
      content_id,
      score,
      time_spent,
      metrics,
      skill_breakdown,
      synced,
      event_created_at,
      last_updated
    )
    SELECT
      id,
      child_id,
      game_type,
      content_id,
      COALESCE(score, 0),
      COALESCE(time_spent, 0),
      metrics,
      NULL,
      COALESCE(synced, 0),
      created_at,
      updated_at
    FROM game_sessions_legacy;
  `);
  db.execSync(`DROP TABLE game_sessions_legacy;`);
};

export const initChildDataDB = () => {
  createGameSessionsTable();

  db.execSync(`
    CREATE TABLE IF NOT EXISTS sync_meta(
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Lightweight migration for older installs that already had game_sessions
  // but were missing newer columns.
  const columns = db.getAllSync(`PRAGMA table_info(game_sessions)`) as { name: string }[];
  const names = new Set(columns.map((c) => String(c.name)));

  migrateLegacyGameSessionsTable(names);

  const migratedColumns = db.getAllSync(`PRAGMA table_info(game_sessions)`) as { name: string }[];
  const migratedNames = new Set(migratedColumns.map((c) => String(c.name)));

  if (!migratedNames.has("time_spent")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN time_spent INTEGER DEFAULT 0;`);
  }
  if (!migratedNames.has("metrics")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN metrics TEXT;`);
  }
  if (!migratedNames.has("skill_breakdown")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN skill_breakdown TEXT;`);
  }
  if (!migratedNames.has("synced")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN synced INTEGER DEFAULT 0;`);
  }
  if (!migratedNames.has("event_created_at")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN event_created_at TEXT;`);
  }
  if (!migratedNames.has("last_updated")) {
    db.execSync(`ALTER TABLE game_sessions ADD COLUMN last_updated TEXT;`);
  }
};
