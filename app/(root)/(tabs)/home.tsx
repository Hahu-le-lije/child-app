import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';

const { width } = Dimensions.get('window');

const Home = () => {
  // Get the username from your Auth Store
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* --- Header Section --- */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.username || 'Learner'} 👋</Text>
            <Text style={styles.subGreeting}>Which mission will you choose?</Text>
          </View>
          <View style={styles.pointsBadge}>
            <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
            <Text style={styles.pointsText}>120</Text>
          </View>
        </View>

        {/* --- Quick Game Categories --- */}
        <View style={styles.categories}>
          {[
            { name: 'Trace', icon: 'fountain-pen-tip', color: '#FF6B6B' },
            { name: 'Match', icon: 'puzzle', color: '#4ECDC4' },
            { name: 'Speak', icon: 'microphone', color: '#20BF6B' },
            { name: 'Build', icon: 'toy-brick-outline', color: '#6C5CE7' },
          ].map((cat, index) => (
            <TouchableOpacity key={index} style={styles.catItem}>
              <View style={[styles.catCircle, { backgroundColor: cat.color }]}>
                <MaterialCommunityIcons name={cat.icon as any} size={26} color="white" />
              </View>
              <Text style={styles.catText}>{cat.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* --- Featured Mission (Hero Card) --- */}
        <TouchableOpacity activeOpacity={0.9} style={styles.heroContainer}>
          <LinearGradient 
            colors={['#5D5FEF', '#8E2DE2']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroInfo}>
              <Text style={styles.heroTag}>TOP MISSION</Text>
              <Text style={styles.heroTitle}>Fidel Tracing: "ሀ"</Text>
              <Text style={styles.heroSubText}>Trace and hear the sound!</Text>
              
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '45%' }]} />
              </View>
              
              <TouchableOpacity style={styles.playBtn}>
                <Text style={styles.playBtnText}>Play Now</Text>
                <Ionicons name="play-circle" size={18} color="#5D5FEF" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>

            <Image 
               source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3022/3022221.png' }} 
               style={styles.heroImage} 
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* --- Game Selection List --- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Learning Games</Text>
          <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
        </View>

        <GameCard 
          title="Pic-to-Word Match" 
          desc="Learn vocabulary with pictures" 
          icon="image-multiple" 
          color="#FFD93D" 
        />

        <GameCard 
          title="Sentence Builder" 
          desc="Connect words to make sense" 
          icon="segment" 
          color="#FF8A5B" 
        />

        <GameCard 
          title="Story Time Quiz" 
          desc="Read stories and win prizes" 
          icon="book-open-variant" 
          color="#F78FB3" 
        />

      </ScrollView>
    </SafeAreaView>
  );
};

// Internal Game Card Component
const GameCard = ({ title, desc, icon, color }: any) => (
  <TouchableOpacity style={styles.gameCard}>
    <View style={[styles.gameIconBox, { backgroundColor: color + '20' }]}>
      <MaterialCommunityIcons name={icon} size={28} color={color} />
    </View>
    <View style={styles.gameTextContent}>
      <Text style={styles.gameTitle}>{title}</Text>
      <Text style={styles.gameDesc}>{desc}</Text>
    </View>
    <View style={styles.arrowBox}>
      <Ionicons name="chevron-forward" size={18} color="#5F5F7E" />
    </View>
  </TouchableOpacity>
);

export default Home;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F39',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 25,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#B0B0C0',
  },
  pointsBadge: {
    flexDirection: 'row',
    backgroundColor: '#2A2A40',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#3F3F5F',
  },
  pointsText: {
    marginLeft: 6,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  categories: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  catItem: {
    alignItems: 'center',
    width: width * 0.22,
  },
  catCircle: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  catText: {
    color: '#B0B0C0',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  heroContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  heroCard: {
    borderRadius: 30,
    padding: 24,
    height: 190,
    flexDirection: 'row',
    overflow: 'hidden',
  },
  heroInfo: {
    flex: 1,
    zIndex: 2,
  },
  heroTag: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontFamily: 'Poppins-Bold',
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    marginTop: 4,
  },
  heroSubText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 3,
    width: '70%',
    marginTop: 15,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  playBtn: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginTop: 18,
  },
  playBtnText: {
    color: '#5D5FEF',
    fontFamily: 'Poppins-Bold',
    fontSize: 13,
  },
  heroImage: {
    width: 140,
    height: 140,
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.9,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  seeAll: {
    color: '#5D5FEF',
    fontFamily: 'Poppins-SemiBold',
    fontSize: 13,
  },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A40',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
  },
  gameIconBox: {
    width: 55,
    height: 55,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameTextContent: {
    flex: 1,
    marginLeft: 15,
  },
  gameTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  gameDesc: {
    fontSize: 12,
    color: '#B0B0C0',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  arrowBox: {
    width: 30,
    height: 30,
    borderRadius: 10,
    backgroundColor: '#3F3F5F',
    justifyContent: 'center',
    alignItems: 'center',
  },
});