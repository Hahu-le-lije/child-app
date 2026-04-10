import { db } from "@/database/db";

export const getStories=()=>{
    return db.getAllAsync(`
    SELECT * FROM stories
    `);
}
export const getStoryPages = (storyId: string) => {
  return db.getAllSync(
    `
    SELECT * FROM story_pages 
    WHERE story_id = ? 
    ORDER BY page_number ASC
    `,
    [storyId]
  );
};
export const getStoryQuestions = (storyId: string) => {
  const questions = db.getAllSync(
    `SELECT * FROM story_questions WHERE story_id = ?`,
    [storyId]
  );

  return questions.map((q:any) => {
    const choices = db.getAllSync(
      `SELECT choice_text FROM story_choices WHERE question_id = ?`,
      [q.id]
    );

    return {
      ...q,
      choices: choices.map((c:any) => c.choice_text)
    };
  });
};
export const getPictureLevels = () => {
  return db.getAllSync(`SELECT * FROM picture_levels`);
};

export const getPictureQuestions = (levelId: string) => {
  const questions = db.getAllSync(
    `SELECT * FROM picture_questions WHERE level_id = ?`,
    [levelId]
  );

  return questions.map((q:any) => {
    const images = db.getAllSync(
      `SELECT * FROM picture_images WHERE question_id = ?`,
      [q.id]
    );

    return {
      ...q,
      images
    };
  });
};
export const getFidelLevels = () => {
  return db.getAllSync(`SELECT * FROM fidel_levels`);
};

export const getFidelQuestions = (levelId: string) => {
  return db.getAllSync(
    `SELECT * FROM fidel_questions WHERE level_id = ?`,
    [levelId]
  );
};
export const getWordBuilderLevels = () => {
  return db.getAllSync(`SELECT * FROM word_builder_levels`);
};

export const getWordBuilderData = (levelId: string) => {
  const letters = db.getAllSync(
    `SELECT letter FROM letters WHERE level_id = ?`,
    [levelId]
  );

  const words = db.getAllSync(
    `SELECT * FROM words WHERE level_id = ?`,
    [levelId]
  );

  const hints = db.getAllSync(`SELECT * FROM word_hints`);

  return {
    letters: letters.map((l:any) => l.letter),
    words,
    hints
  };
};
export const getFillLevels = () => {
  return db.getAllSync(`SELECT * FROM fill_levels`);
};

export const getFillChoices = (levelId: string) => {
  return db.getAllSync(
    `SELECT choice FROM fill_choices WHERE level_id = ?`,
    [levelId]
  );
};
export const getPronunciationLevels = () => {
  return db.getAllSync(`SELECT * FROM pronunciation_levels`);
};
export const getVoiceLevels = () => {
  return db.getAllSync(`SELECT * FROM voice_levels`);
};

export const getVoiceChoices = (levelId: string) => {
  return db.getAllSync(
    `SELECT * FROM voice_choices WHERE level_id = ?`,
    [levelId]
  );
};