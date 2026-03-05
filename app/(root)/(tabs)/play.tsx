import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import SafeAreaComponent from '@/components/SafeAreaComponent';

const { width } = Dimensions.get('window');

const GAMES = [
  { id: '1', title: 'Fidel Tracing', icon: 'draw', color: '#FF6B6B', desc: 'Write letters' },
  { id: '2', title: 'Fidel Match', icon: 'puzzle', color: '#4ECDC4', desc: 'Find pairs' },
  { id: '3', title: 'Pic-to-Word', icon: 'image-multiple', color: '#FFD93D', desc: 'Match images' },
  { id: '4', title: 'Word Builder', icon: 'hammer-wrench', color: '#6C5CE7', desc: 'Construct words' },
  { id: '5', title: 'Sentence Fun', icon: 'segment', color: '#A5A6F6', desc: 'Rearrange words' },
  { id: '6', title: 'Listen & Fill', icon: 'ear-hearing', color: '#FF8A5B', desc: 'Audio quiz' },
  { id: '7', title: 'Speak Up', icon: 'microphone', color: '#20BF6B', desc: 'Practice speaking' },
  { id: '8', title: 'Story Quiz', icon: 'book-open-page-variant', color: '#F78FB3', desc: 'Comprehension' },
];

const Play = () => {
  const renderGame = ({ item }: { item: typeof GAMES[0] }) => (
    <TouchableOpacity activeOpacity={0.9} style={styles.cardContainer}>
      <View style={[styles.gameCard, { backgroundColor: '#2A2A40' }]}>
        <LinearGradient
          colors={[item.color, item.color + 'AA']}
          style={styles.iconCircle}
        >
          <MaterialCommunityIcons name={item.icon as any} size={32} color="white" />
        </LinearGradient>
        <Text style={styles.gameTitle}>{item.title}</Text>
        <Text style={styles.gameDesc}>{item.desc}</Text>
      </View>
      </TouchableOpacity>
  
  );

  return (
    <SafeAreaComponent style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Game Zone 🎮</Text>
        <Text style={styles.headerSub}>Pick a mission to start learning!</Text>
      </View>

      <FlatList
        data={GAMES}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaComponent>
  );
};

export default Play;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1F1F39' },
  header: { paddingHorizontal: 24, marginVertical: 20 },
  headerTitle: { fontSize: 28, fontFamily: 'Poppins-Bold', color: '#fff' },
  headerSub: { fontSize: 14, fontFamily: 'Poppins-Regular', color: '#B0B0C0' },
  listContent: { paddingHorizontal: 15, paddingBottom: 30 },
  cardContainer: { width: width / 2 - 20, margin: 5 },
  gameCard: {
    padding: 20,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    height: 180,
  },
  iconCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameTitle: { color: '#fff', fontFamily: 'Poppins-Bold', fontSize: 15, textAlign: 'center' },
  gameDesc: { color: '#8585A6', fontSize: 11, fontFamily: 'Poppins-Regular', marginTop: 4 },
});