import React, { useState, useRef, useMemo, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  Canvas,
  Image as SkiaImage,
  Path,
  Skia,
  useImage,
  type SkPath,
} from "@shopify/react-native-skia";
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useSharedValue } from "react-native-reanimated";
import { Audio } from "expo-av";
import { COLORS, SPACING, RADIUS } from "@/const";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Haptics from "expo-haptics";
import { getUser } from "@/services/db/authStorage";
import { upsertGameSession } from "@/services/db/gameSession.service";
import { scoreTracing } from "@/services/gaming/scoring.service";
import { getGameContent } from "@/services/cms/gameContentService";

const { width } = Dimensions.get("window");
const CANVAS_SIZE = width - 32;
const STROKE_NEAR_THRESHOLD = 32;
const GRID_SAMPLES = 10;

type TraceQuestion = {
  id: string;
  lettertotrace: string;
  outlineImageUri: string;
  pronoucevoicelink: string;
};

type GuideRect = { x: number; y: number; width: number; height: number };

function computeGuideRect(
  imgW: number,
  imgH: number,
  canvasSize: number,
): GuideRect {
  const scale = Math.min(canvasSize / imgW, canvasSize / imgH) * 0.88;
  const width = imgW * scale;
  const height = imgH * scale;
  return {
    x: (canvasSize - width) / 2,
    y: (canvasSize - height) / 2,
    width,
    height,
  };
}

function samplePointsAlongPath(path: SkPath, count: number): Array<{ x: number; y: number }> {
  const points: Array<{ x: number; y: number }> = [];
  const iter = Skia.ContourMeasureIter(path, false, 1);
  let contour = iter.next();

  while (contour) {
    const length = contour.length();
    for (let i = 0; i <= count; i++) {
      const [position] = contour.getPosTan((i / count) * length);
      points.push({ x: position.x, y: position.y });
    }
    contour = iter.next();
  }

  return points;
}

function dist2(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
}

/** How much of the guide area the child traced over (image-outline mode). */
function getImageTraceCoverage(
  userPath: SkPath,
  guide: GuideRect,
  threshold = STROKE_NEAR_THRESHOLD,
): number {
  const userSamples = samplePointsAlongPath(userPath, 72);
  if (userSamples.length === 0) return 0;

  const thresholdSq = threshold * threshold;
  let covered = 0;
  let total = 0;

  for (let gy = 0; gy < GRID_SAMPLES; gy++) {
    for (let gx = 0; gx < GRID_SAMPLES; gx++) {
      const px = guide.x + ((gx + 0.5) * guide.width) / GRID_SAMPLES;
      const py = guide.y + ((gy + 0.5) * guide.height) / GRID_SAMPLES;
      total++;
      const hit = userSamples.some(
        (p) => dist2(p, { x: px, y: py }) <= thresholdSq,
      );
      if (hit) covered++;
    }
  }

  return total ? covered / total : 0;
}

function getPathLength(path: SkPath): number {
  let len = 0;
  const iter = Skia.ContourMeasureIter(path, false, 1);
  let contour = iter.next();
  while (contour) {
    len += contour.length();
    contour = iter.next();
  }
  return len;
}

