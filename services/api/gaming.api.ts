function getGamingBaseUrl(): string {
  const raw =
    process.env.EXPO_PUBLIC_GAMING_API_URL?.trim() ||
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    "";
  return raw.replace(/\/+$/, "");
}

function guessAudioMime(uri: string): { name: string; type: string } {
  const lower = uri.toLowerCase();
  if (lower.endsWith(".m4a")) return { name: "recording.m4a", type: "audio/m4a" };
  if (lower.endsWith(".caf")) return { name: "recording.caf", type: "audio/x-caf" };
  if (lower.endsWith(".aac")) return { name: "recording.aac", type: "audio/aac" };
  if (lower.endsWith(".wav")) return { name: "recording.wav", type: "audio/wav" };
  return { name: "recording.m4a", type: "audio/m4a" };
}

export const audioPronouncation = async (audioUri: string, targetWord: string) => {
  const base = getGamingBaseUrl();
  if (!base) throw new Error("Set EXPO_PUBLIC_GAMING_API_URL (or EXPO_PUBLIC_API_URL)");

  try {
    const formData = new FormData();
    formData.append("targetWord", targetWord);
    const meta = guessAudioMime(audioUri);
    formData.append(
      "audio",
      {
        uri: audioUri,
        type: meta.type,
        name: meta.name,
      } as any,
    );

    const res = await fetch(`${base}/game/speech`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let msg = `Failed to score pronunciation (${res.status})`;
      try {
        const errorData = (await res.json()) as any;
        msg = errorData?.error || errorData?.message || msg;
      } catch {
        // ignore
      }
      throw new Error(msg);
    }

    return await res.json();
  } catch (error) {
    console.log("error in sending audio data ", error);
    throw error;
  }
};
export const wordExplanation=async(word:string,language:string)=>{
try{
    const base = getGamingBaseUrl();
    if (!base) throw new Error("Set EXPO_PUBLIC_GAMING_API_URL (or EXPO_PUBLIC_API_URL)");
    const res=await fetch(`${base}/game/word`,{
        method:"POST",
        headers:{
            "Content-Type": "application/json",
        },
        body:JSON.stringify({
            word:word,
            language:language
        })
    })
    if(!res.ok){
        throw new Error("error in getting the word meaning")
    }
return await res.json()
}catch(error){
    console.log("error in sending the word", error)
}
}