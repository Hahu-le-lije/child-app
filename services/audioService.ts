import { Audio } from "expo-av";

let currentSound: Audio.Sound | null = null;

export async function playAudio(uri?: string | null) {
  if (!uri) return;

  // Stop any current sound first
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // ignore
    } finally {
      currentSound = null;
    }
  }

  const { sound } = await Audio.Sound.createAsync(
    { uri },
    { shouldPlay: true, volume: 1.0 }
  );
  currentSound = sound;
}

export async function stopAudio() {
  if (!currentSound) return;
  try {
    await currentSound.stopAsync();
    await currentSound.unloadAsync();
  } finally {
    currentSound = null;
  }
}

export type RecorderHandle = {
  start: () => Promise<void>;
  stop: () => Promise<{ uri: string | null; durationMs: number | null }>;
};

export async function createRecorder(): Promise<RecorderHandle> {
  const recording = new Audio.Recording();

  async function start() {
    await Audio.requestPermissionsAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
    });
    await recording.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await recording.startAsync();
  }

  async function stop() {
    try {
      await recording.stopAndUnloadAsync();
    } catch {
      // ignore
    }
    const uri = recording.getURI() ?? null;
    const status = await recording.getStatusAsync();
    const durationMs = status.isDoneRecording ? status.durationMillis ?? null : null;
    return { uri, durationMs };
  }

  return { start, stop };
}

