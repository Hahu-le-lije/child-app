import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import GameLayout from "@/components/GameLayout";
import { getLevelsForGame } from "@/services/gameContentService";

type SentenceLevel = {
  id: string;
  level_number: number;
  title: string | null;
  description: string | null;
};

const SentenceFunIndex = () => {
  const [levels, setLevels] = useState<SentenceLevel[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      const rows = await getLevelsForGame("sentence_building");
      if (!active) return;
      setLevels(rows as SentenceLevel[]);
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <GameLayout title="Sentence Fun">
      <View style={styles.container}>
        <Text style={styles.heroTitle}>Build Sentences Step by Step</Text>
        <Text style={styles.heroSubtitle}>
          Tap words in the correct order to complete each sentence.
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
                  pathname: "/(root)/sentencefun/[id]",
                  params: { id: item.id },
                })
              }
            >
              <Text style={styles.levelTag}>LEVEL {item.level_number}</Text>
              <Text style={styles.title}>
                {item.title || `Sentence Level ${item.level_number}`}
              </Text>
              <Text style={styles.subtitle}>
                {item.description || "Rearrange words into a correct sentence."}
              </Text>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No sentence levels found.</Text>
            </View>
          }
        />
      </View>
    </GameLayout>
  );
};

export default SentenceFunIndex;

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
