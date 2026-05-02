import { fetchCMSData } from "./cmsService";
import {downloadAndCacheFile} from "./db/fileService";
import { db } from "@/database/db";
import {
    insertStory,
    insertStoryPage,
    insertStoryQuestion,
    insertStoryChoice,
    insertPictureImage,
    insertPictureQuestion,
    insertPictureLevel,
    insertFidelQuestion,
    insertFidelLevel,
    insertWordHint,
    insertWord,
    insertLetter,
    insertWordBuilderLevel,
    insertFillLevel,
    insertFillChoice,
    insertPronunciation,
    insertVoiceLevel,
    insertVoiceChoice
} from './dbContentService'

export const syncAllContent = async () => {
  const data = await fetchCMSData();

  db.execSync("BEGIN TRANSACTION");

  try {
    await syncStories(data);
    await syncPictureGame(data);
    await syncFidel(data);
    await syncWordBuilder(data);
    await syncFillBlank(data);
    await syncPronunciation(data);
    await syncVoiceGame(data);

    db.execSync("COMMIT");
    console.log("ALL CONTENT SYNCED");
  } catch (e) {
    db.execSync("ROLLBACK");
    console.error("SYNC FAILED: ",e);
  }
};

export const syncStories=async(data:any)=>{
    
    
    const stories=data.contents.story.stories;

   
    try{
        for(const storyId in stories){
             const story = stories[storyId];
            const thumbnailPath=await downloadAndCacheFile(
                story.thumbnaillink,
                "images/story/"
            );
            insertStory({
                id:storyId,
                title:story.title,
                pagecount:story.pagecount,
                thumbnail_path:thumbnailPath
            }); 
            
       
        
          for(let i=1;i<=story.pagecount;i++){
            const page=story[`page${i}`];
            const image_path=await downloadAndCacheFile(
                page.imagelink,
                "images/story/"
            )
            insertStoryPage({
                story_id:storyId,
                page_number:i,
                story_text:page.storytext,
                image_path:image_path
            });
        }
            const questions=story.questions;
            for(const qId in questions){
                const q=questions[qId];
                const question_id=insertStoryQuestion({
                    story_id:storyId,
                    question_text:q.text,
                    correct_answer:q.correctanswer
                });
                for(const choice of q.choices){
                    insertStoryChoice(question_id,choice);
                }
            }
          
        }
      
        console.log("stories synced");
    }catch(e){
       
        console.error("sync error: ",e);
        throw e;
    }
}
export const syncPictureGame = async (data:any) => {
  const levels = data["picture to word"].levels;

  for (const levelId in levels) {
    const level = levels[levelId];

    insertPictureLevel(levelId);

    for (const qKey in level) {
      const q = level[qKey];

      const questionId = insertPictureQuestion({
        level_id: levelId,
        text: q.questiontext,
        correct_image_id: q.correctImageId
      });

      for (const img of q.images) {
        const imagePath = await downloadAndCacheFile(
          img.imagelink,
          "images/picture/"
        );

        insertPictureImage({
          id: img.id,
          question_id: questionId,
          image_path: imagePath
        });
      }
    }
  }
};
export const syncFidel = async (data:any) => {
  const levels = data["fidel tracing"].levels;

  for (const levelId in levels) {
    const level = levels[levelId];

    insertFidelLevel(levelId);

    for (const qKey in level) {
      const q = level[qKey];

      const imagePath = q["lettertoraceimagelink(outline version)"]
        ? await downloadAndCacheFile(
            q["lettertoraceimagelink(outline version)"],
            "images/fidel/"
          )
        : null;

      const audioPath = q.pronoucevoicelink
        ? await downloadAndCacheFile(
            q.pronoucevoicelink,
            "audio/fidel/"
          )
        : null;

      insertFidelQuestion({
        level_id: levelId,
        letter: q.lettertotrace,
        image_path: imagePath,
        audio_path: audioPath
      });
    }
  }
};
export const syncWordBuilder = async (data:any) => {
  const levels = data["word builder"].levels;

  for (const levelId in levels) {
    const level = levels[levelId];

    insertWordBuilderLevel(levelId);

    
    for (const letter of level.letters) {
      insertLetter(levelId, letter);
    }

    
    for (const word of level["corrects words"]) {
      insertWord({
        id: word.wordid,
        level_id: levelId,
        word_text: word.wordtext
      });
    }

    
    for (const hint of level["hints for the corrects words"]) {
      insertWordHint(hint.wordid, hint.hinttext);
    }
  }
};

export const syncFillBlank = async (data:any) => {
  const levels = data["fill in the blank"].levels;

  for (const levelId in levels) {
    const level = levels[levelId];

    const audioPath = await downloadAndCacheFile(
      level["voice reading the full paragraph link"],
      "audio/fill/"
    );

    insertFillLevel({
      id: levelId,
      full: level["full paragraph"],
      blank: level["blank space paragraph"],
      audio: audioPath
    });

    for (const choice of level.choices) {
      insertFillChoice(levelId, choice);
    }
  }
};

export const syncPronunciation = async (data:any) => {
  const levels = data.pronouncation.levels;

  for (const levelId in levels) {
    const level = levels[levelId];

    const audioPath = await downloadAndCacheFile(
      level["correct voice pronouncation link "],
      "audio/pronunciation/"
    );

    const imagePath = await downloadAndCacheFile(
      level["image of the word link"],
      "images/pronunciation/"
    );

    insertPronunciation({
      id: levelId,
      word: level.word,
      audio: audioPath,
      image: imagePath
    });
  }
};
export const syncVoiceGame = async (data:any) => {
  const levels = data["voice/fidel to word game"].levels;

  for (const levelId in levels) {
    const level = levels[levelId];

    const audioPath = await downloadAndCacheFile(
      level["voiceof the word link"],
      "audio/voice/"
    );

    insertVoiceLevel({
      id: levelId,
      audio: audioPath,
      correct_word_id: level.correctwordid
    });

    for (const word of level["word choices"]) {
      insertVoiceChoice({
        id: word.wordid,
        level_id: levelId,
        word_text: word.wordtext
      });
    }
  }
};