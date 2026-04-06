// store/contentStore.ts

import { create } from "zustand";
import {
  getAvailableContent,
  type ContentPackCatalogItem,
} from "@/services/contentApi";
import { downloadContentPack } from "@/services/contentService";
import {
  saveContentPack,
  getContentPacks,
  updateContentStatus,
} from "@/database/contentRepository";
import { importContentPackFromFile } from "@/database/contentImporter";

interface ContentState {
  packs: ContentPackCatalogItem[];
  downloadedPacks: Record<string, boolean>;
  progress: Record<string, number>;
  loadContent: () => Promise<void>;
  downloadPack: (pack: ContentPackCatalogItem) => Promise<void>;
}

export const useContentStore = create<ContentState>((set) => ({
  packs: [],
  downloadedPacks: {},
  progress: {},

  loadContent: async () => {
    try {
      const contentData = await getAvailableContent();

      const downloadedPacks = await getContentPacks();
      const downloadedMap = downloadedPacks.reduce<Record<string, boolean>>(
        (acc, pack) => {
          acc[pack.id] = pack.status === "downloaded";
          return acc;
        },
        {}
      );

      set({
        packs: contentData.contentPacks || [],
        downloadedPacks: downloadedMap,
      });

      console.log("Content loaded:", contentData.contentPacks?.length, "packs");
    } catch (error) {
      console.error("Failed to load content:", error);
    }
  },

  downloadPack: async (pack) => {
    try {
      await updateContentStatus(pack.id, "downloading").catch(() => {});

      const uri = await downloadContentPack(pack.downloadUrl, pack.id, (p) => {
        set((state) => ({
          progress: { ...state.progress, [pack.id]: p },
        }));
      });

      await importContentPackFromFile(uri, pack.id);

      await saveContentPack(pack.id, pack.title, pack.size, uri);

      set((state) => ({
        downloadedPacks: { ...state.downloadedPacks, [pack.id]: true },
        progress: Object.fromEntries(
          Object.entries(state.progress).filter(([k]) => k !== pack.id)
        ),
      }));
    } catch (error) {
      console.error("Download failed:", error);
      await updateContentStatus(pack.id, "failed").catch(() => {});
      set((state) => ({
        progress: Object.fromEntries(
          Object.entries(state.progress).filter(([k]) => k !== pack.id)
        ),
      }));
    }
  },
}));
