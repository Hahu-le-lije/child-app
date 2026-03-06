import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import GameLayout from '@/components/GameLayout'
import { router } from 'expo-router'
import { getLevelsForGame } from '@/services/gameContentService'

const ListenAndFill = () => {
  const [levels, setLevels] = useState<any[]>([])

  useEffect(() => {
    ;(async () => {
      const rows = await getLevelsForGame('fill_blank')
      setLevels(rows)
    })()
  }, [])

  return (
    <GameLayout title="Listen And Fill">
      <View style={styles.container}>
        <FlatList
          data={levels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => router.push(`/(root)/listenandfill/${item.id}`)}>
              <Text style={styles.title}>{item.title || `Level ${item.level_number}`}</Text>
              <Text style={styles.subtitle}>{item.description || 'Fill the missing word'}</Text>
            </TouchableOpacity>
          )}
        />
      </View>
    </GameLayout>
  )
}

export default ListenAndFill

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { padding: 16 },
  card: { backgroundColor: '#2F2F42', borderRadius: 14, padding: 16, marginBottom: 12 },
  title: { color: '#fff', fontSize: 16, fontFamily: 'Poppins-Bold' },
  subtitle: { color: '#aaa', marginTop: 4, fontSize: 12 },
})