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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import { COLORS, SPACING, RADIUS, FONTS } from '@/const';

const Profile = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  const [isSoundOn, setIsSoundOn] = useState(true);
  const [imageError, setImageError] = useState(false);

  const navigation = useNavigation();

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
      
        <View style={styles.header}>
  <TouchableOpacity onPress={openDrawer} style={styles.menuButton}>
    <MaterialCommunityIcons name="menu" size={28} color={COLORS.textPrimary} />
  </TouchableOpacity>

  <Text style={styles.headerTitle}>Profile</Text>

            <View style={styles.avatarContainer}>
              <LinearGradient 
                colors={[COLORS.primary, '#A5A6F6']} 
                style={styles.avatarGlow} 
              />
              <Image 
                source={
                  user?.avatar && !imageError
                    ? { uri: `data:image/png;base64,${user.avatar}` }
                    : require('@/assets/images/F2I.png')
                }
                style={styles.mainAvatar}
                onError={() => setImageError(true)}
              />
            </View>

            <Text style={styles.username}>
              {user?.username || "Super Learner"}
            </Text>
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
              <View style={styles.settingIcon}>
                <MaterialCommunityIcons name="volume-high" size={22} color="#FFD93D" />
              </View>
              <Text style={styles.settingText}>Sound Effects</Text>
            </View>

            <Switch 
              value={isSoundOn} 
              onValueChange={setIsSoundOn}
              trackColor={{ false: COLORS.border, true: '#20BF6B' }}
              thumbColor="#FFF"
            />
          </View>
        </View>

      
        <TouchableOpacity
          style={styles.logoutBtn}
          onPress={() => {
            logout();
            router.replace('/(auth)/log-in');
          }}
        >
          <MaterialCommunityIcons name="logout" size={20} color={COLORS.danger} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

    
        <Text style={styles.versionText}>
          App Version {Constants.expoConfig?.version}
        </Text>

      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    paddingBottom: SPACING.xl,
  },

  
  header: {
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
  },
headerTitle: {

  marginTop:20,
  alignSelf: 'center',
  marginBottom: SPACING.lg,
  fontSize: 25,
  fontFamily: FONTS.bold,
  color: COLORS.textPrimary,
},
  menuButton: {
    position: 'absolute',
    left: SPACING.lg,
    top: 0,
    padding: SPACING.sm,
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
    borderRadius: RADIUS.round,
    opacity: 0.25,
  },

  mainAvatar: {
    width: 110,
    height: 110,
    borderRadius: RADIUS.round,
  },

  username: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
  },

  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: RADIUS.xl,
    justifyContent: 'space-around',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },

  statBox: {
    alignItems: 'center',
  },

  statValue: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginTop: 5,
  },

  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontFamily: FONTS.medium,
  },

  divider: {
    width: 1,
    height: 30,
    backgroundColor: COLORS.border,
  },

  sectionTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginLeft: SPACING.lg,
    marginBottom: SPACING.md,
  },

  settingsContainer: {
    backgroundColor: COLORS.card,
    marginHorizontal: SPACING.lg,
    borderRadius: RADIUS.xl,
    padding: SPACING.sm,
    marginBottom: SPACING.xl,
  },

  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.md,
  },

  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
    backgroundColor: '#FFD93D20',
  },

  settingText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontFamily: FONTS.semi,
  },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },

  logoutText: {
    color: COLORS.danger,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginLeft: SPACING.sm,
  },

  versionText: {
    textAlign: 'center',
    color: COLORS.border,
    fontSize: 12,
    marginTop: SPACING.sm,
    fontFamily: FONTS.medium,
  },
});