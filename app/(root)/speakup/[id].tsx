import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Animated,
} from "react-native";
import { COLORS, FONTS } from "@/const";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";
import { useSpeechScoring } from "@/services/gaming/useSpeechScoring";
import WordDetailSheet from "@/components/WordDetailSheet";
import { useWordDetails } from "@/services/gaming/useWordDetails";
import { useLanguageStore } from "@/store/languageStore";
import { getGameContent } from "@/services/cms/gameContentService";
import { t } from "@/services/locales";

type PronunciationRow = {
  word: string;
  audioUrl: string;
  imageUrl: string;
};

const Speakup = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const levelId = String(id ?? "");
  const language = useLanguageStore((state) => state.language);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [currentGame, setCurrentGame] = useState<PronunciationRow | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    phase,
    isRecording,
    isProcessing,
    isBusy,
    recordingProgress,
    maxRecordingMs,
    beginRecording,
    prepareRecording,
    endRecording,
    cancelRecording,
    lastScore,
  } = useSpeechScoring();

  const { fetchExplanation, explanation, loading: detailsLoading, error, clearExplanation } =
    useWordDetails();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const pulseLoopRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const rows = (await getGameContent("pronunciation", levelId)) as PronunciationRow[];
        if (!active) return;
        setCurrentGame(rows[0] ?? null);
      } catch (e) {
        console.error("speakup load failed", e);
        if (active) setCurrentGame(null);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [levelId]);

  useEffect(() => {
    if (isRecording) {
      pulseLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.14,
            duration: 450,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      );
      pulseLoopRef.current.start();
    } else {
      pulseLoopRef.current?.stop();
      pulseAnim.setValue(1);
    }
    return () => {
      pulseLoopRef.current?.stop();
    };
  }, [isRecording, pulseAnim]);

  const playPronunciation = async () => {
    if (!currentGame?.audioUrl || isBusy) return;
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: currentGame.audioUrl });
      await sound.playAsync();
    } catch {
      console.warn("Could not play pronunciation audio");
    }
  };

  const handleRecordPressIn = async () => {
    if (!currentGame?.word || isBusy) return;
    prepareRecording(currentGame.word, levelId);
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await beginRecording();
  };

  const handleRecordPressOut = async () => {
    if (!currentGame?.word || !isRecording) return;
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await endRecording(currentGame.word, levelId);
  };

  const handleWordTap = async () => {
    if (!currentGame?.word) return;
    setSelectedWord(currentGame.word);
    await fetchExplanation(currentGame.word, language);
  };

  const instructionText = (() => {
    if (isProcessing) return t(language, "gameUi.speakupProcessing");
    if (isRecording) return t(language, "gameUi.speakupRecording");
    return t(language, "gameUi.speakupHoldToRecord");
  })();

  const subInstructionText = isRecording
    ? t(language, "gameUi.speakupReleaseToSend")
    : !isProcessing
      ? t(language, "gameUi.speakupTapSpeaker")
      : "";

  const secondsLeft = Math.max(
    0,
    Math.ceil((maxRecordingMs - recordingProgress * maxRecordingMs) / 1000),
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={styles.subheader}>Loading word…</Text>
      </SafeAreaView>
    );
  }

  if (!currentGame) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={styles.subheader}>Download a pronunciation pack first.</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={{ color: COLORS.primary }}>Go back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Speak Up!</Text>
          <Text style={styles.subheader}>Level {levelId}</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.imageCard}>
          {currentGame.imageUrl ? (
            <Image
              source={{ uri: currentGame.imageUrl }}
              style={styles.mainImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.mainImage, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={64} color={COLORS.muted} />
            </View>
          )}

          <Pressable
            style={[styles.speakerFloatingButton, isBusy && styles.disabledControl]}
            onPress={playPronunciation}
            disabled={isBusy}
          >
            <Ionicons name="volume-high" size={30} color="#fff" />
          </Pressable>
        </View>

        <View style={styles.wordSection}>
          <Pressable onPress={handleWordTap}>
            <Text style={styles.wordText}>{currentGame.word}</Text>
          </Pressable>
          {lastScore !== null && !isBusy && (
            <Text
              style={[
                styles.feedbackText,
                { color: lastScore > 70 ? "#4ADE80" : "#FB923C" },
              ]}
            >
              {lastScore > 70 ? "Excellent! 🌟" : "Keep Trying! 💪"} ({lastScore}%)
            </Text>
          )}
        </View>

        <View style={styles.actionSection}>
          <View
            style={[
              styles.statusBanner,
              isRecording && styles.statusBannerRecording,
              isProcessing && styles.statusBannerProcessing,
            ]}
          >
            {isRecording && (
              <View style={styles.recordingDot} />
            )}
            {isProcessing && (
              <ActivityIndicator size="small" color={COLORS.primary} style={styles.statusSpinner} />
            )}
            <Text
              style={[
                styles.instruction,
                isRecording && styles.instructionRecording,
                isProcessing && styles.instructionProcessing,
              ]}
            >
              {instructionText}
            </Text>
          </View>

          {!!subInstructionText && (
            <Text style={styles.subInstruction}>{subInstructionText}</Text>
          )}

          {isRecording && (
            <View style={styles.progressTrack}>
              <View
                style={[styles.progressFill, { width: `${recordingProgress * 100}%` }]}
              />
            </View>
          )}

          {isRecording && (
            <Text style={styles.countdownText}>
              {secondsLeft}s {t(language, "gameUi.speakupReleaseToSend").toLowerCase()}
            </Text>
          )}

          <Pressable
            onPressIn={() => void handleRecordPressIn()}
            onPressOut={() => void handleRecordPressOut()}
            onPress={() => {
              if (isRecording) void handleRecordPressOut();
            }}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.recordButton,
              isRecording && styles.recordButtonActive,
              isProcessing && styles.recordButtonDisabled,
              pressed && !isProcessing && styles.recordButtonPressed,
            ]}
          >
            <Animated.View
              style={[
                styles.recordOuter,
                isRecording && styles.recordOuterActive,
                { transform: [{ scale: isRecording ? pulseAnim : 1 }] },
              ]}
            >
              <View style={styles.recordInner}>
                {isProcessing ? (
                  <ActivityIndicator color="#fff" size="large" />
                ) : (
                  <Ionicons
                    name={isRecording ? "mic" : "mic-outline"}
                    size={40}
                    color="#fff"
                  />
                )}
              </View>
            </Animated.View>
          </Pressable>

          {isRecording && (
            <Pressable
              onPress={() => void cancelRecording()}
              style={styles.cancelLink}
            >
              <Text style={styles.cancelLinkText}>Cancel</Text>
            </Pressable>
          )}
        </View>
      </View>

      <WordDetailSheet
        isVisible={!!selectedWord}
        onClose={() => {
          setSelectedWord(null);
          clearExplanation();
        }}
        selectedWord={selectedWord}
        details={explanation}
        loading={detailsLoading}
        error={error}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 15,
    marginTop: 50,
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  subheader: {
    fontSize: 13,
    fontFamily: FONTS.medium,
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: "space-around",
    paddingBottom: 40,
  },
  imageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 30,
    overflow: "hidden",
    height: 300,
    width: "100%",
    position: "relative",
    elevation: 5,
  },
  mainImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card,
  },
  speakerFloatingButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 5,
  },
  disabledControl: {
    opacity: 0.5,
  },
  wordSection: {
    alignItems: "center",
  },
  wordText: {
    fontSize: 48,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    letterSpacing: 2,
  },
  feedbackText: {
    fontSize: 20,
    fontFamily: FONTS.medium,
    marginTop: 10,
  },
  actionSection: {
    alignItems: "center",
    width: "100%",
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    marginBottom: 8,
    minHeight: 44,
    width: "100%",
  },
  statusBannerRecording: {
    backgroundColor: "rgba(239, 68, 68, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(239, 68, 68, 0.45)",
  },
  statusBannerProcessing: {
    backgroundColor: "rgba(61, 92, 255, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(61, 92, 255, 0.35)",
  },
  recordingDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    marginRight: 8,
  },
  statusSpinner: {
    marginRight: 8,
  },
  instruction: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.medium,
    textAlign: "center",
    flexShrink: 1,
  },
  instructionRecording: {
    color: "#EF4444",
    fontFamily: FONTS.bold,
  },
  instructionProcessing: {
    color: COLORS.primary,
  },
  subInstruction: {
    color: COLORS.muted,
    fontSize: 13,
    fontFamily: FONTS.medium,
    marginBottom: 12,
    textAlign: "center",
  },
  progressTrack: {
    width: "80%",
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#EF4444",
    borderRadius: 3,
  },
  countdownText: {
    color: "#EF4444",
    fontSize: 12,
    fontFamily: FONTS.medium,
    marginBottom: 12,
  },
  recordButton: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "rgba(61, 92, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  recordButtonPressed: {
    opacity: 0.9,
  },
  recordButtonActive: {
    backgroundColor: "rgba(239, 68, 68, 0.25)",
  },
  recordButtonDisabled: {
    opacity: 0.55,
  },
  recordOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  recordOuterActive: {
    backgroundColor: "#EF4444",
  },
  recordInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  cancelLink: {
    marginTop: 14,
    padding: 8,
  },
  cancelLinkText: {
    color: COLORS.muted,
    fontSize: 14,
    fontFamily: FONTS.medium,
  },
});

export default Speakup;
