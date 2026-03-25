import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { images } from '@/const';

const CustomSidebar = () => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const handleParentNavigation = (route: string) => {

    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    
    Alert.prompt(
      "Parental Lock 🔐",
      `Please solve: ${n1} + ${n2} = ?`,
      (input) => {
        if (parseInt(input) === n1 + n2) {
          router.push(route as any);
        } else {
          Alert.alert("Incorrect", "Access denied.");
        }
      }
    );
  };

  return (
    <View style={styles.container}>

      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Image source={images.Logo} style={styles.avatar} resizeMode="contain" />
        </View>
        <Text style={styles.profileName}>{user?.username || 'Little Hero'}</Text>
        <View style={styles.offlineBadge}>
          <MaterialCommunityIcons name="cloud-off" size={12} color="#4ECDC4" />
          <Text style={styles.offlineText}>OFFLINE MODE</Text>
        </View>
      </View>

      <View style={styles.divider} />

      
      <View style={styles.menuSection}>
        <SidebarItem 
          icon="controller-classic" 
          label="My Games" 
          onPress={() => router.push('/home')} 
          color="#3D5CFF"
        />
        <SidebarItem 
          icon="book-open-page-variant" 
          label="Sticker Book" 
          onPress={() => router.push('/progress')} 
          color="#FF6B6B"
        />
        <SidebarItem 
          icon="face-man-shimmer" 
          label="My Character" 
          onPress={() => Alert.alert("Coming Soon!", "Customize your buddy soon!")} 
          color="#6C5CE7"
        />
      </View>

    
      <View style={styles.parentSection}>
        <Text style={styles.parentTitle}>PARENT ZONE</Text>
        
        <SidebarItem 
          icon="chart-areaspline" 
          label="Progress Report" 
          onPress={() => handleParentNavigation('/parent/report')} 
          color="#BABBC9"
          isSmall
        />
        <SidebarItem 
          icon="cloud-download" 
          label="Get New Content" 
          onPress={() => handleParentNavigation('')} 
          color="#BABBC9"
          isSmall
        />
        
        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <MaterialCommunityIcons name="logout" size={20} color="#FF6B6B" />
          <Text style={styles.logoutText}>Switch Account</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};


const SidebarItem = ({ icon, label, onPress, color, isSmall = false }: any) => (
  <TouchableOpacity style={[styles.item, isSmall && styles.itemSmall]} onPress={onPress}>
    <View style={[styles.iconBg, { backgroundColor: isSmall ? '#2A2A40' : color }]}>
      <MaterialCommunityIcons name={icon} size={isSmall ? 18 : 24} color="white" />
    </View>
    <Text style={[styles.itemLabel, isSmall && styles.labelSmall]}>{label}</Text>
  </TouchableOpacity>
);

export default CustomSidebar;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1F1F39', padding: 20 },
  profileHeader: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2F2F42', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#3D5CFF' },
  avatar: { width: 50, height: 50 },
  profileName: { color: 'white', fontSize: 20, fontFamily: 'Poppins-Bold', marginTop: 10 },
  offlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(78, 205, 196, 0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10, marginTop: 5 },
  offlineText: { color: '#4ECDC4', fontSize: 10, fontFamily: 'Poppins-Bold', marginLeft: 4 },
  
  divider: { height: 1, backgroundColor: '#2F2F42', marginVertical: 20 },
  
  menuSection: { flex: 1 },
  item: { flexDirection: 'row', alignItems: 'center', marginBottom: 25 },
  itemSmall: { marginBottom: 15 },
  iconBg: { width: 45, height: 45, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
  itemLabel: { color: 'white', fontSize: 18, fontFamily: 'Poppins-SemiBold', marginLeft: 15 },
  labelSmall: { fontSize: 14, color: '#BABBC9' },

  parentSection: { borderTopWidth: 1, borderTopColor: '#2F2F42', paddingTop: 20, paddingBottom: 20 },
  parentTitle: { color: '#6E6E8D', fontSize: 12, fontFamily: 'Poppins-Bold', marginBottom: 15, letterSpacing: 1 },
  logoutBtn: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#FF6B6B', marginLeft: 10, fontFamily: 'Poppins-Medium' }
});