import { db } from "@/database/db";
import {
    clearPackGameData,
    insertFidelLevel,
    insertFidelQuestion,
    insertFillChoice,
    insertFillLevel,
    insertLetter,
    insertMatchingLevel,
    insertMatchingWord,
    insertPictureImage,
    insertPictureLevel,
    insertPictureQuestion,
    insertPronunciation,
    insertSentence,
    insertSentenceLevel,
    insertStory,
    insertStoryChoice,
    insertStoryPage,
    insertStoryQuestion,
    insertVoiceChoice,
    insertVoiceLevel,
    insertWord,
    insertWordBuilderLevel,
    insertWordHint,
    packScopedId,
    saveContentPackRecord,
} from "@/services/cms/dbContentService";
import type { GameTypeKey } from "@/services/cms/gameContentService";
import {
  downloadPackAsset,
  packRootDir,
} from "@/services/cms/asset/packAssetManager";

function randomKey(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function extractContents(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object") return {};
  const o = payload as Record<string, unknown>;
  const inner = o.contents;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }
  return o;
}

/** Map API/catalog strings to importer keys used by SQLite + game routes. */
export function normalizePackGameType(raw?: string | null): GameTypeKey | null {
  const k = String(raw ?? "")
    .toLowerCase()
    .trim()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");
  const map: Record<string, GameTypeKey> = {
    story: "story",
    story_quiz: "story",
    storyquiz: "story",
    quiz: "story",
    tracing: "tracing",
    fidel_tracing: "tracing",
    fidel_trace: "tracing",
    matching: "matching",
    fidel_match: "matching",
    match: "matching",
    sentence_building: "sentence_building",
    sentence_fun: "sentence_building",
    sentences: "sentence_building",
    sentence: "sentence_building",
    pronunciation: "pronunciation",
    pronouncation: "pronunciation",
    speakup: "pronunciation",
    speak_up: "pronunciation",
    picture_to_word: "picture",
    pictoword: "picture",
    picture: "picture",
    fill_in_the_blank: "fill",
    fill: "fill",
    listen_and_fill: "fill",
    word_builder: "word_builder",
    wordbuilder: "word_builder",
    voice: "voice",
    voice_fidel_to_word: "voice",
  };
  return map[k] ?? null;
}

async function importStories(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
) {
  const storyRoot =
    (contents.story as Record<string, unknown> | undefined) ?? {};
  const stories = storyRoot.stories as Record<string, unknown> | undefined;
  const storyMap =
    stories && typeof stories === "object"
      ? stories
      : (contents.stories as Record<string, unknown> | undefined);

  if (!storyMap || typeof storyMap !== "object") return;

  for (const storyId of Object.keys(storyMap)) {
    const story = storyMap[storyId] as Record<string, unknown>;
    const sid = packScopedId(packSlug, storyId);
    const lvlRaw = story.level_id ?? story.levelId;
    const levelKey =
      typeof lvlRaw === "string" ? packScopedId(packSlug, lvlRaw) : null;

    const thumbUrl =
      typeof story.thumbnaillink === "string"
        ? story.thumbnaillink
        : typeof story.thumbnail_link === "string"
          ? story.thumbnail_link
          : "";

    const thumbnailPath = thumbUrl
      ? await downloadPackAsset(thumbUrl, childId, packSlug, "images/story")
      : "";

    const pagecount = Number(story.pagecount ?? story.page_count ?? 0);
    insertStory(childId, {
      id: sid,
      title: String(story.title ?? "Story"),
      pagecount,
      thumbnail_path: thumbnailPath,
      level_id: levelKey ?? undefined,
    });

    for (let i = 1; i <= pagecount; i++) {
      const page = story[`page${i}`] as Record<string, unknown> | undefined;
      if (!page || typeof page !== "object") continue;
      const imgUrl = typeof page.imagelink === "string" ? page.imagelink : "";
      const image_path = imgUrl
        ? await downloadPackAsset(imgUrl, childId, packSlug, "images/story")
        : "";
      insertStoryPage(childId, {
        story_id: sid,
        page_number: i,
        story_text: String(page.storytext ?? page.story_text ?? ""),
        image_path,
      });
    }

    const questionsRaw = story.questions;
    if (!questionsRaw || typeof questionsRaw !== "object") continue;
    const questions = questionsRaw as Record<string, unknown>;
    for (const qKey of Object.keys(questions)) {
      const q = questions[qKey] as Record<string, unknown>;
      const choices = Array.isArray(q.choices)
        ? (q.choices as unknown[]).map((x) => String(x))
        : [];

      const qid = insertStoryQuestion(childId, {
        story_id: sid,
        question_text: String(q.text ?? q.question ?? ""),
        correct_answer: String(q.correctanswer ?? q.correct_answer ?? ""),
      });
      for (const choice of choices) {
        insertStoryChoice(childId, Number(qid), choice);
      }
    }
  }
}

