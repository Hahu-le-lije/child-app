import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  Switch
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons} from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [isSoundOn, setIsSoundOn] = useState(true);
  const [imageError, setImageError] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
    
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <LinearGradient 
              colors={['#5D5FEF', '#A5A6F6']} 
              style={styles.avatarGlow} 
            />
            <Image source={user?.avatar && !imageError ? { uri:`data:image/png;base64,${user.avatar}`}: require('@/assets/images/F2I.png')} style={styles.mainAvatar} 
            onError={()=>setImageError(true)}
            />
           
          </View>
          <Text style={styles.username}>{user?.username || "Super Learner"}</Text>
        </View>

      
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
            <Text style={styles.statValue}>1,240</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="fire" size={24} color="#FF4D4D" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Day Streak</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.statBox}>
            <MaterialCommunityIcons name="trophy" size={24} color="#FFD93D" />
            <Text style={styles.statValue}>8</Text>
            <Text style={styles.statLabel}>Badges</Text>
          </View>
        </View>

     
       

      
        <Text style={styles.sectionTitle}>Game Settings</Text>
        <View style={styles.settingsContainer}>
      

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <View style={[styles.settingIcon, { backgroundColor: '#FFD93D20' }]}>
                <MaterialCommunityIcons name="volume-high" size={22} color="#FFD93D" />
              </View>
              <Text style={styles.settingText}>Sound Effects</Text>
            </View>
            <Switch 
              value={isSoundOn} 
              onValueChange={setIsSoundOn}
              trackColor={{ false: '#3F3F5F', true: '#20BF6B' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

      
        <TouchableOpacity style={styles.logoutBtn} onPress={()=>{
          logout();
          router.replace('/(auth)/log-in');
        }}>
          <MaterialCommunityIcons name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>
            App Version {Constants.manifest2?.extra?.expoClient?.version ?? Constants.expoConfig?.version}
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F1F39',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  avatarContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGlow: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    opacity: 0.25,
  },
  mainAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  levelBadge: {
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#FFD93D',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 3,
    borderColor: '#1F1F39',
  },
  levelText: {
    fontFamily: 'Poppins-Bold',
    fontSize: 12,
    color: '#1F1F39',
  },
  username: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#FFFFFF',
    marginTop: 15,
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#5D5FEF',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: '#2A2A40',
    marginHorizontal: 20,
    padding: 20,
    borderRadius: 25,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: 30,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginTop: 5,
  },
  statLabel: {
    color: '#8585A6',
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: '#3F3F5F',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginLeft: 25,
    marginBottom: 15,
  },
  avatarPicker: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  avatarOption: {
    width: 80,
    height: 80,
    backgroundColor: '#2A2A40',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#5D5FEF',
    backgroundColor: '#3F3F5F',
  },
  optionImg: {
    width: 60,
    height: 60,
  },
  settingsContainer: {
    backgroundColor: '#2A2A40',
    marginHorizontal: 20,
    borderRadius: 25,
    padding: 10,
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  settingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    padding: 15,
  },
  logoutText: {
    color: '#FF6B6B',
    fontFamily: 'Poppins-Bold',
    fontSize: 16,
    marginLeft: 10,
  },
  versionText: {
    textAlign: 'center',
    color: '#3F3F5F',
    fontSize: 12,
    marginTop: 10,
    fontFamily: 'Poppins-Regular',
  }
});