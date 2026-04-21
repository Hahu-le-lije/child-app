import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as Progress from "react-native-progress";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GameLayout from "@/components/GameLayout";
import { useAuthStore } from "@/store/authStore";
import { STORY_GAME_CONTENT } from "./index";

type StoryKeywordInfo = {
  meaning: string;
  pronunciation: string;
  example: string;
};

type StoryPage = {
  storytext: string;
  keywords: string[];
  imagelink: string;
};

type StoryQuestion = {
  text: string;
  choices: string[];
  correctanswer: string;
};

type StoryItem = {
  title: string;
  pagecount: number;
  thumbnaillink: string;
  pages: StoryPage[];
  questions: StoryQuestion[];
  keywordInfo: Record<string, StoryKeywordInfo>;
};

const { width } = Dimensions.get("window");
const progressWidth = Math.max(width - 170, 120);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const StoryQuizLevel = () => {
  const { id } = useLocalSearchParams();
  const storyId = String(id);
  const user = useAuthStore((s) => s.user);

  const story = useMemo<StoryItem | null>(() => {
    const data = STORY_GAME_CONTENT.contents.story.stories[storyId];
    return data ?? null;
  }, [storyId]);

  const [phase, setPhase] = useState<"reading" | "quiz" | "completed">(
    "reading",
  );
  const [pageIndex, setPageIndex] = useState(0);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("");
  const [openKeyword, setOpenKeyword] = useState<string | null>(null);

  if (!story) {
    return (
      <GameLayout title="Story Quiz">
        <View style={styles.centerWrap}>
          <Text style={styles.centerText}>Story not found.</Text>
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

  const totalQuestions = story.questions.length;
  const accuracy = totalQuestions === 0 ? 0 : correctCount / totalQuestions;
  const score =
    Math.round(
      (accuracy * 80 +
        clamp01((totalQuestions - wrongCount) / Math.max(totalQuestions, 1)) *
          20) *
        100,
    ) / 100;

  const isPremium = Boolean(user?.isPremium || user?.plan === "premium");
  const currentPage = story.pages[pageIndex];
  const currentQuestion = story.questions[qIndex];
  const selectedKeywordInfo = openKeyword
    ? story.keywordInfo[openKeyword]
    : null;

  const goNextPage = () => {
    if (pageIndex >= story.pages.length - 1) {
      setPhase("quiz");
      return;
    }
    setPageIndex((p) => p + 1);
  };

  const handleChoice = (choice: string) => {
    if (!currentQuestion || selectedChoice) return;

    setSelectedChoice(choice);
    const isCorrect = choice === currentQuestion.correctanswer;
    if (isCorrect) {
      setCorrectCount((n) => n + 1);
      setFeedback("Correct answer!");
    } else {
      setWrongCount((n) => n + 1);
      setFeedback(
        `Try again. Correct answer: ${currentQuestion.correctanswer}`,
      );
    }

    setTimeout(() => {
      if (qIndex >= story.questions.length - 1) {
        setPhase("completed");
        return;
      }
      setQIndex((i) => i + 1);
      setSelectedChoice(null);
      setFeedback("");
    }, 950);
  };

  if (phase === "completed") {
    return (
      <GameLayout title="Story Complete">
        <View style={styles.completedWrap}>
          <LinearGradient
            colors={["#3A4CA8", "#5A67D8"]}
            style={styles.completeHero}
          >
            <MaterialCommunityIcons
              name="book-open-page-variant"
              size={74}
              color="#FFE08A"
            />
            <Text style={styles.completeTitle}>Great Reading!</Text>
            <Text style={styles.completeSub}>{story.title}</Text>
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

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => {
              setPhase("reading");
              setPageIndex(0);
              setQIndex(0);
              setCorrectCount(0);
              setWrongCount(0);
              setSelectedChoice(null);
              setFeedback("");
            }}
          >
            <Text style={styles.primaryButtonText}>Play Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => router.back()}
          >
            <Text style={styles.secondaryButtonText}>Back to Stories</Text>
          </TouchableOpacity>
        </View>
      </GameLayout>
    );
  }

  if (phase === "quiz") {
    return (
      <GameLayout title="Story Questions">
        <View style={styles.container}>
          <LinearGradient colors={["#2E3760", "#222B4D"]} style={styles.topBar}>
            <View style={styles.progressWrap}>
              <Text style={styles.progressLabel}>
                Question {qIndex + 1}/{story.questions.length}
              </Text>
              <Progress.Bar
                progress={(qIndex + 1) / Math.max(story.questions.length, 1)}
                width={progressWidth}
                color="#7FD1FF"
                unfilledColor="rgba(255,255,255,0.2)"
                borderWidth={0}
                borderRadius={999}
                height={10}
              />
            </View>
          </LinearGradient>

          <View style={styles.quizCard}>
            <Text style={styles.quizPrompt}>{currentQuestion.text}</Text>
            {currentQuestion.choices.map((choice) => {
              const picked = selectedChoice === choice;
              const good = choice === currentQuestion.correctanswer;

              return (
                <TouchableOpacity
                  key={choice}
                  style={[
                    styles.choice,
                    picked && good && styles.choiceGood,
                    picked && !good && styles.choiceBad,
                  ]}
                  activeOpacity={0.88}
                  disabled={Boolean(selectedChoice)}
                  onPress={() => handleChoice(choice)}
                >
                  <Text style={styles.choiceText}>{choice}</Text>
                </TouchableOpacity>
              );
            })}

            {!!feedback && <Text style={styles.feedbackText}>{feedback}</Text>}
          </View>
        </View>
      </GameLayout>
    );
  }

  return (
    <GameLayout title={story.title}>
      <View style={styles.container}>
        <LinearGradient colors={["#2E3760", "#222B4D"]} style={styles.topBar}>
          <View style={styles.progressWrap}>
            <Text style={styles.progressLabel}>
              Page {pageIndex + 1}/{story.pagecount}
            </Text>
            <Progress.Bar
              progress={(pageIndex + 1) / Math.max(story.pagecount, 1)}
              width={progressWidth}
              color="#7FD1FF"
              unfilledColor="rgba(255,255,255,0.2)"
              borderWidth={0}
              borderRadius={999}
              height={10}
            />
          </View>
        </LinearGradient>

        <ScrollView
          contentContainerStyle={styles.readingContent}
          showsVerticalScrollIndicator={false}
        >
          <Image
            source={{ uri: currentPage.imagelink }}
            style={styles.pageImage}
            resizeMode="cover"
          />
          <Text style={styles.storyText}>{currentPage.storytext}</Text>

          <Text style={styles.keywordsTitle}>Tap Keywords</Text>
          <View style={styles.keywordRow}>
            {currentPage.keywords.map((kw) => (
              <TouchableOpacity
                key={kw}
                style={styles.keywordChip}
                onPress={() => setOpenKeyword(kw)}
              >
                <Text style={styles.keywordText}>{kw}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.pageButtons}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                pageIndex === 0 && styles.disabledBtn,
              ]}
              disabled={pageIndex === 0}
              onPress={() => setPageIndex((p) => Math.max(0, p - 1))}
            >
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={goNextPage}>
              <Text style={styles.primaryButtonText}>
                {pageIndex >= story.pages.length - 1
                  ? "Start Quiz"
                  : "Next Page"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <Modal
          visible={Boolean(openKeyword)}
          transparent
          animationType="fade"
          onRequestClose={() => setOpenKeyword(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{openKeyword}</Text>

              {!isPremium ? (
                <>
                  <Text style={styles.modalLine}>
                    Keyword helper is available for premium users.
                  </Text>
                  <Text style={styles.modalLine}>
                    Upgrade to see meaning, pronunciation, and examples.
                  </Text>
                </>
              ) : selectedKeywordInfo ? (
                <>
                  <Text style={styles.modalLine}>
                    Meaning: {selectedKeywordInfo.meaning}
                  </Text>
                  <Text style={styles.modalLine}>
                    Pronunciation: {selectedKeywordInfo.pronunciation}
                  </Text>
                  <Text style={styles.modalLine}>
                    Example: {selectedKeywordInfo.example}
                  </Text>
                </>
              ) : (
                <Text style={styles.modalLine}>
                  Definition will be provided by game engine.
                </Text>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => setOpenKeyword(null)}
              >
                <Text style={styles.primaryButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </GameLayout>
  );
};

export default StoryQuizLevel;

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
    marginBottom: 12,
  },
  progressWrap: { flex: 1 },
  progressLabel: {
    color: "#fff",
    marginBottom: 8,
    fontSize: 13,
    fontFamily: "Poppins-SemiBold",
  },
  readingContent: { paddingBottom: 18 },
  pageImage: {
    width: "100%",
    height: 180,
    borderRadius: 14,
    marginBottom: 12,
  },
  storyText: {
    color: "#E2E5FF",
    fontFamily: "Abyssinica_SIL",
    fontSize: 22,
    lineHeight: 32,
    marginBottom: 14,
  },
  keywordsTitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
    marginBottom: 8,
  },
  keywordRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 18,
  },
  keywordChip: {
    backgroundColor: "#384072",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  keywordText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 12,
  },
  pageButtons: {
    flexDirection: "row",
    gap: 10,
  },
  quizCard: {
    backgroundColor: "#25294A",
    borderRadius: 16,
    padding: 14,
  },
  quizPrompt: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 17,
    marginBottom: 12,
    lineHeight: 24,
  },
  choice: {
    backgroundColor: "#343A6A",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  choiceGood: { backgroundColor: "#2E8B57" },
  choiceBad: { backgroundColor: "#BB4D5E" },
  choiceText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  feedbackText: {
    color: "#D6E2FF",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    marginTop: 4,
  },
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
    flex: 1,
    backgroundColor: "#4F6BFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  secondaryButton: {
    flex: 1,
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
  disabledBtn: { opacity: 0.5 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#232846",
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  modalTitle: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginBottom: 6,
    textTransform: "capitalize",
  },
  modalLine: {
    color: "#D8DCF8",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    lineHeight: 20,
  },
});
