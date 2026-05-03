import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import React, { useMemo, useRef, useState } from "react";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import GameLayout from "@/components/GameLayout";
import { PICTURE_TO_WORD_CONTENT } from "./index";

type JsonImage = { id: string; imagelink: string };
type JsonQuestion = {
  questiontext: string;
  images: JsonImage[];
  correctImageId: string;
};
type JsonLevel = Record<string, JsonQuestion>;

type PictureToWordJson = {
  contents: { "picture to word": { levels: Record<string, JsonLevel> } };
};

type Question = {
  id: string;
  questiontext: string;
  images: JsonImage[];
  correctImageId: string;
};

type SessionTrack = {
  total_questions: number;
  correct_answers: number;
  wrong_attempts: number;
  time_per_question: number[];
};

const CONTENT: PictureToWordJson = PICTURE_TO_WORD_CONTENT;

const { width } = Dimensions.get("window");
const optionSize = (width - 64) / 2;
const progressWidth = Math.max(width - 190, 120);

const sortQuestionKeys = (keys: string[]) =>
  keys.sort(
    (a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")),
  );

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

const calcSpeed = (times: number[]) => {
  if (times.length === 0) return 0;
  const avg = times.reduce((sum, n) => sum + n, 0) / times.length;
  return clamp01((12 - avg) / 10);
};

const PicToWordGame = () => {
  const { id } = useLocalSearchParams();
  const levelId = String(id);

  const level = useMemo(() => {
    const levels = CONTENT.contents["picture to word"].levels;
    const selected = levels[levelId] ?? levels.level_1;
    const keys = sortQuestionKeys(Object.keys(selected));

    const questions: Question[] = keys.map((key) => ({
      id: key,
      questiontext: selected[key].questiontext,
      images: selected[key].images,
      correctImageId: selected[key].correctImageId,
    }));

    return {
      id: levelId,
      title: `Picture to Word ${levelId.toUpperCase()}`,
      questions,
    };
  }, [levelId]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
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
  const [wrongTapTimes, setWrongTapTimes] = useState<number[]>([]);
  const [session, setSession] = useState<SessionTrack>({
    total_questions: level.questions.length,
    correct_answers: 0,
    wrong_attempts: 0,
    time_per_question: [],
  });

  const startTimeRef = useRef(Date.now());
  const currentQuestion = level.questions[currentIndex];

  const accuracy =
    session.total_questions === 0
      ? 0
      : session.correct_answers / session.total_questions;
  const speed = calcSpeed(session.time_per_question);
  const finalScore = accuracy * 70 + speed * 30;
  const wrongRatio =
    session.total_questions === 0
      ? 0
      : session.wrong_attempts / session.total_questions;

  const skills = {
    visual_recognition: clamp01(accuracy * 0.75 + speed * 0.25),
    word_association: clamp01(accuracy * 0.8 + (1 - wrongRatio) * 0.2),
    decision_speed: speed,
  };

  const avgWrongTapTime = wrongTapTimes.length
    ? wrongTapTimes.reduce((sum, n) => sum + n, 0) / wrongTapTimes.length
    : 0;

  const insights = useMemo(() => {
    const notes: string[] = [];

    if (
      session.wrong_attempts > 0 &&
      avgWrongTapTime > 0 &&
      avgWrongTapTime < 2.2
    ) {
      notes.push("Fast wrong taps suggest guessing.");
    }

    if (accuracy >= 0.5 && speed < 0.45) {
      notes.push("Slow correct answers suggest a learning phase.");
    }

    if (notes.length === 0) {
      notes.push("Balanced pace and accuracy. Great steady learning!");
    }

    return notes;
  }, [session.wrong_attempts, avgWrongTapTime, accuracy, speed]);

  const resetLevel = () => {
    setCurrentIndex(0);
    setSelectedImageId(null);
    setFeedback({ show: false, correct: false, message: "" });
    setCompleted(false);
    setWrongTapTimes([]);
    setSession({
      total_questions: level.questions.length,
      correct_answers: 0,
      wrong_attempts: 0,
      time_per_question: [],
    });
    startTimeRef.current = Date.now();
  };

  const handleSelect = (imageId: string) => {
    if (!currentQuestion || feedback.show) return;

    const elapsed = (Date.now() - startTimeRef.current) / 1000;
    const correct = imageId === currentQuestion.correctImageId;

    setSelectedImageId(imageId);

    if (correct) {
      setSession((prev) => ({
        ...prev,
        correct_answers: prev.correct_answers + 1,
        time_per_question: [...prev.time_per_question, elapsed],
      }));
      setFeedback({
        show: true,
        correct: true,
        message: "Awesome! Correct image!",
      });

      setTimeout(() => {
        if (currentIndex >= level.questions.length - 1) {
          setCompleted(true);
          return;
        }

        setCurrentIndex((prev) => prev + 1);
        setSelectedImageId(null);
        setFeedback({ show: false, correct: false, message: "" });
        startTimeRef.current = Date.now();
      }, 850);
      return;
    }

    setSession((prev) => ({
      ...prev,
      wrong_attempts: prev.wrong_attempts + 1,
    }));
    setWrongTapTimes((prev) => [...prev, elapsed]);
    setFeedback({
      show: true,
      correct: false,
      message: "Good try! Pick another image.",
    });

    setTimeout(() => {
      setSelectedImageId(null);
      setFeedback({ show: false, correct: false, message: "" });
    }, 700);
  };

  if (!currentQuestion && !completed) {
    return (
      <GameLayout title="Picture to Word">
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>
            No questions found for this level.
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
      <GameLayout title="Level Complete">
        <View style={styles.completeWrap}>
          <LinearGradient
            colors={["#4D72FF", "#62A7FF"]}
            style={styles.completeHero}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons
              name="trophy-award"
              size={74}
              color="#FFE57B"
            />
            <Text style={styles.completeTitle}>Fantastic!</Text>
            <Text style={styles.completeSubtitle}>{level.title} complete</Text>
          </LinearGradient>

          <View style={styles.metricRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{Math.round(finalScore)}</Text>
              <Text style={styles.metricLabel}>Final Score</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Math.round(accuracy * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Accuracy</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{Math.round(speed * 100)}%</Text>
              <Text style={styles.metricLabel}>Speed</Text>
            </View>
          </View>

          <View style={styles.skillCard}>
            <Text style={styles.cardTitle}>Skills</Text>
            <Text style={styles.cardLine}>
              Visual Recognition: {Math.round(skills.visual_recognition * 100)}%
            </Text>
            <Text style={styles.cardLine}>
              Word Association: {Math.round(skills.word_association * 100)}%
            </Text>
            <Text style={styles.cardLine}>
              Decision Speed: {Math.round(skills.decision_speed * 100)}%
            </Text>
          </View>

          <View style={styles.insightCard}>
            <Text style={styles.cardTitle}>Insights</Text>
            {insights.map((line, idx) => (
              <Text key={idx} style={styles.cardLine}>
                • {line}
              </Text>
            ))}
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={resetLevel}>
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
    <GameLayout title={level.title}>
      <View style={styles.container}>
        <LinearGradient
          colors={["#30375D", "#242C4B"]}
          style={styles.topBar}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>
              Question {currentIndex + 1}/{level.questions.length}
            </Text>
            <Progress.Bar
              progress={(currentIndex + 1) / level.questions.length}
              width={progressWidth}
              color="#86D8FF"
              unfilledColor="rgba(255,255,255,0.2)"
              borderWidth={0}
              height={10}
              borderRadius={999}
            />
          </View>
          <View style={styles.scoreChip}>
            <MaterialCommunityIcons
              name="star-circle"
              size={20}
              color="#FFE57B"
            />
            <Text style={styles.scoreChipText}>{session.correct_answers}</Text>
          </View>
        </LinearGradient>

        <View style={styles.promptCard}>
          <Text style={styles.promptLabel}>Tap the image for</Text>
          <Text style={styles.promptWord}>{currentQuestion.questiontext}</Text>
        </View>

        <View style={styles.grid}>
          {currentQuestion.images.map((img) => {
            const selected = selectedImageId === img.id;
            const correct = img.id === currentQuestion.correctImageId;

            return (
              <TouchableOpacity
                key={img.id}
                style={[
                  styles.optionCard,
                  feedback.show && selected && correct && styles.optionCorrect,
                  feedback.show && selected && !correct && styles.optionWrong,
                ]}
                onPress={() => handleSelect(img.id)}
                disabled={feedback.show}
                activeOpacity={0.9}
              >
                <Image
                  source={{ uri: img.imagelink }}
                  style={styles.optionImage}
                />
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

        <View style={styles.bottomRow}>
          <View style={styles.bottomCard}>
            <Text style={styles.bottomValue}>{session.wrong_attempts}</Text>
            <Text style={styles.bottomLabel}>Wrong</Text>
          </View>
          <View style={styles.bottomCard}>
            <Text style={styles.bottomValue}>
              {session.time_per_question.length}
            </Text>
            <Text style={styles.bottomLabel}>Answered</Text>
          </View>
          <View style={styles.bottomCard}>
            <Text style={styles.bottomValue}>
              {level.questions.length - currentIndex - 1}
            </Text>
            <Text style={styles.bottomLabel}>Left</Text>
          </View>
        </View>
      </View>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  emptyWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 14,
    fontFamily: "Poppins-Medium",
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
    color: "#fff",
    marginBottom: 8,
    fontSize: 13,
    fontFamily: "Poppins-Medium",
  },
  scoreChip: {
    marginLeft: 8,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  scoreChipText: { color: "#fff", fontSize: 18, fontFamily: "Poppins-Bold" },
  promptCard: {
    backgroundColor: "#2F365A",
    borderRadius: 18,
    alignItems: "center",
    paddingVertical: 16,
    marginBottom: 12,
  },
  promptLabel: {
    color: "#AFC6E8",
    fontSize: 14,
    marginBottom: 7,
    fontFamily: "Poppins-Medium",
  },
  promptWord: { color: "#fff", fontSize: 30, fontFamily: "Poppins-Bold" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  optionCard: {
    width: optionSize,
    backgroundColor: "#2D355A",
    borderRadius: 16,
    padding: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionCorrect: { borderColor: "#3ACC74", backgroundColor: "#214A36" },
  optionWrong: { borderColor: "#F86965", backgroundColor: "#4A2D33" },
  optionImage: { width: "100%", aspectRatio: 1, borderRadius: 12 },
  feedbackBox: {
    marginTop: 12,
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 12,
  },
  feedbackGood: { backgroundColor: "#2FA866" },
  feedbackBad: { backgroundColor: "#D25151" },
  feedbackText: { color: "#fff", fontSize: 15, fontFamily: "Poppins-SemiBold" },
  bottomRow: { marginTop: 12, flexDirection: "row", gap: 8 },
  bottomCard: {
    flex: 1,
    backgroundColor: "#2D3458",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 10,
  },
  bottomValue: { color: "#fff", fontSize: 18, fontFamily: "Poppins-Bold" },
  bottomLabel: {
    color: "#BBC0DB",
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  completeWrap: { flex: 1, justifyContent: "center", padding: 12 },
  completeHero: {
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 12,
  },
  completeTitle: {
    color: "#fff",
    fontSize: 30,
    marginTop: 8,
    fontFamily: "Poppins-Bold",
  },
  completeSubtitle: {
    color: "rgba(255,255,255,0.94)",
    fontSize: 14,
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  metricRow: { flexDirection: "row", gap: 8, marginBottom: 10 },
  metricCard: {
    flex: 1,
    backgroundColor: "#2D3458",
    borderRadius: 14,
    alignItems: "center",
    paddingVertical: 10,
  },
  metricValue: { color: "#fff", fontSize: 18, fontFamily: "Poppins-Bold" },
  metricLabel: {
    color: "#BBC0DB",
    fontSize: 11,
    marginTop: 2,
    fontFamily: "Poppins-Regular",
  },
  skillCard: {
    backgroundColor: "#2D3458",
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
  },
  insightCard: {
    backgroundColor: "#2D3458",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 6,
    fontFamily: "Poppins-SemiBold",
  },
  cardLine: {
    color: "#D3D7EA",
    fontSize: 13,
    marginBottom: 2,
    fontFamily: "Poppins-Regular",
  },
  primaryButton: {
    backgroundColor: "#5A76FF",
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: "center",
    marginBottom: 8,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontFamily: "Poppins-SemiBold",
  },
  secondaryButton: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#7E87B2",
    paddingVertical: 13,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#D0D5EA",
    fontSize: 15,
    fontFamily: "Poppins-Medium",
  },
});

export default PicToWordGame;
