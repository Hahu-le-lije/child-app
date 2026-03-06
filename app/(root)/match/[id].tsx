import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameContent } from '@/services/gameContentService'

type MatchItem = {
  id: string
  word: string
  image_url?: string
  is_correct?: number
}

const MatchLevel = () => {
  const { id } = useLocalSearchParams()
  const levelId = String(id)

  const [rows, setRows] = useState<MatchItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      const data = (await getGameContent('matching', levelId)) as any[]
      setRows((data || []) as MatchItem[])
      setSelected(null)
      setMessage('')
    })()
  }, [levelId])

  const options = useMemo(() => {
    // Rows are a join (word repeated per image). Pick distinct options.
    const seen = new Set<string>()
    const out: { key: string; label: string; correct: boolean }[] = []
    for (const r of rows) {
      const key = `${r.id}:${r.image_url || ''}:${r.is_correct || 0}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ key, label: r.word, correct: (r.is_correct || 0) === 1 })
    }
    // fallback if no joined images
    if (out.length === 0) {
      const uniqueWords = Array.from(new Set(rows.map((r) => r.word))).slice(0, 4)
      return uniqueWords.map((w, idx) => ({ key: `${w}:${idx}`, label: w, correct: idx === 0 }))
    }
    return out.slice(0, 4)
  }, [rows])

  const handlePick = (opt: { key: string; label: string; correct: boolean }) => {
    if (selected) return
    setSelected(opt.key)
    setMessage(opt.correct ? 'Correct!' : 'Try again')
    setTimeout(() => {
      setSelected(null)
      setMessage('')
    }, 1200)
  }

  return (
    <GameLayout title={`Match ${levelId}`}>
      <View style={styles.container}>
        <Text style={styles.help}>Pick the correct word (demo content)</Text>
        <View style={styles.grid}>
          {options.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[
                styles.card,
                selected === opt.key && (opt.correct ? styles.correct : styles.wrong),
              ]}
              onPress={() => handlePick(opt)}
              disabled={!!selected}
            >
              <Text style={styles.cardText}>{opt.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!!message && <Text style={styles.message}>{message}</Text>}
      </View>
    </GameLayout>
  )
}

export default MatchLevel

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  help: { color: '#fff', marginBottom: 12, fontSize: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    width: '48%',
    backgroundColor: '#2F2F42',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  cardText: { color: '#fff', fontSize: 18, fontFamily: 'Abyssinica_SIL' },
  message: { color: '#5D5FEF', marginTop: 14, fontSize: 16, textAlign: 'center' },
  correct: { backgroundColor: '#1F3A2F', borderWidth: 2, borderColor: '#4CAF50' },
  wrong: { backgroundColor: '#3F2F2F', borderWidth: 2, borderColor: '#F44336' },
})