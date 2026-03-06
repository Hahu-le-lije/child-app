import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useLocalSearchParams, router } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getLevelById } from '@/services/contentApi'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as Progress from 'react-native-progress'

const PicToWordGame = () => {
  const { id } = useLocalSearchParams()
  const [level, setLevel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentItem, setCurrentItem] = useState(0)
  const [score, setScore] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [feedback, setFeedback] = useState({ show: false, correct: false, message: '' })
  const [gameCompleted, setGameCompleted] = useState(false)
  const [lives, setLives] = useState(3)
  const [shuffledOptions, setShuffledOptions] = useState([])

  useEffect(() => {
    loadLevel()
  }, [id])

  useEffect(() => {
    if (level && level.content) {
      shuffleOptionsForCurrentQuestion()
    }
  }, [currentItem, level])

  const loadLevel = async () => {
    setLoading(true)
    const levelData = await getLevelById('word_picture', id as string)
    setLevel(levelData)
    setLoading(false)
  }

  const shuffleOptionsForCurrentQuestion = () => {
    if (!level || !level.content) return
    
    const currentQuestion = level.content.items[currentItem]
    const correctOption = { word: currentQuestion.word, image: currentQuestion.image, correct: true }
    const distractors = level.content.distractors.map(d => ({ word: d.word, image: d.image, correct: false }))
    
    // Combine and shuffle
    const allOptions = [correctOption, ...distractors].sort(() => Math.random() - 0.5)
    setShuffledOptions(allOptions)
  }

  const handleAnswer = (selectedWord: string, isCorrect: boolean) => {
    if (feedback.show) return // Prevent multiple answers

    setSelectedAnswer(selectedWord)
    
    if (isCorrect) {
      setFeedback({ show: true, correct: true, message: '✓ Correct! Well done!' })
      setScore(score + 1)
      
      // Move to next question after delay
      setTimeout(() => {
        if (currentItem + 1 < level.content.items.length) {
          setCurrentItem(currentItem + 1)
          setFeedback({ show: false, correct: false, message: '' })
          setSelectedAnswer(null)
        } else {
          setGameCompleted(true)
        }
      }, 1500)
    } else {
      const newLives = lives - 1
      setLives(newLives)
      setFeedback({ show: true, correct: false, message: '✗ Try again!' })
      
      if (newLives <= 0) {
        // Game over
        setTimeout(() => {
          Alert.alert(
            'Game Over',
            'You ran out of lives! Would you like to try again?',
            [
              { text: 'Try Again', onPress: resetGame },
              { text: 'Exit', onPress: () => router.back() }
            ]
          )
        }, 1500)
      } else {
        // Reset feedback but keep same question
        setTimeout(() => {
          setFeedback({ show: false, correct: false, message: '' })
          setSelectedAnswer(null)
        }, 1500)
      }
    }
  }

  const resetGame = () => {
    setCurrentItem(0)
    setScore(0)
    setLives(3)
    setGameCompleted(false)
    setFeedback({ show: false, correct: false, message: '' })
    setSelectedAnswer(null)
  }

  const calculateStars = () => {
    const percentage = (score / level.content.items.length) * 100
    if (percentage >= 90) return 3
    if (percentage >= 70) return 2
    if (percentage >= 50) return 1
    return 0
  }

  if (loading) {
    return (
      <GameLayout title="Picture to Word">
        <View style={styles.centerContent}>
          <Text style={styles.loadingText}>Loading game...</Text>
        </View>
      </GameLayout>
    )
  }

  if (!level) {
    return (
      <GameLayout title="Picture to Word">
        <View style={styles.centerContent}>
          <Text style={styles.errorText}>Level not found!</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </GameLayout>
    )
  }

  if (gameCompleted) {
    const stars = calculateStars()
    return (
      <GameLayout title="Picture to Word">
        <View style={styles.completedContainer}>
          <MaterialCommunityIcons name="trophy" size={80} color="#FFD700" />
          <Text style={styles.completedTitle}>Level Complete!</Text>
          <Text style={styles.completedScore}>Score: {score}/{level.content.items.length}</Text>
          
          <View style={styles.starsContainer}>
            {[1, 2, 3].map((star) => (
              <MaterialCommunityIcons
                key={star}
                name={star <= stars ? "star" : "star-outline"}
                size={40}
                color="#FFD700"
              />
            ))}
          </View>

          <TouchableOpacity style={styles.playAgainButton} onPress={resetGame}>
            <Text style={styles.playAgainText}>Play Again</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.exitButton} onPress={() => router.back()}>
            <Text style={styles.exitText}>Back to Levels</Text>
          </TouchableOpacity>
        </View>
      </GameLayout>
    )
  }

  const currentQuestion = level.content.items[currentItem]

  return (
    <GameLayout title={`Level ${level.levelNumber}`}>
      <View style={styles.container}>
        {/* Header with progress */}
        <View style={styles.header}>
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {currentItem + 1}/{level.content.items.length}
            </Text>
            <Progress.Bar
              progress={(currentItem + 1) / level.content.items.length}
              width={200}
              color="#5D5FEF"
              unfilledColor="#3F3F5F"
              borderWidth={0}
            />
          </View>
          
          <View style={styles.livesContainer}>
            {[1, 2, 3].map((heart) => (
              <MaterialCommunityIcons
                key={heart}
                name={heart <= lives ? "heart" : "heart-outline"}
                size={24}
                color="#FF6B6B"
              />
            ))}
          </View>
        </View>

        {/* Score */}
        <View style={styles.scoreContainer}>
          <Text style={styles.scoreText}>Score: {score}</Text>
        </View>

        {/* Question */}
        <View style={styles.questionContainer}>
          <Text style={styles.questionText}>Find the picture for:</Text>
          <View style={styles.wordBox}>
            <Text style={styles.wordText}>{currentQuestion.word}</Text>
          </View>
        </View>

        {/* Image options grid */}
        <View style={styles.optionsGrid}>
          {shuffledOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard,
                selectedAnswer === option.word && feedback.show && (
                  option.correct ? styles.correctOption : styles.wrongOption
                ),
                feedback.show && !option.correct && styles.disabledOption
              ]}
              onPress={() => handleAnswer(option.word, option.correct)}
              disabled={feedback.show}
            >
              <Image source={{ uri: option.image }} style={styles.optionImage} />
              <Text style={styles.optionWord}>{option.word}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback message */}
        {feedback.show && (
          <View style={[
            styles.feedbackContainer,
            feedback.correct ? styles.correctFeedback : styles.wrongFeedback
          ]}>
            <Text style={styles.feedbackText}>{feedback.message}</Text>
          </View>
        )}
      </View>
    </GameLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#F44336',
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: '#5D5FEF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
  },
  livesContainer: {
    flexDirection: 'row',
    gap: 5,
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scoreText: {
    color: '#5D5FEF',
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
  },
  questionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  questionText: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 10,
  },
  wordBox: {
    backgroundColor: '#5D5FEF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 12,
  },
  wordText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  optionCard: {
    width: '48%',
    backgroundColor: '#2F2F42',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  optionImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
  },
  optionWord: {
    color: '#fff',
    fontSize: 16,
  },
  correctOption: {
    borderColor: '#4CAF50',
    backgroundColor: '#1F3A2F',
  },
  wrongOption: {
    borderColor: '#F44336',
    backgroundColor: '#3F2F2F',
  },
  disabledOption: {
    opacity: 0.5,
  },
  feedbackContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  correctFeedback: {
    backgroundColor: '#4CAF50',
  },
  wrongFeedback: {
    backgroundColor: '#F44336',
  },
  feedbackText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  completedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  completedTitle: {
    fontSize: 32,
    color: '#fff',
    fontFamily: 'Poppins-Bold',
    marginTop: 20,
  },
  completedScore: {
    fontSize: 18,
    color: '#aaa',
    marginTop: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 30,
  },
  playAgainButton: {
    backgroundColor: '#5D5FEF',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  playAgainText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
  },
  exitButton: {
    paddingHorizontal: 40,
    paddingVertical: 15,
  },
  exitText: {
    color: '#aaa',
    fontSize: 16,
  },
})

export default PicToWordGame