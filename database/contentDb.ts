import { db } from "./db";

type TableColumn = { name: string };

function tableColumnNames(table: string): Set<string> {
  const rows = db.getAllSync<TableColumn>(`PRAGMA table_info(${table})`);
  return new Set(rows.map((row) => row.name));
}

function tableExists(table: string): boolean {
  const rows = db.getAllSync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?`,
    [table],
  );
  return rows.length > 0;
}

function addColumnIfMissing(
  table: string,
  column: string,
  definition: string,
): void {
  if (tableColumnNames(table).has(column)) return;
  try {
    db.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  } catch {
    /* column already present */
  }
}

function contentPackColumnNames(): Set<string> {
  return tableColumnNames("content_packs");
}

function contentPacksTableExists(): boolean {
  const rows = db.getAllSync<{ name: string }>(
    `SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'content_packs'`,
  );
  return rows.length > 0;
}

/** Repair legacy SQLite schemas (e.g. missing `slug`) without wiping game tables. */
function migrateContentPacksTable(): void {
  if (!contentPacksTableExists()) return;

  let columns = contentPackColumnNames();

  if (!columns.has("slug")) {
    if (columns.has("pack_slug")) {
      db.execSync(`ALTER TABLE content_packs RENAME COLUMN pack_slug TO slug`);
    } else {
      db.execSync(`ALTER TABLE content_packs RENAME TO content_packs_legacy`);
      db.execSync(`
        CREATE TABLE content_packs (
          child_id TEXT NOT NULL,
          slug TEXT NOT NULL,
          game_type TEXT NOT NULL,
          title TEXT,
          version TEXT,
          checksum TEXT,
          downloaded_at INTEGER NOT NULL,
          local_dir TEXT,
          PRIMARY KEY (child_id, slug)
        );
      `);

      const legacyCols = db.getAllSync<TableColumn>(
        `PRAGMA table_info(content_packs_legacy)`,
      );
      const legacyNames = new Set(legacyCols.map((row) => row.name));
      const slugSource = legacyNames.has("pack_slug")
        ? "pack_slug"
        : legacyNames.has("id")
          ? "id"
          : null;

      if (slugSource && legacyNames.has("child_id") && legacyNames.has("game_type")) {
        const downloadedAt = legacyNames.has("downloaded_at")
          ? "downloaded_at"
          : `${Date.now()}`;
        db.execSync(`
          INSERT OR IGNORE INTO content_packs (
            child_id, slug, game_type, title, version, checksum, downloaded_at, local_dir
          )
          SELECT
            child_id,
            TRIM(CAST(${slugSource} AS TEXT)),
            game_type,
            ${legacyNames.has("title") ? "title" : "NULL"},
            ${legacyNames.has("version") ? "version" : "NULL"},
            ${legacyNames.has("checksum") ? "checksum" : "NULL"},
            ${legacyNames.has("downloaded_at") ? "downloaded_at" : downloadedAt},
            ${legacyNames.has("local_dir") ? "local_dir" : "NULL"}
          FROM content_packs_legacy
          WHERE TRIM(CAST(${slugSource} AS TEXT)) != ''
        `);
      }

      db.execSync(`DROP TABLE IF EXISTS content_packs_legacy`);
      columns = contentPackColumnNames();
    }
  }

  const optionalColumns: Record<string, string> = {
    version: "TEXT",
    checksum: "TEXT",
    local_dir: "TEXT",
    game_type: "TEXT",
    title: "TEXT",
  };

  for (const [name, type] of Object.entries(optionalColumns)) {
    if (columns.has(name)) continue;
    try {
      db.execSync(`ALTER TABLE content_packs ADD COLUMN ${name} ${type}`);
    } catch {
      /* column already present */
    }
  }
}

/**
 * Older app builds used `words (id, word, level_id, …)` from the levels importer.
 * Word builder now requires `word_text` + `child_id` (see const/games.json schema).
 */
function migrateWordsTable(): void {
  if (!tableExists("words")) return;

  let columns = tableColumnNames("words");
  const legacyWordColumn = columns.has("word")
    ? "word"
    : columns.has("wordtext")
      ? "wordtext"
      : null;

  if (!columns.has("word_text")) {
    addColumnIfMissing("words", "word_text", "TEXT");
    columns = tableColumnNames("words");
    if (legacyWordColumn) {
      db.execSync(
        `UPDATE words SET word_text = ${legacyWordColumn}
         WHERE word_text IS NULL OR TRIM(word_text) = ''`,
      );
    }
  }

  addColumnIfMissing("words", "child_id", `TEXT NOT NULL DEFAULT ''`);
  addColumnIfMissing("words", "level_id", "TEXT");

  columns = tableColumnNames("words");
  if (columns.has("word_text") && columns.has("child_id")) return;

  db.execSync(`ALTER TABLE words RENAME TO words_legacy`);
  db.execSync(`
    CREATE TABLE words (
      id TEXT NOT NULL,
      child_id TEXT NOT NULL,
      level_id TEXT,
      word_text TEXT,
      PRIMARY KEY (id, child_id)
    );
  `);

  const legacyCols = tableColumnNames("words_legacy");
  const textExpr = legacyCols.has("word_text")
    ? "word_text"
    : legacyCols.has("word")
      ? "word"
      : legacyCols.has("wordtext")
        ? "wordtext"
        : "''";
  const childExpr = legacyCols.has("child_id") ? "COALESCE(child_id, '')" : "''";
  const levelExpr = legacyCols.has("level_id") ? "level_id" : "NULL";

  db.execSync(`
    INSERT OR IGNORE INTO words (id, child_id, level_id, word_text)
    SELECT id, ${childExpr}, ${levelExpr}, ${textExpr}
    FROM words_legacy
    WHERE TRIM(CAST(id AS TEXT)) != ''
  `);
  db.execSync(`DROP TABLE IF EXISTS words_legacy`);
}

function migrateWordBuilderSupportTables(): void {
  if (tableExists("letters")) {
    addColumnIfMissing("letters", "child_id", `TEXT NOT NULL DEFAULT ''`);
    addColumnIfMissing("letters", "level_id", "TEXT");
    addColumnIfMissing("letters", "letter", "TEXT");
  }

  if (tableExists("word_hints")) {
    addColumnIfMissing("word_hints", "child_id", `TEXT NOT NULL DEFAULT ''`);
    addColumnIfMissing("word_hints", "word_id", "TEXT");
    addColumnIfMissing("word_hints", "hint_text", "TEXT");
  }

  if (tableExists("word_builder_levels")) {
    addColumnIfMissing("word_builder_levels", "child_id", `TEXT NOT NULL DEFAULT ''`);
  }
}

export const initContentDB = () => {
  db.execSync(`
    
    CREATE TABLE IF NOT EXISTS content_packs (
      child_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      game_type TEXT NOT NULL,
      title TEXT,
      version TEXT,
      checksum TEXT,
      downloaded_at INTEGER NOT NULL,
      local_dir TEXT,
      PRIMARY KEY (child_id, slug)
    );

    CREATE TABLE IF NOT EXISTS stories (
      id TEXT,
      child_id TEXT,
      level_id TEXT,
      title TEXT,
      page_count INTEGER,
      thumbnail_path TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS story_pages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      story_id TEXT,
      page_number INTEGER,
      story_text TEXT,
      image_path TEXT
    );

    CREATE TABLE IF NOT EXISTS story_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      story_id TEXT,
      question_text TEXT,
      correct_answer TEXT
    );

    CREATE TABLE IF NOT EXISTS story_choices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      question_id INTEGER,
      choice_text TEXT
    );

    CREATE TABLE IF NOT EXISTS picture_levels (
      id TEXT,
      child_id TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS picture_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      level_id TEXT,
      question_text TEXT,
      correct_image_id TEXT
    );

    CREATE TABLE IF NOT EXISTS picture_images (
      id TEXT,
      child_id TEXT,
      question_id INTEGER,
      image_path TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS fidel_levels (
      id TEXT,
      child_id TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS fidel_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      level_id TEXT,
      letter TEXT,
      outline_image_path TEXT,
      audio_path TEXT
    );

    CREATE TABLE IF NOT EXISTS fidel_images (
      id TEXT,
      child_id TEXT,
      question_id INTEGER,
      image_path TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS word_builder_levels(
      id TEXT,
      child_id TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS letters(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      level_id TEXT,
      letter TEXT
    );

    CREATE TABLE IF NOT EXISTS words(
      id TEXT,
      child_id TEXT,
      level_id TEXT,
      word_text TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS word_hints(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      word_id TEXT,
      hint_text TEXT
    );

    CREATE TABLE IF NOT EXISTS fill_levels(
      id TEXT,
      child_id TEXT,
      full_paragraph TEXT,
      blank_paragraph TEXT,
      correct_answer TEXT,
      audio_path TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS fill_choices(
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      level_id TEXT,
      choice TEXT
    );

    CREATE TABLE IF NOT EXISTS pronunciation_levels (
      id TEXT,
      child_id TEXT,
      word TEXT,
      audio_path TEXT,
      image_path TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS voice_levels(
      id TEXT,
      child_id TEXT,
      audio_path TEXT,
      correct_word_id TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS voice_choices(
      id TEXT,
      child_id TEXT,
      level_id TEXT,
      word_text TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS matching_levels (
      id TEXT,
      child_id TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS matching_words (
      id TEXT,
      child_id TEXT,
      level_id TEXT,
      word TEXT,
      audio_path TEXT,
      image_path TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS sentence_levels (
      id TEXT,
      child_id TEXT,
      PRIMARY KEY (id, child_id)
    );

    CREATE TABLE IF NOT EXISTS sentences (
      id TEXT,
      child_id TEXT,
      level_id TEXT,
      sentence TEXT,
      words_json TEXT,
      PRIMARY KEY (id, child_id)
    );

  `);

  try {
    db.execSync(`ALTER TABLE stories ADD COLUMN level_id TEXT`);
  } catch {
    /* column already present */
  }

  try {
    db.execSync(`ALTER TABLE content_packs ADD COLUMN checksum TEXT`);
  } catch {
    /* column already present */
  }

  try {
    db.execSync(`ALTER TABLE fill_levels ADD COLUMN correct_answer TEXT`);
  } catch {
    /* column already present */
  }

  migrateContentPacksTable();
  migrateWordsTable();
  migrateWordBuilderSupportTables();
};