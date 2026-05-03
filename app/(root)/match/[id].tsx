import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Progress from "react-native-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GameLayout from "@/components/GameLayout";
import AudioButton from "@/components/AudioButton";
import { VOICE_TO_WORD_CONTENT } from "./index";

type VoiceChoice = {
  wordid: string;
  wordtext: string;
  imagelink?: string;
};

type VoiceRound = {
  "voiceof the word link": string;
  "word choices": VoiceChoice[];
  correctwordid: string;
};

const { width } = Dimensions.get("window");
const optionSize = (width - 64) / 2;
const progressWidth = Math.max(width - 190, 120);

const sortQuestionKeys = (keys: string[]) =>
  keys.sort(
    (a, b) => Number(a.replace(/\D/g, "")) - Number(b.replace(/\D/g, "")),
  );

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const VoiceMatchLevel = () => {
  const { id } = useLocalSearchParams();
  const levelId = String(id);

  const rounds = useMemo<VoiceRound[]>(() => {
    const level =
      VOICE_TO_WORD_CONTENT.contents["voice/fidel to word game"].levels[
        levelId
      ];
    if (!level) return [];
    return sortQuestionKeys(Object.keys(level)).map((k) => level[k]);
  }, [levelId]);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
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
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const current = rounds[index] ?? null;
  const total = rounds.length;
  const accuracy = total === 0 ? 0 : correctCount / total;
  const score =
    Math.round(
      (accuracy * 80 +
        clamp01((total - wrongCount) / Math.max(total, 1)) * 20) *
        100,
    ) / 100;

  const reset = () => {
    setIndex(0);
    setSelected(null);
    setFeedback({ show: false, correct: false, message: "" });
    setCompleted(false);
    setCorrectCount(0);
    setWrongCount(0);
  };

  const onPick = (choice: VoiceChoice) => {
    if (!current || feedback.show) return;

    const ok = choice.wordid === current.correctwordid;
    setSelected(choice.wordid);

    if (ok) {
      setCorrectCount((n) => n + 1);
      setFeedback({ show: true, correct: true, message: "Correct match!" });

      setTimeout(() => {
        if (index >= rounds.length - 1) {
          setCompleted(true);
          return;
        }
        setIndex((i) => i + 1);
        setSelected(null);
        setFeedback({ show: false, correct: false, message: "" });
      }, 850);
      return;
    }

    setWrongCount((n) => n + 1);
    setFeedback({
      show: true,
      correct: false,
      message: "Try again. Listen once more.",
    });
    setTimeout(() => {
      setSelected(null);
      setFeedback({ show: false, correct: false, message: "" });
    }, 700);
  };

  if (!current && !completed) {
    return (
      <GameLayout title="Voice to Word">
        <View style={styles.centerWrap}>
          <Text style={styles.centerText}>No rounds for this level.</Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.primaryButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </GameLayout>
    );
  }

  if (completed) {
    return (
      <GameLayout title="Voice to Word Complete">
        <View style={styles.completedWrap}>
          <LinearGradient
            colors={["#3A4CA8", "#5A67D8"]}
            style={styles.completeHero}
          >
            <MaterialCommunityIcons
              name="microphone"
              size={72}
              color="#FFE08A"
            />
            <Text style={styles.completeTitle}>Well Done!</Text>
            <Text style={styles.completeSub}>
              Level {levelId.toUpperCase()} complete
            </Text>
          </LinearGradient>

          <View style={styles.metricsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{Math.round(score)}</Text>
              <Text style={styles.metricLabel}>Score</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>
                {Math.round(accuracy * 100)}%
              </Text>
              <Text style={styles.metricLabel}>Accuracy</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricValue}>{wrongCount}</Text>
              <Text style={styles.metricLabel}>Wrong</Text>
            </View>
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
    <GameLayout title={`Voice Match ${levelId.toUpperCase()}`}>
      <View style={styles.container}>
        <LinearGradient colors={["#2E3760", "#222B4D"]} style={styles.topBar}>
          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>
              Round {index + 1}/{rounds.length}
            </Text>
            <Progress.Bar
              progress={(index + 1) / Math.max(rounds.length, 1)}
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
            <Text style={styles.scoreChipText}>{correctCount}</Text>
          </View>
        </LinearGradient>

        <View style={styles.promptCard}>
          <Text style={styles.promptText}>
            Press voice, then choose the matching card.
          </Text>
          <AudioButton
            uri={current["voiceof the word link"]}
            label="Play Voice"
            style={styles.audioBtn}
          />
        </View>

        <View style={styles.grid}>
          {current["word choices"].map((choice) => {
            const picked = selected === choice.wordid;
            const good = choice.wordid === current.correctwordid;

            return (
              <TouchableOpacity
                key={choice.wordid}
                style={[
                  styles.optionCard,
                  feedback.show && picked && good && styles.optionGood,
                  feedback.show && picked && !good && styles.optionBad,
                ]}
                disabled={feedback.show}
                onPress={() => onPick(choice)}
              >
                {choice.imagelink ? (
                  <Image
                    source={{ uri: choice.imagelink }}
                    style={styles.optionImage}
                  />
                ) : (
                  <View style={styles.placeholder}>
                    <MaterialCommunityIcons
                      name="image-outline"
                      size={26}
                      color="#9BA7E8"
                    />
                  </View>
                )}
                <Text style={styles.optionText}>{choice.wordtext}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {feedback.show && (
          <View
            style={[
              styles.feedbackBox,
              feedback.correct ? styles.good : styles.bad,
            ]}
          >
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </View>
        )}
      </View>
    </GameLayout>
  );
};

export default VoiceMatchLevel;

const styles = StyleSheet.create({
  container: { flex: 1 },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    marginBottom: 10,
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
  scoreChipText: { color: "#fff", fontFamily: "Poppins-Bold", fontSize: 14 },
  promptCard: {
    backgroundColor: "#25294A",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  promptText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    marginBottom: 10,
  },
  audioBtn: { alignSelf: "flex-start", backgroundColor: "#4F6BFF" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 10,
  },
  optionCard: {
    width: optionSize,
    backgroundColor: "#2D355A",
    borderRadius: 14,
    padding: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },
  optionGood: { borderColor: "#3ACC74", backgroundColor: "#214A36" },
  optionBad: { borderColor: "#F86965", backgroundColor: "#4A2D33" },
  optionImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 8,
  },
  placeholder: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: "#1E2443",
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    textAlign: "center",
    paddingBottom: 4,
  },
  feedbackBox: {
    marginTop: 12,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  feedbackText: { color: "#fff", fontFamily: "Poppins-SemiBold", fontSize: 13 },
  good: { backgroundColor: "rgba(46,139,87,0.35)" },
  bad: { backgroundColor: "rgba(187,77,94,0.35)" },
  completedWrap: { flex: 1, justifyContent: "center" },
  completeHero: {
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 20,
    marginBottom: 12,
  },
  completeTitle: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 28,
    marginTop: 8,
  },
  completeSub: {
    color: "rgba(255,255,255,0.9)",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
  },
  metricsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  metricCard: {
    flex: 1,
    backgroundColor: "#2D3458",
    borderRadius: 12,
    alignItems: "center",
    paddingVertical: 10,
  },
  metricValue: { color: "#fff", fontFamily: "Poppins-Bold", fontSize: 20 },
  metricLabel: {
    color: "#BBC0DB",
    fontFamily: "Poppins-Regular",
    fontSize: 11,
  },
  primaryButton: {
    backgroundColor: "#4F6BFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  primaryButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#7C87C9",
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#DCE2FF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
});
