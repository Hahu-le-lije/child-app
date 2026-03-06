// services/contentApi.ts

// Mock data structure for level-based content using online images
export const getAvailableContent = async () => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    // Content packs (for bulk downloads)
    contentPacks: [
      {
        id: "fidel_tracing_pack",
        title: "Fidel Tracing Complete Pack",
        description: "All tracing levels for Amharic fidels",
        size: 45,
        gameType: "tracing",
        levels: ["tracing_1", "tracing_2", "tracing_3", "tracing_4", "tracing_5"],
        downloadUrl: "mock://fidel_tracing_pack",
        thumbnail: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200"
      },
      {
        id: "matching_pack_1",
        title: "Fidel Matching Pack - Level 1-3",
        description: "Basic fidel matching games",
        size: 28,
        gameType: "matching",
        levels: ["matching_1", "matching_2", "matching_3"],
        downloadUrl: "mock://matching_pack_1",
        thumbnail: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=200"
      },
      {
        id: "word_picture_pack",
        title: "Word to Picture Pack",
        description: "100+ words with images",
        size: 62,
        gameType: "word_picture",
        levels: ["wp_1", "wp_2", "wp_3", "wp_4", "wp_5"],
        downloadUrl: "mock://word_picture",
        thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200"
      },
      {
        id: "sentence_pack_1",
        title: "Sentence Building Pack",
        description: "Basic Amharic sentences",
        size: 34,
        gameType: "sentence_building",
        levels: ["sb_1", "sb_2", "sb_3"],
        downloadUrl: "mock://sentences",
        thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=200"
      },
      {
        id: "story_pack_animals",
        title: "Animal Stories Pack",
        description: "5 stories about animals",
        size: 78,
        gameType: "story",
        levels: ["story_1", "story_2", "story_3", "story_4", "story_5"],
        downloadUrl: "mock://stories",
        thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200"
      },
      {
        id: "pronunciation_basics",
        title: "Pronunciation Practice Pack",
        description: "Basic fidel pronunciation",
        size: 52,
        gameType: "pronunciation",
        levels: ["pron_1", "pron_2", "pron_3"],
        downloadUrl: "mock://pronunciation",
        thumbnail: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=200"
      }
    ],
    
    // Individual levels (for the [id].tsx pages)
    gameLevels: {
      // Tracing levels
      tracing: [
        {
          id: "tracing_1",
          title: "Basic Fidels - Level 1",
          description: "Learn to trace ሀ, ለ, ሐ, መ",
          gameType: "tracing",
          levelNumber: 1,
          difficulty: 1,
          thumbnail: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400",
          content: {
            fidels: [
              { id: "f1", character: "ሀ", pronunciation: "ha", audioUrl: "https://example.com/audio/ha.mp3", strokeOrder: "https://example.com/strokes/ha.svg" },
              { id: "f2", character: "ለ", pronunciation: "le", audioUrl: "https://example.com/audio/le.mp3", strokeOrder: "https://example.com/strokes/le.svg" },
              { id: "f3", character: "ሐ", pronunciation: "he", audioUrl: "https://example.com/audio/he.mp3", strokeOrder: "https://example.com/strokes/he.svg" },
              { id: "f4", character: "መ", pronunciation: "me", audioUrl: "https://example.com/audio/me.mp3", strokeOrder: "https://example.com/strokes/me.svg" }
            ],
            instructions: "Trace each fidel by following the dots",
            backgroundImage: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800"
          },
          unlockRequirements: {
            starsNeeded: 0,
            previousLevelCompleted: null
          }
        },
        {
          id: "tracing_2",
          title: "Basic Fidels - Level 2",
          description: "Learn to trace ሠ, ረ, ሰ, ሸ",
          gameType: "tracing",
          levelNumber: 2,
          difficulty: 1,
          thumbnail: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=400",
          content: {
            fidels: [
              { id: "f5", character: "ሠ", pronunciation: "se", audioUrl: "https://example.com/audio/se.mp3", strokeOrder: "https://example.com/strokes/se.svg" },
              { id: "f6", character: "ረ", pronunciation: "re", audioUrl: "https://example.com/audio/re.mp3", strokeOrder: "https://example.com/strokes/re.svg" },
              { id: "f7", character: "ሰ", pronunciation: "se", audioUrl: "https://example.com/audio/se2.mp3", strokeOrder: "https://example.com/strokes/se2.svg" },
              { id: "f8", character: "ሸ", pronunciation: "she", audioUrl: "https://example.com/audio/she.mp3", strokeOrder: "https://example.com/strokes/she.svg" }
            ],
            instructions: "Trace each fidel by following the dots"
          },
          unlockRequirements: {
            starsNeeded: 2,
            previousLevelCompleted: "tracing_1"
          }
        }
      ],
      
      // Matching levels
      matching: [
        {
          id: "matching_1",
          title: "Match Sounds - Level 1",
          description: "Match spoken fidels to written forms",
          gameType: "matching",
          levelNumber: 1,
          difficulty: 1,
          thumbnail: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400",
          content: {
            pairs: [
              { audio: "https://example.com/audio/ha.mp3", fidel: "ሀ", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=100" },
              { audio: "https://example.com/audio/le.mp3", fidel: "ለ", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=100" },
              { audio: "https://example.com/audio/he.mp3", fidel: "ሐ", image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=100" }
            ],
            timeLimit: 60
          },
          unlockRequirements: {
            starsNeeded: 0,
            previousLevelCompleted: null
          }
        },
        {
          id: "matching_2",
          title: "Match Words - Level 2",
          description: "Match spoken words to written forms",
          gameType: "matching",
          levelNumber: 2,
          difficulty: 2,
          thumbnail: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=400",
          content: {
            pairs: [
              { audio: "https://example.com/audio/house.mp3", word: "ቤት", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=100" },
              { audio: "https://example.com/audio/water.mp3", word: "ውሃ", image: "https://images.unsplash.com/photo-1518887578091-1c6a8b4885b2?w=100" },
              { audio: "https://example.com/audio/dog.mp3", word: "ውሻ", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=100" }
            ],
            timeLimit: 90
          },
          unlockRequirements: {
            starsNeeded: 2,
            previousLevelCompleted: "matching_1"
          }
        }
      ],
      
      // Word to Picture levels
      word_picture: [
        {
          id: "wp_1",
          title: "Animals - Level 1",
          description: "Match animal words to pictures",
          gameType: "word_picture",
          levelNumber: 1,
          difficulty: 1,
          thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400",
          content: {
            items: [
              { word: "ውሻ", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200", correct: true },
              { word: "ድመት", image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=200", correct: true },
              { word: "ላም", image: "https://images.unsplash.com/photo-1570042225831-d98af757d2f3?w=200", correct: true },
              { word: "ዶሮ", image: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=200", correct: true }
            ],
            distractors: [
              { word: "ሀገር", image: "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=200" },
              { word: "ቤት", image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200" },
              { word: "ውሃ", image: "https://images.unsplash.com/photo-1518887578091-1c6a8b4885b2?w=200" }
            ]
          }
        },
        {
          id: "wp_2",
          title: "Food - Level 2",
          description: "Match food words to pictures",
          gameType: "word_picture",
          levelNumber: 2,
          difficulty: 2,
          thumbnail: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400",
          content: {
            items: [
              { word: "በርበሬ", image: "https://images.unsplash.com/photo-1592136698823-39d5c2aabe3e?w=200", correct: true },
              { word: "እንጀራ", image: "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=200", correct: true },
              { word: "ወተት", image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=200", correct: true }
            ],
            distractors: [
              { word: "ውሻ", image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200" }
            ]
          }
        }
      ],
      
      // Sentence Building levels
      sentence_building: [
        {
          id: "sb_1",
          title: "Simple Sentences - Level 1",
          description: "Build 3-word sentences",
          gameType: "sentence_building",
          levelNumber: 1,
          difficulty: 1,
          thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
          content: {
            sentences: [
              {
                id: "s1",
                text: "እኔ ቤት ሄድኩ",
                words: ["እኔ", "ቤት", "ሄድኩ"],
                scrambled: true,
                image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200"
              },
              {
                id: "s2",
                text: "ልጁ ውሻ አየ",
                words: ["ልጁ", "ውሻ", "አየ"],
                scrambled: true,
                image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200"
              }
            ]
          }
        }
      ],
      
      // Story levels
      story: [
        {
          id: "story_1",
          title: "The Lion and the Mouse",
          description: "Read along with audio",
          gameType: "story",
          levelNumber: 1,
          difficulty: 1,
          thumbnail: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
          content: {
            storyId: "lion_mouse",
            coverImage: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
            pages: [
              {
                pageNumber: 1,
                text: "አንድ አንበሳ በጫካ ውስጥ ተኝቶ ነበር።",
                image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400",
                audioUrl: "https://example.com/audio/lion1.mp3"
              },
              {
                pageNumber: 2,
                text: "አንድ አይጥ በአንበሳ ላይ ሮጠ።",
                image: "https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=400",
                audioUrl: "https://example.com/audio/lion2.mp3"
              }
            ],
            questions: [
              {
                type: "pre",
                question: "ምን ይመስልሃል ይሆናል?",
                options: ["አንበሳ አይጡን ይበላል", "አይጡ አንበሳን ይረዳል", "ምንም አይሆንም"],
                correct: "አይጡ አንበሳን ይረዳል"
              },
              {
                type: "post",
                question: "አንበሳን ማን ረዳው?",
                options: ["ዝሆን", "አይጥ", "አህያ"],
                correct: "አይጥ"
              }
            ]
          }
        }
      ],
      
      // Fill in the blank levels
      fill_blank: [
        {
          id: "fb_1",
          title: "Missing Words - Level 1",
          description: "Fill in the missing word",
          gameType: "fill_blank",
          levelNumber: 1,
          difficulty: 1,
          thumbnail: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400",
          content: {
            exercises: [
              {
                id: "ex1",
                sentence: "እኔ _____ ሄድኩ",
                blankIndex: 1,
                options: ["ቤት", "ውሻ", "ድመት"],
                correct: "ቤት",
                imageHint: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=200",
                audioHint: "https://example.com/audio/house.mp3"
              },
              {
                id: "ex2",
                sentence: "ውሻ _____ ይጫወታል",
                blankIndex: 1,
                options: ["በጓሮ", "በቤት", "በውሃ"],
                correct: "በጓሮ",
                imageHint: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=200",
                audioHint: "https://example.com/audio/dog.mp3"
              }
            ]
          }
        }
      ],
      
      // Pronunciation levels
      pronunciation: [
        {
          id: "pron_1",
          title: "Basic Fidels - Level 1",
          description: "Practice saying ሀ, ለ, ሐ",
          gameType: "pronunciation",
          levelNumber: 1,
          difficulty: 1,
          thumbnail: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=400",
          content: {
            items: [
              { 
                id: "p1",
                text: "ሀ", 
                character: "ሀ",
                audioUrl: "https://example.com/audio/ha_correct.mp3", 
                expectedSound: "ha",
                image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200"
              },
              { 
                id: "p2",
                text: "ለ", 
                character: "ለ",
                audioUrl: "https://example.com/audio/le_correct.mp3", 
                expectedSound: "le",
                image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200"
              },
              { 
                id: "p3",
                text: "ሐ", 
                character: "ሐ",
                audioUrl: "https://example.com/audio/he_correct.mp3", 
                expectedSound: "he",
                image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=200"
              }
            ],
            attemptsAllowed: 3
          }
        }
      ]
    },
    
    // Mock user progress (would come from database)
    userProgress: {
      completedLevels: ["tracing_1", "matching_1"],
      starsEarned: {
        tracing_1: 3,
        matching_1: 2
      },
      currentLevel: "tracing_2",
      unlockedLevels: ["tracing_1", "tracing_2", "matching_1"]
    }
  };
};

export type MockPackPayload = {
  packId: string;
  gameType: string;
  levels: Array<{
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

/**
 * Given a pack id (from `contentPacks[].id`), returns the JSON payload that we
 * "download" for offline play and later import into SQLite.
 */
export const getMockContentPackPayload = async (packId: string): Promise<MockPackPayload | null> => {
  const data = await getAvailableContent();
  const pack = data.contentPacks.find((p) => p.id === packId);
  if (!pack) return null;

  const gameType = pack.gameType;
  const levels = (data.gameLevels as any)[gameType] || [];

  const payload: MockPackPayload = {
    packId,
    gameType,
    levels: levels.map((l: any, idx: number) => ({
      id: l.id,
      game_type: l.gameType,
      level_number: l.levelNumber ?? idx + 1,
      title: l.title,
      description: l.description,
      difficulty: l.difficulty ?? 1,
      unlocked_at_start: l.levelNumber === 1 ? 1 : 0,
      required_score: l.unlockRequirements?.starsNeeded ? 80 : 0,
    })),
  };

  if (gameType === "tracing") {
    payload.fidels = [];
    for (const lvl of levels) {
      const fidels = lvl?.content?.fidels || [];
      for (let i = 0; i < fidels.length; i++) {
        const f = fidels[i];
        payload.fidels.push({
          id: f.id,
          character: f.character,
          pronunciation: f.pronunciation,
          audio_url: f.audioUrl,
          difficulty_level: i + 1,
          level_id: lvl.id,
          stroke_order: JSON.stringify([{ x: 10, y: 10 }, { x: 20, y: 20 }]),
        });
      }
    }
    return payload;
  }

  if (gameType === "matching") {
    // Convert pairs into words+images (simple dummy mapping)
    payload.words = [];
    payload.word_images = [];
    for (const lvl of levels) {
      const pairs = lvl?.content?.pairs || [];
      for (let i = 0; i < pairs.length; i++) {
        const p = pairs[i];
        const wordId = `${lvl.id}_w_${i + 1}`;
        const wordText = p.word || p.fidel || `Item ${i + 1}`;
        payload.words.push({
          id: wordId,
          word: wordText,
          audio_url: p.audio,
          difficulty_level: lvl.difficulty ?? 1,
          level_id: lvl.id,
          fidel_ids: "[]",
        });
        payload.word_images.push({
          word_id: wordId,
          image_url: p.image,
          is_correct: 1,
        });
      }
    }
    return payload;
  }

  if (gameType === "word_picture") {
    payload.words = [];
    payload.word_images = [];
    for (const lvl of levels) {
      const items = lvl?.content?.items || [];
      const distractors = lvl?.content?.distractors || [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const wordId = `${lvl.id}_w_${i + 1}`;
        payload.words.push({
          id: wordId,
          word: it.word,
          difficulty_level: lvl.difficulty ?? 1,
          level_id: lvl.id,
          fidel_ids: "[]",
        });
        payload.word_images.push({ word_id: wordId, image_url: it.image, is_correct: 1 });
        // attach up to 2 distractors per word
        for (let d = 0; d < Math.min(2, distractors.length); d++) {
          payload.word_images.push({ word_id: wordId, image_url: distractors[d].image, is_correct: 0 });
        }
      }
    }
    return payload;
  }

  if (gameType === "sentence_building") {
    payload.sentences = [];
    payload.sentence_words = [];
    for (const lvl of levels) {
      const sentences = lvl?.content?.sentences || [];
      for (const s of sentences) {
        payload.sentences.push({
          id: s.id,
          sentence: s.text,
          difficulty_level: lvl.difficulty ?? 1,
          level_id: lvl.id,
          audio_url: undefined,
          translation: undefined,
        });
        for (let pos = 0; pos < (s.words || []).length; pos++) {
          payload.sentence_words.push({
            sentence_id: s.id,
            word: s.words[pos],
            position: pos + 1,
            is_correct_position: 1,
          });
        }
      }
    }
    return payload;
  }

  if (gameType === "fill_blank") {
    payload.sentences = [];
    payload.fill_blank_exercises = [];
    for (const lvl of levels) {
      const exs = lvl?.content?.exercises || [];
      for (const ex of exs) {
        // Create a stable sentence id per exercise
        const sentenceId = `sent_${ex.id}`;
        payload.sentences.push({
          id: sentenceId,
          sentence: ex.sentence,
          difficulty_level: lvl.difficulty ?? 1,
          level_id: lvl.id,
        });
        payload.fill_blank_exercises.push({
          id: ex.id,
          sentence_id: sentenceId,
          blank_position: (ex.blankIndex ?? 0) + 1,
          correct_word: ex.correct,
          options: JSON.stringify(ex.options || []),
          audio_url: ex.audioHint,
          level_id: lvl.id,
        });
      }
    }
    return payload;
  }

  if (gameType === "pronunciation") {
    payload.pronunciation_items = [];
    for (const lvl of levels) {
      const items = lvl?.content?.items || [];
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        payload.pronunciation_items.push({
          id: it.id,
          content_type: "fidel",
          content_id: it.id,
          target_text: it.text,
          audio_url: it.audioUrl,
          level_id: lvl.id,
          difficulty_level: i + 1,
        });
      }
    }
    return payload;
  }

  if (gameType === "story") {
    payload.stories = [];
    payload.story_questions = [];
    for (const lvl of levels) {
      const content = lvl?.content;
      const storyId = content?.storyId || `${lvl.id}_story`;
      const storyText = (content?.pages || []).map((p: any) => p.text).join("\n\n") || lvl.description;
      payload.stories.push({
        id: storyId,
        title: lvl.title,
        content: storyText,
        audio_url: undefined,
        level_id: lvl.id,
        difficulty_level: lvl.difficulty ?? 1,
        thumbnail_url: lvl.thumbnail,
      });
      const qs = content?.questions || [];
      for (let i = 0; i < qs.length; i++) {
        const q = qs[i];
        payload.story_questions.push({
          story_id: storyId,
          question: q.question,
          options: JSON.stringify(q.options || []),
          correct_answer: q.correct,
          question_type: q.type || "post",
          position: i + 1,
        });
      }
    }
    return payload;
  }

  return payload;
};

// Helper function to get levels for a specific game
export const getGameLevels = async (gameType: string) => {
  const data = await getAvailableContent();
  return data.gameLevels[gameType] || [];
};

// Helper function to get a specific level
export const getLevelById = async (gameType: string, levelId: string) => {
  const data = await getAvailableContent();
  const levels = data.gameLevels[gameType] || [];
  return levels.find(level => level.id === levelId);
};

// Helper function to get content packs
export const getContentPacksByGame = async (gameType?: string) => {
  const data = await getAvailableContent();
  if (gameType) {
    return data.contentPacks.filter(pack => pack.gameType === gameType);
  }
  return data.contentPacks;
};

// Helper function to check if a level is unlocked
export const isLevelUnlocked = async (gameType: string, levelId: string, childId?: string) => {
  const data = await getAvailableContent();
  const level = await getLevelById(gameType, levelId);
  
  if (!level) return false;
  
  // Level 1 is always unlocked
  if (level.levelNumber === 1) return true;
  
  // Check if previous level is completed
  const previousLevelId = level.unlockRequirements?.previousLevelCompleted;
  if (previousLevelId) {
    return data.userProgress.completedLevels.includes(previousLevelId);
  }
  
  return true;
};