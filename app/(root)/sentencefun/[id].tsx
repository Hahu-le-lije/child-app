import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameContent } from '@/services/gameContentService'

const SentenceFunLevel = () => {
  const { id } = useLocalSearchParams()
  const levelId = String(id)

  const [sentences, setSentences] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [pool, setPool] = useState<string[]>([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    ;(async () => {
      const rows = await getGameContent('sentence_building', levelId)
      const parsed = (rows || []).map((r) => {
        let words: { word: string; position: number }[] = []
        try {
          words = r.words ? JSON.parse(r.words) : []
        } catch {
          words = []
        }
        const ordered = words.sort((a, b) => a.position - b.position).map((w) => w.word)
        return { ...r, orderedWords: ordered }
      })
      setSentences(parsed)
      setCurrent(0)
      setPicked([])
      setPool(parsed[0]?.orderedWords?.slice().sort(() => Math.random() - 0.5) || [])
      setMessage('')
    })()
  }, [levelId])

  const target = useMemo(() => sentences[current]?.orderedWords || [], [sentences, current])

  const pick = (word: string) => {
    if (!word) return
    if (picked.includes(word)) return
    const next = [...picked, word]
    setPicked(next)
    if (next.length === target.length) {
      const ok = next.join(' ') === target.join(' ')
      setMessage(ok ? 'Correct!' : 'Try again')
      setTimeout(() => {
        const nextIdx = current + 1 < sentences.length ? current + 1 : 0
        setCurrent(nextIdx)
        setPicked([])
        const nextTarget = sentences[nextIdx]?.orderedWords || target
        setPool(nextTarget.slice().sort(() => Math.random() - 0.5))
        setMessage('')
      }, 900)
    }
  }

  return (
    <GameLayout title={`Sentence Fun ${levelId}`}>
      <View style={styles.container}>
        <Text style={styles.prompt}>Tap words to build the sentence:</Text>
        <View style={styles.box}>
          <Text style={styles.sentence}>{picked.join(' ') || '—'}</Text>
        </View>

        <View style={styles.pool}>
          {pool.map((w) => (
            <TouchableOpacity key={w} style={styles.wordChip} onPress={() => pick(w)}>
              <Text style={styles.wordText}>{w}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {!!message && <Text style={styles.message}>{message}</Text>}
      </View>
    </GameLayout>
  )
}

export default SentenceFunLevel

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  prompt: { color: '#aaa', fontSize: 14, marginBottom: 8 },
  box: { backgroundColor: '#2F2F42', borderRadius: 12, padding: 16, minHeight: 70, justifyContent: 'center' },
  sentence: { color: '#fff', fontSize: 20, fontFamily: 'Abyssinica_SIL', textAlign: 'center' },
  pool: { marginTop: 16, flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center' },
  wordChip: { backgroundColor: '#3F3F5F', paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999 },
  wordText: { color: '#fff', fontSize: 18, fontFamily: 'Abyssinica_SIL' },
  message: { marginTop: 14, color: '#5D5FEF', fontSize: 16, textAlign: 'center' },
})

