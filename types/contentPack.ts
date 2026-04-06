/**
 * Legacy flat pack JSON shape (no top-level `contents` wrapper).
 * Used when importing older .pack files into SQLite.
 */
export type MockPackPayload = {
  packId?: string;
  gameType?: string;
  levels?: Array<{
    id: string;
    game_type: string;
    level_number: number;
    title: string;
    description: string;
    difficulty: number;
    unlocked_at_start: number;
    required_score: number;
  }>;
  fidels?: Array<{
    id: string;
    character: string;
    pronunciation?: string;
    audio_url?: string;
    difficulty_level: number;
    level_id: string;
    stroke_order?: string;
  }>;
  words?: Array<{
    id: string;
    word: string;
    audio_url?: string;
    difficulty_level: number;
    level_id: string;
    fidel_ids?: string;
  }>;
  word_images?: Array<{
    word_id: string;
    image_url: string;
    local_image?: string;
    is_correct: number;
  }>;
  sentences?: Array<{
    id: string;
    sentence: string;
    difficulty_level: number;
    level_id: string;
    audio_url?: string;
    translation?: string;
  }>;
  sentence_words?: Array<{
    sentence_id: string;
    word: string;
    position: number;
    is_correct_position?: number;
  }>;
  fill_blank_exercises?: Array<{
    id: string;
    sentence_id: string;
    blank_position: number;
    correct_word: string;
    options: string;
    audio_url?: string;
    level_id: string;
  }>;
  pronunciation_items?: Array<{
    id: string;
    content_type: string;
    content_id: string;
    target_text: string;
    audio_url?: string;
    level_id: string;
    difficulty_level: number;
  }>;
  stories?: Array<{
    id: string;
    title: string;
    content: string;
    audio_url?: string;
    level_id: string;
    difficulty_level: number;
    thumbnail_url?: string;
  }>;
  story_questions?: Array<{
    story_id: string;
    question: string;
    options: string;
    correct_answer: string;
    question_type: string;
    position: number;
  }>;
};