async function importPicture(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
) {
  const block =
    (contents["picture to word"] as Record<string, unknown> | undefined) ??
    (contents.picture_to_word as Record<string, unknown> | undefined);

  const levels = block?.levels as Record<string, unknown> | undefined;
  if (!levels || typeof levels !== "object") return;

  for (const levelId of Object.keys(levels)) {
    const lid = packScopedId(packSlug, levelId);
    insertPictureLevel(childId, lid);
    const level = levels[levelId] as Record<string, unknown>;

    for (const qKey of Object.keys(level)) {
      const q = level[qKey] as Record<string, unknown>;
      if (!q.images || typeof q.questiontext !== "string") continue;

      const correctId =
        typeof q.correctImageId === "string"
          ? q.correctImageId
          : String(q.correctimageid ?? "");

      const rowId = insertPictureQuestion(childId, {
        level_id: lid,
        text: q.questiontext,
        correct_image_id: correctId,
      });

      const imgs = q.images as Array<Record<string, unknown>>;
      for (const img of imgs) {
        const imgUrl = typeof img.imagelink === "string" ? img.imagelink : "";
        const path = imgUrl
          ? await downloadPackAsset(imgUrl, childId, packSlug, "images/picture")
          : "";

        insertPictureImage(childId, {
          id: String(img.id ?? imgUrl ?? rowId),
          question_id: Number(rowId),
          image_path: path,
        });
      }
    }
  }
}

async function importTracing(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
) {
  const block =
    (contents["fidel tracing"] as Record<string, unknown> | undefined) ??
    (contents.fidel_tracing as Record<string, unknown> | undefined);

  const levels = block?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  for (const levelId of Object.keys(levels)) {
    const lid = packScopedId(packSlug, levelId);
    insertFidelLevel(childId, lid);
    const level = levels[levelId] as Record<string, unknown>;

    for (const qKey of Object.keys(level)) {
      const q = level[qKey] as Record<string, unknown>;
      const outline =
        typeof q["lettertoraceimagelink(outline version)"] === "string"
          ? (q["lettertoraceimagelink(outline version)"] as string)
          : typeof q.lettertoraceimagelink === "string"
            ? q.lettertoraceimagelink
            : "";

      const pronunciation =
        typeof q.pronoucevoicelink === "string"
          ? q.pronoucevoicelink
          : typeof q.audio_url === "string"
            ? q.audio_url
            : "";

      const imagePath = outline
        ? await downloadPackAsset(outline, childId, packSlug, "images/fidel")
        : "";

      const audioPath = pronunciation
        ? await downloadPackAsset(
            pronunciation,
            childId,
            packSlug,
            "audio/fidel",
          )
        : "";

      insertFidelQuestion(childId, {
        level_id: lid,
        letter: String(q.lettertotrace ?? ""),
        image_path: imagePath || null,
        audio_path: audioPath || null,
      });
    }
  }
}

async function importWordBuilder(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
) {
  const block =
    (contents["word builder"] as Record<string, unknown> | undefined) ??
    (contents.word_builder as Record<string, unknown> | undefined);
  const levels = block?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  for (const levelId of Object.keys(levels)) {
    const lid = packScopedId(packSlug, levelId);
    insertWordBuilderLevel(childId, lid);
    const level = levels[levelId] as Record<string, unknown>;

    const letters = Array.isArray(level.letters)
      ? (level.letters as unknown[]).map((x) => String(x))
      : [];
    for (const letter of letters) {
      insertLetter(childId, lid, letter);
    }

    const correct =
      level["corrects words"] ??
      level.correctwords ??
      level["correct words"] ??
      [];

    const wordList = Array.isArray(correct) ? correct : [];
    for (const w of wordList as Array<Record<string, unknown>>) {
      const widRaw = String(w.wordid ?? w.word_id ?? w.id ?? randomKey("w"));
      const wid = packScopedId(packSlug, widRaw);
      insertWord(childId, {
        id: wid,
        level_id: lid,
        word_text: String(w.wordtext ?? w.word_text ?? ""),
      });
    }

    const hintsRaw =
      level["hints for the corrects words"] ??
      level.hints ??
      level["hints for the correct words"] ??
      [];

    const hintList = Array.isArray(hintsRaw) ? hintsRaw : [];
    for (const h of hintList as Array<Record<string, unknown>>) {
      const wordRef = String(h.wordid ?? h.word_id ?? "");
      insertWordHint(
        childId,
        wordRef.includes("__") ? wordRef : packScopedId(packSlug, wordRef),
        String(h.hinttext ?? h.hint_text ?? ""),
      );
    }
  }
}

