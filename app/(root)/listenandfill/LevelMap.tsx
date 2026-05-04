import React, { useEffect, useMemo, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type LevelMapItem = {
  id: string;
  levelNumber: number;
  locked?: boolean;
  completed?: boolean;
};

type LevelMapProps = {
  gameTitle: string;
  guideTitle?: string;
  guideText: string;
  levels: LevelMapItem[];
  onPressLevel: (item: LevelMapItem) => void;
  emptyMessage?: string;
};

const cardGradients = [
  ["rgba(59,91,217,0.95)", "rgba(31,58,138,0.95)"] as const,
  ["rgba(46,181,148,0.95)", "rgba(21,110,92,0.95)"] as const,
  ["rgba(255,171,76,0.95)", "rgba(204,106,28,0.95)"] as const,
  ["rgba(255,117,143,0.95)", "rgba(198,58,100,0.95)"] as const,
];

const LevelMap = ({
  gameTitle,
  guideTitle,
  guideText,
  levels,
  onPressLevel,
  emptyMessage = "No levels found yet.",
}: LevelMapProps) => {
  const insets = useSafeAreaInsets();
  const [guideVisible, setGuideVisible] = useState(false);

  const orderedLevels = useMemo(
    () => [...levels].sort((a, b) => a.levelNumber - b.levelNumber),
    [levels],
  );
  const displayLevels = useMemo(() => {
    const list = orderedLevels.slice();

    for (let index = list.length; index < 15; index += 1) {
      list.push({
        id: `demo-${index + 1}`,
        levelNumber: index + 1,
        locked: index >= 4,
      });
    }

    return list;
  }, [orderedLevels]);

  const progressionLevels = useMemo(() => {
    let nextLevelUnlocked = true;

    return displayLevels.map((item) => {
      const locked = item.locked === true || !nextLevelUnlocked;

      if (!item.completed) {
        nextLevelUnlocked = false;
      }

      return {
        ...item,
        locked,
      };
    });
  }, [displayLevels]);

  const currentId = progressionLevels.find(
    (item) => !item.locked && !item.completed,
  )?.id;
  const completedCount = progressionLevels.filter(
    (item) => item.completed,
  ).length;
  const unlockedCount = progressionLevels.filter((item) => !item.locked).length;
  const currentPulse = useMemo(() => new Animated.Value(1), [currentId]);

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(currentPulse, {
          toValue: 1.09,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(currentPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [currentPulse]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16 }]}>
      <LinearGradient
        colors={["#07172C", "#0D2342", "#123661"]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.bgOrbA} />
      <View style={styles.bgOrbB} />
      <View style={styles.bgOrbC} />

      <View style={styles.headerCard}>
        <View style={styles.headerGlow} />
        <View style={styles.headerTopRow}>
          <View style={styles.titleStack}>
            <Text style={styles.eyebrow}>MISSION MAP</Text>
            <Text style={styles.title}>{gameTitle}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              Pick a level, follow the trail, and keep climbing.
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setGuideVisible(true)}
            style={styles.helpButton}
          >
            <MaterialCommunityIcons name="help" size={18} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.statRow}>
          <View style={styles.statPill}>
            <MaterialCommunityIcons
              name="check-decagram"
              size={14}
              color="#8EF7C8"
            />
            <Text style={styles.statText}>{completedCount} done</Text>
          </View>
          <View style={styles.statPill}>
            <MaterialCommunityIcons
              name="lock-open-variant"
              size={14}
              color="#8AB4FF"
            />
            <Text style={styles.statText}>{unlockedCount} open</Text>
          </View>
          <View style={styles.statPill}>
            <MaterialCommunityIcons
              name="map-marker-path"
              size={14}
              color="#FFD36E"
            />
            <Text style={styles.statText}>{displayLevels.length} total</Text>
          </View>
        </View>
      </View>

      <View style={styles.trackShell}>
        <View pointerEvents="none" style={styles.trackLine} />

        <FlatList
          data={progressionLevels}
          inverted
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <View style={styles.emptyCard}>
                <MaterialCommunityIcons
                  name="map-search"
                  size={34}
                  color="rgba(255,255,255,0.75)"
                />
                <Text style={styles.emptyText}>{emptyMessage}</Text>
              </View>
            </View>
          }
          renderItem={({ item, index }) => {
            const side = item.levelNumber % 2 === 1 ? "left" : "right";
            const isLocked = Boolean(item.locked);
            const isCompleted = Boolean(item.completed);
            const isCurrent = item.id === currentId;
            const gradient = cardGradients[index % cardGradients.length];

            return (
              <View style={styles.rowWrap}>
                <View style={styles.routeNode}>
                  <View
                    style={[
                      styles.routeCore,
                      isLocked && styles.routeCoreLocked,
                      isCurrent && styles.routeCoreCurrent,
                    ]}
                  />
                </View>

                <View
                  style={side === "left" ? styles.leftSlot : styles.rightSlot}
                >
                  <Animated.View
                    style={
                      isCurrent
                        ? { transform: [{ scale: currentPulse }] }
                        : undefined
                    }
                  >
                    <TouchableOpacity
                      activeOpacity={isLocked ? 1 : 0.88}
                      disabled={isLocked}
                      onPress={() => onPressLevel(item)}
                      style={[
                        styles.levelCard,
                        isLocked && styles.levelCardLocked,
                        isCurrent && styles.levelCardCurrent,
                      ]}
                    >
                      <LinearGradient
                        colors={
                          isLocked
                            ? ["rgba(108,118,149,0.6)", "rgba(65,74,101,0.7)"]
                            : gradient
                        }
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.cardGradient}
                      >
                        <View style={styles.cardAccent} />
                        <View style={styles.cardTopRow}>
                          <View
                            style={[
                              styles.statusDot,
                              isLocked && styles.statusDotLocked,
                              isCompleted && !isLocked && styles.statusDotDone,
                              isCurrent && !isLocked && styles.statusDotCurrent,
                            ]}
                          >
                            <MaterialCommunityIcons
                              name={
                                isLocked
                                  ? "lock"
                                  : isCompleted
                                    ? "check"
                                    : isCurrent
                                      ? "star"
                                      : "circle-medium"
                              }
                              size={11}
                              color="#fff"
                            />
                          </View>
                        </View>

                        <View style={styles.cardBody}>
                          <View style={styles.badgeStack}>
                            <View
                              style={[
                                styles.levelBadge,
                                isLocked && styles.levelBadgeLocked,
                                isCurrent && styles.levelBadgeCurrent,
                              ]}
                            >
                              <Text style={styles.levelBadgeNumber}>
                                {item.levelNumber}
                              </Text>
                            </View>
                            {!isLocked ? (
                              <View style={styles.badgeShadow} />
                            ) : null}
                          </View>
                        </View>
                      </LinearGradient>
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>
            );
          }}
        />
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={guideVisible}
        onRequestClose={() => setGuideVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalIcon}>
              <MaterialCommunityIcons
                name="compass"
                size={28}
                color="#123661"
              />
            </View>
            <Text style={styles.modalTitle}>
              {guideTitle ?? `${gameTitle} Guide`}
            </Text>
            <Text style={styles.modalBody}>{guideText}</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => setGuideVisible(false)}
              style={styles.modalButton}
            >
              <Text style={styles.modalButtonText}>Let's go</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default LevelMap;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    overflow: "hidden",
  },
  bgOrbA: {
    position: "absolute",
    top: 70,
    left: -60,
    width: 180,
    height: 180,
    borderRadius: 999,
    backgroundColor: "rgba(90, 160, 255, 0.18)",
  },
  bgOrbB: {
    position: "absolute",
    top: 190,
    right: -70,
    width: 220,
    height: 220,
    borderRadius: 999,
    backgroundColor: "rgba(255, 192, 120, 0.12)",
  },
  bgOrbC: {
    position: "absolute",
    bottom: 120,
    left: 20,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(130, 255, 208, 0.12)",
  },
  headerCard: {
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
    backgroundColor: "rgba(12, 24, 46, 0.72)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
    overflow: "hidden",
  },
  headerGlow: {
    position: "absolute",
    top: -40,
    right: -20,
    width: 140,
    height: 140,
    borderRadius: 999,
    backgroundColor: "rgba(90, 160, 255, 0.2)",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 12,
  },
  titleStack: {
    flex: 1,
    alignItems: "center",
  },
  eyebrow: {
    color: "rgba(181, 208, 255, 0.8)",
    fontSize: 11,
    letterSpacing: 2,
    fontFamily: "Poppins-Bold",
    marginBottom: 8,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    lineHeight: 34,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
  subtitle: {
    color: "rgba(231, 239, 255, 0.82)",
    marginTop: 8,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins-Regular",
    textAlign: "center",
  },
  helpButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    flexWrap: "wrap",
  },
  statPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  statText: {
    color: "#fff",
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  trackShell: {
    flex: 1,
    position: "relative",
    paddingTop: 4,
  },
  trackLine: {
    position: "absolute",
    top: 18,
    bottom: 18,
    left: "50%",
    width: 6,
    marginLeft: -3,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  listContent: {
    paddingBottom: 28,
  },
  rowWrap: {
    minHeight: 122,
    justifyContent: "center",
    marginVertical: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  leftSlot: {
    flex: 1,
    alignItems: "flex-end",
    paddingRight: 28,
  },
  rightSlot: {
    flex: 1,
    alignItems: "flex-start",
    paddingLeft: 28,
  },
  routeNode: {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 24,
    height: 24,
    marginLeft: -12,
    marginTop: -12,
    borderRadius: 999,
    backgroundColor: "rgba(10, 18, 34, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  routeCore: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: "#8EF7C8",
  },
  routeCoreLocked: {
    backgroundColor: "#98A6C6",
  },
  routeCoreCurrent: {
    backgroundColor: "#FFD36E",
    width: 12,
    height: 12,
  },
  levelCard: {
    width: 96,
    height: 96,
    borderRadius: 999,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5,
  },
  cardLeft: {
    alignSelf: "center",
    marginRight: 0,
  },
  cardRight: {
    alignSelf: "center",
    marginLeft: 0,
  },
  levelCardLocked: {
    opacity: 0.86,
  },
  levelCardCurrent: {
    transform: [{ scale: 1.01 }],
  },
  cardGradient: {
    width: 96,
    height: 96,
    paddingVertical: 0,
    paddingHorizontal: 0,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  cardAccent: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 54,
    height: 54,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    position: "absolute",
    top: 7,
    right: 7,
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  statusDotLocked: {
    backgroundColor: "rgba(30, 39, 61, 0.38)",
  },
  statusDotDone: {
    backgroundColor: "rgba(17, 137, 97, 0.34)",
  },
  statusDotCurrent: {
    backgroundColor: "rgba(255, 211, 110, 0.28)",
  },
  cardBody: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  badgeStack: {
    width: 58,
    height: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeShadow: {
    position: "absolute",
    bottom: 3,
    width: 22,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  levelBadge: {
    width: 58,
    height: 58,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.16)",
  },
  levelBadgeLocked: {
    backgroundColor: "rgba(22, 32, 52, 0.48)",
    borderColor: "rgba(255,255,255,0.08)",
  },
  levelBadgeCurrent: {
    backgroundColor: "rgba(255, 255, 255, 0.24)",
    borderColor: "rgba(255, 211, 110, 0.5)",
  },
  levelBadgeNumber: {
    color: "#fff",
    fontSize: 22,
    lineHeight: 24,
    fontFamily: "Poppins-Bold",
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: "center",
  },
  emptyCard: {
    width: "88%",
    borderRadius: 24,
    paddingVertical: 26,
    paddingHorizontal: 20,
    alignItems: "center",
    gap: 12,
    backgroundColor: "rgba(12, 24, 46, 0.66)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  emptyText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 14,
    textAlign: "center",
    fontFamily: "Poppins-Medium",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(3, 8, 20, 0.58)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    width: "100%",
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(247, 250, 255, 0.98)",
  },
  modalIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18, 54, 97, 0.1)",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#0D1E3B",
    fontSize: 22,
    lineHeight: 28,
    fontFamily: "Poppins-Bold",
  },
  modalBody: {
    color: "#35516F",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
    fontFamily: "Poppins-Regular",
  },
  modalButton: {
    marginTop: 18,
    alignSelf: "flex-start",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: "#123661",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 13,
    fontFamily: "Poppins-Bold",
  },
});
