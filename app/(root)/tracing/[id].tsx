import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Dimensions } from 'react-native';
import { Canvas, Path, Skia, Mask, Fill } from '@shopify/react-native-skia';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { Audio } from 'expo-av';
import { COLORS } from '@/const';
const { width } = Dimensions.get('window');



const dummyFidelData = {
  lettertotrace: "አ",
  pronoucevoicelink: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
};

// SVG path for አ
const correctSVGPath =
  "M 180 80 Q 120 80 100 140 Q 90 200 130 240 Q 160 270 200 260 " +
  "Q 240 250 260 210 Q 270 150 240 110 Q 210 80 180 80 " +
  "M 150 160 L 210 160 " +
  "M 130 200 Q 160 190 190 200";

const FidelTracingScreen = () => {
  const { lettertotrace, pronoucevoicelink } = dummyFidelData;

  // We use a shared value for the path to keep it performant
  const drawPath = useSharedValue(Skia.Path.Make());
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef(null);
  const [eraserCount, setEraserCount] = useState(0);
  const startTime = useRef(Date.now());

  const correctLetterPath = useRef(Skia.Path.MakeFromSVGString(correctSVGPath));

  // Audio Logic
  const toggleAudio = async () => {
    try {
      if (!soundRef.current) {
        const { sound } = await Audio.Sound.createAsync({ uri: pronoucevoicelink });
        soundRef.current = sound;
      }
      const status = await soundRef.current.getStatusAsync();
      if (status.isPlaying) {
        await soundRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await soundRef.current.playAsync();
        setIsPlaying(true);
      }
    } catch (error) {
      Alert.alert('Audio Error', 'Failed to play sound');
    }
  };

  useEffect(() => {
    return () => { soundRef.current?.unloadAsync(); };
  }, []);

  const clearDrawing = () => {
    drawPath.value = Skia.Path.Make();
    setEraserCount((prev) => prev + 1);
  };

  // Scoring Logic
  const calculateScore = () => {
    const userPath = drawPath.value;
    const correctPath = correctLetterPath.current;

    if (!correctPath || userPath.isEmpty()) return { finalScore: 0 };

    const timeTaken = (Date.now() - startTime.current) / 1000;
    const strokeAccuracy = calculateStrokeAccuracy(userPath, correctPath);
    
    const eraserUsageRatio = Math.min(eraserCount / 5, 1);
    const neatnessScore = (1 - eraserUsageRatio) * 20;

    let normalizedTime = 0;
    if (timeTaken <= 8) normalizedTime = 1;
    else if (timeTaken >= 40) normalizedTime = 0;
    else normalizedTime = (40 - timeTaken) / (40 - 8);

    const speedScore = normalizedTime * 20;
    const accuracyScore = strokeAccuracy * 60;
    const finalScore = Math.round(accuracyScore + neatnessScore + speedScore);

    return {
      finalScore: Math.max(0, Math.min(100, finalScore)),
      strokeAccuracy: Math.round(strokeAccuracy * 100),
      timeTaken: timeTaken.toFixed(1),
    };
  };

  const handleDone = () => {
    const scoreData = calculateScore();
    Alert.alert("Excellent Work! 🎉", `Score: ${scoreData.finalScore}/100\nAccuracy: ${scoreData.strokeAccuracy}%\nTime: ${scoreData.timeTaken}s`, [
      { text: "Try Again", onPress: resetGame },
      { text: "OK" },
    ]);
  };

  const resetGame = () => {
    drawPath.value = Skia.Path.Make();
    setEraserCount(0);
    startTime.current = Date.now();
  };

  // FIX: Path immutability handled by creating a new path on every change
  const panGesture = Gesture.Pan()
    .onBegin((e) => {
      const newPath = drawPath.value.copy();
      newPath.moveTo(e.x, e.y);
      drawPath.value = newPath;
    })
    .onChange((e) => {
      const newPath = drawPath.value.copy();
      newPath.lineTo(e.x, e.y);
      drawPath.value = newPath;
    });

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.letter}>{lettertotrace}</Text>
        <TouchableOpacity style={styles.soundButton} onPress={toggleAudio}>
          <Text style={styles.soundText}>{isPlaying ? '⏸' : '🔊'}</Text>
        </TouchableOpacity>
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.tracingContainer}>
          <Canvas style={styles.canvas}>
            <Fill color={COLORS.card} />
     
            <Path
              path={correctLetterPath.current}
              color="#E0E0E0"
              strokeWidth={40}
              style="stroke"
              strokeCap="round"
            />

           
            <Path
              path={drawPath}
              color={COLORS.primary}
              strokeWidth={18}
              style="stroke"
              strokeCap="round"
              strokeJoin="round"
            />
          </Canvas>
        </View>
      </GestureDetector>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearBtn} onPress={clearDrawing}>
          <Text style={styles.btnText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneBtn} onPress={handleDone}>
          <Text style={styles.btnText}>Score</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
};

// FIX: Correct Point sampling logic
function calculateStrokeAccuracy(userPath, correctPath) {
  const userPoints = getPointsFromPath(userPath, 50);
  const correctPoints = getPointsFromPath(correctPath, 50);

  let totalDeviation = 0;
  let coveredCount = 0;

  userPoints.forEach((pt) => {
    let minDist = Infinity;
    correctPoints.forEach((cpt) => {
      const dist = Math.hypot(pt.x - cpt.x, pt.y - cpt.y);
      if (dist < minDist) minDist = dist;
    });
    totalDeviation += minDist;
    if (minDist < 40) coveredCount++;
  });

  const avgDeviation = totalDeviation / userPoints.length;
  const coverage = coveredCount / userPoints.length;
  const closeness = Math.max(0, 1 - avgDeviation / 60);

  return (coverage * 0.8) + (closeness * 0.2);
}

function getPointsFromPath(path, numPoints = 50) {
  const points = [];
  const length = path.length();
  for (let i = 0; i <= numPoints; i++) {
    const pt = path.getPointAtLength((i / numPoints) * length);
    points.push(pt);
  }
  return points;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.card,
  },
  letter: { fontSize: 80, fontWeight: 'bold', color: COLORS.textPrimary },
  soundButton: { backgroundColor: COLORS.primary, padding: 15, borderRadius: 50 },
  soundText: { color: 'white', fontSize: 20 },
  tracingContainer: {
    flex: 1,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.border,
    elevation: 5,
  },
  canvas: { flex: 1 },
  buttonRow: { flexDirection: 'row', padding: 20, gap: 15 },
  clearBtn: { flex: 1, backgroundColor: COLORS.danger, padding: 20, borderRadius: 15, alignItems: 'center' },
  doneBtn: { flex: 1, backgroundColor: '#4CAF50', padding: 20, borderRadius: 15, alignItems: 'center' },
  btnText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
});

export default FidelTracingScreen;