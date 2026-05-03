import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  PanResponder,
  LayoutRectangle,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import GameLayout from "@/components/GameLayout";
import AudioButton from "@/components/AudioButton";
import { FILL_IN_THE_BLANK_CONTENT } from "./index";

type FillBlankLevel = {
  "full paragraph": string;
  "blank space paragraph": string;
  "voice reading the full paragraph link": string;
  choices: string[];
};

const tokenizeParagraph = (text: string) =>
  text.split(/(__\d+__)/g).filter(Boolean);
const blankKeys = (text: string) => text.match(/__\d+__/g) ?? [];
const normalize = (text: string) =>
  text.replace(/\s+/g, " ").trim().toLowerCase();

const DraggableWord = ({
  word,
  onDrop,
  disabled,
}: {
  word: string;
  onDrop: (word: string, x: number, y: number) => void;
  disabled?: boolean;
}) => {
  const pan = useRef(new Animated.ValueXY()).current;

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !disabled && (Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4),
        onPanResponderGrant: () => {
          pan.extractOffset();
        },
        onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
          useNativeDriver: false,
        }),
        onPanResponderRelease: (_, gesture) => {
          pan.flattenOffset();
          onDrop(word, gesture.moveX, gesture.moveY);
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
        onPanResponderTerminate: () => {
          pan.flattenOffset();
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      }),
    [disabled, onDrop, pan, word],
  );

  return (
    <Animated.View
      {...responder.panHandlers}
      style={[styles.wordChip, { transform: pan.getTranslateTransform() }]}
    >
      <Text style={styles.wordText}>{word}</Text>
    </Animated.View>
  );
};

