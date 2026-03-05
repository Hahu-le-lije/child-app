import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';
import * as Progress from 'react-native-progress'; // Optional: npm i react-native-progress

const { width } = Dimensions.get('window');

const GAME_CONTENT = [
  { id: '1', title: 'Fidel Tracing Pack', size: '12 MB', status: 'downloaded', icon: 'draw' },
  { id: '2', title: 'Story Video: The Lion', size: '45 MB', status: 'downloading', progress: 0.65, icon: 'play-circle' },
  { id: '3', title: 'Animal Word Pack', size: '8 MB', status: 'available', icon: 'panda' },
  { id: '4', title: 'Phonics Audio Pack', size: '22 MB', status: 'available', icon: 'volume-high' },
  { id: '5', title: 'Sentence Builder assets', size: '15 MB', status: 'downloaded', icon: 'link-variant' },
];

const Content = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const renderItem = ({ item }: { item: typeof GAME_CONTENT[0] }) => (
    <View style={styles.contentCard}>
      <View style={[styles.iconContainer, { backgroundColor: item.status === 'downloaded' ? '#20BF6B20' : '#5D5FEF20' }]}>
        <MaterialCommunityIcons 
          name={item.icon as any} 
          size={28} 
          color={item.status === 'downloaded' ? '#20BF6B' : '#5D5FEF'} 
        />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.contentTitle}>{item.title}</Text>
        <Text style={styles.contentSize}>{item.size}</Text>
        
        {item.status === 'downloading' && (
          <View style={styles.progressWrapper}>
             <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '65%' }]} />
             </View>
             <Text style={styles.progressPercent}>65%</Text>
          </View>
        )}
      </View>

      <TouchableOpacity style={styles.actionButton}>
        {item.status === 'downloaded' ? (
          <MaterialCommunityIcons name="check-circle" size={26} color="#20BF6B" />
        ) : item.status === 'downloading' ? (
          <TouchableOpacity><Ionicons name="close-circle" size={26} color="#FF6B6B" /></TouchableOpacity>
        ) : (
          <Ionicons name="cloud-download-outline" size={26} color="#5D5FEF" />
        )}
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Backpack 🎒</Text>
        <Text style={styles.subtitle}>Download games to play without internet</Text>
      </View>

      {/* --- Storage Info Stats --- */}
      <View style={styles.storageStats}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Free Space</Text>
          <Text style={styles.statValue}>1.2 GB</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Offline Games</Text>
          <Text style={styles.statValue}>12</Text>
        </View>
      </View>

      <FlatList
        data={GAME_CONTENT}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listPadding}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity style={styles.updateAllBtn}>
        <Text style={styles.updateAllText}>Download All Available</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Content;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F39',
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#B0B0C0',
    marginTop: 4,
  },
  storageStats: {
    flexDirection: 'row',
    backgroundColor: '#2A2A40',
    marginHorizontal: 24,
    marginVertical: 20,
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statBox: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#8585A6',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
  },
  divider: {
    width: 1,
    height: '60%',
    backgroundColor: '#3F3F5F',
  },
  listPadding: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  contentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A40',
    padding: 16,
    borderRadius: 22,
    marginBottom: 12,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginLeft: 15,
  },
  contentTitle: {
    fontSize: 15,
    fontFamily: 'Poppins-SemiBold',
    color: '#FFFFFF',
  },
  contentSize: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#8585A6',
    marginTop: 2,
  },
  progressWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#3F3F5F',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#5D5FEF',
  },
  progressPercent: {
    color: '#5D5FEF',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    marginLeft: 8,
  },
  actionButton: {
    padding: 5,
  },
  updateAllBtn: {
    position: 'absolute',
    bottom: 30,
    left: 24,
    right: 24,
    backgroundColor: '#5D5FEF',
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  updateAllText: {
    color: '#FFFFFF',
    fontFamily: 'Poppins-Bold',
    fontSize: 15,
  },
});