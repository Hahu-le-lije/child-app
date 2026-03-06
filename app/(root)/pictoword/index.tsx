import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { router } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameLevels } from '@/services/contentApi'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'

const { width } = Dimensions.get('window')
const cardWidth = (width - 60) / 2 // 2 columns with padding

const PicToWord = () => {
  const [levels, setLevels] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLevels()
  }, [])

  const loadLevels = async () => {
    setLoading(true)
    const gameLevels = await getGameLevels('word_picture')
    // For now, set all levels as unlocked for testing
    const levelsWithUnlock = gameLevels.map(level => ({
      ...level,
      unlocked: true, // All levels unlocked for testing
      completed: false,
      stars: 0
    }))
    setLevels(levelsWithUnlock)
    setLoading(false)
  }

  const navigateToLevel = (levelId: string) => {
    router.push(`/(root)/pictoword/${levelId}`)
  }

  const getDifficultyColor = (difficulty: number) => {
    switch(difficulty) {
      case 1: return ['#4CAF50', '#45a049'] // Easy - Green
      case 2: return ['#FFC107', '#ffb300'] // Medium - Yellow
      case 3: return ['#FF9800', '#fb8c00'] // Hard - Orange
      case 4: return ['#F44336', '#e53935'] // Very Hard - Red
      default: return ['#9C27B0', '#8e24aa'] // Expert - Purple
    }
  }

  const renderLevelCard = ({ item, index }) => {
    const colors = getDifficultyColor(item.difficulty)
    
    return (
      <TouchableOpacity 
        style={styles.cardContainer}
        onPress={() => navigateToLevel(item.id)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#2F2F42', '#1F1F39']}
          style={styles.card}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          {/* Level Number Badge */}
          <View style={styles.levelBadge}>
            <LinearGradient
              colors={colors}
              style={styles.levelBadgeGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Text style={styles.levelBadgeText}>{item.levelNumber}</Text>
            </LinearGradient>
          </View>

          {/* Thumbnail */}
          <Image 
            source={{ uri: item.thumbnail || 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=400' }} 
            style={styles.thumbnail}
          />

          {/* Content */}
          <View style={styles.cardContent}>
            <Text style={styles.levelTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.levelDescription} numberOfLines={2}>{item.description}</Text>
            
            {/* Difficulty Indicator */}
            <View style={styles.difficultyContainer}>
              <View style={[styles.difficultyDot, { backgroundColor: colors[0] }]} />
              <Text style={styles.difficultyText}>
                {item.difficulty === 1 ? 'Easy' : 
                 item.difficulty === 2 ? 'Medium' : 
                 item.difficulty === 3 ? 'Hard' : 
                 item.difficulty === 4 ? 'Very Hard' : 'Expert'}
              </Text>
            </View>

            {/* Stars earned (if completed) */}
            {item.stars > 0 && (
              <View style={styles.starsContainer}>
                {[1, 2, 3].map((star) => (
                  <MaterialCommunityIcons
                    key={star}
                    name={star <= item.stars ? "star" : "star-outline"}
                    size={14}
                    color="#FFD700"
                  />
                ))}
              </View>
            )}

            {/* Play Button */}
            <View style={styles.playButton}>
              <Text style={styles.playButtonText}>Play</Text>
              <MaterialCommunityIcons name="play" size={16} color="#fff" />
            </View>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <GameLayout title="Picture to Word">
        <View style={styles.centerContent}>
          <MaterialCommunityIcons name="image-search" size={60} color="#3F3F5F" />
          <Text style={styles.loadingText}>Loading levels...</Text>
        </View>
      </GameLayout>
    )
  }

  return (
    <GameLayout title="Picture to Word">
      <View style={styles.container}>
        {/* Header */}
        <LinearGradient
          colors={['#5D5FEF', '#7879F1']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <MaterialCommunityIcons name="image-multiple" size={40} color="#fff" />
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Word to Picture</Text>
              <Text style={styles.headerSubtitle}>Match words with pictures</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <LinearGradient
            colors={['#2F2F42', '#1F1F39']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="layers" size={24} color="#5D5FEF" />
            <Text style={styles.statNumber}>{levels.length}</Text>
            <Text style={styles.statLabel}>Total Levels</Text>
          </LinearGradient>

          <LinearGradient
            colors={['#2F2F42', '#1F1F39']}
            style={styles.statCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
            <Text style={styles.statNumber}>
              {levels.filter(l => l.completed).length}
            </Text>
            <Text style={styles.statLabel}>Completed</Text>
          </LinearGradient>
        </View>

        {/* Levels Grid */}
        {levels.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="image-off" size={80} color="#3F3F5F" />
            <Text style={styles.emptyText}>No levels available</Text>
            <TouchableOpacity onPress={loadLevels} style={styles.retryButton}>
              <LinearGradient
                colors={['#5D5FEF', '#7879F1']}
                style={styles.retryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.retryText}>Retry</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={levels}
            keyExtractor={(item) => item.id}
            renderItem={renderLevelCard}
            numColumns={2}
            columnWrapperStyle={styles.columnWrapper}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </GameLayout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
  },
  headerText: {
    marginLeft: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2F2F42',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  listContent: {
    padding: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardContainer: {
    width: cardWidth,
  },
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#3F3F5F',
  },
  levelBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 10,
  },
  levelBadgeGradient: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  thumbnail: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  levelTitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#fff',
    marginBottom: 4,
  },
  levelDescription: {
    fontSize: 10,
    color: '#aaa',
    marginBottom: 8,
    lineHeight: 14,
  },
  difficultyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  difficultyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  difficultyText: {
    fontSize: 10,
    color: '#aaa',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 2,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#5D5FEF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  playButtonText: {
    color: '#fff',
    fontSize: 12,
    fontFamily: 'Poppins-Medium',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#aaa',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  retryGradient: {
    paddingHorizontal: 30,
    paddingVertical: 12,
  },
  retryText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
  },
})

export default PicToWord