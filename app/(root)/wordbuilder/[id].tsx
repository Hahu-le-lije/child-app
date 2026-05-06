import React, { useState, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, PanResponder, Dimensions, TouchableOpacity } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Line } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import GameLayout from '@/components/GameLayout';
import WordDetailSheet from '@/components/WordDetailSheet';
import { LinearGradient } from 'expo-linear-gradient';
import { useWordDetails } from '@/services/gaming/useWordDetails';
import { useLanguageStore } from '@/store/languageStore';
import { scoreWordBuilder } from '@/services/gaming/scoring.service';
import { getUser } from '@/services/db/authStorage';
import { upsertGameSession } from '@/services/db/gameSession.service';

const { width } = Dimensions.get('window');
const WHEEL = width * 0.85;
const RADIUS = WHEEL / 2.6;

const INITIAL_DATA = {
  letters: ['ሀ', 'ለ', 'ሐ', 'መ'],
  correctWords: [
    { wordid: "1", wordtext: "ሀለ", pronunciation: "ha-le", meaning: "To be", sentence: "ሀለ ሐመሰ ለመሰ።" },
    { wordid: "2", wordtext: "ለሐ", pronunciation: "le-ha", meaning: "Soft", sentence: "ይህ ጨርቅ ለሐ ነው።" },
  ],
  hints: [
    { wordid: "1", hinttext: "Starts with ሀ" },
    { wordid: "2", hinttext: "Means something soft" }
  ]
};

