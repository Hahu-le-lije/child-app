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

/**
 * Mirrors Laravel `$fillable` on the content pack model (plus aliases for older clients).
 */
export type ContentPackListItem = {
  slug: string;
  title: string;
  description?: string;
  /** Laravel column `game_type` — drives which importer runs after download. */
  game_type?: string;
  /** Laravel column `thumbnail_url`. */
  thumbnail_url?: string;
  /** Laravel column `size_mb`. */
  size_mb?: number;
  /** Laravel column `latest_published_version` (shown as `version`). */
  latest_published_version?: string | number | null;
  /** Laravel column `is_active` — inactive packs are omitted from the list. */
  is_active?: boolean;
  /** Normalized booleans/strings from API — prefer using `thumbnail_url`. */
  gameType?: string;
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

function pickSizeMb(item: Record<string, unknown>): number | undefined {
  const v = item.size_mb ?? item.sizeMb;
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function pickThumbnailUrl(item: Record<string, unknown>): string | undefined {
  const u =
    item.thumbnail_url ??
    item.thumbnailUrl ??
    item.thumbnail;
  return typeof u === "string" && u.trim() ? u.trim() : undefined;
}

function pickLatestVersion(
  item: Record<string, unknown>
): string | number | null | undefined {
  const v = item.latest_published_version ?? item.version;
  if (v == null) return undefined;
  if (typeof v === "string" || typeof v === "number") return v;
  return undefined;
}

/** Treat missing `is_active` as visible (assume API only returns actives when column omitted). */
function packRowIsInactive(item: Record<string, unknown>): boolean {
  if (!("is_active" in item)) return false;
  const v = item.is_active;
  if (v === false || v === 0 || v === "0" || v === "false") return true;
  return false;
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
    if (packRowIsInactive(item)) continue;

    const title =
      (typeof item.title === "string" && item.title) ||
      (typeof item.name === "string" && item.name) ||
      slug;

    const game_type_raw =
      (typeof item.game_type === "string" && item.game_type) ||
      (typeof item.gameType === "string" && item.gameType) ||
      (typeof item.type === "string" && item.type) ||
      undefined;

    const thumb = pickThumbnailUrl(item);
    const sizeMbVal = pickSizeMb(item);
    const latest = pickLatestVersion(item);
    const versionStr =
      latest == null ? undefined : typeof latest === "number" ? String(latest) : String(latest);

    out.push({
      slug,
      title,
      description: typeof item.description === "string" ? item.description : undefined,
      game_type: game_type_raw,
      gameType: game_type_raw,
      type: typeof item.type === "string" ? item.type : undefined,
      thumbnail_url: thumb,
      thumbnail: thumb,
      thumbnailUrl: thumb,
      size_mb: sizeMbVal,
      sizeMb: sizeMbVal,
      latest_published_version: latest ?? undefined,
      version: versionStr,
      is_active:
        typeof item.is_active === "boolean"
          ? item.is_active
          : item.is_active === 1 || item.is_active === "1"
            ? true
            : item.is_active === 0 || item.is_active === "0"
              ? false
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
