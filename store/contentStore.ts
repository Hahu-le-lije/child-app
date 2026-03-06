// store/contentStore.ts

import { create } from "zustand";
import { getAvailableContent, getContentPacksByGame } from "@/services/contentApi";
import { simulateDownload } from "@/services/contentService";
import { saveContentPack, getContentPacks } from "@/database/contentRepository";

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
      // Get all content data
      const contentData = await getAvailableContent();
      
      // Get downloaded packs from database
      const downloadedPacks = await getContentPacks();
      const downloadedMap = downloadedPacks.reduce((acc: any, pack: any) => {
        acc[pack.id] = true;
        return acc;
      }, {});
      
      // Store content packs (for download section)
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
      const uri = await simulateDownload(pack.id, (p) => {
        set((state) => ({
          progress: { ...state.progress, [pack.id]: p },
        }));
      });
      
      await saveContentPack(pack.id, pack.title, pack.size, uri);
      
      set((state) => ({
        downloadedPacks: { ...state.downloadedPacks, [pack.id]: true },
        progress: { ...state.progress, [pack.id]: undefined },
      }));
      
    } catch (error) {
      console.error("Download failed:", error);
      set((state) => ({
        progress: { ...state.progress, [pack.id]: undefined },
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