import { db } from "./db";

export const initContentDB = () => {
  db.execSync(`
    
    CREATE TABLE IF NOT EXISTS stories (
      id TEXT,
      child_id TEXT,
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

  `);
};