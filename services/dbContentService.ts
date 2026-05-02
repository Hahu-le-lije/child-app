import { db } from "@/database/db";
export const insertStory=(child_id:string,story:any)=>{
  
    db.runSync(
        `
            INSERT OR REPLACE INTO stories(
                id,
                child_id,
                title,
                page_count,
                thumbnail_path
            )VALUES(?,?,?,?)
        `,
        [
            story.id,
            child_id,
            story.title,
            story.pagecount,
            story.thumbnail_path
        ]
    )
}
export const insertStoryPage=(child_id:string,page:any)=>{
    db.runSync(`
        INSERT INTO story_pages(
        child_id,
        story_id,
        page_number,
        story_text,
        image_path
        )VALUES(?,?,?,?)`,
        [
            child_id,
            page.story_id,
            page.page_number,
            page.story_text,
            page.image_path
        ]
    )
}

export const insertStoryQuestion=(child_id:string,question:any)=>{
    const result=db.runSync(`
        INSERT INTO story_questions(
            story_id,
            child_id,
            question_text,
            correct_answer
        )VALUES(?,?,?)
        
    `,[
        question.story_id,
        question.question_text,
        question.correct_answer
    ])
    return result.lastInsertRowId
}

export const insertStoryChoice=(question_id:any,choice:any)=>{
    db.runSync(`
        INSERT INTO story_choices(
            question_id,
            choice_text
        )VALUES(?,?)
    )`,[
        question_id,
        choice
    ])
}
export const insertPictureLevel = (level_id:any) => {
  db.runSync(
    `INSERT OR REPLACE INTO picture_levels (id) VALUES (?)`,
    [level_id]
  );
};

export const insertPictureQuestion = (q:any) => {
  const result = db.runSync(
    `INSERT INTO picture_questions (level_id, question_text, correct_image_id)
     VALUES (?, ?, ?)`,
    [q.level_id, q.text, q.correct_image_id]
  );

  return result.lastInsertRowId;
};

export const insertPictureImage = (img:any) => {
  db.runSync(
    `INSERT INTO picture_images (id, question_id, image_path)
     VALUES (?, ?, ?)`,
    [img.id, img.question_id, img.image_path]
  );
};
export const insertFidelLevel = (level_id:any) => {
  db.runSync(
    `INSERT OR REPLACE INTO fidel_levels (id) VALUES (?)`,
    [level_id]
  );
};

export const insertFidelQuestion = (q:any) => {
  db.runSync(
    `INSERT INTO fidel_questions (level_id, letter, outline_image_path, audio_path)
     VALUES (?, ?, ?, ?)`,
    [q.level_id, q.letter, q.image_path, q.audio_path]
  );
};

export const insertWordBuilderLevel = (level_id:any) => {
  db.runSync(
    `INSERT OR REPLACE INTO word_builder_levels (id) VALUES (?)`,
    [level_id]
  );
};

export const insertLetter = (level_id:any, letter:any) => {
  db.runSync(
    `INSERT INTO letters (level_id, letter) VALUES (?, ?)`,
    [level_id, letter]
  );
};

export const insertWord = (word:any) => {
  db.runSync(
    `INSERT OR REPLACE INTO words (id, level_id, word_text)
     VALUES (?, ?, ?)`,
    [word.id, word.level_id, word.word_text]
  );
};

export const insertWordHint = (word_id:any, hint:any) => {
  db.runSync(
    `INSERT INTO word_hints (word_id, hint_text)
     VALUES (?, ?)`,
    [word_id, hint]
  );
};

export const insertFillLevel = (level:any) => {
  db.runSync(
    `INSERT OR REPLACE INTO fill_levels 
     (id, full_paragraph, blank_paragraph, audio_path)
     VALUES (?, ?, ?, ?)`,
    [level.id, level.full, level.blank, level.audio]
  );
};

export const insertFillChoice = (level_id:any, choice:any) => {
  db.runSync(
    `INSERT INTO fill_choices (level_id, choice)
     VALUES (?, ?)`,
    [level_id, choice]
  );
};
export const insertPronunciation = (item:any) => {
  db.runSync(
    `INSERT OR REPLACE INTO pronunciation_levels 
     (id, word, audio_path, image_path)
     VALUES (?, ?, ?, ?)`,
    [item.id, item.word, item.audio, item.image]
  );
};

export const insertVoiceLevel = (level:any) => {
  db.runSync(
    `INSERT OR REPLACE INTO voice_levels 
     (id, audio_path, correct_word_id)
     VALUES (?, ?, ?)`,
    [level.id, level.audio, level.correct_word_id]
  );
};

export const insertVoiceChoice = (choice:any) => {
  db.runSync(
    `INSERT OR REPLACE INTO voice_choices 
     (id, level_id, word_text)
     VALUES (?, ?, ?)`,
    [choice.id, choice.level_id, choice.word_text]
  );
};