import { View, Text ,StyleSheet,TouchableOpacity} from 'react-native'
import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'

const HeroCard = () => {
  return (
       <TouchableOpacity activeOpacity={0.9} style={styles.heroContainer}>
          <LinearGradient
            colors={['#5D5FEF', '#8E2DE2']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.heroCard}
          >
            <View style={styles.heroInfo}>
              <Text style={styles.heroTag}>TOP MISSION</Text>
              <Text style={styles.heroTitle}>Fidel Tracing: &quot;ሀ&quot;</Text>
              <Text style={styles.heroSubText}>Trace and hear the sound!</Text>
              
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '45%' }]} />
              </View>
              
              <TouchableOpacity style={styles.playBtn}>
                <Text style={styles.playBtnText}>Play Now</Text>
                <Ionicons name="play-circle" size={18} color="#5D5FEF" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>

          </LinearGradient>
        </TouchableOpacity>
    
  )
}
export default HeroCard
const styles = StyleSheet.create({
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

})