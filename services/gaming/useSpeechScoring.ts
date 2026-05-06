import { useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { audioPronouncation } from "../api/gaming.api";
import { getUser } from "@/services/db/authStorage";
import { upsertGameSession } from "@/services/db/gameSession.service";
import { scorePronunciation } from "./scoring.service";

export const useSpeechScoring = () => {
    const [recording, setRecording] = useState<Audio.Recording | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [lastScore, setLastScore] = useState<number | null>(null);
    const [attempts, setAttempts] = useState(0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    
    const startRecording = async () => {
        try {
            const { granted } = await Audio.requestPermissionsAsync();
            if (!granted) return alert("Microphone permission required!");

            await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
            const { recording } = await Audio.Recording.createAsync(
              Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            setRecording(recording);
        } catch (err) {
            console.error("Failed to start recording", err);
        }
    };

    
    const stopAndScore = async (targetWord: string) => {
        if (!recording) return;

        setRecording(null);
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        const status = await recording.getStatusAsync();
        const durationMs =
          status.isDoneRecording && typeof status.durationMillis === "number"
            ? status.durationMillis
            : null;

        if (uri) {
            if (durationMs !== null && durationMs < 800) {
                alert("Recording is too short. Please hold and speak a little longer.");
                return;
            }
            const nextAttempts = attempts + 1;
            setAttempts(nextAttempts);
            setIsAnalyzing(true);
            try {
                const result = await audioPronouncation(uri, targetWord);
                setLastScore(result.score);
                try {
                  const user = await getUser();
                  if (user?.id) {
                    const now = new Date().toISOString();
                    const sessionId = `spk_${user.id}_${Date.now()}`;
                    const scored = scorePronunciation({
                      pronunciationScore: Number(result.score ?? 0),
                      attempts: nextAttempts,
                      clarityScore: Number(result.score ?? 0),
                    });
                    upsertGameSession({
                      id: sessionId,
                      child_id: String(user.id),
                      game_type: "pronunciation",
                      content_id: targetWord,
                      score: scored.finalScore,
                      time_spent: durationMs != null ? Math.round(durationMs / 1000) : 0,
                      metrics: {
                        targetWord,
                        attempts: nextAttempts,
                        duration: durationMs != null ? Math.round(durationMs / 1000) : 0,
                        pronunciation_score: Number(result.score ?? 0),
                        clarity_score: Number(result.score ?? 0),
                        skills: scored.skills,
                        audio_uri: uri,
                        duration_ms: durationMs,
                        raw: result,
                      },
                      synced: 0,
                      created_at: now,
                      updated_at: now,
                    });
                  }
                } catch (e) {
                  // Don't fail gameplay on local session save issues
                  console.log("failed to save game session", e);
                }
                return result;
            } catch (err) {
                const message = err instanceof Error ? err.message : "Check your connection!";
                alert(message);
            } finally {
                setIsAnalyzing(false);
            }
        }
    };

    /** Convenience: records ~3s and auto-submits. */
    const recordForThreeSecondsAndScore = async (targetWord: string) => {
      if (isAnalyzing) return;
      await startRecording();
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void stopAndScore(targetWord);
      }, 3000);
    };

    useEffect(() => {
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }, []);

    return {
      startRecording,
      stopAndScore,
      recordForThreeSecondsAndScore,
      isAnalyzing,
      lastScore,
    };
};