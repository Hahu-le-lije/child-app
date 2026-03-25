import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity,Image } from 'react-native';
import Modal from 'react-native-modal';

interface WordDetailProps {
  isVisible: boolean;
  onClose: () => void;
  word: {
    text: string;
    pronunciation: string;
    meaning: string;
    sentence: string;
  } | null;
}

const WordDetailSheet = ({ isVisible, onClose, word }: WordDetailProps) => {
  if (!word) return null;

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      swipeDirection="down"
      onSwipeComplete={onClose}
      style={styles.modal}
    >
      <View style={styles.container}>
        <View style={styles.handle} />
        <Text style={styles.wordText}>{word.text}</Text>
        <Text style={styles.pronunciation}>/{word.pronunciation}/</Text>
        
        <View style={styles.section}>
          <Text style={styles.label}>Meaning</Text>
          <Text style={styles.value}>{word.meaning}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Example Sentence</Text>
          <Text style={styles.sentence}>{word.sentence}</Text>
        </View>

        <TouchableOpacity style={styles.audioBtn}>
          <Text style={styles.audioText}>Listen Pronunciation</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: { justifyContent: 'flex-end', margin: 0 },
  container: { backgroundColor: '#1F1F39', padding: 24, borderTopLeftRadius: 30, borderTopRightRadius: 30, alignItems: 'center' },
  handle: { width: 40, height: 5, backgroundColor: '#3E3E55', borderRadius: 10, marginBottom: 20 },
  wordText: { fontSize: 40, color: 'white', fontFamily: 'Abyssinica_SIL' },
  pronunciation: { color: '#3D5CFF', fontSize: 18, marginBottom: 20 },
  section: { width: '100%', marginBottom: 20 },
  label: { color: '#BABBC9', fontSize: 14, marginBottom: 5 },
  value: { color: 'white', fontSize: 18 },
  sentence: { color: 'white', fontSize: 18, fontStyle: 'italic' },
  audioBtn: { backgroundColor: '#3D5CFF', padding: 15, borderRadius: 15, width: '100%', alignItems: 'center' },
  audioText: { color: 'white', fontWeight: 'bold' }
});

export default WordDetailSheet;