async function importFill(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
) {
  const block =
    (contents["fill in the blank"] as Record<string, unknown> | undefined) ??
    (contents.fill_in_the_blank as Record<string, unknown> | undefined) ??
    (contents.fill as Record<string, unknown> | undefined);

  const levels = block?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  for (const levelId of Object.keys(levels)) {
    const lid = packScopedId(packSlug, levelId);
    const level = levels[levelId] as Record<string, unknown>;
    const audioUrl =
      typeof level["voice reading the full paragraph link"] === "string"
        ? (level["voice reading the full paragraph link"] as string)
        : typeof level.voicereadinglink === "string"
          ? level.voicereadinglink
          : "";

    const audioPath = audioUrl
      ? await downloadPackAsset(audioUrl, childId, packSlug, "audio/fill")
      : "";

    insertFillLevel(childId, {
      id: lid,
      full: String(level["full paragraph"] ?? level.fullparagraph ?? ""),
      blank: String(
        level["blank space paragraph"] ?? level.blankspaceparagraph ?? "",
      ),
      audio: audioPath,
    });

    const choices = Array.isArray(level.choices)
      ? (level.choices as unknown[]).map((x) => String(x))
      : [];
    for (const choice of choices) {
      insertFillChoice(childId, lid, choice);
    }
  }
}

async function importPronunciation(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
) {
  const block =
    (contents.pronouncation as Record<string, unknown> | undefined) ??
    (contents.pronunciation as Record<string, unknown> | undefined);

  const levels = block?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  for (const levelId of Object.keys(levels)) {
    const lid = packScopedId(packSlug, levelId);
    const level = levels[levelId] as Record<string, unknown>;
    const audioUrl =
      typeof level["correct voice pronouncation link "] === "string"
        ? (level["correct voice pronouncation link "] as string)
        : typeof level["correct voice pronouncation link"] === "string"
          ? (level["correct voice pronouncation link"] as string)
          : typeof level.audio_url === "string"
            ? level.audio_url
            : "";

    const imageUrl =
      typeof level["image of the word link"] === "string"
        ? (level["image of the word link"] as string)
        : typeof level.imageofthewordlink === "string"
          ? level.imageofthewordlink
          : "";

    insertPronunciation(childId, {
      id: lid,
      word: String(level.word ?? ""),
      audio: audioUrl
        ? await downloadPackAsset(
            audioUrl,
            childId,
            packSlug,
            "audio/pronunciation",
          )
        : "",
      image: imageUrl
        ? await downloadPackAsset(
            imageUrl,
            childId,
            packSlug,
            "images/pronunciation",
          )
        : "",
    });
  }
}

async function importVoice(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
) {
  const block =
    (contents["voice/fidel to word game"] as
      | Record<string, unknown>
      | undefined) ??
    (contents.voice_to_word as Record<string, unknown> | undefined);

  const levels = block?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  for (const levelId of Object.keys(levels)) {
    const lid = packScopedId(packSlug, levelId);
    const level = levels[levelId] as Record<string, unknown>;
    const voiceUrl =
      typeof level["voiceof the word link"] === "string"
        ? (level["voiceof the word link"] as string)
        : typeof level.voiceofthewordlink === "string"
          ? level.voiceofthewordlink
          : "";

    const audioPath = voiceUrl
      ? await downloadPackAsset(voiceUrl, childId, packSlug, "audio/voice")
      : "";

    insertVoiceLevel(childId, {
      id: lid,
      audio: audioPath,
      correct_word_id: packScopedId(
        packSlug,
        String(level.correctwordid ?? level.correct_word_id ?? ""),
      ),
    });

    const wc =
      level["word choices"] ?? level.wordchoices ?? level.word_choices ?? [];
    const words = Array.isArray(wc) ? wc : [];
    for (const w of words as Array<Record<string, unknown>>) {
      const wid = String(w.wordid ?? w.word_id ?? randomKey("vc"));
      insertVoiceChoice(childId, {
        id: packScopedId(packSlug, wid),
        level_id: lid,
        word_text: String(w.wordtext ?? w.word_text ?? ""),
      });
    }
  }
}

