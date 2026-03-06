import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import GameLayout from '@/components/GameLayout'
import { getGameContent } from '@/services/gameContentService'

const SpeakUpLevel = () => {
  const { id } = useLocalSearchParams()
  const levelId = String(id)

  const [items, setItems] = useState<any[]>([])
  const [current, setCurrent] = useState(0)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    ;(async () => {
      const rows = await getGameContent('pronunciation', levelId)
      setItems(rows || [])
      setCurrent(0)
      setMsg('')
    })()
  }, [levelId])

  const item = items[current]

  // This is a UI stub: real speech recognition can be added later.
  const markAttempt = (ok: boolean) => {
    setMsg(ok ? 'Nice!' : 'Try again')
    setTimeout(() => {
      setMsg('')
      setCurrent((i) => (i + 1 < items.length ? i + 1 : 0))
    }, 900)
  }

  return (
    <GameLayout title={`Speak Up ${levelId}`}>
      <View style={styles.container}>
        <Text style={styles.prompt}>Say this out loud:</Text>
        <View style={styles.box}>
          <Text style={styles.target}>{item?.target_text || '—'}</Text>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.btnOk} onPress={() => markAttempt(true)}>
            <Text style={styles.btnText}>I said it</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnNo} onPress={() => markAttempt(false)}>
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

