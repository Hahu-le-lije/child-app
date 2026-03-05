import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions, 
  FlatList
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import GameCard from '@/components/GameCard';
import SafeAreaComponent from '@/components/SafeAreaComponent';
import HeroCard from '@/components/HeroCard';
import { categories } from '@/const';

const { width } = Dimensions.get('window');

const Home = () => {
  
  const user = useAuthStore((state) => state.user);

  return (
    <SafeAreaComponent style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
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

      
        <FlatList
          data={categories}
          keyExtractor={(item, index) => index.toString()}
          numColumns={4} 
          contentContainerStyle={styles.categories}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.catItem}>
              <View style={[styles.catCircle, { backgroundColor: item.color }]}>
                <MaterialCommunityIcons name={item.icon as any} size={26} color="white" />
              </View>
              <Text style={styles.catText}>{item.name}</Text>
            </TouchableOpacity>
          )}
          />

        
        <HeroCard/>
        
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
    </SafeAreaComponent>
  );
};


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
 
});