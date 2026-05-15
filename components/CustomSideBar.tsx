import React, { useState, useCallback } from "react";
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
} from "react-native";
import type { DrawerContentComponentProps } from "@react-navigation/drawer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, type Href } from "expo-router";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { images, COLORS, SPACING, RADIUS, FONTS } from "@/const";
import SidebarItem from "./SideBarItem";
import { t } from "@/services/locales";

const CustomSidebar = ({ navigation }: DrawerContentComponentProps) => {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const language = useLanguageStore((state) => state.language);

  const [parentLock, setParentLock] = useState<{
    href: Href;
    prompt: string;
    answer: number;
  } | null>(null);

  const [parentAnswerInput, setParentAnswerInput] = useState("");

  const closeDrawer = useCallback(() => {
    navigation.closeDrawer();
  }, [navigation]);

  const navigateAndClose = useCallback(
    (href: Href) => {
      closeDrawer();
      router.push(href);
    },
    [closeDrawer, router],
  );

  const openParentLock = useCallback((href: Href) => {
    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;

    setParentAnswerInput("");
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
      Alert.alert(
        t(language, "sidebar.incorrectTitle"),
        t(language, "sidebar.accessDenied"),
      );
    }
  }, [language, parentAnswerInput, parentLock, navigateAndClose]);

  const handleLogout = useCallback(() => {
    closeDrawer();
    logout();
    router.replace("/(auth)/log-in");
  }, [closeDrawer, logout]);

  return (
    <View style={styles.container}>
      <Modal visible={!!parentLock} transparent animationType="fade">
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalBackdrop}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setParentLock(null)}
          />

          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {t(language, "sidebar.parentalLock")}
            </Text>

            <Text style={styles.modalPrompt}>
              {parentLock
                ? t(language, "sidebar.solve", { prompt: parentLock.prompt })
                : ""}
            </Text>

            <TextInput
              style={styles.modalInput}
              value={parentAnswerInput}
              onChangeText={setParentAnswerInput}
              keyboardType="number-pad"
              placeholder={t(language, "sidebar.yourAnswer")}
              placeholderTextColor={COLORS.muted}
              autoFocus
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalBtnGhost}
                onPress={() => setParentLock(null)}
              >
                <Text style={styles.modalBtnGhostText}>
                  {t(language, "sidebar.cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalBtnPrimary}
                onPress={submitParentLock}
              >
                <Text style={styles.modalBtnText}>
                  {t(language, "sidebar.continue")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <View style={styles.profileHeader}>
        <View style={styles.avatarCircle}>
          <Image source={images.Logo} style={styles.avatar} />
        </View>

        <Text style={styles.profileName}>
          {user?.username || t(language, "sidebar.littleHero")}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.menuSection}>
        <SidebarItem
          icon="controller-classic"
          label={t(language, "sidebar.myGames")}
          onPress={() => navigateAndClose("/(root)/(tabs)/home")}
        />

        <SidebarItem
          icon="book-open-page-variant"
          label={t(language, "sidebar.stickerBook")}
          onPress={() => navigateAndClose("/(root)/(tabs)/progress")}
        />

        <SidebarItem
          icon="account"
          label={t(language, "sidebar.profile")}
          onPress={() => navigateAndClose("/(root)/(tabs)/profile")}
        />
      </View>

      <View style={styles.parentSection}>
        <Text style={styles.parentTitle}>
          {t(language, "sidebar.parentZone")}
        </Text>

        <SidebarItem
          icon="cloud-download"
          label={t(language, "sidebar.getNewContent")}
          onPress={() => openParentLock("/(root)/(tabs)/content")}
          variant="secondary"
        />

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialCommunityIcons
            name="logout"
            size={20}
            color={COLORS.danger}
          />
          <Text style={styles.logoutText}>
            {t(language, "sidebar.switchAccount")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default CustomSidebar;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },

  profileHeader: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: SPACING.md,
  },

  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.card,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
  },

  avatar: {
    width: 50,
    height: 50,
  },

  profileName: {
    color: COLORS.textPrimary,
    fontSize: 20,
    fontFamily: FONTS.bold,
    marginTop: SPACING.sm,
  },

  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.lg,
  },

  menuSection: {
    marginBottom: SPACING.lg,
  },
  parentSection: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.lg,
  },

  parentTitle: {
    color: COLORS.muted,
    fontSize: 12,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.md,
    letterSpacing: 1,
  },

  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: SPACING.md,
  },

  logoutText: {
    color: COLORS.danger,
    marginLeft: SPACING.sm,
    fontFamily: FONTS.medium,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    padding: SPACING.lg,
  },

  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },

  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.bold,
    marginBottom: SPACING.sm,
  },

  modalPrompt: {
    color: COLORS.textSecondary,
    fontSize: 16,
    fontFamily: FONTS.medium,
    marginBottom: SPACING.md,
  },

  modalInput: {
    backgroundColor: COLORS.background,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontSize: 18,
    fontFamily: FONTS.semi,
    marginBottom: SPACING.lg,
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
  },

  modalBtnPrimary: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: RADIUS.md,
    marginLeft: SPACING.sm,
  },

  modalBtnGhost: {
    paddingVertical: 10,
    paddingHorizontal: 18,
  },

  modalBtnText: {
    color: "#fff",
    fontFamily: FONTS.semi,
  },

  modalBtnGhostText: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.medium,
  },
});