const FillInBlankLevel = () => {
  const { id } = useLocalSearchParams();
  const levelId = String(id);

  const level = useMemo<FillBlankLevel | null>(() => {
    return (
      FILL_IN_THE_BLANK_CONTENT.contents["fill in the blank"].levels[levelId] ??
      null
    );
  }, [levelId]);

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const blankRects = useRef<Record<string, LayoutRectangle>>({});

  if (!level) {
    return (
      <GameLayout title="Fill in the Blank">
        <View style={styles.centerWrap}>
          <Text style={styles.centerText}>Level not found.</Text>
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

  const blanks = blankKeys(level["blank space paragraph"]);
  const tokens = tokenizeParagraph(level["blank space paragraph"]);
  const usedWords = new Set(Object.values(answers));
  const availableWords = level.choices.filter((word) => !usedWords.has(word));
  const canSubmit = blanks.every((b) => Boolean(answers[b]));

  const assembled = tokens
    .map((token) => {
      if (!token.startsWith("__")) return token;
      return answers[token] ?? token;
    })
    .join("");

  const setBlankRef = (key: string) => (node: View | null) => {
    if (!node) return;
    requestAnimationFrame(() => {
      node.measureInWindow((x, y, width, height) => {
        blankRects.current[key] = { x, y, width, height };
      });
    });
  };

  const handleDrop = (word: string, x: number, y: number) => {
    if (submitted) return;

    const matchedBlank = Object.entries(blankRects.current).find(([, rect]) => {
      const withinX = x >= rect.x && x <= rect.x + rect.width;
      const withinY = y >= rect.y && y <= rect.y + rect.height;
      return withinX && withinY;
    });

    if (!matchedBlank) return;

    const [blankKey] = matchedBlank;
    setAnswers((prev) => ({
      ...prev,
      [blankKey]: word,
    }));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const ok = normalize(assembled) === normalize(level["full paragraph"]);
    setIsCorrect(ok);
    setSubmitted(true);
  };

  const reset = () => {
    setAnswers({});
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <GameLayout title={`Fill in Blank ${levelId.toUpperCase()}`}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient colors={["#2E3760", "#222B4D"]} style={styles.topCard}>
          <Text style={styles.topTitle}>Listen First</Text>
          <Text style={styles.topSub}>
            Play the paragraph audio, then drag each word into the blank slots.
          </Text>
          <AudioButton
            uri={level["voice reading the full paragraph link"]}
            label="Play Paragraph"
            style={styles.audioBtn}
          />
        </LinearGradient>

        {/* Instructions moved to level selection screen */}

        <View style={styles.paragraphCard}>
          <Text style={styles.paragraphLabel}>Blank Paragraph</Text>
          <View style={styles.paragraphWrap}>
            {tokens.map((token, idx) => {
              const isBlank = token.startsWith("__");
              if (!isBlank) {
                return (
                  <Text key={`${token}-${idx}`} style={styles.paragraphText}>
                    {token}
                  </Text>
                );
              }

              const filled = answers[token];
              return (
                <View
                  key={token}
                  ref={setBlankRef(token)}
                  collapsable={false}
                  style={[styles.blankChip, filled && styles.blankFilled]}
                >
                  <Text style={styles.blankText}>{filled || "_____"}</Text>
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.wordBankCard}>
          <Text style={styles.wordBankTitle}>Word Choices</Text>
          <View style={styles.wordRow}>
            {availableWords.map((word) => (
              <DraggableWord
                key={word}
                word={word}
                onDrop={handleDrop}
                disabled={submitted}
              />
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, !canSubmit && styles.disabledBtn]}
          disabled={!canSubmit || submitted}
          onPress={handleSubmit}
        >
          <Text style={styles.primaryButtonText}>Check Answer</Text>
        </TouchableOpacity>

        {submitted && (
          <View
            style={[styles.feedbackCard, isCorrect ? styles.good : styles.bad]}
          >
            <Text style={styles.feedbackTitle}>
              {isCorrect ? "Great job!" : "Not yet"}
            </Text>
            <Text style={styles.feedbackLine}>
              {isCorrect
                ? "You completed the paragraph correctly."
                : "Compare and try again."}
            </Text>
            {!isCorrect && (
              <Text style={styles.feedbackLine}>
                Correct paragraph: {level["full paragraph"]}
              </Text>
            )}
            <TouchableOpacity style={styles.secondaryButton} onPress={reset}>
              <Text style={styles.secondaryButtonText}>
                {isCorrect ? "Play Again" : "Try Again"}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </GameLayout>
  );
};

export default FillInBlankLevel;

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center" },
  centerText: {
    color: "#fff",
    fontFamily: "Poppins-Medium",
    fontSize: 15,
    marginBottom: 10,
  },
  topCard: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
  },
  topTitle: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    marginBottom: 4,
  },
  topSub: {
    color: "#D8DEF9",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  audioBtn: { alignSelf: "flex-start", backgroundColor: "#4F6BFF" },
  instructionsCard: {
    backgroundColor: "#262B52",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  instructionsTitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    marginBottom: 6,
  },
  instructionsText: {
    color: "#D5DBF8",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginBottom: 2,
  },
  paragraphCard: {
    backgroundColor: "#25294A",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  paragraphLabel: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  paragraphWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
  },
  paragraphText: {
    color: "#E2E5FF",
    fontFamily: "Abyssinica_SIL",
    fontSize: 20,
    lineHeight: 30,
  },
  blankChip: {
    minWidth: 72,
    borderRadius: 10,
    paddingVertical: 6,
    paddingHorizontal: 8,
    backgroundColor: "#1E2443",
    borderWidth: 1,
    borderColor: "#6A74B6",
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
  },
  blankFilled: {
    backgroundColor: "#364088",
    borderColor: "#8FA4FF",
  },
  blankText: {
    color: "#fff",
    textAlign: "center",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
  },
  wordBankCard: {
    backgroundColor: "#25294A",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  wordBankTitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
    marginBottom: 8,
  },
  wordRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  wordChip: {
    backgroundColor: "#343A6A",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  wordText: { color: "#fff", fontFamily: "Poppins-SemiBold", fontSize: 13 },
  primaryButton: {
    backgroundColor: "#4F6BFF",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  disabledBtn: { opacity: 0.5 },
  primaryButtonText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 14,
  },
  feedbackCard: {
    borderRadius: 14,
    padding: 12,
  },
  good: { backgroundColor: "rgba(46,139,87,0.35)" },
  bad: { backgroundColor: "rgba(187,77,94,0.35)" },
  feedbackTitle: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  feedbackLine: {
    color: "#E0E6FF",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    marginBottom: 4,
  },
  secondaryButton: {
    marginTop: 8,
    alignSelf: "flex-start",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#99A7F2",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    color: "#DCE2FF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 12,
  },
});
