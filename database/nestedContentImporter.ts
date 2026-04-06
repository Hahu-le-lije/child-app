import { db } from "@/database/db";

async function execMany(sql: string, paramsList: unknown[][]) {
  for (const params of paramsList) {
    // eslint-disable-next-line no-await-in-loop
    await db.runAsync(sql, params as never[]);
  }
}

function normalizeKey(k: string): string {
  return k.trim().toLowerCase().replace(/\s+/g, " ");
}

function findSection(
  contents: Record<string, unknown>,
  ...wanted: string[]
): Record<string, unknown> | undefined {
  const targets = wanted.map(normalizeKey);
  for (const key of Object.keys(contents)) {
    if (targets.includes(normalizeKey(key))) {
      const v = contents[key];
      if (v && typeof v === "object" && !Array.isArray(v)) {
        return v as Record<string, unknown>;
      }
    }
  }
  return undefined;
}

function getLoose(obj: Record<string, unknown> | undefined, ...candidates: string[]): unknown {
  if (!obj) return undefined;
  const want = candidates.map(normalizeKey);
  for (const key of Object.keys(obj)) {
    if (want.includes(normalizeKey(key))) return obj[key];
  }
  return undefined;
}

function isQuestionLikeKey(k: string): boolean {
  return /^question\d+$/i.test(k.trim());
}

function isPageKey(k: string): boolean {
  return /^page\d+$/i.test(k.trim());
}

/** Import nested `contents` tree into existing SQLite tables (offline games). */
export async function importNestedManifestContents(
  root: Record<string, unknown>,
  packId: string
) {
  const contents = root.contents;
  if (!contents || typeof contents !== "object" || Array.isArray(contents)) return;

  const c = contents as Record<string, unknown>;

  await db.execAsync("BEGIN;");
  try {
    await importStories(c, packId);
    await importPictureToWord(c, packId);
    await importFidelTracing(c, packId);
    await importWordBuilder(c, packId);
    await importFillInBlank(c, packId);
    await importPronunciation(c, packId);
    await importVoiceToWord(c, packId);
    await db.execAsync("COMMIT;");
  } catch (e) {
    await db.execAsync("ROLLBACK;");
    throw e;
  }
}

async function importStories(contents: Record<string, unknown>, packId: string) {
  const storyRoot = findSection(contents, "story");
  const stories = storyRoot?.stories as Record<string, unknown> | undefined;
  if (!stories) return;

  const levelRows: unknown[][] = [];
  const storyRows: unknown[][] = [];
  const questionRows: unknown[][] = [];

  for (const [storyId, raw] of Object.entries(stories)) {
    const s = raw as Record<string, unknown>;
    const levelId = `${packId}_story_${storyId}`;
    const title = String(s.title ?? storyId);
    levelRows.push([
      levelId,
      "story",
      Object.keys(s).filter(isPageKey).length || 1,
      title,
      "",
      1,
      1,
      0,
    ]);

    const pageKeys = Object.keys(s).filter(isPageKey).sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, ""), 10) || 0;
      const nb = parseInt(b.replace(/\D/g, ""), 10) || 0;
      return na - nb;
    });
    const parts: string[] = [];
    let thumb = "";
    for (const pk of pageKeys) {
      const p = s[pk] as Record<string, unknown>;
      const text = String(p?.storytext ?? "");
      const kw = p?.keywords;
      const extra =
        Array.isArray(kw) && kw.length
          ? `\n\n[keywords: ${JSON.stringify(kw)}]`
          : "";
      parts.push(text + extra);
      const img = String(p?.imagelink ?? "");
      if (!thumb && img) thumb = img;
    }
    const body = parts.join("\n\n").trim() || title;

    storyRows.push([
      storyId,
      title,
      body,
      null,
      null,
      levelId,
      1,
      thumb || null,
    ]);

    const qRoot = s.questions as Record<string, unknown> | undefined;
    if (qRoot) {
      let pos = 1;
      for (const qv of Object.values(qRoot)) {
        const q = qv as Record<string, unknown>;
        const opts = q?.choices;
        questionRows.push([
          storyId,
          String(q?.text ?? ""),
          JSON.stringify(Array.isArray(opts) ? opts : []),
          String(q?.correctanswer ?? ""),
          "post",
          pos,
        ]);
        pos++;
      }
    }
  }

  if (levelRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO levels
        (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      levelRows
    );
  }
  if (storyRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO stories
        (id, title, content, audio_url, local_audio, level_id, difficulty_level, thumbnail_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      storyRows
    );
  }
  if (questionRows.length) {
    const ids = [...new Set(questionRows.map((r) => r[0] as string))];
    await execMany(`DELETE FROM story_questions WHERE story_id = ?`, ids.map((id) => [id]));
    await execMany(
      `INSERT INTO story_questions (story_id, question, options, correct_answer, question_type, position)
       VALUES (?, ?, ?, ?, ?, ?)`,
      questionRows
    );
  }
}

