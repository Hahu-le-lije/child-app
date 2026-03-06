import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useLocalSearchParams } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameContent } from '@/services/gameContentService'
import AudioButton from '@/components/AudioButton'

type MatchItem = {
  id: string
  word: string
  audio_url?: string
  image_url?: string
  is_correct?: number
}

const MatchLevel = () => {
  const { id } = useLocalSearchParams()
  const levelId = String(id)

  const [rows, setRows] = useState<MatchItem[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [message, setMessage] = useState<string>('')
  const [round, setRound] = useState(0)

  useEffect(() => {
    ;(async () => {
      const data = (await getGameContent('matching', levelId)) as any[]
      setRows((data || []) as MatchItem[])
      setSelected(null)
      setMessage('')
      setRound(0)
    })()
  }, [levelId])

  const words = useMemo(() => {
    const map = new Map<string, MatchItem>()
    for (const r of rows) {
      if (!map.has(r.id)) map.set(r.id, r)
    }
    return Array.from(map.values())
  }, [rows])

  const currentPrompt = useMemo(() => {
    if (words.length === 0) return null
    return words[round % words.length]
  }, [round, words])

  const options = useMemo(() => {
    if (!currentPrompt) return []
    const others = words.filter((w) => w.id !== currentPrompt.id)
    const shuffledOthers = others.slice().sort(() => Math.random() - 0.5)
    const candidates = [currentPrompt, ...shuffledOthers.slice(0, 3)].sort(() => Math.random() - 0.5)
    return candidates.map((w) => ({ key: w.id, label: w.word, correct: w.id === currentPrompt.id }))
  }, [currentPrompt, words])

  const handlePick = (opt: { key: string; label: string; correct: boolean }) => {
    if (selected) return
    setSelected(opt.key)
    setMessage(opt.correct ? 'Correct!' : 'Try again')
    setTimeout(() => {
      setSelected(null)
      setMessage('')
      if (opt.correct) setRound((r) => r + 1)
    }, 1200)
  }

  return (
    <GameLayout title={`Match ${levelId}`}>
      <View style={styles.container}>
        <Text style={styles.help}>Listen, then tap the correct written form.</Text>
        <AudioButton uri={currentPrompt?.audio_url} label="Play sound" style={{ marginBottom: 14 }} />
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