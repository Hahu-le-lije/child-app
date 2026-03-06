import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameContent } from '@/services/gameContentService'

const StoryQuizLevel = () => {
  const { id } = useLocalSearchParams()
  const levelId = String(id)

  const [stories, setStories] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      const rows = await getGameContent('story', levelId)
      setStories(rows || [])
      setCurrent(0)
      setPicked(null)
      setMsg('')
    })()
  }, [levelId])

  const story = stories[current]
  const questions = useMemo(() => {
    if (!story?.questions) return []
    try {
      return JSON.parse(story.questions)
    } catch {
      return []
    }
  }, [story])

  const q = questions[0]
  const opts = useMemo(() => {
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
    const ok = opt === q.correct_answer
    setMsg(ok ? 'Correct!' : 'Try again')
    setTimeout(() => {
      setPicked(null)
      setMsg('')
      setCurrent((i) => (i + 1 < stories.length ? i + 1 : 0))
    }, 1200)
  }

  return (
    <GameLayout title={`Story Quiz ${levelId}`}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{story?.title || 'Story'}</Text>
        <Text style={styles.story}>{story?.content || '—'}</Text>

        <View style={styles.quizBox}>
          <Text style={styles.qText}>{q?.question || '—'}</Text>
          <View style={styles.opts}>
            {opts.map((o: string) => (
              <TouchableOpacity
                key={o}
                style={[
                  styles.opt,
                  picked === o && (o === q.correct_answer ? styles.correct : styles.wrong),
                ]}
                onPress={() => pick(o)}
                disabled={!!picked}
              >
                <Text style={styles.optText}>{o}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {!!msg && <Text style={styles.msg}>{msg}</Text>}
      </ScrollView>
    </GameLayout>
  )
}

export default StoryQuizLevel

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { color: '#fff', fontSize: 20, fontFamily: 'Poppins-Bold', marginBottom: 10 },
  story: { color: '#ddd', fontSize: 18, fontFamily: 'Abyssinica_SIL', lineHeight: 28 },
  quizBox: { marginTop: 16, backgroundColor: '#2F2F42', borderRadius: 12, padding: 14 },
  qText: { color: '#fff', fontSize: 16, marginBottom: 10 },
  opts: { gap: 10 },
  opt: { backgroundColor: '#3F3F5F', borderRadius: 10, padding: 12 },
  optText: { color: '#fff', fontFamily: 'Abyssinica_SIL', fontSize: 18 },
  msg: { marginTop: 14, color: '#5D5FEF', fontSize: 16, textAlign: 'center' },
  correct: { backgroundColor: '#1F3A2F', borderWidth: 2, borderColor: '#4CAF50' },
  wrong: { backgroundColor: '#3F2F2F', borderWidth: 2, borderColor: '#F44336' },
})

