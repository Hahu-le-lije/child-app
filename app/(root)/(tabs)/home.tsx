import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  DrawerActions,
  useFocusEffect,
  useNavigation,
} from "@react-navigation/native";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import SafeAreaComponent from "@/components/SafeAreaComponent";
import { GAMES } from "@/const";
import { Href, useRouter } from "expo-router";
import { t } from "@/services/locales";
import {
  GameProgress,
  ProfileStats,
  SessionInsight,
  SummaryStats,
  getProgressStats,
  getProfileStats,
  getRecentSessionInsights,
} from "@/services/db/progressStats.service";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;

const GAME_TYPE_BY_ROUTE: Record<string, string[]> = {
  listenandfill: ["fill_blank"],
  match: ["voice_word_match"],
  pictoword: ["picture_to_word"],
  speakup: ["pronunciation"],
  storyquiz: ["story"],
  tracing: ["tracing"],
  wordbuilder: ["word_builder"],
};

const GAME_ROUTE_BY_TYPE: Record<string, string> = Object.entries(
  GAME_TYPE_BY_ROUTE,
).reduce<Record<string, string>>((acc, [route, gameTypes]) => {
  for (const gameType of gameTypes) acc[gameType] = route;
  return acc;
}, {});

const Home = () => {
  const user = useAuthStore((state) => state.user);
  const language = useLanguageStore((state) => state.language);
  const router = useRouter();
  const navigation = useNavigation();
  const [stats, setStats] = useState<ProfileStats>({
    points: 0,
    dayStreak: 0,
    badges: 0,
  });
  const [summary, setSummary] = useState<SummaryStats>({
    totalSessions: 0,
    avgScore: 0,
    bestScore: 0,
    totalMinutes: 0,
    uniqueGames: 0,
  });
  const [gameStats, setGameStats] = useState<GameProgress[]>([]);
  const [recentSession, setRecentSession] = useState<SessionInsight | null>(
    null,
  );

  const loadStats = useCallback(() => {
    const progress = getProgressStats(user?.id);
    setStats(getProfileStats(user?.id));
    setSummary(progress.summary);
    setGameStats(progress.gameStats);
    setRecentSession(getRecentSessionInsights(user?.id, 1)[0] ?? null);
  }, [user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadStats();
    }, [loadStats]),
  );

  const openDrawer = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const gameStatsByType = gameStats.reduce<Record<string, GameProgress>>(
    (acc, item) => {
      acc[item.gameType.toLowerCase()] = item;
      return acc;
    },
    {},
  );

  const gamesWithProgress = GAMES.map((game) => {
    const routeKey = String(game.route ?? "").toLowerCase();
    const statsForGame = (GAME_TYPE_BY_ROUTE[routeKey] ?? [routeKey])
      .map((gameType) => gameStatsByType[gameType])
      .find((item) => item && item.sessionCount > 0);

    return {
      ...game,
      sessions: statsForGame?.sessionCount ?? 0,
      bestScore: statsForGame?.bestScore ?? 0,
      lastPlayed: statsForGame?.lastPlayed ?? null,
    };
  });

  const continueRoute = recentSession
    ? GAME_ROUTE_BY_TYPE[recentSession.gameType.toLowerCase()]
    : null;
  const continueGame =
    gamesWithProgress.find((game) => game.route === continueRoute) ?? null;
  const suggestedGame = continueGame ?? gamesWithProgress[0];
  const continueTitle = continueGame
    ? `Continue ${continueGame.title}`
    : "Start your first mission";
  const continueSubtitle = continueGame
    ? `Last score ${recentSession?.score ?? 0}% • Best ${continueGame.bestScore}%`
    : "Play any game once and your progress will appear here.";
  const continueButtonText = continueGame ? "Resume" : "Start";

  return (
    <SafeAreaComponent style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={openDrawer}
            style={styles.menuButton}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel={t(language, "home.openMenu")}
          >
            <MaterialCommunityIcons name="menu" size={28} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.headerTitles}>
            <Text style={styles.greeting}>
              {t(language, "home.greetingPrefix")},{" "}
              {user?.first_name || t(language, "home.heroFallback")}
            </Text>
            <Text style={styles.subGreeting}>
              {t(language, "home.subGreeting")}
            </Text>
          </View>
          <TouchableOpacity style={styles.pointsBadge}>
            <MaterialCommunityIcons name="star" size={24} color="#FFD700" />
            <Text style={styles.pointsText}>{stats.points}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsStrip}>
          <View style={styles.statPill}>
            <MaterialCommunityIcons name="fire" size={18} color="#FF7A59" />
            <Text style={styles.statNumber}>{stats.dayStreak}</Text>
            <Text style={styles.statLabel}>day streak</Text>
          </View>
          <View style={styles.statPill}>
            <MaterialCommunityIcons name="controller" size={18} color="#7FD1FF" />
            <Text style={styles.statNumber}>{summary.totalSessions}</Text>
            <Text style={styles.statLabel}>sessions</Text>
          </View>
          <View style={styles.statPill}>
            <MaterialCommunityIcons name="trophy" size={18} color="#FFD93D" />
            <Text style={styles.statNumber}>{summary.bestScore}%</Text>
            <Text style={styles.statLabel}>best</Text>
          </View>
        </View>

        {suggestedGame ? (
          <TouchableOpacity
            style={styles.continueCard}
            activeOpacity={0.9}
            onPress={() => router.push(`/(root)/${suggestedGame.route}` as Href)}
          >
            <View style={styles.continueTextArea}>
              <Text style={styles.continueKicker}>
                {continueGame ? "Pick up where you left off" : "Ready to play"}
              </Text>
              <Text style={styles.continueTitle}>{continueTitle}</Text>
              <Text style={styles.continueSubtitle}>{continueSubtitle}</Text>
              <View style={styles.continueAction}>
                <Text style={styles.continueActionText}>
                  {continueButtonText}
                </Text>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={16}
                  color="#1F1F39"
                />
              </View>
            </View>
            <View style={styles.continueImageWrap}>
              <Image
                source={suggestedGame.image}
                style={styles.continueImage}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {t(language, "home.allMissions")}
          </Text>
        </View>

        <View style={styles.grid}>
          {gamesWithProgress.map((game) => (
            <TouchableOpacity
              key={game.id}
              style={styles.gameCard}
              onPress={() => router.push(`/(root)/${game.route}` as Href)}
              activeOpacity={0.9}
            >
              <View style={styles.gameImageContainer}>
                <Image
                  source={game.image}
                  style={styles.gameImage}
                  resizeMode="contain"
                />
              </View>

              <View style={styles.gameInfo}>
                <Text style={styles.gameTitle} numberOfLines={1}>
                  {game.title}
                </Text>
                <Text style={styles.gameProgressText} numberOfLines={1}>
                  {game.sessions > 0
                    ? `${game.sessions} plays • Best ${game.bestScore}%`
                    : "Not started yet"}
                </Text>

                <View style={styles.playTag}>
                  <Text style={styles.playTagText}>
                    {t(language, "home.go")}
                  </Text>
                  <MaterialCommunityIcons
                    name="arrow-right-bold-circle"
                    size={14}
                    color="white"
                  />
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    marginTop: 20,
  },
  greeting: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  subGreeting: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#B0B0C0",
  },
  pointsBadge: {
    flexDirection: "row",
    backgroundColor: "#2F2F42",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#3D5CFF",
  },
  pointsText: {
    marginLeft: 6,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
    fontSize: 18,
  },

  statsStrip: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 18,
  },
  statPill: {
    flex: 1,
    minHeight: 74,
    backgroundColor: "#2F2F42",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#3E3E55",
  },
  statNumber: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginTop: 3,
  },
  statLabel: {
    color: "#BABBC9",
    fontSize: 10,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  continueCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    minHeight: 168,
    borderRadius: 24,
    backgroundColor: "#E8F7FF",
    flexDirection: "row",
    overflow: "hidden",
    borderBottomWidth: 6,
    borderBottomColor: "#8ECFEF",
  },
  continueTextArea: {
    flex: 1,
    padding: 18,
    justifyContent: "center",
  },
  continueKicker: {
    color: "#25708F",
    fontSize: 12,
    fontFamily: "Poppins-SemiBold",
    marginBottom: 4,
  },
  continueTitle: {
    color: "#1F1F39",
    fontSize: 22,
    fontFamily: "Poppins-Bold",
  },
  continueSubtitle: {
    color: "#425466",
    fontSize: 12,
    fontFamily: "Poppins-Regular",
    marginTop: 6,
    lineHeight: 18,
  },
  continueAction: {
    marginTop: 14,
    backgroundColor: "#FFD93D",
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  continueActionText: {
    color: "#1F1F39",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  continueImageWrap: {
    width: 126,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(61,92,255,0.10)",
  },
  continueImage: {
    width: 104,
    height: 104,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontFamily: "Poppins-Bold",
    color: "#FFFFFF",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    justifyContent: "space-between",
  },
  gameCard: {
    width: CARD_WIDTH,
    backgroundColor: "#2F2F42",
    borderRadius: 25,
    marginBottom: 20,
    padding: 12,

    borderBottomWidth: 6,
    borderBottomColor: "#16162A",
  },
  gameImageContainer: {
    backgroundColor: "#3E3E55",
    height: 120,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  gameImage: {
    width: "85%",
    height: "85%",
  },
  gameInfo: {
    paddingHorizontal: 4,
  },
  gameTitle: {
    color: "white",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginBottom: 2,
  },
  gameProgressText: {
    color: "#BABBC9",
    fontSize: 11,
    fontFamily: "Poppins-Regular",
    marginBottom: 8,
  },
  playTag: {
    backgroundColor: "#3D5CFF",
    flexDirection: "row",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignItems: "center",
  },
  playTagText: {
    color: "white",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
    marginRight: 6,
  },
});
