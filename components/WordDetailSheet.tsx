import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import Modal from 'react-native-modal';
import type { WordData } from '@/services/gaming/useWordDetails';

interface WordDetailProps {
  isVisible: boolean;
  onClose: () => void;
  selectedWord: string | null;
  details: WordData | null;
  loading?: boolean;
  error?: string | null;
}

const WordDetailSheet = ({ isVisible, onClose, selectedWord, details, loading, error }: WordDetailProps) => {
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
        {!!selectedWord && <Text style={styles.wordText}>{selectedWord}</Text>}

        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color="#3D5CFF" />
            <Text style={styles.metaText}>Loading word details...</Text>
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : details ? (
          <>
            {!!details.phonetic && (
              <Text style={styles.pronunciation}>/{details.phonetic}/</Text>
            )}

            <View style={styles.section}>
              <Text style={styles.label}>Meaning</Text>
              <Text style={styles.value}>{details.definition}</Text>
            </View>

            {!!details.learning_content?.length && (
              <View style={styles.section}>
                <Text style={styles.label}>Example Sentences</Text>
                {details.learning_content.slice(0, 3).map((item, index) => (
                  <View key={`${item.amharic}-${index}`} style={styles.sentenceItem}>
                    <Text style={styles.sentence}>{item.amharic}</Text>
                    {!!item.translation && (
                      <Text style={styles.translation}>{item.translation}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}
          </>
        ) : (
          <Text style={styles.metaText}>Tap a word to see details.</Text>
        )}

        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Text style={styles.closeText}>Close</Text>
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
  sentenceItem: { marginBottom: 10 },
  translation: { color: '#BABBC9', fontSize: 14, marginTop: 3 },
  loadingWrap: { alignItems: 'center', gap: 8, paddingVertical: 8 },
  metaText: { color: '#BABBC9', fontSize: 14, marginVertical: 12 },
  errorText: { color: '#FF7D7D', fontSize: 14, marginVertical: 12, textAlign: 'center' },
  closeBtn: { backgroundColor: '#3D5CFF', padding: 15, borderRadius: 15, width: '100%', alignItems: 'center' },
  closeText: { color: 'white', fontWeight: 'bold' }
});

export default WordDetailSheet;