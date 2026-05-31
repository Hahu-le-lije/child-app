import { useCallback, useEffect, useRef, useState } from "react";
import { Audio } from "expo-av";
import { audioPronouncation } from "../api/gaming.api";
import { getUser } from "@/services/db/authStorage";
import { upsertGameSession } from "@/services/db/gameSession.service";
import { scorePronunciation } from "./scoring.service";
import { t } from "@/services/locales";
import { useLanguageStore } from "@/store/languageStore";

export type SpeechRecordingPhase = "idle" | "recording" | "processing";

const MAX_RECORDING_MS = 6000;
const MIN_RECORDING_MS = 800;

export const useSpeechScoring = () => {
  const localized = (key: string) =>
    t(useLanguageStore.getState().language, key);

  const [phase, setPhase] = useState<SpeechRecordingPhase>("idle");
  const [lastScore, setLastScore] = useState<number | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [recordingElapsedMs, setRecordingElapsedMs] = useState(0);

  const recordingRef = useRef<Audio.Recording | null>(null);
  const phaseRef = useRef<SpeechRecordingPhase>("idle");
  const maxTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startedAtRef = useRef(0);
  const pendingTargetRef = useRef<{ word: string; contentId: string } | null>(
    null,
  );

  const setPhaseSafe = (next: SpeechRecordingPhase) => {
    phaseRef.current = next;
    setPhase(next);
  };

  const clearTimers = () => {
    if (maxTimerRef.current) {
      clearTimeout(maxTimerRef.current);
      maxTimerRef.current = null;
    }
    if (tickRef.current) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
  };

  const unloadRecording = async () => {
    const rec = recordingRef.current;
    recordingRef.current = null;
    if (!rec) return null;
    try {
      await rec.stopAndUnloadAsync();
    } catch {
      /* already stopped */
    }
    return rec;
  };

  const finishRecording = useCallback(
    async (targetWord: string, contentId = targetWord) => {
      if (phaseRef.current !== "recording") return;

      clearTimers();
      setRecordingElapsedMs(0);

      const rec = await unloadRecording();
      if (!rec) {
        setPhaseSafe("idle");
        return;
      }

      const uri = rec.getURI();
      const status = await rec.getStatusAsync();
      const durationMs =
        status.isDoneRecording && typeof status.durationMillis === "number"
          ? status.durationMillis
          : Date.now() - startedAtRef.current;

      if (!uri) {
        setPhaseSafe("idle");
        return;
      }

      if (durationMs < MIN_RECORDING_MS) {
        alert(localized("gameUi.recordingTooShort"));
        setPhaseSafe("idle");
        return;
      }

      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);
      setPhaseSafe("processing");

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
              content_id: contentId,
              score: scored.finalScore,
              time_spent: Math.round(durationMs / 1000),
              metrics: {
                word: targetWord,
                attempts: nextAttempts,
                duration: Math.round(durationMs / 1000),
                pronunciation_score: Number(result.score ?? 0),
                clarity_score: Number(result.score ?? 0),
              },
              skill_breakdown: scored.skills,
              synced: 0,
              created_at: now,
              updated_at: now,
            });
          }
        } catch (e) {
          console.log("failed to save game session", e);
        }
        return result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Check your connection!";
        console.warn("[speakup] pronunciation scoring failed:", message);
        alert(message);
      } finally {
        setPhaseSafe("idle");
      }
    },
    [attempts, localized],
  );

  const beginRecording = useCallback(async (): Promise<boolean> => {
    if (phaseRef.current !== "idle") return false;

    try {
      const { granted } = await Audio.requestPermissionsAsync();
      if (!granted) {
        alert(localized("gameUi.microphonePermission"));
        return false;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
      );

      recordingRef.current = recording;
      startedAtRef.current = Date.now();
      setRecordingElapsedMs(0);
      setPhaseSafe("recording");

      tickRef.current = setInterval(() => {
        setRecordingElapsedMs(Date.now() - startedAtRef.current);
      }, 100);

      maxTimerRef.current = setTimeout(() => {
        const pending = pendingTargetRef.current;
        if (pending && phaseRef.current === "recording") {
          void finishRecording(pending.word, pending.contentId);
        }
      }, MAX_RECORDING_MS);

      return true;
    } catch (err) {
      console.error("Failed to start recording", err);
      setPhaseSafe("idle");
      return false;
    }
  }, [finishRecording, localized]);

  const endRecording = useCallback(
    async (targetWord: string, contentId = targetWord) => {
      pendingTargetRef.current = null;
      await finishRecording(targetWord, contentId);
    },
    [finishRecording],
  );

  /** Call when user presses the mic — stores target for auto-stop at max duration. */
  const prepareRecording = (targetWord: string, contentId = targetWord) => {
    pendingTargetRef.current = { word: targetWord, contentId };
  };

  const cancelRecording = useCallback(async () => {
    clearTimers();
    setRecordingElapsedMs(0);
    pendingTargetRef.current = null;
    await unloadRecording();
    setPhaseSafe("idle");
  }, []);

  useEffect(() => {
    return () => {
      clearTimers();
      void unloadRecording();
    };
  }, []);

  const recordingProgress = Math.min(recordingElapsedMs / MAX_RECORDING_MS, 1);

  return {
    phase,
    isRecording: phase === "recording",
    isProcessing: phase === "processing",
    isBusy: phase !== "idle",
    recordingElapsedMs,
    recordingProgress,
    maxRecordingMs: MAX_RECORDING_MS,
    beginRecording,
    prepareRecording,
    endRecording,
    cancelRecording,
    lastScore,
    attempts,
    /** @deprecated Use hold-to-record via beginRecording + endRecording */
    isAnalyzing: phase === "processing",
  };
};
