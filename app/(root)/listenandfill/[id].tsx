import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameContent } from '@/services/gameContentService'
import AudioButton from '@/components/AudioButton'

const ListenAndFillLevel = () => {
  const { id } = useLocalSearchParams()
  const levelId = String(id)

  const [items, setItems] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      const rows = await getGameContent('fill_blank', levelId)
      setItems(rows || [])
      setCurrent(0)
      setPicked(null)
      setMsg('')
    })()
  }, [levelId])

  const q = items[current]
  const options = useMemo(() => {
    if (!q?.options) return []
    try {
      return JSON.parse(q.options)
    } catch {
      return []
    }
  }, [q])

  const pick = (opt: string) => {
    if (picked) return
    setPicked(opt)
    const ok = opt === q.correct_word
    setMsg(ok ? 'Correct!' : 'Try again')
    setTimeout(() => {
      setPicked(null)
      setMsg('')
      setCurrent((i) => (i + 1 < items.length ? i + 1 : 0))
    }, 900)
  }

  return (
    <GameLayout title={`Listen & Fill ${levelId}`}>
      <View style={styles.container}>
        <Text style={styles.prompt}>Choose the missing word:</Text>
        <View style={styles.box}>
          <Text style={styles.sentence}>{q?.sentence || '—'}</Text>
        </View>
        <AudioButton uri={q?.audio_url} label="Play audio" style={{ marginBottom: 14 }} />
        <View style={styles.row}>
          {options.map((o: string) => (
            <TouchableOpacity
              key={o}
              style={[
                styles.option,
                picked === o && (o === q.correct_word ? styles.correct : styles.wrong),
              ]}
              onPress={() => pick(o)}
              disabled={!!picked}
            >
              <Text style={styles.optionText}>{o}</Text>
            </TouchableOpacity>
          ))}
        </View>
        {!!msg && <Text style={styles.msg}>{msg}</Text>}
      </View>
    </GameLayout>
  )
}

export default ListenAndFillLevel

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  prompt: { color: '#aaa', marginBottom: 8, fontSize: 14 },
  box: { backgroundColor: '#2F2F42', borderRadius: 12, padding: 16, marginBottom: 16 },
  sentence: { color: '#fff', fontFamily: 'Abyssinica_SIL', fontSize: 20, textAlign: 'center' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  option: { backgroundColor: '#3F3F5F', paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  optionText: { color: '#fff', fontFamily: 'Abyssinica_SIL', fontSize: 18 },
  msg: { marginTop: 14, color: '#5D5FEF', fontSize: 16, textAlign: 'center' },
  correct: { backgroundColor: '#1F3A2F', borderWidth: 2, borderColor: '#4CAF50' },
  wrong: { backgroundColor: '#3F2F2F', borderWidth: 2, borderColor: '#F44336' },
})