async function importMatchingFlat(
  childId: string,
  packSlug: string,
  payload: Record<string, unknown>,
) {
  const words = payload.words as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(words)) return;
  const byLevel = new Map<string, typeof words>();
  for (const row of words) {
    const rawLevel = row.level_id ?? row.levelId ?? "_default";
    const lidKey = packScopedId(packSlug, String(rawLevel));
    if (!byLevel.has(lidKey)) byLevel.set(lidKey, []);
    byLevel.get(lidKey)!.push(row);
  }
  for (const [lid, ws] of byLevel) {
    insertMatchingLevel(childId, lid);
    for (const w of ws) {
      const wid = String(w.id ?? randomKey("m"));
      const au = typeof w.audio_url === "string" ? w.audio_url : "";
      const iu = typeof w.image_url === "string" ? w.image_url : "";
      insertMatchingWord(childId, {
        id: packScopedId(packSlug, wid),
        level_id: lid,
        word: String(w.word ?? ""),
        audio_path: au
          ? await downloadPackAsset(au, childId, packSlug, "audio/matching")
          : "",
        image_path: iu
          ? await downloadPackAsset(iu, childId, packSlug, "images/matching")
          : "",
      });
    }
  }
}

async function importMatchingNested(
  childId: string,
  packSlug: string,
  block: Record<string, unknown>,
) {
  const levels = block.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  for (const levelKey of Object.keys(levels)) {
    const lid = packScopedId(packSlug, levelKey);
    insertMatchingLevel(childId, lid);
    const val = levels[levelKey];
    const items: unknown[] = Array.isArray(val) ? val : [];
    let i = 0;
    for (const raw of items) {
      const w = raw as Record<string, unknown>;
      const wid = typeof w.id === "string" ? w.id : randomKey(`w${i++}`);
      const au = typeof w.audio_url === "string" ? w.audio_url : "";
      const iu = typeof w.image_url === "string" ? w.image_url : "";
      insertMatchingWord(childId, {
        id: packScopedId(packSlug, wid),
        level_id: lid,
        word: String(w.word ?? ""),
        audio_path: au
          ? await downloadPackAsset(au, childId, packSlug, "audio/matching")
          : "",
        image_path: iu
          ? await downloadPackAsset(iu, childId, packSlug, "images/matching")
          : "",
      });
    }
  }
}

async function importMatching(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
) {
  const nested =
    (contents.matching as Record<string, unknown> | undefined) ??
    (contents.fidel_match as Record<string, unknown> | undefined);

  if (nested?.levels && typeof nested.levels === "object") {
    await importMatchingNested(childId, packSlug, nested);
    return;
  }
  await importMatchingFlat(childId, packSlug, contents);
}

async function importSentenceNested(
  childId: string,
  packSlug: string,
  block: Record<string, unknown>,
) {
  const levels = block.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  for (const levelKey of Object.keys(levels)) {
    const lid = packScopedId(packSlug, levelKey);
    insertSentenceLevel(childId, lid);
    const arr = levels[levelKey];
    const items: unknown[] = Array.isArray(arr) ? arr : [];
    let i = 0;
    for (const raw of items) {
      const s = raw as Record<string, unknown>;
      const sid = typeof s.id === "string" ? s.id : randomKey(`s${i++}`);
      const words = Array.isArray(s.words)
        ? s.words
        : Array.isArray(s.sentence_words)
          ? s.sentence_words
          : [];
      insertSentence(childId, {
        id: packScopedId(packSlug, sid),
        level_id: lid,
        sentence: String(s.sentence ?? s.text ?? ""),
        words_json: JSON.stringify(words),
      });
    }
  }
}

