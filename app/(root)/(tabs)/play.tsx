import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import SafeAreaComponent from '@/components/SafeAreaComponent';
import GameCard from '@/components/GameCard';
import { GAMES } from '@/const';



const Play = () => {
  const renderGame = ({ item }: { item: typeof GAMES[0] }) => (
    <GameCard
      title={item.title}
      desc={item.desc}
      image={item.image}
      featured={item.featured}
    />
  );

  return (
    <SafeAreaComponent style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Educational Games</Text>
        <Text style={styles.headerSub}>Pick a mission to start learning!</Text>
      </View>

      <FlatList
        data={GAMES}
        renderItem={renderGame}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaComponent>
  );
};

export default Play;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F39',
  },

  header: {
    paddingHorizontal: 20,
    marginTop: 10,
    marginBottom: 14,
  },

  headerTitle: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },

  headerSub: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#A0A0B5',
    marginTop: 4,
  },

  listContent: {
    paddingBottom: 30,
    alignSelf: 'center',
  },
});