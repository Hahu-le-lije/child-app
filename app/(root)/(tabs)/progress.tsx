import React, { useCallback, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DrawerActions, useFocusEffect, useNavigation } from "@react-navigation/native";
import SafeAreaComponent from "@/components/SafeAreaComponent";
import { COLORS, FONTS, GAMES, RADIUS, SPACING } from "@/const";
import { LinearGradient } from "expo-linear-gradient";
import { useAuthStore } from "@/store/authStore";
import { useClickSound } from "@/hooks/useSound";
import { GameProgress, SummaryStats, getProgressStats } from "@/services/db/progressStats.service";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;

const TrophyAlbum = () => {
  const navigation = useNavigation();
  const user = useAuthStore((state) => state.user);
  const playClickSound = useClickSound();
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<SummaryStats>({
    totalSessions: 0,
    avgScore: 0,
    bestScore: 0,
    totalMinutes: 0,
    uniqueGames: 0,
  });
  const [gameStats, setGameStats] = useState<GameProgress[]>([]);

  const loadProgress = useCallback(() => {
    try {
      setLoading(true);
      const result = getProgressStats(user?.id);
      setSummary(result.summary);
      setGameStats(result.gameStats);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadProgress();
    }, [loadProgress])
  );

  const openDrawer = async () => {
    await playClickSound();
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const gameStatsByType = useMemo(() => {
    const entries = gameStats.map((s) => [s.gameType.toLowerCase(), s]);
    return Object.fromEntries(entries) as Record<string, GameProgress>;
  }, [gameStats]);

  const stickerItems = useMemo(() => {
    return GAMES.map((game) => {
      const routeKey = String(game.route ?? "").toLowerCase();
      const directMatch = gameStatsByType[routeKey];
      const pronunciationAlias =
        routeKey === "speakup" ? gameStatsByType["pronunciation"] : undefined;
      const stats = directMatch ?? pronunciationAlias;
      const played = Boolean(stats && stats.sessionCount > 0);
      return {
        ...game,
        played,
        sessions: stats?.sessionCount ?? 0,
        avgScore: stats?.avgScore ?? 0,
        bestScore: stats?.bestScore ?? 0,
        minutes: Math.round((stats?.totalTime ?? 0) / 60),
        lastPlayed: stats?.lastPlayed ?? null,
      };
    });
  }, [gameStatsByType]);

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
            <MaterialCommunityIcons name="menu" size={28} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>My Sticker Book 📖</Text>
        </View>
        <Text style={styles.subtitle}>Your real progress from local game sessions.</Text>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Sessions</Text>
          <Text style={styles.summaryValue}>{summary.totalSessions}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Avg Score</Text>
          <Text style={styles.summaryValue}>{summary.avgScore}%</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Minutes</Text>
          <Text style={styles.summaryValue}>{summary.totalMinutes}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Games</Text>
          <Text style={styles.summaryValue}>{summary.uniqueGames}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + 20}
          decelerationRate="fast"
          contentContainerStyle={styles.albumScroll}
        >
          {stickerItems.map((item) => (
            <View key={item.id} style={styles.cardContainer}>
              <LinearGradient
                colors={item.played ? ["#5D5FEF", "#3D5CFF"] : ["#3E3E55", "#2F2F42"]}
                style={styles.stickerCard}
              >
                {item.played && (
                  <View style={styles.ribbon}>
                    <Text style={styles.ribbonText}>UNLOCKED</Text>
                  </View>
                )}

                <View style={[styles.imageWrapper, !item.played && styles.lockedImage]}>
                  <Image source={item.image} style={styles.stickerImage} resizeMode="contain" />
                  {!item.played && (
                    <View style={styles.lockOverlay}>
                      <MaterialCommunityIcons name="lock" size={50} color="rgba(255,255,255,0.3)" />
                    </View>
                  )}
                </View>

                <View style={styles.infoArea}>
                  <Text style={styles.stickerTitle}>{item.title}</Text>
                  {item.played ? (
                    <Text style={styles.stickerDesc}>
                      {item.sessions} sessions • Avg {item.avgScore}% • Best {item.bestScore}%
                    </Text>
                  ) : (
                    <Text style={styles.stickerDesc}>Play this game once to unlock its sticker.</Text>
                  )}
                  {item.played && item.lastPlayed && (
                    <Text style={styles.lastPlayed}>
                      Last played: {new Date(item.lastPlayed).toLocaleDateString()}
                    </Text>
                  )}
                </View>

                <View style={styles.footerPill}>
                  <Text style={styles.footerPillText}>
                    {item.played ? `${item.minutes} min played` : "Not started yet"}
                  </Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.indicatorContainer}>
        {stickerItems.map((item) => (
          <View key={item.id} style={[styles.dot, item.played && styles.activeDot]} />
        ))}
      </View>
    </SafeAreaComponent>
  );
};

export default TrophyAlbum;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "transparent" },
  header: { paddingHorizontal: 30, marginTop: 20 },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  menuButton: { marginRight: 12, padding: 4 },
  title: {
    flex: 1,
    fontSize: 28,
    fontFamily: FONTS.bold,
    color: COLORS.textPrimary,
  },
  subtitle: { fontSize: 14, color: COLORS.textSecondary, fontFamily: "Poppins-Regular" },
  summaryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: SPACING.lg,
    marginTop: SPACING.md,
  },
  summaryCard: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
  },
  summaryLabel: { color: COLORS.textSecondary, fontSize: 12, fontFamily: FONTS.medium },
  summaryValue: { color: COLORS.textPrimary, fontSize: 20, fontFamily: FONTS.bold, marginTop: 4 },
  loadingContainer: {
    height: 350,
    justifyContent: "center",
    alignItems: "center",
  },
  albumScroll: { paddingLeft: 30, paddingRight: 30, paddingVertical: 30 },
  cardContainer: {
    width: CARD_WIDTH,
    marginRight: 20,
    height: 420,
    elevation: 15,
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
  stickerCard: {
    flex: 1,
    borderRadius: 40,
    padding: 25,
    alignItems: "center",
    justifyContent: "space-between",
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.1)",
  },
  ribbon: {
    position: "absolute",
    top: 20,
    right: -30,
    backgroundColor: "#FFD700",
    paddingVertical: 5,
    paddingHorizontal: 40,
    transform: [{ rotate: "45deg" }],
  },
  ribbonText: { color: "#1F1F39", fontSize: 10, fontFamily: FONTS.bold },
  imageWrapper: {
    width: 180,
    height: 180,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 90,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  lockedImage: { opacity: 0.3 },
  stickerImage: { width: "70%", height: "70%" },
  lockOverlay: { position: "absolute" },
  infoArea: { alignItems: "center" },
  stickerTitle: { fontSize: 24, color: "white", fontFamily: FONTS.bold, textAlign: "center" },
  stickerDesc: { fontSize: 14, color: "#E0E0FF", textAlign: "center", marginTop: 6 },
  lastPlayed: { fontSize: 12, color: "#BABBC9", marginTop: 6, fontFamily: FONTS.medium },
  footerPill: {
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
  },
  footerPillText: { color: "white", fontFamily: FONTS.bold, fontSize: 12 },
  indicatorContainer: { flexDirection: "row", justifyContent: "center", marginBottom: 30 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#3E3E55", marginHorizontal: 4 },
  activeDot: { backgroundColor: "#3D5CFF", width: 20 },
});