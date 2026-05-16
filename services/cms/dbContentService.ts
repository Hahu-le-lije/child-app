import { db } from "@/database/db";


export function packScopedId(packSlug: string, rawId: string): string {
  const s = packSlug.trim();
  const r = String(rawId).trim();
  if (!s || !r) return r || s;
  return `${s}__${r}`;
}

export function clearPackGameData(childId: string, packSlug: string): void {
  const prefix = `${packSlug.trim()}__`;
  const c = childId;

  db.execSync("BEGIN");
  try {
    db.runSync(`DELETE FROM story_choices WHERE child_id = ? AND question_id IN (
      SELECT id FROM story_questions WHERE child_id = ? AND story_id LIKE ? || '%'
    )`, [c, c, prefix]);
    db.runSync(
      `DELETE FROM story_questions WHERE child_id = ? AND story_id LIKE ? || '%'`,
      [c, prefix]
    );
    db.runSync(`DELETE FROM story_pages WHERE child_id = ? AND story_id LIKE ? || '%'`, [
      c,
      prefix,
    ]);
    db.runSync(`DELETE FROM stories WHERE child_id = ? AND id LIKE ? || '%'`, [c, prefix]);

    db.runSync(
      `DELETE FROM picture_images WHERE child_id = ? AND question_id IN (
      SELECT id FROM picture_questions WHERE child_id = ? AND level_id LIKE ? || '%'
    )`,
      [c, c, prefix]
    );
    db.runSync(
      `DELETE FROM picture_questions WHERE child_id = ? AND level_id LIKE ? || '%'`,
      [c, prefix]
    );
    db.runSync(`DELETE FROM picture_levels WHERE child_id = ? AND id LIKE ? || '%'`, [c, prefix]);

    db.runSync(
      `DELETE FROM fidel_images WHERE child_id = ? AND question_id IN (
      SELECT id FROM fidel_questions WHERE child_id = ? AND level_id LIKE ? || '%'
    )`,
      [c, c, prefix]
    );
    db.runSync(
      `DELETE FROM fidel_questions WHERE child_id = ? AND level_id LIKE ? || '%'`,
      [c, prefix]
    );
    db.runSync(`DELETE FROM fidel_levels WHERE child_id = ? AND id LIKE ? || '%'`, [c, prefix]);

    db.runSync(`DELETE FROM word_hints WHERE child_id = ? AND word_id LIKE ? || '%'`, [c, prefix]);
    db.runSync(`DELETE FROM words WHERE child_id = ? AND level_id LIKE ? || '%'`, [c, prefix]);
    db.runSync(`DELETE FROM letters WHERE child_id = ? AND level_id LIKE ? || '%'`, [c, prefix]);
    db.runSync(
      `DELETE FROM word_builder_levels WHERE child_id = ? AND id LIKE ? || '%'`,
      [c, prefix]
    );

    db.runSync(
      `DELETE FROM fill_choices WHERE child_id = ? AND level_id LIKE ? || '%'`,
      [c, prefix]
    );
    db.runSync(`DELETE FROM fill_levels WHERE child_id = ? AND id LIKE ? || '%'`, [c, prefix]);

    db.runSync(
      `DELETE FROM pronunciation_levels WHERE child_id = ? AND id LIKE ? || '%'`,
      [c, prefix]
    );

    db.runSync(
      `DELETE FROM voice_choices WHERE child_id = ? AND level_id LIKE ? || '%'`,
      [c, prefix]
    );
    db.runSync(`DELETE FROM voice_levels WHERE child_id = ? AND id LIKE ? || '%'`, [c, prefix]);

    db.runSync(
      `DELETE FROM matching_words WHERE child_id = ? AND level_id LIKE ? || '%'`,
      [c, prefix]
    );
    db.runSync(`DELETE FROM matching_levels WHERE child_id = ? AND id LIKE ? || '%'`, [c, prefix]);

    db.runSync(`DELETE FROM sentences WHERE child_id = ? AND level_id LIKE ? || '%'`, [c, prefix]);
    db.runSync(
      `DELETE FROM sentence_levels WHERE child_id = ? AND id LIKE ? || '%'`,
      [c, prefix]
    );

    db.runSync(`DELETE FROM content_packs WHERE child_id = ? AND slug = ?`, [c, packSlug.trim()]);

    db.execSync("COMMIT");
  } catch (e) {
    db.execSync("ROLLBACK");
    throw e;
  }
}

