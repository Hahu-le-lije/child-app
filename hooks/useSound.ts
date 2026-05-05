import { useEffect, useState } from "react";
import { Audio } from "expo-av";
import { useSoundStore } from "@/store/soundStore";

export const useClickSound = () => {
  const { soundEnabled, volume } = useSoundStore();
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    let mounted = true;
    let loadedSound: Audio.Sound | null = null;

    const loadSound = async () => {
      try {
        const result = await Audio.Sound.createAsync(
          require("../assets/sounds/click.mp3")
        );
        loadedSound = result.sound;
        if (mounted) {
          setSound(result.sound);
        }
      } catch {
        // Ignore sound-loading errors to avoid blocking UI interactions.
      }
    };

    loadSound();

    return () => {
      mounted = false;
      if (loadedSound) {
        loadedSound.unloadAsync();
      }
    };
  }, []);

  const play = async () => {
    if (!soundEnabled || !sound) return;
    try {
      await sound.setVolumeAsync(volume);
      await sound.replayAsync();
    } catch {
      // Ignore playback errors to keep button handlers resilient.
    }
  };

  return play;
};