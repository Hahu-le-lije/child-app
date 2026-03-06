import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameContent } from '@/services/gameContentService'

const WordBuilderLevel = () => {
  const { id } = useLocalSearchParams()
  const levelId = String(id)

  const [words, setWords] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle')

  useEffect(() => {
    ;(async () => {
      // WordBuilder uses `words` table. Our DB currently stores sample words under `word_picture` levels.
      const rows = await getGameContent('word_picture', levelId)
      setWords(rows || [])
      setCurrent(0)
      setPicked([])
      setStatus('idle')
    })()
  }, [levelId])

  const target = useMemo(() => words[current]?.word || '', [words, current])
  const shuffled = useMemo(() => target.split('').slice().sort(() => Math.random() - 0.5), [target])

  const pick = (ch: string) => {
    if (!target) return
    if (status !== 'idle') return
    const next = [...picked, ch]
    setPicked(next)
    const attempt = next.join('')
    if (attempt.length === target.length) {
      setStatus(attempt === target ? 'correct' : 'wrong')
      setTimeout(() => {
        setPicked([])
        setStatus('idle')
        setCurrent((i) => (i + 1 < words.length ? i + 1 : 0))
      }, 900)
    }
  }

  return (
    <GameLayout title={`Word Builder ${levelId}`}>
      <View style={styles.container}>
        <Text style={styles.prompt}>Build the word:</Text>
        <View style={styles.wordBox}>
          <Text style={styles.wordText}>
            {picked.join('') || '—'}
          </Text>
        </View>

        <View style={styles.lettersRow}>
          {shuffled.map((ch, idx) => (
            <TouchableOpacity key={`${ch}-${idx}`} style={styles.letter} onPress={() => pick(ch)}>
              <Text style={styles.letterText}>{ch}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {status !== 'idle' && (
          <Text style={[styles.feedback, status === 'correct' ? styles.ok : styles.bad]}>
            {status === 'correct' ? 'Correct!' : 'Try again'}
          </Text>
        )}
      </View>
    </GameLayout>
  )
}

export default WordBuilderLevel

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  prompt: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  wordBox: { backgroundColor: '#2F2F42', borderRadius: 12, padding: 18, alignItems: 'center' },
  wordText: { color: '#fff', fontSize: 28, fontFamily: 'Abyssinica_SIL' },
  lettersRow: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  letter: { backgroundColor: '#5D5FEF', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  letterText: { color: '#fff', fontSize: 20, fontFamily: 'Abyssinica_SIL' },
  feedback: { marginTop: 14, textAlign: 'center', fontSize: 16 },
  ok: { color: '#4CAF50' },
  bad: { color: '#F44336' },
})

