import React, { useEffect, useMemo, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameContent } from '@/services/gameContentService'
import AudioButton from '@/components/AudioButton'
import { createRecorder, playAudio } from '@/services/audioService'

const SpeakUpLevel = () => {
  const { id } = useLocalSearchParams()
  const levelId = String(id)

  const [items, setItems] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [msg, setMsg] = useState('')
  const [recording, setRecording] = useState(false)
  const [recordedUri, setRecordedUri] = useState<string | null>(null)
  const [recorder, setRecorder] = useState<Awaited<ReturnType<typeof createRecorder>> | null>(null)

  useEffect(() => {
    ;(async () => {
      const rows = await getGameContent('pronunciation', levelId)
      setItems(rows || [])
      setCurrent(0)
      setMsg('')
      setRecordedUri(null)
    })()
  }, [levelId])

  const item = items[current]
  const expected = useMemo(() => String(item?.target_text || ''), [item])

  const next = () => {
    setMsg('')
    setRecordedUri(null)
    setCurrent((i) => (i + 1 < items.length ? i + 1 : 0))
  }

  const start = async () => {
    if (recording) return
    const r = await createRecorder()
    setRecorder(r)
    setRecording(true)
    setMsg('Recording...')
    await r.start()
  }

  const stop = async () => {
    if (!recording || !recorder) return
    const res = await recorder.stop()
    setRecording(false)
    setRecorder(null)
    setRecordedUri(res.uri)

    // Dummy feedback (AI integration later): short recordings likely incorrect.
    const ok = (res.durationMs ?? 0) > 700
    setMsg(ok ? 'Good job! (dummy feedback)' : 'Too short — try again (dummy feedback)')
  }

  return (
    <GameLayout title={`Speak Up ${levelId}`}>
      <View style={styles.container}>
        <Text style={styles.prompt}>Say this out loud:</Text>
        <View style={styles.box}>
          <Text style={styles.target}>{expected || '—'}</Text>
        </View>

        <View style={styles.row}>
          <AudioButton uri={item?.audio_url} label="Listen" style={{ flex: 1 }} />
          <TouchableOpacity
            style={[styles.btnOk, { flex: 1, backgroundColor: recording ? '#F44336' : '#20BF6B' }]}
            onPress={recording ? stop : start}
          >
            <Text style={styles.btnText}>{recording ? 'Stop' : 'Record'}</Text>
          </TouchableOpacity>
        </View>

        {recordedUri && (
          <View style={styles.row}>
            <TouchableOpacity style={[styles.btnNo, { flex: 1 }]} onPress={() => playAudio(recordedUri)}>
              <Text style={styles.btnText}>Play my voice</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.btnOk, { flex: 1 }]} onPress={next}>
              <Text style={styles.btnText}>Next</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.row}>
          <TouchableOpacity style={[styles.btnNo, { flex: 1 }]} onPress={next}>
            <Text style={styles.btnText}>Skip</Text>
          </TouchableOpacity>
        </View>

        {!!msg && <Text style={styles.msg}>{msg}</Text>}
      </View>
    </GameLayout>
  )
}

export default SpeakUpLevel

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  prompt: { color: '#aaa', marginBottom: 8, fontSize: 14 },
  box: { backgroundColor: '#2F2F42', borderRadius: 12, padding: 20, alignItems: 'center' },
  target: { color: '#fff', fontFamily: 'Abyssinica_SIL', fontSize: 46 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16 },
  btnOk: { flex: 1, backgroundColor: '#5D5FEF', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnNo: { flex: 1, backgroundColor: '#3F3F5F', padding: 12, borderRadius: 10, alignItems: 'center' },
  btnText: { color: '#fff', fontFamily: 'Poppins-Medium' },
  msg: { marginTop: 14, color: '#5D5FEF', fontSize: 16, textAlign: 'center' },
})

