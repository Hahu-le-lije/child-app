import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/cms/gameContentService";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type StoryLevel = {
  id: string;
  level_number: number;
  title: string | null;
  description: string | null;
  difficulty: number | null;
};

const StoryQuizIndex = () => {
  const [levels, setLevels] = useState<StoryLevel[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const rows = await getLevelsForGame("story");
      if (!active) return;
      setLevels(rows as StoryLevel[]);
    };

    void load();
    return () => {
      active = false;
    };
  }, []);

  return (
    <GameLayout title="Story Quiz">
      <View style={styles.container}>
        <Text style={styles.heroTitle}>Read, Think, Answer</Text>
        <Text style={styles.heroSubtitle}>
          Read each story and answer the quiz questions to complete the level.
        </Text>

        <FlatList
          data={levels}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/(root)/storyquiz/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.levelTag}>LEVEL {item.level_number}</Text>
              <Text style={styles.title}>
                {item.title || `Story Level ${item.level_number}`}
              </Text>
              <Text style={styles.subtitle}>
                {item.description || "Story comprehension practice"}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No story levels found.</Text>
            </View>
          }
        />
      </View>
    </GameLayout>
  );
};

export default StoryQuizIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroTitle: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#AEB1D0",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  list: { paddingBottom: 20 },
  card: {
    backgroundColor: "#2A2E58",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  levelTag: {
    color: "#9EC5FF",
    fontFamily: "Poppins-SemiBold",
    fontSize: 10,
    marginBottom: 8,
  },
  title: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    marginBottom: 4,
  },
  subtitle: {
    color: "#C9CCE8",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
    lineHeight: 18,
  },
  emptyWrap: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
  },
  emptyText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Medium",
    fontSize: 15,
  },
});
