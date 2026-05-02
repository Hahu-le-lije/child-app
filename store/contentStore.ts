import {
    ContentApiError,
    fetchContentPackList,
    fetchPackDownload,
    type ContentPackListItem,
} from "@/services/api/content.api";
import { getInstalledPacks } from "@/services/cms/contentQueryService";
import { getAccessToken, getUser } from "@/services/db/authStorage";
import {
    importPackPayload,
    normalizePackGameType,
} from "@/services/cms/packImportService";
import { create } from "zustand";

interface ContentState {
  packs: ContentPackListItem[];
  downloadedSlugs: Record<string, boolean>;
  progressSlug: string | null;
  loadContent: () => Promise<void>;
  downloadPack: (pack: ContentPackListItem) => Promise<void>;
}

export const useContentStore = create<ContentState>((set) => ({
  packs: [],
  downloadedSlugs: {},
  progressSlug: null,

  loadContent: async () => {
    try {
      const token = await getAccessToken();
      const user = await getUser();
      const childId = user?.id != null ? String(user.id) : null;

      const catalog = await fetchContentPackList(token);

      let installedMap: Record<string, boolean> = {};
      if (childId) {
        const installed = getInstalledPacks(childId) as Array<{
          slug?: string;
        }>;
        installedMap = installed.reduce<Record<string, boolean>>((acc, row) => {
          if (row.slug) acc[row.slug] = true;
          return acc;
        }, {});
      }

      set({ packs: catalog, downloadedSlugs: installedMap });
    } catch (error) {
      console.error("Failed to load content catalog:", error);
      const message =
        error instanceof ContentApiError
          ? error.message
          : "Could not reach the content server.";
      console.warn(message);
    }
  },

  downloadPack: async (pack) => {
    const user = await getUser();
    if (!user?.id) {
      throw new Error("Log in first to save packs for your profile.");
    }
    const childId = String(user.id);
    const token = await getAccessToken();

    const game = normalizePackGameType(
      pack.gameType ?? pack.game_type ?? pack.type ?? null,
    );
    if (!game) {
      throw new Error(
        `Pack "${pack.title}" has no recognized game_type. Check the catalog row from the server.`,
      );
    }

    set({ progressSlug: pack.slug });

    try {
      const payload = await fetchPackDownload(pack.slug, token);
      const catalogVersion =
        pack.version ??
        (pack.latest_published_version != null
          ? String(pack.latest_published_version)
          : undefined);

      await importPackPayload(
        childId,
        pack.slug,
        game,
        payload,
        pack.title,
        catalogVersion,
      );

      set((state) => ({
        downloadedSlugs: { ...state.downloadedSlugs, [pack.slug]: true },
        progressSlug: null,
      }));
    } catch (error) {
      set({ progressSlug: null });
      throw error;
    }
  },
}));
