import * as Q from "@/services/cms/contentQueryService";
import { getUser } from "@/services/db/authStorage";

export type GameTypeKey =
  | "story"
  | "matching"
  | "tracing"
  | "sentence_building"
  | "pronunciation"
  | "picture"
  | "fill"
  | "word_builder"
  | "voice";

async function resolveChildId(): Promise<string | null> {
  const u = await getUser();
  return u?.id ? String(u.id) : null;
}

function emptyLevels() {
  return [] as Array<{
    id: string;
    level_number: number;
    title: string | null;
    description: string | null;
    difficulty: number | null;
  }>;
}

export async function getLevelsForGame(game: GameTypeKey) {
  const childId = await resolveChildId();
  if (!childId) return emptyLevels();

  switch (game) {
    case "story":
      return Q.getStoryLevelSummaries(childId);
    case "matching": {
      const rows = Q.getMatchingLevels(childId) as Array<
        Record<string, unknown>
      >;
      return rows.map((r, i) => ({
        id: String(r.id),
        level_number: i + 1,
        title: (r.title as string) ?? `Match level ${i + 1}`,
        description: "Listen and match",
        difficulty: 1,
      }));
    }
    case "tracing": {
      const rows = Q.getFidelLevels(childId) as Array<Record<string, unknown>>;
      return rows.map((r, i) => ({
        id: String(r.id),
        level_number: i + 1,
        title: (r.title as string) ?? `Trace level ${i + 1}`,
        description: "Fidel tracing",
        difficulty: 1,
      }));
    }
    case "sentence_building": {
      const rows = Q.getSentenceLevels(childId) as Array<
        Record<string, unknown>
      >;
      return rows.map((r, i) => ({
        id: String(r.id),
        level_number: i + 1,
        title: (r.title as string) ?? `Sentence level ${i + 1}`,
        description: "Put words in order",
        difficulty: 1,
      }));
    }
    case "pronunciation": {
      const rows = Q.getPronunciationLevels(childId) as Array<
        Record<string, unknown>
      >;
      return rows.map((r, i) => ({
        id: String(r.id),
        level_number: i + 1,
        title: (r.word as string) ?? `Word ${i + 1}`,
        description: "Pronunciation",
        difficulty: 1,
      }));
    }
    case "picture": {
      const rows = Q.getPictureLevels(childId) as Array<
        Record<string, unknown>
      >;
      return rows.map((r, i) => ({
        id: String(r.id),
        level_number: i + 1,
        title: `Picture quiz ${i + 1}`,
        description: "Choose the picture",
        difficulty: 1,
      }));
    }
    case "fill": {
      const rows = Q.getFillLevels(childId) as Array<Record<string, unknown>>;
      return rows.map((r, i) => ({
        id: String(r.id),
        level_number: i + 1,
        title: `Fill level ${i + 1}`,
        description: "Fill in the blank",
        difficulty: 1,
      }));
    }
    case "word_builder": {
      const rows = Q.getWordBuilderLevels(childId) as Array<
        Record<string, unknown>
      >;
      return rows.map((r, i) => ({
        id: String(r.id),
        level_number: i + 1,
        title: `Word builder ${i + 1}`,
        description: "Build words",
        difficulty: 1,
      }));
    }
    case "voice": {
      const rows = Q.getVoiceLevels(childId) as Array<Record<string, unknown>>;
      return rows.map((r, i) => ({
        id: String(r.id),
        level_number: i + 1,
        title: `Listen level ${i + 1}`,
        description: "Voice to word",
        difficulty: 1,
      }));
    }
    default:
      return emptyLevels();
  }
}

