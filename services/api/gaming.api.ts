import { getInfoAsync } from "expo-file-system/legacy";

function getGamingBaseUrl(): string {
  const raw =
    process.env.EXPO_PUBLIC_GAMING_API_URL?.trim() ||
    
    "";
  return raw.replace(/\/+$/, "");
}

function guessAudioMime(uri: string): { name: string; type: string } {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".m4a"))
    return { name: "recording.m4a", type: "audio/m4a" };
  if (lower.endsWith(".caf"))
    return { name: "recording.caf", type: "audio/x-caf" };
  if (lower.endsWith(".aac"))
    return { name: "recording.aac", type: "audio/aac" };
  if (lower.endsWith(".wav"))
    return { name: "recording.wav", type: "audio/wav" };
  if (lower.endsWith(".3gp"))
    return { name: "recording.3gp", type: "audio/3gpp" };
  if (lower.endsWith(".mp4"))
    return { name: "recording.mp4", type: "audio/mp4" };
  if (lower.endsWith(".webm"))
    return { name: "recording.webm", type: "audio/webm" };
  return { name: "recording.m4a", type: "audio/m4a" };
}

function normalizeLanguage(language: string): string {
  if (language === "am" || language === "amharic") {
    return "amharic";
  }

  return "english";
}

export type SpeechScoreResult = {
  success?: boolean;
  score: number;
  heard?: string;
  expected?: string;
  error?: string;
};

async function readSpeechErrorMessage(res: Response): Promise<string> {
  const fallback = `Failed to score pronunciation (${res.status})`;
  try {
    const errorData = (await res.json()) as Record<string, unknown>;
    const msg = errorData?.error ?? errorData?.message;
    if (typeof msg === "string" && msg.trim()) return msg.trim();
  } catch {
    try {
      const text = await res.text();
      if (text.trim()) return text.trim();
    } catch {
      /* ignore */
    }
  }
  if (res.status === 500) {
    return "The pronunciation service is unavailable. Ask your backend team to check the gaming service logs and HUG_FACE API key.";
  }
  return fallback;
}

export const audioPronouncation = async (
  audioUri: string,
  targetWord: string,
): Promise<SpeechScoreResult> => {
  const base = getGamingBaseUrl();
  if (!base)
    throw new Error("Set EXPO_PUBLIC_GAMING_API_URL (or EXPO_PUBLIC_API_URL)");

  const trimmedWord = targetWord.trim();
  if (!trimmedWord) {
    throw new Error("Target word is missing.");
  }

  try {
    const info = await getInfoAsync(audioUri);
    if (!info.exists) {
      throw new Error("Recorded audio file not found on device.");
    }
    if ((info.size ?? 0) < 500) {
      throw new Error("Recorded audio is too short. Please try again.");
    }

    const meta = guessAudioMime(audioUri);
    const buildFilePart = () =>
      ({
        uri: audioUri,
        type: meta.type,
        name: meta.name,
      }) as any;

    const sendWithField = async (fieldName: "audio" | "file") => {
      const formData = new FormData();
      formData.append("targetWord", trimmedWord);
      formData.append(fieldName, buildFilePart());
      return fetch(`${base}/game/speech`, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });
    };

    let res = await sendWithField("audio");
    if (!res.ok && res.status === 400) {
      const errMsg = (await readSpeechErrorMessage(res.clone())).toLowerCase();
      if (
        errMsg.includes("no audio") ||
        errMsg.includes("unexpected field") ||
        errMsg.includes("no file")
      ) {
        res = await sendWithField("file");
      }
    }

    if (!res.ok) {
      throw new Error(await readSpeechErrorMessage(res));
    }

    const data = (await res.json()) as SpeechScoreResult;
    if (typeof data.score !== "number" || Number.isNaN(data.score)) {
      throw new Error("Speech service returned an invalid score.");
    }
    return data;
  } catch (error) {
    console.log("error in sending audio data ", error);
    throw error;
  }
};
export const wordExplanation = async (word: string, language: string) => {
  try {
    const base = getGamingBaseUrl();
    if (!base)
      throw new Error(
        "Set EXPO_PUBLIC_GAMING_API_URL (or EXPO_PUBLIC_API_URL)",
      );
    const res = await fetch(`${base}/game/word`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        word: word,
        language: normalizeLanguage(language),
      }),
    });
    if (!res.ok) {
      throw new Error("error in getting the word meaning");
    }
    return await res.json();
  } catch (error) {
    console.log("error in sending the word", error);
    throw error;
  }
};