async function importPictureToWord(contents: Record<string, unknown>, packId: string) {
  const root = findSection(contents, "picture to word", "picturetoword");
  const levels = root?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  const levelRows: unknown[][] = [];
  const wordRows: unknown[][] = [];
  const imageRows: unknown[][] = [];

  for (const [levelId, raw] of Object.entries(levels)) {
    const lvl = raw as Record<string, unknown>;
    const lid = `${packId}_p2w_${levelId}`;
    levelRows.push([lid, "word_picture", 1, `Picture → word (${levelId})`, "", 1, 1, 0]);

    for (const key of Object.keys(lvl)) {
      if (!isQuestionLikeKey(key)) continue;
      const q = lvl[key] as Record<string, unknown>;
      const qtext = String(q?.questiontext ?? key);
      const images = (q?.images as unknown[]) ?? [];
      const correctId = String(q?.correctImageId ?? "");
      const wid = `${lid}_q_${key}`;
      wordRows.push([wid, qtext || `Q ${key}`, null, 1, lid, "[]"]);

      for (let i = 0; i < images.length; i++) {
        const im = images[i] as Record<string, unknown>;
        const imgId = String(im?.id ?? "");
        imageRows.push([
          wid,
          String(im?.imagelink ?? ""),
          null,
          imgId === correctId ? 1 : 0,
        ]);
      }
    }
  }

  if (levelRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO levels
        (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      levelRows
    );
  }
  if (wordRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO words (id, word, audio_url, difficulty_level, level_id, fidel_ids)
       VALUES (?, ?, ?, ?, ?, ?)`,
      wordRows
    );
  }
  if (imageRows.length) {
    await execMany(
      `INSERT INTO word_images (word_id, image_url, local_image, is_correct)
       VALUES (?, ?, ?, ?)`,
      imageRows
    );
  }
}

async function importFidelTracing(contents: Record<string, unknown>, packId: string) {
  const root = findSection(contents, "fidel tracing", "fideltracing");
  const levels = root?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  const levelRows: unknown[][] = [];
  const fidelRows: unknown[][] = [];

  for (const [levelId, raw] of Object.entries(levels)) {
    const lid = `${packId}_trace_${levelId}`;
    levelRows.push([lid, "tracing", 1, `Tracing (${levelId})`, "", 1, 1, 0]);

    const lvl = raw as Record<string, unknown>;
    let n = 0;
    for (const key of Object.keys(lvl)) {
      if (!isQuestionLikeKey(key)) continue;
      const q = lvl[key] as Record<string, unknown>;
      const letter = String(
        q?.lettertotrace ?? getLoose(q, "lettertotrace") ?? "?"
      );
      const outline =
        String(
          getLoose(
            q,
            "lettertoraceimagelink(outline version)",
            "lettertoraceimagelink",
            "lettertoraceimagelink(outline version)"
          ) ?? ""
        ) || "";
      const audio = String(q?.pronoucevoicelink ?? getLoose(q, "pronoucevoicelink") ?? "");
      const fid = `${lid}_${key}`;
      n++;
      fidelRows.push([
        fid,
        letter,
        letter,
        audio || null,
        n,
        lid,
        outline ? JSON.stringify({ outlineImage: outline }) : "[]",
      ]);
    }
  }

  if (levelRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO levels
        (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      levelRows
    );
  }
  if (fidelRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO fidels
        (id, character, pronunciation, audio_url, difficulty_level, level_id, stroke_order)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      fidelRows
    );
  }
}

async function importWordBuilder(contents: Record<string, unknown>, packId: string) {
  const root = findSection(contents, "word builder", "wordbuilder");
  const levels = root?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  const levelRows: unknown[][] = [];
  const wordRows: unknown[][] = [];

  for (const [levelId, raw] of Object.entries(levels)) {
    const lid = `${packId}_wb_${levelId}`;
    const lvl = raw as Record<string, unknown>;
    const letters = JSON.stringify(lvl?.letters ?? []);
    levelRows.push([
      lid,
      "sentence_building",
      1,
      `Word builder (${levelId})`,
      letters,
      1,
      1,
      0,
    ]);

    const corrects =
      (lvl["corrects words"] as unknown[]) ??
      (lvl.correctwords as unknown[]) ??
      [];
    for (const c of corrects) {
      const row = c as Record<string, unknown>;
      const wid = String(row?.wordid ?? `${lid}_w_${wordRows.length}`);
      wordRows.push([wid, String(row?.wordtext ?? ""), null, 1, lid, "[]"]);
    }
  }

  if (levelRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO levels
        (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      levelRows
    );
  }
  if (wordRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO words (id, word, audio_url, difficulty_level, level_id, fidel_ids)
       VALUES (?, ?, ?, ?, ?, ?)`,
      wordRows
    );
  }
}

