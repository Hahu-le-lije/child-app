import React, { useState, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { Canvas, Path, Skia, Mask } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { COLORS, SPACING, RADIUS } from '@/const';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { getUser } from '@/services/db/authStorage';
import { upsertGameSession } from '@/services/db/gameSession.service';
import { scoreTracing } from '@/services/gaming/scoring.service';

const { width } = Dimensions.get('window');
const CANVAS_SIZE = width + 100;
const FOLLOW_THRESHOLD = 45;

const dummyLevelData = {
  levelid: "level_1",
  questions: [
    {
      id: "q1",
      lettertotrace: "A",
      svg: "m15.1 716.4 129-605.04 71.8 0 129 605.04-62.6 0-38.3-197.52-128 0-38.3 197.52-62.6 0zm217.3-257.88-52.4-285.96-52.7 285.96 105.1 0z",
      pronoucevoicelink: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
    {
      id: "q2",
      lettertotrace: "አ",
      svg: "M 53.223 63.526 ... Z",
      pronoucevoicelink: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    }
  ]
};

const FidelTracingScreen = () => {
  const router = useRouter();
  const [currentIdx, setCurrentIdx] = useState(0);
  const currentQuestion = dummyLevelData.questions[currentIdx];

  const drawPath = useSharedValue(Skia.Path.Make());
  const progress = useSharedValue(0);

  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);

  const [eraserCount, setEraserCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const startTime = useRef(Date.now());

  const letterPath = useMemo(() => {
    const path = Skia.Path.MakeFromSVGString(currentQuestion.svg);
    if (!path) return Skia.Path.Make();

    const bounds = path.getBounds();
    const scale = Math.min(CANVAS_SIZE / bounds.width, CANVAS_SIZE / bounds.height) * 0.92;

    const matrix = Skia.Matrix();
    matrix.translate(
      (CANVAS_SIZE - bounds.width * scale) / 2 - bounds.x * scale,
      (CANVAS_SIZE - bounds.height * scale) / 2 - bounds.y * scale
    );
    matrix.scale(scale, scale);

    path.transform(matrix);
    return path;
  }, [currentIdx]);

  const toggleAudio = async () => {
    try {
      if (soundRef.current) await soundRef.current.unloadAsync();
      const { sound } = await Audio.Sound.createAsync({ uri: currentQuestion.pronoucevoicelink });
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

      const closestT = getClosestProgressOnPath(e.x, e.y, letterPath);

      if (closestT > progress.value) {
        progress.value = closestT;
        Haptics.selectionAsync();
      }
    });

  const calculateScore = () => {
    const userPath = drawPath.value;
    if (userPath.isEmpty()) return { score: 0, accuracy: 0 };

    const timeTaken = (Date.now() - startTime.current) / 1000;

    const stroke = getStrokeAccuracy(userPath, letterPath);
    const fill = getFillAccuracy(userPath, letterPath);

    const accuracy = stroke * 0.4 + fill * 0.6;

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
          stroke_order_correct: true,
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
      `Score: ${stats.score}/100\nAccuracy: ${stats.accuracy}%`,
      [{
        text: currentIdx < dummyLevelData.questions.length - 1 ? "Next Letter" : "Finish",
        onPress: () => {
          if (currentIdx < dummyLevelData.questions.length - 1) {
            setCurrentIdx((prev) => prev + 1);
            resetCanvas();
          } else {
            Alert.alert("Done!", "Level complete 🎉");
          }
        }
      }]
    );
  };

  const resetCanvas = () => {
    drawPath.value = Skia.Path.Make();
    drawPath.modify();
    progress.value = 0;
    setEraserCount((prev) => prev + 1);
    setRetryCount((prev) => prev + 1);
    startTime.current = Date.now();
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>

        <Text style={styles.letterPreview}>{currentQuestion.lettertotrace}</Text>

        <TouchableOpacity style={styles.audioBtn} onPress={toggleAudio}>
          <Text style={styles.btnTextIcon}>{isPlaying ? '⏸' : '▶'}</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={gesture}>
        <View style={styles.canvasContainer}>
          <Canvas style={styles.canvas}>

           
            <Path path={letterPath} color={COLORS.muted} strokeWidth={6} style="stroke" opacity={0.5} />

            <Path path={letterPath} color="white" />

            
            <Mask
              mask={
                <Path
                  path={drawPath}
                  color="black"
                  strokeWidth={60}
                  style="stroke"
                  strokeCap="round"
                  strokeJoin="round"
                />
              }
            >
              <Path path={letterPath} color={COLORS.primary} />
            </Mask>

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

/* ================= HELPERS ================= */

function getClosestProgressOnPath(x: number, y: number, path: any): number {
  let bestT = 0;
  let minDist = Infinity;

  const iter = Skia.ContourMeasureIter(path, false, 1.0);
  let contour = iter.next();

  while (contour) {
    const length = contour.length();

    for (let i = 0; i <= 100; i++) {
      const t = i / 100;
      const [position] = contour.getPosTan(t * length);

      const dx = position.x - x;
      const dy = position.y - y;
      const dist = dx * dx + dy * dy;

      if (dist < minDist && dist < FOLLOW_THRESHOLD * FOLLOW_THRESHOLD) {
        minDist = dist;
        bestT = t;
      }
    }

    contour = iter.next();
  }

  return bestT;
}

function getStrokeAccuracy(userPath: any, targetPath: any): number {
  const numSamples = 60;
  const threshold = 40;

  let good = 0, total = 0;

  const iter = Skia.ContourMeasureIter(userPath, false, 1.0);
  let contour = iter.next();

  while (contour) {
    const length = contour.length();

    for (let i = 0; i <= numSamples; i++) {
      const [position] = contour.getPosTan((i / numSamples) * length);

      if (isPointNearPath(position.x, position.y, targetPath, threshold)) good++;
      total++;
    }

    contour = iter.next();
  }

  return total ? good / total : 0;
}

function getFillAccuracy(userPath: any, targetPath: any): number {
  const numSamples = 60;
  let inside = 0, total = 0;

  const iter = Skia.ContourMeasureIter(userPath, false, 1.0);
  let contour = iter.next();

  while (contour) {
    const length = contour.length();

    for (let i = 0; i <= numSamples; i++) {
      const [position] = contour.getPosTan((i / numSamples) * length);

      if (targetPath.contains(position.x, position.y)) inside++;
      total++;
    }

    contour = iter.next();
  }

  return total ? inside / total : 0;
}

function isPointNearPath(x: number, y: number, path: any, threshold: number) {
  const iter = Skia.ContourMeasureIter(path, false, 1.0);
  let contour = iter.next();

  while (contour) {
    const length = contour.length();

    for (let i = 0; i <= 40; i++) {
      const [position] = contour.getPosTan((i / 40) * length);

      const dx = position.x - x;
      const dy = position.y - y;

      if (dx * dx + dy * dy <= threshold * threshold) return true;
    }

    contour = iter.next();
  }

  return false;
}



const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingTop: 60,
  },
  backBtn: { fontSize: 24, color: COLORS.textPrimary },
  letterPreview: { fontSize: 60, color: COLORS.textPrimary, fontWeight: 'bold' },
  audioBtn: { backgroundColor: COLORS.secondary, padding: 12, borderRadius: RADIUS.round },
  btnTextIcon: { color: 'white', fontSize: 22 },

  canvasContainer: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    alignSelf: 'center',
  },
  canvas: { flex: 1 },

  footer: {
    flexDirection: 'row',
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  clearBtn: {
    flex: 1,
    backgroundColor: COLORS.danger,
    padding: 18,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  doneBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    padding: 18,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
  },
  btnText: { color: 'white', fontWeight: 'bold', fontSize: 18 },
});

export default FidelTracingScreen;