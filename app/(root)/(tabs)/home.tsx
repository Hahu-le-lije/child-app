import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Dimensions, 
  Image 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import { useAuthStore } from '@/store/authStore';
import SafeAreaComponent from '@/components/SafeAreaComponent';
import { categories, GAMES } from '@/const';
import { Href, useRouter } from 'expo-router';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 60) / 2;

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const router = useRouter();
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaComponent style={styles.container}>
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
 
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.menuButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <MaterialCommunityIcons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.greeting}>Hi, {user?.username || 'Hero'}</Text>
            <Text style={styles.subGreeting}>Ready for a new mission?</Text>
          </View>
          <TouchableOpacity style={styles.pointsBadge}>
            <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
            <Text style={styles.pointsText}>120</Text>
          </TouchableOpacity>
        </View>

       
        <View style={styles.catWrapper}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.catScroll}>
            {categories.map((cat) => (
              <TouchableOpacity key={cat.id} style={styles.catItem} activeOpacity={0.8} onPress={() => router.push(`/(root)/${cat.route}` as Href)}>
                <View style={[styles.catCircle, { backgroundColor: cat.color }]}>
                  <MaterialCommunityIcons name={cat.icon as any} size={30} color="white" />
                </View>
                <Text style={styles.catText}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

    
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Missions</Text>
        </View>

        <View style={styles.grid}>
          {GAMES.map((game) => (
            <TouchableOpacity 
              key={game.id} 
              style={styles.gameCard}
              onPress={() => router.push(`/(root)/${game.route}` as Href)}
              activeOpacity={0.9}
            >
             
              <View style={styles.gameImageContainer}>
                 <Image source={game.image} style={styles.gameImage} resizeMode="contain" />
              </View>

   
              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle} numberOfLines={1}>{game.title}</Text>
              
                <View style={styles.playTag}>
                   <Text style={styles.playTagText}>GO!</Text>
                   <MaterialCommunityIcons name="arrow-right-bold-circle" size={14} color="white" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaComponent>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "transparent",
  },
  scrollContent: { 
    paddingBottom: 40 
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 15,
    marginBottom: 20,
  },
  menuButton: {
    marginRight: 12,
    padding: 4,
  },
  headerTitles: {
    flex: 1,
    minWidth: 0,
    marginTop:20
  },
  greeting: { 
    fontSize: 28, 
    fontFamily: 'Poppins-Bold', 
    color: '#FFFFFF' 
  },
  subGreeting: { 
    fontSize: 16, 
    fontFamily: 'Poppins-Regular', 
    color: '#B0B0C0' 
  },
  pointsBadge: {
    flexDirection: 'row',
    backgroundColor: '#2F2F42',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3D5CFF',
  },
  pointsText: { 
    marginLeft: 6, 
    fontFamily: 'Poppins-Bold', 
    color: '#FFFFFF', 
    fontSize: 18 
  },
  

  catWrapper: { 
    marginBottom: 30 
  },
  catScroll: { 
    paddingHorizontal: 20 
  },
  catItem: { 
    alignItems: 'center', 
    marginRight: 24 
  },
  catCircle: {
    width: 70,
    height: 70,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  catText: { 
    color: '#FFFFFF', 
    fontSize: 14, 
    fontFamily: 'Poppins-SemiBold' 
  },


  sectionHeader: { 
    paddingHorizontal: 24, 
    marginBottom: 20 
  },
  sectionTitle: { 
    fontSize: 22, 
    fontFamily: 'Poppins-Bold', 
    color: '#FFFFFF' 
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  gameCard: {
    width: CARD_WIDTH,
    backgroundColor: '#2F2F42',
    borderRadius: 25,
    marginBottom: 20,
    padding: 12,
 
    borderBottomWidth: 6,
    borderBottomColor: '#16162A',
  },
  gameImageContainer: {
    backgroundColor: '#3E3E55',
    height: 120,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gameImage: { 
    width: '85%', 
    height: '85%' 
  },
  gameInfo: { 
    paddingHorizontal: 4 
  },
  gameTitle: { 
    color: 'white', 
    fontSize: 16, 
    fontFamily: 'Poppins-Bold', 
    marginBottom: 6 
  },
  playTag: {
    backgroundColor: '#3D5CFF',
    flexDirection: 'row',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: 'center',
  },
  playTagText: { 
    color: 'white', 
    fontSize: 12, 
    fontFamily: 'Poppins-Bold', 
    marginRight: 6 
  },
});