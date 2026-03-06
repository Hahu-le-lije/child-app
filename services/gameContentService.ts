import { db } from "@/database/db";

export const getLevelsForGame = async (gameType: string, childId?: string) => {

  const levels = await db.getAllAsync(
    `SELECT * FROM levels WHERE game_type = ? ORDER BY level_number ASC`,
    [gameType]
  );
  

  if (childId) {
    const progress = await db.getAllAsync(
      `SELECT level_id, stars_earned, completed 
       FROM child_progress 
       WHERE child_id = ? AND game_type = ?`,
      [childId, gameType]
    );
   
    const progressMap:any = progress.reduce((acc: any, p: any) => {
      acc[p.level_id] = p;
      return acc;
    }, {});
    

    return levels.map((level: any) => ({
      ...level,
      unlocked: level.unlocked_at_start === 1 || 
                (progressMap[level.id]?.completed === 1) ||
                checkPreviousLevelCompleted(levels, level, progressMap),
      stars: progressMap[level.id]?.stars_earned || 0,
      completed: progressMap[level.id]?.completed || 0
    }));
  }
  
  return levels;
};

const checkPreviousLevelCompleted = (levels: any[], currentLevel: any, progressMap: any) => {
  const previousLevels = levels.filter(l => l.level_number < currentLevel.level_number);
  return previousLevels.every(l => progressMap[l.id]?.completed === 1);
};

export const getGameContent = async (gameType: string, levelId: string) => {
  switch (gameType) {
    case 'tracing':
      return await db.getAllAsync(
        `SELECT * FROM fidels WHERE level_id = ? ORDER BY difficulty_level`,
        [levelId]
      );
      
    case 'matching':
      return await db.getAllAsync(
        `SELECT w.*, wi.image_url, wi.is_correct 
         FROM words w
         LEFT JOIN word_images wi ON w.id = wi.word_id
         WHERE w.level_id = ?`,
        [levelId]
      );
      
    case 'word_picture':
      return await db.getAllAsync(
        `SELECT w.*, 
                (SELECT json_group_array(json_object('url', image_url, 'is_correct', is_correct)) 
                 FROM word_images WHERE word_id = w.id) as images
         FROM words w
         WHERE w.level_id = ?`,
        [levelId]
      );
      
    case 'sentence_building':
      return await db.getAllAsync(
        `SELECT s.*, 
                (SELECT json_group_array(json_object('word', word, 'position', position)) 
                 FROM sentence_words WHERE sentence_id = s.id ORDER BY position) as words
         FROM sentences s
         WHERE s.level_id = ?`,
        [levelId]
      );
      
    case 'fill_blank':
      return await db.getAllAsync(
        `SELECT f.*, s.sentence 
         FROM fill_blank_exercises f
         JOIN sentences s ON f.sentence_id = s.id
         WHERE f.level_id = ?`,
        [levelId]
      );
      
    case 'story':
      return await db.getAllAsync(
        `SELECT s.*, 
                (SELECT json_group_array(json_object('question', question, 'options', options, 'correct_answer', correct_answer)) 
                 FROM story_questions WHERE story_id = s.id ORDER BY position) as questions
         FROM stories s
         WHERE s.level_id = ?`,
        [levelId]
      );
      
    default:
      return [];
  }
};

export const saveGameProgress = async (
  childId: string,
  gameType: string,
  levelId: string,
  score: number,
  stars: number,
  completed: boolean,
  duration: number
) => {
  await db.runAsync(
    `INSERT INTO child_progress (child_id, game_type, level_id, score, stars_earned, completed, best_time, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    [childId, gameType, levelId, score, stars, completed ? 1 : 0, duration]
  );
  

  await db.runAsync(
    `INSERT INTO game_sessions (child_id, game_type, level_id, score, duration, completed_successfully, created_at)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [childId, gameType, levelId, score, duration, completed ? 1 : 0]
  );
};