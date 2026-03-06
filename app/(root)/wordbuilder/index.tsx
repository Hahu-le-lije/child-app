import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import GameLayout from '@/components/GameLayout'
import { router } from 'expo-router'
import { getLevelsForGame } from '@/services/gameContentService'

const WordBuilder = () => {
  const [levels, setLevels] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      // Word Builder reuses words content; we map to `word_picture` levels for now.
      const rows = await getLevelsForGame('word_picture')
      setLevels(rows)
    })()
  }, [])

  return (
    <GameLayout title="WordBuilder">
      <View style={styles.container}>
        <FlatList
          data={levels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/(root)/wordbuilder/${item.id}`)}>
              <Text style={styles.title}>{item.title || `Level ${item.level_number}`}</Text>
              <Text style={styles.subtitle}>Build the word from letters</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </GameLayout>
  )
}

export default WordBuilder

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { backgroundColor: '#2F2F42', borderRadius: 14, padding: 16, marginBottom: 12 },
  title: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' },
  subtitle: { color: '#aaa', marginTop: 4, fontSize: 12 },
})