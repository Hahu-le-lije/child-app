import type {
  ContentPack,
  ContentPackListItem,
  ContentPackManifest,
} from "@/types/content";
import {
  buildContentRequest,
  clearCmsServiceTokenCache,
  type ContentRequestContext,
} from "@/services/api/cmsContentAuth";

export type { ContentPack, ContentPackListItem, ContentPackManifest };

export class ContentApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message);
    this.name = "ContentApiError";
  }
}

async function contentFetch(
  restPath: string,
  networkError: string,
): Promise<{ res: Response; raw: unknown; ctx: ContentRequestContext }> {
  let ctx: ContentRequestContext;

  try {
    ctx = await buildContentRequest(restPath);
  } catch (error) {
    throw new ContentApiError(
      error instanceof Error ? error.message : "Content request setup failed",
    );
  }

  let res: Response;

  try {
    res = await fetch(ctx.url, {
      method: ctx.method,
      headers: ctx.headers,
    });
  } catch {
    throw new ContentApiError(networkError);
  }

  const raw = await readJson(res);

  return { res, raw, ctx };
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();

  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    throw new ContentApiError("Invalid JSON from content API", res.status);
  }
}

function apiErrorMessage(raw: unknown, fallback: string): string {
  if (raw && typeof raw === "object") {
    const record = raw as Record<string, unknown>;
    const msg = record.message ?? record.error;

    if (typeof msg === "string" && msg.trim()) return msg.trim();
  }

  return fallback;
}

function assertOk(
  res: Response,
  raw: unknown,
  fallback: string,
): void {
  if (res.ok) return;

  if (res.status === 401) {
    clearCmsServiceTokenCache();

    throw new ContentApiError(
      apiErrorMessage(raw, "Content authorization failed. Log in and try again."),
      401,
    );
  }

  if (res.status === 404) {
    throw new ContentApiError(
      apiErrorMessage(raw, "Content pack not found or not published."),
      404,
    );
  }

  throw new ContentApiError(
    apiErrorMessage(raw, `${fallback} (${res.status})`),
    res.status,
  );
}

function flattenListPayload(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;

  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const packs = o.contentPacks ?? o.packs ?? o.data ?? o.results;

    if (Array.isArray(packs)) return packs;

    if (
      packs &&
      typeof packs === "object" &&
      Array.isArray((packs as { items?: unknown }).items)
    ) {
      return (packs as { items: unknown[] }).items;
    }
  }

  return [];
}

function pickSlug(item: Record<string, unknown>): string | undefined {
  const value = item.slug ?? item.id ?? item.packSlug ?? item.pack_slug;

  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function pickNumber(
  item: Record<string, unknown>,
  ...keys: string[]
): number | undefined {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "number" && Number.isFinite(value)) return value;

    if (typeof value === "string") {
      const parsed = Number(value);
      if (Number.isFinite(parsed)) return parsed;
    }
  }

  return undefined;
}

function pickString(
  item: Record<string, unknown>,
  ...keys: string[]
): string | undefined {
  for (const key of keys) {
    const value = item[key];

    if (typeof value === "string" && value.trim()) return value.trim();

    if (typeof value === "number" && Number.isFinite(value)) {
      return String(value);
    }
  }

  return undefined;
}

function unwrapRecord(raw: unknown): Record<string, unknown> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;

  const o = raw as Record<string, unknown>;
  const inner = o.data ?? o.manifest ?? o.pack;

  if (inner && typeof inner === "object" && !Array.isArray(inner)) {
    return inner as Record<string, unknown>;
  }

  return o;
}

export async function fetchContentPackList(): Promise<ContentPackListItem[]> {
  const { res, raw } = await contentFetch(
    "/packs",
    "Network error loading content packs",
  );

  assertOk(res, raw, "Failed to load packs");

  const packs: ContentPackListItem[] = [];

  for (const row of flattenListPayload(raw)) {
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;

    const item = row as Record<string, unknown>;
    const slug = pickSlug(item);

    if (!slug) continue;

    const title = pickString(item, "title", "name") ?? slug;
    const gameType = pickString(item, "gameType", "game_type", "type");
    const thumbnail = pickString(
      item,
      "thumbnail",
      "thumbnailUrl",
      "thumbnail_url",
    );
    const sizeMb = pickNumber(item, "size", "sizeMb", "size_mb");
    const version = pickString(item, "version", "latest_published_version");
    const id = pickNumber(item, "id", "content_pack_id");

    packs.push({
      id,
      slug,
      title,
      description: pickString(item, "description"),
      game_type: gameType,
      gameType,
      type: pickString(item, "type"),
      thumbnail_url: thumbnail,
      thumbnail,
      thumbnailUrl: thumbnail,
      size_mb: sizeMb,
      sizeMb,
      latest_published_version: version,
      version,
      is_active:
        typeof item.is_active === "boolean" ? item.is_active : undefined,
    });
  }

  return packs;
}

export function normalizePackManifest(
  raw: unknown,
  fallbackSlug: string,
): ContentPackManifest {
  const item = unwrapRecord(raw) ?? {};
  const slug = pickSlug(item) ?? fallbackSlug.trim();
  const version = pickString(item, "version", "latest_published_version");

  if (!version) {
    throw new ContentApiError(`Manifest for "${slug}" is missing version`);
  }

  const sizeBytes = pickNumber(item, "sizeBytes", "size_bytes");
  const contentPackId = pickNumber(item, "content_pack_id");

  return {
    slug,
    content_pack_id: contentPackId,
    version,
    checksum: pickString(item, "checksum", "hash", "sha256"),
    size_bytes: sizeBytes,
    min_app_version: pickString(item, "minAppVersion", "min_app_version"),
    published_at: pickString(item, "publishedAt", "published_at"),
    game_type: pickString(item, "gameType", "game_type"),
    title: pickString(item, "title"),
  };
}

export async function fetchPackManifest(
  slug: string,
): Promise<ContentPackManifest> {
  const enc = encodeURIComponent(slug);

  const { res, raw } = await contentFetch(
    `/packs/${enc}/manifest`,
    "Network error loading manifest",
  );

  assertOk(res, raw, "Manifest failed");

  return normalizePackManifest(raw, slug);
}

export async function fetchPackDownload(slug: string): Promise<unknown> {
  const enc = encodeURIComponent(slug);

  const { res, raw } = await contentFetch(
    `/packs/${enc}/download`,
    "Network error downloading pack",
  );

  assertOk(res, raw, "Download failed");

  return raw;
}
