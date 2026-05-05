import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

type SoundState = {
  soundEnabled: boolean;
  volume: number;

  setSoundEnabled: (value: boolean) => void;
  toggleSound: () => void;
  setVolume: (value: number) => void;
};

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      soundEnabled: true,
      volume: 1.0,

      setSoundEnabled: (value) => set({ soundEnabled: value }),

      toggleSound: () =>
        set((state) => ({ soundEnabled: !state.soundEnabled })),

      setVolume: (value) => set({ volume: value }),
    }),
    {
      name: 'sound-settings',
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