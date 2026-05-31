import AudioButton from "@/components/AudioButton";
import GameLayout from "@/components/GameLayout";
import { getGameContent } from "@/services/cms/gameContentService";
import { getUser } from "@/services/db/authStorage";
import { upsertGameSession } from "@/services/db/gameSession.service";
import { scoreVoiceMatch } from "@/services/gaming/scoring.service";
import { t } from "@/services/locales";
import { useLanguageStore } from "@/store/languageStore";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MatchItem = {
  id: string;
  word: string;
  audio_url?: string;
  image_url?: string;
  is_correct?: number;
};

type VoiceQuizQuestion = {
  id: string;
  audio_url: string;
  choices: string[];
  correct_word: string;
};

const MatchLevel = () => {
  const { id } = useLocalSearchParams();
  const levelId = String(id);
  const language = useLanguageStore((state) => state.language);

  const [mode, setMode] = useState<"matching" | "voice_quiz">("matching");
  const [rows, setRows] = useState<MatchItem[]>([]);
  const [voiceQuestions, setVoiceQuestions] = useState<VoiceQuizQuestion[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [message, setMessage] = useState<string>("");
  const [round, setRound] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [replayCount, setReplayCount] = useState(0);
  const [sessionStartedAt, setSessionStartedAt] = useState(Date.now());
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const matchingData = (await getGameContent("matching", levelId)) as MatchItem[];
      if (Array.isArray(matchingData) && matchingData.length > 0) {
        setMode("matching");
        setRows(matchingData);
        setVoiceQuestions([]);
      } else {
        const voiceData = (await getGameContent("voice", levelId)) as Array<{
          id: string;
          audio_url?: string;
          choices?: string[];
          correct_word?: string;
        }>;
        const questions: VoiceQuizQuestion[] = (voiceData ?? [])
          .filter((row) => row.audio_url && Array.isArray(row.choices))
          .map((row) => ({
            id: String(row.id),
            audio_url: String(row.audio_url),
            choices: row.choices ?? [],
            correct_word: String(row.correct_word ?? ""),
          }));
        setMode("voice_quiz");
        setVoiceQuestions(questions);
        setRows([]);
      }

      setSelected(null);
      setMessage("");
      setRound(0);
      setCorrectAnswers(0);
      setWrongAttempts(0);
      setReplayCount(0);
      setSessionStartedAt(Date.now());
      setSaved(false);
    })();
  }, [levelId]);

  const words = useMemo(() => {
    const map = new Map<string, MatchItem>();
    for (const r of rows) {
      if (!map.has(r.id)) map.set(r.id, r);
    }
    return Array.from(map.values());
  }, [rows]);

  const currentPrompt = useMemo(() => {
    if (mode === "voice_quiz") return null;
    if (words.length === 0) return null;
    if (round >= words.length) return null;
    return words[round % words.length];
  }, [mode, round, words]);

  const currentVoiceQuestion = useMemo(() => {
    if (mode !== "voice_quiz") return null;
    if (round >= voiceQuestions.length) return null;
    return voiceQuestions[round];
  }, [mode, round, voiceQuestions]);

  const options = useMemo(() => {
    if (mode === "voice_quiz" && currentVoiceQuestion) {
      return currentVoiceQuestion.choices.map((label) => ({
        key: label,
        label,
        correct: label === currentVoiceQuestion.correct_word,
      }));
    }
    if (!currentPrompt) return [];
    const others = words.filter((w) => w.id !== currentPrompt.id);
    const shuffledOthers = others.slice().sort(() => Math.random() - 0.5);
    const candidates = [currentPrompt, ...shuffledOthers.slice(0, 3)].sort(
      () => Math.random() - 0.5,
    );
    return candidates.map((w) => ({
      key: w.id,
      label: w.word,
      correct: w.id === currentPrompt.id,
    }));
  }, [currentPrompt, currentVoiceQuestion, mode, words]);

  const totalQuestions =
    mode === "voice_quiz" ? voiceQuestions.length : words.length;

  const handlePick = (opt: {
    key: string;
    label: string;
    correct: boolean;
  }) => {
    if (selected) return;
    setSelected(opt.key);
    setMessage(
      opt.correct ? t(language, "gameUi.correct") : t(language, "gameUi.tryAgain"),
    );
    if (opt.correct) {
      setCorrectAnswers((prev) => prev + 1);
    } else {
      setWrongAttempts((prev) => prev + 1);
    }
    setTimeout(() => {
      setSelected(null);
      setMessage("");
      if (opt.correct) {
        setRound((r) => Math.min(r + 1, totalQuestions));
      }
    }, 1200);
  };

  const isCompleted = totalQuestions > 0 && round >= totalQuestions;

  React.useEffect(() => {
    if (!isCompleted || saved) return;
    setSaved(true);
    void (async () => {
      const user = await getUser();
      if (!user?.id) return;
      const maxReplays = Math.max(1, totalQuestions * 3);
      const scored = scoreVoiceMatch({
        totalQuestions,
        correctAnswers,
        replayCount,
        maxReplays,
      });
      const now = new Date().toISOString();
      upsertGameSession({
        id: `voice_match_${user.id}_${Date.now()}`,
        child_id: String(user.id),
        game_type: "voice_word_match",
        content_id: levelId,
        score: scored.finalScore,
        time_spent: Math.round((Date.now() - sessionStartedAt) / 1000),
        metrics: {
          total_questions: totalQuestions,
          correct_answers: correctAnswers,
          wrong_attempts: wrongAttempts,
          replay_count: replayCount,
        },
        skill_breakdown: scored.skills,
        synced: 0,
        created_at: now,
        updated_at: now,
      });
    })();
  }, [
    correctAnswers,
    isCompleted,
    levelId,
    replayCount,
    saved,
    sessionStartedAt,
    totalQuestions,
    wrongAttempts,
  ]);

  const audioUri =
    mode === "voice_quiz"
      ? currentVoiceQuestion?.audio_url
      : currentPrompt?.audio_url;

  return (
    <GameLayout title={t(language, "gameUi.matchTitle", { id: levelId })}>
      <View style={styles.container}>
        <Text style={styles.help}>
          {t(language, "gameUi.matchHelp")}
        </Text>
        <AudioButton
          uri={audioUri}
          label={t(language, "gameUi.playSound")}
          style={{ marginBottom: 14 }}
          onPlay={() => setReplayCount((prev) => prev + 1)}
        />
        <View style={styles.grid}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.card,
                selected === opt.key &&
                  (opt.correct ? styles.correct : styles.wrong),
              ]}
              onPress={() => handlePick(opt)}
              disabled={!!selected}
            >
              <Text style={styles.cardText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!!message && <Text style={styles.message}>{message}</Text>}
        {isCompleted && (
          <Text style={styles.complete}>
            {t(language, "gameUi.levelCompleteTitle")}
          </Text>
        )}
      </View>
    </GameLayout>
  );
};

export default MatchLevel;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  help: { color: "#fff", marginBottom: 12, fontSize: 14 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "48%",
    backgroundColor: "#2F2F42",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  cardText: { color: "#fff", fontSize: 18, fontFamily: "Abyssinica_SIL" },
  message: {
    color: "#5D5FEF",
    marginTop: 14,
    fontSize: 16,
    textAlign: "center",
  },
  complete: {
    color: "#86D8FF",
    marginTop: 20,
    fontSize: 18,
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
  },
  correct: {
    backgroundColor: "#1F3A2F",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  wrong: { backgroundColor: "#3F2F2F", borderWidth: 2, borderColor: "#F44336" },
});