export const insertStory = (
  child_id: string,
  story: {
    id: string;
    title: string;
    pagecount: number;
    thumbnail_path: string;
    level_id?: string;
  }
) => {
  db.runSync(
    `INSERT OR REPLACE INTO stories(
      id, child_id, level_id, title, page_count, thumbnail_path
    ) VALUES (?, ?, ?, ?, ?, ?)`,
    [
      story.id,
      child_id,
      story.level_id ?? null,
      story.title,
      story.pagecount,
      story.thumbnail_path,
    ]
  );
};

export const insertStoryPage = (
  child_id: string,
  page: {
    story_id: string;
    page_number: number;
    story_text: string;
    image_path: string;
  }
) => {
  db.runSync(
    `INSERT INTO story_pages(
      child_id, story_id, page_number, story_text, image_path
    ) VALUES (?, ?, ?, ?, ?)`,
    [child_id, page.story_id, page.page_number, page.story_text, page.image_path]
  );
};

export const insertStoryQuestion = (
  child_id: string,
  question: { story_id: string; question_text: string; correct_answer: string }
) => {
  const result = db.runSync(
    `INSERT INTO story_questions(
      story_id, child_id, question_text, correct_answer
    ) VALUES (?, ?, ?, ?)`,
    [question.story_id, child_id, question.question_text, question.correct_answer]
  );
  return result.lastInsertRowId;
};

export const insertStoryChoice = (child_id: string, question_id: number, choice: string) => {
  db.runSync(
    `INSERT INTO story_choices(
      child_id, question_id, choice_text
    ) VALUES (?, ?, ?)`,
    [child_id, question_id, choice]
  );
};

export const insertPictureLevel = (child_id: string, level_id: string) => {
  db.runSync(`INSERT OR REPLACE INTO picture_levels (id, child_id) VALUES (?, ?)`, [
    level_id,
    child_id,
  ]);
};

export const insertPictureQuestion = (
  child_id: string,
  q: { level_id: string; text: string; correct_image_id: string }
) => {
  const result = db.runSync(
    `INSERT INTO picture_questions (child_id, level_id, question_text, correct_image_id)
     VALUES (?, ?, ?, ?)`,
    [child_id, q.level_id, q.text, q.correct_image_id]
  );
  return result.lastInsertRowId;
};

export const insertPictureImage = (
  child_id: string,
  img: { id: string; question_id: number; image_path: string }
) => {
  db.runSync(
    `INSERT INTO picture_images (id, child_id, question_id, image_path)
     VALUES (?, ?, ?, ?)`,
    [img.id, child_id, img.question_id, img.image_path]
  );
};

export const insertFidelLevel = (child_id: string, level_id: string) => {
  db.runSync(`INSERT OR REPLACE INTO fidel_levels (id, child_id) VALUES (?, ?)`, [
    level_id,
    child_id,
  ]);
};

export const insertFidelQuestion = (
  child_id: string,
  q: { level_id: string; letter: string; image_path: string | null; audio_path: string | null }
) => {
  db.runSync(
    `INSERT INTO fidel_questions (child_id, level_id, letter, outline_image_path, audio_path)
     VALUES (?, ?, ?, ?, ?)`,
    [child_id, q.level_id, q.letter, q.image_path, q.audio_path]
  );
};

export const insertWordBuilderLevel = (child_id: string, level_id: string) => {
  db.runSync(`INSERT OR REPLACE INTO word_builder_levels (id, child_id) VALUES (?, ?)`, [
    level_id,
    child_id,
  ]);
};