const FidelTracingScreen = () => {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const levelId = String(id ?? "");
  const [questions, setQuestions] = useState<TraceQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentQuestion = questions[currentIdx];

  const drawPath = useSharedValue(Skia.Path.Make());
  const lastCoverage = useSharedValue(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [eraserCount, setEraserCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const startTime = useRef(Date.now());

  const outlineUri = currentQuestion?.outlineImageUri?.trim() ?? "";
  const skiaImage = useImage(outlineUri || null);

  const guideRect = useMemo(() => {
    if (!skiaImage) {
      return {
        x: CANVAS_SIZE * 0.1,
        y: CANVAS_SIZE * 0.1,
        width: CANVAS_SIZE * 0.8,
        height: CANVAS_SIZE * 0.8,
      };
    }
    return computeGuideRect(
      skiaImage.width(),
      skiaImage.height(),
      CANVAS_SIZE,
    );
  }, [skiaImage]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      try {
        const rows = (await getGameContent("tracing", levelId)) as TraceQuestion[];
        if (!active) return;
        const withImages = (Array.isArray(rows) ? rows : []).filter(
          (q) => q.outlineImageUri?.trim(),
        );
        setQuestions(withImages);
        setCurrentIdx(0);
      } catch (e) {
        console.error("tracing load failed", e);
        if (active) setQuestions([]);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [levelId]);

  useEffect(() => {
    return () => {
      void soundRef.current?.unloadAsync();
    };
  }, []);

  const resetCanvas = useCallback(() => {
    drawPath.value = Skia.Path.Make();
    drawPath.modify();
    lastCoverage.value = 0;
    setEraserCount((prev) => prev + 1);
    setRetryCount((prev) => prev + 1);
    startTime.current = Date.now();
  }, [drawPath, lastCoverage]);

  useEffect(() => {
    resetCanvas();
  }, [currentIdx, outlineUri, resetCanvas]);

  const toggleAudio = async () => {
    if (!currentQuestion?.pronoucevoicelink) {
      Alert.alert("No audio", "This letter has no voice clip yet.");
      return;
    }
    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({
        uri: currentQuestion.pronoucevoicelink,
      });
      soundRef.current = sound;
      await sound.playAsync();
      setIsPlaying(true);
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && !status.isPlaying) setIsPlaying(false);
      });
    } catch {
      Alert.alert("Error", "Audio playback failed");
    }
  };

  const gesture = Gesture.Pan()
    .onBegin((e) => {
      drawPath.value.moveTo(e.x, e.y);
      drawPath.modify();
    })
    .onChange((e) => {
      drawPath.value.lineTo(e.x, e.y);
      drawPath.modify();

      const coverage = getImageTraceCoverage(drawPath.value, guideRect);
      if (coverage - lastCoverage.value > 0.04) {
        lastCoverage.value = coverage;
        Haptics.selectionAsync();
      }
    });

  const calculateScore = () => {
    const userPath = drawPath.value;
    if (userPath.isEmpty()) {
      return { score: 0, accuracy: 0, timeTaken: 0, skills: {} };
    }

    const timeTaken = (Date.now() - startTime.current) / 1000;
    const coverage = getImageTraceCoverage(userPath, guideRect);
    const lengthFactor = Math.min(1, getPathLength(userPath) / (guideRect.width * 2));
    const accuracy = coverage * 0.75 + lengthFactor * 0.25;

    const scored = scoreTracing({
      strokeAccuracy: accuracy,
      eraserUsedCount: eraserCount,
      retries: retryCount,
      timeTakenSeconds: timeTaken,
    });

    return {
      score: scored.finalScore,
      accuracy: Math.round(accuracy * 100),
      timeTaken: Math.round(timeTaken),
      skills: scored.skills,
    };
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    const stats = calculateScore();

    void (async () => {
      const user = await getUser();
      if (!user?.id) return;
      const now = new Date().toISOString();
      upsertGameSession({
        id: `tracing_${user.id}_${Date.now()}`,
        child_id: String(user.id),
        game_type: "tracing",
        content_id: currentQuestion.id,
        score: stats.score,
        time_spent: stats.timeTaken ?? 0,
        metrics: {
          letter: currentQuestion.lettertotrace,
          stroke_accuracy: stats.accuracy,
          trace_mode: "image",
          time_taken: stats.timeTaken ?? 0,
          retries: retryCount,
          eraser_used_count: eraserCount,
          skills: stats.skills,
        },
        synced: 0,
        created_at: now,
        updated_at: now,
      });
    })();

    Alert.alert(
      "Result",
      `Score: ${stats.score}/100\nCoverage: ${stats.accuracy}%`,
      [
        {
          text: currentIdx < questions.length - 1 ? "Next letter" : "Finish",
          onPress: () => {
            if (currentIdx < questions.length - 1) {
              setCurrentIdx((prev) => prev + 1);
            } else {
              Alert.alert("Done!", "Level complete 🎉", [
                { text: "OK", onPress: () => router.back() },
              ]);
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading letters…</Text>
      </View>
    );
  }

  if (!currentQuestion || !outlineUri) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.loadingText}>
          No tracing images for this level. Download a fidel tracing pack from
          Content.
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>← Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!skiaImage) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading outline…</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>

        <Text style={styles.letterPreview}>{currentQuestion.lettertotrace}</Text>

        <TouchableOpacity style={styles.audioBtn} onPress={() => void toggleAudio()}>
          <Text style={styles.btnTextIcon}>{isPlaying ? "⏸" : "▶"}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.hint}>Trace over the faded letter</Text>

      <GestureDetector gesture={gesture}>
        <View style={styles.canvasContainer}>
          <Canvas style={styles.canvas}>
            <SkiaImage
              image={skiaImage}
              x={guideRect.x}
              y={guideRect.y}
              width={guideRect.width}
              height={guideRect.height}
              fit="contain"
              opacity={0.35}
            />
            <Path
              path={drawPath}
              color={COLORS.primary}
              style="stroke"
              strokeWidth={14}
              strokeCap="round"
              strokeJoin="round"
            />
          </Canvas>
        </View>
      </GestureDetector>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.clearBtn} onPress={resetCanvas}>
          <Text style={styles.btnText}>Clear</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.doneBtn} onPress={handleNext}>
          <Text style={styles.btnText}>Finish</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  centered: { justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 24,
  },
  hint: {
    textAlign: "center",
    color: COLORS.textSecondary ?? "#888",
    fontSize: 14,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    paddingTop: 60,
  },
  backBtn: { fontSize: 24, color: COLORS.textPrimary },
  letterPreview: {
    fontSize: 60,
    color: COLORS.textPrimary,
    fontWeight: "bold",
  },
  audioBtn: {
    backgroundColor: COLORS.secondary,
    padding: 12,
    borderRadius: RADIUS.round,
  },
  btnTextIcon: { color: "white", fontSize: 22 },
  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignSelf: "center",
    borderRadius: RADIUS.lg,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  canvas: { flex: 1 },
  footer: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: COLORS.danger,
    padding: 18,
    borderRadius: RADIUS.lg,
    alignItems: "center",
  },
  doneBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: RADIUS.lg,
    alignItems: "center",
  },
  btnText: { color: "white", fontWeight: "bold", fontSize: 18 },
});

export default FidelTracingScreen;
