import GameLayout from "@/components/GameLayout";
import { getGameContent } from "@/services/cms/gameContentService";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import * as Progress from "react-native-progress";

type StoryQuestionRow = {
  question: string;
  options: string | string[];
  correct_answer: string;
  question_type?: string;
  position?: number;
};

type StoryRow = {
  id: string;
  title: string;
  content: string;
  thumbnail_url: string | null;
  questions: string | null;
};

type QuizQuestion = {
  id: string;
  storyId: string;
  storyTitle: string;
  storyContent: string;
  storyImage: string | null;
  question: string;
  options: string[];
  correctAnswer: string;
  position: number;
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

const toOptionsArray = (value: string | string[]): string[] => {
  if (Array.isArray(value)) {
    return value.map((v) => String(v)).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      if (Array.isArray(parsed)) {
        return parsed.map((v) => String(v)).filter(Boolean);
      }
    } catch {
      return [];
    }
  }

  return [];
};

const parseQuizQuestions = (story: StoryRow): QuizQuestion[] => {
  let parsed: unknown = [];
  try {
    parsed = story.questions ? (JSON.parse(story.questions) as unknown) : [];
  } catch {
    parsed = [];
  }

  if (!Array.isArray(parsed)) return [];

  return (parsed as StoryQuestionRow[])
    .map((q, index) => {
      const options = toOptionsArray(q.options);
      const mergedOptions = options.includes(q.correct_answer)
        ? options
        : [...options, q.correct_answer];

      return {
        id: `${story.id}-${index + 1}`,
        storyId: story.id,
        storyTitle: story.title,
        storyContent: story.content,
        storyImage: story.thumbnail_url,
        question: q.question,
        options: mergedOptions,
        correctAnswer: q.correct_answer,
        position: q.position ?? index + 1,
      };
    })
    .sort((a, b) => a.position - b.position);
};

