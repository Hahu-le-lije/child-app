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
  page1?: StoryPage;
  page2?: StoryPage;
  page3?: StoryPage;
  page4?: StoryPage;
  questions: Record<string, StoryQuestion>;
  keywordInfo: Record<string, StoryKeywordInfo>;
};

type StoryGameContent = {
  contents: {
    story: {
      stories: Record<string, StoryItem>;
    };
  };
};

const STORY_GAME_CONTENT: StoryGameContent = {
  contents: {
    story: {
      stories: {
        story_1: {
          title: "The Lion and the Mouse",
          pagecount: 3,
          thumbnaillink:
            "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=900",
          page1: {
            storytext:
              "One warm afternoon, a lion was sleeping under a tree in the forest.",
            keywords: ["lion", "forest"],
            imagelink:
              "https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=1200",
          },
          page2: {
            storytext:
              "A tiny mouse ran across the lion's paw and woke him up. The lion was angry, but the mouse asked for mercy.",
            keywords: ["mouse", "mercy"],
            imagelink:
              "https://images.unsplash.com/photo-1598751337485-41099df6c7f6?w=1200",
          },
          page3: {
            storytext:
              "Later, the lion was trapped in a hunter's net. The mouse chewed the ropes and saved the lion.",
            keywords: ["hunter", "saved"],
            imagelink:
              "https://images.unsplash.com/photo-1474511320723-9a56873867b5?w=1200",
          },
          questions: {
            question1: {
              text: "Who helped the lion at the end?",
              choices: ["A bird", "The mouse", "A hunter", "Another lion"],
              correctanswer: "The mouse",
            },
            question2: {
              text: "Where was the lion trapped?",
              choices: ["In a cave", "In a net", "In a river", "In a house"],
              correctanswer: "In a net",
            },
          },
          keywordInfo: {
            lion: {
              meaning: "A big wild cat known as the king of the jungle.",
              pronunciation: "LAI-uhn",
              example: "The lion roared loudly.",
            },
            forest: {
              meaning: "A large area full of trees and plants.",
              pronunciation: "FOR-ist",
              example: "We walked through the forest.",
            },
            mouse: {
              meaning: "A very small animal with a long tail.",
              pronunciation: "maws",
              example: "The mouse ran quickly.",
            },
            mercy: {
              meaning: "Kindness shown to someone who is in your power.",
              pronunciation: "MUR-see",
              example: "She asked for mercy.",
            },
            hunter: {
              meaning: "A person who catches or kills animals.",
              pronunciation: "HUN-ter",
              example: "The hunter set a trap.",
            },
            saved: {
              meaning: "Helped someone stay safe from danger.",
              pronunciation: "sayvd",
              example: "He saved his friend.",
            },
          },
        },
        story_2: {
          title: "The Honest Woodcutter",
          pagecount: 3,
          thumbnaillink:
            "https://images.unsplash.com/photo-1472396961693-142e6e269027?w=900",
          page1: {
            storytext:
              "A woodcutter worked by the river every day with his old axe.",
            keywords: ["woodcutter", "axe"],
            imagelink:
              "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200",
          },
          page2: {
            storytext:
              "One day, his axe slipped and fell into the deep river. He felt very sad.",
            keywords: ["river", "deep"],
            imagelink:
              "https://images.unsplash.com/photo-1505764706515-aa95265c5abc?w=1200",
          },
          page3: {
            storytext:
              "A spirit rewarded his honesty and returned his axe. He went home happily.",
            keywords: ["spirit", "honesty"],
            imagelink:
              "https://images.unsplash.com/photo-1511497584788-876760111969?w=1200",
          },
          questions: {
            question1: {
              text: "What did the woodcutter lose?",
              choices: ["His hat", "His axe", "His shoes", "His bag"],
              correctanswer: "His axe",
            },
            question2: {
              text: "Why was he rewarded?",
              choices: [
                "For running fast",
                "For honesty",
                "For singing",
                "For fishing",
              ],
              correctanswer: "For honesty",
            },
          },
          keywordInfo: {
            woodcutter: {
              meaning: "A person who cuts wood from trees.",
              pronunciation: "WOOD-kuh-ter",
              example: "The woodcutter carried logs.",
            },
            axe: {
              meaning: "A tool with a sharp blade used for cutting wood.",
              pronunciation: "aks",
              example: "He sharpened his axe.",
            },
            river: {
              meaning: "A natural stream of flowing water.",
              pronunciation: "RIV-er",
              example: "Fish swim in the river.",
            },
            deep: {
              meaning: "Going far down from the top.",
              pronunciation: "deep",
              example: "The well is very deep.",
            },
            spirit: {
              meaning: "A magical being in stories.",
              pronunciation: "SPIR-it",
              example: "The spirit appeared in the light.",
            },
            honesty: {
              meaning: "Telling the truth and being fair.",
              pronunciation: "ON-uh-stee",
              example: "Honesty builds trust.",
            },
          },
        },
      },
    },
  },
};