export async function getGameContent(
  game: GameTypeKey,
  levelId: string,
): Promise<unknown[]> {
  const childId = await resolveChildId();
  if (!childId) return [];

  switch (game) {
    case "story": {
      const stories = Q.getStoriesForStoryLevel(childId, levelId) as Array<{
        id: string;
        title: string;
        thumbnail_path: string | null;
      }>;
      return stories.map((s) => {
        const pages = Q.getStoryPages(childId, s.id) as Array<{
          story_text: string;
        }>;
        const content = pages.map((p) => p.story_text).join("\n\n");
        const qs = Q.getStoryQuestions(childId, s.id) as Array<{
          question_text: string;
          correct_answer: string;
          choices: string[];
        }>;
        const questions = JSON.stringify(
          qs.map((q) => ({
            question: q.question_text,
            options: q.choices,
            correct_answer: q.correct_answer,
          })),
        );
        return {
          id: s.id,
          title: s.title,
          content,
          thumbnail_url: s.thumbnail_path,
          questions,
        };
      });
    }
    case "matching":
      return Q.getMatchingWords(childId, levelId);
    case "sentence_building":
      return Q.getSentencesForLevel(childId, levelId);
    case "tracing": {
      const rows = Q.getFidelQuestions(childId, levelId) as Array<{
        id?: number;
        letter: string;
        outline_image_path: string | null;
        audio_path: string | null;
      }>;
      return rows.map((q, i) => ({
        id: q.id != null ? String(q.id) : `q${i + 1}`,
        lettertotrace: q.letter,
        outlineImageUri: q.outline_image_path ?? "",
        pronoucevoicelink: q.audio_path ?? "",
      }));
    }
    case "pronunciation": {
      const rows = Q.getPronunciationLevels(childId) as Array<{
        id: string;
        word: string;
        audio_path: string;
        image_path: string;
      }>;
      return rows
        .filter((r) => r.id === levelId || r.id.startsWith(`${levelId}__`))
        .map((r) => ({
          id: r.id,
          word: r.word,
          audioUrl: r.audio_path,
          imageUrl: r.image_path,
        }));
    }
    case "picture": {
      const questions = Q.getPictureQuestions(childId, levelId) as Array<{
        id: number;
        question_text: string;
        correct_image_id: string;
        images: Array<{ id: string; image_path: string }>;
      }>;
      return questions.map((q, i) => {
        const prompt = q.images.find((img) => img.id.endsWith("_prompt"));
        const choices = q.images.filter((img) => !img.id.endsWith("_prompt"));
        const textChoices = choices.filter((c) => !c.image_path);
        if (textChoices.length > 0) {
          return {
            id: String(q.id),
            questiontext: q.question_text,
            promptImage: prompt?.image_path ?? "",
            choices: textChoices.map((c) => c.id),
            correctChoice: q.correct_image_id,
          };
        }
        return {
          id: String(q.id),
          questiontext: q.question_text,
          images: q.images.map((img) => ({
            id: img.id,
            imagelink: img.image_path,
          })),
          correctImageId: q.correct_image_id,
        };
      });
    }
    case "fill": {
      const rows = Q.getFillLevels(childId) as Array<{
        id: string;
        full_paragraph: string;
        blank_paragraph: string;
        correct_answer: string | null;
        audio_path: string;
      }>;
      const matched = rows.filter(
        (r) => r.id === levelId || r.id.startsWith(`${levelId}__`),
      );
      return matched.map((row) => {
        const choices = (
          Q.getFillChoices(childId, row.id) as Array<{ choice: string }>
        ).map((c) => c.choice);
        const answer = row.correct_answer ?? choices[0] ?? "";
        return {
          levelId: row.id,
          sentenceTemplate: row.blank_paragraph,
          answer,
          options: choices,
          audioUrl: row.audio_path || undefined,
          full: row.full_paragraph,
          blank: row.blank_paragraph,
          audio: row.audio_path,
          choices,
        };
      });
    }
    case "word_builder":
      return [Q.getWordBuilderData(childId, levelId)];
    case "voice": {
      const rows = Q.getVoiceLevels(childId) as Array<{
        id: string;
        audio_path: string;
        correct_word_id: string;
      }>;
      const matched = rows.filter(
        (r) => r.id === levelId || r.id.startsWith(`${levelId}__`),
      );
      return matched.map((row) => {
        const choices = Q.getVoiceChoices(childId, row.id) as Array<{
          id: string;
          word_text: string;
        }>;
        const correct = choices.find((c) => c.id === row.correct_word_id);
        return {
          id: row.id,
          audio_url: row.audio_path,
          correct_word_id: row.correct_word_id,
          correct_word: correct?.word_text ?? "",
          word_choices: choices,
          choices: choices.map((c) => c.word_text),
        };
      });
    }
    default:
      return [];
  }
}
