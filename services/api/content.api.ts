import { getApiBaseUrl } from "@/services/api/auth.api";

export class ContentApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number
  ) {
    super(message);
    this.name = "ContentApiError";
  }
}

/** Base path segment, default `/api/content` → packs at `/api/content/packs`. */
const CONTENT_ROOT = (process.env.EXPO_PUBLIC_CONTENT_ROOT?.trim() || "/api/content").replace(
  /\/+$/,
  ""
);

export type ContentPackListItem = {
  slug: string;
  title: string;
  description?: string;
  /** Backend may send camelCase or snake_case; store maps this to importer game keys. */
  gameType?: string;
  game_type?: string;
  type?: string;
  thumbnail?: string;
  thumbnailUrl?: string;
  version?: string;
  sizeMb?: number;
};

function contentAbsoluteUrl(restPath: string): string {
  const base = getApiBaseUrl();
  if (!base) {
    throw new ContentApiError("EXPO_PUBLIC_API_URL is not set");
  }
  const path = restPath.startsWith("/") ? restPath : `/${restPath}`;
  return `${base}${CONTENT_ROOT}${path}`;
}

function authHeaders(token?: string | null): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  const t = token?.trim();
  if (t) headers.Authorization = `Bearer ${t}`;
  return headers;
}

async function readJson(res: Response): Promise<unknown> {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new ContentApiError("Invalid JSON from content API", res.status);
  }
}

function flattenListPayload(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === "object") {
    const o = raw as Record<string, unknown>;
    const packs = o.packs ?? o.contentPacks ?? o.data ?? o.results;
    if (Array.isArray(packs)) return packs;
    if (packs && typeof packs === "object" && Array.isArray((packs as { items?: unknown }).items)) {
      return (packs as { items: unknown[] }).items;
    }
  }
  return [];
}

function pickSlug(item: Record<string, unknown>): string | undefined {
  const s =
    item.slug ??
    item.id ??
    item.packSlug ??
    item.pack_slug;
  return typeof s === "string" && s.trim() ? s.trim() : undefined;
}

/** GET `/api/content/packs` — returns normalized catalog rows. */
export async function fetchContentPackList(accessToken?: string | null): Promise<ContentPackListItem[]> {
  let res: Response;
  try {
    res = await fetch(contentAbsoluteUrl("/packs"), {
      headers: authHeaders(accessToken),
    });
  } catch {
    throw new ContentApiError("Network error loading content packs");
  }
  const raw = await readJson(res);
  if (!res.ok) {
    throw new ContentApiError(
      `Failed to load packs (${res.status})`,
      res.status
    );
  }
  const list = flattenListPayload(raw);
  const out: ContentPackListItem[] = [];
  for (const row of list) {
    if (!row || typeof row !== "object") continue;
    const item = row as Record<string, unknown>;
    const slug = pickSlug(item);
    if (!slug) continue;
    const title =
      (typeof item.title === "string" && item.title) ||
      (typeof item.name === "string" && item.name) ||
      slug;
    out.push({
      slug,
      title,
      description: typeof item.description === "string" ? item.description : undefined,
      gameType:
        typeof item.gameType === "string"
          ? item.gameType
          : typeof item.game_type === "string"
            ? item.game_type
            : typeof item.type === "string"
              ? item.type
              : undefined,
      game_type: typeof item.game_type === "string" ? item.game_type : undefined,
      type: typeof item.type === "string" ? item.type : undefined,
      thumbnail:
        typeof item.thumbnail === "string"
          ? item.thumbnail
          : typeof item.thumbnailUrl === "string"
            ? item.thumbnailUrl
            : undefined,
      thumbnailUrl: typeof item.thumbnailUrl === "string" ? item.thumbnailUrl : undefined,
      version: typeof item.version === "string" ? item.version : undefined,
      sizeMb:
        typeof item.sizeMb === "number"
          ? item.sizeMb
          : typeof item.size_mb === "number"
            ? item.size_mb
            : undefined,
    });
  }
  return out;
}

/** GET `/api/content/packs/{slug}/manifest` */
export async function fetchPackManifest(
  slug: string,
  accessToken?: string | null
): Promise<unknown> {
  const enc = encodeURIComponent(slug);
  let res: Response;
  try {
    res = await fetch(contentAbsoluteUrl(`/packs/${enc}/manifest`), {
      headers: authHeaders(accessToken),
    });
  } catch {
    throw new ContentApiError("Network error loading manifest");
  }
  const raw = await readJson(res);
  if (!res.ok) {
    throw new ContentApiError(`Manifest failed (${res.status})`, res.status);
  }
  return raw;
}

/** GET `/api/content/packs/{slug}/download` — expects JSON body describing game content + asset URLs. */
export async function fetchPackDownload(
  slug: string,
  accessToken?: string | null
): Promise<unknown> {
  const enc = encodeURIComponent(slug);
  let res: Response;
  try {
    res = await fetch(contentAbsoluteUrl(`/packs/${enc}/download`), {
      headers: authHeaders(accessToken),
    });
  } catch {
    throw new ContentApiError("Network error downloading pack");
  }
  const raw = await readJson(res);
  if (!res.ok) {
    throw new ContentApiError(`Download failed (${res.status})`, res.status);
  }
  return raw;
}
