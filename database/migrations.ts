import {db} from './db';

export const initDatabase=()=>{
    db.execAsync(`
         CREATE TABLE IF NOT EXISTS child_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      lesson_id TEXT,
      score INTEGER,
      attempts INTEGER,
      completed INTEGER,
      created_at TEXT,
      synced INTEGER DEFAULT 0
    );
     CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      game_type TEXT,
      score INTEGER,
      duration INTEGER,
      created_at TEXT,
      synced INTEGER DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      payload TEXT,
      created_at TEXT
    );
    CREATE TABLE IF NOT EXISTS fidels (
  id TEXT PRIMARY KEY,
  character TEXT,
  pronunciation TEXT,
  audio_url TEXT,
  local_audio TEXT,
  difficulty_level INTEGER
);
CREATE TABLE IF NOT EXISTS words (
  id TEXT PRIMARY KEY,
  word TEXT,
  audio_url TEXT,
  local_audio TEXT,
  difficulty_level INTEGER
);
CREATE TABLE IF NOT EXISTS word_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  word_id TEXT,
  image_url TEXT,
  local_image TEXT
);
CREATE TABLE IF NOT EXISTS sentences (
  id TEXT PRIMARY KEY,
  sentence TEXT,
  difficulty_level INTEGER
);
CREATE TABLE IF NOT EXISTS sentence_words (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sentence_id TEXT,
  word TEXT,
  position INTEGER
);
CREATE TABLE IF NOT EXISTS stories (
  id TEXT PRIMARY KEY,
  title TEXT,
  content TEXT,
  audio_url TEXT,
  local_audio TEXT
);
CREATE TABLE IF NOT EXISTS story_questions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id TEXT,
  question TEXT,
  correct_answer TEXT
);
        `)
}