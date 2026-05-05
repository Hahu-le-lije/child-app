import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Dimensions, 
  Image,
  TouchableOpacity 
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import SafeAreaComponent from '@/components/SafeAreaComponent';
import { GAMES } from '@/const';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.75; // Shows a peek of the next card

const TrophyAlbum = () => {
  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  // We map your GAMES constant to trophies
  // Logic: If 'final_score' from your game data > 80, marked as earned
  const trophies = GAMES.map(game => ({
    ...game,
    earned: game.id === '1' || game.id === '3', // Dummy logic for now
    requirement: game.id === '1' ? "Accuracy > 80%" : "No hints used!"
  }));

  return (
    <SafeAreaComponent style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.menuButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Open menu"
          >
            <MaterialCommunityIcons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.title}>My Sticker Book 📖</Text>
        </View>
        <Text style={styles.subtitle}>Swipe to see your rewards!</Text>
      </View>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 20} // Snaps to each card
        decelerationRate="fast"
        contentContainerStyle={styles.albumScroll}
      >
        {trophies.map((item) => (
          <View key={item.id} style={styles.cardContainer}>
            <LinearGradient
              colors={item.earned ? ['#5D5FEF', '#3D5CFF'] : ['#3E3E55', '#2F2F42']}
              style={styles.stickerCard}
            >
              {/* Corner Ribbon for Earned Trophies */}
              {item.earned && (
                <View style={styles.ribbon}>
                  <Text style={styles.ribbonText}>UNLOCKED</Text>
                </View>
              )}

              <View style={[styles.imageWrapper, !item.earned && styles.lockedImage]}>
                <Image 
                  source={item.image} 
                  style={styles.stickerImage} 
                  resizeMode="contain" 
                />
                {!item.earned && (
                  <View style={styles.lockOverlay}>
                    <MaterialCommunityIcons name="lock" size={50} color="rgba(255,255,255,0.3)" />
                  </View>
                )}
              </View>

              <View style={styles.infoArea}>
                <Text style={styles.stickerTitle}>{item.title}</Text>
                <Text style={styles.stickerDesc}>
                  {item.earned ? "Amazing Job! ⭐⭐⭐" : `Challenge: ${item.requirement}`}
                </Text>
              </View>

              {item.earned ? (
                <TouchableOpacity style={styles.collectBtn}>
                  <Text style={styles.collectText}>SEE BADGE</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.playBtn}>
                  <Text style={styles.playText}>TRY MISSION</Text>
                </TouchableOpacity>
              )}
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Page Indicators (Dots) */}
      <View style={styles.indicatorContainer}>
        {trophies.map((_, i) => (
          <View key={i} style={[styles.dot, i === 0 && styles.activeDot]} />
        ))}
      </View>
    </SafeAreaComponent>
  );
};

export default TrophyAlbum;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: { paddingHorizontal: 30, marginTop: 20 },
  headerTop: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  menuButton: { marginRight: 12, padding: 4 },
  title: {
    flex: 1,
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
  },
  subtitle: { fontSize: 16, color: '#B0B0C0', fontFamily: 'Poppins-Regular' },
  
  albumScroll: { paddingLeft: 30, paddingRight: 30, paddingVertical: 40 },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: 20,
    height: 420,
    elevation: 15,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  stickerCard: {
    flex: 1,
    borderRadius: 40,
    padding: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  ribbon: {
    position: 'absolute',
    top: 20,
    right: -30,
    backgroundColor: '#FFD700',
    paddingVertical: 5,
    paddingHorizontal: 40,
    transform: [{ rotate: '45deg' }],
  },
  ribbonText: { color: '#1F1F39', fontSize: 10, fontFamily: 'Poppins-Bold' },
  imageWrapper: {
    width: 180,
    height: 180,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  lockedImage: { opacity: 0.3 },
  stickerImage: { width: '70%', height: '70%' },
  lockOverlay: { position: 'absolute' },
  
  infoArea: { alignItems: 'center' },
  stickerTitle: { fontSize: 26, color: 'white', fontFamily: 'Poppins-Bold', textAlign: 'center' },
  stickerDesc: { fontSize: 14, color: '#E0E0FF', textAlign: 'center', marginTop: 5 },
  
  collectBtn: { backgroundColor: '#FFFFFF', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  collectText: { color: '#3D5CFF', fontFamily: 'Poppins-Bold' },
  playBtn: { backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 30, paddingVertical: 12, borderRadius: 20 },
  playText: { color: 'white', fontFamily: 'Poppins-Bold' },

  indicatorContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#3E3E55', marginHorizontal: 4 },
  activeDot: { backgroundColor: '#3D5CFF', width: 20 },
});