async function importSentenceFlat(
  childId: string,
  packSlug: string,
  payload: Record<string, unknown>,
) {
  const sentences = payload.sentences as
    | Array<Record<string, unknown>>
    | undefined;
  if (!Array.isArray(sentences)) return;
  const byLevel = new Map<string, typeof sentences>();

  for (const row of sentences) {
    const rawLevel = row.level_id ?? row.levelId ?? "_default";
    const lidKey = packScopedId(packSlug, String(rawLevel));
    if (!byLevel.has(lidKey)) byLevel.set(lidKey, []);
    byLevel.get(lidKey)!.push(row);
  }

  let idx = 0;
  for (const [lid, rows] of byLevel) {
    insertSentenceLevel(childId, lid);
    for (const s of rows) {
      const sid = typeof s.id === "string" ? s.id : `s${idx++}`;
      let wordsPayload: unknown = s.words;
      if (
        typeof wordsPayload === "string" &&
        (wordsPayload.startsWith("{") || wordsPayload.startsWith("["))
      ) {
        try {
          wordsPayload = JSON.parse(wordsPayload) as unknown;
        } catch {
          /* ignore */
        }
      }
      if (
        payload.sentence_words &&
        typeof payload.sentence_words === "object" &&
        Array.isArray(payload.sentences)
      ) {
        const sw = payload.sentence_words as Array<Record<string, unknown>>;
        const linked = sw.filter(
          (x) => String(x.sentence_id ?? "") === String(s.id),
        );
        if (linked.length && !wordsPayload) {
          wordsPayload = linked;
        }
      }
      insertSentence(childId, {
        id: packScopedId(packSlug, sid),
        level_id: lid,
        sentence: String(s.sentence ?? s.text ?? ""),
        words_json: JSON.stringify(wordsPayload ?? []),
      });
    }
  }
}

async function importSentenceBuilding(
  childId: string,
  packSlug: string,
  contents: Record<string, unknown>,
  rootPayload: Record<string, unknown>,
) {
  const nested =
    contents.sentence_building ??
    contents.sentencefun ??
    (rootPayload.sentence_building as Record<string, unknown> | undefined);

  if (
    nested &&
    typeof nested === "object" &&
    (nested as Record<string, unknown>).levels
  ) {
    await importSentenceNested(
      childId,
      packSlug,
      nested as Record<string, unknown>,
    );
    return;
  }
  await importSentenceFlat(childId, packSlug, rootPayload);
}

export async function importPackPayload(
  childId: string,
  packSlug: string,
  game: GameTypeKey,
  payload: unknown,
  catalogTitle?: string,
  /** Laravel `latest_published_version` when download JSON has no version. */
  catalogVersion?: string | null,
  manifestChecksum?: string | null,
): Promise<void> {
  const root =
    payload && typeof payload === "object"
      ? (payload as Record<string, unknown>)
      : {};
  const contents = extractContents(payload);
  clearPackGameData(childId, packSlug);

  db.execSync("BEGIN IMMEDIATE");
  try {
    switch (game) {
      case "story":
        await importStories(childId, packSlug, contents);
        break;
      case "picture":
        await importPicture(childId, packSlug, contents);
        break;
      case "tracing":
        await importTracing(childId, packSlug, contents);
        break;
      case "word_builder":
        await importWordBuilder(childId, packSlug, contents);
        break;
      case "fill":
        await importFill(childId, packSlug, contents);
        break;
      case "pronunciation":
        await importPronunciation(childId, packSlug, contents);
        break;
      case "voice":
        await importVoice(childId, packSlug, contents);
        break;
      case "matching":
        await importMatching(childId, packSlug, { ...contents, ...root });
        break;
      case "sentence_building":
        await importSentenceBuilding(childId, packSlug, contents, root);
        break;
      default:
        throw new Error(`Unsupported pack game type: ${game}`);
    }

    const versionRecorded =
      typeof root.version === "string"
        ? root.version
        : typeof contents.version === "string"
          ? (contents.version as string)
          : catalogVersion != null && String(catalogVersion).trim() !== ""
            ? String(catalogVersion)
            : null;

    saveContentPackRecord(
      childId,
      packSlug,
      game,
      catalogTitle ?? packSlug,
      versionRecorded,
      manifestChecksum ?? null,
      packRootDir(childId, packSlug),
    );
    db.execSync("COMMIT");
  } catch (e) {
    db.execSync("ROLLBACK");
    throw e;
  }
}
