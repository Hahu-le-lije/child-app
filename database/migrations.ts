import { db } from "./db";

export async function seedInitialLevels() {
  // Check if levels exist
  const existingLevels: any = await db.getAllAsync("SELECT COUNT(*) as count FROM levels");

  if (existingLevels[0].count !== 0) return;

  await db.execAsync(`
    -- Tracing Game Levels
    INSERT INTO levels (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score) VALUES
    ('tracing_1', 'tracing', 1, 'Basic Fidels', 'Learn to trace simple Amharic letters', 1, 1, 0),
    ('tracing_2', 'tracing', 2, 'More Fidels', 'Trace more Amharic characters', 2, 0, 80);

    -- Matching Game Levels
    INSERT INTO levels (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score) VALUES
    ('matching_1', 'matching', 1, 'Match Sounds', 'Match spoken fidels to written forms', 1, 1, 0),
    ('matching_2', 'matching', 2, 'Match Words', 'Match spoken words to written forms', 2, 0, 80);

    -- Word to Picture Levels
    INSERT INTO levels (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score) VALUES
    ('wp_1', 'word_picture', 1, 'Animals', 'Match animal words to pictures', 1, 1, 0),
    ('wp_2', 'word_picture', 2, 'Food', 'Match food words to pictures', 2, 0, 80);

    -- Sentence Building Levels
    INSERT INTO levels (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score) VALUES
    ('sb_1', 'sentence_building', 1, 'Simple Sentences', 'Build simple Amharic sentences', 1, 1, 0);

    -- Fill Blank Levels
    INSERT INTO levels (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score) VALUES
    ('fb_1', 'fill_blank', 1, 'Missing Words', 'Fill in the missing word', 1, 1, 0);

    -- Pronunciation Levels
    INSERT INTO levels (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score) VALUES
    ('pron_1', 'pronunciation', 1, 'Basics', 'Practice basic fidels', 1, 1, 0);

    -- Story Levels
    INSERT INTO levels (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score) VALUES
    ('story_1', 'story', 1, 'Lion and Mouse', 'Read along with questions', 1, 1, 0);

    -- Sample Fidels for tracing
    INSERT INTO fidels (id, character, pronunciation, difficulty_level, level_id, stroke_order) VALUES
    ('f1', 'ሀ', 'ha', 1, 'tracing_1', '[{"x":10,"y":10},{"x":20,"y":20}]'),
    ('f2', 'ለ', 'le', 1, 'tracing_1', '[{"x":10,"y":10},{"x":20,"y":20}]'),
    ('f3', 'ሐ', 'he', 1, 'tracing_2', '[{"x":10,"y":10},{"x":20,"y":20}]'),
    ('f4', 'መ', 'me', 1, 'tracing_2', '[{"x":10,"y":10},{"x":20,"y":20}]');

    -- Sample Words
    INSERT INTO words (id, word, difficulty_level, level_id, fidel_ids) VALUES
    ('w1', 'ቤት', 1, 'matching_2', '["f1","f2"]'),
    ('w2', 'ውሃ', 1, 'wp_1', '[]'),
    ('w3', 'ውሻ', 1, 'wp_1', '[]');

    -- Sample Word Images
    INSERT INTO word_images (word_id, image_url, is_correct) VALUES
    ('w2', 'https://images.unsplash.com/photo-1518887578091-1c6a8b4885b2?w=200', 1),
    ('w2', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', 0),
    ('w2', 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200', 0),
    ('w3', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200', 1),
    ('w3', 'https://images.unsplash.com/photo-1518887578091-1c6a8b4885b2?w=200', 0),
    ('w3', 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200', 0);

    -- Sample Sentence + words
    INSERT INTO sentences (id, sentence, difficulty_level, level_id, translation) VALUES
    ('s1', 'እኔ ቤት ሄድኩ', 1, 'sb_1', 'I went home');

    INSERT INTO sentence_words (sentence_id, word, position) VALUES
    ('s1', 'እኔ', 1),
    ('s1', 'ቤት', 2),
    ('s1', 'ሄድኩ', 3);

    -- Fill blank exercise (links to s1)
    INSERT INTO fill_blank_exercises (id, sentence_id, blank_position, correct_word, options, level_id) VALUES
    ('ex1', 's1', 2, 'ቤት', '["ቤት","ውሻ","ውሃ"]', 'fb_1');

    -- Pronunciation practice (uses fidel f1)
    INSERT INTO pronunciation_items (id, content_type, content_id, target_text, level_id, difficulty_level) VALUES
    ('p1', 'fidel', 'f1', 'ሀ', 'pron_1', 1);

    -- Story + questions
    INSERT INTO stories (id, title, content, level_id, difficulty_level, thumbnail_url) VALUES
    ('lion_mouse', 'The Lion and the Mouse', 'አንድ አንበሳ በጫካ ውስጥ ተኝቶ ነበር።', 'story_1', 1, 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400');

    INSERT INTO story_questions (story_id, question, options, correct_answer, question_type, position) VALUES
    ('lion_mouse', 'አንበሳን ማን ረዳው?', '["ዝሆን","አይጥ","አህያ"]', 'አይጥ', 'post', 1);
  `);
}

