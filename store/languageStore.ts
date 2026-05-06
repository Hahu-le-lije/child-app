import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppLanguage = 'amharic' | 'english';

type LanguageState = {
  language: AppLanguage;
  setLanguage: (language: AppLanguage) => void;
};

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'amharic',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'app-language-settings',
      storage: {
        getItem: async (name) => {
          const value = await AsyncStorage.getItem(name);
          return value ? JSON.parse(value) : null;
        },
        setItem: async (name, value) => {
          await AsyncStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: async (name) => {
          await AsyncStorage.removeItem(name);
        },
      },
    }
  )
);
