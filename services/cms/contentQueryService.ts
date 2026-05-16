import { db } from "@/database/db";

export const getStoriesForChild = (childId: string) => {
  return db.getAllSync(`SELECT * FROM stories WHERE child_id = ?`, [childId]);
};

export const getStoryPages = (childId: string, storyId: string) => {
  return db.getAllSync(
    `
    SELECT * FROM story_pages 
    WHERE child_id = ? AND story_id = ? 
    ORDER BY page_number ASC
    `,
    [childId, storyId]
  );
};

export const getStoryQuestions = (childId: string, storyId: string) => {
  const questions = db.getAllSync(
    `SELECT * FROM story_questions WHERE child_id = ? AND story_id = ?`,
    [childId, storyId]
  ) as Array<Record<string, unknown>>;

  return questions.map((q) => {
    const id = Number(q.id);
    const choices = db.getAllSync(
      `SELECT choice_text FROM story_choices WHERE child_id = ? AND question_id = ?`,
      [childId, id]
    ) as Array<{ choice_text: string }>;
    return {
      ...q,
      id,
      question_text: String(q.question_text ?? ""),
      correct_answer: String(q.correct_answer ?? ""),
      choices: choices.map((c) => c.choice_text),
    };
  });
};

/** Level cards for story quiz: one row per distinct level_id (or per story if level_id empty). */
export const getStoryLevelSummaries = (childId: string) => {
  const rows = db.getAllSync(
    `
    SELECT 
      COALESCE(NULLIF(TRIM(level_id), ''), id) AS level_key,
      MIN(title) AS title
    FROM stories
    WHERE child_id = ?
    GROUP BY COALESCE(NULLIF(TRIM(level_id), ''), id)
    ORDER BY MIN(id)
    `,
    [childId]
  ) as Array<{ level_key: string; title: string }>;
  return rows.map((r, i: number) => ({
    id: r.level_key,
    level_number: i + 1,
    title: r.title ?? `Story ${i + 1}`,
    description: "Story comprehension practice",
    difficulty: 1,
  }));
};

export const getStoriesForStoryLevel = (childId: string, levelKey: string) => {
  return db.getAllSync(
    `
    SELECT * FROM stories
    WHERE child_id = ? AND (
      id = ? OR TRIM(level_id) = TRIM(?)
      OR (level_id IS NULL AND id = ?)
      OR COALESCE(NULLIF(TRIM(level_id), ''), id) = ?
    )
    ORDER BY id
    `,
    [childId, levelKey, levelKey, levelKey, levelKey]
  );
};

export const getPictureLevels = (childId: string) => {
  return db.getAllSync(`SELECT * FROM picture_levels WHERE child_id = ? ORDER BY id`, [
    childId,
  ]);
};

export const getPictureQuestions = (childId: string, levelId: string) => {
  const questions = db.getAllSync(
    `SELECT * FROM picture_questions WHERE child_id = ? AND level_id = ?`,
    [childId, levelId]
  ) as Array<{ id: number } & Record<string, unknown>>;
  return questions.map((q) => {
    const images = db.getAllSync(
      `SELECT * FROM picture_images WHERE child_id = ? AND question_id = ?`,
      [childId, q.id]
    );
    return { ...q, images };
  });
};

export const getFidelLevels = (childId: string) => {
  return db.getAllSync(`SELECT * FROM fidel_levels WHERE child_id = ? ORDER BY id`, [childId]);
};

export const getFidelQuestions = (childId: string, levelId: string) => {
  return db.getAllSync(
    `SELECT * FROM fidel_questions WHERE child_id = ? AND level_id = ?`,
    [childId, levelId]
  );
};

export const getWordBuilderLevels = (childId: string) => {
  return db.getAllSync(
    `SELECT * FROM word_builder_levels WHERE child_id = ? ORDER BY id`,
    [childId]
  );
};

export const getWordBuilderData = (childId: string, levelId: string) => {
  const letters = db.getAllSync(
    `SELECT letter FROM letters WHERE child_id = ? AND level_id = ?`,
    [childId, levelId]
  ) as Array<{ letter: string }>;
  const words = db.getAllSync(
    `SELECT * FROM words WHERE child_id = ? AND level_id = ?`,
    [childId, levelId]
  );
  const hints = db.getAllSync(
    `SELECT * FROM word_hints WHERE child_id = ? AND word_id IN (
      SELECT id FROM words WHERE child_id = ? AND level_id = ?
    )`,
    [childId, childId, levelId]
  );
  return {
    letters: letters.map((l) => l.letter),
    words,
    hints,
  };
};

export const getFillLevels = (childId: string) => {
  return db.getAllSync(`SELECT * FROM fill_levels WHERE child_id = ? ORDER BY id`, [childId]);
};

export const getFillChoices = (childId: string, levelId: string) => {
  return db.getAllSync(
    `SELECT choice FROM fill_choices WHERE child_id = ? AND level_id = ?`,
    [childId, levelId]
  );
};

export const getPronunciationLevels = (childId: string) => {
  return db.getAllSync(
    `SELECT * FROM pronunciation_levels WHERE child_id = ? ORDER BY id`,
    [childId]
  );
};

export const getVoiceLevels = (childId: string) => {
  return db.getAllSync(`SELECT * FROM voice_levels WHERE child_id = ? ORDER BY id`, [childId]);
};

export const getVoiceChoices = (childId: string, levelId: string) => {
  return db.getAllSync(
    `SELECT * FROM voice_choices WHERE child_id = ? AND level_id = ?`,
    [childId, levelId]
  );
};

export const getMatchingLevels = (childId: string) => {
  return db.getAllSync(`SELECT * FROM matching_levels WHERE child_id = ? ORDER BY id`, [
    childId,
  ]);
};

export const getMatchingWords = (childId: string, levelId: string) => {
  return db.getAllSync(
    `SELECT id, word, audio_path AS audio_url, image_path AS image_url
     FROM matching_words WHERE child_id = ? AND level_id = ?`,
    [childId, levelId]
  );
};

export const getSentenceLevels = (childId: string) => {
  return db.getAllSync(`SELECT * FROM sentence_levels WHERE child_id = ? ORDER BY id`, [
    childId,
  ]);
};

export const getSentencesForLevel = (childId: string, levelId: string) => {
  return db.getAllSync(
    `SELECT id, sentence, words_json AS words FROM sentences WHERE child_id = ? AND level_id = ?`,
    [childId, levelId]
  );
};

export { getInstalledPacks, getInstalledPack } from "@/services/cms/repositories/contentPackRepository";
