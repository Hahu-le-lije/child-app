import * as FileSystem from "expo-file-system/legacy";
import {
  ContentApiError,
  fetchContentPackList,
} from "@/services/api/content.api";
import type { ContentPack } from "@/types/content";

const CACHE_PATH = `${FileSystem.documentDirectory}content/catalog-cache.json`;
const CACHE_TTL_MS = 15 * 60 * 1000;

type CatalogCacheFile = {
  fetchedAt: number;
  packs: ContentPack[];
};

async function readCache(): Promise<CatalogCacheFile | null> {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_PATH);
    if (!info.exists) return null;
    const raw = await FileSystem.readAsStringAsync(CACHE_PATH);
    const parsed = JSON.parse(raw) as CatalogCacheFile;
    if (!parsed?.fetchedAt || !Array.isArray(parsed.packs)) return null;
    return parsed;
  } catch {
    return null;
  }
}

async function writeCache(packs: ContentPack[]): Promise<void> {
  const dir = `${FileSystem.documentDirectory}content`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  const body: CatalogCacheFile = { fetchedAt: Date.now(), packs };
  await FileSystem.writeAsStringAsync(CACHE_PATH, JSON.stringify(body));
}

export type CatalogLoadResult = {
  packs: ContentPack[];
  fromCache: boolean;
};

export async function loadContentCatalog(
  accessToken?: string | null,
  options?: { forceRefresh?: boolean },
): Promise<CatalogLoadResult> {
  const force = options?.forceRefresh === true;
  const cached = !force ? await readCache() : null;

  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return { packs: cached.packs, fromCache: true };
  }

  try {
    const packs = await fetchContentPackList(accessToken);
    await writeCache(packs);
    return { packs, fromCache: false };
  } catch (error) {
    if (cached) {
      return { packs: cached.packs, fromCache: true };
    }
    throw error;
  }
}

export async function clearCatalogCache(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(CACHE_PATH);
    if (info.exists) await FileSystem.deleteAsync(CACHE_PATH);
  } catch {
    /* ignore */
  }
}

export function catalogErrorMessage(error: unknown): string {
  if (error instanceof ContentApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Could not reach the content server.";
}
