import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import GameLayout from "@/components/GameLayout";

type FillBlankLevel = {
  fullParagraph: string;
  blankParagraph: string;
  voiceReadingLink: string;
  choices: string[];
};

type FillBlankContent = {
  contents: {
    "fill in the blank": {
      levels: Record<string, FillBlankLevel>;
    };
  };
};

export const FILL_IN_THE_BLANK_CONTENT: FillBlankContent = {
  contents: {
    "fill in the blank": {
      levels: {
        level_1: {
          fullParagraph:
            "The little cat sat on the warm mat while the sun was shining brightly.",
          blankParagraph:
            "The little __1__ sat on the warm __2__ while the __3__ was shining __4__.",
          voiceReadingLink:
            "https://cdn.pixabay.com/download/audio/2022/08/04/audio_6f9f8f5f7a.mp3?filename=happy-kids-112698.mp3",
          choices: ["cat", "mat", "sun", "brightly"],
        },
        level_2: {
          fullParagraph:
            "We planted seeds in the school garden and watered them every morning.",
          blankParagraph:
            "We planted __1__ in the school __2__ and watered them every __3__.",
          voiceReadingLink:
            "https://cdn.pixabay.com/download/audio/2023/03/27/audio_0e8e11a177.mp3?filename=light-tune-144935.mp3",
          choices: ["seeds", "garden", "morning"],
        },
      },
    },
  },
};

type LevelCard = {
  id: string;
  blankCount: number;
  choiceCount: number;
};

const extractBlanks = (text: string) => text.match(/__\d+__/g) ?? [];

const ListenAndFillIndex = () => {
  const levels = useMemo<LevelCard[]>(() => {
    return Object.entries(
      FILL_IN_THE_BLANK_CONTENT.contents["fill in the blank"].levels,
    ).map(([id, item]) => ({
      id,
      blankCount: extractBlanks(item.blankParagraph).length,
      choiceCount: item.choices.length,
    }));
  }, []);

  return (
    <GameLayout title="Fill in the Blank">
      <View style={styles.container}>
        <LinearGradient colors={["#3A4CA8", "#5A67D8"]} style={styles.hero}>
          <Text style={styles.heroTitle}>Listen, Drag, Complete</Text>
          <Text style={styles.heroSubtitle}>
            Listen to the full paragraph, then place each word into the correct
            blank.
          </Text>
        </LinearGradient>

        <FlatList
          data={levels}
          keyExtractor={(item) => item.id}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={styles.card}
              activeOpacity={0.88}
              onPress={() =>
                router.push({
                  pathname: "/(root)/listenandfill/[id]",
                  params: { id: item.id },
                })
              }
            >
              <View style={styles.iconCircle}>
                <MaterialCommunityIcons
                  name="format-text-variant"
                  size={24}
                  color="#8EC3FF"
                />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>Level {index + 1}</Text>
                <Text style={styles.cardSub}>
                  {item.blankCount} blanks • {item.choiceCount} words
                </Text>
              </View>
              <MaterialCommunityIcons
                name="chevron-right"
                size={24}
                color="#C2C8F0"
              />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>No levels available.</Text>
          }
        />
      </View>
    </GameLayout>
  );
};

export default ListenAndFillIndex;

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  heroTitle: {
    color: "#fff",
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    marginBottom: 4,
  },
  heroSubtitle: {
    color: "#E2E8FF",
    fontFamily: "Poppins-Regular",
    fontSize: 13,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#2A2E58",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#20264A",
    alignItems: "center",
    justifyContent: "center",
  },
  cardBody: { flex: 1 },
  cardTitle: {
    color: "#fff",
    fontFamily: "Poppins-SemiBold",
    fontSize: 15,
    marginBottom: 2,
  },
  cardSub: {
    color: "#C7CCEA",
    fontFamily: "Poppins-Regular",
    fontSize: 12,
  },
  empty: {
    color: "#fff",
    textAlign: "center",
    marginTop: 20,
    fontFamily: "Poppins-Medium",
  },
});
