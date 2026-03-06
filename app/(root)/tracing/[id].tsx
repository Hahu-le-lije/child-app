import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, PanResponder, Dimensions, Text, TouchableOpacity } from 'react-native';
import GameLayout from '@/components/GameLayout';
import Svg, { Path } from 'react-native-svg';
import { useLocalSearchParams } from 'expo-router';
import { getGameContent } from '@/services/gameContentService';

const { width } = Dimensions.get('window');

const tracePath =
  'M50 150 C 120 50, 220 50, 300 150 C 380 250, 480 250, 560 150';

const TracingGame = () => {
  const { id } = useLocalSearchParams();
  const levelId = String(id);
  const [paths, setPaths] = useState<string[]>([]);
  const currentPath = useRef('');

  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [fidels, setFidels] = useState<any[]>([]);
  const [currentFidel, setCurrentFidel] = useState(0);

  useEffect(() => {
    (async () => {
      const rows = await getGameContent('tracing', levelId);
      setFidels(rows || []);
      setCurrentFidel(0);
    })();
  }, [levelId]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current = `M${locationX} ${locationY}`;
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentPath.current += ` L${locationX} ${locationY}`;
        setPaths([...paths, currentPath.current]);
      },
      onPanResponderRelease: () => {
        const newScore = Math.min(100, score + 20);
        setScore(newScore);

        if (newScore >= 100) {
          setCompleted(true);
        }
      },
    })
  ).current;

  const reset = () => {
    setPaths([]);
    setScore(0);
    setCompleted(false);
  };

  const nextItem = () => {
    if (fidels.length === 0) return;
    setCurrentFidel((i) => (i + 1) % fidels.length);
    reset();
  };

  return (
    <GameLayout title={`Tracing Level ${id}`}>
      <View style={styles.container}>
        <Text style={styles.score}>Score: {score}</Text>
        {fidels.length > 0 && (
          <Text style={styles.fidelText}>
            Trace: {fidels[currentFidel]?.character} ({fidels[currentFidel]?.pronunciation})
          </Text>
        )}

        <View style={styles.canvas} {...panResponder.panHandlers}>
          <Svg height="100%" width="100%" viewBox="0 0 600 300">
            {/* target path */}
            <Path d={tracePath} stroke="#999" strokeWidth={6} fill="none" />

            {/* user paths */}
            {paths.map((p, index) => (
              <Path key={index} d={p} stroke="#000" strokeWidth={4} fill="none" />
            ))}
          </Svg>
        </View>

        {completed && (
          <View style={styles.complete}>
            <Text>Great job! 🎉</Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity onPress={reset} style={styles.reset}>
            <Text>Reset</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={nextItem} style={styles.next}>
            <Text>Next</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GameLayout>
  );
};

export default TracingGame;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 12,
  },
  canvas: {
    width: width - 24,
    height: 300,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  score: {
    marginBottom: 8,
    fontSize: 16,
  },
  fidelText: {
    marginBottom: 8,
    fontSize: 18,
    fontFamily: 'Abyssinica_SIL',
  },
  complete: {
    marginTop: 12,
    padding: 12,
    backgroundColor: '#dff0d8',
    borderRadius: 8,
  },
  actions: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 12,
  },
  reset: {
    padding: 10,
    backgroundColor: '#eee',
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
  },
  next: {
    padding: 10,
    backgroundColor: '#5D5FEF',
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
  },
});