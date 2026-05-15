import { getInfoAsync } from "expo-file-system/legacy";

function getGamingBaseUrl(): string {
  const raw =
    process.env.EXPO_PUBLIC_GAMING_API_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
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

export const audioPronouncation = async (
  audioUri: string,
  targetWord: string,
) => {
  const base = getGamingBaseUrl();
  if (!base)
    throw new Error("Set EXPO_PUBLIC_GAMING_API_URL (or EXPO_PUBLIC_API_URL)");

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
      formData.append("targetWord", targetWord.trim());
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
    if (!res.ok) {
      // Fallback for backends configured as upload.single("file")
      let retryNeeded = false;
      try {
        const errorData = (await res.json()) as any;
        const errMsg = String(
          errorData?.error || errorData?.message || "",
        ).toLowerCase();
        retryNeeded =
          errMsg.includes("no audio") ||
          errMsg.includes("unexpected field") ||
          errMsg.includes("no file");
      } catch {
        retryNeeded = false;
      }
      if (retryNeeded) {
        res = await sendWithField("file");
      }
    }

    if (!res.ok) {
      let msg = `Failed to score pronunciation (${res.status})`;
      try {
        const errorData = (await res.json()) as any;
        msg = errorData?.error || errorData?.message || msg;
      } catch {
        try {
          const fallback = await res.text();
          if (fallback) msg = fallback;
        } catch {
          // ignore
        }
      }
      throw new Error(msg);
    }

    return await res.json();
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
