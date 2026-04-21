import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GameLayout from "@/components/GameLayout";
import AudioButton from "@/components/AudioButton";
import { FILL_IN_THE_BLANK_CONTENT } from "./index";

type FillBlankLevel = {
  fullParagraph: string;
  blankParagraph: string;
  voiceReadingLink: string;
  choices: string[];
};

const tokenizeParagraph = (text: string) =>
  text.split(/(__\d+__)/g).filter(Boolean);
const blankKeys = (text: string) => text.match(/__\d+__/g) ?? [];
const normalize = (text: string) =>
  text.replace(/\s+/g, " ").trim().toLowerCase();

const FillInBlankLevel = () => {
  const { id } = useLocalSearchParams();
  const levelId = String(id);

  const level = useMemo<FillBlankLevel | null>(() => {
    return (
      FILL_IN_THE_BLANK_CONTENT.contents["fill in the blank"].levels[levelId] ??
      null
    );
  }, [levelId]);

  const [pickedWord, setPickedWord] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

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

  const blanks = blankKeys(level.blankParagraph);
  const tokens = tokenizeParagraph(level.blankParagraph);
  const usedWords = new Set(Object.values(answers));
  const availableWords = level.choices.filter((word) => !usedWords.has(word));

  const canSubmit = blanks.every((b) => Boolean(answers[b]));

  const assembled = tokens
    .map((token) => {
      if (!token.startsWith("__")) return token;
      return answers[token] ?? token;
    })
    .join("");

  const handleDropToBlank = (blank: string) => {
    if (!pickedWord || submitted) return;

    const previous = answers[blank];
    setAnswers((prev) => ({
      ...prev,
      [blank]: pickedWord,
    }));

    setPickedWord(previous ?? null);
  };

  const handleSubmit = () => {
    if (!canSubmit) return;
    const ok = normalize(assembled) === normalize(level.fullParagraph);
    setIsCorrect(ok);
    setSubmitted(true);
  };

  const reset = () => {
    setPickedWord(null);
    setAnswers({});
    setSubmitted(false);
    setIsCorrect(false);
  };

  return (
    <GameLayout title={`Fill in Blank ${levelId.toUpperCase()}`}>
      <ScrollView contentContainerStyle={styles.container}>
        <LinearGradient colors={["#2E3760", "#222B4D"]} style={styles.topCard}>
          <Text style={styles.topTitle}>Listen First</Text>
          <Text style={styles.topSub}>
            Play the paragraph audio, then place words into blanks.
          </Text>
          <AudioButton
            uri={level.voiceReadingLink}
            label="Play Paragraph"
            style={styles.audioBtn}
          />
        </LinearGradient>

        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Drag and Drop Mode</Text>
          <Text style={styles.instructionsText}>
            1) Tap a word to pick it up.
          </Text>
          <Text style={styles.instructionsText}>
            2) Tap a blank slot to drop it.
          </Text>
          <Text style={styles.instructionsText}>
            3) Tap filled slot to replace words.
          </Text>
        </View>

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
                <TouchableOpacity
                  key={token}
                  style={[styles.blankChip, filled && styles.blankFilled]}
                  onPress={() => handleDropToBlank(token)}
                  disabled={submitted}
                >
                  <Text style={styles.blankText}>{filled || "_____"}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.wordBankCard}>
          <Text style={styles.wordBankTitle}>Word Choices</Text>
          <View style={styles.wordRow}>
            {pickedWord && (
              <TouchableOpacity
                style={styles.pickedWordChip}
                onPress={() => setPickedWord(null)}
              >
                <Text style={styles.pickedWordText}>Holding: {pickedWord}</Text>
              </TouchableOpacity>
            )}

            {availableWords.map((word) => (
              <TouchableOpacity
                key={word}
                style={[
                  styles.wordChip,
                  pickedWord === word && styles.wordChipActive,
                ]}
                onPress={() => setPickedWord(word)}
                disabled={submitted}
              >
                <Text style={styles.wordText}>{word}</Text>
              </TouchableOpacity>
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
                Correct paragraph: {level.fullParagraph}
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "#1E2443",
    borderWidth: 1,
    borderColor: "#6A74B6",
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
  wordChipActive: { backgroundColor: "#5A67D8" },
  wordText: { color: "#fff", fontFamily: "Poppins-SemiBold", fontSize: 13 },
  pickedWordChip: {
    backgroundColor: "#4F6BFF",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  pickedWordText: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 13,
  },
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
