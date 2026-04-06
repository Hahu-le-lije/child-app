import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import type { DrawerContentComponentProps } from '@react-navigation/drawer';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useAuthStore } from '@/store/authStore';
import { images } from '@/const';

const CustomSidebar = ({ navigation }: DrawerContentComponentProps) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [parentLock, setParentLock] = useState<{
    href: Href;
    prompt: string;
    answer: number;
  } | null>(null);
  const [parentAnswerInput, setParentAnswerInput] = useState('');

  const closeDrawer = useCallback(() => {
    navigation.closeDrawer();
  }, [navigation]);

  const navigateAndClose = useCallback(
    (href: Href) => {
      closeDrawer();
      router.push(href);
    },
    [closeDrawer, router]
  );

  const openParentLock = useCallback((href: Href) => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    setParentAnswerInput('');
    setParentLock({
      href,
      prompt: `${n1} + ${n2} = ?`,
      answer: n1 + n2,
    });
  }, []);

  const submitParentLock = useCallback(() => {
    if (!parentLock) return;
    const value = parseInt(parentAnswerInput.trim(), 10);
    if (value === parentLock.answer) {
      const target = parentLock.href;
      setParentLock(null);
      navigateAndClose(target);
    } else {
      Alert.alert('Incorrect', 'Access denied.');
    }
  }, [parentAnswerInput, parentLock, navigateAndClose]);

  const handleLogout = useCallback(() => {
    closeDrawer();
    logout();
  }, [closeDrawer, logout]);

  return (
    <View style={styles.container}>
      <Modal
        visible={parentLock !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setParentLock(null)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setParentLock(null)}
            accessibilityRole="button"
            accessibilityLabel="Dismiss parental lock"
          />
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Parental lock</Text>
            <Text style={styles.modalPrompt}>
              {parentLock ? `Solve: ${parentLock.prompt}` : ''}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={parentAnswerInput}
              onChangeText={setParentAnswerInput}
              keyboardType="number-pad"
              placeholder="Your answer"
              placeholderTextColor="#6E6E8D"
              autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnGhost]}
                onPress={() => setParentLock(null)}
              >
                <Text style={styles.modalBtnGhostText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, styles.modalBtnPrimary]}
                onPress={submitParentLock}
              >
                <Text style={styles.modalBtnText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
          onPress={() => navigateAndClose('/(root)/(tabs)/home')} 
          color="#3D5CFF"
        />
        <SidebarItem 
          icon="book-open-page-variant" 
          label="Sticker Book" 
          onPress={() => navigateAndClose('/(root)/(tabs)/progress')} 
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
          onPress={() => openParentLock('/(root)/(tabs)/profile')} 
          color="#BABBC9"
          isSmall
        />
        <SidebarItem 
          icon="cloud-download" 
          label="Get New Content" 
          onPress={() => openParentLock('/(root)/(tabs)/content')} 
          color="#BABBC9"
          isSmall
        />
        
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
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
  logoutText: { color: '#FF6B6B', marginLeft: 10, fontFamily: 'Poppins-Medium' },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#2F2F42',
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#3D5CFF',
    zIndex: 1,
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    marginBottom: 8,
  },
  modalPrompt: {
    color: '#BABBC9',
    fontSize: 16,
    fontFamily: 'Poppins-Medium',
    marginBottom: 14,
  },
  modalInput: {
    backgroundColor: '#1F1F39',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    marginBottom: 18,
  },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  modalBtnPrimary: {
    backgroundColor: '#3D5CFF',
    marginLeft: 10,
  },
  modalBtnGhost: { backgroundColor: 'transparent' },
  modalBtnText: { color: '#fff', fontFamily: 'Poppins-SemiBold' },
  modalBtnGhostText: { color: '#BABBC9', fontFamily: 'Poppins-Medium' },
});