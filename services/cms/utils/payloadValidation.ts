import type { GameTypeKey } from "@/services/cms/gameContentService";

export class PackPayloadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PackPayloadError";
  }
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

function hasObjectKeys(obj: unknown): obj is Record<string, unknown> {
  return !!obj && typeof obj === "object" && !Array.isArray(obj) && Object.keys(obj).length > 0;
}

/** Lightweight structural checks before running game-specific importers */
export function validatePackPayload(game: GameTypeKey, payload: unknown): void {
  if (!payload || typeof payload !== "object") {
    throw new PackPayloadError("Download payload is empty or not JSON object");
  }

  const contents = extractContents(payload);
  const root = payload as Record<string, unknown>;

  switch (game) {
    case "story": {
      const storyRoot = (contents.story as Record<string, unknown> | undefined) ?? {};
      const stories =
        storyRoot.stories ?? contents.stories;
      if (!hasObjectKeys(stories)) {
        throw new PackPayloadError("Story pack is missing stories content");
      }
      break;
    }
    case "picture": {
      const block =
        contents["picture to word"] ?? contents.picture_to_word;
      if (!hasObjectKeys((block as Record<string, unknown> | undefined)?.levels)) {
        throw new PackPayloadError("Picture pack is missing levels");
      }
      break;
    }
    case "tracing": {
      const block = contents["fidel tracing"] ?? contents.fidel_tracing;
      if (!hasObjectKeys((block as Record<string, unknown> | undefined)?.levels)) {
        throw new PackPayloadError("Tracing pack is missing levels");
      }
      break;
    }
    case "matching": {
      const levels = contents.levels ?? root.levels;
      if (!hasObjectKeys(levels)) {
        throw new PackPayloadError("Matching pack is missing levels");
      }
      break;
    }
    case "sentence_building": {
      const nested =
        contents.sentence_building ??
        contents.sentencefun ??
        root.sentence_building;
      if (!hasObjectKeys(nested) && !hasObjectKeys(root.levels)) {
        throw new PackPayloadError("Sentence pack is missing level data");
      }
      break;
    }
    case "word_builder": {
      const block = contents["word builder"] ?? contents.word_builder;
      if (!hasObjectKeys((block as Record<string, unknown> | undefined)?.levels)) {
        throw new PackPayloadError("Word builder pack is missing levels");
      }
      break;
    }
    case "fill": {
      const block =
        contents["fill in the blank"] ??
        contents.fill_in_the_blank ??
        contents.fill;
      if (!hasObjectKeys(block) && !hasObjectKeys(contents.levels)) {
        throw new PackPayloadError("Fill pack is missing level content");
      }
      break;
    }
    case "pronunciation": {
      const block =
        contents.pronunciation ??
        contents.speakup ??
        contents["speak up"];
      if (!hasObjectKeys(block) && !hasObjectKeys(contents.levels)) {
        throw new PackPayloadError("Pronunciation pack is missing content");
      }
      break;
    }
    case "voice": {
      const block = contents.voice ?? contents["voice fidel to word"];
      if (!hasObjectKeys(block) && !hasObjectKeys(contents.levels)) {
        throw new PackPayloadError("Voice pack is missing content");
      }
      break;
    }
    default:
      throw new PackPayloadError(`Unsupported game type: ${game}`);
  }
}

export function extractPayloadVersion(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const o = payload as Record<string, unknown>;
  const contents = extractContents(payload);
  const v = o.version ?? contents.version;
  return typeof v === "string" && v.trim() ? v.trim() : undefined;
}
