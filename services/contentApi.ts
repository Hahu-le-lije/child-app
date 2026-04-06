/**
 * Remote catalog for downloadable content packs.
 * Set EXPO_PUBLIC_CONTENT_CATALOG_URL to a JSON endpoint that returns
 * `{ "contentPacks": [ { id, title, description?, size, gameType, downloadUrl, thumbnail? } ] }`.
 * If unset or the request fails, the list is empty.
 */

export type ContentPackCatalogItem = {
  id: string;
  title: string;
  description?: string;
  size: number;
  gameType: string;
  levels?: string[];
  /** Must be https — points to the raw .json pack file */
  downloadUrl: string;
  thumbnail?: string;
};

export type AvailableContentResponse = {
  contentPacks: ContentPackCatalogItem[];
};

function catalogUrl(): string | null {
  const u = process.env.EXPO_PUBLIC_CONTENT_CATALOG_URL?.trim();
  return u || null;
}

export async function getAvailableContent(): Promise<AvailableContentResponse> {
  const url = catalogUrl();
  if (!url) {
    return { contentPacks: [] };
  }

  try {
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) {
      console.warn("[contentApi] catalog HTTP", res.status);
      return { contentPacks: [] };
    }
    const data = (await res.json()) as Record<string, unknown>;
    const raw =
      data.contentPacks ??
      (data.data as Record<string, unknown> | undefined)?.contentPacks;
    const packs = Array.isArray(raw) ? raw : [];
    const contentPacks: ContentPackCatalogItem[] = packs
      .map((p) => p as Record<string, unknown>)
      .filter(
        (p) =>
          typeof p.id === "string" &&
          typeof p.title === "string" &&
          typeof p.downloadUrl === "string" &&
          typeof p.size === "number" &&
          typeof p.gameType === "string"
      )
      .map((p) => ({
        id: p.id as string,
        title: p.title as string,
        description: typeof p.description === "string" ? p.description : undefined,
        size: p.size as number,
        gameType: p.gameType as string,
        levels: Array.isArray(p.levels) ? (p.levels as string[]) : undefined,
        downloadUrl: p.downloadUrl as string,
        thumbnail: typeof p.thumbnail === "string" ? p.thumbnail : undefined,
      }));
    return { contentPacks };
  } catch (e) {
    console.warn("[contentApi] catalog fetch failed:", e);
    return { contentPacks: [] };
  }
}
