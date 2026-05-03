import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import GameLayout from "@/components/GameLayout";
import { getGameContent } from "@/services/gameContentService";

type SentenceWord = {
  word: string;
  position: number;
};

type SentenceRow = {
  id: string;
  sentence: string;
  words: string | null;
};

type WordToken = {
  key: string;
  text: string;
};

type SentenceQuestion = {
  id: string;
  sentenceText: string;
  ordered: string[];
};

type SessionStats = {
  total: number;
  correct: number;
  wrong: number;
  times: number[];
};

const { width } = Dimensions.get("window");
const progressWidth = Math.max(width - 190, 120);

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const parseSentenceWords = (wordsRaw: string | null): string[] => {
  let parsed: unknown = [];
  try {
    parsed = wordsRaw ? (JSON.parse(wordsRaw) as unknown) : [];
  } catch {
    parsed = [];
  }

  if (!Array.isArray(parsed)) return [];

  return (parsed as SentenceWord[])
    .sort((a, b) => a.position - b.position)
    .map((item) => item.word)
    .filter(Boolean);
};

const toTokens = (words: string[]): WordToken[] =>
  words.map((word, index) => ({
    key: `${index}-${word}`,
    text: word,
  }));

const SentenceFunLevel = () => {
  const { id } = useLocalSearchParams();
  const levelId = String(id);

  const [questions, setQuestions] = useState<SentenceQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pool, setPool] = useState<WordToken[]>([]);
  const [picked, setPicked] = useState<WordToken[]>([]);
  const [feedback, setFeedback] = useState<{
    show: boolean;
    correct: boolean;
    message: string;
  }>({
    show: false,
    correct: false,
    message: "",
  });
  const [completed, setCompleted] = useState(false);
  const [stats, setStats] = useState<SessionStats>({
    total: 0,
    correct: 0,
    wrong: 0,
    times: [],
  });

  const startRef = useRef(Date.now());

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      const rows = (await getGameContent(
        "sentence_building",
        levelId,
      )) as SentenceRow[];
      if (!active) return;

      const parsed = rows
        .map((row) => {
          const ordered = parseSentenceWords(row.words);
          return {
            id: row.id,
            sentenceText: row.sentence,
            ordered,
          };
        })
        .filter((item) => item.ordered.length > 0);

      setQuestions(parsed);
      setCurrentIndex(0);
      setPicked([]);
      setPool(parsed[0] ? shuffle(toTokens(parsed[0].ordered)) : []);
      setFeedback({ show: false, correct: false, message: "" });
      setCompleted(false);
      setStats({ total: parsed.length, correct: 0, wrong: 0, times: [] });
      startRef.current = Date.now();
      setLoading(false);
    };

    void load();

    return () => {
      active = false;
    };
  }, [levelId]);

  const currentQuestion = questions[currentIndex] ?? null;

  const accuracy = stats.total === 0 ? 0 : stats.correct / stats.total;
  const avgTime =
    stats.times.length === 0
      ? 0
      : stats.times.reduce((sum, n) => sum + n, 0) / stats.times.length;
  const speed = clamp01((12 - avgTime) / 10);
  const finalScore = accuracy * 70 + speed * 30;

  const summaryNote = useMemo(() => {
    if (accuracy >= 0.9)
      return "Excellent word order and sentence construction.";
    if (accuracy >= 0.6) return "Good progress. Keep practicing sentence flow.";
    return "Nice effort. Slow down and check word order carefully.";
  }, [accuracy]);

  const goToQuestion = (nextIndex: number) => {
    const next = questions[nextIndex];
    if (!next) {
      setCompleted(true);
      return;
    }

    setCurrentIndex(nextIndex);
    setPicked([]);
    setPool(shuffle(toTokens(next.ordered)));
    setFeedback({ show: false, correct: false, message: "" });
    startRef.current = Date.now();
  };

  const reset = () => {
    setCurrentIndex(0);
    setPicked([]);
    setPool(questions[0] ? shuffle(toTokens(questions[0].ordered)) : []);
    setFeedback({ show: false, correct: false, message: "" });
    setCompleted(false);
    setStats({ total: questions.length, correct: 0, wrong: 0, times: [] });
    startRef.current = Date.now();
  };

  const handlePick = (token: WordToken) => {
    if (!currentQuestion || feedback.show) return;

    const nextPicked = [...picked, token];
    const nextPool = pool.filter((item) => item.key !== token.key);

    setPicked(nextPicked);
    setPool(nextPool);

    if (nextPicked.length < currentQuestion.ordered.length) return;

    const elapsed = (Date.now() - startRef.current) / 1000;
    const pickedSentence = nextPicked.map((t) => t.text).join(" ");
    const targetSentence = currentQuestion.ordered.join(" ");
    const isCorrect = pickedSentence === targetSentence;

    if (isCorrect) {
      setStats((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        times: [...prev.times, elapsed],
      }));

      setFeedback({
        show: true,
        correct: true,
        message: "Great! You built the sentence correctly.",
      });

      setTimeout(() => {
        if (currentIndex >= questions.length - 1) {
          setCompleted(true);
          return;
        }
        goToQuestion(currentIndex + 1);
      }, 900);

      return;
    }

    setStats((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    setFeedback({
      show: true,
      correct: false,
      message: "Almost there. Try building it again.",
    });

    setTimeout(() => {
      setPicked([]);
      setPool(shuffle(toTokens(currentQuestion.ordered)));
      setFeedback({ show: false, correct: false, message: "" });
      startRef.current = Date.now();
    }, 900);
  };

  const handleUnpick = (token: WordToken) => {
    if (feedback.show) return;

    const idx = picked.findIndex((p) => p.key === token.key);
    if (idx < 0) return;

    const before = picked.slice(0, idx).filter((p) => p.key !== token.key);
    const after = picked.slice(idx + 1);
    const rebuiltPool = shuffle([...pool, token, ...after]);

    setPicked(before);
    setPool(rebuiltPool);
  };

  if (loading) {
    return (
      <GameLayout title="Sentence Fun">
        <View style={styles.centerWrap}>
          <Text style={styles.centerText}>Loading sentence challenges...</Text>
        </View>
      </GameLayout>
    );
  }

  if (!currentQuestion && !completed) {
    return (
      <GameLayout title="Sentence Fun">
        <View style={styles.centerWrap}>
          <Text style={styles.centerText}>
            No sentence tasks found for this level.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Back to Levels</Text>
          </TouchableOpacity>
        </View>
      </GameLayout>
    );
  }

  if (completed) {
    return (
      <GameLayout title="Sentence Fun Complete">
        <View style={styles.completeWrap}>
          <LinearGradient
            colors={["#3A4CA8", "#5A67D8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.completeHero}
          >
            <MaterialCommunityIcons
              name="format-letter-case"
              size={72}
              color="#FEE38A"
            />
            <Text style={styles.completeTitle}>Sentence Builder!</Text>
            <Text style={styles.completeSubtitle}>
              You completed level {levelId.toUpperCase()}
            </Text>
          </LinearGradient>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{Math.round(finalScore)}</Text>
              <Text style={styles.metricLabel}>Score</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Math.round(accuracy * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Accuracy</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{avgTime.toFixed(1)}s</Text>
              <Text style={styles.metricLabel}>Avg Time</Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Session Summary</Text>
            <Text style={styles.summaryLine}>Sentences: {stats.total}</Text>
            <Text style={styles.summaryLine}>Correct: {stats.correct}</Text>
            <Text style={styles.summaryLine}>
              Wrong Attempts: {stats.wrong}
            </Text>
            <Text style={styles.summaryLine}>{summaryNote}</Text>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={reset}>
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back to Levels</Text>
          </TouchableOpacity>
        </View>
      </GameLayout>
    );
  }

  return (
    <GameLayout title={`Sentence Fun ${levelId.toUpperCase()}`}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#2E3760", "#222B4D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>
              Sentence {currentIndex + 1}/{questions.length}
            </Text>
            <Progress.Bar
              progress={(currentIndex + 1) / questions.length}
              width={progressWidth}
              color="#7FD1FF"
              unfilledColor="rgba(255,255,255,0.2)"
              borderWidth={0}
              borderRadius={999}
              height={10}
            />
          </View>

          <View style={styles.scoreChip}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={20}
              color="#A8FFBE"
            />
            <Text style={styles.scoreChipText}>{stats.correct}</Text>
          </View>
        </LinearGradient>

        <View style={styles.questionCard}>
          <Text style={styles.questionLabel}>Build this sentence</Text>
          <Text style={styles.referenceSentence}>
            {currentQuestion.sentenceText}
          </Text>
        </View>

        <View style={styles.answerCard}>
          <Text style={styles.answerLabel}>Your answer</Text>
          <View style={styles.pickedWrap}>
            {picked.length === 0 ? (
              <Text style={styles.placeholder}>Tap words below in order</Text>
            ) : (
              picked.map((token) => (
                <TouchableOpacity
                  key={`picked-${token.key}`}
                  style={styles.pickedChip}
                  onPress={() => handleUnpick(token)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.pickedChipText}>{token.text}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

        <View style={styles.poolCard}>
          <Text style={styles.poolLabel}>Word bank</Text>
          <View style={styles.poolWrap}>
            {pool.map((token) => (
              <TouchableOpacity
                key={`pool-${token.key}`}
                style={styles.poolChip}
                onPress={() => handlePick(token)}
                activeOpacity={0.88}
              >
                <Text style={styles.poolChipText}>{token.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {feedback.show && (
          <View
            style={[
              styles.feedbackBox,
              feedback.correct ? styles.feedbackGood : styles.feedbackBad,
            ]}
          >
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </View>
        )}
      </View>
    </GameLayout>
  );
};

export default SentenceFunLevel;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centerText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  topBar: {
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  progressWrap: { flex: 1 },
  progressLabel: {
    color: "#FFFFFF",
    marginBottom: 8,
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },
  scoreChip: {
    marginLeft: 10,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  scoreChipText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  questionCard: {
    backgroundColor: "#262B52",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  questionLabel: {
    color: "#AAB1E6",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    marginBottom: 6,
  },
  referenceSentence: {
    color: "#E2E5FF",
    fontFamily: "Abyssinica_SIL",
    fontSize: 24,
    lineHeight: 34,
  },
  answerCard: {
    backgroundColor: "#25294A",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  answerLabel: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    marginBottom: 10,
  },
  pickedWrap: {
    minHeight: 62,
    backgroundColor: "#1F2442",
    borderRadius: 12,
    padding: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    alignItems: "center",
  },
  placeholder: {
    color: "#8891C9",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
  },
  pickedChip: {
    backgroundColor: "#4D5FB6",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickedChipText: {
    color: "#FFFFFF",
    fontFamily: "Abyssinica_SIL",
    fontSize: 18,
  },
  poolCard: {
    backgroundColor: "#25294A",
    borderRadius: 16,
    padding: 14,
  },
  poolLabel: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    marginBottom: 10,
  },
  poolWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  poolChip: {
    backgroundColor: "#343A6A",
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 12,
  },
  poolChipText: {
    color: "#FFFFFF",
    fontFamily: "Abyssinica_SIL",
    fontSize: 18,
  },
  feedbackBox: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 12,
  },
  feedbackGood: {
    backgroundColor: "rgba(46,139,87,0.3)",
  },
  feedbackBad: {
    backgroundColor: "rgba(187,77,94,0.3)",
  },
  feedbackText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
    fontSize: 13,
  },
  completeWrap: {
    flex: 1,
    justifyContent: "center",
  },
  completeHero: {
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: "center",
    marginBottom: 14,
  },
  completeTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginTop: 10,
  },
  completeSubtitle: {
    color: "rgba(255,255,255,0.85)",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    marginTop: 6,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 8,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#272D58",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  metricValue: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 22,
  },
  metricLabel: {
    color: "#BFC5EF",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  summaryCard: {
    backgroundColor: "#232846",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  summaryTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 15,
    marginBottom: 8,
  },
  summaryLine: {
    color: "#D8DCF8",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    marginBottom: 4,
  },
  primaryButton: {
    backgroundColor: "#4F6BFF",
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7C87C9",
    paddingVertical: 13,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#DCE2FF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
});
