import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { COLORS,  FONTS,  } from '@/const';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSpeechScoring } from '@/services/gaming/useSpeechScoring';
import WordDetailSheet from '@/components/WordDetailSheet';
import { useWordDetails } from '@/services/gaming/useWordDetails';
import { useLanguageStore } from '@/store/languageStore';
const Speakup = () => {
  const router=useRouter()
  const [selectedWord, setSelectedWord] = React.useState<string | null>(null);
  
  const { recordForThreeSecondsAndScore, isAnalyzing, lastScore } = useSpeechScoring();
  const { fetchExplanation, explanation, loading, error, clearExplanation } = useWordDetails();
  const language = useLanguageStore((state) => state.language);

  const pronunciationData = {
    levels: {
      level1: {
        word: "ድመት",
        audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        imageUrl: "https://picsum.photos/id/237/600/400"
      }
    }
  };

  const currentGame = pronunciationData.levels["level1"];

  const playPronunciation = () => {
    
    // Keeping this local (no audioService dependency). If you want, we can wire expo-av here.
    console.log('Playing:', currentGame.audioUrl);
  };

  const handlePress = async () => {
    await recordForThreeSecondsAndScore(currentGame.word);
  };

  const handleWordTap = async () => {
    setSelectedWord(currentGame.word);
    await fetchExplanation(currentGame.word, language);
  };

  return (
    <SafeAreaView style={styles.container}>
    
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={28} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Speak Up!</Text>
          <Text style={styles.subheader}>Level 1 • Lesson 1</Text>
        </View>
      </View>

      <View style={styles.content}>
        
        <View style={styles.imageCard}>
          <Image
            source={{ uri: currentGame.imageUrl }}
            style={styles.mainImage}
            resizeMode="cover"
          />
          
          <TouchableOpacity 
            style={styles.speakerFloatingButton}
            onPress={playPronunciation}
          >
            <Ionicons name="volume-high" size={30} color="#fff" />
          </TouchableOpacity>
        </View>

      
        <View style={styles.wordSection}>
          <TouchableOpacity onPress={handleWordTap}>
            <Text style={styles.wordText}>{currentGame.word}</Text>
          </TouchableOpacity>
          {lastScore !== null && (
            <Text style={[
              styles.feedbackText, 
              { color: lastScore > 70 ? '#4ADE80' : '#FB923C' }
            ]}>
              {lastScore > 70 ? "Excellent! 🌟" : "Keep Trying! 💪"} ({lastScore}%)
            </Text>
          )}
        </View>

    
        <View style={styles.actionSection}>
          <Text style={styles.instruction}>
            {isAnalyzing ? "Listening..." : "Tap and say the word"}
          </Text>

          <TouchableOpacity 
            onPress={handlePress}
            disabled={isAnalyzing}
            style={[
              styles.recordButton,
              isAnalyzing&& {opacity:0.5}
            ]}
          >
            <View style={styles.recordOuter}>
              <View style={[styles.recordInner]}>
                {isAnalyzing ? (
                  <ActivityIndicator  color="#fff" />
                ):(
                <Ionicons 
                  name="mic" 
                  size={40} 
                  color="#fff" 
                />)
                }
              </View>
            </View>
          </TouchableOpacity>
          
          <Text style={styles.timerNote}>Records ~3 seconds then submits</Text>
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
        loading={loading}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    marginTop:50
  },
  backButton: {
    width: 45,
    height: 45,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    justifyContent: 'center',
    alignItems: 'center',
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
    justifyContent: 'space-around',
    paddingBottom: 40,
  },
  imageCard: {
    backgroundColor: COLORS.card,
    borderRadius: 30,
    overflow: 'hidden',
    height: 300,
    width: '100%',
    position: 'relative',
    elevation: 5,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  speakerFloatingButton: {
    position: 'absolute',
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
  wordSection: {
    alignItems: 'center',
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
    color: '#4ADE80',
    marginTop: 10,
  },
  actionSection: {
    alignItems: 'center',
  },
  instruction: {
    color: COLORS.textSecondary,
    marginBottom: 20,
    fontSize: 16,
    fontFamily: FONTS.medium,
  },
  recordButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(61, 92, 255, 0.2)', // Primary with transparency
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingActive: {
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  recordOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerSquare: {
    backgroundColor: COLORS.danger,
    borderRadius: 12,
  },
  timerNote: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 15,
    fontFamily: FONTS.medium,
  }
});

export default Speakup;