export const insertLetter = (child_id: string, level_id: string, letter: string) => {
  db.runSync(`INSERT INTO letters (child_id, level_id, letter) VALUES (?, ?, ?)`, [
    child_id,
    level_id,
    letter,
  ]);
};

export const insertWord = (
  child_id: string,
  word: { id: string; level_id: string; word_text: string }
) => {
  db.runSync(
    `INSERT OR REPLACE INTO words (id, child_id, level_id, word_text)
     VALUES (?, ?, ?, ?)`,
    [word.id, child_id, word.level_id, word.word_text]
  );
};

export const insertWordHint = (child_id: string, word_id: string, hint: string) => {
  db.runSync(`INSERT INTO word_hints (child_id, word_id, hint_text) VALUES (?, ?, ?)`, [
    child_id,
    word_id,
    hint,
  ]);
};

export const insertFillLevel = (
  child_id: string,
  level: { id: string; full: string; blank: string; audio: string }
) => {
  db.runSync(
    `INSERT OR REPLACE INTO fill_levels 
     (id, child_id, full_paragraph, blank_paragraph, audio_path)
     VALUES (?, ?, ?, ?, ?)`,
    [level.id, child_id, level.full, level.blank, level.audio]
  );
};

export const insertFillChoice = (child_id: string, level_id: string, choice: string) => {
  db.runSync(`INSERT INTO fill_choices (child_id, level_id, choice) VALUES (?, ?, ?)`, [
    child_id,
    level_id,
    choice,
  ]);
};

export const insertPronunciation = (
  child_id: string,
  item: { id: string; word: string; audio: string; image: string }
) => {
  db.runSync(
    `INSERT OR REPLACE INTO pronunciation_levels 
     (id, child_id, word, audio_path, image_path)
     VALUES (?, ?, ?, ?, ?)`,
    [item.id, child_id, item.word, item.audio, item.image]
  );
};

export const insertVoiceLevel = (
  child_id: string,
  level: { id: string; audio: string; correct_word_id: string }
) => {
  db.runSync(
    `INSERT OR REPLACE INTO voice_levels 
     (id, child_id, audio_path, correct_word_id)
     VALUES (?, ?, ?, ?)`,
    [level.id, child_id, level.audio, level.correct_word_id]
  );
};

export const insertVoiceChoice = (
  child_id: string,
  choice: { id: string; level_id: string; word_text: string }
) => {
  db.runSync(
    `INSERT OR REPLACE INTO voice_choices 
     (id, child_id, level_id, word_text)
     VALUES (?, ?, ?, ?)`,
    [choice.id, child_id, choice.level_id, choice.word_text]
  );
};

export const insertMatchingLevel = (child_id: string, level_id: string) => {
  db.runSync(`INSERT OR REPLACE INTO matching_levels (id, child_id) VALUES (?, ?)`, [
    level_id,
    child_id,
  ]);
};

export const insertMatchingWord = (
  child_id: string,
  row: {
    id: string;
    level_id: string;
    word: string;
    audio_path: string;
    image_path: string;
  }
) => {
  db.runSync(
    `INSERT OR REPLACE INTO matching_words
     (id, child_id, level_id, word, audio_path, image_path)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [row.id, child_id, row.level_id, row.word, row.audio_path, row.image_path]
  );
};

export const insertSentenceLevel = (child_id: string, level_id: string) => {
  db.runSync(`INSERT OR REPLACE INTO sentence_levels (id, child_id) VALUES (?, ?)`, [
    level_id,
    child_id,
  ]);
};

export const insertSentence = (
  child_id: string,
  row: { id: string; level_id: string; sentence: string; words_json: string }
) => {
  db.runSync(
    `INSERT OR REPLACE INTO sentences (id, child_id, level_id, sentence, words_json)
     VALUES (?, ?, ?, ?, ?)`,
    [row.id, child_id, row.level_id, row.sentence, row.words_json]
  );
};

export { saveContentPackRecord } from "@/services/cms/repositories/contentPackRepository";
