// store/contentStore.ts

import { create } from "zustand";
import { getAvailableContent, getContentPacksByGame } from "@/services/contentApi";
import { downloadContentPack } from "@/services/contentService";
import { saveContentPack, getContentPacks, updateContentStatus } from "@/database/contentRepository";
import { importContentPackFromFile } from "@/database/contentImporter";

interface ContentState {
  packs: any[]; // For downloadable content packs
  gameLevels: Record<string, any[]>; // For game levels by type
  downloadedPacks: Record<string, boolean>;
  progress: Record<string, number>;
  loadContent: () => Promise<void>;
  downloadPack: (pack: any) => Promise<void>;
  loadGameLevels: (gameType: string) => Promise<any[]>;
}

export const useContentStore = create<ContentState>((set, get) => ({
  packs: [],
  gameLevels: {},
  downloadedPacks: {},
  progress: {},
  
  loadContent: async () => {
    try {
     
      const contentData = await getAvailableContent();
    
      const downloadedPacks = await getContentPacks();
      const downloadedMap = downloadedPacks.reduce((acc: any, pack: any) => {
        acc[pack.id] = pack.status === "downloaded";
        return acc;
      }, {});
      
     
      set({ 
        packs: contentData.contentPacks || [],
        gameLevels: contentData.gameLevels || {},
        downloadedPacks: downloadedMap 
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

      // Import pack into SQLite so games work offline
      await importContentPackFromFile(uri);
      
      await saveContentPack(pack.id, pack.title, pack.size, uri);
      
      set((state) => ({
        downloadedPacks: { ...state.downloadedPacks, [pack.id]: true },
        progress: Object.fromEntries(Object.entries(state.progress).filter(([k]) => k !== pack.id)),
      }));
      
    } catch (error) {
      console.error("Download failed:", error);
      await updateContentStatus(pack.id, "failed").catch(() => {});
      set((state) => ({
        progress: Object.fromEntries(Object.entries(state.progress).filter(([k]) => k !== pack.id)),
      }));
    }
  },
  
  loadGameLevels: async (gameType: string) => {
    const contentData = await getAvailableContent();
    const levels = contentData.gameLevels[gameType] || [];
    set((state) => ({
      gameLevels: { ...state.gameLevels, [gameType]: levels }
    }));
    return levels;
  },
}));