const WordBuilder = () => {
  const { id } = useLocalSearchParams();

  const [letters] = useState(INITIAL_DATA.letters);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [currentPath, setCurrentPath] = useState<number[]>([]);
  const [touchPos, setTouchPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const { fetchExplanation, explanation, loading, error, clearExplanation } = useWordDetails();
  const language = useLanguageStore((state) => state.language);

  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [feedbackText, setFeedbackText] = useState<string | null>(null);

  const pathRef = useRef<number[]>([]);
  const sessionStartRef = useRef(Date.now());
  const savedRef = useRef(false);

  const handleWordPress = async (word: string) => {
    setSelectedWord(word);
    await fetchExplanation(word, language);
  };

  const letterPositions = useMemo(() => {
    return letters.map((_, i) => {
      const angle = (i * 2 * Math.PI) / letters.length - Math.PI / 2;
      return {
        x: WHEEL / 2 + RADIUS * Math.cos(angle),
        y: WHEEL / 2 + RADIUS * Math.sin(angle)
      };
    });
  }, [letters]);

  const handleTouch = (x: number, y: number) => {
    letterPositions.forEach((pos, index) => {
      const dist = Math.hypot(x - pos.x, y - pos.y);

      if (dist < 45) {
        const currentPathArray = pathRef.current;
        const pathLength = currentPathArray.length;

        
        if (pathLength > 1 && currentPathArray[pathLength - 2] === index) {
          pathRef.current = currentPathArray.slice(0, -1);
          setCurrentPath([...pathRef.current]);
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          return;
        }

        if (!currentPathArray.includes(index)) {
          pathRef.current = [...currentPathArray, index];
          setCurrentPath([...pathRef.current]);
          Haptics.selectionAsync();
        }
      }
    });
  };

  

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,

      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setIsDragging(true);
        pathRef.current = [];
        setTouchPos({ x: locationX, y: locationY });
        handleTouch(locationX, locationY);
      },

      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        setTouchPos({ x: locationX, y: locationY });
        handleTouch(locationX, locationY);
      },

      onPanResponderRelease: () => {
        setIsDragging(false);

        const word = pathRef.current.map(idx => letters[idx]).join('');
        const foundWordData = INITIAL_DATA.correctWords.find(w => w.wordtext === word);

        if (foundWordData) {
          if (!foundWords.includes(word)) {
            setFoundWords(prev => [...prev, word]);

            const newCombo = combo + 1;
            setCombo(newCombo);
            setScore(prev => prev + 10 * newCombo);

            const messages = ['Nice!', 'Great!', 'Awesome!', 'Brilliant!'];
            setFeedbackText(messages[Math.floor(Math.random() * messages.length)]);
            setTimeout(() => setFeedbackText(null), 1000);

            setHint(null);
            if (foundWords.length + 1 >= INITIAL_DATA.correctWords.length) {
              setCompleted(true);
            }

            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }
        } else if (word.length > 0) {
          setCombo(0);
          setWrongAttempts((prev) => prev + 1);

          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

          const remainingWord = INITIAL_DATA.correctWords.find(w => !foundWords.includes(w.wordtext));
          const hintObj = INITIAL_DATA.hints.find(h => h.wordid === remainingWord?.wordid);

          if (hintObj?.hinttext) {
            setHintsUsed((prev) => prev + 1);
          }
          setHint(hintObj?.hinttext || 'Try again!');
        }

        pathRef.current = [];
        setCurrentPath([]);
      },
    })
  ).current;

  React.useEffect(() => {
    if (!completed || savedRef.current) return;
    savedRef.current = true;
    void (async () => {
      const user = await getUser();
      if (!user?.id) return;
      const totalTime = Math.round((Date.now() - sessionStartRef.current) / 1000);
      const scored = scoreWordBuilder({
        wordsFound: foundWords.length,
        totalPossibleWords: INITIAL_DATA.correctWords.length,
        wrongAttempts,
        hintsUsed,
        timeTakenSeconds: totalTime,
      });
      const now = new Date().toISOString();
      upsertGameSession({
        id: `wordbuilder_${user.id}_${Date.now()}`,
        child_id: String(user.id),
        game_type: "word_builder",
        content_id: String(id),
        score: scored.finalScore,
        time_spent: totalTime,
        metrics: {
          words_found: foundWords,
          total_possible_words: INITIAL_DATA.correctWords.length,
          wrong_attempts: wrongAttempts,
          hints_used: hintsUsed,
          time_taken: totalTime,
          skills: scored.skills,
        },
        synced: 0,
        created_at: now,
        updated_at: now,
      });
    })();
  }, [completed, foundWords, hintsUsed, id, wrongAttempts]);

  return (
    <GameLayout title={`Level ${id}`}>
      <View style={styles.container}>

      
        <View style={styles.topBar}>
          <Text style={styles.scoreText}>⭐ {score}</Text>
          <Text style={styles.comboText}>🔥 x{combo}</Text>
        </View>

        
        

        
        <View style={styles.previewBox}>
          {currentPath.length > 0 && (
            <LinearGradient
              colors={['#3D5CFF', '#0286FF']}
              style={styles.previewActive}
            >
              <Text style={styles.previewText}>
                {currentPath.map(idx => letters[idx]).join('')}
              </Text>
            </LinearGradient>
          )}

          {feedbackText && (
            <Text style={styles.feedbackText}>{feedbackText}</Text>
          )}
        </View>

        
        <View style={styles.wheelWrapper}>
          <View style={styles.wheelContainer} {...panResponder.panHandlers}>
            <Svg style={StyleSheet.absoluteFill} pointerEvents="none">
              {currentPath.map((letterIdx, i) => {
                const start = letterPositions[letterIdx];
                const nextIdx = currentPath[i + 1];

                if (nextIdx !== undefined) {
                  const end = letterPositions[nextIdx];
                  return (
                    <Line key={i} x1={start.x} y1={start.y} x2={end.x} y2={end.y}
                      stroke="#3D5CFF" strokeWidth="14" strokeLinecap="round" />
                  );
                }

                if (i === currentPath.length - 1 && isDragging) {
                  return (
                    <Line key="active" x1={start.x} y1={start.y} x2={touchPos.x} y2={touchPos.y}
                      stroke="#3D5CFF" strokeWidth="6" strokeDasharray="10,5" />
                  );
                }
              })}
            </Svg>

            {letterPositions.map((pos, i) => {
              const isActive = currentPath.includes(i);

              return (
                <View
                  key={i}
                  pointerEvents="none"
                  style={[
                    styles.letterCircle,
                    { left: pos.x - 35, top: pos.y - 35 },
                    isActive && styles.activeLetter
                  ]}
                >
                  <Text style={styles.letterText}>{letters[i]}</Text>
                </View>
              );
            })}
          </View>
        </View>
        <View style={styles.foundContainer}>
          {INITIAL_DATA.correctWords.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => foundWords.includes(item.wordtext) && handleWordPress(item.wordtext)}
              style={[styles.wordSlot, foundWords.includes(item.wordtext) && styles.wordFound]}
            >
              <Text style={styles.wordSlotText}>
                {foundWords.includes(item.wordtext) ? item.wordtext : '?'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

      


        <WordDetailSheet
          isVisible={!!selectedWord}
          onClose={() => {
            setSelectedWord(null);
            clearExplanation();
          }}
          selectedWord={selectedWord}
          details={explanation}
          loading={loading}
          error={error}
        />

      </View>
    </GameLayout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 40,
    backgroundColor: "transparent",
  },

  topBar: { width: '90%', flexDirection: 'row', justifyContent: 'space-between' },
  scoreText: { color: 'white', fontSize: 18 },
  comboText: { color: '#FFB800', fontSize: 18 },

  foundContainer: { flexDirection: 'row', gap: 10 },
  

  wordSlot: { backgroundColor: '#2F2F42', padding: 10, borderRadius: 10 },
  wordFound: { backgroundColor: '#3D5CFF' },
  wordSlotText: { color: 'white', fontSize: 22 },

  previewBox: { alignItems: 'center' },
  previewActive: { padding: 10, borderRadius: 20 },
  previewText: { fontSize: 30, color: 'white' },
  feedbackText: { color: '#4CD964', fontSize: 22, marginTop: 10 },

  wheelWrapper: {},
  wheelContainer: { width: WHEEL, height: WHEEL, borderRadius: WHEEL / 2, backgroundColor: '#2F2F42' },

  letterCircle: { position: 'absolute', width: 70, height: 70, borderRadius: 35, backgroundColor: '#3E3E55', justifyContent: 'center', alignItems: 'center' },

  activeLetter: {
    backgroundColor: '#3D5CFF',
    transform: [{ scale: 1.25 }],
    shadowColor: '#3D5CFF',
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },

  letterText: { color: 'white', fontSize: 32 },

  shuffleBtn: { backgroundColor: '#3D5CFF', padding: 10, borderRadius: 20 },
  shuffleText: { color: 'white' },

  hintContainer: { marginTop: 10 },
  hintText: { color: '#ccc' }
});

export default WordBuilder;