export const initDatabase = async () => {
  await db.execAsync(`
    -- Content packs table (existing)
    CREATE TABLE IF NOT EXISTS content_packs (
      id TEXT PRIMARY KEY,
      title TEXT,
      size INTEGER,
      status TEXT,
      local_path TEXT,
      created_at TEXT
    );

    -- Levels table for game progression
    CREATE TABLE IF NOT EXISTS levels (
      id TEXT PRIMARY KEY,
      game_type TEXT, -- 'tracing', 'matching', 'word_picture', etc.
      level_number INTEGER,
      title TEXT,
      description TEXT,
      difficulty INTEGER, -- 1-5 for level-based progression
      unlocked_at_start BOOLEAN DEFAULT 0,
      required_score INTEGER, -- score needed to unlock next level
      created_at TEXT
    );

    -- Fidels (Amharic letters) table
    CREATE TABLE IF NOT EXISTS fidels (
      id TEXT PRIMARY KEY,
      character TEXT, -- The Amharic character
      pronunciation TEXT,
      audio_url TEXT,
      local_audio TEXT,
      difficulty_level INTEGER, -- Links to level difficulty
      level_id TEXT, -- Which level this fidel belongs to
      stroke_order TEXT, -- JSON array of stroke points for tracing
      FOREIGN KEY (level_id) REFERENCES levels (id)
    );

    -- Words table
    CREATE TABLE IF NOT EXISTS words (
      id TEXT PRIMARY KEY,
      word TEXT,
      audio_url TEXT,
      local_audio TEXT,
      difficulty_level INTEGER,
      level_id TEXT,
      fidel_ids TEXT, -- JSON array of fidel IDs that make up this word
      FOREIGN KEY (level_id) REFERENCES levels (id)
    );

    -- Word images table
    CREATE TABLE IF NOT EXISTS word_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word_id TEXT,
      image_url TEXT,
      local_image TEXT,
      is_correct BOOLEAN DEFAULT 0, -- For multiple choice options
      FOREIGN KEY (word_id) REFERENCES words (id)
    );

    -- Sentences table
    CREATE TABLE IF NOT EXISTS sentences (
      id TEXT PRIMARY KEY,
      sentence TEXT,
      difficulty_level INTEGER,
      level_id TEXT,
      audio_url TEXT,
      local_audio TEXT,
      translation TEXT, -- Optional English translation
      FOREIGN KEY (level_id) REFERENCES levels (id)
    );

    -- Sentence words (for building games)
    CREATE TABLE IF NOT EXISTS sentence_words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sentence_id TEXT,
      word TEXT,
      position INTEGER,
      is_correct_position BOOLEAN DEFAULT 1,
      FOREIGN KEY (sentence_id) REFERENCES sentences (id)
    );

    -- Stories table
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT PRIMARY KEY,
      title TEXT,
      content TEXT,
      audio_url TEXT,
      local_audio TEXT,
      level_id TEXT,
      difficulty_level INTEGER,
      thumbnail_url TEXT,
      FOREIGN KEY (level_id) REFERENCES levels (id)
    );

    -- Story questions
    CREATE TABLE IF NOT EXISTS story_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      story_id TEXT,
      question TEXT,
      options TEXT, -- JSON array of options
      correct_answer TEXT,
      question_type TEXT, -- 'pre' or 'post' reading
      position INTEGER,
      FOREIGN KEY (story_id) REFERENCES stories (id)
    );

    -- Pronunciation practice items
    CREATE TABLE IF NOT EXISTS pronunciation_items (
      id TEXT PRIMARY KEY,
      content_type TEXT, -- 'fidel', 'word', 'sentence'
      content_id TEXT,
      target_text TEXT,
      audio_url TEXT,
      local_audio TEXT,
      level_id TEXT,
      difficulty_level INTEGER,
      FOREIGN KEY (level_id) REFERENCES levels (id)
    );

    -- Fill-in-the-blank exercises
    CREATE TABLE IF NOT EXISTS fill_blank_exercises (
      id TEXT PRIMARY KEY,
      sentence_id TEXT,
      blank_position INTEGER,
      correct_word TEXT,
      options TEXT, -- JSON array of word options
      audio_url TEXT,
      level_id TEXT,
      FOREIGN KEY (sentence_id) REFERENCES sentences (id),
      FOREIGN KEY (level_id) REFERENCES levels (id)
    );

    -- Child progress tracking (existing - enhanced)
    CREATE TABLE IF NOT EXISTS child_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      game_type TEXT,
      level_id TEXT,
      score INTEGER,
      stars_earned INTEGER, -- 1-3 stars based on performance
      attempts INTEGER,
      completed INTEGER DEFAULT 0,
      best_time INTEGER, -- in seconds
      created_at TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (level_id) REFERENCES levels (id)
    );

    -- Game sessions (existing - enhanced)
    CREATE TABLE IF NOT EXISTS game_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      child_id TEXT,
      game_type TEXT,
      level_id TEXT,
      score INTEGER,
      duration INTEGER,
      mistakes INTEGER,
      hints_used INTEGER,
      completed_successfully BOOLEAN,
      created_at TEXT,
      synced INTEGER DEFAULT 0,
      FOREIGN KEY (level_id) REFERENCES levels (id)
    );

    -- Sync queue (existing)
    CREATE TABLE IF NOT EXISTS sync_queue (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT,
      payload TEXT,
      created_at TEXT
    );
  `);

  // Seed minimal offline content so games can run immediately
  await seedInitialLevels();
};