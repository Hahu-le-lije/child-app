/** Shared parsing for CMS level/question payloads (v1 legacy + v2 shapes). */

export function resolveCorrectChoice(
  q: Record<string, unknown>,
  choices: string[],
): string {
  if (typeof q.correct_answer === "string" && q.correct_answer.trim()) {
    return q.correct_answer.trim();
  }
  if (typeof q.correctanswer === "string" && q.correctanswer.trim()) {
    return q.correctanswer.trim();
  }
  const idxRaw = q.correct_choice ?? q.correctChoice ?? q.correct_index;
  if (typeof idxRaw === "number" && choices[idxRaw] != null) {
    return choices[idxRaw];
  }
  if (typeof idxRaw === "string" && idxRaw.trim() !== "") {
    const n = Number(idxRaw);
    if (Number.isFinite(n) && choices[n] != null) return choices[n];
    if (choices.includes(idxRaw)) return idxRaw;
  }
  return choices[0] ?? "";
}

export function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((x) => String(x)).filter((s) => s.length > 0);
}

/** Walk question1, question2, … keys on a level object. */
export function iterateLevelQuestions(
  level: Record<string, unknown>,
): Array<{ key: string; question: Record<string, unknown> }> {
  const out: Array<{ key: string; question: Record<string, unknown> }> = [];
  for (const key of Object.keys(level)) {
    const val = level[key];
    if (!val || typeof val !== "object" || Array.isArray(val)) continue;

    const q = val as Record<string, unknown>;
    const isQuestionKey = /^question\d*$/i.test(key) || key.startsWith("question");
    const looksLikeQuestion =
      "choices" in q ||
      "word" in q ||
      "voice" in q ||
      "image" in q ||
      "target_word" in q ||
      "targetWord" in q ||
      "sentence" in q ||
      "images" in q ||
      "questiontext" in q;

    if (isQuestionKey || looksLikeQuestion) {
      out.push({ key, question: q });
    }
  }
  return out.sort((a, b) => a.key.localeCompare(b.key, undefined, { numeric: true }));
}

export function pickRemoteUrl(
  q: Record<string, unknown>,
  ...keys: string[]
): string {
  for (const key of keys) {
    const v = q[key];
    if (typeof v === "string" && /^https?:\/\//i.test(v.trim())) return v.trim();
  }
  return "";
}