async function importFillInBlank(contents: Record<string, unknown>, packId: string) {
  const root = findSection(contents, "fill in the blank", "fillintheblank", "fill in blank");
  const levels = root?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  const levelRows: unknown[][] = [];
  const sentenceRows: unknown[][] = [];
  const fillRows: unknown[][] = [];

  for (const [levelId, raw] of Object.entries(levels)) {
    const lid = `${packId}_fb_${levelId}`;
    levelRows.push([lid, "fill_blank", 1, `Fill blank (${levelId})`, "", 1, 1, 0]);
    const lvl = raw as Record<string, unknown>;
    const full = String(
      getLoose(lvl, "full paragraph", "fullparagraph") ?? ""
    );
    const blanked = String(
      getLoose(lvl, "blank space paragraph", "blankspaceparagraph") ?? ""
    );
    const audio = String(
      getLoose(
        lvl,
        "voice reading the full paragraph link",
        "voicereadinglink"
      ) ?? ""
    );
    const choices = lvl?.choices;
    const opts = JSON.stringify(Array.isArray(choices) ? choices : []);

    const sid = `${lid}_s`;
    sentenceRows.push([sid, full || blanked, 1, lid, audio || null, null, blanked || full]);

    const blankPos = blanked ? Math.max(1, blanked.split(/_+/).length - 1 || 1) : 1;
    const correct = Array.isArray(choices) ? String(choices[0] ?? "") : "";

    fillRows.push([
      `${lid}_ex`,
      sid,
      blankPos,
      correct,
      opts,
      audio || null,
      lid,
    ]);
  }

  if (levelRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO levels
        (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      levelRows
    );
  }
  if (sentenceRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO sentences
        (id, sentence, difficulty_level, level_id, audio_url, translation, local_audio)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      sentenceRows
    );
  }
  if (fillRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO fill_blank_exercises
        (id, sentence_id, blank_position, correct_word, options, audio_url, level_id)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      fillRows
    );
  }
}

async function importPronunciation(contents: Record<string, unknown>, packId: string) {
  const root = findSection(contents, "pronouncation", "pronunciation");
  const levels = root?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  const levelRows: unknown[][] = [];
  const pronRows: unknown[][] = [];

  for (const [levelId, raw] of Object.entries(levels)) {
    const lid = `${packId}_pron_${levelId}`;
    levelRows.push([lid, "pronunciation", 1, `Pronunciation (${levelId})`, "", 1, 1, 0]);

    const lvl = raw as Record<string, unknown>;
    for (const key of Object.keys(lvl)) {
      if (!isQuestionLikeKey(key)) continue;
      const q = lvl[key] as Record<string, unknown>;
      const word = String(q?.word ?? "");
      const audio = String(
        getLoose(
          q,
          "correct voice pronouncation link ",
          "correct voice pronouncation link",
          "correctvoicepronouncationlink"
        ) ?? ""
      );
      const pid = `${lid}_${key}`;
      pronRows.push([pid, "word", pid, word, audio || null, null, lid, 1]);
    }
  }

  if (levelRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO levels
        (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      levelRows
    );
  }
  if (pronRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO pronunciation_items
        (id, content_type, content_id, target_text, audio_url, local_audio, level_id, difficulty_level)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      pronRows
    );
  }
}

async function importVoiceToWord(contents: Record<string, unknown>, packId: string) {
  const root = findSection(
    contents,
    "voice/fidel to word game",
    "voicefidel to word game",
    "voice to word"
  );
  const levels = root?.levels as Record<string, unknown> | undefined;
  if (!levels) return;

  const levelRows: unknown[][] = [];
  const wordRows: unknown[][] = [];

  for (const [levelId, raw] of Object.entries(levels)) {
    const lid = `${packId}_v2w_${levelId}`;
    levelRows.push([lid, "matching", 1, `Listen & pick (${levelId})`, "", 1, 1, 0]);

    const lvl = raw as Record<string, unknown>;
    for (const key of Object.keys(lvl)) {
      if (!isQuestionLikeKey(key)) continue;
      const q = lvl[key] as Record<string, unknown>;
      const audio = String(
        getLoose(q, "voiceof the word link", "voiceofthewordlink") ?? ""
      );
      const choices =
        (q["word choices"] as unknown[]) ?? (q.wordchoices as unknown[]) ?? [];
      const correctId = String(q?.correctwordid ?? "");

      const baseWid = `${lid}_${key}`;
      wordRows.push([baseWid, `prompt_${key}`, audio || null, 1, lid, "[]"]);

      for (let i = 0; i < choices.length; i++) {
        const ch = choices[i] as Record<string, unknown>;
        const wid = `${baseWid}_opt_${String(ch?.wordid ?? i)}`;
        const isCorrect = String(ch?.wordid ?? "") === correctId ? 1 : 0;
        wordRows.push([
          wid,
          String(ch?.wordtext ?? "?"),
          isCorrect ? audio || null : null,
          1,
          lid,
          JSON.stringify({ parentQuestion: baseWid, isCorrect }),
        ]);
      }
    }
  }

  if (levelRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO levels
        (id, game_type, level_number, title, description, difficulty, unlocked_at_start, required_score, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
      levelRows
    );
  }
  if (wordRows.length) {
    await execMany(
      `INSERT OR REPLACE INTO words (id, word, audio_url, difficulty_level, level_id, fidel_ids)
       VALUES (?, ?, ?, ?, ?, ?)`,
      wordRows
    );
  }
}
