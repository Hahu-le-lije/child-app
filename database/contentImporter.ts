import * as FileSystem from "expo-file-system/legacy";
import { db } from "@/database/db";
import type { MockPackPayload } from "@/services/contentApi";

async function execMany(sql: string, paramsList: any[][]) {
  for (const params of paramsList) {
    // eslint-disable-next-line no-await-in-loop
    await db.runAsync(sql, params);
  }
}

export async function importContentPackFromFile(uri: string) {
  const raw = await FileSystem.readAsStringAsync(uri);
  const payload = JSON.parse(raw) as MockPackPayload;

  await db.execAsync("BEGIN;");
  try {
    // Levels upsert
    await execMany(
      `INSERT OR REPLACE INTO levels
        (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      payload.levels.map((l) => [
        l.id,
        l.game_type,
        l.level_number,
        l.title,
        l.description,
        l.difficulty,
        l.unlocked_at_start,
        l.required_score,
      ])
    );

    if (payload.fidels?.length) {
      await execMany(
        `INSERT OR REPLACE INTO fidels
          (id, character, pronunciation, audio_url, difficulty_level, level_id, stroke_order)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        payload.fidels.map((f) => [
          f.id,
          f.character,
          f.pronunciation ?? null,
          f.audio_url ?? null,
          f.difficulty_level,
          f.level_id,
          f.stroke_order ?? null,
        ])
      );
    }

    if (payload.words?.length) {
      await execMany(
        `INSERT OR REPLACE INTO words
          (id, word, audio_url, difficulty_level, level_id, fidel_ids)
         VALUES (?, ?, ?, ?, ?, ?)`,
        payload.words.map((w) => [
          w.id,
          w.word,
          w.audio_url ?? null,
          w.difficulty_level,
          w.level_id,
          w.fidel_ids ?? "[]",
        ])
      );
    }

    if (payload.word_images?.length) {
      // Clear old images for the words we are importing, then insert
      const wordIds = Array.from(new Set(payload.word_images.map((wi) => wi.word_id)));
      await execMany(`DELETE FROM word_images WHERE word_id = ?`, wordIds.map((id) => [id]));

      await execMany(
        `INSERT INTO word_images (word_id, image_url, local_image, is_correct)
         VALUES (?, ?, ?, ?)`,
        payload.word_images.map((wi) => [
          wi.word_id,
          wi.image_url,
          wi.local_image ?? null,
          wi.is_correct ? 1 : 0,
        ])
      );
    }

    if (payload.sentences?.length) {
      await execMany(
        `INSERT OR REPLACE INTO sentences
          (id, sentence, difficulty_level, level_id, audio_url, translation, local_audio)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        payload.sentences.map((s) => [
          s.id,
          s.sentence,
          s.difficulty_level,
          s.level_id,
          s.audio_url ?? null,
          s.translation ?? null,
          null,
        ])
      );
    }

    if (payload.sentence_words?.length) {
      const sentenceIds = Array.from(new Set(payload.sentence_words.map((sw) => sw.sentence_id)));
      await execMany(`DELETE FROM sentence_words WHERE sentence_id = ?`, sentenceIds.map((id) => [id]));

      await execMany(
        `INSERT INTO sentence_words (sentence_id, word, position, is_correct_position)
         VALUES (?, ?, ?, ?)`,
        payload.sentence_words.map((sw) => [
          sw.sentence_id,
          sw.word,
          sw.position,
          sw.is_correct_position ?? 1,
        ])
      );
    }

    if (payload.fill_blank_exercises?.length) {
      await execMany(
        `INSERT OR REPLACE INTO fill_blank_exercises
          (id, sentence_id, blank_position, correct_word, options, audio_url, level_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        payload.fill_blank_exercises.map((f) => [
          f.id,
          f.sentence_id,
          f.blank_position,
          f.correct_word,
          f.options,
          f.audio_url ?? null,
          f.level_id,
        ])
      );
    }

    if (payload.pronunciation_items?.length) {
      await execMany(
        `INSERT OR REPLACE INTO pronunciation_items
          (id, content_type, content_id, target_text, audio_url, local_audio, level_id, difficulty_level)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        payload.pronunciation_items.map((p) => [
          p.id,
          p.content_type,
          p.content_id,
          p.target_text,
          p.audio_url ?? null,
          null,
          p.level_id,
          p.difficulty_level,
        ])
      );
    }

    if (payload.stories?.length) {
      await execMany(
        `INSERT OR REPLACE INTO stories
          (id, title, content, audio_url, local_audio, level_id, difficulty_level, thumbnail_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        payload.stories.map((s) => [
          s.id,
          s.title,
          s.content,
          s.audio_url ?? null,
          null,
          s.level_id,
          s.difficulty_level,
          s.thumbnail_url ?? null,
        ])
      );
    }

    if (payload.story_questions?.length) {
      const storyIds = Array.from(new Set(payload.story_questions.map((q) => q.story_id)));
      await execMany(`DELETE FROM story_questions WHERE story_id = ?`, storyIds.map((id) => [id]));

      await execMany(
        `INSERT INTO story_questions (story_id, question, options, correct_answer, question_type, position)
         VALUES (?, ?, ?, ?, ?, ?)`,
        payload.story_questions.map((q) => [
          q.story_id,
          q.question,
          q.options,
          q.correct_answer,
          q.question_type,
          q.position,
        ])
      );
    }

    await db.execAsync("COMMIT;");
  } catch (e) {
    await db.execAsync("ROLLBACK;");
    throw e;
  }
}