const getStoryPages = (story: StoryItem): StoryPage[] =>
  [story.page1, story.page2, story.page3, story.page4].filter(
    Boolean,
  ) as StoryPage[];

const getStoryQuestions = (story: StoryItem): StoryQuestion[] =>
  Object.values(story.questions ?? {});

const { width } = Dimensions.get("window");
const progressWidth = Math.max(width - 170, 120);
const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

const StoryQuizLevel = () => {
  const { id } = useLocalSearchParams();
  const storyId = String(id);
  const user = useAuthStore((s) => s.user);

  const story = useMemo<StoryItem | null>(() => {
    return STORY_GAME_CONTENT.contents.story.stories[storyId] ?? null;
  }, [storyId]);

  const pages = useMemo(() => (story ? getStoryPages(story) : []), [story]);
  const questions = useMemo(
    () => (story ? getStoryQuestions(story) : []),
    [story],
  );

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

  const totalQuestions = questions.length;
  const accuracy = totalQuestions === 0 ? 0 : correctCount / totalQuestions;
  const score =
    Math.round(
      (accuracy * 80 +
        clamp01((totalQuestions - wrongCount) / Math.max(totalQuestions, 1)) *
          20) *
        100,
    ) / 100;

  const isPremium = Boolean(user?.isPremium || user?.plan === "premium");
  const currentPage = pages[pageIndex] ?? pages[0] ?? null;
  const currentQuestion = questions[qIndex] ?? questions[0] ?? null;
  const selectedKeywordInfo = openKeyword ? story.keywordInfo[openKeyword] : null;

  const goNextPage = () => {
    if (pageIndex >= pages.length - 1) {
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
      setFeedback(`Try again. Correct answer: ${currentQuestion.correctanswer}`);
    }

    setTimeout(() => {
      if (qIndex >= questions.length - 1) {
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
              <Text style={styles.metricValue}>{Math.round(accuracy * 100)}%</Text>
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
                Question {qIndex + 1}/{questions.length}
              </Text>
              <Progress.Bar
                progress={(qIndex + 1) / Math.max(questions.length, 1)}
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
            <Text style={styles.quizPrompt}>
              {currentQuestion?.text ?? "Quiz questions are unavailable."}
            </Text>
            {(currentQuestion?.choices ?? []).map((choice) => {
              const picked = selectedChoice === choice;
              const good = choice === currentQuestion?.correctanswer;

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
              Page {pageIndex + 1}/{pages.length}
            </Text>
            <Progress.Bar
              progress={(pageIndex + 1) / Math.max(pages.length, 1)}
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
          {currentPage ? (
            <>
              <Image
                source={{ uri: currentPage.imagelink }}
                style={styles.pageImage}
                resizeMode="cover"
              />

              {/* Render story text with first occurrence of each keyword clickable */}
              <Text style={styles.storyText}>
                {(() => {
                  const kws = new Set(
                    (currentPage.keywords ?? []).map((k) => k.toLowerCase()),
                  );
                  const used = new Set<string>();
                  const parts = currentPage.storytext.split(/(\s+)/);
                  return parts.map((part, i) => {
                    const normalized = part
                      .replace(/'s$/i, "")
                      .replace(/[^a-zA-Z]/g, "")
                      .toLowerCase();

                    if (kws.has(normalized) && !used.has(normalized)) {
                      used.add(normalized);
                      return (
                        <Text
                          key={`${normalized}-${i}`}
                          onPress={() => setOpenKeyword(normalized)}
                          style={styles.keywordInline}
                        >
                          {part}
                        </Text>
                      );
                    }

                    return (
                      <Text key={`p-${i}`} style={styles.storyTextPart}>
                        {part}
                      </Text>
                    );
                  });
                })()}
              </Text>
            </>
          ) : (
            <Text style={styles.centerText}>Story pages are unavailable.</Text>
          )}

          <View style={styles.pageButtons}>
            <TouchableOpacity
              style={[styles.secondaryButton, pageIndex === 0 && styles.disabledBtn]}
              disabled={pageIndex === 0}
              onPress={() => setPageIndex((p) => Math.max(0, p - 1))}
            >
              <Text style={styles.secondaryButtonText}>Previous</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryButton} onPress={goNextPage}>
              <Text style={styles.primaryButtonText}>
                {pageIndex >= pages.length - 1 ? "Start Quiz" : "Next Page"}
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
  storyTextPart: {
    color: "#E2E5FF",
    fontFamily: "Abyssinica_SIL",
    fontSize: 22,
    lineHeight: 32,
  },
  keywordInline: {
    color: "#FFD27A",
    textDecorationLine: "underline",
    fontFamily: "Abyssinica_SIL",
    fontSize: 22,
    lineHeight: 32,
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
