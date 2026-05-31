/** Shared parsing for CMS level/question payloads (v1 legacy + v2 shapes). */

const ROOT_META_KEYS = new Set([
  "contents",
  "meta",
  "schema_version",
  "version",
  "checksum",
  "id",
  "slug",
  "title",
  "gameType",
  "game_type",
  "game_type_id",
  "publishedAt",
  "published_at",
  "downloadUrl",
  "download_url",
  "manifestUrl",
  "manifest_url",
  "sizeBytes",
  "size_bytes",
  "minAppVersion",
  "min_app_version",
]);

/** True when value looks like a CMS game block (`{ levels }` or `{ stories }`). */
export function isGameContentBlock(value: unknown): boolean {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const o = value as Record<string, unknown>;
  return (
    ("levels" in o && typeof o.levels === "object") ||
    ("stories" in o && Array.isArray(o.stories))
  );
}

/**
 * Unwrap `contents` and merge game blocks that sit at the download JSON root
 * (e.g. `{ "fidel_tracing": { "levels": … } }`).
 */
export function mergePackContents(payload: unknown): Record<string, unknown> {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return {};
  }

  const root = payload as Record<string, unknown>;
  const merged: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(root)) {
    if (ROOT_META_KEYS.has(key)) continue;
    if (isGameContentBlock(value)) {
      merged[key] = value;
    }
  }

  const inner = root.contents;
  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    for (const [key, value] of Object.entries(inner as Record<string, unknown>)) {
      if (isGameContentBlock(value)) {
        merged[key] = value;
      }
    }
  }

  if (typeof root.version === "string") merged.version = root.version;
  if (typeof root.checksum === "string") merged.checksum = root.checksum;

  return merged;
}

/** @deprecated Use mergePackContents — kept for callers that only need inner unwrap. */
export function extractContents(payload: unknown): Record<string, unknown> {
  return mergePackContents(payload);
}

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
