import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
import { create } from "zustand";

export type AppLanguage = "en" | "am";

const LANGUAGE_KEY = "app_language";

type LanguageState = {
  language: AppLanguage;
  hydrated: boolean;
  setLanguage: (language: AppLanguage) => Promise<void>;
  hydrateLanguage: () => Promise<void>;
};

async function readStoredLanguage(): Promise<AppLanguage | null> {
  if (Platform.OS === "web") {
    try {
      const value = globalThis?.localStorage?.getItem(LANGUAGE_KEY);
      if (value === "en" || value === "am") {
        return value;
      }
    } catch {
      return null;
    }
    return null;
  }

  const value = await SecureStore.getItemAsync(LANGUAGE_KEY);
  return value === "en" || value === "am" ? value : null;
}

async function persistLanguage(language: AppLanguage) {
  if (Platform.OS === "web") {
    try {
      globalThis?.localStorage?.setItem(LANGUAGE_KEY, language);
    } catch {
      // ignore web storage failures
    }
    return;
  }

  await SecureStore.setItemAsync(LANGUAGE_KEY, language);
}

export const useLanguageStore = create<LanguageState>()((set) => ({
  language: "en",
  hydrated: false,
  setLanguage: async (language) => {
    set({ language });
    await persistLanguage(language);
  },
  hydrateLanguage: async () => {
    try {
      const stored = await readStoredLanguage();
      set({
        language: stored ?? "en",
        hydrated: true,
      });
    } catch {
      set({ language: "en", hydrated: true });
    }
  },
}));