const StoryQuizLevel = () => {
  const { id } = useLocalSearchParams();
  const levelId = String(id);

  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
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
      const rows = (await getGameContent("story", levelId)) as StoryRow[];
      if (!active) return;

      const items = rows.flatMap((story) => parseQuizQuestions(story));

      setQuiz(items);
      setCurrentIndex(0);
      setSelectedOption(null);
      setFeedback({ show: false, correct: false, message: "" });
      setCompleted(false);
      setStats({ total: items.length, correct: 0, wrong: 0, times: [] });
      startRef.current = Date.now();
      setLoading(false);
    };

    void load();

    return () => {
      active = false;
    };
  }, [levelId]);

  const currentQuestion = quiz[currentIndex] ?? null;

  const accuracy = stats.total === 0 ? 0 : stats.correct / stats.total;
  const avgTime =
    stats.times.length === 0
      ? 0
      : stats.times.reduce((sum, n) => sum + n, 0) / stats.times.length;
  const speed = clamp01((14 - avgTime) / 12);
  const finalScore = accuracy * 70 + speed * 30;

  const summaryNote = useMemo(() => {
    if (accuracy >= 0.9)
      return "Excellent comprehension and attention to details.";
    if (accuracy >= 0.6)
      return "Good understanding. Keep practicing with more stories.";
    return "You are learning well. Read slowly and try again.";
  }, [accuracy]);

  const reset = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setFeedback({ show: false, correct: false, message: "" });
    setCompleted(false);
    setStats({ total: quiz.length, correct: 0, wrong: 0, times: [] });
    startRef.current = Date.now();
  };

  const handleOptionPress = (option: string) => {
    if (!currentQuestion || feedback.show) return;

    const elapsed = (Date.now() - startRef.current) / 1000;
    const isCorrect =
      option.trim().toLowerCase() ===
      currentQuestion.correctAnswer.trim().toLowerCase();

    setSelectedOption(option);

    if (isCorrect) {
      setStats((prev) => ({
        ...prev,
        correct: prev.correct + 1,
        times: [...prev.times, elapsed],
      }));

      setFeedback({
        show: true,
        correct: true,
        message: "Correct answer. Great reading!",
      });

      setTimeout(() => {
        if (currentIndex >= quiz.length - 1) {
          setCompleted(true);
          return;
        }

        setCurrentIndex((prev) => prev + 1);
        setSelectedOption(null);
        setFeedback({ show: false, correct: false, message: "" });
        startRef.current = Date.now();
      }, 900);

      return;
    }

    setStats((prev) => ({ ...prev, wrong: prev.wrong + 1 }));
    setFeedback({
      show: true,
      correct: false,
      message: "Not quite. Read the story again and try another option.",
    });

    setTimeout(() => {
      setSelectedOption(null);
      setFeedback({ show: false, correct: false, message: "" });
    }, 800);
  };

  if (loading) {
    return (
      <GameLayout title="Story Quiz">
        <View style={styles.centerWrap}>
          <Text style={styles.centerText}>Loading story quiz...</Text>
        </View>
      </GameLayout>
    );
  }

  if (!currentQuestion && !completed) {
    return (
      <GameLayout title="Story Quiz">
        <View style={styles.centerWrap}>
          <Text style={styles.centerText}>
            No quiz questions for this level yet.
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
      <GameLayout title="Story Quiz Complete">
        <View style={styles.completeWrap}>
          <LinearGradient
            colors={["#3A4CA8", "#5A67D8"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.completeHero}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={72}
              color="#FEE38A"
            />
            <Text style={styles.completeTitle}>Story Mastered!</Text>
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
            <Text style={styles.summaryLine}>Questions: {stats.total}</Text>
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
    <GameLayout title={`Story Quiz ${levelId.toUpperCase()}`}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#2E3760", "#222B4D"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.topBar}
        >
          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>
              Question {currentIndex + 1}/{quiz.length}
            </Text>
            <Progress.Bar
              progress={(currentIndex + 1) / quiz.length}
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

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.storyCard}>
            {!!currentQuestion.storyImage && (
              <Image
                source={{ uri: currentQuestion.storyImage }}
                style={styles.storyImage}
                resizeMode="cover"
              />
            )}

            <Text style={styles.storyTitle}>{currentQuestion.storyTitle}</Text>
            <Text style={styles.storyText}>{currentQuestion.storyContent}</Text>
          </View>

          <View style={styles.questionCard}>
            <Text style={styles.questionLabel}>Question</Text>
            <Text style={styles.questionText}>{currentQuestion.question}</Text>

            <View style={styles.optionsWrap}>
              {currentQuestion.options.map((option) => {
                const picked = selectedOption === option;
                const isCorrect =
                  option.trim().toLowerCase() ===
                  currentQuestion.correctAnswer.trim().toLowerCase();

                return (
                  <TouchableOpacity
                    key={`${currentQuestion.id}-${option}`}
                    style={[
                      styles.option,
                      feedback.show && picked && isCorrect && styles.optionGood,
                      feedback.show && picked && !isCorrect && styles.optionBad,
                    ]}
                    disabled={feedback.show}
                    activeOpacity={0.88}
                    onPress={() => handleOptionPress(option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                );
              })}
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
        </ScrollView>
      </View>
    </GameLayout>
  );
};

export default StoryQuizLevel;

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
  scrollContent: { paddingBottom: 20 },
  storyCard: {
    backgroundColor: "#262B52",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  storyImage: {
    width: "100%",
    height: 140,
    borderRadius: 12,
    marginBottom: 12,
  },
  storyTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginBottom: 8,
  },
  storyText: {
    color: "#E2E5FF",
    fontFamily: "Abyssinica_SIL",
    fontSize: 18,
    lineHeight: 30,
  },
  questionCard: {
    backgroundColor: "#25294A",
    borderRadius: 16,
    padding: 14,
  },
  questionLabel: {
    color: "#AAB1E6",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
    marginBottom: 6,
  },
  questionText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    marginBottom: 12,
    lineHeight: 24,
  },
  optionsWrap: { gap: 10 },
  option: {
    backgroundColor: "#343A6A",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  optionGood: {
    backgroundColor: "#2E8B57",
  },
  optionBad: {
    backgroundColor: "#BB4D5E",
  },
  optionText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
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
