import { create } from "zustand";
import { getAvailableContent } from "@/services/contentApi";
import { simulateDownload } from "@/services/contentService";
import { saveContentPack } from "@/database/contentRepository";

interface ContentState {
  packs: any[];
  progress: Record<string, number>;

  loadContent: () => Promise<void>;
  downloadPack: (pack: any) => Promise<void>;
}

export const useContentStore = create<ContentState>((set) => ({
  packs: [],
  progress: {},

  loadContent: async () => {
    const packs = await getAvailableContent();

    set({ packs });
  },

  downloadPack: async (pack) => {
    const uri = await simulateDownload(pack.id, (p) => {
      set((state) => ({
        progress: { ...state.progress, [pack.id]: p },
      }));
    });

    await saveContentPack(pack.id, pack.title, pack.size, uri);
  },
}));